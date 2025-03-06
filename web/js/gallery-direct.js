// This is a standalone script that gets loaded directly
console.log("Gallery: Direct script loaded");

// Create a button immediately
(function() {
    // Function to ensure our button exists on the page
    function ensureGalleryButtonExists() {
        if (document.getElementById('gallery-direct-script-button')) {
            return; // Button already exists
        }
        
        console.log("Gallery: Creating direct script button");
        
        // Create the button with inline styles
        const button = document.createElement('button');
        button.id = 'gallery-direct-script-button';
        button.textContent = 'Gallery';
        button.style.backgroundColor = '#e67e22';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.padding = '8px 15px';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.fontWeight = 'bold';
        button.style.position = 'fixed';
        button.style.left = '20px';
        button.style.top = '20px';
        button.style.zIndex = '10000';
        
        // Add click event
        button.onclick = function() {
            alert("Gallery direct script button clicked!");
        };
        
        // Add to page
        document.body.appendChild(button);
        console.log("Gallery: Direct script button added to page");
    }
    
    // Try to create button immediately
    if (document.body) {
        ensureGalleryButtonExists();
    }
    
    // Also try when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(ensureGalleryButtonExists, 100);
    });
    
    // Also try when window is fully loaded
    window.addEventListener('load', function() {
        setTimeout(ensureGalleryButtonExists, 500);
    });
    
    // Keep trying every second for a while
    let attempts = 0;
    const checkInterval = setInterval(function() {
        ensureGalleryButtonExists();
        attempts++;
        
        if (attempts >= 10) {
            clearInterval(checkInterval);
        }
    }, 1000);
})();