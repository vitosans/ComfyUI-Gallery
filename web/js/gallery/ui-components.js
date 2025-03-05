/**
 * UI Components for Gallery - Handles creation of UI elements
 */

function createGalleryUI(gallery) {
    if (!gallery.galleryPopup) {
        // Create main popup
        gallery.galleryPopup = document.createElement('div');
        gallery.galleryPopup.classList.add('gallery-popup');
        gallery.galleryPopup.style.display = 'none';

        const popupContent = document.createElement('div');
        popupContent.classList.add('popup-content');

        // Create header with close button, search, and sort options
        const header = createHeader(gallery);
        popupContent.appendChild(header);

        // Create main content area with folder navigation and image display
        const mainContent = document.createElement('div');
        mainContent.classList.add('popup-main-content');

        const folderNavigation = document.createElement('div');
        folderNavigation.classList.add('folder-navigation');
        mainContent.appendChild(folderNavigation);

        const imageDisplay = document.createElement('div');
        imageDisplay.classList.add('image-display');
        mainContent.appendChild(imageDisplay);

        popupContent.appendChild(mainContent);
        gallery.galleryPopup.appendChild(popupContent);
        document.body.appendChild(gallery.galleryPopup);
        
        // Populate initial folders and create additional containers
        gallery.populateFolderNavigation(folderNavigation);
        gallery.createFullscreenContainer();
        gallery.createInfoWindow();
        gallery.createRawMetadataWindow();

        // Close on background click
        gallery.galleryPopup.addEventListener('click', (event) => {
            if (event.target === gallery.galleryPopup) {
                gallery.closeGallery();
            }
        });
    }
}

function createHeader(gallery) {
    const header = document.createElement('div');
    header.classList.add('popup-header');

    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', () => gallery.closeGallery());
    header.appendChild(closeButton);

    // Search container
    const searchContainer = document.createElement('div');
    searchContainer.classList.add('search-container');

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search...';
    searchInput.classList.add('search-input');
    searchInput.addEventListener('input', (event) => {
        gallery.searchText = event.target.value;
        gallery.loadFolderImages(gallery.currentFolder);
    });
    searchContainer.appendChild(searchInput);

    const clearSearchButton = document.createElement('button');
    clearSearchButton.textContent = '✕';
    clearSearchButton.classList.add('clear-search-button');
    clearSearchButton.addEventListener('click', () => {
        gallery.searchText = "";
        searchInput.value = "";
        gallery.loadFolderImages(gallery.currentFolder);
    });
    searchContainer.appendChild(clearSearchButton);
    header.appendChild(searchContainer);

    // Sort buttons
    const sortDiv = document.createElement('div');
    sortDiv.classList.add('sort-buttons');
    const sortOptions = [
        { label: 'Newest', value: 'newest' },
        { label: 'Oldest', value: 'oldest' },
        { label: 'Name ↑', value: 'name_asc' },
        { label: 'Name ↓', value: 'name_desc' }
    ];
    sortOptions.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.label;
        button.classList.add('sort-button');
        if (option.value === gallery.currentSort) {
            button.classList.add('active-sort');
        }
        button.addEventListener('click', () => gallery.sortImages(option.value));
        sortDiv.appendChild(button);
        gallery.sortButtons.push(button);
    });
    header.appendChild(sortDiv);

    return header;
}

function createFullscreenContainer(gallery) {
    // Container to hold both fullscreen image and info window
    this.fullscreenContainer = document.createElement('div');
    this.fullscreenContainer.classList.add('fullscreen-container');
    this.fullscreenContainer.style.display = 'none';

    this.galleryPopup.appendChild(this.fullscreenContainer);

    this.fullscreenContainer.addEventListener('click', (event) => {
        if (event.target === this.fullscreenContainer) {
            this.closeFullscreenView();
        }
    });
}

function createInfoWindow(gallery) {
    // Info window container
    this.infoWindow = document.createElement('div');
    this.infoWindow.classList.add('info-window');
    this.infoWindow.style.display = 'none';

    const closeButton = document.createElement('span');
    closeButton.classList.add('info-close');
    closeButton.innerHTML = '×';
    closeButton.onclick = () => this.closeInfoWindow();
    this.infoWindow.appendChild(closeButton);

    const infoContent = document.createElement('div');
    infoContent.classList.add('info-content');
    this.infoWindow.appendChild(infoContent);

    this.fullscreenContainer.appendChild(this.infoWindow);
}

function createRawMetadataWindow(gallery) {
    this.rawMetadataWindow = document.createElement('div');
    this.rawMetadataWindow.classList.add('raw-metadata-window');
    this.rawMetadataWindow.style.display = 'none';

    const closeButton = document.createElement('span');
    closeButton.classList.add('raw-metadata-close');
    closeButton.innerHTML = '×';
    closeButton.onclick = () => this.closeRawMetadataWindow();
    this.rawMetadataWindow.appendChild(closeButton);

    const metadataContent = document.createElement('div');
    metadataContent.classList.add('raw-metadata-content');
    this.rawMetadataWindow.appendChild(metadataContent);
    this.fullscreenContainer.appendChild(this.rawMetadataWindow);
}

export {
    createGalleryUI,
    createFullscreenContainer,
    createInfoWindow,
    createRawMetadataWindow
};