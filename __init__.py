# __init__.py

# Import and expose the node
from .server import *

# Add ComfyUI root to sys.path HERE
import sys
import os
comfy_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(comfy_path)

# Use the root directory for JavaScript files to ensure compatibility with how ComfyUI loads extensions
WEB_DIRECTORY = os.path.dirname(os.path.abspath(__file__))

__all__ = ['WEB_DIRECTORY'] # Removed NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS