from server import PromptServer
from aiohttp import web
import os
import folder_paths
import time
from datetime import datetime
import json
import math
import mimetypes
import hashlib
from pathlib import Path

from .folder_monitor import FileSystemMonitor, scan_directory_initial
from .folder_scanner import _scan_for_images, get_thumbnail_dir, SUPPORTED_EXTENSIONS

# Add ComfyUI root to sys.path HERE
import sys
comfy_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(comfy_path)

# Initialize monitor to None - monitoring starts on request
monitor = None 

# Cache for API responses
_gallery_cache = {}
_cache_expiry_time = 5  # seconds

def sanitize_json_data(data):
    """Recursively sanitizes data to be JSON serializable."""
    if isinstance(data, dict):
        return {k: sanitize_json_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_json_data(item) for item in data]
    elif isinstance(data, float):
        if math.isnan(data) or math.isinf(data):
            return None
        return data
    elif isinstance(data, (int, str, bool, type(None))):
        return data
    else:
        return str(data)


@PromptServer.instance.routes.get("/Gallery/images")
async def get_gallery_images(request):
    """Endpoint to get gallery images, accepts relative_path with caching."""
    global _gallery_cache
    
    relative_path = request.rel_url.query.get("relative_path", "./")
    full_monitor_path = os.path.normpath(os.path.join(folder_paths.get_output_directory(), "..", "output", relative_path))
    
    # Check for cached response
    cache_key = f"gallery_images_{relative_path}"
    current_time = time.time()
    
    if cache_key in _gallery_cache:
        timestamp, data = _gallery_cache[cache_key]
        if current_time - timestamp < _cache_expiry_time:
            # Cache is still valid
            return web.Response(text=data, content_type="application/json")

    try:
        # Check if path exists
        if not os.path.isdir(full_monitor_path):
            return web.Response(status=404, text=json.dumps({"error": "Directory not found"}), content_type="application/json")
            
        # Check if path is empty
        if not any(os.scandir(full_monitor_path)):
            empty_response = json.dumps({"folders": {}})
            _gallery_cache[cache_key] = (current_time, empty_response)
            return web.Response(text=empty_response, content_type="application/json")
            
        # Perform full scan with metadata
        folders_with_metadata, _ = _scan_for_images(
            full_monitor_path, "output", True
        )
        sanitized_folders = sanitize_json_data(folders_with_metadata)
        json_string = json.dumps({"folders": sanitized_folders})
        
        # Cache the response
        _gallery_cache[cache_key] = (current_time, json_string)
        
        return web.Response(text=json_string, content_type="application/json")
    except Exception as e:
        print(f"Error in /Gallery/images: {e}")
        import traceback
        traceback.print_exc()
        return web.Response(status=500, text=json.dumps({"error": str(e)}), content_type="application/json")


@PromptServer.instance.routes.get("/thumbnails/{thumbnail_name}")
async def get_thumbnail(request):
    """Serve generated thumbnails."""
    thumbnail_name = request.match_info.get('thumbnail_name', '')
    thumbnail_dir = get_thumbnail_dir()
    thumbnail_path = os.path.join(thumbnail_dir, thumbnail_name)
    
    if os.path.exists(thumbnail_path) and os.path.isfile(thumbnail_path):
        # Determine content type from file extension
        content_type, _ = mimetypes.guess_type(thumbnail_path)
        if not content_type:
            content_type = 'application/octet-stream'
            
        # Create FileResponse with correct content type
        response = web.FileResponse(thumbnail_path)
        response.content_type = content_type
        return response
    else:
        return web.Response(status=404, text=json.dumps({"error": "Thumbnail not found"}), content_type="application/json")


@PromptServer.instance.routes.post("/Gallery/monitor/start")
async def start_gallery_monitor(request):
    """Endpoint to start gallery monitoring, accepts relative_path."""
    global monitor
    if monitor and monitor.thread and monitor.thread.is_alive():
        print("FileSystemMonitor: Monitor already running, stopping previous monitor.")
        monitor.stop_monitoring()

    try:
        data = await request.json()
        relative_path = data.get("relative_path", "./")
        full_monitor_path = os.path.normpath(os.path.join(folder_paths.get_output_directory(), "..", "output", relative_path))

        if not os.path.isdir(full_monitor_path):
            return web.Response(status=400, text=f"Invalid relative_path: {relative_path}, path not found")

        monitor = FileSystemMonitor(full_monitor_path)
        monitor.start_monitoring()
        return web.Response(text="Gallery monitor started", content_type="text/plain")

    except Exception as e:
        print(f"Error starting gallery monitor: {e}")
        return web.Response(status=500, text=str(e))


@PromptServer.instance.routes.post("/Gallery/monitor/stop")
async def stop_gallery_monitor(request):
    """Endpoint to stop gallery monitoring."""
    global monitor
    if monitor and monitor.thread and monitor.thread.is_alive():
        monitor.stop_monitoring()
        monitor = None
        return web.Response(text="Gallery monitor stopped", content_type="text/plain")
    else:
        return web.Response(text="Gallery monitor is not running.", status=200, content_type="text/plain")


