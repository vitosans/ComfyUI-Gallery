document.addEventListener('DOMContentLoaded', function() {
    console.log('Gallery keyboard shortcuts: Setting up global event listeners');
    
    // Set up global keyboard event listeners
    document.addEventListener('keydown', function(event) {
        // Find the gallery popup
        const galleryPopup = document.querySelector('.gallery-popup');
        if (\!galleryPopup || galleryPopup.style.display === 'none') return;
        
        // ESC key - close gallery
        if (event.key === 'Escape') {
            // Check if in fullscreen mode or regular gallery
            const fullscreenContainer = document.querySelector('.fullscreen-container');
            if (fullscreenContainer && fullscreenContainer.style.display \!== 'none') {
                // Close fullscreen view
                const closeButton = fullscreenContainer.querySelector('.fullscreen-close');
                if (closeButton) closeButton.click();
            } else {
                // Close the gallery
                const closeButton = galleryPopup.querySelector('.close-button');
                if (closeButton) closeButton.click();
            }
        }
        
        // Arrow keys in fullscreen mode
        const fullscreenContainer = document.querySelector('.fullscreen-container');
        if (fullscreenContainer && fullscreenContainer.style.display \!== 'none') {
            // Left/right arrows for previous/next image
            if (event.key === 'ArrowLeft') {
                // Get all images in the current folder and find the previous one
                navigateImages('prev');
            } else if (event.key === 'ArrowRight') {
                // Get all images in the current folder and find the next one
                navigateImages('next');
            }
        }
    });
    
    // Helper function to navigate between images
    function navigateImages(direction) {
        // Find the current displayed image source
        const fullscreenImage = document.querySelector('.fullscreen-image, .fullscreen-video');
        if (\!fullscreenImage) return;
        
        // Get current image source
        const currentSrc = fullscreenImage.src;
        
        // Get all image cards in the gallery
        const imageCards = document.querySelectorAll('.image-card');
        if (\!imageCards.length) return;
        
        // Convert NodeList to Array for easier manipulation
        const cards = Array.from(imageCards);
        
        // Find the index of the current image
        let currentIndex = -1;
        for (let i = 0; i < cards.length; i++) {
            const mediaElement = cards[i].querySelector('.gallery-media');
            if (\!mediaElement) continue;
            
            const mediaSrc = mediaElement.src || mediaElement.dataset.src || mediaElement.dataset.fullsrc;
            if (mediaSrc && currentSrc.includes(mediaSrc)) {
                currentIndex = i;
                break;
            }
        }
        
        if (currentIndex === -1) return;
        
        // Calculate the next/prev index
        let targetIndex;
        if (direction === 'next') {
            targetIndex = (currentIndex + 1) % cards.length;
        } else {
            targetIndex = (currentIndex - 1 + cards.length) % cards.length;
        }
        
        // Trigger click on the target image
        const targetCard = cards[targetIndex];
        if (targetCard) {
            const mediaElement = targetCard.querySelector('.gallery-media');
            if (mediaElement) mediaElement.click();
        }
    }
    
    // Create a toast notification function
    window.showToast = function(message, type = 'info') {
        // Remove any existing toasts
        const existingToasts = document.querySelectorAll('.keyboard-toast');
        existingToasts.forEach(toast => toast.remove());
        
        // Create new toast
        const toast = document.createElement('div');
        toast.classList.add('keyboard-toast', 'keyboard-toast-' + type);
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Fade in
        setTimeout(() => toast.classList.add('visible'), 10);
        
        // Fade out after 3 seconds
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };
    
    // Add keyboard help button to gallery when it opens
    const checkForGalleryPopup = setInterval(() => {
        const galleryPopup = document.querySelector('.gallery-popup');
        const popupHeader = galleryPopup ? galleryPopup.querySelector('.popup-header') : null;
        const helpButtonExists = document.querySelector('.keyboard-help-button');
        
        if (popupHeader && \!helpButtonExists) {
            // Create help button
            const helpButton = document.createElement('button');
            helpButton.classList.add('keyboard-help-button');
            helpButton.innerHTML = '⌨️ Keyboard Shortcuts';
            helpButton.addEventListener('click', showKeyboardShortcutsHelp);
            
            // Insert before settings button if it exists
            const settingsButton = popupHeader.querySelector('.settings-button-header');
            if (settingsButton) {
                popupHeader.insertBefore(helpButton, settingsButton);
            } else {
                popupHeader.appendChild(helpButton);
            }
            
            // Add CSS
            addKeyboardCss();
            
            // Show a helpful toast
            window.showToast('Keyboard shortcuts enabled\! Press "?" for help', 'info');
            
            // Mission accomplished - clear the interval
            clearInterval(checkForGalleryPopup);
        }
    }, 1000);
    
    // Function to add CSS for keyboard navigation elements
    function addKeyboardCss() {
        const style = document.createElement('style');
        style.textContent = `
            /* Toast notifications */
            .keyboard-toast {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .keyboard-toast.visible {
                opacity: 1;
            }
            
            .keyboard-toast-info {
                border-left: 4px solid #3498db;
            }
            
            .keyboard-toast-success {
                border-left: 4px solid #2ecc71;
            }
            
            .keyboard-toast-warning {
                border-left: 4px solid #f39c12;
            }
            
            .keyboard-toast-error {
                border-left: 4px solid #e74c3c;
            }
            
            /* Keyboard shortcuts button */
            .keyboard-help-button {
                background-color: transparent;
                color: var(--button-text, white);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                padding: 5px 10px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 5px;
                transition: all 0.2s ease;
                margin-right: 10px;
            }
            
            .keyboard-help-button:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }
            
            /* Keyboard shortcuts dialog */
            .keyboard-shortcuts-dialog {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            
            .keyboard-shortcuts-content {
                background-color: var(--popup-background, #2a2a2a);
                border-radius: 8px;
                padding: 20px;
                width: 400px;
                max-width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .keyboard-shortcuts-title {
                font-size: 20px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .keyboard-shortcut-list {
                display: grid;
                grid-gap: 10px;
                margin-bottom: 20px;
            }
            
            .keyboard-shortcut-row {
                display: grid;
                grid-template-columns: 100px 1fr;
                align-items: center;
            }
            
            .keyboard-shortcut-key {
                background-color: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                padding: 5px 10px;
                text-align: center;
                font-family: monospace;
                font-weight: bold;
            }
            
            .keyboard-shortcuts-close {
                width: 100%;
                padding: 8px;
                background-color: var(--button-bg, #444);
                color: var(--button-text, white);
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s ease;
            }
            
            .keyboard-shortcuts-close:hover {
                background-color: var(--button-hover-bg, #555);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Function to show keyboard shortcuts help dialog
    function showKeyboardShortcutsHelp() {
        // Remove any existing dialog
        const existingDialog = document.querySelector('.keyboard-shortcuts-dialog');
        if (existingDialog) existingDialog.remove();
        
        // Create dialog
        const dialog = document.createElement('div');
        dialog.classList.add('keyboard-shortcuts-dialog');
        
        const content = document.createElement('div');
        content.classList.add('keyboard-shortcuts-content');
        
        const title = document.createElement('div');
        title.classList.add('keyboard-shortcuts-title');
        title.textContent = 'Keyboard Shortcuts';
        content.appendChild(title);
        
        const shortcutList = document.createElement('div');
        shortcutList.classList.add('keyboard-shortcut-list');
        
        const shortcuts = [
            { key: 'Esc', description: 'Close gallery or fullscreen view' },
            { key: '←', description: 'Previous image in fullscreen view' },
            { key: '→', description: 'Next image in fullscreen view' },
            { key: '?', description: 'Show this help dialog' }
        ];
        
        shortcuts.forEach(shortcut => {
            const row = document.createElement('div');
            row.classList.add('keyboard-shortcut-row');
            
            const keySpan = document.createElement('span');
            keySpan.classList.add('keyboard-shortcut-key');
            keySpan.textContent = shortcut.key;
            row.appendChild(keySpan);
            
            const descSpan = document.createElement('span');
            descSpan.textContent = shortcut.description;
            row.appendChild(descSpan);
            
            shortcutList.appendChild(row);
        });
        
        content.appendChild(shortcutList);
        
        const closeButton = document.createElement('button');
        closeButton.classList.add('keyboard-shortcuts-close');
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => dialog.remove());
        content.appendChild(closeButton);
        
        dialog.appendChild(content);
        document.body.appendChild(dialog);
        
        // Close when clicking outside
        dialog.addEventListener('click', event => {
            if (event.target === dialog) dialog.remove();
        });
    }
    
    // Add question mark key handler for help
    document.addEventListener('keydown', event => {
        if (event.key === '?' || (event.key === '/' && event.shiftKey)) {
            // Find gallery popup
            const galleryPopup = document.querySelector('.gallery-popup');
            if (galleryPopup && galleryPopup.style.display \!== 'none') {
                showKeyboardShortcutsHelp();
                event.preventDefault();
            }
        }
    });
});
