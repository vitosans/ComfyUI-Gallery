# __init__.py

# Import and expose the node
from .gallery_node import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS
from .server import *

# Add ComfyUI root to sys.path HERE
import sys
import os
comfy_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(comfy_path)

WEB_DIRECTORY = "./web/js"

#added a dictionary to be used to configure things that will be used in other files.
config = {
    "indent": 4
}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS', 'WEB_DIRECTORY', "config"]