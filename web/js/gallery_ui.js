// Access to global app object if available
let app = typeof window.app !== 'undefined' ? window.app : null;

// Gallery module functionality via global object
let Gallery, setGalleryInstance, getGalleryInstance;

// Initialize gallery module access
function initGalleryModuleAccess() {
    console.log("Initializing gallery module access");
    
    if (window.galleryModule) {
        console.log("Using gallery module from global object");
        Gallery = window.galleryModule.Gallery;
        setGalleryInstance = window.galleryModule.setGalleryInstance;
        getGalleryInstance = window.galleryModule.getGalleryInstance;
    } else {
        console.warn("Gallery module not found on window object, creating stub");
        // Fallback to basic implementation
        Gallery = function() { 
            this.openGallery = () => alert("Gallery module not available. Check console for details.");
        };
        setGalleryInstance = () => {};
        getGalleryInstance = () => null;
    }
    
    // Try to find app if not already available
    if (!app) {
        console.log("Searching for app object");
        // Check different possible global names
        const possibleAppNames = ['app', 'LGraphCanvas', 'LiteGraph'];
        for (const name of possibleAppNames) {
            if (typeof window[name] !== 'undefined') {
                app = window[name];
                console.log(`Found possible app object as window.${name}`);
                break;
            }
        }
        
        // Create minimal stub if app still not found
        if (!app) {
            console.warn("App not found, creating minimal stub");
            app = {
                registerExtension: () => console.warn("App not available"),
                api: {
                    addEventListener: () => {},
                    fetchApi: () => Promise.reject("App not available")
                }
            };
        }
    }
}

// Initialize as soon as possible
initGalleryModuleAccess();

// Keep track of gallery instance globally
let gallery = null;

// Create a simple button that works independently
function createDirectButton() {
    console.log('Creating direct gallery button');
    
    // Find the menu - try multiple selectors
    const possibleMenus = [
        document.querySelector('.comfy-menu .comfy-menu-btns'),
        document.querySelector('.comfy-menu'),
        document.querySelector('body > div.comfy-menu > div.comfy-menu-btns'),
        document.getElementsByClassName("flex gap-2 mx-2")[0]
    ];
    
    const menu = possibleMenus.find(el => el);
    
    if (!menu) {
        console.error('Could not find any menu element');
        return;
    }
    
    console.log('Found menu element for button:', menu);
    
    // Check if button already exists to avoid duplicates
    if (document.getElementById('gallery-direct-button')) {
        console.log('Gallery button already exists');
        return;
    }
    
    // Create button with inline styles (no CSS dependency)
    const btn = document.createElement('button');
    btn.id = 'gallery-direct-button';
    btn.textContent = 'Gallery';
    btn.style.backgroundColor = '#3498db';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.padding = '5px 10px';
    btn.style.margin = '5px';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '14px';
    
    btn.onclick = function() {
        console.log('Gallery direct button clicked');

        // Create gallery if it doesn't exist
        if (!gallery) {
            try {
                gallery = new Gallery({ openButtonBox: menu, folders: {} });
                setGalleryInstance(gallery);
                console.log('Created gallery on button click');
            } catch (err) {
                console.error('Error creating gallery:', err);
                alert('Could not initialize gallery. See console for details.');
                return;
            }
        }
        
        // Open gallery
        try {
            gallery.openGallery();
        } catch (err) {
            console.error('Error opening gallery:', err);
            alert('Could not open gallery. See console for details.');
        }
    };
    
    // Add button to menu
    menu.appendChild(btn);
    console.log('Direct gallery button added successfully');
    
    return btn;
}

// Create gallery popup directly without dependencies
function createSimpleGalleryPopup() {
    if (document.getElementById('simple-gallery-popup')) {
        return document.getElementById('simple-gallery-popup');
    }
    
    // Create minimal gallery popup
    const popup = document.createElement('div');
    popup.id = 'simple-gallery-popup';
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100%';
    popup.style.height = '100%';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    popup.style.zIndex = '1000';
    popup.style.display = 'none';
    popup.style.justifyContent = 'center';
    popup.style.alignItems = 'center';
    popup.style.flexDirection = 'column';
    
    // Add content container
    const content = document.createElement('div');
    content.style.backgroundColor = '#333';
    content.style.color = '#fff';
    content.style.padding = '20px';
    content.style.borderRadius = '8px';
    content.style.width = '80%';
    content.style.height = '80%';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    
    // Add close button
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '15px';
    
    const title = document.createElement('h2');
    title.textContent = 'ComfyUI Gallery';
    title.style.margin = '0';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.backgroundColor = '#e74c3c';
    closeBtn.style.color = 'white';
    closeBtn.style.border = 'none';
    closeBtn.style.padding = '5px 10px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.borderRadius = '4px';
    
    closeBtn.onclick = function() {
        popup.style.display = 'none';
    };
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    content.appendChild(header);
    
    // Add message
    const message = document.createElement('div');
    message.style.flex = '1';
    message.style.display = 'flex';
    message.style.justifyContent = 'center';
    message.style.alignItems = 'center';
    message.style.textAlign = 'center';
    message.innerHTML = 'Loading gallery...<br><br>If the gallery doesn\'t load, please check the browser console for errors.';
    
    content.appendChild(message);
    popup.appendChild(content);
    document.body.appendChild(popup);
    
    return popup;
}

