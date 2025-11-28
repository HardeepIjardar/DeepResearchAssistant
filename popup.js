// Deep Research Assistant Popup JavaScript
class DeepResearchPopup {
    constructor() {
        this.currentTab = 'chat';
        this.chatHistory = [];
        this.isConnected = true;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.updateStatus();
    }

    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.closest('.nav-tab').dataset.tab));
        });

        // Chat functionality
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');

        sendBtn.addEventListener('click', () => this.sendMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Character counter for chat input
        const updateCharCounter = () => {
            const charCount = chatInput.value.length;
            const maxLength = 500;
            let counter = document.getElementById('chatCharCounter');
            if (!counter) {
                counter = document.createElement('div');
                counter.id = 'chatCharCounter';
                counter.className = 'char-counter';
                chatInput.parentElement.parentElement.appendChild(counter);
            }
            counter.textContent = `${charCount} / ${maxLength}`;
            counter.className = charCount > maxLength * 0.9 ? 'char-counter warning' : 'char-counter';

            // Update send button state
            sendBtn.disabled = charCount === 0 || charCount > maxLength;
        };

        chatInput.addEventListener('input', () => {
            updateCharCounter();
            this.autoResize(chatInput);
        });
        updateCharCounter();

        // Quick actions
        document.querySelectorAll('.quick-action').forEach(action => {
            action.addEventListener('click', (e) => {
                const actionType = e.target.closest('.quick-action').dataset.action;
                this.handleQuickAction(actionType);
            });
        });

        // Research functionality
        const researchInput = document.getElementById('researchInput');
        const researchBtn = document.getElementById('researchBtn');

        researchBtn.addEventListener('click', () => this.startResearch());
        researchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startResearch();
        });

        // Screenshot functionality
        document.getElementById('captureBtn').addEventListener('click', () => this.captureScreenshot());
        document.getElementById('analyzeBtn').addEventListener('click', () => this.analyzePage());

        // Settings and widget
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('openWidgetBtn').addEventListener('click', () => this.openWidget());
        document.getElementById('testBtn').addEventListener('click', () => this.openTestPage());

        // Auto-resize textarea
        chatInput.addEventListener('input', () => this.autoResize(chatInput));
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
        this.saveSettings();
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        const message = input.value.trim();

        if (!message || sendBtn.disabled) return;

        // Disable send button and update UI
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        // Add user message to chat
        this.addChatMessage('user', message);
        input.value = '';
        this.autoResize(input);

        // Update character counter
        const event = new Event('input');
        input.dispatchEvent(event);

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addChatMessage('assistant', response);
        } catch (error) {
            this.hideTypingIndicator();
            this.addChatMessage('error', error.message || 'Sorry, I encountered an error. Please try again.');
            console.error('Chat error:', error);
        } finally {
            // Re-enable send button
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    }

    addChatMessage(sender, message) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message fade-in`;

        const timestamp = new Date().toLocaleTimeString();

        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <span class="sender-name">${sender === 'user' ? 'You' : sender === 'error' ? 'System' : 'AI Assistant'}</span>
                    <span class="message-time">${timestamp}</span>
                </div>
                <div class="message-text">${this.formatMessage(message)}</div>
            </div>
        `;

        // Remove welcome message if it exists
        const welcomeMessage = chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        chatMessages.appendChild(messageDiv);

        // Force scroll to bottom with slight delay to ensure DOM update
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 10);

        // Store in history (don't store error messages)
        if (sender !== 'error') {
            this.chatHistory.push({ sender, message, timestamp });
            this.saveChatHistory();
        }
    }

    formatMessage(message) {
        // Basic markdown-like formatting
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator fade-in';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <span class="sender-name">AI Assistant</span>
                </div>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async getAIResponse(message) {
        return new Promise((resolve, reject) => {
            // Set a timeout for the message
            const timeoutId = setTimeout(() => {
                reject(new Error('⏱️ Request timed out. The AI is taking longer than expected. Please try again.'));
            }, 30000); // 30 second timeout to match backend

            chrome.runtime.sendMessage(
                { action: 'sendToAI', data: { prompt: message } },
                (resp) => {
                    clearTimeout(timeoutId);

                    if (chrome.runtime.lastError) {
                        console.error('BG message error:', chrome.runtime.lastError);
                        return reject(new Error('❌ Extension error: ' + (chrome.runtime.lastError.message || 'Communication failed')));
                    }

                    if (!resp || !resp.success) {
                        const err = resp && resp.error ? resp.error : 'Unknown error occurred';
                        return reject(new Error('⚠️ AI Error: ' + err));
                    }

                    if (resp.data && resp.data.response) {
                        resolve(resp.data.response);
                    } else {
                        reject(new Error('⚠️ Invalid response format. Please try again.'));
                    }
                }
            );
        });
    }

    handleQuickAction(actionType) {
        const actions = {
            summarize: "Please summarize the current page content for me.",
            explain: "Can you explain the main topic of this page?"
        };

        const message = actions[actionType];
        if (message) {
            document.getElementById('chatInput').value = message;
            this.sendMessage();
        }
    }

    async startResearch() {
        const input = document.getElementById('researchInput');
        const researchBtn = document.getElementById('researchBtn');
        const topic = input.value.trim();

        if (!topic || researchBtn.disabled) return;

        // Disable button and show loading state
        researchBtn.disabled = true;
        const originalContent = researchBtn.innerHTML;
        researchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        const resultsContainer = document.getElementById('researchResults');
        resultsContainer.innerHTML = `
            <div class="research-loading">
                <div class="loading-spinner"></div>
                <p>Researching "${topic}"...</p>
            </div>
        `;

        try {
            // Simulate research delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock research results
            const results = this.generateMockResearchResults(topic);
            this.displayResearchResults(results);
        } catch (error) {
            resultsContainer.innerHTML = `
                <div class="research-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to research topic. Please try again.</p>
                </div>
            `;
        } finally {
            // Re-enable button
            researchBtn.disabled = false;
            researchBtn.innerHTML = originalContent;
        }
    }

    generateMockResearchResults(topic) {
        return [
            {
                title: `Latest research on ${topic}`,
                summary: `Recent studies have shown significant developments in ${topic}...`,
                source: "Research Journal 2024",
                relevance: "High"
            },
            {
                title: `${topic} in modern applications`,
                summary: `The practical applications of ${topic} have expanded rapidly...`,
                source: "Technology Review",
                relevance: "Medium"
            },
            {
                title: `Understanding ${topic}: A comprehensive guide`,
                summary: `This comprehensive overview covers all aspects of ${topic}...`,
                source: "Academic Database",
                relevance: "High"
            }
        ];
    }

    displayResearchResults(results) {
        const resultsContainer = document.getElementById('researchResults');
        resultsContainer.innerHTML = results.map(result => `
            <div class="research-result fade-in">
                <h4>${result.title}</h4>
                <p>${result.summary}</p>
                <div class="result-meta">
                    <span class="source">${result.source}</span>
                    <span class="relevance ${result.relevance.toLowerCase()}">${result.relevance}</span>
                </div>
            </div>
        `).join('');
    }

    async captureScreenshot() {
        const preview = document.getElementById('screenshotPreview');
        preview.innerHTML = `
            <div class="capturing">
                <div class="loading-spinner"></div>
                <p>Capturing screenshot...</p>
            </div>
        `;

        try {
            // Simulate screenshot capture
            await new Promise(resolve => setTimeout(resolve, 1500));

            preview.innerHTML = `
                <div class="screenshot-captured">
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNjcmVlbnNob3QgQ2FwdHVyZWQ8L3RleHQ+PC9zdmc+" alt="Screenshot" style="max-width: 100%; border-radius: 8px;">
                    <button class="analyze-screenshot-btn" onclick="popup.analyzeScreenshot()">
                        <i class="fas fa-eye"></i> Analyze
                    </button>
                </div>
            `;
        } catch (error) {
            preview.innerHTML = `
                <div class="capture-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to capture screenshot</p>
                </div>
            `;
        }
    }

    async analyzePage() {
        const resultsContainer = document.getElementById('analysisResults');
        resultsContainer.innerHTML = `
            <div class="analyzing">
                <div class="loading-spinner"></div>
                <p>Analyzing page content...</p>
            </div>
        `;

        try {
            // Simulate page analysis
            await new Promise(resolve => setTimeout(resolve, 2000));

            resultsContainer.innerHTML = `
                <div class="analysis-complete">
                    <h4>Page Analysis Results</h4>
                    <div class="analysis-item">
                        <strong>Main Topic:</strong> Technology and Innovation
                    </div>
                    <div class="analysis-item">
                        <strong>Key Points:</strong> 5 main concepts identified
                    </div>
                    <div class="analysis-item">
                        <strong>Reading Time:</strong> ~3 minutes
                    </div>
                    <div class="analysis-item">
                        <strong>Complexity:</strong> Intermediate
                    </div>
                </div>
            `;
        } catch (error) {
            resultsContainer.innerHTML = `
                <div class="analysis-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to analyze page</p>
                </div>
            `;
        }
    }

    analyzeScreenshot() {
        // This would integrate with vision AI for screenshot analysis
        console.log('Analyzing screenshot...');
    }

    openSettings() {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    }

    openWidget() {
        // Send message to content script to open the floating widget
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'openWidget' });
        });
    }

    openTestPage() {
        chrome.tabs.create({ url: chrome.runtime.getURL('test-extension.html') });
    }

    autoResize(element) {
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 'px';
    }

    async updateStatus() {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');

        try {
            // Check if backend service worker is alive
            const response = await chrome.runtime.sendMessage({ action: 'ping' });

            if (response && response.success) {
                statusDot.className = 'status-dot online';
                statusText.textContent = 'Connected';
                this.isConnected = true;
            } else {
                throw new Error('No response from background service');
            }
        } catch (error) {
            statusDot.className = 'status-dot offline';
            statusText.textContent = 'Offline';
            this.isConnected = false;
            console.warn('Extension offline:', error);
        }
    }

    loadSettings() {
        chrome.storage.sync.get(['currentTab', 'chatHistory'], (result) => {
            if (result.currentTab) {
                this.switchTab(result.currentTab);
            }
            if (result.chatHistory) {
                this.chatHistory = result.chatHistory;
                this.loadChatHistory();
            }
        });
    }

    saveSettings() {
        chrome.storage.sync.set({
            currentTab: this.currentTab,
            chatHistory: this.chatHistory
        });
    }

    saveChatHistory() {
        chrome.storage.sync.set({ chatHistory: this.chatHistory });
    }

    loadChatHistory() {
        if (this.chatHistory.length > 0) {
            const chatMessages = document.getElementById('chatMessages');
            const welcomeMessage = chatMessages.querySelector('.welcome-message');
            if (welcomeMessage) {
                welcomeMessage.remove();
            }

            this.chatHistory.forEach(item => {
                this.addChatMessage(item.sender, item.message);
            });
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.popup = new DeepResearchPopup();
});

