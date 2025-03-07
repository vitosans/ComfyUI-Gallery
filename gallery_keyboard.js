// Simple ES6 module for keyboard navigation
document.addEventListener('DOMContentLoaded', () => {
  console.log('Gallery keyboard shortcuts loaded from root directory');
  
  // Set up keyboard event listeners
  document.addEventListener('keydown', (event) => {
    // Find gallery popup
    const galleryPopup = document.querySelector('.gallery-popup');
    if (!galleryPopup || galleryPopup.style.display === 'none') return;
    
    // ESC key - close gallery
    if (event.key === 'Escape') {
      const fullscreenContainer = document.querySelector('.fullscreen-container');
      if (fullscreenContainer && fullscreenContainer.style.display !== 'none') {
        const closeButton = fullscreenContainer.querySelector('.fullscreen-close');
        if (closeButton) closeButton.click();
      } else {
        const closeButton = galleryPopup.querySelector('.close-button');
        if (closeButton) closeButton.click();
      }
    }
    
    // Question mark for help
    if (event.key === '?') {
      showKeyboardShortcutsHelp();
      event.preventDefault();
    }
    
    // Arrow keys in fullscreen mode
    const fullscreenContainer = document.querySelector('.fullscreen-container');
    if (fullscreenContainer && fullscreenContainer.style.display !== 'none') {
      if (event.key === 'ArrowLeft') {
        navigateImages('prev');
      } else if (event.key === 'ArrowRight') {
        navigateImages('next');
      }
    }
  });
  
  // Helper function to navigate between images
  function navigateImages(direction) {
    const fullscreenImage = document.querySelector('.fullscreen-image, .fullscreen-video');
    if (!fullscreenImage) return;
    
    const currentSrc = fullscreenImage.src;
    const imageCards = document.querySelectorAll('.image-card');
    if (!imageCards.length) return;
    
    const cards = Array.from(imageCards);
    let currentIndex = -1;
    
    for (let i = 0; i < cards.length; i++) {
      const mediaElement = cards[i].querySelector('.gallery-media');
      if (!mediaElement) continue;
      
      const mediaSrc = mediaElement.src || mediaElement.dataset.src || mediaElement.dataset.fullsrc;
      if (mediaSrc && currentSrc.includes(mediaSrc)) {
        currentIndex = i;
        break;
      }
    }
    
    if (currentIndex === -1) return;
    
    let targetIndex;
    if (direction === 'next') {
      targetIndex = (currentIndex + 1) % cards.length;
    } else {
      targetIndex = (currentIndex - 1 + cards.length) % cards.length;
    }
    
    const targetCard = cards[targetIndex];
    if (targetCard) {
      const mediaElement = targetCard.querySelector('.gallery-media');
      if (mediaElement) mediaElement.click();
    }
  }
  
  // Add keyboard help button
  const checkForGalleryPopup = setInterval(() => {
    const galleryPopup = document.querySelector('.gallery-popup');
    const popupHeader = galleryPopup ? galleryPopup.querySelector('.popup-header') : null;
    const helpButtonExists = document.querySelector('.keyboard-help-button');
    
    if (popupHeader && !helpButtonExists) {
      const helpButton = document.createElement('button');
      helpButton.classList.add('keyboard-help-button');
      helpButton.innerHTML = '⌨️ Shortcuts';
      helpButton.addEventListener('click', showKeyboardShortcutsHelp);
      
      const settingsButton = popupHeader.querySelector('.settings-button-header');
      if (settingsButton) {
        popupHeader.insertBefore(helpButton, settingsButton);
      } else {
        popupHeader.appendChild(helpButton);
      }
      
      clearInterval(checkForGalleryPopup);
    }
  }, 1000);
  
  // Function to show keyboard shortcuts help dialog
  function showKeyboardShortcutsHelp() {
    const existingDialog = document.querySelector('.keyboard-shortcuts-dialog');
    if (existingDialog) existingDialog.remove();
    
    const dialog = document.createElement('div');
    dialog.classList.add('keyboard-shortcuts-dialog');
    dialog.style.position = 'fixed';
    dialog.style.top = '0';
    dialog.style.left = '0';
    dialog.style.width = '100%';
    dialog.style.height = '100%';
    dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    dialog.style.display = 'flex';
    dialog.style.alignItems = 'center';
    dialog.style.justifyContent = 'center';
    dialog.style.zIndex = '9999';
    
    const content = document.createElement('div');
    content.style.backgroundColor = '#2a2a2a';
    content.style.borderRadius = '8px';
    content.style.padding = '20px';
    content.style.width = '400px';
    content.style.maxWidth = '90%';
    content.style.color = 'white';
    
    const title = document.createElement('div');
    title.textContent = 'Keyboard Shortcuts';
    title.style.fontSize = '20px';
    title.style.fontWeight = 'bold';
    title.style.textAlign = 'center';
    title.style.marginBottom = '15px';
    title.style.paddingBottom = '10px';
    title.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
    content.appendChild(title);
    
    const shortcuts = [
      { key: 'Esc', description: 'Close gallery or fullscreen view' },
      { key: '←', description: 'Previous image in fullscreen view' },
      { key: '→', description: 'Next image in fullscreen view' },
      { key: '?', description: 'Show this help dialog' }
    ];
    
    shortcuts.forEach(shortcut => {
      const row = document.createElement('div');
      row.style.display = 'grid';
      row.style.gridTemplateColumns = '100px 1fr';
      row.style.alignItems = 'center';
      row.style.marginBottom = '10px';
      
      const keySpan = document.createElement('span');
      keySpan.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      keySpan.style.border = '1px solid rgba(255, 255, 255, 0.2)';
      keySpan.style.borderRadius = '4px';
      keySpan.style.padding = '5px 10px';
      keySpan.style.textAlign = 'center';
      keySpan.style.fontFamily = 'monospace';
      keySpan.style.fontWeight = 'bold';
      keySpan.textContent = shortcut.key;
      row.appendChild(keySpan);
      
      const descSpan = document.createElement('span');
      descSpan.style.paddingLeft = '10px';
      descSpan.textContent = shortcut.description;
      row.appendChild(descSpan);
      
      content.appendChild(row);
    });
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.width = '100%';
    closeButton.style.padding = '8px';
    closeButton.style.backgroundColor = '#444';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.marginTop = '15px';
    closeButton.addEventListener('click', () => dialog.remove());
    content.appendChild(closeButton);
    
    dialog.appendChild(content);
    document.body.appendChild(dialog);
    
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.remove();
    });
  }
});

// Export an empty object to make this a valid ES6 module
export default {};