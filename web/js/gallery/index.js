/**
 * ComfyUI Gallery - Index File
 * This is the main entry point for the modular gallery implementation
 */

// Import Gallery class from the core module
import { Gallery } from './gallery-core.js';

// Create global module object to avoid export syntax errors
window.galleryModule = {
    Gallery: Gallery,
    setGalleryInstance: function(instance) {
        window.galleryModule._gallery = instance;
    },
    getGalleryInstance: function() {
        return window.galleryModule._gallery;
    },
    _gallery: null
};

// Log that the module is loaded
console.log("Gallery module loaded and available via window.galleryModule");