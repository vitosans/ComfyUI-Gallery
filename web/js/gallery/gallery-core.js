import { app } from "../../../scripts/app.js";
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
        import("./gallery-styles.css");
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
    closeFullscreenView
});

// Register extension
app.registerExtension({
    name: "Gallery",
    init() {
        app.api.fetchApi("/Gallery/images")
            .then(response => response.text())
            .then(text => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error("Error parsing JSON response:", e);
                    return { folders: {} };
                }
            })
            .then(data => {
                const menu = document.getElementsByClassName("flex gap-2 mx-2")[0];
                if (menu) {
                    gallery = new Gallery({ openButtonBox: menu, folders: data.folders || {} });
                }
            });
    },
    async nodeCreated(node) {
        if (node.comfyClass === "GalleryNode") {
            const onRemoved = node.onRemoved;
            node.onRemoved = () => {
                if (onRemoved) { onRemoved.apply(node); }
                if (gallery) { gallery.closeGallery(); }
            };
            node.addWidget("button", "Open Gallery", null, () => {
                if (gallery) { gallery.openGallery(); }
            });
        }
    },
});

// Event listeners
app.api.addEventListener("Gallery.file_change", (event) => {
    console.log("file_change:", event);
    if (gallery) {
        app.api.fetchApi("/Gallery/images")
            .then(response => response.text())
            .then(text => JSON.parse(text))
            .then(data => gallery.updateImages(data.folders || {}));
    }
});

app.api.addEventListener("Gallery.update", (event) => {
    console.log("update:", event);
    if (gallery) {
        gallery.updateImages(event.detail.folders);
    }
});

app.api.addEventListener("Gallery.clear", (event) => {
    console.log("clear:", event);
    if (gallery) {
        gallery.clearGallery();
    }
});

export { Gallery };