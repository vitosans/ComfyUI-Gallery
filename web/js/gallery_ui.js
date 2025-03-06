import { app } from "../../scripts/app.js";
import { Gallery, setGalleryInstance, getGalleryInstance } from "./gallery/index.js";

// Now the Gallery is defined in the gallery module
// Keep track of gallery instance locally as well
let gallery = null;

// Create a standalone gallery button if the API initialization fails
function createStandaloneButton() {
    console.log('Creating standalone gallery button');
    
    // Check if gallery is already initialized
    if (gallery) {
        console.log('Gallery already initialized, no need for standalone button');
        return;
    }
    
    // Look for menu
    const menuElements = [
        document.getElementsByClassName("flex gap-2 mx-2")[0],
        document.querySelector('.comfy-menu'),
        document.querySelector('.comfy-menu .header'),
        document.querySelector('.comfy-menu > div')
    ];
    
    const menu = menuElements.find(el => el);
    
    if (!menu) {
        console.error('Could not find any suitable menu element');
        return;
    }
    
    console.log('Found menu element:', menu);
    
    // Create a simple button
    const btn = document.createElement('button');
    btn.textContent = 'Gallery';
    btn.style.backgroundColor = '#3498db';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.padding = '5px 10px';
    btn.style.margin = '5px';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';
    
    btn.onclick = () => {
        // Initialize gallery on first click
        if (!gallery) {
            gallery = new Gallery({ openButtonBox: menu, folders: {} });
            setGalleryInstance(gallery);
        }
        
        // Open gallery
        gallery.openGallery();
    };
    
    menu.appendChild(btn);
    console.log('Standalone button added to menu');
}

app.registerExtension({
    name: "Gallery",
    init() {
        console.log('Initializing Gallery extension');
        
        try {
            // Try to get menu first in case API fails
            const menuElements = [
                document.getElementsByClassName("flex gap-2 mx-2")[0],
                document.querySelector('.comfy-menu'),
                document.querySelector('.comfy-menu .header'),
                document.querySelector('.comfy-menu > div')
            ];
            
            const menu = menuElements.find(el => el);
            
            if (!menu) {
                console.warn('Could not find menu element on init');
            } else {
                console.log('Found menu element:', menu);
            }
            
            // Create a gallery instance with empty folders first
            // so that the button appears even if API fails
            if (menu) {
                gallery = new Gallery({ openButtonBox: menu, folders: {} });
                setGalleryInstance(gallery);
                console.log('Gallery instance created with empty folders');
            }
            
            // Now try to fetch actual folders
            console.log('Fetching gallery images');
            
            // Try multiple API endpoints
            const tryFetchEndpoints = (endpoints, index = 0) => {
                if (index >= endpoints.length) {
                    console.error('All API endpoints failed');
                    return;
                }
                
                const endpoint = endpoints[index];
                console.log(`Trying API endpoint: ${endpoint}`);
                
                app.api.fetchApi(endpoint)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`API request failed with status ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(text => {
                        try {
                            return JSON.parse(text);
                        } catch (e) {
                            console.error(`Error parsing JSON from ${endpoint}:`, e);
                            return { folders: {} };
                        }
                    })
                    .then(data => {
                        console.log(`Got data from ${endpoint}:`, data);
                        
                        // Update the existing gallery instance if it exists
                        if (gallery) {
                            gallery.updateImages(data.folders || {});
                            console.log('Updated existing gallery instance with folders');
                        } else {
                            // Create a new gallery instance if one doesn't exist yet
                            const menu = menuElements.find(el => el);
                            
                            if (menu) {
                                gallery = new Gallery({ openButtonBox: menu, folders: data.folders || {} });
                                setGalleryInstance(gallery);
                                console.log('Created new gallery instance with folders');
                            } else {
                                console.error('No menu element found for gallery button');
                            }
                        }
                    })
                    .catch(error => {
                        console.error(`Error with endpoint ${endpoint}:`, error);
                        // Try next endpoint
                        tryFetchEndpoints(endpoints, index + 1);
                    });
            };
            
            // Try different endpoints
            tryFetchEndpoints(["/Gallery/images", "./Gallery/images", "../Gallery/images"]);
            
        } catch (error) {
            console.error('Error in Gallery init:', error);
            // Try to create standalone button as fallback
            setTimeout(createStandaloneButton, 2000);
        }
        
        // Add a fallback to create button if none exists after 5 seconds
        setTimeout(() => {
            if (!gallery) {
                console.warn('No gallery instance after 5s, creating fallback button');
                createStandaloneButton();
            }
        }, 5000);
    },
    
    async nodeCreated(node) {
        try {
            if (node.comfyClass === "GalleryNode") {
                console.log('Gallery node created');
                
                const onRemoved = node.onRemoved;
                node.onRemoved = () => {
                    try {
                        if (onRemoved) { onRemoved.apply(node); }
                        // Use either the local instance or get it from the module
                        const galleryInstance = gallery || getGalleryInstance();
                        if (galleryInstance) {
                            galleryInstance.closeGallery();
                        }
                    } catch (error) {
                        console.error('Error in node removal handler:', error);
                    }
                };
                
                // Add button to node
                node.addWidget("button", "Open Gallery", null, () => {
                    try {
                        console.log('Gallery node button clicked');
                        // Use either the local instance or get it from the module
                        const galleryInstance = gallery || getGalleryInstance();
                        if (galleryInstance) {
                            galleryInstance.openGallery();
                        } else {
                            console.error('No gallery instance available');
                            createStandaloneButton();
                        }
                    } catch (error) {
                        console.error('Error in gallery node button handler:', error);
                    }
                });
                
                console.log('Gallery node setup completed');
            }
        } catch (error) {
            console.error('Error in nodeCreated handler:', error);
        }
    },
    
    // Add this to ensure the extension is loaded on all pages
    setup() {
        console.log('Gallery extension setup');
    },
    
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "GalleryNode") {
            console.log('Gallery node definition registered');
        }
    }
});

// Event listeners
app.api.addEventListener("Gallery.file_change", (event) => {
    console.log("file_change:", event);
    try {
        // Use either the local instance or get it from the module
        const galleryInstance = gallery || getGalleryInstance();
        if (galleryInstance) {
            app.api.fetchApi("/Gallery/images")
                .then(response => response.text())
                .then(text => JSON.parse(text))
                .then(data => galleryInstance.updateImages(data.folders || {}))
                .catch(error => {
                    console.error('Error handling file_change event:', error);
                });
        }
    } catch (error) {
        console.error('Error in file_change event handler:', error);
    }
});

app.api.addEventListener("Gallery.update", (event) => {
    console.log("update:", event);
    try {
        // Use either the local instance or get it from the module
        const galleryInstance = gallery || getGalleryInstance();
        if (galleryInstance) {
            galleryInstance.updateImages(event.detail.folders);
        }
    } catch (error) {
        console.error('Error in update event handler:', error);
    }
});

app.api.addEventListener("Gallery.clear", (event) => {
    console.log("clear:", event);
    try {
        // Use either the local instance or get it from the module
        const galleryInstance = gallery || getGalleryInstance();
        if (galleryInstance) {
            galleryInstance.clearGallery();
        }
    } catch (error) {
        console.error('Error in clear event handler:', error);
    }
});