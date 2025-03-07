import os
import re
import time
from datetime import datetime
import mimetypes
from pathlib import Path
import concurrent.futures
import hashlib
from .metadata_extractor import buildMetadata  # Import metadata extractor
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("PIL not available, thumbnail generation disabled")

# Initialize mime types
mimetypes.init()

# Define supported file extensions
IMAGE_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff', '.tif')
VIDEO_EXTENSIONS = ('.mp4', '.webm', '.mov', '.avi', '.mkv')
ANIMATION_EXTENSIONS = ('.gif', '.apng')
SUPPORTED_EXTENSIONS = IMAGE_EXTENSIONS + VIDEO_EXTENSIONS + ANIMATION_EXTENSIONS

# Global cache for file metadata - format: {filepath: (timestamp, metadata, access_time)}
_metadata_cache = {}
# Cache size management
MAX_CACHE_ENTRIES = 1000
CACHE_CLEANUP_THRESHOLD = 1200  # When to perform cleanup

# Path for thumbnails
def get_thumbnail_dir():
    """Get or create the thumbnail directory."""
    # Create thumbnails in the same directory as the output, but in a thumbnails subfolder
    base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "thumbnails")
    os.makedirs(base_dir, exist_ok=True)
    return base_dir

def get_file_type(file_path):
    """Determine file type based on extension."""
    ext = Path(file_path).suffix.lower()
    if ext in IMAGE_EXTENSIONS:
        return "image"
    elif ext in VIDEO_EXTENSIONS:
        return "video"
    elif ext in ANIMATION_EXTENSIONS:
        return "animation"
    return "unknown"

def create_thumbnail(image_path, max_size=256):
    """Generate thumbnail for an image and return its path"""
    if not PIL_AVAILABLE:
        return None
        
    try:
        # Create a hash of the image path for unique thumbnail names
        path_hash = hashlib.md5(image_path.encode()).hexdigest()
        file_ext = os.path.splitext(image_path)[1].lower()
        thumbnail_dir = get_thumbnail_dir()
        thumbnail_path = os.path.join(thumbnail_dir, f"thumb_{path_hash}{file_ext}")
        
        # Check if thumbnail exists and is newer than source
        if os.path.exists(thumbnail_path):
            if os.path.getmtime(thumbnail_path) >= os.path.getmtime(image_path):
                return f"/thumbnails/thumb_{path_hash}{file_ext}"  # Return relative URL
        
        # Create thumbnail
        with Image.open(image_path) as img:
            img.thumbnail((max_size, max_size))
            # Preserve transparency if present
            if file_ext == '.png' and 'transparency' in img.info:
                img.save(thumbnail_path, format='PNG', optimize=True)
            else:
                img.save(thumbnail_path, optimize=True, quality=85)  # Balanced quality
                
        return f"/thumbnails/thumb_{path_hash}{file_ext}"  # Return relative URL
    except Exception as e:
        print(f"Error creating thumbnail for {image_path}: {e}")
        return None

def process_file(full_path, entry, full_base_path):
    """Process a single file and return its metadata, with caching."""
    global _metadata_cache
    
    try:
        # Check if we need to clean up the cache
        if len(_metadata_cache) > CACHE_CLEANUP_THRESHOLD:
            # Remove oldest entries based on access time
            sorted_cache = sorted(_metadata_cache.items(), key=lambda x: x[1][2])  # Sort by access time
            _metadata_cache = dict(sorted_cache[-MAX_CACHE_ENTRIES:])  # Keep only newest entries
        
        # Get file modification time
        timestamp = os.path.getmtime(full_path)
        current_time = time.time()
        
        # Check if file is in cache and up to date
        if full_path in _metadata_cache:
            cached_timestamp, metadata, _ = _metadata_cache[full_path]
            if cached_timestamp == timestamp:
                # Update access time and return cached data
                _metadata_cache[full_path] = (timestamp, metadata, current_time)
                return metadata
        
        # Process file if not in cache or outdated
        date_str = datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d %H:%M:%S")
        dir_path = os.path.dirname(full_path)
        rel_path = os.path.relpath(dir_path, full_base_path)
        filename = entry
        subfolder = rel_path if rel_path != "." else ""
        url_path = f"/view?filename={filename}&subfolder={subfolder}"
        url_path = url_path.replace("\\", "/")
        
        file_type = get_file_type(full_path)
        file_size = os.path.getsize(full_path)
        size_str = f"{file_size / 1024:.1f} KB" if file_size < 1024 * 1024 else f"{file_size / (1024 * 1024):.2f} MB"
        
        metadata = {}
        thumbnail_url = None
        
        # Generate thumbnail for images and animations
        if file_type in ["image", "animation"]:
            thumbnail_url = create_thumbnail(full_path)
            
            # Extract metadata for images
            if file_type == "image":
                try:
                    _, _, metadata = buildMetadata(full_path)
                except Exception as e:
                    print(f"Gallery: Error building metadata for {full_path}: {e}")
                    metadata = {}
        
        # Create result
        result = {
            "name": entry,
            "url": url_path,
            "timestamp": timestamp,
            "date": date_str,
            "metadata": metadata,
            "type": file_type,
            "size": size_str,
            "size_bytes": file_size,
            "thumbnail_url": thumbnail_url
        }
        
        # Cache the result
        _metadata_cache[full_path] = (timestamp, result, current_time)
        
        return result
    except Exception as e:
        print(f"Gallery: Error processing file {full_path}: {e}")
        return None

