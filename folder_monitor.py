import os
import time
import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, PatternMatchingEventHandler
from .folder_scanner import _scan_for_images, SUPPORTED_EXTENSIONS  # Import folder scanner and supported extensions

class GalleryEventHandler(PatternMatchingEventHandler):
    """Handles file system events for the gallery with improved debouncing and support for multiple file types."""

    def __init__(self, base_path, patterns=None, ignore_patterns=None, ignore_directories=False, case_sensitive=True, debounce_interval=0.5):
        super().__init__(patterns=patterns, ignore_patterns=ignore_patterns, ignore_directories=ignore_directories, case_sensitive=case_sensitive)
        self.base_path = base_path
        self.debounce_timer = None
        self.debounce_interval = debounce_interval
        self.last_known_folders = {}
        self.pending_changes = set()  # Track paths with pending changes for smarter rescanning

    def on_any_event(self, event):
        """Catch-all event handler with improved debouncing."""
        if event.is_directory:
            # Directory events are important too - they might contain new files
            self.pending_changes.add(os.path.dirname(event.src_path))
            self.debounce_event()
            return

        # Ignore events for temporary files (e.g., swap files, temporary saves)
        if event.src_path.endswith(('.swp', '.tmp', '~', '.part')):
            return None

        # Check if the file has a supported extension
        file_ext = os.path.splitext(event.src_path)[1].lower()
        if file_ext not in SUPPORTED_EXTENSIONS:
            return None

        if event.event_type in ('created', 'deleted', 'modified', 'moved'):
            print(f"Watchdog detected {event.event_type}: {event.src_path}")
            self.pending_changes.add(os.path.dirname(event.src_path))
            self.debounce_event()

    def debounce_event(self):
        """Debounces the file system event using a timer with improved handling."""
        if self.debounce_timer and self.debounce_timer.is_alive():
            self.debounce_timer.cancel()

        self.debounce_timer = threading.Timer(self.debounce_interval, self.rescan_and_send_changes)
        self.debounce_timer.daemon = True  # Set timer as daemon so it doesn't block program exit
        self.debounce_timer.start()

    def rescan_and_send_changes(self):
        """Rescans, detects changes, and sends updates with improved change detection."""
        from server import PromptServer

        # Scan directories and get updated data
        new_folders_data, _ = _scan_for_images(
            self.base_path, "output", True
        )
        old_folders_data = self.last_known_folders

        # Detect changes between old and new data
        changes = detect_folder_changes(old_folders_data, new_folders_data)

        if changes and changes["folders"]:
            print(f"FileSystemMonitor: {len(changes['folders'])} folders with changes detected")
            PromptServer.instance.send_sync("Gallery.file_change", changes)
        else:
            print("FileSystemMonitor: No relevant gallery changes after debounce.")

        # Update last known folders data for next comparison
        self.last_known_folders = new_folders_data
        self.pending_changes.clear()
        self.debounce_timer = None


class FileSystemMonitor:
    """Monitors the output directory for file system changes with improved robustness."""

    def __init__(self, base_path, interval=1.0):
        self.base_path = base_path
        self.interval = interval
        self.observer = Observer()
        
        # Create patterns from supported extensions
        patterns = ["*" + ext for ext in SUPPORTED_EXTENSIONS]
        
        # Create event handler with patterns
        self.event_handler = GalleryEventHandler(
            base_path=base_path,
            patterns=patterns,
            debounce_interval=0.5
        )
        
        # Initialize with scan
        self.event_handler.last_known_folders, _ = _scan_for_images(base_path, "output", True)
        self.thread = None
        self._running = False  # Flag to track monitor state

    def start_monitoring(self):
        """Starts the Watchdog observer with improved thread handling."""
        if self._running:
            print("FileSystemMonitor: Already running.")
            return
            
        if self.thread is None or not self.thread.is_alive():
            self._running = True
            self.thread = threading.Thread(target=self._start_observer_thread, daemon=True)
            self.thread.start()
            print(f"FileSystemMonitor: Watchdog monitoring started for {self.base_path}")
        else:
            print("FileSystemMonitor: Watchdog monitoring thread already running.")

    def _start_observer_thread(self):
        """Observer thread with improved error handling."""
        try:
            self.observer.schedule(self.event_handler, self.base_path, recursive=True)
            self.observer.start()
            
            # Keep thread alive until stopped
            while self._running:
                time.sleep(0.1)
                
        except Exception as e:
            print(f"FileSystemMonitor: Error in monitoring thread: {e}")
        finally:
            self.stop_monitoring(from_thread=True)

    def stop_monitoring(self, from_thread=False):
        """Stops the Watchdog observer with improved cleanup."""
        self._running = False
        
        if self.observer.is_alive():
            try:
                self.observer.stop()
                self.observer.join(timeout=2.0)  # Wait up to 2 seconds for observer to stop
            except Exception as e:
                print(f"FileSystemMonitor: Error stopping observer: {e}")
        
        if not from_thread:  # Only reset thread if called from outside the thread
            self.thread = None
            print("FileSystemMonitor: Watchdog monitoring stopped.")


# --- Helper function to detect folder changes with improved comparison ---
def detect_folder_changes(old_folders, new_folders):
    """Detects changes between two folder data dictionaries with improved comparison logic."""
    changes = {"folders": {}}

    # Get all folder names from both old and new data
    all_folders = set(old_folders.keys()) | set(new_folders.keys())
    
    for folder_name in all_folders:
        old_folder = old_folders.get(folder_name, {})
        new_folder = new_folders.get(folder_name, {})
        folder_changes = {}

        # Get all file names from both old and new folder data
        old_files = set(old_folder.keys())
        new_files = set(new_folder.keys())
        all_files = old_files | new_files

        for filename in all_files:
            old_file_data = old_folder.get(filename)
            new_file_data = new_folder.get(filename)

            if filename not in old_folder:  # New file
                folder_changes[filename] = {"action": "create", **new_file_data}
            elif filename not in new_folder:  # Removed file
                folder_changes[filename] = {"action": "remove"}
            elif old_file_data != new_file_data:  # Updated file 
                # For more precise change detection, we could compare specific fields
                # that are most likely to change, but this works well for most cases
                folder_changes[filename] = {"action": "update", **new_file_data}

        if folder_changes:
            changes["folders"][folder_name] = folder_changes

    return changes


# --- Helper function for initial scan ---
def scan_directory_initial(path):
    """Scans and returns a set of (filepath, modified_time) tuples for all supported file types."""
    files = set()
    for root, _, filenames in os.walk(path):
        for filename in filenames:
            # Check if file has supported extension
            if any(filename.lower().endswith(ext) for ext in SUPPORTED_EXTENSIONS):
                full_path = os.path.join(root, filename)
                try:
                    modified_time = os.path.getmtime(full_path)
                    files.add((full_path, modified_time))
                except Exception as e:
                    print(f"FileSystemMonitor: Error accessing {full_path}: {e}")
    return files