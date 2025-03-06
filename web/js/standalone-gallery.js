/**
 * Standalone Gallery Implementation
 * This is a simplified version of the gallery that works without dependencies
 */

// Self-executing function to create standalone gallery
(function() {
    // Gallery class for standalone use
    class StandaloneGallery {
        constructor(options) {
            this.openButtonBox = options.openButtonBox || document.body;
            this.folders = options.folders || {};
            this.galleryButton = null;
            this.galleryPopup = null;
            this.currentFolder = null;
            
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
                this.galleryButton.classList.add('gallery-standalone-button');
                this.galleryButton.addEventListener('click', () => this.openGallery());
                this.openButtonBox.appendChild(this.galleryButton);
            }
        }
        
        createPopup() {
            if (!this.galleryPopup) {
                this.galleryPopup = document.createElement('div');
                this.galleryPopup.classList.add('gallery-standalone-popup');
                this.galleryPopup.style.display = 'none';
                
                const popupContent = document.createElement('div');
                popupContent.classList.add('popup-content');
                
                // Create header
                const header = document.createElement('div');
                header.classList.add('popup-header');
                
                const closeButton = document.createElement('button');
                closeButton.textContent = 'Close';
                closeButton.classList.add('close-button');
                closeButton.addEventListener('click', () => this.closeGallery());
                header.appendChild(closeButton);
                
                const title = document.createElement('h2');
                title.textContent = 'ComfyUI Gallery';
                title.classList.add('gallery-title');
                header.appendChild(title);
                
                popupContent.appendChild(header);
                
                // Create main content area
                const mainContent = document.createElement('div');
                mainContent.classList.add('popup-main-content');
                
                const folderNavigation = document.createElement('div');
                folderNavigation.classList.add('folder-navigation');
                mainContent.appendChild(folderNavigation);
                
                const imageDisplay = document.createElement('div');
                imageDisplay.classList.add('image-display');
                imageDisplay.innerHTML = '<div class="empty-message">No images available. Make sure server is running and Gallery endpoint is accessible.</div>';
                mainContent.appendChild(imageDisplay);
                
                popupContent.appendChild(mainContent);
                this.galleryPopup.appendChild(popupContent);
                document.body.appendChild(this.galleryPopup);
                
                // Close when clicking outside
                this.galleryPopup.addEventListener('click', (event) => {
                    if (event.target === this.galleryPopup) {
                        this.closeGallery();
                    }
                });
            }
        }
        
        openGallery() {
            this.galleryPopup.style.display = 'flex';
            
            // Try to fetch images
            this.fetchImages();
        }
        
        closeGallery() {
            this.galleryPopup.style.display = 'none';
        }
        
        fetchImages() {
            const imageDisplay = this.galleryPopup.querySelector('.image-display');
            if (!imageDisplay) return;
            
            imageDisplay.innerHTML = '<div class="loading-message">Loading images...</div>';
            
            // Try different endpoints
            const endpoints = [
                '/Gallery/images',
                './Gallery/images',
                '../Gallery/images',
                'Gallery/images'
            ];
            
            let fetched = false;
            
            const tryFetch = (index) => {
                if (index >= endpoints.length) {
                    if (!fetched) {
                        imageDisplay.innerHTML = '<div class="error-message">Failed to load images. API endpoint not available.</div>';
                    }
                    return;
                }
                
                const endpoint = endpoints[index];
                
                fetch(endpoint)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        fetched = true;
                        this.folders = data.folders || {};
                        this.populateFolderNavigation();
                        
                        // Load first folder
                        const folderNames = Object.keys(this.folders);
                        if (folderNames.length > 0) {
                            this.loadFolderImages(folderNames[0]);
                        } else {
                            imageDisplay.innerHTML = '<div class="empty-message">No images found.</div>';
                        }
                    })
                    .catch(error => {
                        console.warn(`Error fetching from ${endpoint}:`, error);
                        // Try next endpoint
                        tryFetch(index + 1);
                    });
            };
            
            tryFetch(0);
        }
        
        populateFolderNavigation() {
            const navElement = this.galleryPopup.querySelector('.folder-navigation');
            if (!navElement) return;
            
            navElement.innerHTML = '';
            
            const folderNames = Object.keys(this.folders);
            if (folderNames.length === 0) {
                navElement.innerHTML = '<div class="empty-message">No folders available.</div>';
                return;
            }
            
            folderNames.sort();
            
            folderNames.forEach(folderName => {
                const folderButton = document.createElement('button');
                folderButton.textContent = folderName;
                folderButton.classList.add('folder-button');
                if (folderName === this.currentFolder) {
                    folderButton.classList.add('active-folder');
                }
                folderButton.addEventListener('click', () => this.loadFolderImages(folderName));
                navElement.appendChild(folderButton);
            });
        }
        
        loadFolderImages(folderName) {
            if (!folderName) return;
            
            this.currentFolder = folderName;
            
            // Update active folder button
            const folderButtons = this.galleryPopup.querySelectorAll('.folder-button');
            folderButtons.forEach(button => {
                button.classList.toggle('active-folder', button.textContent === folderName);
            });
            
            const imageDisplay = this.galleryPopup.querySelector('.image-display');
            if (!imageDisplay) return;
            
            imageDisplay.innerHTML = '';
            
            const folderContent = this.folders[folderName];
            if (!folderContent || Object.keys(folderContent).length === 0) {
                imageDisplay.innerHTML = '<div class="empty-message">No images in this folder.</div>';
                return;
            }
            
            // Convert folder content to array for easier manipulation
            const images = Object.values(folderContent);
            
            // Sort by timestamp (newest first)
            images.sort((a, b) => b.timestamp - a.timestamp);
            
            // Create image grid
            const imageGrid = document.createElement('div');
            imageGrid.classList.add('image-grid');
            
            // Add images to grid
            images.forEach(imageInfo => {
                this.createImageCard(imageGrid, imageInfo);
            });
            
            imageDisplay.appendChild(imageGrid);
        }
        
        createImageCard(container, imageInfo) {
            const card = document.createElement('div');
            card.classList.add('image-card');
            
            // Image container
            const imageContainer = document.createElement('div');
            imageContainer.classList.add('image-container');
            
            // Handle different file types
            if (imageInfo.url.endsWith('.mp4') || imageInfo.name.endsWith('.mp4')) {
                const video = document.createElement('video');
                video.src = imageInfo.url;
                video.alt = imageInfo.name;
                video.title = imageInfo.name;
                video.controls = true;
                video.classList.add('gallery-image');
                imageContainer.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = imageInfo.url;
                img.alt = imageInfo.name;
                img.title = imageInfo.name;
                img.classList.add('gallery-image');
                img.onerror = () => {
                    img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z' fill='%23c0392b'/%3E%3C/svg%3E";
                };
                img.addEventListener('click', () => this.showFullscreenImage(imageInfo));
                imageContainer.appendChild(img);
            }
            
            // Image info
            const infoOverlay = document.createElement('div');
            infoOverlay.classList.add('image-info');
            
            const imageName = document.createElement('div');
            imageName.classList.add('image-name');
            imageName.textContent = imageInfo.name;
            infoOverlay.appendChild(imageName);
            
            if (imageInfo.metadata) {
                const infoButton = document.createElement('button');
                infoButton.textContent = 'Info';
                infoButton.classList.add('info-button');
                infoButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showImageInfo(imageInfo);
                });
                infoOverlay.appendChild(infoButton);
            }
            
            imageContainer.appendChild(infoOverlay);
            card.appendChild(imageContainer);
            container.appendChild(card);
        }
        
        showFullscreenImage(imageInfo) {
            // Create fullscreen container if it doesn't exist
            let fullscreenContainer = document.getElementById('gallery-fullscreen-container');
            if (!fullscreenContainer) {
                fullscreenContainer = document.createElement('div');
                fullscreenContainer.id = 'gallery-fullscreen-container';
                fullscreenContainer.classList.add('fullscreen-container');
                
                // Close on background click
                fullscreenContainer.addEventListener('click', (e) => {
                    if (e.target === fullscreenContainer) {
                        fullscreenContainer.style.display = 'none';
                    }
                });
                
                document.body.appendChild(fullscreenContainer);
            }
            
            // Clear and show container
            fullscreenContainer.innerHTML = '';
            fullscreenContainer.style.display = 'flex';
            
            // Close button
            const closeButton = document.createElement('button');
            closeButton.classList.add('fullscreen-close');
            closeButton.innerHTML = '×';
            closeButton.addEventListener('click', () => {
                fullscreenContainer.style.display = 'none';
            });
            fullscreenContainer.appendChild(closeButton);
            
            // Image
            const img = document.createElement('img');
            img.src = imageInfo.url;
            img.alt = imageInfo.name;
            img.classList.add('fullscreen-image');
            fullscreenContainer.appendChild(img);
            
            // Info button
            if (imageInfo.metadata) {
                const infoButton = document.createElement('button');
                infoButton.textContent = 'View Info';
                infoButton.classList.add('fullscreen-info-button');
                infoButton.addEventListener('click', () => {
                    this.showImageInfo(imageInfo);
                });
                fullscreenContainer.appendChild(infoButton);
            }
        }
        
        showImageInfo(imageInfo) {
            // Create info container if it doesn't exist
            let infoContainer = document.getElementById('gallery-info-container');
            if (!infoContainer) {
                infoContainer = document.createElement('div');
                infoContainer.id = 'gallery-info-container';
                infoContainer.classList.add('info-container');
                
                // Close on background click
                infoContainer.addEventListener('click', (e) => {
                    if (e.target === infoContainer) {
                        infoContainer.style.display = 'none';
                    }
                });
                
                document.body.appendChild(infoContainer);
            }
            
            // Clear and show container
            infoContainer.innerHTML = '';
            infoContainer.style.display = 'flex';
            
            // Create content
            const content = document.createElement('div');
            content.classList.add('info-content');
            
            // Close button
            const closeButton = document.createElement('button');
            closeButton.classList.add('info-close');
            closeButton.innerHTML = '×';
            closeButton.addEventListener('click', () => {
                infoContainer.style.display = 'none';
            });
            content.appendChild(closeButton);
            
            // Title
            const title = document.createElement('h2');
            title.textContent = 'Image Information';
            content.appendChild(title);
            
            // Image preview
            const preview = document.createElement('img');
            preview.src = imageInfo.url;
            preview.alt = imageInfo.name;
            preview.classList.add('info-preview');
            content.appendChild(preview);
            
            // Metadata
            const metadata = imageInfo.metadata;
            
            // Create metadata table
            const table = document.createElement('div');
            table.classList.add('metadata-table');
            
            // Helper to add metadata row
            const addRow = (label, value) => {
                if (!value) return;
                
                const row = document.createElement('div');
                row.classList.add('metadata-row');
                
                const labelEl = document.createElement('div');
                labelEl.classList.add('metadata-label');
                labelEl.textContent = label + ':';
                row.appendChild(labelEl);
                
                const valueEl = document.createElement('div');
                valueEl.classList.add('metadata-value');
                valueEl.textContent = value;
                row.appendChild(valueEl);
                
                table.appendChild(row);
            };
            
            // Basic file info
            addRow('Filename', imageInfo.name);
            addRow('Date', imageInfo.date);
            
            // Try to extract metadata from different structures
            if (metadata) {
                // Extract model
                let model = '';
                if (metadata.model) {
                    model = metadata.model;
                } else if (metadata.prompt) {
                    // Look for checkpoint loader nodes
                    for (const key in metadata.prompt) {
                        const node = metadata.prompt[key];
                        if (node.class_type === 'CheckpointLoaderSimple' && node.inputs?.ckpt_name) {
                            model = node.inputs.ckpt_name;
                            break;
                        }
                    }
                }
                addRow('Model', model);
                
                // Extract positive prompt
                let positivePrompt = '';
                if (metadata.prompt) {
                    for (const key in metadata.prompt) {
                        const node = metadata.prompt[key];
                        if ((node.class_type === 'CLIPTextEncode' || node.class_type === 'CLIP Text Encode') && 
                            node.inputs?.text && !node.inputs?.text.includes('NEGATIVE')) {
                            positivePrompt = node.inputs.text;
                            break;
                        }
                    }
                }
                
                if (positivePrompt) {
                    const promptEl = document.createElement('div');
                    promptEl.classList.add('metadata-row', 'prompt-row');
                    
                    const promptLabel = document.createElement('div');
                    promptLabel.classList.add('metadata-label');
                    promptLabel.textContent = 'Positive Prompt:';
                    promptEl.appendChild(promptLabel);
                    
                    const promptValue = document.createElement('div');
                    promptValue.classList.add('metadata-value', 'prompt-value');
                    promptValue.textContent = positivePrompt;
                    promptEl.appendChild(promptValue);
                    
                    table.appendChild(promptEl);
                }
                
                // Extract negative prompt
                let negativePrompt = '';
                if (metadata.prompt) {
                    for (const key in metadata.prompt) {
                        const node = metadata.prompt[key];
                        if ((node.class_type === 'CLIPTextEncode' || node.class_type === 'CLIP Text Encode') && 
                            node.inputs?.text && node.inputs?.text.includes('NEGATIVE')) {
                            negativePrompt = node.inputs.text;
                            break;
                        }
                    }
                }
                
                if (negativePrompt) {
                    const promptEl = document.createElement('div');
                    promptEl.classList.add('metadata-row', 'prompt-row');
                    
                    const promptLabel = document.createElement('div');
                    promptLabel.classList.add('metadata-label');
                    promptLabel.textContent = 'Negative Prompt:';
                    promptEl.appendChild(promptLabel);
                    
                    const promptValue = document.createElement('div');
                    promptValue.classList.add('metadata-value', 'prompt-value');
                    promptValue.textContent = negativePrompt;
                    promptEl.appendChild(promptValue);
                    
                    table.appendChild(promptEl);
                }
                
                // Show raw metadata button
                const rawButton = document.createElement('button');
                rawButton.textContent = 'Show Raw Metadata';
                rawButton.classList.add('raw-metadata-button');
                rawButton.addEventListener('click', () => {
                    this.showRawMetadata(metadata);
                });
                table.appendChild(rawButton);
            }
            
            content.appendChild(table);
            infoContainer.appendChild(content);
        }
        
        showRawMetadata(metadata) {
            // Create container if it doesn't exist
            let rawContainer = document.getElementById('gallery-raw-container');
            if (!rawContainer) {
                rawContainer = document.createElement('div');
                rawContainer.id = 'gallery-raw-container';
                rawContainer.classList.add('raw-container');
                
                // Close on background click
                rawContainer.addEventListener('click', (e) => {
                    if (e.target === rawContainer) {
                        rawContainer.style.display = 'none';
                    }
                });
                
                document.body.appendChild(rawContainer);
            }
            
            // Clear and show container
            rawContainer.innerHTML = '';
            rawContainer.style.display = 'flex';
            
            // Create content
            const content = document.createElement('div');
            content.classList.add('raw-content');
            
            // Close button
            const closeButton = document.createElement('button');
            closeButton.classList.add('raw-close');
            closeButton.innerHTML = '×';
            closeButton.addEventListener('click', () => {
                rawContainer.style.display = 'none';
            });
            content.appendChild(closeButton);
            
            // Title
            const title = document.createElement('h2');
            title.textContent = 'Raw Metadata';
            content.appendChild(title);
            
            // Raw JSON
            const pre = document.createElement('pre');
            pre.classList.add('raw-json');
            pre.textContent = JSON.stringify(metadata, null, 2);
            content.appendChild(pre);
            
            rawContainer.appendChild(content);
        }
        
        applyStyles() {
            const styleEl = document.createElement('style');
            styleEl.textContent = `
                .gallery-standalone-button {
                    background-color: #3498db;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    margin: 5px;
                    z-index: 1000;
                }
                
                .gallery-standalone-popup {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                    z-index: 10000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                
                .popup-content {
                    background-color: #222;
                    width: 90%;
                    height: 90%;
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                .popup-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 20px;
                    background-color: #333;
                    border-bottom: 1px solid #444;
                }
                
                .gallery-title {
                    margin: 0;
                    color: white;
                    font-size: 1.2em;
                }
                
                .close-button {
                    background-color: #e74c3c;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .popup-main-content {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }
                
                .folder-navigation {
                    width: 200px;
                    background-color: #333;
                    overflow-y: auto;
                    padding: 10px;
                    border-right: 1px solid #444;
                }
                
                .image-display {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    background-color: #222;
                }
                
                .folder-button {
                    display: block;
                    width: 100%;
                    text-align: left;
                    padding: 8px 10px;
                    margin-bottom: 5px;
                    background-color: #444;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .folder-button:hover {
                    background-color: #555;
                }
                
                .folder-button.active-folder {
                    background-color: #3498db;
                }
                
                .image-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 15px;
                }
                
                .image-card {
                    background-color: #333;
                    border-radius: 5px;
                    overflow: hidden;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                }
                
                .image-container {
                    position: relative;
                    overflow: hidden;
                    aspect-ratio: 1;
                }
                
                .gallery-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s;
                    cursor: pointer;
                }
                
                .gallery-image:hover {
                    transform: scale(1.05);
                }
                
                .image-info {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background-color: rgba(0, 0, 0, 0.7);
                    padding: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .image-name {
                    color: white;
                    font-size: 0.8em;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .info-button {
                    background-color: #3498db;
                    color: white;
                    border: none;
                    padding: 3px 8px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 0.8em;
                }
                
                .empty-message, .loading-message, .error-message {
                    padding: 20px;
                    text-align: center;
                    color: #aaa;
                }
                
                .loading-message {
                    color: #3498db;
                }
                
                .error-message {
                    color: #e74c3c;
                }
                
                /* Fullscreen view */
                .fullscreen-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.9);
                    z-index: 20000;
                    display: none;
                    justify-content: center;
                    align-items: center;
                }
                
                .fullscreen-image {
                    max-width: 90%;
                    max-height: 90%;
                    object-fit: contain;
                }
                
                .fullscreen-close, .info-close, .raw-close {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background-color: rgba(0, 0, 0, 0.5);
                    color: white;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    font-size: 24px;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                
                .fullscreen-info-button {
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                    background-color: #3498db;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                /* Info popup */
                .info-container, .raw-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.9);
                    z-index: 30000;
                    display: none;
                    justify-content: center;
                    align-items: center;
                }
                
                .info-content, .raw-content {
                    background-color: #222;
                    width: 80%;
                    max-width: 800px;
                    max-height: 90%;
                    border-radius: 8px;
                    padding: 20px;
                    position: relative;
                    overflow-y: auto;
                }
                
                .info-preview {
                    max-width: 100%;
                    max-height: 300px;
                    object-fit: contain;
                    margin: 10px 0;
                    display: block;
                }
                
                .metadata-table {
                    margin-top: 20px;
                }
                
                .metadata-row {
                    display: flex;
                    margin-bottom: 10px;
                    border-bottom: 1px solid #444;
                    padding-bottom: 5px;
                }
                
                .metadata-label {
                    width: 150px;
                    font-weight: bold;
                    color: #3498db;
                }
                
                .metadata-value {
                    flex: 1;
                    color: #ddd;
                }
                
                .prompt-row {
                    flex-direction: column;
                }
                
                .prompt-row .metadata-label {
                    width: 100%;
                    margin-bottom: 5px;
                }
                
                .prompt-value {
                    white-space: pre-wrap;
                    background-color: #333;
                    padding: 10px;
                    border-radius: 4px;
                    font-family: monospace;
                }
                
                .raw-metadata-button {
                    background-color: #7f8c8d;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 20px;
                }
                
                .raw-json {
                    background-color: #333;
                    padding: 15px;
                    border-radius: 4px;
                    overflow: auto;
                    max-height: 500px;
                    color: #ddd;
                    font-family: monospace;
                    font-size: 12px;
                    white-space: pre-wrap;
                    word-break: break-all;
                }
            `;
            document.head.appendChild(styleEl);
        }
    }
    
    // Export to window object
    window.StandaloneGallery = StandaloneGallery;
    
    // Create instance if gallery button exists
    document.addEventListener('DOMContentLoaded', () => {
        // Look for gallery button
        const galleryButton = document.getElementById('direct-gallery-btn') || 
                              document.getElementById('gallery-direct-button') ||
                              document.getElementById('comfyui-gallery-button');
        
        if (galleryButton) {
            // Replace click handler
            galleryButton.addEventListener('click', () => {
                if (!window.standaloneGallery) {
                    window.standaloneGallery = new StandaloneGallery({
                        openButtonBox: galleryButton.parentElement
                    });
                }
                window.standaloneGallery.openGallery();
            });
        }
    });
})();

console.log('Standalone gallery script loaded');