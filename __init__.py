# __init__.py

# Import and expose the node
from .gallery_node import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS
from .server import *

# Add ComfyUI root to sys.path HERE
import sys
import os
comfy_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(comfy_path)

# Define web directories for JavaScript and HTML
WEB_DIRECTORY = "./web"
JS_LIBS = [
    {"path": "./web/js/gallery_ui.js"},
    {"path": "./web/js/direct-button.js"}
]

# Added a dictionary to be used to configure things that will be used in other files.
config = {
    "indent": 4
}

# Add HTML loader for direct script loading
def load_javascript_headers():
    return [
        {"innerHTML": """
            console.log("Loading Gallery Button directly from __init__.py");
            try {
                // Try to create a Gallery button directly in the page
                const btn = document.createElement('button');
                btn.textContent = 'Gallery';
                btn.style.backgroundColor = '#3498db';
                btn.style.color = 'white';
                btn.style.border = 'none';
                btn.style.padding = '5px 10px';
                btn.style.margin = '5px';
                btn.style.borderRadius = '4px';
                btn.style.cursor = 'pointer';
                btn.style.position = 'fixed';
                btn.style.top = '10px';
                btn.style.right = '10px';
                btn.style.zIndex = '9999';
                
                document.body.appendChild(btn);
                console.log("Gallery button added to body directly");
            } catch (e) {
                console.error("Error adding Gallery button:", e);
            }
        """}
    ]

# Update exports
__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS', 'WEB_DIRECTORY', 'JS_LIBS', 'config', 'load_javascript_headers']