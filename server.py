from server import PromptServer
from aiohttp import web
from .gallery_node import GalleryNode
import os
import folder_paths
import threading
import time
from datetime import datetime
import json
import math
import importlib.util

# Add ComfyUI root to sys.path HERE
import sys
comfy_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(comfy_path)

# Check if watchdog is installed, if not, use fallback polling monitor
watchdog_available = importlib.util.find_spec("watchdog") is not None

if watchdog_available:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler

    class GalleryFileHandler(FileSystemEventHandler):
        """Handles file system events for the gallery."""
        
        def __init__(self):
            self.image_extensions = ('.png', '.jpg', '.jpeg', '.webp')
            
        def on_created(self, event):
            self._handle_event(event)
            
        def on_modified(self, event):
            self._handle_event(event)
            
        def on_moved(self, event):
            self._handle_event(event)
            
        def _handle_event(self, event):
            if event.is_directory:
                return
                
            if hasattr(event, 'dest_path') and event.dest_path:
                path = event.dest_path
            else:
                path = event.src_path
                
            if path.lower().endswith(self.image_extensions):
                print(f"FileSystemMonitor: Change detected: {event}")
                PromptServer.instance.send_sync("Gallery.file_change", {})
    
    class FileSystemMonitor:
        """Monitors the output directory for changes using watchdog."""
        
        def __init__(self, base_path):
            self.base_path = base_path
            self.observer = None
            self.event_handler = GalleryFileHandler()
            
        def start_monitoring(self):
            if self.observer is None:
                self.observer = Observer()
                self.observer.schedule(self.event_handler, self.base_path, recursive=True)
                self.observer.start()
                print("FileSystemMonitor: Watchdog observer started.")
            else:
                print("FileSystemMonitor: Observer already running.")
                
        def stop_monitoring(self):
            if self.observer and self.observer.is_alive():
                self.observer.stop()
                self.observer.join()
                print("FileSystemMonitor: Observer stopped.")
else:
    # Fallback to polling if watchdog is not available
    class FileSystemMonitor(threading.Thread):
        """Monitors the output directory for changes using polling (fallback)."""

        def __init__(self, base_path, interval=1.0):
            super().__init__(daemon=True)
            self.base_path = base_path
            self.interval = interval
            self.last_known_files = set()
            self.running = True
            self.thread = None
            print("FileSystemMonitor: Using polling fallback (watchdog not available)")

        def run(self):
            print("FileSystemMonitor: Starting monitoring thread")
            while self.running:
                try:
                    current_files = self.scan_directory(self.base_path)
                    if current_files != self.last_known_files:
                        print("FileSystemMonitor: Change detected!")
                        PromptServer.instance.send_sync("Gallery.file_change", {})
                        self.last_known_files = current_files
                    time.sleep(self.interval)
                except Exception as e:
                    print(f"FileSystemMonitor: Error in monitoring thread: {e}")

        def scan_directory(self, path):
            """Scans and returns a set of (filepath, modified_time) tuples."""
            files = set()
            for root, _, filenames in os.walk(path):
                for filename in filenames:
                    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                        full_path = os.path.join(root, filename)
                        try:
                            modified_time = os.path.getmtime(full_path)
                            files.add((full_path, modified_time))
                        except Exception as e:
                            print(f"FileSystemMonitor: Error accessing {full_path}: {e}")
            return files

        def start_monitoring(self):
            if self.thread is None:
                self.thread = threading.Thread(target=self.run, daemon=True)
                self.thread.start()
                print("FileSystemMonitor: Monitoring thread started.")
            else:
                print("FileSystemMonitor: Monitoring thread already running.")

        def stop_monitoring(self):
            self.running = False
            if self.thread and self.thread.is_alive():
                self.thread.join()
            print("FileSystemMonitor: Monitoring thread stopped.")

# --- Initialize and start monitor ---
output_path = os.path.normpath(os.path.join(folder_paths.get_output_directory(), "..", "output"))
monitor = FileSystemMonitor(output_path)
monitor.start_monitoring()  # Start the monitoring thread


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
    try:
        gallery_node = GalleryNode()
        folders_with_metadata, _ = gallery_node._scan_for_images(
            os.path.join(folder_paths.get_output_directory(), "..", "output"), "output", True
        )

        # Empty folders are now filtered out in gallery_node._scan_for_images
        sanitized_folders = sanitize_json_data(folders_with_metadata)
        json_string = json.dumps({"folders": sanitized_folders})
        return web.Response(text=json_string, content_type="application/json")
    except Exception as e:
        print(f"Error in /Gallery/images: {e}")
        import traceback
        traceback.print_exc()
        return web.Response(status=500, text=str(e))

@PromptServer.instance.routes.patch("/Gallery/updateImages")
async def newSettings(request):
    # This route is no longer used
    return web.Response(status=200)