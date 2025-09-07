# Deep Research Assistant Chrome Extension

A powerful AI-powered Chrome extension that helps you research and gather information while browsing without switching tabs. Get instant AI assistance, page summaries, and research capabilities directly on any webpage.

## 🚀 Features

### Core Features
- **AI Chat Assistant**: Chat with an AI assistant about any topic or current page content
- **Floating Widget**: Persistent chat widget that stays on screen while browsing
- **Keyboard Shortcuts**: Quick access with customizable keyboard shortcuts (Ctrl+Shift+D by default)
- **Page Analysis**: Get summaries and analysis of current page content
- **Screenshot Analysis**: Capture and analyze screenshots with AI vision capabilities
- **Research Tools**: Deep research on any topic with comprehensive results

### User Experience
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Tabbed Interface**: Organized sections for Chat, Research, and Screenshot features
- **Context Menu**: Right-click integration for quick actions
- **Settings Panel**: Comprehensive configuration options
- **Data Privacy**: Local storage with optional data collection

## 📦 Installation

### For Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/deep-research-assistant.git
   cd deep-research-assistant
   ```

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the project folder

3. **Create Icons** (Required)
   - Replace placeholder files in `icons/` folder with actual PNG icons:
     - `icon16.png` (16x16)
     - `icon32.png` (32x32)
     - `icon48.png` (48x48)
     - `icon128.png` (128x128)

### For Production

1. **Create Icons**: Generate proper icon files for all sizes
2. **Update Manifest**: Modify `manifest.json` with your extension details
3. **Build**: Zip the extension folder
4. **Publish**: Submit to Chrome Web Store

## 🛠️ Development

### Project Structure
```
DeepResearchAssistant/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.css              # Popup styles
├── popup.js               # Popup functionality
├── content.js             # Content script (injected into pages)
├── background.js          # Background service worker
├── options.html           # Settings page
├── options.css            # Settings styles
├── options.js             # Settings functionality
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

### Key Components

#### 1. Popup Interface (`popup.html`, `popup.css`, `popup.js`)
- Main extension interface with tabbed navigation
- Chat, Research, and Screenshot functionality
- Settings access and widget controls

#### 2. Content Script (`content.js`)
- Injects floating button and chat widget into web pages
- Handles keyboard shortcuts and user interactions
- Manages page content analysis

#### 3. Background Service Worker (`background.js`)
- Handles extension lifecycle and messaging
- Manages keyboard shortcuts and context menus
- Coordinates between popup and content scripts

#### 4. Options Page (`options.html`, `options.css`, `options.js`)
- Comprehensive settings management
- Privacy controls and data management
- Import/export functionality

### API Integration

The extension is designed to work with AI backends. To integrate with your AI service:

1. **Update Background Script**: Modify `sendToAI()` method in `background.js`
2. **Add API Configuration**: Use the Advanced settings in options page
3. **Handle Responses**: Update response processing in content and popup scripts

Example API integration:
```javascript
async sendToAI(data) {
    const response = await fetch('https://your-api.com/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}
```

## 🎨 Customization

### Themes
The extension supports light/dark themes. Modify CSS variables in the respective CSS files.

### Widget Position
Users can customize widget position through settings:
- Bottom Right (default)
- Bottom Left
- Top Right
- Top Left

### Keyboard Shortcuts
Customizable shortcuts for:
- Open Widget: `Ctrl+Shift+D` (default)
- Quick Research: `Ctrl+Shift+R`
- Screenshot: `Ctrl+Shift+S`

## 🔧 Configuration

### Manifest Settings
Key configuration options in `manifest.json`:
- **Permissions**: Required Chrome APIs
- **Host Permissions**: Websites the extension can access
- **Commands**: Keyboard shortcuts
- **Content Scripts**: Automatic injection rules

### Storage
The extension uses Chrome's storage APIs:
- **Sync Storage**: Settings and preferences (syncs across devices)
- **Local Storage**: Chat history and usage data

## 🚀 Deployment

### Chrome Web Store
1. **Prepare Assets**:
   - Create high-quality screenshots
   - Write compelling description
   - Prepare privacy policy

2. **Package Extension**:
   ```bash
   zip -r deep-research-assistant.zip . -x "*.git*" "README.md"
   ```

3. **Submit to Store**:
   - Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Upload package and fill required information
   - Submit for review

### Self-Hosting
For enterprise or private distribution:
1. Package the extension
2. Distribute via your organization's extension management
3. Users can install via "Load unpacked" in developer mode

## 🔒 Privacy & Security

### Data Handling
- **Local Storage**: Chat history stored locally by default
- **Optional Sync**: Users can enable cross-device sync
- **No Tracking**: No personal data collected without consent
- **Page Access**: Only reads content when explicitly requested

### Permissions
- **activeTab**: Access to current tab for functionality
- **scripting**: Inject content scripts
- **storage**: Save settings and preferences
- **commands**: Handle keyboard shortcuts
- **tabs**: Manage tab interactions

## 🐛 Troubleshooting

### Common Issues

1. **Extension Not Loading**
   - Check manifest.json syntax
   - Verify all required files exist
   - Check Chrome console for errors

2. **Icons Not Showing**
   - Ensure all icon files are proper PNG format
   - Verify file paths in manifest.json
   - Check file sizes (should be reasonable)

3. **Content Script Not Working**
   - Verify host permissions in manifest
   - Check content script injection rules
   - Review console for JavaScript errors

4. **Settings Not Saving**
   - Check storage permissions
   - Verify Chrome storage API access
   - Review options.js for errors

### Debug Mode
Enable debug mode in Advanced settings to get detailed logging.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test on multiple websites
- Ensure responsive design
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Chrome Extension APIs
- Font Awesome for icons
- Modern CSS frameworks for styling inspiration

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review Chrome extension documentation

---

**Note**: This extension requires proper icon files to function correctly. Replace the placeholder files in the `icons/` folder with actual PNG images before testing or deployment. 