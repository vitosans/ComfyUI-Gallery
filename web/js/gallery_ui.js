import { app } from "../../scripts/app.js";

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
        this.fullscreenContainer = null; // Container for fullscreen image/info
        this.fullscreenImage = null;
        this.infoWindow = null;
        this.rawMetadataWindow = null;

        this.init();
    }

    init() {
        this.createButton();
        this.createPopup();
        this.applyStyles();
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

    createPopup() {
        if (!this.galleryPopup) {
            this.galleryPopup = document.createElement('div');
            this.galleryPopup.classList.add('gallery-popup');
            this.galleryPopup.style.display = 'none';

            const popupContent = document.createElement('div');
            popupContent.classList.add('popup-content');

            const header = document.createElement('div');
            header.classList.add('popup-header');

            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.classList.add('close-button');
            closeButton.addEventListener('click', () => this.closeGallery());
            header.appendChild(closeButton);

            const searchContainer = document.createElement('div');
            searchContainer.classList.add('search-container');

            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Search...';
            searchInput.classList.add('search-input');
            searchInput.addEventListener('input', (event) => {
                this.searchText = event.target.value;
                this.loadFolderImages(this.currentFolder);
            });
            searchContainer.appendChild(searchInput);

            const clearSearchButton = document.createElement('button');
            clearSearchButton.textContent = '✕';
            clearSearchButton.classList.add('clear-search-button');
            clearSearchButton.addEventListener('click', () => {
                this.searchText = "";
                searchInput.value = "";
                this.loadFolderImages(this.currentFolder);
            });
            searchContainer.appendChild(clearSearchButton);
            header.appendChild(searchContainer);


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
                if (option.value === this.currentSort) {
                    button.classList.add('active-sort');
                }
                button.addEventListener('click', () => this.sortImages(option.value));
                sortDiv.appendChild(button);
                this.sortButtons.push(button);
            });
            header.appendChild(sortDiv);
            popupContent.appendChild(header);


            const mainContent = document.createElement('div');
            mainContent.classList.add('popup-main-content');

            const folderNavigation = document.createElement('div');
            folderNavigation.classList.add('folder-navigation');
            mainContent.appendChild(folderNavigation);

            const imageDisplay = document.createElement('div');
            imageDisplay.classList.add('image-display');
            mainContent.appendChild(imageDisplay);

            popupContent.appendChild(mainContent);
            this.galleryPopup.appendChild(popupContent);
            document.body.appendChild(this.galleryPopup);
            this.populateFolderNavigation(folderNavigation);
            this.createFullscreenContainer(); // Create fullscreen container (now for both image and info)
            this.createInfoWindow(); // Create info window container
            this.createRawMetadataWindow(); // Create raw metadata window

            this.galleryPopup.addEventListener('click', (event) => {
                if (event.target === this.galleryPopup) {
                    this.closeGallery();
                }
            });
        }
    }

    createFullscreenContainer() {
        // Container to hold both fullscreen image and info window
        this.fullscreenContainer = document.createElement('div');
        this.fullscreenContainer.classList.add('fullscreen-container');
        this.fullscreenContainer.style.display = 'none';

        this.galleryPopup.appendChild(this.fullscreenContainer);

        this.fullscreenContainer.addEventListener('click', (event) => {
            if (event.target === this.fullscreenContainer) {
                this.closeFullscreenView(); // Close any fullscreen view (image or info)
            }
        });
    }

    createInfoWindow() {
        // Info window container (will be appended to fullscreenContainer)
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

        this.fullscreenContainer.appendChild(this.infoWindow); // Append to fullscreen container
    }

    createRawMetadataWindow() {
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
        this.fullscreenContainer.appendChild(this.rawMetadataWindow); // Append to fullscreen container
    }


    populateFolderNavigation(navElement) {
        if (!navElement) return;
        navElement.innerHTML = '';

        let folderNames = Object.keys(this.folders);
        if (folderNames.length === 0) {
            navElement.textContent = 'No folders available.';
            return;
        }

        folderNames.sort((a, b) => {
            const aParts = a.split('/');
            const bParts = b.split('/');
            for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
                if (aParts[i] < bParts[i]) return -1;
                if (aParts[i] > bParts[i]) return 1;
            }
            return aParts.length - bParts.length;
        });

        folderNames.forEach(folderName => {
            const folderButton = document.createElement('button');
            folderButton.textContent = folderName;
            folderButton.classList.add('folder-button');
            folderButton.addEventListener('click', () => this.loadFolderImages(folderName));
            if (folderName === this.currentFolder) {
                folderButton.classList.add('active-folder');
            } else {
                folderButton.classList.remove('active-folder');
            }
            navElement.appendChild(folderButton);
        });

        if (folderNames.length > 0) {
            this.loadFolderImages( this.currentFolder || folderNames[0] );
        }
    }

    loadFolderImages(folderName) {
        if (!folderName) return;

        this.currentFolder = folderName;

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

        if (!images || images.length === 0) {
            imageDisplay.textContent = 'No images in this folder.';
            imageDisplay.classList.add('empty-gallery-message');
            return;
        }
        imageDisplay.classList.remove('empty-gallery-message');

        let filteredImages = images;
        if (this.searchText) {
            const searchTerm = this.searchText.toLowerCase();
            filteredImages = images.filter(imageInfo =>
                imageInfo.name.toLowerCase().includes(searchTerm)
            );
        }

        // Handle no images after filtering
        if (filteredImages.length === 0 && this.searchText) {
            imageDisplay.textContent = 'No images found for your search.';
            imageDisplay.classList.add('empty-gallery-message');
            return;
        }
        imageDisplay.classList.remove('empty-gallery-message'); // Ensure it's removed if there are images


        filteredImages = this.sortImagesArray(filteredImages, this.currentSort);

        let lastDate = null;
        filteredImages.forEach(imageInfo => {
            const imageDate = (this.currentSort === "newest" || this.currentSort === "oldest") ? imageInfo.date.split(" ")[0] : null;
            if (imageDate && imageDate !== lastDate) {
                const dateSeparator = document.createElement('div');
                dateSeparator.classList.add('date-separator');
                dateSeparator.textContent = imageDate;
                imageDisplay.appendChild(dateSeparator);
                lastDate = imageDate;
            }


            const card = document.createElement('div');
            card.classList.add('image-card');

            const imageContainer = document.createElement('div');
            imageContainer.classList.add('image-container-inner');

            const imageElement = document.createElement('img');
            imageElement.alt = imageInfo.name;
            imageElement.dataset.src = imageInfo.url;
            imageElement.classList.add('gallery-image');

            imageElement.onerror = () => {
                imageElement.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z' fill='%23c0392b'/%3E%3C/svg%3E";
            };
            imageElement.onclick = () => this.showFullscreenImage(imageInfo.url); // Show just image initially

            imageContainer.appendChild(imageElement);

            const overlay = document.createElement('div');
            overlay.classList.add('card-overlay');

            const imageName = document.createElement('span');
            imageName.classList.add('image-name');
            imageName.textContent = imageInfo.name;
            overlay.appendChild(imageName);

            const infoButton = document.createElement('button'); // Info button added
            infoButton.classList.add('info-button');
            infoButton.textContent = 'Info';
            infoButton.onclick = (event) => {
                event.stopPropagation(); // Prevent card click event
                this.showInfoWindow(imageInfo.metadata, imageInfo.url); // Pass metadata and URL
            };
            overlay.appendChild(infoButton);


            imageContainer.appendChild(overlay);
            card.appendChild(imageContainer);
            imageDisplay.appendChild(card);
        });

        this.setupLazyLoading(imageDisplay);

    }


    showFullscreenImage(imageUrl) {
        // Display only the image in fullscreen
        this.fullscreenContainer.innerHTML = ''; // Clear previous content
        this.fullscreenContainer.style.display = 'flex';

        const closeButton = document.createElement('span');
        closeButton.classList.add('fullscreen-close');
        closeButton.innerHTML = '×';
        closeButton.onclick = () => this.closeFullscreenView();
        this.fullscreenContainer.appendChild(closeButton);

        this.fullscreenImage = document.createElement('img');
        this.fullscreenImage.classList.add('fullscreen-image');
        this.fullscreenImage.src = imageUrl;
        this.fullscreenContainer.appendChild(this.fullscreenImage);


        this.infoWindow.style.display = 'none'; // Ensure info window is hidden
        this.rawMetadataWindow.style.display = 'none'; // Ensure raw metadata window is hidden
        this.galleryPopup.style.zIndex = '1001';
    }

    showInfoWindow(metadata, imageUrl) {
        // Display info window in fullscreen
        this.fullscreenContainer.innerHTML = ''; // Clear previous content
        this.fullscreenContainer.style.display = 'flex';

        const closeButton = document.createElement('span');
        closeButton.classList.add('info-close');
        closeButton.innerHTML = '×';
        closeButton.onclick = () => this.closeFullscreenView();
        this.fullscreenContainer.appendChild(closeButton);

        const infoContent = document.createElement('div');
        infoContent.classList.add('info-content');
        this.fullscreenContainer.appendChild(infoContent);


        this.populateInfoWindowContent(infoContent, metadata, imageUrl);

        this.infoWindow.style.display = 'block';
        this.rawMetadataWindow.style.display = 'none'; // Ensure raw metadata window is hidden
        this.fullscreenImage = null; // Clear fullscreen image if it was displayed
        this.galleryPopup.style.zIndex = '1001';
    }

    populateInfoWindowContent(infoContent, metadata, imageUrl) {
        infoContent.innerHTML = ''; // Clear existing content

        // Image Preview in Info Window
        const previewImage = document.createElement('img');
        previewImage.src = imageUrl;
        previewImage.classList.add('info-preview-image');
        infoContent.appendChild(previewImage);

        const metadataTable = document.createElement('div');
        metadataTable.classList.add('metadata-table');
        infoContent.appendChild(metadataTable);

        const addMetadataRow = (label, value) => {
            const row = document.createElement('div');
            row.classList.add('metadata-row');

            const labelSpan = document.createElement('span');
            labelSpan.classList.add('metadata-label');
            labelSpan.textContent = label + ":";
            row.appendChild(labelSpan);

            const valueSpan = document.createElement('span');
            valueSpan.classList.add('metadata-value');
            valueSpan.textContent = value || 'N/A'; // Placeholder if value is missing
            row.appendChild(valueSpan);

            metadataTable.appendChild(row);
        };


        addMetadataRow("Filename", metadata.fileinfo?.filename);
        addMetadataRow("Resolution", metadata.fileinfo?.resolution);
        addMetadataRow("File Size", metadata.fileinfo?.size);
        addMetadataRow("Date Created", metadata.fileinfo?.date);
        addMetadataRow("Model", metadata.prompt?.['1']?.inputs?.ckpt_name || metadata.prompt?.['1']?.inputs?.ckpt_name?.content); // Example path, adjust based on actual metadata structure
        addMetadataRow("Positive Prompt", metadata.prompt?.['2']?.inputs?.prompt || metadata.prompt?.['7']?.inputs?.text); // Example path, adjust
        addMetadataRow("Negative Prompt", metadata.prompt?.['3']?.inputs?.prompt || metadata.prompt?.['8']?.inputs?.text); // Example path, adjust
        addMetadataRow("Sampler", metadata.prompt?.['10']?.inputs?.sampler_name); // Example path, adjust
        addMetadataRow("Scheduler", metadata.prompt?.['10']?.inputs?.scheduler); // Example path, adjust
        addMetadataRow("Steps", metadata.prompt?.['10']?.inputs?.steps); // Example path, adjust
        addMetadataRow("CFG Scale", metadata.prompt?.['10']?.inputs?.cfg); // Example path, adjust
        addMetadataRow("Seed", metadata.prompt?.['10']?.inputs?.seed); // Example path, adjust

        // LoRAs - this is a simplified example, adjust based on actual metadata structure
        let loras = [];
        for (const key in metadata.prompt) {
            if (metadata.prompt[key].class_type === 'LoraLoader') {
                loras.push(metadata.prompt[key].inputs.lora_name);
            } else if (metadata.prompt[key].class_type === 'Power Lora Loader (rgthree)') {
                for (let loraKey in metadata.prompt[key].inputs) {
                    if (loraKey.startsWith('lora_') && metadata.prompt[key].inputs[loraKey].on) {
                        loras.push(metadata.prompt[key].inputs[loraKey].lora);
                    }
                }
            }
        }
        addMetadataRow("LoRAs", loras.length > 0 ? loras.join(', ') : 'N/A');


        // Button to show raw metadata
        const rawMetadataButton = document.createElement('button');
        rawMetadataButton.textContent = 'Show Raw Metadata';
        rawMetadataButton.classList.add('raw-metadata-button');
        rawMetadataButton.onclick = (event) => {
            event.stopPropagation();
            this.showRawMetadataWindow(metadata);
        };
        infoContent.appendChild(rawMetadataButton);

    }

    showRawMetadataWindow(metadata) {
        this.fullscreenContainer.innerHTML = ''; // Clear previous content
        this.fullscreenContainer.style.display = 'flex';

        const closeButton = document.createElement('span');
        closeButton.classList.add('raw-metadata-close');
        closeButton.innerHTML = '×';
        closeButton.onclick = () => this.closeFullscreenView();
        this.fullscreenContainer.appendChild(closeButton);

        const metadataContent = document.createElement('div');
        metadataContent.classList.add('raw-metadata-content');
        this.fullscreenContainer.appendChild(metadataContent);


        const metadataTextarea = document.createElement('textarea');
        metadataTextarea.value = JSON.stringify(metadata, null, 2);
        metadataContent.appendChild(metadataTextarea);

        this.rawMetadataWindow.style.display = 'block';
        this.infoWindow.style.display = 'none'; // Ensure info window is hidden
        this.fullscreenImage = null; // Clear fullscreen image if it was displayed

        this.galleryPopup.style.zIndex = '1001';
    }

    closeInfoWindow() {
        this.infoWindow.style.display = 'none';
        this.closeFullscreenView();
    }

    closeRawMetadataWindow() {
        this.rawMetadataWindow.style.display = 'none';
        this.closeFullscreenView();
    }


    closeFullscreenView() {
        // Close any fullscreen view (image, info, raw metadata)
        this.fullscreenContainer.style.display = 'none';
        this.infoWindow.style.display = 'none';
        this.rawMetadataWindow.style.display = 'none';
        this.galleryPopup.style.zIndex = '1000';
    }


    setupLazyLoading(container) {
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

    sortImages(sortType) {
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

    sortImagesArray(images, sortType) {
        const sortedImages = [...images];

        if (sortType === 'newest') {
            sortedImages.sort((a, b) => b.timestamp - a.timestamp);
        } else if (sortType === 'oldest') {
            sortedImages.sort((a, b) => a.timestamp - b.timestamp);
        } else if (sortType === 'name_asc') {
            sortedImages.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortType === 'name_desc') {
            sortedImages.sort((a, b) => b.name.localeCompare(b.name));
        }
        return sortedImages;
    }
    openGallery() {

        this.galleryPopup.style.display = 'flex';

        this.populateFolderNavigation(this.galleryPopup.querySelector('.folder-navigation'));

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
            this.populateFolderNavigation(this.galleryPopup.querySelector('.folder-navigation'));
        }
    }

    updateImages(newFolders) {
        const imageDisplay = this.galleryPopup?.querySelector('.image-display');
        const scrollTop = imageDisplay ? imageDisplay.scrollTop : 0;

        this.folders = newFolders;

        if (this.galleryPopup) {
            this.populateFolderNavigation(this.galleryPopup.querySelector('.folder-navigation'));
        }

        if (imageDisplay) {
                imageDisplay.scrollTop = scrollTop;
        }

    }

    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
           /* Basic Reset */
            * { box-sizing: border-box; }

            .gallery-popup {
                display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(0, 0, 0, 0.7); z-index: 1000; justify-content: center;
                align-items: center; font-family: sans-serif;
            }
            .popup-content {
                background-color: #444; color: #ddd;
                border: 1px solid #666;
                width: 80vw;
                height: 80vh;
                max-height: 80vh;
                display: flex; flex-direction: column; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
                border-radius: 8px;
                overflow: auto;
                padding: 20px;
            }
            .popup-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #666;
            }
            .close-button {
                background-color: #c0392b; color: white; border: none; padding: 8px 12px;
                font-size: 14px; cursor: pointer; border-radius: 4px; transition: background-color 0.3s ease;
            }
            .close-button:hover { background-color: #992d22; }

            .sort-buttons { display: flex; gap: 8px; margin-left: auto;}

            .sort-button {
                background-color: #555; color: #eee; border: 1px solid #777; padding: 6px 10px;
                font-size: 13px; cursor: pointer; border-radius: 4px; transition: background-color 0.3s ease;
            }
            .sort-button:hover { background-color: #777; }
            .active-sort { background-color: #3498db; color: white; }

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
            .clear-search-button:hover{
                background-color: #777;
            }

            .popup-main-content {
                display: flex; flex-direction: row;
                height: 68vh;
            }
            .folder-navigation {
                width: 200px; padding-right: 20px; border-right: 1px solid #666; overflow-y: auto;
            }
            .folder-button {
                display: block; width: 100%; padding: 8px; margin-bottom: 6px; border: none;
                background-color: #555; color: #eee; text-align: left; cursor: pointer;
                border-radius: 4px; transition: background-color 0.3s ease; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis;
            }
            .folder-button:hover, .folder-button.active { background-color: #777; }
            .active-folder { background-color: #3498db; color: white; }

            .image-display {
                flex: 1; padding-left: 20px;
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

            .image-card:hover { transform: scale: 1.03; }

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

            /* Fullscreen Container Styles (for both image and info) */
            .fullscreen-container {
                display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(0, 0, 0, 0.9); z-index: 2000;
                justify-content: center; align-items: center;
                flex-direction: column; /* Stack close button, content */
            }

            /* Common close button style for both full image and info */
            .fullscreen-close, .info-close, .raw-metadata-close {
                position: absolute; top: 20px; right: 30px; color: #fff; font-size: 30px;
                font-weight: bold; cursor: pointer; z-index: 2001; /* Ensure above content */
            }

            /* Fullscreen Image Styles */
            .fullscreen-image { max-width: 90%; max-height: 70%; display: block; margin-top: 60px;} /* Adjusted margin */


            /* Info Window Styles */
            .info-window {
                background-color: #333; color: #eee; border-radius: 8px; padding: 20px;
                max-width: 80%; max-height: 80%; overflow-y: auto; position: relative;
                margin-top: 60px; /* Adjusted margin to accommodate close button */
            }

            .info-content {
                display: flex; flex-direction: row; align-items: flex-start; gap: 20px;
            }

            .info-preview-image {
                max-width: 400px; max-height: 400px; border-radius: 8px; display: block;
                object-fit: contain;
            }

            .metadata-table {
                flex: 1; display: flex; flex-direction: column; gap: 8px;
            }

            .metadata-row {
                display: flex; flex-direction: row; align-items: baseline;
            }

            .metadata-label {
                font-weight: bold; margin-right: 10px; flex-basis: 120px; text-align: right;
            }

            .metadata-value {
                flex: 1; word-break: break-word;
            }

            .raw-metadata-button {
                background-color: #555; color: #eee; border: 1px solid #777; padding: 8px 12px;
                font-size: 14px; cursor: pointer; border-radius: 4px; transition: background-color 0.3s ease;
                align-self: flex-start; /* Align to the start of the info-content flex container */
                margin-top: 15px; /* Add some space above the button */
            }
            .raw-metadata-button:hover { background-color: #777; }


            /* Raw Metadata Window Styles */
            .raw-metadata-window {
                display: none; position: fixed; top: 50%; left: 50%;
                background-color: #222; color: #eee; border-radius: 8px; padding: 20px;
                width: 70vw; height: 80vh; overflow: auto; z-index: 2002;
                transform: translate(-50%, -50%); box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
                flex-direction: column; /* Ensure close button stacks properly */
            }

            .raw-metadata-content {
                width: 100%; height: 100%;
            }

            .raw-metadata-content textarea {
                width: 100%; height: 100%; background-color: #444; color: #eee;
                border: none; padding: 10px; font-family: monospace; font-size: 14px;
                box-sizing: border-box; /* Important for width/height to include padding */
            }
            .raw-metadata-close {
                top: 10px; /* Adjust position for raw metadata close button */
            }


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

             @media (max-width: 768px) {
                .popup-content { width: 95%; margin: 5% auto; }
                .popup-main-content { flex-direction: column; }
                .folder-navigation {
                    width: 100%; border-right: none; border-bottom: 1px solid #ddd;
                    margin-bottom: 15px;
                    max-height: 120px;
                    overflow-x: auto;
                    overflow-y: auto;
                    white-space: nowrap;
                }
                .folder-button{ display: inline-block; width: auto; }
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
                 .clear-search-button{
                    margin-right: 0px;
                }
                /* Adjustments for info window on smaller screens if needed */
                .info-content { flex-direction: column; align-items: center; }
                .info-preview-image { max-width: 90%; max-height: 300px; } /* Smaller preview image */
                .metadata-table { width: 90%; } /* Adjust table width */
                .metadata-label { text-align: left; flex-basis: auto; margin-right: 5px; } /* Left-align labels */

            }

            .gallery-button {
                background-color: #3498db; color: white; border: none;
                padding: 5px 10px; font-size: 14px; cursor: pointer;
                border-radius: 4px; transition: background-color 0.3s ease;
            }
            .gallery-button:hover { background-color: #2980b9; }

            .info-button {
                background-color: #3498db; color: white; border: none;
                padding: 5px 10px; font-size: 12px; cursor: pointer;
                border-radius: 4px; transition: background-color 0.3s ease;
            }
            .info-button:hover { background-color: #2980b9; }

        `;
        document.head.appendChild(style);
    }
}

app.registerExtension({
    name: "Gallery",
    init() {
        app.api.fetchApi("/Gallery/images")
            .then(response => response.text())
            .then(text => {
                try { // Added try-catch block here
                    return JSON.parse(text);
                } catch (e) {
                    console.error("Error parsing JSON response:", e);
                    return { folders: {} }; // Return empty folders to prevent further errors
                }
            })
            .then(data => {
                const menu = document.getElementsByClassName("flex gap-2 mx-2")[0]; // document.querySelector(".comfy-menu");

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

app.api.addEventListener("Gallery.file_change", (event) => {
    console.log("file_change:", event);
    if (gallery) {
        app.api.fetchApi("/Gallery/images")
            .then(response => response.text()) // Get response as text
            .then(text => JSON.parse(text)) // Parse JSON string
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