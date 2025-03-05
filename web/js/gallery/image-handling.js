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

    imageDisplay.innerHTML = '';
    let images = this.folders[folderName];

    // Handle empty folder
    if (!images || images.length === 0) {
        imageDisplay.textContent = 'No images in this folder.';
        imageDisplay.classList.add('empty-gallery-message');
        return;
    }
    imageDisplay.classList.remove('empty-gallery-message');

    // Filter images by search text
    let filteredImages = images;
    if (this.searchText) {
        const searchTerm = this.searchText.toLowerCase();
        filteredImages = images.filter(imageInfo =>
            imageInfo.name.toLowerCase().includes(searchTerm)
        );
    }

    // Handle no search results
    if (filteredImages.length === 0 && this.searchText) {
        imageDisplay.textContent = 'No images found for your search.';
        imageDisplay.classList.add('empty-gallery-message');
        return;
    }
    imageDisplay.classList.remove('empty-gallery-message');

    // Sort images
    filteredImages = this.sortImagesArray(filteredImages, this.currentSort);

    // Create UI for images
    renderImages(this, filteredImages, imageDisplay);
}

function renderImages(gallery, filteredImages, imageDisplay) {
    let lastDate = null;
    filteredImages.forEach(imageInfo => {
        // Add date separators for chronological sorting
        const imageDate = (gallery.currentSort === "newest" || gallery.currentSort === "oldest") ? 
            imageInfo.date.split(" ")[0] : null;
        if (imageDate && imageDate !== lastDate) {
            const dateSeparator = document.createElement('div');
            dateSeparator.classList.add('date-separator');
            dateSeparator.textContent = imageDate;
            imageDisplay.appendChild(dateSeparator);
            lastDate = imageDate;
        }

        // Create image card
        const card = document.createElement('div');
        card.classList.add('image-card');

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
        imageElement.onclick = () => gallery.showFullscreenImage(imageInfo.url);

        imageContainer.appendChild(imageElement);

        // Create overlay with filename and info button
        const overlay = document.createElement('div');
        overlay.classList.add('card-overlay');

        const imageName = document.createElement('span');
        imageName.classList.add('image-name');
        imageName.textContent = imageInfo.name;
        overlay.appendChild(imageName);

        const infoButton = document.createElement('button');
        infoButton.classList.add('info-button');
        infoButton.textContent = 'Info';
        infoButton.onclick = (event) => {
            event.stopPropagation();
            gallery.showInfoWindow(imageInfo.metadata, imageInfo.url);
        };
        overlay.appendChild(infoButton);

        imageContainer.appendChild(overlay);
        card.appendChild(imageContainer);
        imageDisplay.appendChild(card);
    });

    // Setup lazy loading for images
    gallery.setupLazyLoading(imageDisplay);
}

function setupLazyLoading(container) {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '100px' });

    container.querySelectorAll('img').forEach(img => observer.observe(img));
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
    const sortedImages = [...images];

    if (sortType === 'newest') {
        sortedImages.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortType === 'oldest') {
        sortedImages.sort((a, b) => a.timestamp - b.timestamp);
    } else if (sortType === 'name_asc') {
        sortedImages.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === 'name_desc') {
        sortedImages.sort((a, b) => b.name.localeCompare(a.name));
    }
    return sortedImages;
}

export {
    populateFolderNavigation,
    loadFolderImages,
    setupLazyLoading,
    sortImages,
    sortImagesArray
};