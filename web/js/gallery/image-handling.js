/**
 * Image Handling - Functions for loading, displaying and organizing images
 */

function populateFolderNavigation(gallery) {
    const navElement = gallery.galleryPopup?.querySelector('.folder-navigation');
    if (!navElement) return;
    navElement.innerHTML = '';

    let folderNames = Object.keys(gallery.folders);
    if (folderNames.length === 0) {
        navElement.textContent = 'No folders available.';
        return;
    }

    // Sort folders logically by path
    folderNames.sort((a, b) => {
        const aParts = a.split('/');
        const bParts = b.split('/');
        for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
            if (aParts[i] < bParts[i]) return -1;
            if (aParts[i] > bParts[i]) return 1;
        }
        return aParts.length - bParts.length;
    });

    // Create buttons for each folder
    folderNames.forEach(folderName => {
        const folderButton = document.createElement('button');
        folderButton.textContent = folderName;
        folderButton.classList.add('folder-button');
        folderButton.addEventListener('click', () => gallery.loadFolderImages(folderName));
        if (folderName === gallery.currentFolder) {
            folderButton.classList.add('active-folder');
        } else {
            folderButton.classList.remove('active-folder');
        }
        navElement.appendChild(folderButton);
    });

    // Load the first folder or current folder
    if (folderNames.length > 0) {
        gallery.loadFolderImages(gallery.currentFolder || folderNames[0]);
    }
}

function loadFolderImages(folderName) {
    if (!folderName) return;

    this.currentFolder = folderName;

    // Update active folder button
    const folderButtons = this.galleryPopup.querySelectorAll('.folder-button');
    folderButtons.forEach(button => {
        if (button.textContent === folderName) {
            button.classList.add('active-folder');
        } else {
            button.classList.remove('active-folder');
        }
    });

    const imageDisplay = this.galleryPopup?.querySelector('.image-display');
    if (!imageDisplay) return;

    // Show loading state
    this.showLoading(imageDisplay);
    
    // Use setTimeout to improve UI responsiveness
    setTimeout(() => {
        imageDisplay.innerHTML = '';
        let images = this.folders[folderName];

        // Handle empty folder
        if (!images || images.length === 0) {
            imageDisplay.textContent = 'No images in this folder.';
            imageDisplay.classList.add('empty-gallery-message');
            this.hideLoading(imageDisplay);
            return;
        }
        imageDisplay.classList.remove('empty-gallery-message');

        // Filter images by search text
        let filteredImages = images;
        if (this.searchText) {
            const searchTerm = this.searchText.toLowerCase();
            filteredImages = images.filter(imageInfo => 
                imageInfo.name.toLowerCase().includes(searchTerm) ||
                (imageInfo.metadata && JSON.stringify(imageInfo.metadata).toLowerCase().includes(searchTerm))
            );
        }

        // Apply current filters
        if (this.activeFilters && Object.keys(this.activeFilters).length > 0) {
            filteredImages = this.applyFilters(filteredImages, this.activeFilters);
        }

        // Handle no search results
        if (filteredImages.length === 0) {
            const message = this.searchText ? 
                'No images found for your search.' : 
                'No images match the current filters.';
            imageDisplay.textContent = message;
            imageDisplay.classList.add('empty-gallery-message');
            this.hideLoading(imageDisplay);
            return;
        }
        imageDisplay.classList.remove('empty-gallery-message');

        // Sort images
        filteredImages = this.sortImagesArray(filteredImages, this.currentSort);

        // Store filtered images for pagination
        this.filteredImages = filteredImages;
        this.currentPage = 0;
        this.imagesPerPage = this.calculateImagesPerPage(imageDisplay);

        // Create UI for images using virtual scrolling
        this.renderImageBatch(imageDisplay);
        this.hideLoading(imageDisplay);
        
        // Add scroll listener for infinite scrolling
        this.setupInfiniteScroll(imageDisplay);
    }, 0);
}

function showLoading(container) {
    // Remove any existing loading overlay
    this.hideLoading(container);
    
    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.classList.add('loading-overlay');
    overlay.innerHTML = '<div class="spinner"></div>';
    container.appendChild(overlay);
    container.style.position = 'relative';
}

