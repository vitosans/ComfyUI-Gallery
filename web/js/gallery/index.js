/**
 * ComfyUI Gallery - Index File
 * This is the main entry point for the modular gallery implementation
 */

// Import from gallery-core.js, which imports other modules
import { Gallery } from './gallery-core.js';
import { app } from "../../../scripts/app.js";

let gallery;

// Export the Gallery class for use in other modules
export { Gallery, gallery };