// welcome.js

document.addEventListener('DOMContentLoaded', () => {
  // Start Using button
  const startBtn = document.querySelector('.btn-primary');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      window.close();
    });
  }

  // Settings button
  const settingsBtn = document.querySelector('.btn-secondary');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    });
  }

  // Auto-close after 30 seconds
  setTimeout(() => {
    window.close();
  }, 30000);
}); 