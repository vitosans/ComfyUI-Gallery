# __init__.py
print("Loading ComfyUI-Gallery Extension...")

# Import and expose the node
from .gallery_node import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS
try:
    from server import PromptServer
    from aiohttp import web
except ImportError:
    print("Gallery: Warning - server imports failed")

# Add ComfyUI root to sys.path
import sys
import os
comfy_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(comfy_path)

# Define web directory and required files
WEB_DIRECTORY = os.path.join(os.path.dirname(os.path.realpath(__file__)), "web")
print(f"Gallery: Web directory set to {WEB_DIRECTORY}")

# List of JavaScript files to include
WEB_INCLUDE_JS = [
    "extensions/ComfyUI-Gallery/web/js/gallery-direct.js",  # Direct script
    "extensions/ComfyUI-Gallery/web/js/gallery-button.js"   # Standalone button
]

# List of HTML files to include
extra_html_page_scripts = [
    # A direct HTML page ComfyUI will load
    {"path": "/extensions/ComfyUI-Gallery/button", "script": f"{WEB_DIRECTORY}/gallery-button-page.html"}
]

# Method 1: Add HTML to the page head
def load_javascript_headers():
    """This function gets called by ComfyUI to load custom HTML in the page header"""
    return [
        {"innerHTML": """
            console.log("Gallery: Loading from load_javascript_headers");
            // Function to create our button
            function createGalleryButtonFromHeaders() {
                if (document.getElementById('gallery-headers-button')) return;
                
                const button = document.createElement('button');
                button.id = 'gallery-headers-button';
                button.textContent = 'Gallery';
                button.style.backgroundColor = '#1abc9c';
                button.style.color = 'white';
                button.style.border = 'none';
                button.style.padding = '8px 15px';
                button.style.borderRadius = '4px';
                button.style.cursor = 'pointer';
                button.style.position = 'fixed';
                button.style.right = '20px';
                button.style.bottom = '20px';
                button.style.zIndex = '10000';
                
                button.onclick = function() {
                    alert('Gallery Button clicked from headers!');
                };
                
                document.body.appendChild(button);
                console.log("Gallery: Button added from headers");
            }
            
            // Try to add the button when DOM is loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(createGalleryButtonFromHeaders, 500);
                });
            } else {
                setTimeout(createGalleryButtonFromHeaders, 500);
            }
            
            // Also try when the window is fully loaded
            window.addEventListener('load', function() {
                setTimeout(createGalleryButtonFromHeaders, 1000);
            });
            
            // Try a few more times with delays
            setTimeout(createGalleryButtonFromHeaders, 2000);
            setTimeout(createGalleryButtonFromHeaders, 5000);
        """}
    ]

# Method 2: Add a direct route that loads our content
try:
    if 'PromptServer' in globals() and hasattr(PromptServer, 'instance'):
        @PromptServer.instance.routes.get('/extensions/ComfyUI-Gallery/script')
        async def gallery_script_route(request):
            print("Gallery: Script route accessed")
            return web.Response(text="""
                console.log("Gallery: Creating button from script route");
                const button = document.createElement('button');
                button.id = 'gallery-route-button';
                button.textContent = 'Gallery';
                button.style.backgroundColor = '#8e44ad';
                button.style.color = 'white';
                button.style.border = 'none';
                button.style.padding = '8px 15px';
                button.style.borderRadius = '4px';
                button.style.cursor = 'pointer';
                button.style.position = 'fixed';
                button.style.right = '70px';
                button.style.top = '20px';
                button.style.zIndex = '10000';
                
                button.onclick = function() {
                    alert('Gallery Button clicked from script route!');
                };
                
                document.body.appendChild(button);
                console.log("Gallery: Button added from script route");
            """, content_type='application/javascript')
except Exception as e:
    print(f"Gallery: Error setting up script route: {e}")

# Export everything ComfyUI needs
__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS', 'WEB_DIRECTORY', 
           'WEB_INCLUDE_JS', 'extra_html_page_scripts', 'load_javascript_headers']

print("ComfyUI-Gallery Extension loaded successfully")