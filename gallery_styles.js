// gallery_styles.js - Simplified version
export const galleryStyles = `
    /* Gallery base styles */
    .gallery-popup {
        display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.8); z-index: 1000; justify-content: center;
        align-items: center; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    /* Keyboard navigation specific styles */
    .keyboard-help-button {
        background-color: transparent;
        color: #f0f0f0;
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
    
    /* Navigation hints */
    .navigation-hint {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 32px;
        padding: 15px 25px;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1010;
        pointer-events: none;
    }

    .navigation-hint.show {
        opacity: 0.8;
    }
`;

// Export default to make this a valid ES6 module
export default { galleryStyles };