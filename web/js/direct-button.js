// Direct Gallery Button - Standalone script

// Load standalone gallery script
(function loadStandaloneGallery() {
    // Check if script already loaded
    if (document.getElementById('standalone-gallery-script')) {
        return;
    }
    
    console.log('Loading standalone gallery implementation');
    
    // Create script element
    const script = document.createElement('script');
    script.id = 'standalone-gallery-script';
    script.src = './web/js/standalone-gallery.js';
    script.onerror = function() {
        console.warn('Failed to load standalone gallery from default path, trying alternatives');
        
        // Try alternate paths
        const altPaths = [
            '/extensions/ComfyUI-Gallery/web/js/standalone-gallery.js',
            '../web/js/standalone-gallery.js',
            '/web/js/standalone-gallery.js'
        ];
        
        function tryLoadScript(index) {
            if (index >= altPaths.length) {
                console.error('Failed to load standalone gallery script from any path');
                return;
            }
            
            const altScript = document.createElement('script');
            altScript.src = altPaths[index];
            altScript.onload = function() {
                console.log('Loaded standalone gallery from', altPaths[index]);
            };
            altScript.onerror = function() {
                tryLoadScript(index + 1);
            };
            document.head.appendChild(altScript);
        }
        
        tryLoadScript(0);
    };
    
    // Add to document
    document.head.appendChild(script);
})();

