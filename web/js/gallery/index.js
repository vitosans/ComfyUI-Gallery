/**
 * ComfyUI Gallery - Index File
 * This is the main entry point for the modular gallery implementation
 */

// Import from gallery-core.js, which imports other modules
import { Gallery } from './gallery-core.js';

// Try to find the app import in multiple possible locations
let app;
try {
    // Try possible paths for app.js
    const paths = [
        "../../../scripts/app.js",
        "../../scripts/app.js",
        "/scripts/app.js",
        "/extensions/scripts/app.js"
    ];
    
    // Create a dynamic module loader
    const loadModule = async (path) => {
        try {
            const module = await import(path);
            return module.app;
        } catch (e) {
            console.warn(`Failed to import app from ${path}:`, e);
            return null;
        }
    };
    
    // Try to load from first available path
    (async () => {
        for (const path of paths) {
            app = await loadModule(path);
            if (app) {
                console.log(`Successfully loaded app from ${path}`);
                break;
            }
        }
        
        if (!app) {
            console.warn("Could not load app from any path, some functionality may be limited");
            // Create a minimal app stub if needed
            app = { 
                registerExtension: () => console.warn("App not available, cannot register extension"),
                api: { 
                    addEventListener: () => console.warn("App API not available"),
                    fetchApi: () => Promise.reject("App API not available")
                }
            };
        }
    })();

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