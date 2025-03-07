/**
 * Exports the CSS styles for the gallery as a string.
 * @returns {string} CSS styles for the gallery.
 */
export const galleryStyles = `
    /* Basic Reset */
    * { box-sizing: border-box; }

    .gallery-popup {
        display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.8); z-index: 1000; justify-content: center;
        align-items: center; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .popup-content {
        background-color: #2a2a2a; color: #f0f0f0;
        border: 1px solid #444;
        width: 85vw;
        height: 85vh;
        max-height: 85vh;
        display: flex; flex-direction: column; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
        border-radius: 12px;
        overflow: hidden;
        padding: 24px;
    }
    .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 18px;
        padding-bottom: 12px;
        border-bottom: 1px solid #444;
    }
    .close-button {
        background-color: #e74c3c; color: white; border: none; padding: 10px 16px;
        font-size: 14px; cursor: pointer; border-radius: 6px; transition: all 0.2s ease;
        font-weight: 600;
    }
    .close-button:hover { background-color: #c0392b; transform: translateY(-2px); }

    .sort-buttons { display: flex; gap: 10px; margin-left: auto;}

    .sort-button {
        background-color: #333; color: #f0f0f0; border: 1px solid #555; padding: 8px 14px;
        font-size: 13px; cursor: pointer; border-radius: 6px; transition: all 0.2s ease;
        font-weight: 500;
    }
    .sort-button:hover { background-color: #444; transform: translateY(-1px); }
    .active-sort { 
        background-color: #2980b9; 
        color: white; 
        border-color: #3498db;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .search-container {
        width: 60%;
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
        position: relative;
    }

    .search-input {
        padding: 10px 14px;
        border-radius: 8px;
        border: 1px solid #555;
        background-color: #333;
        color: #f0f0f0;
        font-size: 14px;
        width: 75%;
        transition: all 0.2s ease;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
    }

    .search-input:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3);
    }

    .clear-search-button {
        background-color: #444;
        color: #f0f0f0;
        border: 1px solid #555;
        padding: 8px 12px;
        font-size: 14px;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.2s ease;
        margin-left: 8px;
    }
    .clear-search-button:hover{
        background-color: #555;
        transform: translateY(-1px);
    }

    .popup-main-content {
        display: flex; flex-direction: row;
        height: 72vh;
        gap: 20px;
    }
    .folder-navigation {
        width: 220px; padding-right: 20px; border-right: 1px solid #444; overflow-y: auto;
    }
    
    .folder-container {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        width: 100%;
    }
    
    .folder-button {
        display: block; width: 100%; padding: 10px 12px; border: none;
        background-color: #333; color: #f0f0f0; text-align: left; cursor: pointer;
        border-radius: 6px; transition: all 0.2s ease; white-space: nowrap;
        overflow: hidden; text-overflow: ellipsis;
        font-weight: 500;
    }
    .folder-button:hover { 
        background-color: #444; 
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .active-folder { 
        background-color: #2980b9; 
        color: white;
        box-shadow: 0 2px 6px rgba(41, 128, 185, 0.4);
    }
    
    .folder-actions-button {
        background-color: transparent;
        color: #999;
        border: none;
        font-size: 16px;
        padding: 6px 8px;
        cursor: pointer;
        margin-left: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
    }
    
    .folder-actions-button:hover {
        background-color: #444;
        color: #f0f0f0;
    }
    
    .create-folder-button {
        width: 100%;
        padding: 10px 12px;
        background-color: #27ae60;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        margin-bottom: 16px;
        transition: all 0.2s ease;
    }
    
    .create-folder-button:hover {
        background-color: #2ecc71;
        transform: translateY(-1px);
        box-shadow: 0 3px 6px rgba(0,0,0,0.1);
    }

    .image-display {
        flex: 1; padding-left: 5px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 20px;
        overflow-y: auto;
        justify-content: center;
        justify-items: center;
        align-items: start;
        padding-right: 12px;
    }

    .empty-gallery-message {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        font-style: italic;
        color: #999;
        grid-column: 1 / -1;
        font-size: 16px;
    }

    .image-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        border: none;
        padding: 0;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transition: all 0.25s ease;
        background-color: #333;
        width: 260px;
        height: 320px;
        overflow: hidden;
        position: relative;
    }

    .image-card:hover { 
        transform: translateY(-5px) scale(1.02); 
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    }

    .image-container-inner {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
   }

    .gallery-image, .gallery-media {
        width: 100%;
        height: 100%;
        display: block;
        border-radius: 12px;
        cursor: pointer;
        object-fit: cover;
        z-index: 0;
        transition: transform 0.3s ease;
    }
    
    .image-container-inner:hover .gallery-image,
    .image-container-inner:hover .gallery-media {
        transform: scale(1.05);
    }

    .card-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        color: #fff;
        padding: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
        z-index: 1;
        backdrop-filter: blur(5px);
    }

    .image-name {
        font-size: 14px;
        color: #fff;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 60%;
        font-weight: 500;
    }

    /* Media Badges */
    .media-badges {
        position: absolute;
        top: 12px;
        right: 12px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
        z-index: 1;
    }

    .media-badge {
        padding: 5px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        letter-spacing: 0.5px;
    }

    .type-badge {
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(3px);
    }

    .video-badge {
        background-color: rgba(231, 76, 60, 0.9);
    }

    .image-badge {
        background-color: rgba(46, 204, 113, 0.9);
    }

    .gif-badge {
        background-color: rgba(52, 152, 219, 0.9);
    }

    .size-badge {
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(3px);
    }

    /* Card Buttons */
    .card-buttons {
        display: flex;
        gap: 8px;
    }

    .info-button {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 6px 10px;
        font-size: 12px;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.2s ease;
        font-weight: 600;
    }
    
    .info-button:hover {
        background-color: #2980b9;
        transform: translateY(-1px);
    }
    
    .file-actions-button {
        background-color: #555;
        color: white;
        border: none;
        padding: 6px 10px;
        font-size: 14px;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.2s ease;
    }
    
    .file-actions-button:hover {
        background-color: #666;
        transform: translateY(-1px);
    }
    
    /* Context Menu */
    .file-context-menu {
        position: fixed;
        background-color: #333;
        border: 1px solid #555;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        padding: 8px 0;
        z-index: 2000;
        min-width: 160px;
    }
    
    .context-menu-item {
        padding: 10px 16px;
        cursor: pointer;
        transition: background-color 0.2s;
        color: #f0f0f0;
        font-size: 14px;
    }
    
    .context-menu-item:hover {
        background-color: #444;
    }
    
    /* Confirmation Dialog */
    .confirm-dialog {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
        z-index: 2500;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .confirm-content {
        background-color: #333;
        border-radius: 10px;
        padding: 24px;
        box-shadow: 0 6px 16px rgba(0,0,0,0.3);
        width: 400px;
        max-width: 90%;
    }
    
    .confirm-message {
        font-size: 18px;
        margin-bottom: 20px;
        color: #f0f0f0;
        text-align: center;
    }
    
    .warning-message {
        font-size: 14px;
        color: #e74c3c;
        text-align: center;
        margin-bottom: 20px;
    }
    
    .confirm-buttons {
        display: flex;
        justify-content: center;
        gap: 16px;
    }
    
    .confirm-cancel {
        background-color: #555;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    .confirm-cancel:hover {
        background-color: #666;
        transform: translateY(-2px);
    }
    
    .confirm-delete {
        background-color: #e74c3c;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    .confirm-delete:hover {
        background-color: #c0392b;
        transform: translateY(-2px);
    }
    
    /* Move Dialog */
    .move-dialog {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
        z-index: 2500;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .move-content {
        background-color: #333;
        border-radius: 10px;
        padding: 24px;
        box-shadow: 0 6px 16px rgba(0,0,0,0.3);
        width: 450px;
        max-width: 90%;
    }
    
    .move-title {
        font-size: 18px;
        margin-bottom: 20px;
        color: #f0f0f0;
    }
    
    .folder-select {
        width: 100%;
        padding: 12px;
        background-color: #444;
        color: #f0f0f0;
        border: 1px solid #555;
        border-radius: 6px;
        margin-bottom: 16px;
        font-size: 14px;
    }
    
    .new-folder-container {
        margin-bottom: 16px;
    }
    
    .new-folder-input {
        width: 100%;
        padding: 12px;
        background-color: #444;
        color: #f0f0f0;
        border: 1px solid #555;
        border-radius: 6px;
        font-size: 14px;
    }
    
    .move-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
    }
    
    .move-cancel {
        background-color: #555;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    .move-cancel:hover {
        background-color: #666;
        transform: translateY(-2px);
    }
    
    .move-confirm {
        background-color: #2980b9;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    .move-confirm:hover {
        background-color: #3498db;
        transform: translateY(-2px);
    }
    
    /* Create Folder Dialog */
    .create-folder-dialog {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
        z-index: 2500;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .create-folder-content {
        background-color: #333;
        border-radius: 10px;
        padding: 24px;
        box-shadow: 0 6px 16px rgba(0,0,0,0.3);
        width: 400px;
        max-width: 90%;
    }
    
    .create-folder-title {
        font-size: 18px;
        margin-bottom: 20px;
        color: #f0f0f0;
        text-align: center;
    }
    
    .folder-name-input {
        width: 100%;
        padding: 12px;
        background-color: #444;
        color: #f0f0f0;
        border: 1px solid #555;
        border-radius: 6px;
        margin-bottom: 20px;
        font-size: 14px;
    }
    
    .create-folder-buttons {
        display: flex;
        justify-content: center;
        gap: 16px;
    }
    
    .create-folder-cancel {
        background-color: #555;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    .create-folder-cancel:hover {
        background-color: #666;
        transform: translateY(-2px);
    }
    
    .create-folder-confirm {
        background-color: #27ae60;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    .create-folder-confirm:hover {
        background-color: #2ecc71;
        transform: translateY(-2px);
    }
    
    /* Toast Messages */
    .gallery-toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background-color: #333;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 3000;
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
    }
    
    .gallery-toast.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
    
    .toast-success {
        border-left: 4px solid #2ecc71;
    }
    
    .toast-error {
        border-left: 4px solid #e74c3c;
    }

    /* Fullscreen Container Styles (for both image and info) */
    .fullscreen-container {
        display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.95); z-index: 2000;
        justify-content: center; align-items: center;
        flex-direction: column;
        backdrop-filter: blur(5px);
    }

    /* Common close button style for both full image and info */
    .fullscreen-close, .info-close, .raw-metadata-close {
        position: absolute; top: 20px; right: 30px; color: #fff; font-size: 36px;
        font-weight: bold; cursor: pointer; z-index: 2001;
        transition: all 0.2s ease;
    }
    
    .fullscreen-close:hover, .info-close:hover, .raw-metadata-close:hover {
        color: #e74c3c;
        transform: scale(1.1);
    }
    
    /* Fullscreen Controls */
    .fullscreen-controls {
        position: absolute;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 16px;
        z-index: 2001;
    }
    
    .fullscreen-download-button {
        background-color: #27ae60;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .fullscreen-download-button:hover {
        background-color: #2ecc71;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    /* Fullscreen Image Styles */
    .fullscreen-image { 
        max-width: 90%; 
        max-height: 80%; 
        display: block; 
        border-radius: 6px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        transition: transform 0.3s ease;
    }
    
    .fullscreen-image:hover {
        transform: scale(1.01);
    }
    
    /* Fullscreen Video Styles */
    .fullscreen-video {
        max-width: 90%;
        max-height: 90%;
        display: block;
        border-radius: 6px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }

    /* Info Window Styles */
    .info-window {
        background-color: #222; color: #f0f0f0; border-radius: 12px; padding: 24px;
        max-width: 85%; max-height: 85%; overflow-y: auto; position: relative;
        box-shadow: 0 12px 28px rgba(0,0,0,0.5);
    }

    .info-content {
        display: flex; flex-direction: row; align-items: flex-start; gap: 30px;
    }

    .info-preview-image {
        max-width: 450px; max-height: 450px; border-radius: 10px; display: block;
        object-fit: contain;
        box-shadow: 0 6px 16px rgba(0,0,0,0.3);
        transition: transform 0.3s ease;
    }
    
    .info-preview-image:hover {
        transform: scale(1.02);
    }

    .metadata-table {
        flex: 1; display: flex; flex-direction: column; gap: 12px;
    }

    .metadata-row {
        display: flex; flex-direction: row; align-items: baseline;
        border-bottom: 1px solid #333;
        padding-bottom: 8px;
    }

    .metadata-label {
        font-weight: bold; margin-right: 16px; flex-basis: 140px; text-align: right;
        color: #3498db;
    }

    .metadata-value {
        flex: 1; word-break: break-word;
        font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        font-size: 14px;
    }

    .raw-metadata-button {
        background-color: #555; color: #f0f0f0; border: 1px solid #666; padding: 10px 18px;
        font-size: 14px; cursor: pointer; border-radius: 8px; transition: all 0.2s ease;
        align-self: flex-start;
        margin-top: 24px;
        font-weight: 600;
    }
    .raw-metadata-button:hover { 
        background-color: #666; 
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }


    /* Raw Metadata Window Styles */
    .raw-metadata-window {
        display: none; position: fixed; top: 50%; left: 50%;
        background-color: #222; color: #f0f0f0; border-radius: 12px; padding: 24px;
        width: 70vw; height: 80vh; overflow: auto; z-index: 2002;
        transform: translate(-50%, -50%); box-shadow: 0 16px 32px rgba(0, 0, 0, 0.6);
        flex-direction: column;
    }

    .raw-metadata-content {
        width: 100%; height: 100%;
    }

    .raw-metadata-content textarea {
        width: 100%; height: 100%; background-color: #333; color: #f0f0f0;
        border: 1px solid #444; padding: 16px; font-family: 'Menlo', 'Monaco', 'Courier New', monospace; font-size: 14px;
        box-sizing: border-box;
        border-radius: 8px;
        line-height: 1.5;
    }
    .raw-metadata-close {
        top: 10px;
    }


    .date-separator {
        grid-column: 1 / -1;
        text-align: center;
        padding: 12px;
        font-size: 16px;
        color: #f0f0f0;
        border-top: 1px solid #444;
        border-bottom: 1px solid #444;
        margin-top: 16px;
        margin-bottom: 16px;
        width: 100%;
        background-color: #2c2c2c;
        border-radius: 8px;
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

     @media (max-width: 768px) {
        .popup-content { width: 95%; margin: 5% auto; }
        .popup-main-content { flex-direction: column; }
        .folder-navigation {
            width: 100%; border-right: none; border-bottom: 1px solid #444;
            margin-bottom: 16px;
            max-height: 150px;
            overflow-x: auto;
            overflow-y: auto;
            white-space: nowrap;
            padding-bottom: 16px;
        }
        .folder-button{ display: inline-block; width: auto; }
        .image-display { padding-left: 0; }
        .search-container {
            width: 100%;
            margin-bottom: 12px;
        }
        .search-input {
            width: calc(100% - 60px);
            margin-right: 8px;
        }

        .popup-header {
            flex-wrap: wrap;
            gap: 12px;
        }
         .clear-search-button{
            margin-right: 0px;
        }
        
        .info-content { flex-direction: column; align-items: center; }
        .info-preview-image { max-width: 100%; max-height: 300px; }
        .metadata-table { width: 100%; }
        .metadata-label { text-align: left; flex-basis: 100px; margin-right: 8px; }
        
        .sort-buttons {
            order: 3;
            width: 100%;
            justify-content: center;
        }
    }

    .gallery-button {
        background-color: #3498db; color: white; border: none;
        padding: 10px 16px; font-size: 14px; cursor: pointer;
        border-radius: 8px; transition: all 0.2s ease;
        font-weight: 600;
        box-shadow: 0 3px 6px rgba(0,0,0,0.1);
    }
    .gallery-button:hover { 
        background-color: #2980b9; 
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    /* Settings Popup Styles */
    .gallery-settings-popup {
        display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.8); z-index: 1001;
        justify-content: center; align-items: center;
        backdrop-filter: blur(5px);
    }

    .settings-popup-content {
        background-color: #2a2a2a; color: #f0f0f0; border-radius: 12px; padding: 24px;
        width: 60vw; max-height: 80vh; overflow-y: auto; 
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
    }

    .settings-popup-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #444;
    }

    .settings-close-button {
        background-color: #e74c3c; color: white; border: none; padding: 10px 16px;
        font-size: 14px; cursor: pointer; border-radius: 8px; transition: all 0.2s ease;
        font-weight: 600;
    }
    .settings-close-button:hover { 
        background-color: #c0392b; 
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }


    .settings-popup-body {
        display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px;
    }

    .setting-item {
        display: flex; flex-direction: column; gap: 8px;
        background-color: #333;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .setting-item label {
        font-weight: bold; font-size: 15px;
        color: #3498db;
    }

    .setting-item input[type="text"] {
        background-color: #444; color: #f0f0f0; border: 1px solid #555; border-radius: 6px;
        padding: 12px; font-size: 14px;
        transition: all 0.2s ease;
    }
    
    .setting-item input[type="text"]:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3);
        outline: none;
    }
    
    .setting-item input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
    }


    .save-settings-button {
        background-color: #27ae60; color: white; border: none; padding: 12px 24px;
        font-size: 16px; cursor: pointer; border-radius: 8px; transition: all 0.2s ease;
        align-self: flex-start;
        font-weight: 600;
        box-shadow: 0 3px 6px rgba(0,0,0,0.1);
    }
    .save-settings-button:hover { 
        background-color: #2ecc71; 
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }


    /* Floating Button Styles */
    .floating-button-container {
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }

    .floating-button-handle {
        background-color: #444;
        color: #f0f0f0;
        cursor: move;
        width: 24px;
        height: auto;
        flex-grow: 0;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1001;
        padding: 4px 0;
        border-top-left-radius: 8px;
        border-bottom-left-radius: 8px;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }
    
    .floating-button-handle:active {
        cursor: grabbing;
        background-color: #555;
    }

    .floating-button-handle::before {
        content: '⋮';
        color: #f0f0f0;
        opacity: 0.9;
        font-size: 18px;
    }


    .gallery-button {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
    }

    /* Video/GIF Card Styles */
    .gallery-media {
        width: 100%;
        height: 100%;
        display: block;
        border-radius: 12px;
        cursor: pointer;
        object-fit: cover;
        background-color: #1a1a1a;
    }

    .play-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 48px;
        color: white;
        opacity: 0.9;
        text-shadow: 0 2px 6px rgba(0,0,0,0.8);
        pointer-events: none;
        z-index: 1;
    }

    /* No Metadata Message Style */
    .no-metadata-message {
        font-style: italic;
        color: #999;
        padding: 16px;
        text-align: center;
        font-size: 16px;
        background-color: #333;
        border-radius: 8px;
        margin-top: 16px;
    }
    
    /* Loading spinner/indicator */
    .loading-indicator {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60px;
        height: 60px;
        border: 6px solid rgba(255, 255, 255, 0.1);
        border-top: 6px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
    
    /* Customizable scrollbar for better UX */
    .image-display::-webkit-scrollbar,
    .folder-navigation::-webkit-scrollbar {
        width: 10px;
    }
    
    .image-display::-webkit-scrollbar-track,
    .folder-navigation::-webkit-scrollbar-track {
        background: #333;
        border-radius: 6px;
    }
    
    .image-display::-webkit-scrollbar-thumb,
    .folder-navigation::-webkit-scrollbar-thumb {
        background: #555;
        border-radius: 6px;
        transition: background-color 0.3s ease;
    }
    
    .image-display::-webkit-scrollbar-thumb:hover,
    .folder-navigation::-webkit-scrollbar-thumb:hover {
        background: #3498db;
    }
    
    /* View mode toggle buttons */
    .view-mode-buttons {
        display: flex;
        gap: 10px;
        margin-right: 12px;
    }
    
    .view-mode-button {
        background-color: #333;
        color: #f0f0f0;
        border: 1px solid #555;
        padding: 8px 14px;
        font-size: 14px;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
    }
    
    .view-mode-button:hover {
        background-color: #444;
        transform: translateY(-1px);
    }
    
    .view-mode-button.active {
        background-color: #2980b9;
        color: white;
        border-color: #3498db;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    /* Settings Button in Header */
    .settings-button-header {
        background-color: #555;
        color: #f0f0f0;
        border: 1px solid #666;
        padding: 8px 14px;
        font-size: 13px;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s ease;
        margin-left: 10px;
        font-weight: 500;
    }
    
    .settings-button-header:hover {
        background-color: #666;
        transform: translateY(-1px);
    }
`;