def _scan_for_images(full_base_path, base_path, include_subfolders):
    """
    Scans directories for media files and their metadata with parallel processing.
    Returns a nested dictionary structure for efficient access and updates.
    """
    folders_data = {}
    current_files = set()
    changed = False
    
    # Track scan start time for caching
    scan_start_time = time.time()
    
    # Efficiently gather all files first before processing
    def collect_files(dir_path, relative_path=""):
        file_entries = []
        subfolder_tasks = []
        
        try:
            entries = os.listdir(dir_path)
            
            for entry in entries:
                full_path = os.path.join(dir_path, entry)
                if os.path.isdir(full_path):
                    if include_subfolders and not entry.startswith("."):
                        next_relative_path = os.path.join(relative_path, entry)
                        subfolder_tasks.append((full_path, next_relative_path))
                elif os.path.isfile(full_path):
                    # Check if the file has a supported extension before processing
                    if any(entry.lower().endswith(ext) for ext in SUPPORTED_EXTENSIONS):
                        file_entries.append((full_path, entry, relative_path))
                        current_files.add(full_path)
            
            return file_entries, subfolder_tasks
        except Exception as e:
            print(f"Gallery: Error collecting files in {dir_path}: {e}")
            return [], []
    
    # Process all files in a directory and add to folders_data
    def process_directory(file_entries, relative_path):
        if not file_entries:
            return {}
            
        folder_content = {}
        folder_key = os.path.join(base_path, relative_path) if relative_path else base_path
        
        # Process files in parallel with executor for better performance
        with concurrent.futures.ThreadPoolExecutor(max_workers=min(10, len(file_entries))) as executor:
            # Submit all file processing tasks
            future_to_file = {
                executor.submit(process_file, full_path, entry, full_base_path): (full_path, entry)
                for full_path, entry, _ in file_entries
            }
            
            # Process results as they complete
            for future in concurrent.futures.as_completed(future_to_file):
                full_path, entry = future_to_file[future]
                try:
                    file_info = future.result()
                    if file_info:
                        folder_content[entry] = file_info
                except Exception as e:
                    print(f"Gallery: Error in processing thread for {full_path}: {e}")
        
        if folder_content:  # Only add folder if it has content
            return {folder_key: folder_content}
        return {}
    
    # Start scan from the base path
    def scan_recursive(dir_path, relative_path=""):
        nonlocal folders_data
        
        # Collect files in this directory
        file_entries, subfolder_tasks = collect_files(dir_path, relative_path)
        
        # Process this directory's files
        if file_entries:
            result = process_directory(file_entries, relative_path)
            folders_data.update(result)
        
        # Process subdirectories in parallel if there are many
        if len(subfolder_tasks) > 5:
            with concurrent.futures.ThreadPoolExecutor(max_workers=min(5, len(subfolder_tasks))) as executor:
                for _ in executor.map(lambda args: scan_recursive(*args), subfolder_tasks):
                    pass
        else:
            # Process subdirectories sequentially for fewer directories
            for subfolder_path, subfolder_rel_path in subfolder_tasks:
                scan_recursive(subfolder_path, subfolder_rel_path)
    
    # Start the recursive scan
    scan_recursive(full_base_path, "")
    
    scan_duration = time.time() - scan_start_time
    print(f"Gallery scan completed in {scan_duration:.2f}s, found {len(current_files)} files in {len(folders_data)} folders")
    
    return folders_data, changed