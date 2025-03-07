import os
import re
from datetime import datetime
import mimetypes
from pathlib import Path
import concurrent.futures
from .metadata_extractor import buildMetadata  # Import metadata extractor

# Initialize mime types
mimetypes.init()

# Define supported file extensions
IMAGE_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff', '.tif')
VIDEO_EXTENSIONS = ('.mp4', '.webm', '.mov', '.avi', '.mkv')
ANIMATION_EXTENSIONS = ('.gif', '.apng')
SUPPORTED_EXTENSIONS = IMAGE_EXTENSIONS + VIDEO_EXTENSIONS + ANIMATION_EXTENSIONS

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

def process_file(full_path, entry, full_base_path):
    """Process a single file and return its metadata."""
    try:
        timestamp = os.path.getmtime(full_path)
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
        
        # Extract metadata for images
        if file_type == "image":
            try:
                _, _, metadata = buildMetadata(full_path)
            except Exception as e:
                print(f"Gallery: Error building metadata for {full_path}: {e}")
                metadata = {}
        
        return {
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
    
    # Function to scan a specific directory for media files
    def scan_directory(dir_path, relative_path=""):
        """Recursively scans a directory for supported media files."""
        nonlocal changed
        folder_content = {}  # Dictionary to hold files for the current folder
        try:
            entries = os.listdir(dir_path)
            file_entries = []
            subfolder_tasks = []

            for entry in entries:
                full_path = os.path.join(dir_path, entry)
                if os.path.isdir(full_path):
                    if include_subfolders and not entry.startswith("."):
                        next_relative_path = os.path.join(relative_path, entry)
                        subfolder_tasks.append((full_path, next_relative_path))
                elif os.path.isfile(full_path):
                    # Check if the file has a supported extension before processing
                    if any(entry.lower().endswith(ext) for ext in SUPPORTED_EXTENSIONS):
                        file_entries.append((full_path, entry))
                        current_files.add(full_path)
            
            # Process subfolder tasks
            for subfolder_path, subfolder_rel_path in subfolder_tasks:
                scan_directory(subfolder_path, subfolder_rel_path)
            
            # Process files in parallel for better performance
            with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
                # Submit all file processing tasks
                future_to_file = {
                    executor.submit(process_file, full_path, entry, full_base_path): (full_path, entry)
                    for full_path, entry in file_entries
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

            folder_key = os.path.join(base_path, relative_path) if relative_path else base_path
            if folder_content:  # Only add folder if it has content
                folders_data[folder_key] = folder_content

        except Exception as e:
            print(f"Gallery: Error scanning directory {dir_path}: {e}")

    scan_directory(full_base_path, "")
    return folders_data, changed