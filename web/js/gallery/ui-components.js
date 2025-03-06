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
        
        // Create toast container for notifications
        createToastContainer();
    }
}

function createHeader(gallery) {
    const header = document.createElement('div');
    header.classList.add('popup-header');

    // Gallery title
    const title = document.createElement('h2');
    title.textContent = 'ComfyUI Gallery';
    title.style.margin = '0';
    title.style.marginRight = '15px';
    header.appendChild(title);

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
    clearSearchButton.innerHTML = '<i class="material-icons">close</i>';
    clearSearchButton.classList.add('clear-search-button');
    clearSearchButton.addEventListener('click', () => {
        gallery.searchText = "";
        searchInput.value = "";
        gallery.loadFolderImages(gallery.currentFolder);
    });
    searchContainer.appendChild(clearSearchButton);
    header.appendChild(searchContainer);

    // Control buttons container
    const controlButtons = document.createElement('div');
    controlButtons.classList.add('control-buttons');
    controlButtons.style.display = 'flex';
    controlButtons.style.gap = '8px';
    controlButtons.style.marginLeft = 'auto';

    // Filter button
    const filterButton = document.createElement('button');
    filterButton.classList.add('filter-button-icon');
    filterButton.innerHTML = '<i class="material-icons">filter_list</i> Filter';
    filterButton.addEventListener('click', () => gallery.showFilterPanel());
    controlButtons.appendChild(filterButton);
    
    // Collections button
    const collectionsButton = document.createElement('button');
    collectionsButton.classList.add('filter-button-icon');
    collectionsButton.innerHTML = '<i class="material-icons">folder</i> Collections';
    collectionsButton.addEventListener('click', () => gallery.showCollectionsPanel());
    controlButtons.appendChild(collectionsButton);
    
    // Favorites button
    const favoritesButton = document.createElement('button');
    favoritesButton.classList.add('filter-button-icon');
    favoritesButton.innerHTML = '<i class="material-icons">favorite</i> Favorites';
    favoritesButton.addEventListener('click', () => gallery.showFavorites());
    controlButtons.appendChild(favoritesButton);
    
    // Theme toggle button
    const themeButton = document.createElement('button');
    themeButton.classList.add('filter-button-icon');
    themeButton.innerHTML = `<i class="material-icons">${gallery.darkMode ? 'light_mode' : 'dark_mode'}</i>`;
    themeButton.title = gallery.darkMode ? 'Switch to light theme' : 'Switch to dark theme';
    themeButton.addEventListener('click', () => {
        gallery.toggleTheme();
        themeButton.innerHTML = `<i class="material-icons">${gallery.darkMode ? 'light_mode' : 'dark_mode'}</i>`;
        themeButton.title = gallery.darkMode ? 'Switch to light theme' : 'Switch to dark theme';
    });
    controlButtons.appendChild(themeButton);
    
    // Refresh button
    const refreshButton = document.createElement('button');
    refreshButton.classList.add('refresh-button');
    refreshButton.innerHTML = '<i class="material-icons">refresh</i> Refresh';
    refreshButton.addEventListener('click', () => gallery.refreshGallery());
    controlButtons.appendChild(refreshButton);
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '<i class="material-icons">close</i>';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', () => gallery.closeGallery());
    controlButtons.appendChild(closeButton);
    
    header.appendChild(controlButtons);
    
    // Sort controls row
    const sortRow = document.createElement('div');
    sortRow.classList.add('sort-row');
    sortRow.style.display = 'flex';
    sortRow.style.marginTop = '10px';
    sortRow.style.alignItems = 'center';
    
    const sortLabel = document.createElement('span');
    sortLabel.textContent = 'Sort by:';
    sortLabel.style.marginRight = '10px';
    sortRow.appendChild(sortLabel);
    
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
    sortRow.appendChild(sortDiv);
    
    header.appendChild(sortRow);

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

function createFilterPanel(gallery) {
    // Create filter panel
    const panel = document.createElement('div');
    panel.classList.add('filter-panel');
    panel.id = 'filter-panel';
    
    // Create header
    const header = document.createElement('div');
    header.classList.add('filter-header');
    
    const title = document.createElement('h3');
    title.textContent = 'Filter Images';
    title.style.margin = '0';
    header.appendChild(title);
    
    const closeButton = document.createElement('span');
    closeButton.classList.add('filter-close');
    closeButton.innerHTML = '×';
    closeButton.onclick = () => panel.style.display = 'none';
    header.appendChild(closeButton);
    
    panel.appendChild(header);
    
    // Create filter groups container
    const filterGroups = document.createElement('div');
    filterGroups.classList.add('filter-groups');
    filterGroups.id = 'filter-groups';
    panel.appendChild(filterGroups);
    
    // Create empty placeholder
    const emptyMessage = document.createElement('p');
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.color = '#aaa';
    emptyMessage.textContent = 'Select a folder to see available filters';
    filterGroups.appendChild(emptyMessage);
    
    // Create action buttons
    const actions = document.createElement('div');
    actions.classList.add('filter-actions');
    
    const applyButton = document.createElement('button');
    applyButton.textContent = 'Apply Filters';
    applyButton.classList.add('filter-button', 'apply-filters');
    applyButton.onclick = () => {
        // Apply the selected filters
        gallery.applySelectedFilters();
        panel.style.display = 'none';
    };
    
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset';
    resetButton.classList.add('filter-button', 'reset-filters');
    resetButton.onclick = () => {
        // Reset all filters
        gallery.resetFilters();
        panel.style.display = 'none';
    };
    
    actions.appendChild(resetButton);
    actions.appendChild(applyButton);
    panel.appendChild(actions);
    
    // Add to document
    document.body.appendChild(panel);
    
    // Store reference
    gallery.filterPanel = panel;
}

function createToastContainer() {
    // Check if container already exists
    if (document.querySelector('.toast-container')) return;
    
    // Create toast container
    const container = document.createElement('div');
    container.classList.add('toast-container');
    document.body.appendChild(container);
}

// Helper function to update filter panel options
function updateFilterPanelOptions(metadataFields) {
    // Get the filter groups container
    const filterGroups = document.getElementById('filter-groups');
    if (!filterGroups) return;
    
    // Clear existing options
    filterGroups.innerHTML = '';
    
    // Check if we have any fields to filter by
    if (metadataFields.size === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = '#aaa';
        emptyMessage.textContent = 'No filterable metadata found in this folder';
        filterGroups.appendChild(emptyMessage);
        return;
    }
    
    // Create a group for each metadata field
    metadataFields.forEach((values, field) => {
        const group = document.createElement('div');
        group.classList.add('filter-group');
        group.dataset.field = field;
        
        const title = document.createElement('div');
        title.classList.add('filter-title');
        title.textContent = field.charAt(0).toUpperCase() + field.slice(1); // Capitalize first letter
        group.appendChild(title);
        
        const options = document.createElement('div');
        options.classList.add('filter-options');
        
        // Create a checkbox for each unique value
        [...values].sort().forEach(value => {
            const option = document.createElement('label');
            option.classList.add('filter-checkbox');
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = value;
            checkbox.dataset.field = field;
            
            // Check if this filter is already active
            if (this.activeFilters && this.activeFilters[field] && this.activeFilters[field].includes(value)) {
                checkbox.checked = true;
            }
            
            const text = document.createElement('span');
            text.textContent = value;
            
            option.appendChild(checkbox);
            option.appendChild(text);
            options.appendChild(option);
        });
        
        group.appendChild(options);
        filterGroups.appendChild(group);
    });
}

// Function to apply selected filters
function applySelectedFilters() {
    const activeFilters = {};
    
    // Get all checked filter checkboxes
    const filterPanel = document.getElementById('filter-panel');
    const checkboxes = filterPanel.querySelectorAll('input[type="checkbox"]:checked');
    
    // Group by field
    checkboxes.forEach(checkbox => {
        const field = checkbox.dataset.field;
        const value = checkbox.value;
        
        if (!activeFilters[field]) {
            activeFilters[field] = [];
        }
        
        activeFilters[field].push(value);
    });
    
    // Store active filters
    this.activeFilters = activeFilters;
    
    // Reload the current folder with filters applied
    if (this.currentFolder) {
        this.loadFolderImages(this.currentFolder);
    }
    
    // Show toast notification
    if (Object.keys(activeFilters).length > 0) {
        this.showToast(`Filters applied: ${Object.keys(activeFilters).length} active`, 'info');
    } else {
        this.showToast('All filters cleared', 'info');
    }
}

// Function to reset all filters
function resetFilters() {
    // Clear active filters
    this.activeFilters = {};
    
    // Uncheck all checkboxes
    const filterPanel = document.getElementById('filter-panel');
    const checkboxes = filterPanel.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reload the current folder without filters
    if (this.currentFolder) {
        this.loadFolderImages(this.currentFolder);
    }
    
    // Show toast notification
    this.showToast('Filters reset', 'info');
}

function showCollectionsPanel() {
    // Load collections
    const collections = this.loadCollections();
    
    // Create collections panel
    const panel = document.createElement('div');
    panel.classList.add('collections-panel');
    panel.id = 'collections-panel';
    
    // Create header
    const header = document.createElement('div');
    header.classList.add('filter-header');
    
    const title = document.createElement('h3');
    title.textContent = 'Collections';
    title.style.margin = '0';
    header.appendChild(title);
    
    const closeButton = document.createElement('span');
    closeButton.classList.add('filter-close');
    closeButton.innerHTML = '×';
    closeButton.onclick = () => panel.remove();
    header.appendChild(closeButton);
    
    panel.appendChild(header);
    
    // Create input for new collection
    const newCollectionInput = document.createElement('input');
    newCollectionInput.type = 'text';
    newCollectionInput.placeholder = 'New collection name...';
    newCollectionInput.classList.add('new-collection-input');
    
    const addButton = document.createElement('button');
    addButton.textContent = 'Create Collection';
    addButton.classList.add('filter-button', 'apply-filters');
    addButton.style.width = '100%';
    addButton.style.marginTop = '5px';
    addButton.onclick = () => {
        const name = newCollectionInput.value.trim();
        if (name) {
            this.createCollection(name);
            panel.remove();
            this.showToast(`Created collection "${name}"`, 'success');
        }
    };
    
    panel.appendChild(newCollectionInput);
    panel.appendChild(addButton);
    
    // Create collections list
    const listDiv = document.createElement('div');
    listDiv.classList.add('collections-list');
    
    if (collections.length === 0) {
        listDiv.innerHTML = '<p style="text-align: center; color: #aaa;">No collections yet</p>';
    } else {
        // Render each collection
        collections.forEach(collection => {
            const collectionItem = document.createElement('div');
            collectionItem.classList.add('collection-item');
            
            const nameSpan = document.createElement('div');
            nameSpan.classList.add('collection-name');
            nameSpan.innerHTML = `<i class="material-icons">folder</i>${collection.name}`;
            collectionItem.appendChild(nameSpan);
            
            const countSpan = document.createElement('span');
            countSpan.classList.add('collection-count');
            countSpan.textContent = collection.images.length;
            collectionItem.appendChild(countSpan);
            
            // Add click handler to view this collection
            collectionItem.onclick = () => {
                this.viewCollection(collection.name);
                panel.remove();
            };
            
            listDiv.appendChild(collectionItem);
        });
    }
    
    panel.appendChild(listDiv);
    
    // Add to document
    document.body.appendChild(panel);
    
    // Position the panel
    panel.style.top = '50%';
    panel.style.left = '50%';
    panel.style.transform = 'translate(-50%, -50%)';
    panel.style.display = 'block';
}

function showFavorites() {
    // Check if we have favorites
    if (!this.favorites || this.favorites.length === 0) {
        this.showToast('No favorite images yet', 'info');
        return;
    }
    
    // Create a virtual folder with favorite images
    const favoriteFolder = 'Favorites';
    
    // Find the images that match the favorites
    const favoriteImages = [];
    
    // Search through all folders
    for (const folderName in this.folders) {
        const folderImages = this.folders[folderName];
        folderImages.forEach(image => {
            if (this.favorites.includes(image.url)) {
                // Create a copy of the image data with the original folder
                const imageCopy = {...image};
                imageCopy.sourceFolder = folderName;
                favoriteImages.push(imageCopy);
            }
        });
    }
    
    // Check if we found any images
    if (favoriteImages.length === 0) {
        this.showToast('No favorite images found', 'info');
        return;
    }
    
    // Create a temporary virtual folder
    const tempFolders = {...this.folders};
    tempFolders[favoriteFolder] = favoriteImages;
    
    // Save current folder to restore later
    const prevFolder = this.currentFolder;
    
    // Update the UI
    this.folders = tempFolders;
    this.populateFolderNavigation();
    this.loadFolderImages(favoriteFolder);
    
    // Show toast
    this.showToast(`Showing ${favoriteImages.length} favorites`, 'info');
    
    // Create a restore button
    const restoreButton = document.createElement('button');
    restoreButton.textContent = 'Back to All Images';
    restoreButton.classList.add('filter-button', 'apply-filters');
    restoreButton.style.position = 'fixed';
    restoreButton.style.bottom = '20px';
    restoreButton.style.left = '50%';
    restoreButton.style.transform = 'translateX(-50%)';
    restoreButton.style.zIndex = '1002';
    restoreButton.id = 'restore-button';
    
    restoreButton.onclick = () => {
        // Restore the original folders
        this.refreshGallery();
        // Remove the button
        restoreButton.remove();
    };
    
    document.body.appendChild(restoreButton);
}

function viewCollection(collectionName) {
    // Load collections
    const collections = this.loadCollections();
    
    // Find the requested collection
    const collection = collections.find(c => c.name === collectionName);
    if (!collection) {
        this.showToast(`Collection "${collectionName}" not found`, 'error');
        return;
    }
    
    // Check if we have images in this collection
    if (!collection.images || collection.images.length === 0) {
        this.showToast(`Collection "${collectionName}" is empty`, 'info');
        return;
    }
    
    // Find the images that match the collection
    const collectionImages = [];
    
    // Search through all folders
    for (const folderName in this.folders) {
        const folderImages = this.folders[folderName];
        folderImages.forEach(image => {
            if (collection.images.includes(image.url)) {
                // Create a copy of the image data with the original folder
                const imageCopy = {...image};
                imageCopy.sourceFolder = folderName;
                collectionImages.push(imageCopy);
            }
        });
    }
    
    // Check if we found any images
    if (collectionImages.length === 0) {
        this.showToast('No images found in this collection', 'info');
        return;
    }
    
    // Create a temporary virtual folder
    const tempFolders = {...this.folders};
    tempFolders[`Collection: ${collectionName}`] = collectionImages;
    
    // Save current folder to restore later
    const prevFolder = this.currentFolder;
    
    // Update the UI
    this.folders = tempFolders;
    this.populateFolderNavigation();
    this.loadFolderImages(`Collection: ${collectionName}`);
    
    // Show toast
    this.showToast(`Showing ${collectionImages.length} images in "${collectionName}"`, 'info');
    
    // Create a restore button
    const restoreButton = document.createElement('button');
    restoreButton.textContent = 'Back to All Images';
    restoreButton.classList.add('filter-button', 'apply-filters');
    restoreButton.style.position = 'fixed';
    restoreButton.style.bottom = '20px';
    restoreButton.style.left = '50%';
    restoreButton.style.transform = 'translateX(-50%)';
    restoreButton.style.zIndex = '1002';
    restoreButton.id = 'restore-button';
    
    restoreButton.onclick = () => {
        // Restore the original folders
        this.refreshGallery();
        // Remove the button
        restoreButton.remove();
    };
    
    document.body.appendChild(restoreButton);
}

export {
    createGalleryUI,
    createFullscreenContainer,
    createInfoWindow,
    createRawMetadataWindow,
    createFilterPanel,
    updateFilterPanelOptions,
    applySelectedFilters,
    resetFilters,
    showCollectionsPanel,
    showFavorites,
    viewCollection
};