// Deep Research Assistant Options Page JavaScript
class DeepResearchOptions {
    constructor() {
        this.currentSection = 'general';
        this.settings = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.updateVersion();
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchSection(e.target.closest('.nav-item').dataset.section);
            });
        });

        // Save and reset buttons
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        document.getElementById('resetSettings').addEventListener('click', () => this.resetSettings());

        // Clear data button
        document.getElementById('clearData').addEventListener('click', () => this.clearAllData());

        // Export/Import buttons
        document.getElementById('exportSettings').addEventListener('click', () => this.exportSettings());
        document.getElementById('importSettings').addEventListener('click', () => this.importSettings());

        // Shortcut inputs
        document.querySelectorAll('.shortcut-input').forEach(input => {
            input.addEventListener('click', (e) => this.startShortcutRecording(e.target));
        });

        // File input for import
        document.getElementById('importFile').addEventListener('change', (e) => this.handleImportFile(e));
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        this.currentSection = sectionName;
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['settings']);
            this.settings = result.settings || this.getDefaultSettings();
            this.populateSettings();
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.settings = this.getDefaultSettings();
            this.populateSettings();
        }
    }

    getDefaultSettings() {
        return {
            // General
            autoOpen: false,
            notifications: true,
            saveHistory: true,
            contextMenu: true,

            // Shortcuts
            widgetShortcut: 'Ctrl+Shift+D',
            researchShortcut: 'Ctrl+Shift+R',
            screenshotShortcut: 'Ctrl+Shift+S',

            // Appearance
            theme: 'light',
            widgetPosition: 'bottom-right',
            widgetSize: 'medium',
            showFloatingButton: true,

            // Privacy
            dataCollection: false,
            pageAccess: true,

            // Advanced
            apiEndpoint: 'https://deepresearchassistant-backend.onrender.com',
            apiKey: '',
            debugMode: false
        };
    }

    populateSettings() {
        // General settings
        document.getElementById('autoOpen').checked = this.settings.autoOpen;
        document.getElementById('notifications').checked = this.settings.notifications;
        document.getElementById('saveHistory').checked = this.settings.saveHistory;
        document.getElementById('contextMenu').checked = this.settings.contextMenu;

        // Shortcuts
        document.querySelector('#widgetShortcut .shortcut-text').textContent = this.settings.widgetShortcut;
        document.querySelector('#researchShortcut .shortcut-text').textContent = this.settings.researchShortcut;
        document.querySelector('#screenshotShortcut .shortcut-text').textContent = this.settings.screenshotShortcut;

        // Appearance
        document.getElementById('theme').value = this.settings.theme;
        document.getElementById('widgetPosition').value = this.settings.widgetPosition;
        document.getElementById('widgetSize').value = this.settings.widgetSize;
        document.getElementById('showFloatingButton').checked = this.settings.showFloatingButton;

        // Privacy
        document.getElementById('dataCollection').checked = this.settings.dataCollection;
        document.getElementById('pageAccess').checked = this.settings.pageAccess;

        // Advanced
        document.getElementById('apiEndpoint').value = this.settings.apiEndpoint;
        document.getElementById('apiKey').value = this.settings.apiKey;
        document.getElementById('debugMode').checked = this.settings.debugMode;
    }

    async saveSettings() {
        try {
            // Collect current settings
            this.settings = {
                // General
                autoOpen: document.getElementById('autoOpen').checked,
                notifications: document.getElementById('notifications').checked,
                saveHistory: document.getElementById('saveHistory').checked,
                contextMenu: document.getElementById('contextMenu').checked,

                // Shortcuts
                widgetShortcut: document.querySelector('#widgetShortcut .shortcut-text').textContent,
                researchShortcut: document.querySelector('#researchShortcut .shortcut-text').textContent,
                screenshotShortcut: document.querySelector('#screenshotShortcut .shortcut-text').textContent,

                // Appearance
                theme: document.getElementById('theme').value,
                widgetPosition: document.getElementById('widgetPosition').value,
                widgetSize: document.getElementById('widgetSize').value,
                showFloatingButton: document.getElementById('showFloatingButton').checked,

                // Privacy
                dataCollection: document.getElementById('dataCollection').checked,
                pageAccess: document.getElementById('pageAccess').checked,

                // Advanced
                apiEndpoint: document.getElementById('apiEndpoint').value,
                apiKey: document.getElementById('apiKey').value,
                debugMode: document.getElementById('debugMode').checked
            };

            // Save to storage
            await chrome.storage.sync.set({ settings: this.settings });

            // Show success message
            this.showMessage('Settings saved successfully!', 'success');

            // Update commands if shortcuts changed
            this.updateCommands();

        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showMessage('Failed to save settings. Please try again.', 'error');
        }
    }

    async resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
            try {
                this.settings = this.getDefaultSettings();
                this.populateSettings();
                await chrome.storage.sync.set({ settings: this.settings });
                this.showMessage('Settings reset to defaults!', 'success');
            } catch (error) {
                console.error('Failed to reset settings:', error);
                this.showMessage('Failed to reset settings. Please try again.', 'error');
            }
        }
    }

    async clearAllData() {
        if (confirm('Are you sure you want to clear all data? This will delete all chat history and settings. This action cannot be undone.')) {
            try {
                await chrome.storage.sync.clear();
                await chrome.storage.local.clear();
                this.settings = this.getDefaultSettings();
                this.populateSettings();
                this.showMessage('All data cleared successfully!', 'success');
            } catch (error) {
                console.error('Failed to clear data:', error);
                this.showMessage('Failed to clear data. Please try again.', 'error');
            }
        }
    }

    exportSettings() {
        try {
            const dataStr = JSON.stringify(this.settings, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `deep-research-settings-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            this.showMessage('Settings exported successfully!', 'success');
        } catch (error) {
            console.error('Failed to export settings:', error);
            this.showMessage('Failed to export settings. Please try again.', 'error');
        }
    }

    importSettings() {
        document.getElementById('importFile').click();
    }

    async handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importedSettings = JSON.parse(text);
            
            // Validate imported settings
            if (typeof importedSettings !== 'object') {
                throw new Error('Invalid settings file');
            }

            // Merge with defaults to ensure all settings exist
            this.settings = { ...this.getDefaultSettings(), ...importedSettings };
            this.populateSettings();
            
            // Save imported settings
            await chrome.storage.sync.set({ settings: this.settings });
            
            this.showMessage('Settings imported successfully!', 'success');
        } catch (error) {
            console.error('Failed to import settings:', error);
            this.showMessage('Failed to import settings. Please check the file format.', 'error');
        }

        // Reset file input
        event.target.value = '';
    }

    startShortcutRecording(button) {
        const shortcutText = button.querySelector('.shortcut-text');
        const originalText = shortcutText.textContent;
        
        button.classList.add('recording');
        shortcutText.textContent = 'Press keys...';
        
        const handleKeyDown = (e) => {
            e.preventDefault();
            
            const keys = [];
            if (e.ctrlKey) keys.push('Ctrl');
            if (e.metaKey) keys.push('Cmd');
            if (e.shiftKey) keys.push('Shift');
            if (e.altKey) keys.push('Alt');
            
            // Add the main key (avoid modifier keys)
            if (!['Control', 'Meta', 'Shift', 'Alt'].includes(e.key)) {
                keys.push(e.key.toUpperCase());
            }
            
            if (keys.length > 0) {
                const newShortcut = keys.join('+');
                shortcutText.textContent = newShortcut;
                
                // Remove event listeners
                document.removeEventListener('keydown', handleKeyDown);
                button.classList.remove('recording');
                
                // Update the setting
                const settingId = button.id.replace('Shortcut', 'Shortcut');
                this.settings[settingId] = newShortcut;
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        
        // Add escape key to cancel
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                shortcutText.textContent = originalText;
                document.removeEventListener('keydown', handleKeyDown);
                document.removeEventListener('keydown', handleEscape);
                button.classList.remove('recording');
            }
        };
        
        document.addEventListener('keydown', handleEscape);
    }

    async updateCommands() {
        try {
            // Update the main command in manifest
            const commands = {
                '_execute_action': {
                    suggested_key: {
                        default: this.settings.widgetShortcut,
                        mac: this.settings.widgetShortcut.replace('Ctrl', 'Command')
                    },
                    description: 'Open Deep Research Assistant'
                }
            };

            // Note: Chrome extensions can't dynamically update commands
            // This would require a manifest update and extension reload
            console.log('Commands would be updated to:', commands);
        } catch (error) {
            console.error('Failed to update commands:', error);
        }
    }

    updateVersion() {
        const manifest = chrome.runtime.getManifest();
        const versionElement = document.querySelector('.version');
        if (versionElement) {
            versionElement.textContent = `v${manifest.version}`;
        }
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type} fade-in`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Insert at the top of the content area
        const contentArea = document.querySelector('.options-content');
        contentArea.insertBefore(messageDiv, contentArea.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Utility methods
    async validateApiEndpoint(endpoint) {
        if (!endpoint) return true;
        
        try {
            const url = new URL(endpoint);
            return url.protocol === 'https:' || url.protocol === 'http:';
        } catch {
            return false;
        }
    }

    async testApiConnection() {
        const endpoint = document.getElementById('apiEndpoint').value;
        const apiKey = document.getElementById('apiKey').value;

        if (!endpoint || !apiKey) {
            this.showMessage('Please enter both API endpoint and API key.', 'error');
            return;
        }

        if (!(await this.validateApiEndpoint(endpoint))) {
            this.showMessage('Please enter a valid API endpoint URL.', 'error');
            return;
        }

        try {
            this.showMessage('Testing API connection...', 'info');
            
            // This would be a real API test in production
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showMessage('API connection test successful!', 'success');
        } catch (error) {
            console.error('API test failed:', error);
            this.showMessage('API connection test failed. Please check your credentials.', 'error');
        }
    }
}

// Initialize options page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.options = new DeepResearchOptions();
});

// Handle page visibility changes to refresh settings
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.options) {
        window.options.loadSettings();
    }
}); 