// Function to open simple gallery popup
function openSimpleGallery() {
    const popup = createSimpleGalleryPopup();
    popup.style.display = 'flex';
    
    // Try to load the real gallery
    try {
        // Find the menu
        const menu = document.querySelector('.comfy-menu') || document.getElementsByClassName("flex gap-2 mx-2")[0];
        
        if (!gallery && menu) {
            gallery = new Gallery({ openButtonBox: menu, folders: {} });
            setGalleryInstance(gallery);
        }
        
        if (gallery) {
            gallery.openGallery();
            popup.style.display = 'none';
        }
    } catch (err) {
        console.error('Error opening actual gallery:', err);
        // Keep simple popup open as fallback
    }
}

// Ensure button is added when the DOM is ready
function ensureButtonExists() {
    if (!document.getElementById('gallery-direct-button')) {
        createDirectButton();
    }
}

// Main initialization - attempt to register extension if app is available
if (app && app.registerExtension) {
    app.registerExtension({
        name: "Gallery",
        async setup() {
            console.log('Gallery extension setup start');
            
            // Create button immediately on setup
            setTimeout(createDirectButton, 0);
            
            // Add multiple attempts to ensure button appears
            setTimeout(ensureButtonExists, 500);
            setTimeout(ensureButtonExists, 1000);
            setTimeout(ensureButtonExists, 2000);
            
            console.log('Gallery extension setup complete');
        },
        
        async init() {
            console.log('Gallery extension init start');
            
            // Create button again in case setup didn't work
            createDirectButton();
            
            // Try to load gallery data in background
            try {
                console.log('Fetching gallery images');
                try {
                    const response = await app.api.fetchApi("/Gallery/images");
                    const text = await response.text();
                    
                    try {
                        const data = JSON.parse(text);
                        console.log('Got gallery data:', data);
                        
                        // Find the menu
                        const menu = document.querySelector('.comfy-menu') || 
                                document.getElementsByClassName("flex gap-2 mx-2")[0];
                        
                        if (menu) {
                            // Create or update gallery instance
                            if (gallery) {
                                gallery.updateImages(data.folders || {});
                            } else {
                                gallery = new Gallery({ openButtonBox: menu, folders: data.folders || {} });
                                setGalleryInstance(gallery);
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing gallery data:', e);
                    }
                } catch (error) {
                    console.error('Error fetching gallery data:', error);
                }
            } catch (error) {
                console.error('Error in gallery data loading:', error);
            }
            
            console.log('Gallery extension init complete');
        },
        
        async nodeCreated(node) {
            try {
                if (node.comfyClass === "GalleryNode") {
                    console.log('Gallery node created');
                    
                    // Add button to node
                    node.addWidget("button", "Open Gallery", null, () => {
                        if (gallery) {
                            gallery.openGallery();
                        } else {
                            openSimpleGallery();
                        }
                    });
                    
                    console.log('Gallery node setup completed');
                }
            } catch (error) {
                console.error('Error in nodeCreated handler:', error);
            }
        }
    });
    
    // Set up event listeners if app.api exists
    if (app.api) {
        // Event listeners
        app.api.addEventListener("Gallery.file_change", (event) => {
            console.log("file_change event received");
            try {
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
            console.log("update event received");
            try {
                const galleryInstance = gallery || getGalleryInstance();
                if (galleryInstance) {
                    galleryInstance.updateImages(event.detail.folders);
                }
            } catch (error) {
                console.error('Error in update event handler:', error);
            }
        });
        
        app.api.addEventListener("Gallery.clear", (event) => {
            console.log("clear event received");
            try {
                const galleryInstance = gallery || getGalleryInstance();
                if (galleryInstance) {
                    galleryInstance.clearGallery();
                }
            } catch (error) {
                console.error('Error in clear event handler:', error);
            }
        });
    }
} else {
    console.warn("App not available for extension registration, creating button directly");
}

// Always create button directly as a fallback
console.log('Gallery UI script loaded - direct initialization');
setTimeout(createDirectButton, 0);