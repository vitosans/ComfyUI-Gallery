// Self-executing function to prevent global scope pollution
(function() {
    'use strict';
    
    console.log('GALLERY BUTTON SCRIPT LOADED');
    
    // Function to create our button
    function createGalleryButton() {
        // Check if button already exists to avoid duplicates
        if (document.getElementById('comfyui-gallery-button')) {
            return;
        }
        
        console.log('Creating gallery button...');
        
        // Create the button with inline styles
        const button = document.createElement('button');
        button.id = 'comfyui-gallery-button';
        button.innerHTML = 'Gallery';
        button.style.backgroundColor = '#3498db';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.padding = '8px 15px';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.fontWeight = 'bold';
        button.style.margin = '5px';
        button.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        
        // Add hover effect
        button.onmouseover = function() {
            this.style.backgroundColor = '#2980b9';
        };
        button.onmouseout = function() {
            this.style.backgroundColor = '#3498db';
        };
        
        // Add click handler
        button.onclick = function() {
            console.log('Gallery button clicked');
            // Try to find and use existing gallery implementation
            try {
                if (window.gallery && typeof window.gallery.openGallery === 'function') {
                    window.gallery.openGallery();
                } else if (window.openGallery && typeof window.openGallery === 'function') {
                    window.openGallery();
                } else {
                    // Fallback to gallery-direct.js implementation
                    const directButton = document.getElementById('gallery-direct-script-button');
                    if (directButton && directButton.onclick) {
                        directButton.onclick();
                    } else {
                        throw new Error('Gallery implementation not found');
                    }
                }
            } catch (error) {
                console.error('Error opening gallery:', error);
                alert('Unable to open gallery. See console for details.');
            }
        };
        
        // Add to menu if possible, otherwise to body
        try {
            const menuTarget = document.querySelector('.comfy-menu') || 
                               document.querySelector('.comfy-menu-btns') ||
                               document.querySelector('#comfy-menu-bar');
            
            if (menuTarget) {
                menuTarget.appendChild(button);
            } else {
                document.body.appendChild(button);
            }
        } catch (e) {
            document.body.appendChild(button);
        }
        
        console.log('Gallery button created and added to page');
    }
    
    // Function to ensure our button exists
    function ensureButtonExists() {
        if (\!document.getElementById('comfyui-gallery-button')) {
            createGalleryButton();
        }
    }
    
    // Try to add button when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOMContentLoaded event triggered');
            setTimeout(ensureButtonExists, 100);
        });
    } else {
        // DOM already loaded, add button now
        console.log('DOM already loaded');
        setTimeout(ensureButtonExists, 100);
    }
    
    // Also try when window is fully loaded
    window.addEventListener('load', function() {
        console.log('Window load event triggered');
        setTimeout(ensureButtonExists, 500);
    });
    
    // Add button after a slight delay regardless of events
    setTimeout(ensureButtonExists, 1000);
    setTimeout(ensureButtonExists, 2000);
    setTimeout(ensureButtonExists, 3000);
    
    console.log('GALLERY BUTTON SCRIPT SETUP COMPLETE');
})();
