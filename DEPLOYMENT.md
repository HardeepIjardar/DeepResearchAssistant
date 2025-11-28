# Deployment Guide - Deep Research Assistant

Complete guide for deploying and distributing the Deep Research Assistant Chrome Extension.

## Table of Contents

1. [Backend Deployment](#backend-deployment)
2. [Extension Packaging](#extension-packaging)
3. [Chrome Web Store Submission](#chrome-web-store-submission)
4. [Testing Checklist](#testing-checklist)

---

## Backend Deployment

### Option 1: Render.com (Free Tier - Recommended)

#### Prerequisites
- GitHub account
- Render.com account (free)

#### Steps

1. **Push your backend code to GitHub**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend commit"
   git remote add origin https://github.com/your-username/deep-research-backend.git
   git push -u origin main
   ```

2. **Create a new Web Service on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder

3. **Configure the service**
   - **Name**: `deepresearchassistant-backend` (or your choice)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Set Environment Variables**
   ```
   OLLAMA_HOST=http://127.0.0.1:11434
   OLLAMA_MODEL=llama2:7b
   PORT=3001
   NODE_ENV=production
   RENDER=true
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your service URL (e.g., `https://deepresearchassistant-backend.onrender.com`)

6. **Update Extension** (if needed)
   - If your URL is different, update `background.js` line ~71:
   ```javascript
   const hostedBase = 'https://your-service-name.onrender.com';
   ```

#### Note on Free Tier
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down may take 30-50 seconds
- Perfect for demos and project submissions!

---

### Option 2: Railway.app (Free Tier)

1. Sign up at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your backend repository
4. Railway auto-detects Node.js and sets up the build
5. Add environment variables in the "Variables" tab
6. Deploy and copy the deployment URL

---

### Option 3: Local Only (No Deployment)

If you prefer not to deploy the backend:

1. Ensure backend works locally: `npm start` in the backend folder
2. Update documentation to mention backend is local-only
3. Extension will use fallback responses when backend is unavailable
4. This is perfectly acceptable for a final year project!

---

## Extension Packaging

### For Chrome Web Store

1. **Clean up the extension folder**
   ```bash
   # Remove unnecessary files
   rm -rf node_modules
   rm -rf .git
   rm -rf backend
   rm package-lock.json
   ```

   Keep only:
   - `manifest.json`
   - `*.html`, `*.css`, `*.js` (extension files)
   - `icons/` folder
   - `README.md` (optional)

2. **Create a ZIP file**
   
   **Windows:**
   - Select all extension files
   - Right-click → "Send to" → "Compressed (zipped) folder"
   - Name it `deep-research-assistant-v1.0.0.zip`

   **Mac/Linux:**
   ```bash
   zip -r deep-research-assistant-v1.0.0.zip . -x "*.git*" "*node_modules*" "*backend*"
   ```

3. **Verify ZIP contents**
   - Open the ZIP and ensure `manifest.json` is at the root level
   - All necessary files are included
   - No unnecessary files (node_modules, etc.)

### For Local Distribution

If distributing to others for local installation:

1. Share the entire project folder
2. Include the `USER_GUIDE.md`
3. Include backend folder if needed
4. Provide installation instructions from README

---

## Chrome Web Store Submission

### Prerequisites

1. **Chrome Developer Account** ($5 one-time fee)
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Sign in with Google account
   - Pay the $5 registration fee

### Required Assets

#### 1. Extension Icons ✅
Already created in `icons/` folder:
- 16x16, 32x32, 48x48, 128x128 PNG files

#### 2. Screenshots (Required)
Create 1280x800 or 640x400 screenshots showing:
- Extension popup with chat interface
- Widget on a webpage
- Research tab in action
- Settings page

Save in `screenshots/` folder for documentation.

#### 3. Promotional Images (Optional but recommended)
- Small tile: 440x280
- Marquee: 1400x560

#### 4. Description

**Short Description** (132 characters max):
```
AI-powered research assistant for Chrome. Chat, research, and analyze pages without leaving your browser.
```

**Detailed Description**:
```
Deep Research Assistant - Your AI Research Companion

Bring the power of AI directly to your browser with Deep Research Assistant. Research topics, chat with AI, and analyze web pages without ever leaving your current tab.

KEY FEATURES:
• AI Chat Assistant - Get instant help on any topic
• Smart Research - Deep dive into subjects with comprehensive insights
• Page Analysis - Understand and summarize web content
• Screenshot Capture - Visual analysis of web pages
• Floating Widget - Always accessible, never intrusive
• Privacy-Focused - Data stored locally on your device

PERFECT FOR:
✓ Students conducting research
✓ Professionals gathering information
✓ Writers seeking inspiration
✓ Anyone curious about the web

HOW IT WORKS:
1. Click the extension icon or press Ctrl+Shift+D
2. Ask your question or select a tool
3. Get instant AI-powered assistance
4. Continue researching without switching tabs

PRIVACY & SECURITY:
• All chat history stored locally
• No data sent without your permission
• Open source and transparent
• You control your data

Get started in seconds - no account required, no subscriptions, completely free!
```

#### 5. Privacy Policy

Create `PRIVACY_POLICY.md` (see below for template).

Must be hosted publicly - options:
- GitHub Pages
- Your website
- Render static site

#### 6. Category
Choose: **Productivity**

---

### Submission Process

1. **Go to Developer Dashboard**
   - [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

2. **Create New Item**
   - Click "New Item"
   - Upload your ZIP file
   - Fill in all required fields

3. **Store Listing**
   - **Product name**: Deep Research Assistant
   - **Summary**: (Use short description above)
   - **Description**: (Use detailed description above)
   - **Category**: Productivity
   - **Language**: English

4. **Upload Assets**
   - Upload all required screenshots
   - Upload promotional images (optional)
   - Ensure 128x128 icon is set

5. **Privacy**
   - Add privacy policy URL
   - Declare permissions usage:
     - storage: "Save user settings and chat history locally"
     - tabs: "Access current tab information for page analysis"
     - notifications: "Show extension notifications"
     - scripting: "Inject chat widget into web pages"

6. **Pricing**
   - Select "Free"

7. **Submit for Review**
   - Click "Submit for Review"
   - Review typically takes **1-3 business days**
   - You'll receive email updates on status

### After Submission

- Monitor your email for review updates
- Address any feedback from reviewers promptly
- Once approved, extension goes live automatically
- Share the Chrome Web Store link!

---

## Testing Checklist

### Pre-Submission Testing

- [ ] **Extension loads without errors**
  - Check `chrome://extensions/` for error messages
  - Open browser console (F12) and verify no errors

- [ ] **All icons display correctly**
  - Toolbar icon shows up
  - All sizes render properly

- [ ] **Popup Interface Works**
  - [ ] Opens when clicking extension icon
  - [ ] All three tabs (Chat, Research, Screenshot) are accessible
  - [ ] Send message works in Chat tab
  - [ ] Quick actions function properly
  - [ ] Research input and button work
  - [ ] Screenshot capture works

- [ ] **Floating Widget Functions**
  - [ ] Widget opens with Ctrl+Shift+D
  - [ ] Widget appears on different websites
  - [ ] Can send messages in widget
  - [ ] Can close and reopen widget
  - [ ] Widget is resizable
  - [ ] Widget position is correct

- [ ] **Settings Page**
  - [ ] Opens from popup gear icon
  - [ ] All settings sections accessible
  - [ ] Settings save correctly
  - [ ] Settings persist after browser restart
  - [ ] Reset to defaults works

- [ ] **Backend Connectivity**
  - [ ] Status shows "Connected" when backend is running
  - [ ] Works with local backend
  - [ ] Falls back gracefully when backend unavailable
  - [ ] Error messages are user-friendly

- [ ] **Cross-Website Testing**
  - [ ] Works on news sites
  - [ ] Works on documentation sites
  - [ ] Works on social media
  - [ ] Handles sites with existing widgets
  - [ ] Doesn't break page functionality

- [ ] **Performance**
  - [ ] Extension loads quickly
  - [ ] No significant page slowdown
  - [ ] Memory usage is reasonable
  - [ ] No memory leaks after extended use

### Documentation Review

- [ ] README.md is accurate and complete
- [ ] USER_GUIDE.md is comprehensive
- [ ] Installation instructions are clear
- [ ] All links work
- [ ] Screenshots are current
- [ ] Troubleshooting section is helpful

### Final Checks

- [ ] Version number is correct in manifest.json
- [ ] Extension name is consistent everywhere
- [ ] All permissions are necessary and documented
- [ ] Privacy policy is accurate
- [ ] Demo/presentation is ready
- [ ] Backup of working version created

---

## Privacy Policy Template

```markdown
# Privacy Policy for Deep Research Assistant

Last updated: [Current Date]

## Data Collection

Deep Research Assistant respects your privacy. Here's what you need to know:

### What We Collect
- **Chat History**: Stored locally on your device
- **Settings Preferences**: Stored locally on your device
- **Anonymous Usage Data**: Only if explicitly enabled in settings

### What We DON'T Collect
- Personal identifying information
- Browsing history
- Passwords or sensitive data
- Credit card information

## Data Storage

All data is stored locally using Chrome's storage APIs:
- Chat conversations: Local storage
- Settings: Sync storage (optional)
- No data is sent to external servers by default

## Third-Party Services

### Optional Backend Service
If you configure a custom AI backend:
- Data is sent to that service according to their privacy policy
- You control which backend to use
- Can be completely local (Ollama)

### Default Behavior
Without custom configuration:
- Extension uses local processing
- Fallback responses require no external connection

## Your Rights

You have the right to:
- Access your data (all stored locally)
- Delete your data (clear data in settings)
- Export your data (export settings feature)
- Disable data collection entirely

## Data Deletion

To delete all your data:
1. Open extension settings
2. Go to Privacy tab
3. Click "Clear All Data"

Or uninstall the extension to remove all local data.

## Changes to This Policy

We may update this privacy policy. Updates will be reflected with a new "Last updated" date.

## Contact

For privacy concerns:
- Create an issue on [GitHub Repository]
- Email: [Your Email]

## Compliance

This extension complies with:
- Chrome Web Store policies
- GDPR principles (data minimization, user control)
- General privacy best practices
```

---

## Post-Deployment

### Monitoring

- Watch Chrome Web Store reviews
- Monitor GitHub issues
- Track usage analytics (if enabled)
- Gather user feedback

### Updates

When releasing updates:
1. Increment version in `manifest.json`
2. Update changelog
3. Test thoroughly
4. Create new ZIP
5. Upload to Chrome Web Store
6. Update documentation

---

## Final Project Submission Tips

For your final year project:

1. **Create a Demo Video** (3-5 minutes)
   - Show installation process
   - Demonstrate all features
   - Highlight unique aspects
   - Show it solving a real problem

2. **Prepare Presentation**
   - Problem statement
   - Solution overview
   - Technical architecture
   - Live demonstration
   - Results and impact
   - Future improvements

3. **Documentation Package**
   - README.md
   - USER_GUIDE.md
   - This DEPLOYMENT.md
   - Code comments
   - Architecture diagrams

4. **Have Backup Plans**
   - Offline demo ready
   - Screenshots/video backup
   - Local backend running
   - Extension pre-loaded

Good luck with your submission! 🎓🚀
