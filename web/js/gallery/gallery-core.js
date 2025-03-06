import { createGalleryUI, createFullscreenContainer, createInfoWindow, createRawMetadataWindow, createFilterPanel, updateFilterPanelOptions, applySelectedFilters, resetFilters, showCollectionsPanel, showFavorites, viewCollection } from "./ui-components.js";
import {
    populateFolderNavigation, loadFolderImages, setupLazyLoading, sortImages, sortImagesArray,
    applyFilters, toggleFavorite, loadFavorites, showLoading, hideLoading, calculateImagesPerPage,
    renderImageBatch, createImageCard, setupInfiniteScroll, getLastDateFromContainer
} from "./image-handling.js";
import {
    showFullscreenImage, showInfoWindow, showRawMetadataWindow, populateInfoWindowContent,
    closeInfoWindow, closeRawMetadataWindow, closeFullscreenView, adjustZoom, resetZoom,
    rotateImage, setupImageDragging, setupMouseWheelZoom, formatPromptText, sendToComfyUI,
    importWorkflow, showToast, showCollections, loadCollections, saveCollections,
    createCollection, addToCollection
} from "./metadata-display.js";

let gallery;

class Gallery {
    constructor(options) {
        this.openButtonBox = options.openButtonBox;
        this.folders = options.folders || {};
        this.galleryButton = null;
        this.galleryPopup = null;
        this.currentFolder = null;
        this.currentSort = 'newest';
        this.sortButtons = [];
        this.searchText = "";
        this.fullscreenContainer = null;
        this.fullscreenImage = null;
        this.infoWindow = null;
        this.rawMetadataWindow = null;
        
        // New properties for enhanced features
        this.favorites = [];
        this.collections = [];
        this.activeFilters = {};
        this.filteredImages = [];
        this.currentPage = 0;
        this.imagesPerPage = 50;
        this.filterPanel = null;
        this.darkMode = true; // Default to dark mode
        this.imageObserver = null;
        this.scrollListener = null;

        this.init();
    }