// Main direct button script
(function() {
    console.log('=== DIRECT GALLERY BUTTON SCRIPT STARTED ===');
    
    // Function to create the gallery button
    function createGalleryButton() {
        console.log('Attempting to create gallery button directly');
        
        // Try to find the ComfyUI menu using multiple selectors
        const menuSelectors = [
            '.comfy-menu',
            '.comfy-menu .comfy-menu-btns',
            '#app > div.comfy-menu',
            'body > div.comfy-menu',
            '.workspace-menu',
            '.litecontextmenu',
            'body > div:first-child',
            'body > div.comfy-menu > div.comfy-menu-btns',
            '#comfy-menu-bar',
            '.menu-bar'
        ];
        
        // Try all selectors
        let menuElement = null;
        for (const selector of menuSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`Found menu element using selector: ${selector}`);
                menuElement = element;
                break;
            }
        }
        
        // If no menu found, try some alternative approaches
        if (!menuElement) {
            // Try to find any div that might be a menu
            const divs = document.querySelectorAll('div');
            for (const div of divs) {
                if (div.childElementCount > 0 && div.getBoundingClientRect().height < 100) {
                    // Likely a menu bar or header
                    console.log('Found potential menu element:', div);
                    menuElement = div;
                    break;
                }
            }
        }
        
        // If still no menu found, create a container element
        if (!menuElement) {
            console.warn('No menu element found, creating floating container');
            menuElement = document.createElement('div');
            menuElement.style.position = 'fixed';
            menuElement.style.top = '10px';
            menuElement.style.right = '10px';
            menuElement.style.zIndex = '9999';
            document.body.appendChild(menuElement);
        }
        
        // Check if button already exists
        if (document.getElementById('direct-gallery-btn')) {
            console.log('Gallery button already exists');
            return;
        }
        
        // Create the button with enhanced visibility
        const button = document.createElement('button');
        button.id = 'direct-gallery-btn';
        button.textContent = 'Gallery';
        button.style.backgroundColor = '#3498db';
        button.style.color = 'white';
        button.style.border = '2px solid #2980b9';
        button.style.padding = '8px 15px';
        button.style.margin = '5px';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.fontWeight = 'bold';
        button.style.display = 'inline-block';
        button.style.opacity = '1';
        button.style.visibility = 'visible';
        button.style.zIndex = '9999';
        
        // Add hover effects
        button.onmouseover = function() {
            this.style.backgroundColor = '#2980b9';
        };
        
        button.onmouseout = function() {
            this.style.backgroundColor = '#3498db';
        };
        
        // Add click event with improved handling
        button.addEventListener('click', function() {
            console.log('Gallery button clicked');
            
            // Try to use standalone gallery first
            if (window.StandaloneGallery) {
                console.log('Using standalone gallery implementation');
                if (!window.standaloneGallery) {
                    window.standaloneGallery = new window.StandaloneGallery({
                        openButtonBox: menuElement
                    });
                }
                window.standaloneGallery.openGallery();
                return;
            }
            
            // Check for gallery in window object
            try {
                if (window.gallery && typeof window.gallery.openGallery === 'function') {
                    console.log('Opening gallery via window.gallery');
                    window.gallery.openGallery();
                    return;
                } 
                
                if (window.getGalleryInstance && typeof window.getGalleryInstance === 'function') {
                    const galleryInstance = window.getGalleryInstance();
                    if (galleryInstance && typeof galleryInstance.openGallery === 'function') {
                        console.log('Opening gallery via galleryInstance');
                        galleryInstance.openGallery();
                        return;
                    }
                }
                
                if (window.galleryModule && window.galleryModule.Gallery) {
                    console.log('Creating new gallery instance from galleryModule');
                    try {
                        // Create new gallery instance with required parameters
                        const galleryInstance = new window.galleryModule.Gallery({
                            openButtonBox: menuElement,
                            folders: {},
                            settings: {},
                            gallerySettings: { openSettingsPopup: () => {} } // Stub for required parameter
                        });
                        
                        if (window.galleryModule.setGalleryInstance) {
                            window.galleryModule.setGalleryInstance(galleryInstance);
                        }
                        
                        window.gallery = galleryInstance;
                        galleryInstance.openGallery();
                        return;
                    } catch (err) {
                        console.error('Error creating gallery from module:', err);
                    }
                }
                
                console.log('No gallery implementation found, creating fallback');
                createFallbackGallery();
            } catch (err) {
                console.error('Error trying to open gallery:', err);
                alert('Could not open gallery. See console for details.');
            }
        });
        
        // Add the button to the menu
        menuElement.appendChild(button);
        console.log('Gallery button created and added to', menuElement);
        
        // Create a floating version if button might be hidden
        setTimeout(() => {
            // Check if button is visible
            if (button.offsetParent === null) {
                console.log('Button may be hidden, creating floating button');
                const floatingButton = button.cloneNode(true);
                floatingButton.id = 'direct-gallery-floating-btn';
                floatingButton.style.position = 'fixed';
                floatingButton.style.top = '10px';
                floatingButton.style.right = '10px';
                floatingButton.style.zIndex = '100000';
                floatingButton.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
                document.body.appendChild(floatingButton);
            }
        }, 1000);
    }
    
    // Function to create a fallback gallery
    function createFallbackGallery() {
        // Check if popup already exists
        if (document.getElementById('gallery-fallback-popup')) {
            document.getElementById('gallery-fallback-popup').style.display = 'flex';
            return;
        }
        
        // Create popup container
        const popup = document.createElement('div');
        popup.id = 'gallery-fallback-popup';
        popup.style.position = 'fixed';
        popup.style.top = '0';
        popup.style.left = '0';
        popup.style.width = '100%';
        popup.style.height = '100%';
        popup.style.backgroundColor = 'rgba(0,0,0,0.8)';
        popup.style.zIndex = '100000';
        popup.style.display = 'flex';
        popup.style.justifyContent = 'center';
        popup.style.alignItems = 'center';
        
        // Create popup content
        const content = document.createElement('div');
        content.style.backgroundColor = '#222';
        content.style.color = '#fff';
        content.style.padding = '20px';
        content.style.borderRadius = '8px';
        content.style.maxWidth = '500px';
        content.style.textAlign = 'center';
        
        // Create title
        const title = document.createElement('h2');
        title.textContent = 'ComfyUI Gallery';
        
        // Create message
        const message = document.createElement('p');
        message.textContent = 'Gallery implementation not found. Check console for details.';
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.backgroundColor = '#e74c3c';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.padding = '8px 16px';
        closeButton.style.margin = '10px';
        closeButton.style.borderRadius = '4px';
        closeButton.style.cursor = 'pointer';
        
        closeButton.onclick = function() {
            popup.style.display = 'none';
        };
        
        // Assemble popup
        content.appendChild(title);
        content.appendChild(message);
        content.appendChild(closeButton);
        popup.appendChild(content);
        document.body.appendChild(popup);
    }
    
    // Function to ensure button is added when DOM is ready
    function ensureButtonExists() {
        if (!document.getElementById('direct-gallery-btn') && !document.getElementById('direct-gallery-floating-btn')) {
            createGalleryButton();
        }
    }
    
    // Try to create button immediately
    createGalleryButton();
    
    // Also try after delays to ensure DOM is ready
    setTimeout(ensureButtonExists, 100);
    setTimeout(ensureButtonExists, 500);
    setTimeout(ensureButtonExists, 1000);
    setTimeout(ensureButtonExists, 2000);
    
    // Always create a floating button after 3 seconds
    setTimeout(() => {
        if (!document.getElementById('direct-gallery-floating-btn')) {
            const floatingButton = document.createElement('button');
            floatingButton.id = 'direct-gallery-floating-btn';
            floatingButton.textContent = 'Gallery';
            floatingButton.style.position = 'fixed';
            floatingButton.style.top = '10px';
            floatingButton.style.right = '10px';
            floatingButton.style.zIndex = '100000';
            floatingButton.style.backgroundColor = '#3498db';
            floatingButton.style.color = 'white';
            floatingButton.style.border = '2px solid #2980b9';
            floatingButton.style.padding = '8px 15px';
            floatingButton.style.borderRadius = '4px';
            floatingButton.style.cursor = 'pointer';
            floatingButton.style.fontWeight = 'bold';
            floatingButton.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
            
            floatingButton.onclick = function() {
                if (window.StandaloneGallery) {
                    if (!window.standaloneGallery) {
                        window.standaloneGallery = new window.StandaloneGallery({
                            openButtonBox: document.body
                        });
                    }
                    window.standaloneGallery.openGallery();
                } else if (window.gallery && typeof window.gallery.openGallery === 'function') {
                    window.gallery.openGallery();
                } else {
                    createFallbackGallery();
                }
            };
            
            document.body.appendChild(floatingButton);
            console.log('Created fallback floating button');
        }
    }, 3000);
    
    // Try again when DOM content is loaded
    document.addEventListener('DOMContentLoaded', ensureButtonExists);
    
    // Try again when window is fully loaded
    window.addEventListener('load', ensureButtonExists);
    
    console.log('=== DIRECT GALLERY BUTTON SCRIPT FINISHED ===');
})();