function hideLoading(container) {
    const existingOverlay = container.querySelector('.loading-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
}

function calculateImagesPerPage(container) {
    // Calculate number of images to load based on container size
    // This is a rough estimate based on typical grid dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const itemWidth = 250; // from CSS
    const itemHeight = 300; // from CSS
    const columns = Math.floor(containerWidth / itemWidth) || 1;
    const rows = Math.ceil(containerHeight / itemHeight) * 3; // Load 3x viewport height
    return columns * rows;
}

function renderImageBatch(container) {
    if (!this.filteredImages || this.filteredImages.length === 0) return;
    
    const startIndex = this.currentPage * this.imagesPerPage;
    const endIndex = Math.min(startIndex + this.imagesPerPage, this.filteredImages.length);
    const imagesToRender = this.filteredImages.slice(startIndex, endIndex);
    
    let lastDate = this.getLastDateFromContainer(container);
    
    // Create fragment to reduce DOM operations
    const fragment = document.createDocumentFragment();
    
    imagesToRender.forEach(imageInfo => {
        // Add date separators for chronological sorting
        const imageDate = (this.currentSort === "newest" || this.currentSort === "oldest") ? 
            imageInfo.date?.split(" ")[0] : null;
        if (imageDate && imageDate !== lastDate) {
            const dateSeparator = document.createElement('div');
            dateSeparator.classList.add('date-separator');
            dateSeparator.textContent = imageDate;
            fragment.appendChild(dateSeparator);
            lastDate = imageDate;
        }

        // Create image card with enhanced actions
        const card = this.createImageCard(imageInfo);
        fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
    
    // Setup lazy loading for new images
    this.setupLazyLoading(container);
    
    // Update current page
    this.currentPage++;
}

function getLastDateFromContainer(container) {
    const dateSeparators = container.querySelectorAll('.date-separator');
    if (dateSeparators.length > 0) {
        return dateSeparators[dateSeparators.length - 1].textContent;
    }
    return null;
}

function createImageCard(imageInfo) {
    const gallery = this;
    
    // Create image card
    const card = document.createElement('div');
    card.classList.add('image-card');
    card.dataset.imageName = imageInfo.name;

    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container-inner');

    // Image element with lazy loading
    const imageElement = document.createElement('img');
    imageElement.alt = imageInfo.name;
    imageElement.dataset.src = imageInfo.url;
    imageElement.classList.add('gallery-image');

    // Handle broken images
    imageElement.onerror = () => {
        imageElement.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z' fill='%23c0392b'/%3E%3C/svg%3E";
    };
    
    // Show fullscreen on click
    imageElement.onclick = () => gallery.showFullscreenImage(imageInfo.url, imageInfo);

    imageContainer.appendChild(imageElement);

    // Create overlay with filename
    const overlay = document.createElement('div');
    overlay.classList.add('card-overlay');

    const imageName = document.createElement('span');
    imageName.classList.add('image-name');
    imageName.textContent = imageInfo.name;
    overlay.appendChild(imageName);

    imageContainer.appendChild(overlay);
    
    // Add image action buttons
    const actionsContainer = document.createElement('div');
    actionsContainer.classList.add('image-actions');
    
    // Info button
    const infoButton = document.createElement('button');
    infoButton.classList.add('action-button');
    infoButton.innerHTML = '<i class="material-icons">info</i>';
    infoButton.title = "View image information";
    infoButton.onclick = (event) => {
        event.stopPropagation();
        gallery.showInfoWindow(imageInfo.metadata, imageInfo.url, imageInfo);
    };
    actionsContainer.appendChild(infoButton);
    
    // Favorite button
    const favoriteButton = document.createElement('button');
    favoriteButton.classList.add('action-button');
    const isFavorite = gallery.favorites && gallery.favorites.includes(imageInfo.url);
    favoriteButton.innerHTML = `<i class="material-icons">${isFavorite ? 'favorite' : 'favorite_border'}</i>`;
    favoriteButton.title = isFavorite ? "Remove from favorites" : "Add to favorites";
    favoriteButton.onclick = (event) => {
        event.stopPropagation();
        gallery.toggleFavorite(imageInfo.url, favoriteButton);
    };
    actionsContainer.appendChild(favoriteButton);
    
    // Collection button
    const collectionButton = document.createElement('button');
    collectionButton.classList.add('action-button');
    collectionButton.innerHTML = '<i class="material-icons">collections</i>';
    collectionButton.title = "Add to collection";
    collectionButton.onclick = (event) => {
        event.stopPropagation();
        gallery.showCollections(imageInfo);
    };
    actionsContainer.appendChild(collectionButton);
    
    imageContainer.appendChild(actionsContainer);
    card.appendChild(imageContainer);
    
    return card;
}

function setupInfiniteScroll(container) {
    // Remove existing scroll listener
    if (this.scrollListener) {
        container.removeEventListener('scroll', this.scrollListener);
    }
    
    // Create new scroll listener
    this.scrollListener = () => {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 200) {
            // User is near the bottom, load more images if available
            if (this.filteredImages && 
                this.currentPage * this.imagesPerPage < this.filteredImages.length) {
                this.renderImageBatch(container);
            }
        }
    };
    
    // Add scroll listener
    container.addEventListener('scroll', this.scrollListener);
}

function setupLazyLoading(container) {
    // Cleanup previous observer if it exists
    if (this.imageObserver) {
        this.imageObserver.disconnect();
    }
    
    // Create new IntersectionObserver with increased margin for better preloading
    this.imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    delete img.dataset.src;
                    observer.unobserve(img);
                }
            }
        });
    }, { rootMargin: '200px' });

    // Observe all images that have data-src attribute
    container.querySelectorAll('img[data-src]').forEach(img => {
        this.imageObserver.observe(img);
    });
}

