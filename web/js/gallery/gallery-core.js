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
            this.galleryButton.textContent = 'Open Gallery';
            this.galleryButton.classList.add('gallery-button');
            this.galleryButton.innerHTML = '<i class="material-icons" style="margin-right: 5px;">photo_library</i>Gallery';
            this.galleryButton.addEventListener('click', () => this.openGallery());
            this.openButtonBox.appendChild(this.galleryButton);
        }
    }

    // Core methods
    openGallery() {
        this.galleryPopup.style.display = 'flex';
        this.refreshGallery();
    }

    closeGallery() {
        if (this.galleryPopup) {
            this.galleryPopup.style.display = 'none';
        }
    }
    
    refreshGallery() {
        // Show loading state
        const imageDisplay = this.galleryPopup?.querySelector('.image-display');
        if (imageDisplay) {
            this.showLoading(imageDisplay);
        }
        
        // Fetch latest images from server
        fetch('/Gallery/images')
            .then(response => response.json())
            .then(data => {
                this.updateImages(data.folders || {});
                if (imageDisplay) {
                    this.hideLoading(imageDisplay);
                }
                this.showToast('Gallery refreshed', 'success');
            })
            .catch(error => {
                console.error('Error refreshing gallery:', error);
                if (imageDisplay) {
                    this.hideLoading(imageDisplay);
                }
                this.showToast('Failed to refresh gallery', 'error');
            });
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

// Add applyStyles method back into the Gallery class
function applyStyles() {
    // Load external CSS instead of inline styles
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = '/extensions/ComfyUI-Gallery/web/css/gallery-styles.css';
    document.head.appendChild(linkElement);
    
    // Also load Material Icons for our enhanced UI
    const iconLink = document.createElement('link');
    iconLink.rel = 'stylesheet';
    iconLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    document.head.appendChild(iconLink);
}

export { Gallery };