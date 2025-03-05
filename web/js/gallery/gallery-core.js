import { createGalleryUI, createFullscreenContainer, createInfoWindow, createRawMetadataWindow } from "./ui-components.js";
import { populateFolderNavigation, loadFolderImages, setupLazyLoading, sortImages, sortImagesArray } from "./image-handling.js";
import { showFullscreenImage, showInfoWindow, showRawMetadataWindow, populateInfoWindowContent, closeInfoWindow, closeRawMetadataWindow, closeFullscreenView } from "./metadata-display.js";

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

        this.init();
    }

    init() {
        this.createButton();
        createGalleryUI(this);
        this.applyStyles();
        this.setupKeyboardEvents();
    }
    
    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open fullscreen container or popup
                if (this.fullscreenContainer && this.fullscreenContainer.style.display === 'flex') {
                    this.closeFullscreenView();
                } else if (this.galleryPopup && this.galleryPopup.style.display === 'flex') {
                    this.closeGallery();
                }
            }
        });
    }

    createButton() {
        if (!this.galleryButton) {
            this.galleryButton = document.createElement('button');
            this.galleryButton.textContent = 'Open Gallery';
            this.galleryButton.classList.add('gallery-button');
            this.galleryButton.addEventListener('click', () => this.openGallery());
            this.openButtonBox.appendChild(this.galleryButton);
        }
    }

    // Core methods
    openGallery() {
        this.galleryPopup.style.display = 'flex';
        populateFolderNavigation(this);
    }

    closeGallery() {
        if (this.galleryPopup) {
            this.galleryPopup.style.display = 'none';
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
}

// Make methods available on the Gallery prototype
Object.assign(Gallery.prototype, {
    // UI components
    createFullscreenContainer,
    createInfoWindow,
    createRawMetadataWindow,
    
    // Image handling
    populateFolderNavigation,
    loadFolderImages,
    setupLazyLoading,
    sortImages,
    sortImagesArray,
    
    // Metadata display
    showFullscreenImage,
    showInfoWindow,
    showRawMetadataWindow,
    populateInfoWindowContent,
    closeInfoWindow,
    closeRawMetadataWindow,
    closeFullscreenView,
    
    // Styles
    applyStyles
});

// Add applyStyles method back into the Gallery class
function applyStyles() {
    const styleContent = `
        /* Basic Reset */
        * { box-sizing: border-box; }

        /* Gallery Popup */
        .gallery-popup {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            justify-content: center;
            align-items: center;
            font-family: sans-serif;
        }

        .popup-content {
            background-color: #444;
            color: #ddd;
            border: 1px solid #666;
            width: 80vw;
            height: 80vh;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
            border-radius: 8px;
            overflow: auto;
            padding: 20px;
        }

        /* Header */
        .popup-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #666;
        }

        .close-button {
            background-color: #c0392b;
            color: white;
            border: none;
            padding: 8px 12px;
            font-size: 14px;
            cursor: pointer;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }
        .close-button:hover { background-color: #992d22; }

        /* Sort controls */
        .sort-buttons {
            display: flex;
            gap: 8px;
            margin-left: auto;
        }

        .sort-button {
            background-color: #555;
            color: #eee;
            border: 1px solid #777;
            padding: 6px 10px;
            font-size: 13px;
            cursor: pointer;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }
        .sort-button:hover { background-color: #777; }
        .active-sort { background-color: #3498db; color: white; }

        /* Search */
        .search-container {
            width: 60%;
            display: flex;
            flex-wrap: wrap;
            align-content: center;
            justify-content: center;
            align-items: center;
        }

        .search-input {
            padding: 6px 10px;
            border-radius: 4px;
            border: 1px solid #777;
            background-color: #555;
            color: #eee;
            font-size: 13px;
            width: 75%;
            margin-right: 5px;
        }

        .search-input:focus {
            outline: none;
            border-color: #3498db;
        }

        .clear-search-button {
            background-color: #555;
            color: #eee;
            border: 1px solid #777;
            padding: 6px 10px;
            font-size: 13px;
            cursor: pointer;
            border-radius: 4px;
            transition: background-color 0.3s ease;
            margin-right: 5px;
        }
        .clear-search-button:hover { background-color: #777; }

        /* Main content */
        .popup-main-content {
            display: flex;
            flex-direction: row;
            height: 68vh;
        }

        /* Folder navigation */
        .folder-navigation {
            width: 200px;
            padding-right: 20px;
            border-right: 1px solid #666;
            overflow-y: auto;
        }

        .folder-button {
            display: block;
            width: 100%;
            padding: 8px;
            margin-bottom: 6px;
            border: none;
            background-color: #555;
            color: #eee;
            text-align: left;
            cursor: pointer;
            border-radius: 4px;
            transition: background-color 0.3s ease;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .folder-button:hover, .folder-button.active { background-color: #777; }
        .active-folder { background-color: #3498db; color: white; }

        /* Image display */
        .image-display {
            flex: 1;
            padding-left: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            overflow-y: auto;
            justify-content: center;
            justify-items: center;
            align-items: center;
        }

        .empty-gallery-message {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            font-style: italic;
            color: #aaa;
        }

        /* Image cards */
        .image-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            border: none;
            padding: 0px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: transform 0.2s ease;
            background-color: transparent;
            width: 250px;
            height: 300px;
            overflow: hidden;
        }

        .image-card:hover { transform: scale(1.03); }

        .image-container-inner {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 0px;
        }

        .gallery-image {
            width: 100%;
            height: 100%;
            display: block;
            border-radius: 10px;
            cursor: pointer;
            object-fit: cover;
            z-index: 0;
        }

        .card-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            color: #fff;
            padding: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom-left-radius: 10px;
            border-bottom-right-radius: 10px;
        }

        .image-name {
            font-size: 1em;
            color: #eee;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 100%;
        }

        /* Fullscreen container */
        .fullscreen-container {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            z-index: 2000;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        }

        /* Close buttons */
        .fullscreen-close, .info-close, .raw-metadata-close {
            position: absolute;
            top: 20px;
            right: 30px;
            color: #fff;
            font-size: 30px;
            font-weight: bold;
            cursor: pointer;
            z-index: 2001;
        }

        /* Fullscreen image */
        .fullscreen-image {
            max-width: 90%;
            max-height: 70%;
            display: block;
            margin-top: 60px;
        }

        /* Info window */
        .info-window {
            background-color: #333;
            color: #eee;
            border-radius: 8px;
            padding: 20px;
            max-width: 80%;
            max-height: 80%;
            overflow-y: auto;
            position: relative;
            margin-top: 60px;
        }

        .info-content {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            gap: 20px;
        }

        .info-preview-image {
            max-width: 400px;
            max-height: 400px;
            border-radius: 8px;
            display: block;
            object-fit: contain;
        }

        .metadata-table {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .metadata-row {
            display: flex;
            flex-direction: row;
            align-items: baseline;
        }

        .metadata-label {
            font-weight: bold;
            margin-right: 10px;
            flex-basis: 120px;
            text-align: right;
        }

        .metadata-value {
            flex: 1;
            word-break: break-word;
        }

        .raw-metadata-button {
            background-color: #555;
            color: #eee;
            border: 1px solid #777;
            padding: 8px 12px;
            font-size: 14px;
            cursor: pointer;
            border-radius: 4px;
            transition: background-color 0.3s ease;
            align-self: flex-start;
            margin-top: 15px;
        }
        .raw-metadata-button:hover { background-color: #777; }

        /* Raw metadata window */
        .raw-metadata-window {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            background-color: #222;
            color: #eee;
            border-radius: 8px;
            padding: 20px;
            width: 70vw;
            height: 80vh;
            overflow: auto;
            z-index: 2002;
            transform: translate(-50%, -50%);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
            flex-direction: column;
        }

        .raw-metadata-content {
            width: 100%;
            height: 100%;
        }

        .raw-metadata-content textarea {
            width: 100%;
            height: 100%;
            background-color: #444;
            color: #eee;
            border: none;
            padding: 10px;
            font-family: monospace;
            font-size: 14px;
            box-sizing: border-box;
        }

        .raw-metadata-close { top: 10px; }

        /* Date separators */
        .date-separator {
            grid-column: 1 / -1;
            text-align: center;
            padding: 10px;
            font-size: 1.2em;
            color: #eee;
            border-top: 1px solid #666;
            border-bottom: 1px solid #666;
            margin-top: 10px;
            margin-bottom: 10px;
            width: 95%;
        }

        /* Gallery button */
        .gallery-button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 5px 10px;
            font-size: 14px;
            cursor: pointer;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }
        .gallery-button:hover { background-color: #2980b9; }

        /* Info button */
        .info-button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 5px 10px;
            font-size: 12px;
            cursor: pointer;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }
        .info-button:hover { background-color: #2980b9; }

        /* Responsive styles */
        @media (max-width: 768px) {
            .popup-content { width: 95%; margin: 5% auto; }
            .popup-main-content { flex-direction: column; }
            .folder-navigation {
                width: 100%;
                border-right: none;
                border-bottom: 1px solid #ddd;
                margin-bottom: 15px;
                max-height: 120px;
                overflow-x: auto;
                overflow-y: auto;
                white-space: nowrap;
            }
            .folder-button { display: inline-block; width: auto; }
            .image-display { padding-left: 0; }
            .search-container {
                width: 100%;
                margin-bottom: 10px;
            }
            .search-input {
                width: calc(100% - 40px);
                margin-right: 5px;
            }
            .popup-header {
                flex-wrap: wrap;
            }
            .clear-search-button {
                margin-right: 0px;
            }
            
            /* Info window responsive adjustments */
            .info-content { flex-direction: column; align-items: center; }
            .info-preview-image { max-width: 90%; max-height: 300px; }
            .metadata-table { width: 90%; }
            .metadata-label { text-align: left; flex-basis: auto; margin-right: 5px; }
        }
    `;

    const style = document.createElement('style');
    style.textContent = styleContent;
    document.head.appendChild(style);
}

export { Gallery };