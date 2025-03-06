/**
 * Metadata Display - Functions for showing image metadata and fullscreen views
 */

function showFullscreenImage(imageUrl, imageInfo) {
    // Display image in fullscreen with controls
    this.fullscreenContainer.innerHTML = '';
    this.fullscreenContainer.style.display = 'flex';

    const closeButton = document.createElement('span');
    closeButton.classList.add('fullscreen-close');
    closeButton.innerHTML = '×';
    closeButton.onclick = () => this.closeFullscreenView();
    this.fullscreenContainer.appendChild(closeButton);

    // Image container for positioning
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('fullscreen-image-wrapper');
    
    this.fullscreenImage = document.createElement('img');
    this.fullscreenImage.classList.add('fullscreen-image');
    this.fullscreenImage.src = imageUrl;
    this.fullscreenImage.dataset.zoomLevel = '1';
    this.fullscreenImage.dataset.rotateLevel = '0';
    imageWrapper.appendChild(this.fullscreenImage);
    
    this.fullscreenContainer.appendChild(imageWrapper);

    // Add controls for the fullscreen image
    const controlsDiv = document.createElement('div');
    controlsDiv.classList.add('fullscreen-controls');
    
    // Zoom out button
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.classList.add('fullscreen-control-btn');
    zoomOutBtn.innerHTML = '<i class="material-icons">zoom_out</i>';
    zoomOutBtn.onclick = () => this.adjustZoom(-0.1);
    controlsDiv.appendChild(zoomOutBtn);
    
    // Zoom reset button
    const zoomResetBtn = document.createElement('button');
    zoomResetBtn.classList.add('fullscreen-control-btn');
    zoomResetBtn.innerHTML = '<i class="material-icons">crop_free</i>';
    zoomResetBtn.onclick = () => this.resetZoom();
    controlsDiv.appendChild(zoomResetBtn);
    
    // Zoom in button
    const zoomInBtn = document.createElement('button');
    zoomInBtn.classList.add('fullscreen-control-btn');
    zoomInBtn.innerHTML = '<i class="material-icons">zoom_in</i>';
    zoomInBtn.onclick = () => this.adjustZoom(0.1);
    controlsDiv.appendChild(zoomInBtn);
    
    // Zoom level indicator
    const zoomLevel = document.createElement('span');
    zoomLevel.classList.add('zoom-level');
    zoomLevel.textContent = '100%';
    zoomLevel.id = 'zoom-level-indicator';
    controlsDiv.appendChild(zoomLevel);
    
    // Rotate left button
    const rotateLeftBtn = document.createElement('button');
    rotateLeftBtn.classList.add('fullscreen-control-btn');
    rotateLeftBtn.innerHTML = '<i class="material-icons">rotate_left</i>';
    rotateLeftBtn.onclick = () => this.rotateImage(-90);
    controlsDiv.appendChild(rotateLeftBtn);
    
    // Rotate right button
    const rotateRightBtn = document.createElement('button');
    rotateRightBtn.classList.add('fullscreen-control-btn');
    rotateRightBtn.innerHTML = '<i class="material-icons">rotate_right</i>';
    rotateRightBtn.onclick = () => this.rotateImage(90);
    controlsDiv.appendChild(rotateRightBtn);
    
    // Info button
    const infoBtn = document.createElement('button');
    infoBtn.classList.add('fullscreen-control-btn');
    infoBtn.innerHTML = '<i class="material-icons">info</i>';
    infoBtn.onclick = () => {
        this.closeFullscreenView();
        setTimeout(() => this.showInfoWindow(imageInfo.metadata, imageUrl, imageInfo), 100);
    };
    controlsDiv.appendChild(infoBtn);
    
    this.fullscreenContainer.appendChild(controlsDiv);

    // Make image draggable when zoomed
    this.setupImageDragging(this.fullscreenImage);
    
    // Add mousewheel zoom
    this.setupMouseWheelZoom(this.fullscreenImage);
    
    this.infoWindow.style.display = 'none';
    this.rawMetadataWindow.style.display = 'none';
    this.galleryPopup.style.zIndex = '1001';
}

