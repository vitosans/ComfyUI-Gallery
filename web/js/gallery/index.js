/**
 * ComfyUI Gallery - Index File
 * This is the main entry point for the modular gallery implementation
 */

// Import from gallery-core.js, which imports other modules
import { Gallery } from './gallery-core.js';
import { app } from "../../../scripts/app.js";

// Export the Gallery class and a helper function to set the gallery instance
export { Gallery };

// Use a module-level variable that isn't directly exported
let _gallery = null;

// Export functions to get and set the gallery instance
export function setGalleryInstance(instance) {
    _gallery = instance;
}

export function getGalleryInstance() {
    return _gallery;
}