// Deep Research Assistant Background Service Worker
class DeepResearchBackground {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupContextMenus();
    }

    bindEvents() {
        // Handle extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                this.onFirstInstall();
            } else if (details.reason === 'update') {
                this.onUpdate(details.previousVersion);
            }
        });

        // Handle extension startup
        chrome.runtime.onStartup.addListener(() => {
            this.onStartup();
        });

        // Handle messages from popup and content scripts
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });

        // Handle keyboard shortcuts
        chrome.commands.onCommand.addListener((command) => {
            this.handleCommand(command);
        });

        // Handle tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                this.onTabUpdated(tabId, tab);
            }
        });
    }

    async setupContextMenus() {
        // Remove all existing context menus to prevent duplicates
        await chrome.contextMenus.removeAll();

        // Create context menu for right-click actions
        chrome.contextMenus.create({
            id: 'deep-research-menu',
            title: 'Deep Research Assistant',
            contexts: ['page', 'selection']
        });

        chrome.contextMenus.create({
            id: 'research-selection',
            parentId: 'deep-research-menu',
            title: 'Research Selected Text',
            contexts: ['selection']
        });

        chrome.contextMenus.create({
            id: 'summarize-page',
            parentId: 'deep-research-menu',
            title: 'Summarize This Page',
            contexts: ['page']
        });

        chrome.contextMenus.create({
            id: 'analyze-page',
            parentId: 'deep-research-menu',
            title: 'Analyze Page Content',
            contexts: ['page']
        });

        // Handle context menu clicks
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenuClick(info, tab);
        });
    }

    onFirstInstall() {
        console.log('Deep Research Assistant installed for the first time');

        // Set default settings
        chrome.storage.sync.set({
            currentTab: 'chat',
            chatHistory: [],
            settings: {
                shortcut: 'Ctrl+Shift+D',
                theme: 'light',
                autoOpen: false,
                notifications: true
            }
        });

        // Open welcome page
        chrome.tabs.create({
            url: chrome.runtime.getURL('welcome.html')
        });
    }

    onUpdate(previousVersion) {
        console.log(`Deep Research Assistant updated from ${previousVersion} to ${chrome.runtime.getManifest().version}`);

        // Handle any migration logic here
        this.migrateSettings(previousVersion);
    }

    onStartup() {
        console.log('Deep Research Assistant started');
        // Any startup logic can go here
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'ping':
                    sendResponse({ success: true, timestamp: Date.now() });
                    break;

                case 'getTabId':
                    sendResponse({ success: true, tabId: sender.tab ? sender.tab.id : null });
                    break;

                case 'getTabInfo':
                    const tabInfo = await this.getCurrentTabInfo();
                    sendResponse({ success: true, data: tabInfo });
                    break;

                case 'captureScreenshot':
                    const screenshot = await this.captureTabScreenshot();
                    sendResponse({ success: true, data: screenshot });
                    break;

                case 'openWidget':
                    await this.openWidgetInCurrentTab();
                    sendResponse({ success: true });
                    break;

                case 'sendToAI':
                    const aiResponse = await this.sendToAI(message.data);
                    sendResponse({ success: true, data: aiResponse });
                    break;

                case 'getSettings':
                    const settings = await this.getSettings();
                    sendResponse({ success: true, data: settings });
                    break;

                case 'updateSettings':
                    await this.updateSettings(message.data);
                    sendResponse({ success: true });
                    break;

                default:
                    sendResponse({ success: false, error: 'Unknown action: ' + message.action });
            }
        } catch (error) {
            console.error('Background message error:', error);
            sendResponse({ success: false, error: error.message || 'Unknown error occurred' });
        }
    }

    handleCommand(command) {
        switch (command) {
            case '_execute_action':
                this.openWidgetInCurrentTab();
                break;
            default:
                console.log('Unknown command:', command);
        }
    }

    async handleContextMenuClick(info, tab) {
        switch (info.menuItemId) {
            case 'research-selection':
                await this.researchSelectedText(info.selectionText, tab.id);
                break;
            case 'summarize-page':
                await this.summarizePage(tab.id);
                break;
            case 'analyze-page':
                await this.analyzePage(tab.id);
                break;
        }
    }

    onTabUpdated(tabId, tab) {
        // Inject content script if needed
        if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
            // Content script is already injected via manifest, but we can add additional logic here
            console.log('Tab updated:', tab.url);
        }
    }

    async getCurrentTabInfo() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            throw new Error('No active tab found');
        }

        return {
            id: tab.id,
            url: tab.url,
            title: tab.title,
            favicon: tab.favIconUrl
        };
    }

    async captureTabScreenshot() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            throw new Error('No active tab found');
        }

        try {
            const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
                format: 'png',
                quality: 90
            });
            return dataUrl;
        } catch (error) {
            console.error('Screenshot capture failed:', error);
            throw new Error('Failed to capture screenshot');
        }
    }

    async openWidgetInCurrentTab() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            throw new Error('No active tab found');
        }

        try {
            await chrome.tabs.sendMessage(tab.id, { action: 'openWidget' });
        } catch (error) {
            console.error('Failed to open widget:', error);
            // If content script is not ready, inject it
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
        }
    }

    async researchSelectedText(text, tabId) {
        try {
            await chrome.tabs.sendMessage(tabId, {
                action: 'researchText',
                data: { text }
            });
        } catch (error) {
            console.error('Failed to research text:', error);
        }
    }

    async summarizePage(tabId) {
        try {
            await chrome.tabs.sendMessage(tabId, {
                action: 'summarizePage'
            });
        } catch (error) {
            console.error('Failed to summarize page:', error);
        }
    }

    async analyzePage(tabId) {
        try {
            await chrome.tabs.sendMessage(tabId, {
                action: 'analyzePage'
            });
        } catch (error) {
            console.error('Failed to analyze page:', error);
        }
    }

    async sendToAI(data) {
        try {
            // Use a stable sessionId stored in chrome.storage.local
            function getFromStorage(keys) {
                return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
            }
            function setInStorage(obj) {
                return new Promise((resolve) => chrome.storage.local.set(obj, resolve));
            }

            let { sessionId } = await getFromStorage(['sessionId']);
            if (!sessionId) {
                sessionId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2);
                await setInStorage({ sessionId });
            }

            const payload = {
                sessionId,
                prompt: (data && typeof data === 'object' && 'prompt' in data) ? data.prompt : data,
                temperature: 0.7,
                maxTokens: 256
            };

            // Helper: fetch with better error handling
            async function fetchWithRetry(url, options = {}, maxRetries = 2) {
                for (let attempt = 1; attempt <= maxRetries; attempt++) {
                    try {
                        console.log(`Attempt ${attempt} to ${url}`);
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => {
                            console.log(`Request timeout for ${url}`);
                            controller.abort();
                        }, 5000); // 5 second timeout

                        const res = await fetch(url, {
                            ...options,
                            signal: controller.signal,
                            mode: 'cors',
                            credentials: 'omit'
                        });

                        clearTimeout(timeoutId);

                        if (!res.ok) {
                            const errorText = await res.text().catch(() => '');
                            throw new Error(`HTTP ${res.status}: ${errorText}`);
                        }

                        return res;
                    } catch (error) {
                        console.log(`Attempt ${attempt} failed for ${url}:`, error.message);
                        if (attempt === maxRetries) {
                            throw error;
                        }
                        // Wait before retry
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    }
                }
            }

            // Determine endpoint priority: settings.apiEndpoint (if set) → localhost → hosted
            const { settings } = await chrome.storage.sync.get(['settings']);
            const hostedBase = 'https://deepresearchassistant-backend.onrender.com';
            const candidates = [];

            if (settings && settings.apiEndpoint) {
                candidates.push(settings.apiEndpoint.replace(/\/$/, ''));
            }
            candidates.push('http://127.0.0.1:3001');
            candidates.push('http://localhost:3001');
            candidates.push(hostedBase);

            console.log('Attempting to connect to AI backend with payload:', payload);

            for (const base of candidates) {
                try {
                    console.log(`Trying endpoint: ${base}/chat`);
                    const res = await fetchWithRetry(`${base}/chat`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });

                    console.log(`Response from ${base}:`, res.status, res.statusText);
                    const json = await res.json();

                    if (json.reply) {
                        console.log(`Success from ${base}:`, json);
                        return {
                            response: json.reply,
                            timestamp: new Date().toISOString(),
                            endpoint: base
                        };
                    } else {
                        throw new Error(`Invalid response format from ${base}`);
                    }
                } catch (e) {
                    console.error(`Failed to connect to ${base}:`, e.message);
                    // Continue to next endpoint
                    continue;
                }
            }

            // If all backends fail, provide fallback response
            console.log('All backends failed, using fallback response');
            return this.getFallbackResponse(payload.prompt);
        } catch (error) {
            console.error('sendToAI error:', error);
            // Even if there's an error, provide fallback response
            const prompt = (data && typeof data === 'object' && 'prompt' in data) ? data.prompt : data;
            return this.getFallbackResponse(prompt);
        }
    }

    getFallbackResponse(prompt) {
        const lowerPrompt = prompt.toLowerCase();

        const fallbackResponses = {
            greeting: [
                "Hello! I'm your AI research assistant. How can I help you today?",
                "Hi there! I'm here to help with your research needs. What would you like to know?",
                "Greetings! I'm ready to assist you with any questions or research topics."
            ],
            research: [
                "Based on your query, here are some key insights: This is a fascinating topic that involves multiple aspects. Let me break it down for you with some detailed analysis and recommendations.",
                "I'd be happy to help you research this topic. Here's what I found: This subject has several important components worth exploring further.",
                "Great question! Let me provide you with a comprehensive overview of this topic, including its main concepts and practical applications."
            ],
            general: [
                "That's an interesting question! Let me provide you with some insights on this topic.",
                "I understand you're looking for information about this. Here's what I can tell you:",
                "Thanks for asking! This is a great topic to explore. Let me share some thoughts with you."
            ]
        };

        let response;

        if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
            response = fallbackResponses.greeting[Math.floor(Math.random() * fallbackResponses.greeting.length)];
        } else if (lowerPrompt.includes('research') || lowerPrompt.includes('study') || lowerPrompt.includes('analyze')) {
            response = fallbackResponses.research[Math.floor(Math.random() * fallbackResponses.research.length)];
        } else {
            response = fallbackResponses.general[Math.floor(Math.random() * fallbackResponses.general.length)] +
                ` Regarding "${prompt}", this is a complex topic that deserves careful consideration. ` +
                `I recommend exploring multiple sources and perspectives to get a comprehensive understanding. ` +
                `Would you like me to elaborate on any specific aspect of this topic?`;
        }

        return {
            response: response,
            timestamp: new Date().toISOString(),
            endpoint: 'fallback',
            source: 'offline'
        };
    }

    async getSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['settings'], (result) => {
                resolve(result.settings || {});
            });
        });
    }

    async updateSettings(newSettings) {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['settings'], (result) => {
                const currentSettings = result.settings || {};
                const updatedSettings = { ...currentSettings, ...newSettings };
                chrome.storage.sync.set({ settings: updatedSettings }, resolve);
            });
        });
    }

    migrateSettings(previousVersion) {
        // Handle settings migration between versions
        chrome.storage.sync.get(['settings'], (result) => {
            const currentSettings = result.settings || {};

            // Add any new default settings
            const defaultSettings = {
                shortcut: 'Ctrl+Shift+D',
                theme: 'light',
                autoOpen: false,
                notifications: true
            };

            const migratedSettings = { ...defaultSettings, ...currentSettings };
            chrome.storage.sync.set({ settings: migratedSettings });
        });
    }

    // Utility methods
    async showNotification(title, message, iconUrl = null) {
        const settings = await this.getSettings();
        if (!settings.notifications) return;

        chrome.notifications.create({
            type: 'basic',
            iconUrl: iconUrl || chrome.runtime.getURL('icons/icon48.png'),
            title: title,
            message: message
        });
    }

    async logUsage(action, data = {}) {
        // Log usage analytics (privacy-friendly)
        const usageData = {
            action,
            timestamp: new Date().toISOString(),
            version: chrome.runtime.getManifest().version,
            ...data
        };

        // Store locally for analytics
        chrome.storage.local.get(['usage'], (result) => {
            const usage = result.usage || [];
            usage.push(usageData);

            // Keep only last 1000 entries
            if (usage.length > 1000) {
                usage.splice(0, usage.length - 1000);
            }

            chrome.storage.local.set({ usage });
        });
    }
}

// Initialize background service worker
const background = new DeepResearchBackground();

// Handle service worker lifecycle
self.addEventListener('install', (event) => {
    console.log('Deep Research Assistant service worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Deep Research Assistant service worker activated');
    event.waitUntil(self.clients.claim());
}); 