@PromptServer.instance.routes.post("/Gallery/cache/clear")
async def clear_gallery_cache(request):
    """Endpoint to clear the gallery cache."""
    global _gallery_cache
    _gallery_cache.clear()
    
    # Also clear the metadata cache from folder_scanner
    from .folder_scanner import _metadata_cache
    _metadata_cache.clear()
    
    return web.Response(text="Gallery cache cleared", content_type="text/plain")


@PromptServer.instance.routes.delete("/Gallery/files")
async def delete_gallery_file(request):
    """Endpoint to delete a file or folder."""
    try:
        data = await request.json()
        file_path = data.get("file_path", "")
        is_folder = data.get("is_folder", False)
        
        # Validate path to ensure it's within output directory
        base_output_path = os.path.join(folder_paths.get_output_directory(), "..", "output")
        full_path = os.path.normpath(os.path.join(base_output_path, file_path))
        
        # Security check to ensure path is within output directory
        if not os.path.abspath(full_path).startswith(os.path.abspath(base_output_path)):
            return web.Response(status=403, text=json.dumps({"error": "Access denied: Path is outside gallery directory"}), 
                              content_type="application/json")
        
        if not os.path.exists(full_path):
            return web.Response(status=404, text=json.dumps({"error": "File or folder not found"}), 
                              content_type="application/json")
        
        if is_folder:
            import shutil
            shutil.rmtree(full_path)
        else:
            os.remove(full_path)
            
            # Also remove thumbnail if it exists
            filename = os.path.basename(file_path)
            path_hash = hashlib.md5(full_path.encode()).hexdigest()
            file_ext = os.path.splitext(filename)[1].lower()
            thumbnail_dir = get_thumbnail_dir()
            thumbnail_path = os.path.join(thumbnail_dir, f"thumb_{path_hash}{file_ext}")
            if os.path.exists(thumbnail_path):
                os.remove(thumbnail_path)
        
        # Clear cache to reflect changes
        global _gallery_cache
        _gallery_cache.clear()
        
        return web.Response(text=json.dumps({"success": True}), content_type="application/json")
    except Exception as e:
        print(f"Error in /Gallery/files DELETE: {e}")
        import traceback
        traceback.print_exc()
        return web.Response(status=500, text=json.dumps({"error": str(e)}), content_type="application/json")


@PromptServer.instance.routes.post("/Gallery/move")
async def move_gallery_file(request):
    """Endpoint to move a file or folder."""
    try:
        data = await request.json()
        source_path = data.get("source_path", "")
        destination_path = data.get("destination_path", "")
        is_folder = data.get("is_folder", False)
        
        # Validate paths to ensure they're within output directory
        base_output_path = os.path.join(folder_paths.get_output_directory(), "..", "output")
        full_source_path = os.path.normpath(os.path.join(base_output_path, source_path))
        full_destination_path = os.path.normpath(os.path.join(base_output_path, destination_path))
        
        # Security checks
        if not os.path.abspath(full_source_path).startswith(os.path.abspath(base_output_path)) or \
           not os.path.abspath(full_destination_path).startswith(os.path.abspath(base_output_path)):
            return web.Response(status=403, text=json.dumps({"error": "Access denied: Path is outside gallery directory"}), 
                              content_type="application/json")
        
        if not os.path.exists(full_source_path):
            return web.Response(status=404, text=json.dumps({"error": "Source file or folder not found"}), 
                              content_type="application/json")
        
        # Create destination directory if it doesn't exist
        os.makedirs(os.path.dirname(full_destination_path), exist_ok=True)
        
        # Move the file or folder
        import shutil
        shutil.move(full_source_path, full_destination_path)
        
        # Clear cache to reflect changes
        global _gallery_cache
        _gallery_cache.clear()
        
        return web.Response(text=json.dumps({"success": True}), content_type="application/json")
    except Exception as e:
        print(f"Error in /Gallery/move: {e}")
        import traceback
        traceback.print_exc()
        return web.Response(status=500, text=json.dumps({"error": str(e)}), content_type="application/json")


@PromptServer.instance.routes.post("/Gallery/folders")
async def create_gallery_folder(request):
    """Endpoint to create a new folder."""
    try:
        data = await request.json()
        folder_path = data.get("folder_path", "")
        
        # Validate path to ensure it's within output directory
        base_output_path = os.path.join(folder_paths.get_output_directory(), "..", "output")
        full_folder_path = os.path.normpath(os.path.join(base_output_path, folder_path))
        
        # Security check
        if not os.path.abspath(full_folder_path).startswith(os.path.abspath(base_output_path)):
            return web.Response(status=403, text=json.dumps({"error": "Access denied: Path is outside gallery directory"}), 
                              content_type="application/json")
        
        # Create the folder
        os.makedirs(full_folder_path, exist_ok=True)
        
        # Clear cache to reflect changes
        global _gallery_cache
        _gallery_cache.clear()
        
        return web.Response(text=json.dumps({"success": True}), content_type="application/json")
    except Exception as e:
        print(f"Error in /Gallery/folders: {e}")
        import traceback
        traceback.print_exc()
        return web.Response(status=500, text=json.dumps({"error": str(e)}), content_type="application/json")


@PromptServer.instance.routes.patch("/Gallery/updateImages")
async def newSettings(request):
    # This route is no longer used
    return web.Response(status=200)