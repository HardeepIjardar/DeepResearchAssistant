# Quick Testing Guide - Deep Research Assistant

This guide helps you quickly test all features of the extension before submission.

## ✅ Pre-Test Checklist

- [ ] Backend is running (if testing with Ollama)
- [ ] Extension is loaded in Chrome
- [ ] Browser console is open (F12) to monitor errors

## 🧪 Test Procedures

### 1. Extension Installation Test (2 minutes)

**Steps:**
1. Open Chrome and go to `chrome://extensions/`
2. Ensure "Developer mode" is ON
3. Click "Load unpacked"
4. Select the Deep Research Assistant folder
5. Check that extension appears in toolbar

**Expected Result:**
✅ Extension icon visible in toolbar
✅ No error messages in console
✅ Extension shows as "Enabled"

---

### 2. Popup Interface Test (3 minutes)

**Steps:**
1. Click extension icon in toolbar
2. Verify all three tabs are visible (Chat, Research, Screenshot)
3. Click each tab to ensure they switch correctly
4. Check footer shows status indicator

**Expected Result:**
✅ Popup opens without errors
✅ All tabs are accessible
✅ Status shows "Connected" (green dot)
✅ UI looks clean and professional

---

### 3. Chat Feature Test (5 minutes)

**Test A: Basic Chat**
1. Go to Chat tab
2. Type "Hello,how are you?" in the input
3. Click send or press Enter
4. Wait for response

**Expected Result:**
✅ Message appears in chat
✅ Typing indicator shows
✅ AI response appears
✅ Conversation is readable

**Test B: Page Summarize**
1. Open any website (e.g., Wikipedia article)
2. Click extension icon
3. Click "Summarize Page" quick action

**Expected Result:**
✅ Summary request is sent
✅ Response relates to the page content
✅ No errors in console

---

###4. Research Tab Test (3 minutes)

**Steps:**
1. Switch to Research tab
2. Enter a topic (e.g., "Artificial Intelligence")
3. Click the search button
4. Review results

**Expected Result:**
✅ Research input accepts text
✅ Results appear after clicking search
✅ Results are formatted nicely
✅ Loading indicator shows during processing

---

### 5. Screenshot Tab Test (3 minutes)

**Test A: Capture Screenshot**
1. Open any website
2. Go to Screenshot tab
3. Click "Capture Screenshot"

**Expected Result:**
✅ Screenshot is captured
✅ Image displays in preview area
✅ No errors occur

**Test B: Analyze Page**
1. Go to Screenshot tab
2. Click "Analyze Page"

**Expected Result:**
✅ Analysis request is sent
✅ Results appear in analysis section
✅ Analysis is relevant to current page

---

### 6. Floating Widget Test (4 minutes)

**Steps:**
1. Open any website (e.g., google.com)
2. Press `Ctrl+Shift+D`
3. Verify widget appears
4. Type a message and send
5. Try resizing the widget
6. Click close button

**Expected Result:**
✅ Widget appears on keypress
✅ Floating button is visible
✅ Can send messages in widget
✅ Widget is resizable
✅ Widget closes properly
✅ Reopens on subsequent keypress

---

### 7. Settings Test (5 minutes)

**Steps:**
1. Click extension icon
2. Click gear icon (settings)
3. Navigate through all setting sections:
   - General
   - Shortcuts
   - Appearance
   - Privacy
   - Advanced
4. Toggle some settings on/off
5. Click "Save Settings"
6. Reload extension
7. Check if settings persisted

**Expected Result:**
✅ Settings page opens in new tab
✅ All sections are accessible
✅ Toggles and selects work
✅ Save button works without errors
✅ Settings persist after reload

---

### 8. Backend Connectivity Test (3 minutes)

**Test A: With Backend Running**
1. Start backend: `cd backend && npm start`
2. Open extension popup
3. Check status indicator

**Expected Result:**
✅ Status shows "Connected" (green)
✅ Chat responses come from Ollama (if model available)

**Test B: Without Backend**
1. Stop the backend (Ctrl+C in terminal)
2. Send a chat message
3. Check response

**Expected Result:**
✅ Extension still works
✅ Fallback responses are provided
✅ User-friendly message about backend unavailability
✅ No crashes or errors

---

### 9. Error Handling Test (3 minutes)

**Steps:**
1. Try sending empty message - should be prevented
2. Try very long message (500+ chars)
3. Rapidly click send multiple times
4. Try invalid API endpoint in settings

**Expected Result:**
✅ Empty messages are handled gracefully
✅ Long messages work or are limited
✅ Rapid clicks don't break the UI
✅ Invalid settings show error messages

---

### 10. Cross-Website Test (5 minutes)

Test on various websites:
1. Wikipedia article
2. YouTube video page
3. GitHub repository
4. News website
5. Your university website

**Expected Result:**
✅ Widget works on all sites
✅ No layout conflicts
✅ Context menus appear (right-click)
✅ Page analysis works correctly

---

## 🎯 Quick Validation (30 seconds)

If time is limited, run this minimal test:

1. ✅ Load extension - no errors
2. ✅ Click icon - popup opens
3. ✅ Send chat message - get response
4. ✅ Press Ctrl+Shift+D on webpage - widget appears
5. ✅ Open settings - all sections load

If all 5 pass = **READY FOR SUBMISSION** ✅

---

##  Common Issues & Fixes

### Issue: "Extension not loading"
**Fix**: Check manifest.json syntax, ensure all files are present

### Issue: "No response from AI"
**Fix**: Check backend is running OR ensure fallback responses work

### Issue: "Widget not appearing"
**Fix**: Check if page is allowlist (chrome:// pages don't allow extensions)

### Issue: "Settings not saving"
**Fix**: Check storage permissions are granted

---

## 📊 Test Results Template

Copy this to document your testing:

```
## Test Results - Deep Research Assistant

Date: ___________
Tester: ___________

### Installation
- [ ] Extension loads successfully
- [ ] No console errors
- [ ] Icon appears in toolbar

### Core Features
- [ ] Popup interface works
- [ ] Chat functionality works
- [ ] Research tab works
- [ ] Screenshot tab works
- [ ] Floating widget works

### Settings
- [ ] All settings accessible
- [ ] Settings save correctly
- [ ] Settings persist

### Backend
- [ ] Works with backend running
- [ ] Works with backend stopped (fallback)
- [ ] Health check endpoint responds

### Multi-Site
- [ ] Tested on 3+ different websites
- [ ] No conflicts or errors

### Overall Assessment
Status: [ ] PASS / [ ] FAIL
Notes: _________________

```

---

## 🚀 Final Pre-Submission Checklist

Before submitting your project:

- [ ] All tests passed
- [ ] Backend starts without errors
- [ ] Extension loads without errors  
- [ ] Documentation is complete (README, USER_GUIDE,DEPLOYMENT)
- [ ] Privacy policy created
- [ ] Screenshots/demo video prepared
- [ ] Working backup saved
- [ ] Code is commented
- [ ] Project presentation ready

**GOOD LUCK WITH YOUR SUBMISSION! 🎓**

---

**Time Budget:**
- Full test suite: ~35 minutes
- Quick validation: ~30 seconds
- Documentation review: ~10 minutes

**Total: ~45 minutes for complete testing**
