# __init__.py

# Import and expose the node
from .server import *

# Add ComfyUI root to sys.path HERE
import sys
import os
comfy_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(comfy_path)

WEB_DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web")

__all__ = ['WEB_DIRECTORY'] # Removed NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS
