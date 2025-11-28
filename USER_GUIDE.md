# Deep Research Assistant User Guide

## 🎯 Quick Start

Welcome to Deep Research Assistant! This guide will help you get the most out of your AI-powered research companion.

### What is Deep Research Assistant?

Deep Research Assistant is a Chrome extension that brings AI-powered assistance directly to your browsing experience. Chat with AI, research topics, analyze pages, and capture screenshots - all without leaving your current tab.

## 📋 Table of Contents

1. [Installation](#installation)
2. [Features Overview](#features-overview)
3. [Using the Chat Feature](#using-the-chat-feature)
4. [Research Tools](#research-tools)
5. [Screenshot Analysis](#screenshot-analysis)
6. [Settings & Customization](#settings--customization)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## Installation

### Step 1: Install the Extension

1. Download or clone the Deep Research Assistant project
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top right
4. Click "Load unpacked" and select the project folder
5. The extension icon should now appear in your toolbar

### Step 2: Set Up the Backend (Optional)

For full AI capabilities, you can run the local backend:

1. Install [Node.js](https://nodejs.org) (v18 or higher)
2. Install [Ollama](https://ollama.ai)
3. Pull an AI model: `ollama pull llama2:7b`
4. Open a terminal in the `backend` folder
5. Run `npm install` then `npm start`

**Note:** The extension works without the backend using pre-configured fallback responses!

---

## Features Overview

### 🗨️ Chat Assistant
- Have conversations with an AI assistant
- Ask questions about any topic
- Get help understanding the current page
- Quick actions for common tasks

### 🔍 Research Tools
- Deep dive into any topic
- Get comprehensive research results
- Save findings for later

### 📸 Screenshot Analysis
- Capture visible page content
- Analyze page structure and content
- Get AI insights on what's displayed

### ⚙️ Customizable Settings
- Change appearance and theme
- Adjust widget position and size
- Configure keyboard shortcuts
- Privacy controls

---

## Using the Chat Feature

### Opening the Chat

**Method 1:** Click the extension icon in your toolbar

**Method 2:** Press `Ctrl+Shift+D` (default keyboard shortcut)

**Method 3:** Click the floating button on any webpage

### Starting a Conversation

1. Type your question in the input field
2. Press Enter or click the send button  
3. Wait for the AI response
4. Continue the conversation naturally

### Quick Actions

Use the quick action buttons for common tasks:

- **Summarize Page**: Get a quick summary of the current webpage
- **Explain Topic**: Ask the AI to explain complex concepts

### Chat Tips

✅ **Do:**
- Be specific with your questions
- Provide context when needed
- Use follow-up questions for clarification

❌ **Don't:**
- Ask for personal information
- Expect real-time data (the AI doesn't browse the web)
- Share sensitive information in chats

---

## Research Tools

### Starting a Research Session

1. Click the extension icon
2. Navigate to the "Research" tab
3. Enter your research topic
4. Click the search button

### Understanding Results

Research results include:
- Key insights and findings
- Related topics and concepts
- Suggested areas for deeper exploration

### Saving Research

Your research history is automatically saved locally. Access previous research through the extension popup.

---

## Screenshot Analysis

### Capturing a Screenshot

1. Navigate to the "Screenshot" tab in the extension popup
2. Click "Capture Screenshot"
3. The current visible portion of the page will be captured

### Analyzing Page Content

1. Click "Analyze Page" to get AI insights about the current page
2. Review the analysis results
3. Ask follow-up questions if needed

---

## Settings & Customization

### Accessing Settings

**Method 1:** Click the gear icon in the extension popup

**Method 2:** Right-click the extension icon → Options

### General Settings

- **Auto-open Widget**: Automatically show the chat widget on new pages
- **Notifications**: Enable/disable extension notifications
- **Chat History**: Choose whether to save conversation history
- **Context Menu**: Show extension options in right-click menu

### Appearance

- **Theme**: Choose Light, Dark, or Auto (system) theme
- **Widget Position**: Bottom Right, Bottom Left, Top Right, or Top Left
- **Widget Size**: Small (300px), Medium (350px), or Large (400px)
- **Floating Button**: Show/hide the floating access button

### Privacy Settings

- **Data Collection**: Control anonymous usage data
- **Page Content Access**: Allow reading page content for better assistance
- **Clear Data**: Remove all stored data and reset to defaults

### Advanced Settings

- **API Endpoint**: Configure custom AI backend (for advanced users)
- **API Key**: Set your API key if using external service
- **Debug Mode**: Enable detailed logging for troubleshooting
- **Export/Import**: Backup and restore your settings

---

## Keyboard Shortcuts

### Default Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` | Open/close chat widget |
| `Ctrl+Shift+R` | Quick research on selected text |
| `Ctrl+Shift+S` | Capture screenshot |

### Customizing Shortcuts

1. Go to Settings → Shortcuts section
2. Click on the shortcut you want to change
3. Press your desired key combination
4. The shortcut updates automatically

---

## Troubleshooting

### Extension Not Loading

**Problem:** Extension doesn't appear in toolbar

**Solution:**
1. Check that Developer Mode is enabled in `chrome://extensions/`
2. Verify the extension is enabled (toggle should be blue)
3. Try removing and re-adding the extension

### AI Not Responding

**Problem:** No response from AI or error messages

**Solution:**
1. Check the status indicator in the popup (should show "Connected")
2. If using local backend, ensure it's running (`npm start` in backend folder)
3. Verify Ollama is installed and a model is pulled
4. Extension will use fallback responses if backend is unavailable

### Widget Not Appearing

**Problem:** Can't see the floating widget or button

**Solution:**
1. Check Settings → Appearance → Floating Button is enabled
2. Try pressing `Ctrl+Shift+D` to manually open the widget
3. Some websites may block the widget - try a different site
4. Check browser console for errors (F12)

### Settings Not Saving

**Problem:** Changes to settings aren't persisting

**Solution:**
1. Make sure to click "Save Settings" button
2. Check storage permissions in `chrome://extensions/`
3. Try clearing extension data and reconfiguring

### Backend Connection Issues

**Problem:** Shows "Offline" in popup status

**Solution:**
1. Ensure Node.js is installed
2. Run `npm install` in the backend folder
3. Start the backend with `npm start`
4. Check that port 3001 isn't being used by another application
5. Extension works with fallbacks even without backend!

---

## FAQ

### Do I need to install Ollama?

No! The extension works with pre-configured fallback responses. Ollama only enhances the AI capabilities with fully interactive AI models.

### Is my data private?

Yes! All chat history is stored locally on your device. No data is sent to external servers without your explicit consent (if you configure a custom API endpoint).

### Can I use this on any website?

Yes! The extension works on all websites. Some restricted pages (like chrome:// URLs) may have limitations.

### Does this work offline?

The extension UI works offline, but AI responses require either:
- Running backend with Ollama (local AI)
- Internet connection to external API (if configured)
- Fallback responses work without any connection

### How do I uninstall?

1. Go to `chrome://extensions/`
2. Find "Deep Research Assistant"
3. Click "Remove"
4. Optionally, delete the backend folder if you installed it

### Can I customize the AI responses?

Yes! If you're running the backend locally, you can:
- Change the AI model in backend `.env` file
- Adjust temperature and other parameters
- Modify fallback responses in `backend/index.js`

### Is this free to use?

Yes! The extension and all its features are completely free. If you use Ollama locally, it's also free. You only pay if you choose to configure an external paid API service.

### How can I contribute or report issues?

- Report bugs on the GitHub repository
- Suggest features through GitHub issues
- Contribute code via pull requests

---

## 🎓 Best Practices

1. **Start Simple**: Begin with basic questions to understand the AI's capabilities
2. **Provide Context**: Give background information for better responses
3. **Iterate**: Use follow-up questions to refine answers
4. **Verify Information**: Always double-check important facts
5. **Explore Settings**: Customize the extension to match your workflow
6. **Use Keyboard Shortcuts**: Speed up your workflow with shortcuts
7. **Regular Updates**: Check for extension updates periodically

---

## 📞 Support

Need more help?

- Check the [README](README.md) for technical details
- Review the [Troubleshooting](#troubleshooting) section
- Check the browser console (F12) for error messages

---

**Happy Researching! 🚀**
