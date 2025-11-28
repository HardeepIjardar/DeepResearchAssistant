// Deep Research Assistant Content Script
class DeepResearchContent {
	constructor() {
		this.isWidgetOpen = false;
		this.floatingButton = null;
		this.chatWidget = null;
		this.detectedTopic = null;
		this.currentTabId = null;
		this.chatHistory = [];
		this.pageContext = null; // Store page context when widget opens
		this.init();
	}

	async init() {
		// Get current tab ID
		await this.getCurrentTabId();

		this.detectedTopic = this.extractSearchTopic();
		this.createFloatingButton();
		this.bindEvents();
		this.listenForMessages();

		// Load chat history for this tab
		this.loadChatHistory();
	}

	async getCurrentTabId() {
		return new Promise((resolve) => {
			chrome.runtime.sendMessage({ action: 'getTabId' }, (response) => {
				if (response && response.tabId) {
					this.currentTabId = response.tabId;
				}
				resolve();
			});
		});
	}

	loadChatHistory() {
		if (!this.currentTabId) return;

		const storageKey = `chatHistory_${this.currentTabId}`;
		const stored = localStorage.getItem(storageKey);
		if (stored) {
			try {
				this.chatHistory = JSON.parse(stored);
			} catch (e) {
				this.chatHistory = [];
			}
		}
	}

	saveChatHistory() {
		if (!this.currentTabId) return;

		const storageKey = `chatHistory_${this.currentTabId}`;
		localStorage.setItem(storageKey, JSON.stringify(this.chatHistory));
	}

	extractSearchTopic() {
		const url = window.location.href;
		// Google
		if (url.includes('://www.google.') && url.includes('/search')) {
			const params = new URLSearchParams(window.location.search);
			return params.get('q') || this.getInputValue('input[name="q"]');
		}
		// Bing
		if (url.includes('://www.bing.') && url.includes('/search')) {
			const params = new URLSearchParams(window.location.search);
			return params.get('q') || this.getInputValue('input[name="q"]');
		}
		// DuckDuckGo
		if (url.includes('://duckduckgo.com/') && url.includes('?q=')) {
			const params = new URLSearchParams(window.location.search);
			return params.get('q') || this.getInputValue('input[name="q"]');
		}
		return null;
	}

	getInputValue(selector) {
		const el = document.querySelector(selector);
		return el ? el.value : null;
	}