function adjustZoom(delta) {
    if (!this.fullscreenImage) return;
    
    let currentZoom = parseFloat(this.fullscreenImage.dataset.zoomLevel) || 1;
    let newZoom = Math.max(0.1, Math.min(5, currentZoom + delta));
    
    this.fullscreenImage.style.transform = `scale(${newZoom}) rotate(${this.fullscreenImage.dataset.rotateLevel || 0}deg)`;
    this.fullscreenImage.dataset.zoomLevel = newZoom;
    
    // Update zoom indicator
    const zoomIndicator = document.getElementById('zoom-level-indicator');
    if (zoomIndicator) {
        zoomIndicator.textContent = `${Math.round(newZoom * 100)}%`;
    }
}

function resetZoom() {
    if (!this.fullscreenImage) return;
    
    this.fullscreenImage.style.transform = `rotate(${this.fullscreenImage.dataset.rotateLevel || 0}deg)`;
    this.fullscreenImage.dataset.zoomLevel = 1;
    this.fullscreenImage.style.left = '0px';
    this.fullscreenImage.style.top = '0px';
    
    // Update zoom indicator
    const zoomIndicator = document.getElementById('zoom-level-indicator');
    if (zoomIndicator) {
        zoomIndicator.textContent = '100%';
    }
}

function rotateImage(degrees) {
    if (!this.fullscreenImage) return;
    
    let currentRotation = parseInt(this.fullscreenImage.dataset.rotateLevel || 0);
    let newRotation = currentRotation + degrees;
    
    // Normalize rotation to 0-359
    newRotation = ((newRotation % 360) + 360) % 360;
    
    const currentZoom = parseFloat(this.fullscreenImage.dataset.zoomLevel) || 1;
    this.fullscreenImage.style.transform = `scale(${currentZoom}) rotate(${newRotation}deg)`;
    this.fullscreenImage.dataset.rotateLevel = newRotation;
}

function setupImageDragging(imageElement) {
    let isDragging = false;
    let startX, startY;
    let currentX = 0, currentY = 0;
    
    imageElement.style.position = 'relative';
    
    imageElement.addEventListener('mousedown', (e) => {
        // Only allow dragging when zoomed in
        if (parseFloat(imageElement.dataset.zoomLevel) <= 1) return;
        
        isDragging = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        imageElement.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
        
        imageElement.style.left = `${currentX}px`;
        imageElement.style.top = `${currentY}px`;
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        imageElement.style.cursor = 'grab';
    });
    
    // Set grab cursor on hover when zoomed
    imageElement.addEventListener('mouseover', () => {
        if (parseFloat(imageElement.dataset.zoomLevel) > 1) {
            imageElement.style.cursor = 'grab';
        } else {
            imageElement.style.cursor = 'default';
        }
    });
}

function setupMouseWheelZoom(imageElement) {
    imageElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        // Determine the zoom direction based on wheel delta
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        this.adjustZoom(delta);
    });
}

function showInfoWindow(metadata, imageUrl, imageInfo) {
    // Display info window in fullscreen
    this.fullscreenContainer.innerHTML = '';
    this.fullscreenContainer.style.display = 'flex';

    // Create a modal container to hold everything with proper sizing
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('info-window');
    this.fullscreenContainer.appendChild(modalContainer);

    // Create a header section for the close button
    const headerSection = document.createElement('div');
    headerSection.classList.add('info-header');
    modalContainer.appendChild(headerSection);
    
    // Add title to header
    const title = document.createElement('h2');
    title.textContent = imageInfo?.name || 'Image Information';
    title.style.margin = '0';
    title.style.flex = '1';
    headerSection.appendChild(title);

    const closeButton = document.createElement('span');
    closeButton.classList.add('info-close');
    closeButton.innerHTML = '×';
    closeButton.onclick = () => this.closeFullscreenView();
    headerSection.appendChild(closeButton);

    const infoContent = document.createElement('div');
    infoContent.classList.add('info-content');
    modalContainer.appendChild(infoContent);

    this.populateInfoWindowContent(infoContent, metadata, imageUrl, imageInfo);

    this.infoWindow.style.display = 'none'; // We're not using the original info window container
    this.rawMetadataWindow.style.display = 'none';
    this.fullscreenImage = null;
    this.galleryPopup.style.zIndex = '1001';
}

