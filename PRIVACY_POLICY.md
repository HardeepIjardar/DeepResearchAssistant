# Privacy Policy for Deep Research Assistant

**Last updated:** November 28, 2024

## Introduction

Deep Research Assistant ("the Extension") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we handle your information when you use our Chrome extension.

## Information We Collect

### Locally Stored Data

The Extension stores the following information **locally on your device**:

1. **Chat History**
   - Messages you send and receive
   - Timestamps of conversations
   - Stored using Chrome's local storage
   - Never leaves your device unless you configure an external API

2. **Settings and Preferences**
   - Theme preferences
   - Widget position and size
   - Keyboard shortcuts
   - Privacy settings
   - Stored using Chrome's sync storage (optional)

### Data We DO NOT Collect

- Personal identifying information (name, email, phone number)
- Browsing history or visited URLs
- Passwords or login credentials
- Payment information
- Location data
- Device information beyond what's required for extension functionality

## How We Use Your Data

### Local Processing
- Chat history is used to provide context for conversations
- Settings are used to customize your experience
- All processing happens locally in your browser

### No External Servers
- By default, no data is sent to external servers
- Extension works entirely offline with fallback responses
- You have complete control over your data

## Optional Third-Party Services

### Custom AI Backend Configuration

If you choose to configure a custom AI backend in Advanced Settings:

- Your chat messages will be sent to the configured endpoint
- You are responsible for understanding that service's privacy policy
- We recommend only using trusted services
- You can disconnect at any time

### Local AI (Ollama)

If you run the backend locally with Ollama:

- All processing happens on your computer
- No data leaves your device
- Completely private and offline

## Data Sharing

We **DO NOT**:
- Sell your data to third parties
- Share your data with advertisers
- Use your data for marketing purposes
- Transmit your data without your knowledge

## Your Rights and Controls

### Access Your Data
All your data is stored locally and accessible to you:
- Chat history: View in the extension popup
- Settings: Access through the settings page

### Delete Your Data

**Method 1 - Clear Everything:**
1. Open Extension Settings
2. Navigate to Privacy tab
3. Click "Clear All Data"

**Method 2 - Uninstall:**
1. Go to `chrome://extensions/`
2. Remove the extension
3. All local data is automatically deleted

### Export Your Data
- Use the "Export Settings" feature in Advanced Settings
- Download your settings as a JSON file
- Restore settings on another device or browser

### Disable Data Collection
- Turn off "Data Collection" in Privacy settings
- Disable chat history saving
- Opt out of usage statistics

## Permissions Explained

The Extension requests the following Chrome permissions:

| Permission | Purpose | Data Access |
|-----------|---------|-------------|
| `storage` | Save settings and chat history locally | Local data only |
| `tabs` | Get current tab info for page analysis | Current tab URL and title only when requested |
| `scripting` | Inject chat widget into pages | No data collection |
| `contextMenus` | Add right-click menu options | No data collection |
| `notifications` | Show extension notifications | No data collection |

### Host Permissions
- `<all_urls>`: Required to inject the widget on any website
- Only accesses page content when you explicitly request a feature (summarize, analyze)
- Does not run in the background or track browsing

## Data Security

### Local Storage
- Data stored using Chrome's secure storage APIs
- Protected by Chrome's sandboxing
- Encrypted when your device is locked (OS-level)

### Transmission Security
- If using external APIs, HTTPS is enforced
- No unencrypted data transmission
- You can verify secure connections in settings

## Children's Privacy

The Extension does not knowingly collect information from children under 13. It is not intended for use by children. If you believe a child has used the extension, please contact us to have any data removed.

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be reflected with a new "Last updated" date at the top of this document.

**How you'll be notified:**
- Updated policy will be in the Extension's GitHub repository
- Major changes will be announced in extension updates
- We encourage periodic review of this policy

## Compliance

This Extension complies with:

- ✅ **GDPR** (General Data Protection Regulation)
  - Data minimization
  - User consent
  - Right to deletion
  - Data portability

- ✅ **CCPA** (California Consumer Privacy Act)
  - No sale of personal data
  - Right to know
  - Right to delete

- ✅ **Chrome Web Store Policies**
  - Limited use of permissions
  - Transparent data practices
  - User privacy protection

## Contact Us

If you have questions about this privacy policy or your data:

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/DeepResearchAssistant/issues)
- **Email**: your.email@example.com
- **Repository**: https://github.com/yourusername/DeepResearchAssistant

## Your Consent

By using the Deep Research Assistant extension, you consent to this privacy policy.

## Transparency Commitment

We believe in complete transparency:

- ✅ Extension source code is open and available
- ✅ No hidden data collection
- ✅ No tracking or analytics without consent
- ✅ You own your data

## Summary

**In plain English:**
- Your data stays on your device
- We don't collect, sell, or share your information  
- You can delete everything anytime
- The extension works offline by default
- You have complete control

---

**Deep Research Assistant Team**  
Committed to your privacy 🔒
