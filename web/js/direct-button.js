// Direct Gallery Button - Standalone script

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
        
        // If still no menu found, just add to body
        if (!menuElement) {
            console.warn('No menu element found, adding button to body');
            menuElement = document.body;
        }
        
        // Check if button already exists
        if (document.getElementById('direct-gallery-btn')) {
            console.log('Gallery button already exists');
            return;
        }
        
        // Create the button
        const button = document.createElement('button');
        button.id = 'direct-gallery-btn';
        button.textContent = 'Gallery';
        button.style.backgroundColor = '#3498db';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.padding = '5px 10px';
        button.style.margin = '5px';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.fontWeight = 'bold';
        button.style.position = menuElement === document.body ? 'fixed' : 'relative';
        button.style.top = menuElement === document.body ? '10px' : 'auto';
        button.style.left = menuElement === document.body ? '10px' : 'auto';
        button.style.zIndex = '9999';
        
        // Add click event
        button.addEventListener('click', function() {
            console.log('Gallery button clicked');
            alert('Gallery button clicked. The full Gallery implementation could not be loaded. Please check the browser console for errors.');
            
            // Try to open gallery if it exists in the global scope
            try {
                if (window.gallery && typeof window.gallery.openGallery === 'function') {
                    window.gallery.openGallery();
                } else if (window.getGalleryInstance && typeof window.getGalleryInstance === 'function') {
                    const galleryInstance = window.getGalleryInstance();
                    if (galleryInstance && typeof galleryInstance.openGallery === 'function') {
                        galleryInstance.openGallery();
                    }
                }
            } catch (err) {
                console.error('Error trying to open gallery:', err);
            }
        });
        
        // Add the button to the menu
        menuElement.appendChild(button);
        console.log('Gallery button created and added to', menuElement);
    }
    
    // Function to ensure button is added when DOM is ready
    function ensureButtonExists() {
        if (!document.getElementById('direct-gallery-btn')) {
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
    setTimeout(ensureButtonExists, 5000);
    
    // Try again when DOM content is loaded
    document.addEventListener('DOMContentLoaded', ensureButtonExists);
    
    // Try again when window is fully loaded
    window.addEventListener('load', ensureButtonExists);
    
    // Keep checking every second for a while
    let attempts = 0;
    const intervalId = setInterval(function() {
        attempts++;
        ensureButtonExists();
        
        // Stop checking after 20 attempts (20 seconds)
        if (attempts >= 20) {
            clearInterval(intervalId);
        }
    }, 1000);
    
    console.log('=== DIRECT GALLERY BUTTON SCRIPT FINISHED ===');
})();