function populateInfoWindowContent(infoContent, metadata, imageUrl, imageInfo) {
    infoContent.innerHTML = '';

    // Image Preview in Info Window
    const previewImage = document.createElement('img');
    previewImage.src = imageUrl;
    previewImage.classList.add('info-preview-image');
    infoContent.appendChild(previewImage);

    const metadataTable = document.createElement('div');
    metadataTable.classList.add('metadata-table');
    infoContent.appendChild(metadataTable);

    // Tags container (will be populated if tags exist)
    const tagsContainer = document.createElement('div');
    tagsContainer.classList.add('tag-container');
    
    const addMetadataRow = (label, value) => {
        const row = document.createElement('div');
        row.classList.add('metadata-row');

        const labelSpan = document.createElement('span');
        labelSpan.classList.add('metadata-label');
        labelSpan.textContent = label + ":";
        row.appendChild(labelSpan);

        const valueSpan = document.createElement('span');
        valueSpan.classList.add('metadata-value');
        
        if (typeof value === 'string' && value.startsWith('http')) {
            // For URLs, create a clickable link
            const link = document.createElement('a');
            link.href = value;
            link.textContent = value;
            link.target = '_blank';
            valueSpan.appendChild(link);
        } else {
            valueSpan.textContent = value || 'N/A';
        }
        
        row.appendChild(valueSpan);
        metadataTable.appendChild(row);
    };

    // Add common metadata fields
    addMetadataRow("Filename", metadata.fileinfo?.filename);
    addMetadataRow("Resolution", metadata.fileinfo?.resolution);
    addMetadataRow("File Size", metadata.fileinfo?.size);
    addMetadataRow("Date Created", metadata.fileinfo?.date);
    
    // First try to use directly extracted metadata fields
    addMetadataRow("Model", metadata.model || metadata.prompt?.['1']?.inputs?.ckpt_name || metadata.prompt?.['1']?.inputs?.ckpt_name?.content);
    
    // For prompts, format them nicely
    const positivePrompt = metadata.positive_prompt || metadata.prompt?.['2']?.inputs?.prompt || metadata.prompt?.['7']?.inputs?.text;
    if (positivePrompt) {
        addMetadataRow("Positive Prompt", this.formatPromptText(positivePrompt));
    }
    
    const negativePrompt = metadata.negative_prompt || metadata.prompt?.['3']?.inputs?.prompt || metadata.prompt?.['8']?.inputs?.text;
    if (negativePrompt) {
        addMetadataRow("Negative Prompt", this.formatPromptText(negativePrompt));
    }
    
    addMetadataRow("Sampler", metadata.sampler || metadata.prompt?.['10']?.inputs?.sampler_name);
    addMetadataRow("Scheduler", metadata.scheduler || metadata.prompt?.['10']?.inputs?.scheduler);
    addMetadataRow("Steps", metadata.steps || metadata.prompt?.['10']?.inputs?.steps);
    addMetadataRow("CFG Scale", metadata.cfg_scale || metadata.prompt?.['10']?.inputs?.cfg);
    addMetadataRow("Seed", metadata.seed || metadata.prompt?.['10']?.inputs?.seed);

    // Extract and display LoRAs
    let loras = [];
    // First check if we have extracted lora directly
    if (metadata.lora) {
        loras.push(metadata.lora);
    } else {
        // Extract from prompt structure
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
    }
    addMetadataRow("LoRAs", loras.length > 0 ? loras.join(', ') : 'N/A');

    // Add tags if they exist
    if (imageInfo && imageInfo.tags && imageInfo.tags.length > 0) {
        // Create a metadata row for tags
        const tagRow = document.createElement('div');
        tagRow.classList.add('metadata-row');
        
        const tagLabel = document.createElement('span');
        tagLabel.classList.add('metadata-label');
        tagLabel.textContent = "Tags:";
        tagRow.appendChild(tagLabel);
        
        const tagValueContainer = document.createElement('div');
        tagValueContainer.classList.add('metadata-value');
        
        // Create tags
        imageInfo.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.classList.add('tag');
            tagElement.innerHTML = `<i class="material-icons">label</i>${tag}`;
            tagValueContainer.appendChild(tagElement);
        });
        
        tagRow.appendChild(tagValueContainer);
        metadataTable.appendChild(tagRow);
    }
    
    // Create a footer section for buttons
    const footerSection = document.createElement('div');
    footerSection.classList.add('info-footer');
    
    // Button to send to ComfyUI
    if (metadata.workflow || metadata.prompt) {
        const sendToComfyButton = document.createElement('button');
        sendToComfyButton.textContent = 'Send to ComfyUI';
        sendToComfyButton.classList.add('send-to-comfy-button');
        sendToComfyButton.onclick = (event) => {
            event.stopPropagation();
            this.sendToComfyUI(metadata);
        };
        footerSection.appendChild(sendToComfyButton);
    }
    
    // Button to show raw metadata
    const rawMetadataButton = document.createElement('button');
    rawMetadataButton.textContent = 'Show Raw Metadata';
    rawMetadataButton.classList.add('raw-metadata-button');
    rawMetadataButton.onclick = (event) => {
        event.stopPropagation();
        this.showRawMetadataWindow(metadata);
    };
    footerSection.appendChild(rawMetadataButton);
    
    modalContainer.appendChild(footerSection);
}