	createFloatingButton() {
		// Create floating button
		this.floatingButton = document.createElement('div');
		this.floatingButton.id = 'deep-research-floating-btn';
		this.floatingButton.className = 'deep-research-floating-btn';
		this.floatingButton.innerHTML = `
			<div class="floating-btn-icon">
				<i class="fas fa-brain"></i>
			</div>
			<div class="floating-btn-tooltip">
				<span>Deep Research Assistant</span>
				<small>Ctrl+Shift+D</small>
			</div>
		`;

		// Add styles
		const styles = `
			.deep-research-floating-btn {
				position: fixed;
				bottom: 20px;
				right: 20px;
				width: 60px;
				height: 60px;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				border-radius: 50%;
				box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
				cursor: pointer;
				z-index: 10000;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.3s ease;
				user-select: none;
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			}

			.deep-research-floating-btn:hover {
				transform: scale(1.1);
				box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
			}

			.floating-btn-icon {
				color: white;
				font-size: 24px;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.floating-btn-tooltip {
				position: absolute;
				right: 70px;
				top: 50%;
				transform: translateY(-50%);
				background: rgba(0, 0, 0, 0.8);
				color: white;
				padding: 8px 12px;
				border-radius: 8px;
				font-size: 12px;
				white-space: nowrap;
				opacity: 0;
				pointer-events: none;
				transition: opacity 0.3s ease;
				display: flex;
				flex-direction: column;
				align-items: center;
			}

			.floating-btn-tooltip::after {
				content: '';
				position: absolute;
				right: -6px;
				top: 50%;
				transform: translateY(-50%);
				border-left: 6px solid rgba(0, 0, 0, 0.8);
				border-top: 6px solid transparent;
				border-bottom: 6px solid transparent;
			}

			.deep-research-floating-btn:hover .floating-btn-tooltip {
				opacity: 1;
			}

			.floating-btn-tooltip small {
				font-size: 10px;
				opacity: 0.7;
				margin-top: 2px;
			}

			/* Chat Widget Styles */
			.deep-research-widget {
				position: fixed;
				bottom: 100px;
				right: 20px;
				width: 350px;
				height: 500px;
				background: white;
				border-radius: 16px;
				box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
				z-index: 10001;
				display: flex;
				flex-direction: column;
				overflow: hidden;
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
				transform: translateX(400px);
				transition: transform 0.3s ease;
			}

			.deep-research-widget.open {
				transform: translateX(0);
			}

			.widget-header {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				color: white;
				padding: 16px 20px;
				display: flex;
				justify-content: space-between;
				align-items: center;
			}

			.widget-title {
				font-size: 16px;
				font-weight: 600;
				display: flex;
				align-items: center;
				gap: 8px;
			}

			.widget-close {
				background: rgba(255, 255, 255, 0.2);
				border: none;
				color: white;
				width: 28px;
				height: 28px;
				border-radius: 6px;
				cursor: pointer;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.3s ease;
			}

			.widget-close:hover {
				background: rgba(255, 255, 255, 0.3);
			}

			.widget-content {
				flex: 1;
				display: flex;
				flex-direction: column;
				padding: 0;
				min-height: 0;
				overflow: hidden;
			}

			.widget-messages {
				flex: 1 1 auto;
				overflow-y: auto;
				overflow-x: hidden;
				padding: 16px;
				min-height: 0;
			}

			.widget-message {
				margin-bottom: 12px;
				padding: 10px;
				border-radius: 12px;
				max-width: 85%;
				font-size: 13px;
				line-height: 1.4;
				word-wrap: break-word;
			}

			.widget-message.user {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				color: white;
				margin-left: auto;
			}

			.widget-message.assistant {
				background: #f8f9fa;
				color: #333;
				border: 1px solid #e9ecef;
			}

			.widget-input-container {
				flex-shrink: 0;
				display: flex;
				gap: 8px;
				align-items: flex-end;
				padding: 12px 16px;
				border-top: 1px solid #e9ecef;
				background: white;
			}

			.widget-input {
				flex: 1;
				padding: 10px 12px;
				border: 2px solid #e9ecef;
				border-radius: 12px;
				font-size: 13px;
				font-family: inherit;
				resize: none;
				outline: none;
				transition: border-color 0.3s ease;
				max-height: 100px;
				min-height: 40px;
			}

			.widget-input:focus {
				border-color: #667eea;
			}

			.widget-input:disabled {
				background-color: #f5f5f5;
				cursor: not-allowed;
				opacity: 0.7;
			}

			.widget-send {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				border: none;
				color: white;
				width: 36px;
				height: 36px;
				border-radius: 10px;
				cursor: pointer;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.3s ease;
				flex-shrink: 0;
			}

			.widget-send:hover {
				transform: scale(1.05);
			}

			.widget-send:disabled {
				opacity: 0.5;
				cursor: not-allowed;
				transform: none;
			}

			/* Scrollbar for widget */
			.widget-messages::-webkit-scrollbar {
				width: 4px;
			}

			.widget-messages::-webkit-scrollbar-track {
				background: #f1f1f1;
				border-radius: 2px;
			}

			.widget-messages::-webkit-scrollbar-thumb {
				background: #c1c1c1;
				border-radius: 2px;
			}

			.widget-messages::-webkit-scrollbar-thumb:hover {
				background: #a8a8a8;
			}

			/* Welcome message */
			.widget-welcome {
				text-align: center;
				padding: 20px;
				color: #6c757d;
			}

			.widget-welcome-icon {
				width: 48px;
				height: 48px;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				margin: 0 auto 12px;
				color: white;
				font-size: 20px;
			}

			.widget-welcome h4 {
				margin-bottom: 6px;
				color: #333;
				font-size: 14px;
			}

			.widget-welcome p {
				font-size: 12px;
				line-height: 1.4;
			}

			/* Responsive */
			@media (max-width: 768px) {
				.deep-research-widget {
					width: calc(100vw - 40px);
					right: 20px;
					left: 20px;
				}
			}
		`;

		const styleSheet = document.createElement('style');
		styleSheet.textContent = styles;
		document.head.appendChild(styleSheet);

		// Add Font Awesome
		if (!document.querySelector('link[href*="font-awesome"]')) {
			const fontAwesome = document.createElement('link');
			fontAwesome.rel = 'stylesheet';
			fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
			document.head.appendChild(fontAwesome);
		}

		document.body.appendChild(this.floatingButton);
	}

