import os
import folder_paths
from server import PromptServer
from datetime import datetime
from .metadata_extractor import buildMetadata  # Import metadata extractor

import sys
comfy_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(comfy_path)

class GalleryNode:
    """ComfyUI node for displaying an output gallery with metadata."""

    def __init__(self):
        print("Gallery Node initialized")

    @classmethod
    def INPUT_TYPES(cls):
        return {"required": {}}

    RETURN_TYPES = ()
    FUNCTION = "get_gallery_images"
    CATEGORY = "Gallery"
    OUTPUT_NODE = True

    def get_gallery_images(self):
        # Initial load is handled by server startup.
        return ()

    def _scan_for_images(self, full_base_path, base_path, include_subfolders):
        folders_data = {}
        current_files = set()
        changed = False

        def scan_directory(dir_path, relative_path=""):
            nonlocal changed
            try:
                entries = os.listdir(dir_path)
                file_entries = []

                for entry in entries:
                    full_path = os.path.join(dir_path, entry)
                    if os.path.isdir(full_path):
                        if include_subfolders and not entry.startswith("."):
                            next_relative_path = os.path.join(relative_path, entry)
                            scan_directory(full_path, next_relative_path)
                    elif os.path.isfile(full_path):
                        file_entries.append((full_path, entry))
                        current_files.add(full_path)

                images_in_folder = []
                for full_path, entry in file_entries:
                    if entry.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                        try:
                            timestamp = os.path.getmtime(full_path)
                            date_str = datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d %H:%M:%S")
                            rel_path = os.path.relpath(dir_path, full_base_path)
                            filename = entry
                            subfolder = rel_path if rel_path != "." else ""
                            url_path = f"/view?filename={filename}&subfolder={subfolder}"
                            url_path = url_path.replace("\\", "/")

                            # Extract metadata here
                            try:
                                _, _, metadata = buildMetadata(full_path)
                            except Exception as e:
                                print(f"Gallery Node: Error building metadata for {full_path}: {e}")
                                metadata = {} # Ensure metadata is always defined, even if empty

                            images_in_folder.append({
                                "name": entry,
                                "url": url_path,
                                "timestamp": timestamp,
                                "date": date_str,
                                "metadata": metadata  # Include metadata here
                            })
                        except Exception as e:
                            print(f"Gallery Node: Error processing image {full_path}: {e}")

                folder_key = os.path.join(base_path, relative_path) if relative_path else base_path
                # Only add folders that contain images
                if images_in_folder:
                    folders_data[folder_key] = images_in_folder

            except Exception as e:
                print(f"Gallery Node: Error scanning directory {dir_path}: {e}")

        scan_directory(full_base_path, "")
        return folders_data, changed

    @classmethod
    def IS_CHANGED(cls, *args):
        return float("NaN")

    @classmethod
    def JAVASCRIPT_IMPORTS(cls):
        """This method defines JS files to import when the node is added to the graph"""
        print("Gallery Node: Loading JAVASCRIPT_IMPORTS")
        return [
            {"path": "./web/js/gallery-button.js"},  # The standalone button script
            {"path": "./web/js/gallery_ui.js"}       # The main gallery UI 
        ]
        
    @classmethod
    def HEAD_IMPORTS(cls):
        """This method defines HTML to add to the document HEAD when the node is added to the graph"""
        print("Gallery Node: Loading HEAD_IMPORTS")
        return [
            {"script": {"content": """
                console.log('Gallery Node: Adding inline button');
                // Wait for page to load
                document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(function() {
                        if (!document.getElementById('gallery-node-button')) {
                            const button = document.createElement('button');
                            button.id = 'gallery-node-button';
                            button.textContent = 'Gallery';
                            button.style.backgroundColor = '#f39c12';
                            button.style.color = 'white';
                            button.style.border = 'none';
                            button.style.padding = '8px 15px';
                            button.style.borderRadius = '4px';
                            button.style.cursor = 'pointer';
                            button.style.position = 'fixed';
                            button.style.left = '20px';
                            button.style.bottom = '20px';
                            button.style.zIndex = '10000';
                            button.onclick = function() {
                                alert('Gallery button clicked from node!');
                            };
                            document.body.appendChild(button);
                            console.log('Gallery Node: Button added to page');
                        }
                    }, 1000);
                });
            """}}
        ]
        
    @classmethod
    def DOCUMENTATION(cls):
        """Add documentation for the gallery node"""
        return {
            "title": "Gallery Node",
            "description": "A node that provides a gallery for viewing generated images with metadata",
            "buttons": [
                {
                    "name": "Open Gallery Button",
                    "icon": "Gallery",
                    "description": "Opens the gallery to view generated images with metadata"
                }
            ],
            "return": "Nothing"
        }

# Export the node class
NODE_CLASS_MAPPINGS = {"GalleryNode": GalleryNode}
NODE_DISPLAY_NAME_MAPPINGS = {"GalleryNode": "Gallery Button"}