function formatPromptText(prompt) {
    if (!prompt) return 'N/A';
    
    // Replace common separator patterns with line breaks
    return prompt
        .replace(/,\s+/g, ', ')  // Normalize commas
        .replace(/,/g, ',\n')     // Add line breaks after commas
        .replace(/\n+/g, '\n');   // Remove duplicate line breaks
}

function sendToComfyUI(metadata) {
    try {
        // First check if we have a workflow
        if (metadata.workflow) {
            const workflow = JSON.parse(metadata.workflow);
            this.importWorkflow(workflow);
            this.showToast('Workflow sent to ComfyUI', 'success');
            return;
        }
        
        // Otherwise, try to use the prompt object
        if (metadata.prompt) {
            const workflow = {
                "nodes": Object.values(metadata.prompt || {}),
                "extra": {
                    "type": "comfyui"
                }
            };
            this.importWorkflow(workflow);
            this.showToast('Workflow sent to ComfyUI', 'success');
            return;
        }
        
        this.showToast('No workflow data found in image', 'error');
    } catch (error) {
        console.error('Error sending workflow to ComfyUI:', error);
        this.showToast('Error importing workflow', 'error');
    }
}

function importWorkflow(workflow) {
    // This function sends the workflow to ComfyUI
    // Get the app object from the global scope
    const app = window.app;
    if (!app || !app.loadGraphData) {
        console.error('ComfyUI app object not found');
        return;
    }
    
    // Import the workflow
    app.loadGraphData(workflow);
    
    // Close the gallery
    this.closeFullscreenView();
    this.closeGallery();
}