	bindEvents() {
		// Floating button click
		this.floatingButton.addEventListener('click', () => {
			this.toggleWidget();
		});

		// Keyboard shortcut
		document.addEventListener('keydown', (e) => {
			if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
				e.preventDefault();
				this.toggleWidget();
			}
		});
	}

	listenForMessages() {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message.action === 'openWidget') {
				this.openWidget();
				sendResponse({ success: true });
			}
		});
	}

	toggleWidget() {
		if (this.isWidgetOpen) {
			this.closeWidget();
		} else {
			this.openWidget();
		}
	}

	openWidget() {
		// Remove any previous widget completely
		if (this.chatWidget && this.chatWidget.parentNode) {
			this.chatWidget.parentNode.removeChild(this.chatWidget);
			this.chatWidget = null;
		}

		// Capture page context when widget opens (ONCE per session)
		// This ensures Amazon store vs Amazon rainforest distinction
		if (!this.pageContext || this.chatHistory.length === 0) {
			console.log('📄 Capturing page context for AI...');
			this.pageContext = this.getPageInfo();
			console.log('✅ Page context captured:', this.pageContext.semanticContext);
		}

		// Create fresh widget with default position and size
		this.createChatWidget(this.detectedTopic);

		// Ensure default positioning
		this.chatWidget.style.cssText = `
			position: fixed;
			bottom: 100px;
			right: 20px;
			width: 350px;
			height: 500px;
			min-width: 300px;
			min-height: 350px;
			max-width: 95vw;
			max-height: 90vh;
		`;

		// Open with animation
		setTimeout(() => {
			this.chatWidget.classList.add('open');
			this.isWidgetOpen = true;
		}, 10);

		// Focus input after animation
		setTimeout(() => {
			const input = this.chatWidget.querySelector('.widget-input');
			if (input) input.focus();
		}, 350);
	}

	closeWidget() {
		if (this.chatWidget) {
			this.chatWidget.classList.remove('open');
			this.isWidgetOpen = false;

			// Note: We keep pageContext alive as long as chat history exists
			// This ensures context persists across widget open/close in same tab

			// Remove widget from DOM after transition
			setTimeout(() => {
				if (this.chatWidget && this.chatWidget.parentNode) {
					this.chatWidget.parentNode.removeChild(this.chatWidget);
					this.chatWidget = null;
				}
			}, 300); // Wait for slide out animation
		}
	}

	createChatWidget(topic) {
		this.chatWidget = document.createElement('div');
		this.chatWidget.className = 'deep-research-widget';

		// Build initial messages from history
		let messagesHTML = '';
		if (this.chatHistory.length > 0) {
			// Restore chat history
			messagesHTML = this.chatHistory.map(msg =>
				`<div class="widget-message ${msg.sender}">${this.escapeHTML(msg.message)}</div>`
			).join('');
		} else if (topic) {
			// Show topic greeting
			messagesHTML = `<div class='widget-greeting'><div class='widget-greeting-icon'><i class='fas fa-lightbulb'></i></div><h4>Hello! I see you're interested in <span class='topic-highlight'>${this.escapeHTML(topic)}</span>.</h4><p>How can I assist you with your research or provide deeper insights on this subject?</p></div>`;
		} else {
			// Show welcome message
			messagesHTML = `<div class="widget-welcome"><div class="widget-welcome-icon"><i class="fas fa-robot"></i></div><h4>Hello! I'm your AI Research Assistant</h4><p>Ask me anything about this page or any topic you're researching.</p></div>`;
		}

		this.chatWidget.innerHTML = `
			<div class="resize-handle top"></div>
			<div class="resize-handle left"></div>
			<div class="resize-handle bottom"></div>
			<div class="resize-handle topleft"></div>
			<div class="resize-handle bottomleft"></div>
			<div class="widget-header">
				<div class="widget-title">
					<i class="fas fa-brain"></i>
					<span>Deep Research Assistant</span>
				</div>
				<button class="widget-close" id="widgetClose">
					<i class="fas fa-times"></i>
				</button>
			</div>
			<div class="widget-content">
				<div class="widget-messages" id="widgetMessages">
					${messagesHTML}
				</div>
				<div class="widget-input-container">
					<textarea 
						class="widget-input" 
						id="widgetInput" 
						placeholder="Ask me anything..."
						rows="1"
					></textarea>
					<button class="widget-send" id="widgetSend">
						<i class="fas fa-paper-plane"></i>
					</button>
				</div>
			</div>
		`;

		// Bind widget events
		this.chatWidget.querySelector('#widgetClose').addEventListener('click', () => {
			this.closeWidget();
		});

		const input = this.chatWidget.querySelector('#widgetInput');
		const sendBtn = this.chatWidget.querySelector('#widgetSend');

		sendBtn.addEventListener('click', () => this.sendWidgetMessage());
		input.addEventListener('keypress', (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				this.sendWidgetMessage();
			}
		});

		// Auto-resize textarea
		input.addEventListener('input', () => {
			input.style.height = 'auto';
			input.style.height = Math.min(input.scrollHeight, 100) + 'px';
		});

		// Add resize logic
		this.addWidgetResizeHandlers();

		document.body.appendChild(this.chatWidget);

		// Scroll to bottom if there's history
		if (this.chatHistory.length > 0) {
			setTimeout(() => {
				const messagesContainer = this.chatWidget.querySelector('#widgetMessages');
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			}, 100);
		}
	}

	addWidgetResizeHandlers() {
		const widget = this.chatWidget;
		const minWidth = 300;
		const minHeight = 350;
		let startX, startY, startWidth, startHeight, startTop, startLeft, startRight, startBottom;
		let resizing = false;
		let direction = '';
		function clamp(val, min, max) {
			return Math.max(min, Math.min(max, val));
		}
		function onMouseMove(e) {
			if (!resizing) return;
			let dx = e.clientX - startX;
			let dy = e.clientY - startY;
			let newWidth = startWidth;
			let newHeight = startHeight;
			let newTop = startTop;
			let newLeft = startLeft;
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			if (direction.includes('left')) {
				widget.style.right = '';
				let newLeft = startLeft + dx;
				if (newLeft < 0) {
					newLeft = 0;
				}
				let newWidth = startWidth - (newLeft - startLeft);
				newWidth = clamp(newWidth, minWidth, viewportWidth - newLeft);
				widget.style.left = newLeft + 'px';
				widget.style.width = newWidth + 'px';
			}
			if (direction.includes('top')) {
				widget.style.bottom = '';
				// Calculate new top and height so bottom stays fixed
				newTop = clamp(startTop + dy, 0, startTop + startHeight - minHeight);
				newHeight = clamp(startHeight - dy, minHeight, startTop + startHeight - newTop);
				widget.style.top = newTop + 'px';
				widget.style.height = newHeight + 'px';
			}
			if (direction.includes('bottom')) {
				newHeight = clamp(startHeight + dy, minHeight, viewportHeight - (widget.offsetTop || 0));
				widget.style.height = newHeight + 'px';
			}
		}
		function onMouseUp() {
			resizing = false;
			direction = '';
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}
		['top', 'left', 'bottom', 'topleft', 'bottomleft'].forEach(dir => {
			const handle = widget.querySelector('.resize-handle.' + dir);
			if (handle) {
				handle.addEventListener('mousedown', (e) => {
					e.preventDefault();
					resizing = true;
					direction = dir;
					startX = e.clientX;
					startY = e.clientY;
					startWidth = widget.offsetWidth;
					startHeight = widget.offsetHeight;
					startTop = widget.offsetTop;
					startLeft = widget.offsetLeft;
					startRight = parseInt(window.getComputedStyle(widget).right) || 0;
					startBottom = parseInt(window.getComputedStyle(widget).bottom) || 0;
					document.addEventListener('mousemove', onMouseMove);
					document.addEventListener('mouseup', onMouseUp);
				});
			}
		});
	}

	async sendWidgetMessage() {
		const input = this.chatWidget.querySelector('#widgetInput');
		const sendBtn = this.chatWidget.querySelector('#widgetSend');
		const message = input.value.trim();

		if (!message || sendBtn.disabled) return;

		// Disable input and send button to prevent multiple messages
		input.disabled = true;
		sendBtn.disabled = true;
		sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

		// Add user message
		this.addWidgetMessage('user', message);
		input.value = '';
		input.style.height = 'auto';

		// Show typing indicator
		this.showWidgetTyping();

		try {
			// Get AI response
			const response = await this.getAIResponse(message);
			this.hideWidgetTyping();
			this.addWidgetMessage('assistant', response);
		} catch (error) {
			this.hideWidgetTyping();
			this.addWidgetMessage('assistant', 'Sorry, I encountered an error. Please try again.');
			console.error('Widget chat error:', error);
		} finally {
			// Re-enable input and send button
			input.disabled = false;
			sendBtn.disabled = false;
			sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
			input.focus();
		}
	}

	addWidgetMessage(sender, message) {
		const messagesContainer = this.chatWidget.querySelector('#widgetMessages');
		const welcomeMessage = messagesContainer.querySelector('.widget-welcome, .widget-greeting');

		if (welcomeMessage) {
			welcomeMessage.remove();
		}

		const messageDiv = document.createElement('div');
		messageDiv.className = `widget-message ${sender}`;
		messageDiv.textContent = message;

		messagesContainer.appendChild(messageDiv);

		// Save to history
		this.chatHistory.push({ sender, message });
		this.saveChatHistory();

		// Always scroll to the bottom after adding a message
		messagesContainer.scrollTop = messagesContainer.scrollHeight;
	}

	showWidgetTyping() {
		const messagesContainer = this.chatWidget.querySelector('#widgetMessages');
		const typingDiv = document.createElement('div');
		typingDiv.className = 'widget-message assistant';
		typingDiv.id = 'widgetTyping';
		typingDiv.innerHTML = `
			<div style="display: flex; gap: 4px; align-items: center;">
				<span style="width: 6px; height: 6px; background: #667eea; border-radius: 50%; animation: typing 1.4s infinite ease-in-out;"></span>
				<span style="width: 6px; height: 6px; background: #667eea; border-radius: 50%; animation: typing 1.4s infinite ease-in-out; animation-delay: 0.2s;"></span>
				<span style="width: 6px; height: 6px; background: #667eea; border-radius: 50%; animation: typing 1.4s infinite ease-in-out; animation-delay: 0.4s;"></span>
			</div>
		`;
		messagesContainer.appendChild(typingDiv);
		// Always scroll to the bottom after adding typing indicator
		messagesContainer.scrollTop = messagesContainer.scrollHeight;
	}

	hideWidgetTyping() {
		const typingIndicator = this.chatWidget.querySelector('#widgetTyping');
		if (typingIndicator) {
			typingIndicator.remove();
		}
	}
	async getAIResponse(message) {
		return new Promise((resolve, reject) => {
			// Build prompt with LOCKED page context
			let prompt = message;

			// Check if this is the first message in the session
			const isFirstMessage = this.chatHistory.length === 0 ||
				this.chatHistory.filter(m => m.sender === 'user').length === 0;

			if (isFirstMessage && this.pageContext) {
				// FIRST MESSAGE: Establish context with page content
				console.log('🎯 First message - establishing page context for AI');
				prompt = `IMPORTANT CONTEXT - The user is viewing a specific web page. You must answer based ONLY on this page context:

${this.pageContext.semanticContext}

CRITICAL INSTRUCTION: All your responses in this conversation must be relevant to the above page content. If the user asks about something unrelated to this page, politely redirect them to ask about the page topic.

User's first question: ${message}`;
			} else if (this.detectedTopic && !this.pageContext) {
				// Fallback to topic if no page context (shouldn't happen normally)
				prompt = `Context: The user is researching "${this.detectedTopic}". Only answer questions related to this topic. If the question is unrelated, politely redirect to the topic.\n\nQuestion: ${message}`;
			}

			console.log('💬 Sending to AI:', isFirstMessage ? 'WITH page context' : 'continuing conversation');

			// Set a timeout for the message
			const timeoutId = setTimeout(() => {
				reject(new Error('Request timed out. Please try again.'));
			}, 30000); // 30 second timeout

			chrome.runtime.sendMessage(
				{ action: 'sendToAI', data: { prompt: prompt } },
				(resp) => {
					clearTimeout(timeoutId);

					if (chrome.runtime.lastError) {
						console.error('BG message error:', chrome.runtime.lastError);
						return reject(new Error(chrome.runtime.lastError.message || 'Extension communication error'));
					}

					if (!resp || !resp.success) {
						const err = resp && resp.error ? resp.error : 'Unknown error occurred';
						return reject(new Error(err));
					}

					if (resp.data && resp.data.response) {
						resolve(resp.data.response);
					} else {
						reject(new Error('Invalid response format from AI backend'));
					}
				}
			);
		});
	}

	// Get comprehensive page information for AI context
	getPageInfo() {
		const title = document.title || '';
		const url = window.location.href;
		const description = this.getMetaDescription();

		// Get main content with better extraction
		const mainContent = this.getPageContent();

		// Extract headings for topic understanding
		const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
			.slice(0, 5)
			.map(h => h.textContent.trim())
			.filter(Boolean);

		// Build semantic context description
		let semanticContext = '';
		if (title) {
			semanticContext += `Page Title: "${title}"\n`;
		}
		if (description) {
			semanticContext += `Description: ${description}\n`;
		}
		if (headings.length > 0) {
			semanticContext += `Main Topics: ${headings.join(', ')}\n`;
		}
		if (mainContent) {
			semanticContext += `Content Preview: ${mainContent.substring(0, 800)}\n`;
		}

		return {
			title,
			url,
			description,
			headings,
			content: mainContent,
			semanticContext,
			timestamp: new Date().toISOString()
		};
	}

	getMetaDescription() {
		const metaDesc = document.querySelector('meta[name="description"]') ||
			document.querySelector('meta[property="og:description"]');
		return metaDesc ? metaDesc.getAttribute('content') : '';
	}

	getPageContent() {
		// Try multiple selectors for main content
		const selectors = [
			'main',
			'article',
			'[role="main"]',
			'.content',
			'#content',
			'.main-content',
			'#main-content'
		];

		for (const selector of selectors) {
			const element = document.querySelector(selector);
			if (element) {
				return this.cleanText(element.textContent).substring(0, 2000);
			}
		}

		// Fallback to body but filter out navigation/footer
		const body = document.body.cloneNode(true);

		// Remove script, style, nav, footer elements
		const removeSelectors = ['script', 'style', 'nav', 'footer', 'header', 'aside'];
		removeSelectors.forEach(tag => {
			body.querySelectorAll(tag).forEach(el => el.remove());
		});

		return this.cleanText(body.textContent).substring(0, 2000);
	}

	cleanText(text) {
		return text
			.replace(/\s+/g, ' ')  // Multiple spaces to single space
			.replace(/\n+/g, ' ')   // Remove newlines
			.trim();
	}

	escapeHTML(str) {
		if (!str) return '';
		return str.replace(/[&<>'"]/g, function (tag) {
			const charsToReplace = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				"'": '&#39;',
				'"': '&quot;'
			};
			return charsToReplace[tag] || tag;
		});
	}
}

// Initialize content script
const deepResearch = new DeepResearchContent();