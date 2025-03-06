// This is a standalone script that gets loaded directly
console.log("Gallery: Direct script loaded");

// Create a button immediately
(function() {
    // Try to set up the gallery functionality
    function setupGallery() {
        // Find the gallery button element
        const button = document.getElementById('gallery-direct-script-button');
        if (!button) return false;
        
        try {
            // Look for a menu element to put the button in
            const menuElements = [
                document.querySelector('.comfy-menu'),
                document.querySelector('.comfy-menu-btns'),
                document.querySelector('.comfy-menu > div'),
                document.querySelector('.comfy-menu > div > div')
            ];
            
            const menu = menuElements.find(el => el);
            if (menu) {
                // Move the button into the menu for better appearance
                button.style.position = 'relative';
                button.style.top = 'auto';
                button.style.left = 'auto';
                button.style.margin = '5px';
                menu.appendChild(button);
                console.log("Gallery: Moved button into menu");
            }
            
            // Set up the click handler to open gallery
            button.onclick = function() {
                openGallery();
            };
            
            return true;
        } catch (e) {
            console.error("Gallery: Error setting up gallery:", e);
            return false;
        }
    }
    
    // Function to open the gallery UI
    function openGallery() {
        console.log("Gallery: Opening gallery");
        
        try {
            // Look for existing gallery popup first
            let galleryPopup = document.getElementById('gallery-popup');
            
            if (!galleryPopup) {
                // Create gallery popup if it doesn't exist
                galleryPopup = document.createElement('div');
                galleryPopup.id = 'gallery-popup';
                galleryPopup.style.position = 'fixed';
                galleryPopup.style.top = '0';
                galleryPopup.style.left = '0';
                galleryPopup.style.width = '100%';
                galleryPopup.style.height = '100%';
                galleryPopup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                galleryPopup.style.zIndex = '10000';
                galleryPopup.style.display = 'flex';
                galleryPopup.style.justifyContent = 'center';
                galleryPopup.style.alignItems = 'center';
                
                // Create content container
                const content = document.createElement('div');
                content.style.backgroundColor = '#333';
                content.style.color = '#fff';
                content.style.width = '80%';
                content.style.height = '80%';
                content.style.borderRadius = '8px';
                content.style.padding = '20px';
                content.style.position = 'relative';
                content.style.display = 'flex';
                content.style.flexDirection = 'column';
                
                // Add header with title and close button
                const header = document.createElement('div');
                header.style.display = 'flex';
                header.style.justifyContent = 'space-between';
                header.style.alignItems = 'center';
                header.style.marginBottom = '15px';
                
                const title = document.createElement('h2');
                title.textContent = 'ComfyUI Gallery';
                title.style.margin = '0';
                
                const closeButton = document.createElement('button');
                closeButton.textContent = 'Close';
                closeButton.style.backgroundColor = '#e74c3c';
                closeButton.style.color = 'white';
                closeButton.style.border = 'none';
                closeButton.style.padding = '5px 10px';
                closeButton.style.borderRadius = '4px';
                closeButton.style.cursor = 'pointer';
                
                closeButton.onclick = function() {
                    galleryPopup.style.display = 'none';
                };
                
                header.appendChild(title);
                header.appendChild(closeButton);
                content.appendChild(header);
                
                // Add gallery content area
                const galleryContent = document.createElement('div');
                galleryContent.style.flex = '1';
                galleryContent.style.overflow = 'auto';
                galleryContent.style.display = 'grid';
                galleryContent.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
                galleryContent.style.gap = '15px';
                
                // Add loading indicator initially
                const loadingMessage = document.createElement('div');
                loadingMessage.textContent = 'Loading gallery...';
                loadingMessage.style.gridColumn = '1 / -1';
                loadingMessage.style.textAlign = 'center';
                loadingMessage.style.padding = '20px';
                galleryContent.appendChild(loadingMessage);
                
                content.appendChild(galleryContent);
                galleryPopup.appendChild(content);
                document.body.appendChild(galleryPopup);
                
                // Close when clicking outside the content
                galleryPopup.addEventListener('click', function(e) {
                    if (e.target === galleryPopup) {
                        galleryPopup.style.display = 'none';
                    }
                });
                
                // Try to load actual gallery data
                loadGalleryImages(galleryContent);
            } else {
                // Just show the existing gallery
                galleryPopup.style.display = 'flex';
            }
        } catch (e) {
            console.error("Gallery: Error opening gallery:", e);
            alert("Error opening gallery. See console for details.");
        }
    }
    
    // Function to load gallery images
    function loadGalleryImages(container) {
        try {
            // Try to fetch from API
            fetch('/Gallery/images')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Process gallery data
                    if (data && data.folders) {
                        container.innerHTML = ''; // Clear loading message
                        
                        // Check if we have any images
                        let totalImages = 0;
                        Object.values(data.folders).forEach(folder => {
                            totalImages += folder.length;
                        });
                        
                        if (totalImages === 0) {
                            // No images found
                            const noImagesMessage = document.createElement('div');
                            noImagesMessage.textContent = 'No images found in gallery.';
                            noImagesMessage.style.gridColumn = '1 / -1';
                            noImagesMessage.style.textAlign = 'center';
                            noImagesMessage.style.padding = '20px';
                            container.appendChild(noImagesMessage);
                            return;
                        }
                        
                        // Add folder navigation if we have multiple folders
                        const folderNames = Object.keys(data.folders);
                        if (folderNames.length > 1) {
                            const folderNav = document.createElement('div');
                            folderNav.style.gridColumn = '1 / -1';
                            folderNav.style.display = 'flex';
                            folderNav.style.flexWrap = 'wrap';
                            folderNav.style.gap = '10px';
                            folderNav.style.marginBottom = '15px';
                            
                            folderNames.forEach(folderName => {
                                const folderButton = document.createElement('button');
                                folderButton.textContent = folderName;
                                folderButton.style.backgroundColor = '#555';
                                folderButton.style.color = 'white';
                                folderButton.style.border = 'none';
                                folderButton.style.padding = '5px 10px';
                                folderButton.style.borderRadius = '4px';
                                folderButton.style.cursor = 'pointer';
                                
                                folderButton.onclick = function() {
                                    // Highlight selected folder
                                    folderNav.querySelectorAll('button').forEach(btn => {
                                        btn.style.backgroundColor = '#555';
                                    });
                                    folderButton.style.backgroundColor = '#3498db';
                                    
                                    // Display images from this folder
                                    displayFolderImages(container, data.folders[folderName], folderNav);
                                };
                                
                                folderNav.appendChild(folderButton);
                            });
                            
                            container.appendChild(folderNav);
                            
                            // Select first folder by default
                            if (folderNames.length > 0) {
                                displayFolderImages(container, data.folders[folderNames[0]], folderNav);
                                folderNav.querySelector('button').style.backgroundColor = '#3498db';
                            }
                        } else if (folderNames.length === 1) {
                            // Only one folder, just show the images
                            displayFolderImages(container, data.folders[folderNames[0]]);
                        }
                    } else {
                        throw new Error('Invalid gallery data format');
                    }
                })
                .catch(error => {
                    console.error('Error loading gallery images:', error);
                    container.innerHTML = '';
                    
                    const errorMessage = document.createElement('div');
                    errorMessage.textContent = `Error loading gallery images: ${error.message}`;
                    errorMessage.style.gridColumn = '1 / -1';
                    errorMessage.style.textAlign = 'center';
                    errorMessage.style.padding = '20px';
                    errorMessage.style.color = '#e74c3c';
                    container.appendChild(errorMessage);
                });
        } catch (e) {
            console.error("Gallery: Error loading gallery images:", e);
        }
    }
    
    // Function to display images from a specific folder
    function displayFolderImages(container, images, folderNav) {
        // Clear existing images, but keep the folder navigation
        if (folderNav) {
            container.innerHTML = '';
            container.appendChild(folderNav);
        } else {
            container.innerHTML = '';
        }
        
        // Sort images by timestamp (newest first)
        images.sort((a, b) => b.timestamp - a.timestamp);
        
        // Create image cards
        images.forEach(image => {
            const card = document.createElement('div');
            card.style.borderRadius = '8px';
            card.style.overflow = 'hidden';
            card.style.position = 'relative';
            card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            card.style.transition = 'transform 0.2s ease';
            card.style.cursor = 'pointer';
            card.style.height = '250px';
            
            card.onmouseover = function() {
                card.style.transform = 'scale(1.03)';
            };
            
            card.onmouseout = function() {
                card.style.transform = 'scale(1)';
            };
            
            // Image
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.name;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            
            // Image info overlay
            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.bottom = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
            overlay.style.color = 'white';
            overlay.style.padding = '10px';
            
            const imageName = document.createElement('div');
            imageName.textContent = image.name;
            imageName.style.whiteSpace = 'nowrap';
            imageName.style.overflow = 'hidden';
            imageName.style.textOverflow = 'ellipsis';
            overlay.appendChild(imageName);
            
            card.appendChild(img);
            card.appendChild(overlay);
            
            // Click handler to view image details
            card.onclick = function() {
                showImageDetails(image);
            };
            
            container.appendChild(card);
        });
    }
    
    // Function to show image details
    function showImageDetails(image) {
        console.log("Gallery: Showing image details for", image.name);
        
        try {
            // Create modal for image details
            const detailsModal = document.createElement('div');
            detailsModal.style.position = 'fixed';
            detailsModal.style.top = '0';
            detailsModal.style.left = '0';
            detailsModal.style.width = '100%';
            detailsModal.style.height = '100%';
            detailsModal.style.backgroundColor = 'rgba(0,0,0,0.9)';
            detailsModal.style.zIndex = '20000';
            detailsModal.style.display = 'flex';
            detailsModal.style.justifyContent = 'center';
            detailsModal.style.alignItems = 'center';
            
            // Container for the details
            const container = document.createElement('div');
            container.style.backgroundColor = '#333';
            container.style.color = '#fff';
            container.style.width = '80%';
            container.style.maxHeight = '80%';
            container.style.borderRadius = '8px';
            container.style.overflow = 'auto';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            
            // Header with close button
            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.padding = '15px';
            header.style.borderBottom = '1px solid #555';
            
            const title = document.createElement('h2');
            title.textContent = image.name;
            title.style.margin = '0';
            
            const closeButton = document.createElement('button');
            closeButton.textContent = '×';
            closeButton.style.backgroundColor = 'transparent';
            closeButton.style.color = 'white';
            closeButton.style.border = 'none';
            closeButton.style.fontSize = '24px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.padding = '0 10px';
            
            closeButton.onclick = function() {
                detailsModal.remove();
            };
            
            header.appendChild(title);
            header.appendChild(closeButton);
            container.appendChild(header);
            
            // Content area with image and metadata
            const content = document.createElement('div');
            content.style.display = 'flex';
            content.style.padding = '20px';
            content.style.gap = '20px';
            content.style.flexWrap = 'wrap';
            
            // Image
            const imageContainer = document.createElement('div');
            imageContainer.style.flex = '1';
            imageContainer.style.minWidth = '300px';
            imageContainer.style.display = 'flex';
            imageContainer.style.justifyContent = 'center';
            
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.name;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '500px';
            img.style.objectFit = 'contain';
            img.style.borderRadius = '4px';
            
            imageContainer.appendChild(img);
            content.appendChild(imageContainer);
            
            // Metadata
            const metadataContainer = document.createElement('div');
            metadataContainer.style.flex = '1';
            metadataContainer.style.minWidth = '300px';
            
            if (image.metadata) {
                // Image info
                const infoSection = document.createElement('div');
                infoSection.style.marginBottom = '20px';
                
                const infoTitle = document.createElement('h3');
                infoTitle.textContent = 'Image Information';
                infoTitle.style.marginTop = '0';
                infoSection.appendChild(infoTitle);
                
                // Add common metadata
                addMetadataRow(infoSection, 'File', image.name);
                addMetadataRow(infoSection, 'Date', image.date || 'Unknown');
                
                metadataContainer.appendChild(infoSection);
                
                // Prompt info if available
                if (image.metadata.positive_prompt || image.metadata.negative_prompt) {
                    const promptSection = document.createElement('div');
                    promptSection.style.marginBottom = '20px';
                    
                    const promptTitle = document.createElement('h3');
                    promptTitle.textContent = 'Prompt Information';
                    promptTitle.style.marginTop = '0';
                    promptSection.appendChild(promptTitle);
                    
                    if (image.metadata.positive_prompt) {
                        addMetadataRow(promptSection, 'Positive Prompt', image.metadata.positive_prompt);
                    }
                    
                    if (image.metadata.negative_prompt) {
                        addMetadataRow(promptSection, 'Negative Prompt', image.metadata.negative_prompt);
                    }
                    
                    metadataContainer.appendChild(promptSection);
                }
                
                // Generation info if available
                const hasGenInfo = image.metadata.model || 
                                  image.metadata.sampler || 
                                  image.metadata.seed || 
                                  image.metadata.steps || 
                                  image.metadata.cfg_scale;
                
                if (hasGenInfo) {
                    const genSection = document.createElement('div');
                    genSection.style.marginBottom = '20px';
                    
                    const genTitle = document.createElement('h3');
                    genTitle.textContent = 'Generation Settings';
                    genTitle.style.marginTop = '0';
                    genSection.appendChild(genTitle);
                    
                    if (image.metadata.model) {
                        addMetadataRow(genSection, 'Model', image.metadata.model);
                    }
                    
                    if (image.metadata.sampler) {
                        addMetadataRow(genSection, 'Sampler', image.metadata.sampler);
                    }
                    
                    if (image.metadata.steps) {
                        addMetadataRow(genSection, 'Steps', image.metadata.steps);
                    }
                    
                    if (image.metadata.cfg_scale) {
                        addMetadataRow(genSection, 'CFG Scale', image.metadata.cfg_scale);
                    }
                    
                    if (image.metadata.seed) {
                        addMetadataRow(genSection, 'Seed', image.metadata.seed);
                    }
                    
                    metadataContainer.appendChild(genSection);
                }
                
                // Raw metadata button
                const rawButton = document.createElement('button');
                rawButton.textContent = 'View Raw Metadata';
                rawButton.style.backgroundColor = '#3498db';
                rawButton.style.color = 'white';
                rawButton.style.border = 'none';
                rawButton.style.padding = '8px 15px';
                rawButton.style.borderRadius = '4px';
                rawButton.style.cursor = 'pointer';
                rawButton.style.marginTop = '10px';
                
                rawButton.onclick = function() {
                    showRawMetadata(image.metadata);
                };
                
                metadataContainer.appendChild(rawButton);
            } else {
                const noMetadata = document.createElement('p');
                noMetadata.textContent = 'No metadata available for this image.';
                metadataContainer.appendChild(noMetadata);
            }
            
            content.appendChild(metadataContainer);
            container.appendChild(content);
            
            detailsModal.appendChild(container);
            document.body.appendChild(detailsModal);
            
            // Close when clicking outside
            detailsModal.addEventListener('click', function(e) {
                if (e.target === detailsModal) {
                    detailsModal.remove();
                }
            });
        } catch (e) {
            console.error("Gallery: Error showing image details:", e);
        }
    }
    
    // Helper function to add a metadata row
    function addMetadataRow(container, label, value) {
        const row = document.createElement('div');
        row.style.marginBottom = '10px';
        
        const labelElement = document.createElement('strong');
        labelElement.textContent = label + ': ';
        row.appendChild(labelElement);
        
        const valueElement = document.createElement('span');
        valueElement.style.whiteSpace = 'pre-wrap';
        valueElement.style.wordBreak = 'break-word';
        valueElement.textContent = value || 'N/A';
        row.appendChild(valueElement);
        
        container.appendChild(row);
    }
    
    // Function to show raw metadata
    function showRawMetadata(metadata) {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
        modal.style.zIndex = '30000';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        
        const container = document.createElement('div');
        container.style.backgroundColor = '#222';
        container.style.color = '#fff';
        container.style.width = '80%';
        container.style.height = '80%';
        container.style.borderRadius = '8px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.padding = '15px';
        header.style.borderBottom = '1px solid #444';
        
        const title = document.createElement('h3');
        title.textContent = 'Raw Metadata';
        title.style.margin = '0';
        
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.backgroundColor = 'transparent';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.padding = '0 10px';
        
        closeButton.onclick = function() {
            modal.remove();
        };
        
        header.appendChild(title);
        header.appendChild(closeButton);
        container.appendChild(header);
        
        const content = document.createElement('div');
        content.style.flex = '1';
        content.style.overflow = 'auto';
        content.style.padding = '0';
        
        const textarea = document.createElement('textarea');
        textarea.value = JSON.stringify(metadata, null, 2);
        textarea.style.width = '100%';
        textarea.style.height = '100%';
        textarea.style.padding = '15px';
        textarea.style.backgroundColor = '#2a2a2a';
        textarea.style.color = '#eee';
        textarea.style.border = 'none';
        textarea.style.resize = 'none';
        textarea.style.fontFamily = 'monospace';
        textarea.style.fontSize = '14px';
        textarea.readOnly = true;
        
        content.appendChild(textarea);
        container.appendChild(content);
        
        modal.appendChild(container);
        document.body.appendChild(modal);
        
        // Close when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // Function to ensure our button exists on the page
    function ensureGalleryButtonExists() {
        if (document.getElementById('gallery-direct-script-button')) {
            setupGallery();
            return;
        }
        
        console.log("Gallery: Creating direct script button");
        
        // Create the button with inline styles
        const button = document.createElement('button');
        button.id = 'gallery-direct-script-button';
        button.textContent = 'Gallery';
        button.style.backgroundColor = '#3498db';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.padding = '8px 15px';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.fontWeight = 'bold';
        
        
        
        
        
        // Add hover effect
        button.onmouseover = function() {
            this.style.backgroundColor = '#2980b9';
        };
        button.onmouseout = function() {
            this.style.backgroundColor = '#3498db';
        };
        
        // Add click event
        button.onclick = function() {
            openGallery();
        };
        
        // Add to page
        try { const menuTarget = document.querySelector(".comfy-menu") || document.querySelector(".comfy-menu-btns") || document.body; menuTarget.appendChild(button); } catch (e) { document.body.appendChild(button); };
        console.log("Gallery: Direct script button added to page");
    }
    
    // Try to create button immediately
    if (document.body) {
        ensureGalleryButtonExists();
    }
    
    // Also try when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(ensureGalleryButtonExists, 100);
    });
    
    // Also try when window is fully loaded
    window.addEventListener('load', function() {
        setTimeout(ensureGalleryButtonExists, 500);
    });
    
    // Keep trying every second for a while
    let attempts = 0;
    const checkInterval = setInterval(function() {
        ensureGalleryButtonExists();
        attempts++;
        
        if (attempts >= 10) {
            clearInterval(checkInterval);
        }
    }, 1000);
})();