function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.classList.add('toast-container');
        document.body.appendChild(toastContainer);
    }
    
    // Create the toast element
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    
    // Add icon based on type
    let icon;
    switch (type) {
        case 'success':
            icon = 'check_circle';
            break;
        case 'error':
            icon = 'error';
            break;
        case 'info':
        default:
            icon = 'info';
            break;
    }
    
    toast.innerHTML = `
        <span class="toast-icon material-icons">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

function showCollections(imageInfo) {
    // Load collections
    let collections = this.loadCollections();
    
    // Create collections panel
    const panel = document.createElement('div');
    panel.classList.add('collections-panel');
    panel.id = 'collections-panel';
    
    // Create header
    const header = document.createElement('div');
    header.classList.add('filter-header');
    header.innerHTML = '<h3 style="margin: 0;">Collections</h3>';
    
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
    addButton.textContent = 'Create';
    addButton.classList.add('filter-button', 'apply-filters');
    addButton.onclick = () => {
        const name = newCollectionInput.value.trim();
        if (name) {
            this.createCollection(name, imageInfo);
            panel.remove();
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
            
            // Add click handler to add the image to this collection
            collectionItem.onclick = () => {
                this.addToCollection(collection.name, imageInfo);
                panel.remove();
            };
            
            listDiv.appendChild(collectionItem);
        });
    }
    
    panel.appendChild(listDiv);
    
    // Add to document
    document.body.appendChild(panel);
    
    // Position the panel
    const galleryPopup = document.querySelector('.gallery-popup');
    if (galleryPopup) {
        // Center it
        panel.style.top = '50%';
        panel.style.left = '50%';
        panel.style.transform = 'translate(-50%, -50%)';
    }
    
    panel.style.display = 'block';
}

function loadCollections() {
    try {
        const collections = localStorage.getItem('comfyui-gallery-collections');
        return collections ? JSON.parse(collections) : [];
    } catch (error) {
        console.error('Error loading collections:', error);
        return [];
    }
}

function saveCollections(collections) {
    localStorage.setItem('comfyui-gallery-collections', JSON.stringify(collections));
}

function createCollection(name, imageInfo) {
    let collections = this.loadCollections();
    
    // Check if the collection already exists
    if (collections.some(c => c.name === name)) {
        this.showToast(`Collection "${name}" already exists`, 'info');
        this.addToCollection(name, imageInfo);
        return;
    }
    
    // Create new collection
    collections.push({
        name: name,
        images: imageInfo ? [imageInfo.url] : []
    });
    
    this.saveCollections(collections);
    this.showToast(`Created collection "${name}"`, 'success');
    
    // Add the image if provided
    if (imageInfo) {
        this.addToCollection(name, imageInfo);
    }
}

function addToCollection(collectionName, imageInfo) {
    if (!imageInfo || !imageInfo.url) {
        this.showToast('Cannot add image to collection', 'error');
        return;
    }
    
    let collections = this.loadCollections();
    
    // Find the collection
    const collection = collections.find(c => c.name === collectionName);
    if (!collection) {
        this.showToast(`Collection "${collectionName}" not found`, 'error');
        return;
    }
    
    // Check if the image is already in the collection
    if (collection.images.includes(imageInfo.url)) {
        this.showToast(`Image already in "${collectionName}"`, 'info');
        return;
    }
    
    // Add the image
    collection.images.push(imageInfo.url);
    
    this.saveCollections(collections);
    this.showToast(`Added to "${collectionName}"`, 'success');
}

function showRawMetadataWindow(metadata) {
    // Clear the container and ensure it's visible
    this.fullscreenContainer.innerHTML = '';
    this.fullscreenContainer.style.display = 'flex';

    // Create a modal dialog for raw metadata
    const modalDialog = document.createElement('div');
    modalDialog.classList.add('raw-metadata-dialog');
    this.fullscreenContainer.appendChild(modalDialog);

    // Create header with close button
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('raw-metadata-header');
    modalDialog.appendChild(headerDiv);
    
    const titleSpan = document.createElement('span');
    titleSpan.textContent = 'Raw Metadata';
    titleSpan.classList.add('raw-metadata-title');
    headerDiv.appendChild(titleSpan);

    const closeButton = document.createElement('span');
    closeButton.innerHTML = '×';
    closeButton.classList.add('raw-metadata-close');
    closeButton.onclick = () => this.closeFullscreenView();
    headerDiv.appendChild(closeButton);

    // Create content area with textarea
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('raw-metadata-content');
    modalDialog.appendChild(contentDiv);

    const textArea = document.createElement('textarea');
    textArea.readOnly = true;
    textArea.spellcheck = false;
    textArea.value = JSON.stringify(metadata, null, 2);
    contentDiv.appendChild(textArea);

    // Reset any original windows
    this.infoWindow.style.display = 'none';
    this.rawMetadataWindow.style.display = 'none';
    this.fullscreenImage = null;
    
    this.galleryPopup.style.zIndex = '1001';
}

function closeInfoWindow() {
    this.infoWindow.style.display = 'none';
    this.closeFullscreenView();
}

function closeRawMetadataWindow() {
    this.rawMetadataWindow.style.display = 'none';
    this.closeFullscreenView();
}

function closeFullscreenView() {
    // Close any fullscreen view (image, info, raw metadata)
    this.fullscreenContainer.style.display = 'none';
    this.infoWindow.style.display = 'none';
    this.rawMetadataWindow.style.display = 'none';
    this.galleryPopup.style.zIndex = '1000';
    
    // Remove any open panels
    const collectionsPanel = document.getElementById('collections-panel');
    if (collectionsPanel) {
        collectionsPanel.remove();
    }
}

export {
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
    addToCollection
};