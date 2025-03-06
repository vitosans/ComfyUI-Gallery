from server import PromptServer
from aiohttp import web
from .gallery_node import GalleryNode
import os
import folder_paths
import json
import math

# Add ComfyUI root to sys.path HERE
import sys
comfy_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(comfy_path)


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
    """Scans for images on demand when the gallery is opened or refreshed."""
    try:
        gallery_node = GalleryNode()
        output_path = os.path.join(folder_paths.get_output_directory(), "..", "output")
        folders_with_metadata, _ = gallery_node._scan_for_images(output_path, "output", True)

        # Empty folders are filtered out in gallery_node._scan_for_images
        sanitized_folders = sanitize_json_data(folders_with_metadata)
        json_string = json.dumps({"folders": sanitized_folders})
        return web.Response(text=json_string, content_type="application/json")
    except Exception as e:
        print(f"Error in /Gallery/images: {e}")
        import traceback
        traceback.print_exc()
        return web.Response(status=500, text=str(e))


@PromptServer.instance.routes.post("/Gallery/refresh")
async def refresh_gallery(request):
    """Endpoint to manually refresh the gallery."""
    try:
        # This will trigger the frontend to reload images
        PromptServer.instance.send_sync("Gallery.file_change", {})
        return web.Response(status=200)
    except Exception as e:
        print(f"Error in /Gallery/refresh: {e}")
        return web.Response(status=500, text=str(e))


@PromptServer.instance.routes.patch("/Gallery/updateImages")
async def newSettings(request):
    # This route is no longer used
    return web.Response(status=200)