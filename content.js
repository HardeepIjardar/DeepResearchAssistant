// Deep Research Assistant Content Script
class DeepResearchContent {
	constructor() {
		this.isWidgetOpen = false;
		this.floatingButton = null;
		this.chatWidget = null;
		this.detectedTopic = null;
		this.init();
	}

	init() {
		this.detectedTopic = this.extractSearchTopic();
		this.createFloatingButton();
		this.bindEvents();
		this.listenForMessages();
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
				padding: 16px;
			}

			.widget-messages {
				flex: 1;
				overflow-y: auto;
				margin-bottom: 16px;
				padding-right: 8px;
			}

			.widget-message {
				margin-bottom: 12px;
				padding: 10px;
				border-radius: 12px;
				max-width: 85%;
				font-size: 13px;
				line-height: 1.4;
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
				display: flex;
				gap: 8px;
				align-items: flex-end;
			}

			.widget-input {
				flex: 1;
				padding: 10px 12px;
				border: 2px solid #e9ecef;
				border-radius: 12px;
				font-size: 13px;
				resize: none;
				outline: none;
				transition: border-color 0.3s ease;
				max-height: 100px;
				min-height: 40px;
			}

			.widget-input:focus {
				border-color: #667eea;
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
		// Remove any previous widget
		if (this.chatWidget) {
			this.chatWidget.remove();
		}
		// Create widget and reset styles
		this.createChatWidget(this.detectedTopic);
		// Reset position and size to default
		Object.assign(this.chatWidget.style, {
			width: '380px',
			height: '600px',
			minWidth: '300px',
			minHeight: '350px',
			maxWidth: '95vw',
			maxHeight: '90vh',
			bottom: '100px',
			right: '20px',
			left: '',
			top: '',
			position: 'fixed',
		});
		this.chatWidget.classList.add('open');
		this.isWidgetOpen = true;
		setTimeout(() => {
			const input = this.chatWidget.querySelector('.widget-input');
			if (input) input.focus();
		}, 300);
	}

	closeWidget() {
		if (this.chatWidget) {
			this.chatWidget.classList.remove('open');
			this.isWidgetOpen = false;
		}
	}

	createChatWidget(topic) {
		this.chatWidget = document.createElement('div');
		this.chatWidget.className = 'deep-research-widget';
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
			<div class="widget-content" style="display: flex; flex-direction: column; height: 100%; padding: 0;">
				<div class="widget-messages" id="widgetMessages" style="flex: 1 1 auto; overflow-y: auto; padding: 16px 16px 8px 16px; min-height: 0;">
					${topic ? `<div class='widget-greeting'><div class='widget-greeting-icon'><i class='fas fa-lightbulb'></i></div><h4>Hello! I see you're interested in <span class='topic-highlight'>${this.escapeHTML(topic)}</span>.</h4><p>How can I assist you with your research or provide deeper insights on this subject?</p></div>` : `<div class="widget-welcome"><div class="widget-welcome-icon"><i class="fas fa-robot"></i></div><h4>Hello! I'm your AI Research Assistant</h4><p>Ask me anything about this page or any topic you're researching.</p></div>`}
				</div>
				<div class="widget-input-container" style="flex-shrink: 0; display: flex; align-items: center; padding: 12px 16px; background: #232336; border-top: 1px solid #312e81;">
					<textarea 
						class="widget-input" 
						id="widgetInput" 
						placeholder="Ask me anything..."
						rows="1"
						style="flex: 1; padding: 8px 12px; border-radius: 8px; border: 1px solid #312e81; background: #18181b; color: #f3f4f6; font-size: 1rem; outline: none; resize: none; min-height: 36px; max-height: 100px;"
					></textarea>
					<button class="widget-send" id="widgetSend" style="margin-left: 8px; background: linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%); color: #fff; border: none; border-radius: 8px; padding: 8px 14px; font-size: 1rem; font-weight: 500; cursor: pointer; transition: background 0.18s;">
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
		
		if (!message) return;

		// Disable send button
		sendBtn.disabled = true;

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
		}

		// Re-enable send button
		sendBtn.disabled = false;
	}

	addWidgetMessage(sender, message) {
		const messagesContainer = this.chatWidget.querySelector('#widgetMessages');
		const welcomeMessage = messagesContainer.querySelector('.widget-welcome');
		
		if (welcomeMessage) {
			welcomeMessage.remove();
		}

		const messageDiv = document.createElement('div');
		messageDiv.className = `widget-message ${sender}`;
		messageDiv.textContent = message;

		messagesContainer.appendChild(messageDiv);
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
			chrome.runtime.sendMessage(
				{ action: 'sendToAI', data: { prompt: message } },
				(resp) => {
					if (chrome.runtime.lastError) {
						console.error('BG message error:', chrome.runtime.lastError);
						return reject(chrome.runtime.lastError);
					}
					if (!resp || !resp.success) {
						const err = resp && resp.error ? resp.error : 'Unknown error';
						return reject(new Error(err));
					}
					resolve(resp.data && resp.data.response ? resp.data.response : 'No reply.');
				}
			);
		});
	}

	// Get current page information
	getPageInfo() {
		return {
			title: document.title,
			url: window.location.href,
			description: this.getMetaDescription(),
			content: this.getPageContent()
		};
	}

	getMetaDescription() {
		const metaDesc = document.querySelector('meta[name="description"]');
		return metaDesc ? metaDesc.getAttribute('content') : '';
	}

	getPageContent() {
		// Get main content (simplified)
		const mainContent = document.querySelector('main, article, .content, #content');
		if (mainContent) {
			return mainContent.textContent.trim().substring(0, 1000);
		}
		return document.body.textContent.trim().substring(0, 1000);
	}

	escapeHTML(str) {
		if (!str) return '';
		return str.replace(/[&<>'"]/g, function(tag) {
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