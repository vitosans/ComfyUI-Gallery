/**
 * Metadata Display - Functions for showing image metadata and fullscreen views
 */

function showFullscreenImage(imageUrl) {
    // Display only the image in fullscreen
    this.fullscreenContainer.innerHTML = '';
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

    this.infoWindow.style.display = 'none';
    this.rawMetadataWindow.style.display = 'none';
    this.galleryPopup.style.zIndex = '1001';
}

function showInfoWindow(metadata, imageUrl) {
    // Display info window in fullscreen
    this.fullscreenContainer.innerHTML = '';
    this.fullscreenContainer.style.display = 'flex';

    // Create a modal container to hold everything with proper sizing
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('info-window');
    this.fullscreenContainer.appendChild(modalContainer);

    const closeButton = document.createElement('span');
    closeButton.classList.add('info-close');
    closeButton.innerHTML = '×';
    closeButton.onclick = () => this.closeFullscreenView();
    modalContainer.appendChild(closeButton);

    const infoContent = document.createElement('div');
    infoContent.classList.add('info-content');
    modalContainer.appendChild(infoContent);

    this.populateInfoWindowContent(infoContent, metadata, imageUrl);

    this.infoWindow.style.display = 'none'; // We're not using the original info window container
    this.rawMetadataWindow.style.display = 'none';
    this.fullscreenImage = null;
    this.galleryPopup.style.zIndex = '1001';
}

function populateInfoWindowContent(infoContent, metadata, imageUrl) {
    infoContent.innerHTML = '';

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
        valueSpan.textContent = value || 'N/A';
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
    addMetadataRow("Positive Prompt", metadata.positive_prompt || metadata.prompt?.['2']?.inputs?.prompt || metadata.prompt?.['7']?.inputs?.text);
    addMetadataRow("Negative Prompt", metadata.negative_prompt || metadata.prompt?.['3']?.inputs?.prompt || metadata.prompt?.['8']?.inputs?.text);
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

function showRawMetadataWindow(metadata) {
    this.fullscreenContainer.innerHTML = '';
    this.fullscreenContainer.style.display = 'flex';

    // Create a modal container to hold everything with proper sizing
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('raw-metadata-window');
    this.fullscreenContainer.appendChild(modalContainer);

    const closeButton = document.createElement('span');
    closeButton.classList.add('raw-metadata-close');
    closeButton.innerHTML = '×';
    closeButton.onclick = () => this.closeFullscreenView();
    modalContainer.appendChild(closeButton);

    const metadataContent = document.createElement('div');
    metadataContent.classList.add('raw-metadata-content');
    modalContainer.appendChild(metadataContent);

    const metadataTextarea = document.createElement('textarea');
    metadataTextarea.value = JSON.stringify(metadata, null, 2);
    metadataContent.appendChild(metadataTextarea);

    this.rawMetadataWindow.style.display = 'none'; // We're not using the original raw metadata window
    this.infoWindow.style.display = 'none';
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
}

export {
    showFullscreenImage,
    showInfoWindow,
    showRawMetadataWindow,
    populateInfoWindowContent,
    closeInfoWindow,
    closeRawMetadataWindow,
    closeFullscreenView
};