function sortImages(sortType) {
    if (this.currentSort === sortType) return;

    this.currentSort = sortType;
    this.sortButtons.forEach(button => {
        button.classList.remove('active-sort');
        if (button.textContent.toLowerCase().includes(sortType.replace("_asc"," ↑").replace("_desc"," ↓"))) {
            button.classList.add('active-sort');
        }
    });

    if (this.currentFolder) {
        this.loadFolderImages(this.currentFolder);
    }
}

function sortImagesArray(images, sortType) {
    if (!images) return [];
    
    const sortedImages = [...images];

    switch (sortType) {
        case 'newest':
            sortedImages.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            break;
        case 'oldest':
            sortedImages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
            break;
        case 'name_asc':
            sortedImages.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name_desc':
            sortedImages.sort((a, b) => b.name.localeCompare(a.name));
            break;
    }
    return sortedImages;
}

function applyFilters(images, filters) {
    return images.filter(image => {
        // Skip images without metadata
        if (!image.metadata) return false;
        
        // Check each filter
        for (const [key, values] of Object.entries(filters)) {
            // Skip empty filter sets
            if (!values || values.length === 0) continue;
            
            // Get the value from metadata using path
            const parts = key.split('.');
            let value = image.metadata;
            for (const part of parts) {
                if (value && value[part] !== undefined) {
                    value = value[part];
                } else {
                    value = undefined;
                    break;
                }
            }
            
            // If value doesn't exist or doesn't match any filter value, image fails
            if (value === undefined || !values.includes(String(value))) {
                return false;
            }
        }
        
        // Image passed all filters
        return true;
    });
}

// Toggle favorite status of an image
function toggleFavorite(imageUrl, button) {
    // Initialize favorites array if it doesn't exist
    if (!this.favorites) {
        this.favorites = [];
    }
    
    const isFavorite = this.favorites.includes(imageUrl);
    
    if (isFavorite) {
        // Remove from favorites
        this.favorites = this.favorites.filter(url => url !== imageUrl);
        button.innerHTML = '<i class="material-icons">favorite_border</i>';
        button.title = "Add to favorites";
        this.showToast('Removed from favorites', 'info');
    } else {
        // Add to favorites
        this.favorites.push(imageUrl);
        button.innerHTML = '<i class="material-icons">favorite</i>';
        button.title = "Remove from favorites";
        this.showToast('Added to favorites', 'success');
    }
    
    // Save favorites to localStorage
    localStorage.setItem('comfyui-gallery-favorites', JSON.stringify(this.favorites));
}

// Load favorites from localStorage
function loadFavorites() {
    try {
        const favorites = localStorage.getItem('comfyui-gallery-favorites');
        this.favorites = favorites ? JSON.parse(favorites) : [];
    } catch (error) {
        console.error('Error loading favorites:', error);
        this.favorites = [];
    }
}

export {
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
    getLastDateFromContainer
};