    init() {
        this.createButton();
        createGalleryUI(this);
        this.applyStyles();
        this.setupKeyboardEvents();
        
        // Load saved data
        this.loadFavorites();
        this.loadThemePreference();
        
        // Create additional panels
        createFilterPanel(this);
    }
    
    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // Handle different keyboard events
            if (e.key === 'Escape') {
                // Close any open fullscreen container or popup
                if (this.fullscreenContainer && this.fullscreenContainer.style.display === 'flex') {
                    this.closeFullscreenView();
                } else if (this.galleryPopup && this.galleryPopup.style.display === 'flex') {
                    this.closeGallery();
                }
            } else if (this.fullscreenContainer && this.fullscreenContainer.style.display === 'flex') {
                // Only handle these keys when in fullscreen view
                if (e.key === 'ArrowLeft') {
                    this.showPreviousImage();
                    e.preventDefault();
                } else if (e.key === 'ArrowRight') {
                    this.showNextImage();
                    e.preventDefault();
                } else if (e.key === '+' || e.key === '=') {
                    this.adjustZoom(0.1);
                    e.preventDefault();
                } else if (e.key === '-') {
                    this.adjustZoom(-0.1);
                    e.preventDefault();
                } else if (e.key === '0') {
                    this.resetZoom();
                    e.preventDefault();
                } else if (e.key === 'r' || e.key === 'R') {
                    this.rotateImage(90);
                    e.preventDefault();
                }
            }
        });
    }

    createButton() {
        if (!this.galleryButton) {
            this.galleryButton = document.createElement('button');
            this.galleryButton.classList.add('gallery-button');
            
            // Set basic styling directly on the button
            this.galleryButton.style.backgroundColor = '#3498db';
            this.galleryButton.style.color = 'white';
            this.galleryButton.style.border = 'none';
            this.galleryButton.style.padding = '5px 10px';
            this.galleryButton.style.borderRadius = '4px';
            this.galleryButton.style.cursor = 'pointer';
            this.galleryButton.style.display = 'flex';
            this.galleryButton.style.alignItems = 'center';
            
            // Use text node instead of innerHTML for better compatibility
            const iconSpan = document.createElement('span');
            iconSpan.className = 'material-icons';
            iconSpan.textContent = 'photo_library';
            iconSpan.style.marginRight = '5px';
            
            const textNode = document.createTextNode('Gallery');
            
            this.galleryButton.appendChild(iconSpan);
            this.galleryButton.appendChild(textNode);
            
            // Log click and connection issues
            this.galleryButton.addEventListener('click', () => {
                console.log('Gallery button clicked');
                try {
                    this.openGallery();
                } catch (error) {
                    console.error('Error opening gallery:', error);
                    alert('Error opening gallery. Check console for details.');
                }
            });
            
            // Add to DOM
            if (this.openButtonBox) {
                console.log('Adding gallery button to button box');
                this.openButtonBox.appendChild(this.galleryButton);
            } else {
                console.error('Button box not found');
                // Try to append to body as fallback
                document.body.appendChild(this.galleryButton);
            }
        }
    }

    // Core methods
    openGallery() {
        console.log('Opening gallery');
        
        if (!this.galleryPopup) {
            console.error('Gallery popup not created yet');
            
            // Try to recreate the UI elements
            console.log('Attempting to recreate gallery UI');
            createGalleryUI(this);
            
            if (!this.galleryPopup) {
                console.error('Failed to create gallery popup');
                alert('Gallery initialization failed. Check console for details.');
                return;
            }
        }
        
        console.log('Setting gallery popup to display flex');
        this.galleryPopup.style.display = 'flex';
        
        console.log('Refreshing gallery content');
        this.refreshGallery();
    }

    closeGallery() {
        if (this.galleryPopup) {
            this.galleryPopup.style.display = 'none';
        }
    }
    
    refreshGallery() {
        console.log('Refreshing gallery');
        
        // Check if popup exists
        if (!this.galleryPopup) {
            console.error('Gallery popup not initialized');
            return;
        }
        
        // Show loading state
        const imageDisplay = this.galleryPopup?.querySelector('.image-display');
        if (imageDisplay) {
            try {
                console.log('Showing loading indicator');
                this.showLoading(imageDisplay);
            } catch (error) {
                console.error('Error showing loading indicator:', error);
            }
        } else {
            console.warn('Image display element not found');
        }
        
        // Log all available endpoints
        console.log('Available fetch paths:');
        ['./Gallery/images', '/Gallery/images', '../Gallery/images', 'Gallery/images'].forEach(path => {
            console.log(`- ${path}`);
        });
        
        // Try multiple API paths
        const tryFetch = (paths, index = 0) => {
            if (index >= paths.length) {
                console.error('All API paths failed');
                alert('Failed to load gallery images. Check console for details.');
                if (imageDisplay) this.hideLoading(imageDisplay);
                return;
            }
            
            const path = paths[index];
            console.log(`Trying to fetch from: ${path}`);
            
            fetch(path)
                .then(response => {
                    console.log(`Response from ${path}:`, response);
                    if (!response.ok) {
                        throw new Error(`HTTP error ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Received data:', data);
                    this.updateImages(data.folders || {});
                    if (imageDisplay) {
                        this.hideLoading(imageDisplay);
                    }
                    console.log('Gallery refreshed successfully');
                    // Use try-catch for showToast in case it's not implemented yet
                    try {
                        this.showToast('Gallery refreshed', 'success');
                    } catch (e) {
                        console.log('Toast notification not available');
                    }
                })
                .catch(error => {
                    console.error(`Error fetching from ${path}:`, error);
                    // Try next path
                    tryFetch(paths, index + 1);
                });
        };
        
        // Try different possible API paths
        tryFetch(['./Gallery/images', '/Gallery/images', '../Gallery/images', 'Gallery/images']);
    }
    
    showPreviousImage() {
        if (!this.currentImageUrl || !this.filteredImages) return;
        
        // Find current image index
        const currentIndex = this.filteredImages.findIndex(img => img.url === this.currentImageUrl);
        if (currentIndex === -1) return;
        
        // Get previous image
        const prevIndex = (currentIndex - 1 + this.filteredImages.length) % this.filteredImages.length;
        const prevImage = this.filteredImages[prevIndex];
        
        // Show previous image
        this.showFullscreenImage(prevImage.url, prevImage);
    }
    
    showNextImage() {
        if (!this.currentImageUrl || !this.filteredImages) return;
        
        // Find current image index
        const currentIndex = this.filteredImages.findIndex(img => img.url === this.currentImageUrl);
        if (currentIndex === -1) return;
        
        // Get next image
        const nextIndex = (currentIndex + 1) % this.filteredImages.length;
        const nextImage = this.filteredImages[nextIndex];
        
        // Show next image
        this.showFullscreenImage(nextImage.url, nextImage);
    }
    
    toggleTheme() {
        this.darkMode = !this.darkMode;
        document.body.classList.toggle('light-theme', !this.darkMode);
        
        // Save preference
        localStorage.setItem('comfyui-gallery-theme', this.darkMode ? 'dark' : 'light');
        
        this.showToast(`Switched to ${this.darkMode ? 'dark' : 'light'} theme`, 'info');
    }
    
    loadThemePreference() {
        const savedTheme = localStorage.getItem('comfyui-gallery-theme');
        if (savedTheme) {
            this.darkMode = savedTheme === 'dark';
            document.body.classList.toggle('light-theme', !this.darkMode);
        }
    }

    changeButtonBox(newButtonBox) {
        if (this.galleryButton && this.galleryButton.parentNode === this.openButtonBox) {
            this.openButtonBox.removeChild(this.galleryButton);
        }
        this.openButtonBox = newButtonBox;
        if(this.galleryButton){
            this.openButtonBox.appendChild(this.galleryButton);
        }
    }

    clearGallery() {
        this.folders = {};
        if (this.galleryPopup) {
            populateFolderNavigation(this);
        }
    }

    updateImages(newFolders) {
        const imageDisplay = this.galleryPopup?.querySelector('.image-display');
        const scrollTop = imageDisplay ? imageDisplay.scrollTop : 0;

        this.folders = newFolders;

        if (this.galleryPopup) {
            populateFolderNavigation(this);
        }

        if (imageDisplay) {
            imageDisplay.scrollTop = scrollTop;
        }
    }
    
    showFilterPanel() {
        if (this.filterPanel) {
            this.filterPanel.style.display = 'block';
            
            // Extract metadata fields for filtering from current images
            this.updateFilterOptions();
        }
    }
    
    updateFilterOptions() {
        // Build a list of available filter options from the current folder
        const currentFolderImages = this.folders[this.currentFolder] || [];
        if (currentFolderImages.length === 0) return;
        
        // Extract common fields from metadata
        const metadataFields = new Map();
        
        currentFolderImages.forEach(image => {
            if (!image.metadata) return;
            
            // Add basic fields
            if (image.metadata.model) {
                if (!metadataFields.has('model')) metadataFields.set('model', new Set());
                metadataFields.get('model').add(image.metadata.model);
            }
            
            if (image.metadata.sampler) {
                if (!metadataFields.has('sampler')) metadataFields.set('sampler', new Set());
                metadataFields.get('sampler').add(image.metadata.sampler);
            }
            
            // Try to handle nested fields from the prompt structure
            if (image.metadata.prompt) {
                // Look for common node types
                for (const key in image.metadata.prompt) {
                    const node = image.metadata.prompt[key];
                    
                    // Extract sampler from KSampler
                    if (node.class_type === 'KSampler' && node.inputs?.sampler_name) {
                        if (!metadataFields.has('sampler')) metadataFields.set('sampler', new Set());
                        metadataFields.get('sampler').add(node.inputs.sampler_name);
                    }
                    
                    // Extract model from CheckpointLoaderSimple
                    if (node.class_type === 'CheckpointLoaderSimple' && node.inputs?.ckpt_name) {
                        if (!metadataFields.has('model')) metadataFields.set('model', new Set());
                        metadataFields.get('model').add(node.inputs.ckpt_name);
                    }
                }
            }
        });
        
        // Update filter panel options
        this.updateFilterPanelOptions(metadataFields);
    }
}

// Make methods available on the Gallery prototype
Object.assign(Gallery.prototype, {
    // UI components
    createFullscreenContainer,
    createInfoWindow,
    createRawMetadataWindow,
    createFilterPanel,
    updateFilterPanelOptions,
    applySelectedFilters,
    resetFilters,
    showCollectionsPanel,
    showFavorites,
    viewCollection,
    
    // Image handling methods
    populateFolderNavigation,
    loadFolderImages,
    setupLazyLoading,
    sortImages,
    sortImagesArray,
    applyFilters,
    toggleFavorite,
    loadFavorites,
    showLoading,
    hideLoading,
    calculateImagesPerPage,
    renderImageBatch,
    createImageCard,
    setupInfiniteScroll,
    getLastDateFromContainer,
    
    // Metadata display and actions
    showFullscreenImage,
    showInfoWindow,
    showRawMetadataWindow,
    populateInfoWindowContent,
    closeInfoWindow,
    closeRawMetadataWindow,
    closeFullscreenView,
    adjustZoom,
    resetZoom,
    rotateImage,
    setupImageDragging,
    setupMouseWheelZoom,
    formatPromptText,
    sendToComfyUI,
    importWorkflow,
    showToast,
    showCollections,
    loadCollections,
    saveCollections,
    createCollection,
    addToCollection,
    
    // Styles
    applyStyles
});

// Note: showLoading and hideLoading are imported from image-handling.js
// We removed the duplicate implementations to fix conflicts

function showToast(message, type) {
    console.log(`Toast (${type}): ${message}`);
    
    // Create a basic toast notification
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.color = 'white';
    toast.style.zIndex = '9999';
    
    // Set background color based on type
    switch(type) {
        case 'success':
            toast.style.backgroundColor = '#27ae60';
            break;
        case 'error':
            toast.style.backgroundColor = '#c0392b';
            break;
        default:
            toast.style.backgroundColor = '#2980b9';
    }
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Add applyStyles method back into the Gallery class
function applyStyles() {
    // Load external CSS instead of inline styles
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    
    // Try different possible paths for the CSS file
    const possiblePaths = [
        './web/css/gallery-styles.css',                     // Direct path
        '../web/css/gallery-styles.css',                    // Relative from js folder
        '/extensions/ComfyUI-Gallery/web/css/gallery-styles.css', // Extensions path
        './ComfyUI-Gallery/web/css/gallery-styles.css',    // Alternative path
        '/ComfyUI-Gallery/web/css/gallery-styles.css'      // Root-relative path
    ];
    
    // Create a dynamic script to detect which path works
    let cssPathFound = false;
    possiblePaths.forEach(path => {
        // Test if file exists by creating a test element
        const testLink = document.createElement('link');
        testLink.rel = 'stylesheet';
        testLink.href = path;
        testLink.onload = () => {
            if (!cssPathFound) {
                console.log(`Gallery CSS loaded successfully from: ${path}`);
                linkElement.href = path;
                document.head.appendChild(linkElement);
                cssPathFound = true;
                // Remove test link after we've found the right path
                document.head.removeChild(testLink);
            }
        };
        document.head.appendChild(testLink);
    });
    
    // Fallback inline styles if no CSS paths work
    setTimeout(() => {
        if (!cssPathFound) {
            console.warn("Could not load external CSS, using inline styles");
            
            // Create minimal inline styles to make the gallery work
            const style = document.createElement('style');
            style.textContent = `
                .gallery-button { 
                    background-color: #3498db; 
                    color: white; 
                    border: none; 
                    padding: 5px 10px; 
                    cursor: pointer; 
                    border-radius: 4px;
                }
                .gallery-button:hover { background-color: #2980b9; }
                
                .gallery-popup {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                    z-index: 1000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                
                .popup-content {
                    background-color: #333;
                    color: white;
                    width: 80%;
                    height: 80%;
                    border-radius: 8px;
                    overflow: auto;
                    padding: 20px;
                }
            `;
            document.head.appendChild(style);
        }
    }, 1000);
    
    // Also load Material Icons for our enhanced UI
    const iconLink = document.createElement('link');
    iconLink.rel = 'stylesheet';
    iconLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    document.head.appendChild(iconLink);
}

export { Gallery };