// Add CSS for additional components
const additionalStyles = `
    .chat-message {
        margin-bottom: 16px;
        padding: 12px;
        border-radius: 12px;
        max-width: 85%;
    }

    .user-message {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        margin-left: auto;
    }

    .assistant-message {
        background: #f8f9fa;
        color: #333;
        border: 1px solid #e9ecef;
    }

    .error-message {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }

    .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 12px;
        opacity: 0.8;
    }

    .message-text {
        line-height: 1.4;
        word-wrap: break-word;
    }

    .typing-indicator {
        margin-bottom: 16px;
        padding: 12px;
        border-radius: 12px;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        max-width: 85%;
    }

    .typing-dots {
        display: flex;
        gap: 4px;
        align-items: center;
    }

    .typing-dots span {
        width: 8px;
        height: 8px;
        background: #667eea;
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out;
    }

    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes typing {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
    }

    .research-result {
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 12px;
    }

    .research-result h4 {
        margin-bottom: 8px;
        color: #333;
        font-size: 14px;
    }

    .research-result p {
        color: #6c757d;
        font-size: 13px;
        line-height: 1.4;
        margin-bottom: 12px;
    }

    .result-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
    }

    .source {
        color: #667eea;
        font-weight: 500;
    }

    .relevance {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 500;
    }

    .relevance.high {
        background: #d4edda;
        color: #155724;
    }

    .relevance.medium {
        background: #fff3cd;
        color: #856404;
    }

    .research-loading, .capturing, .analyzing {
        text-align: center;
        padding: 40px 16px;
        color: #6c757d;
    }

    .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .screenshot-captured {
        text-align: center;
    }

    .analyze-screenshot-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 12px;
        font-size: 12px;
        transition: all 0.3s ease;
    }

    .analyze-screenshot-btn:hover {
        transform: scale(1.05);
    }

    .analysis-complete h4 {
        margin-bottom: 12px;
        color: #333;
        font-size: 14px;
    }

    .analysis-item {
        margin-bottom: 8px;
        font-size: 13px;
        color: #6c757d;
    }

    .research-error, .capture-error, .analysis-error {
        text-align: center;
        padding: 20px;
        color: #dc3545;
    }

    .research-error i, .capture-error i, .analysis-error i {
        font-size: 24px;
        margin-bottom: 8px;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet); 