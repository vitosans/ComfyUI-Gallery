# ComfyUI-Gallery Development Guide

## Setup & Commands
- Installation: `git clone https://github.com/PanicTitan/ComfyUI-Gallery.git`
- Install dependencies: `pip install -r requirements.txt`
- Run ComfyUI: Navigate to ComfyUI directory and run `python main.py`

## Code Style Guidelines
- **Python**: snake_case for variables/functions, PascalCase for classes
- **JavaScript**: camelCase for variables/functions, PascalCase for classes
- **Imports**: Standard library first, then third-party, then local modules
- **Error handling**: Use try/except with specific error types and descriptive messages
- **Documentation**: Docstrings for classes/functions, inline comments for complex logic
- **Types**: Project doesn't currently use type annotations
- **Structure**: Keep server logic in server.py, node functionality in gallery_node.py

## Project Organization
- gallery_node.py: ComfyUI node implementation
- server.py: Web server and file monitoring
- metadata_extractor.py: Image metadata parsing
- web/js/gallery_ui.js: Frontend gallery interface

This is a custom node for ComfyUI that provides a real-time gallery for viewing generated images with metadata inspection capabilities.