# Chrome Extension Troubleshooting Guide

## Service Worker Registration Failed (Status Code 15)

This is a common issue with Chrome extensions. Here are the solutions:

### Solution 1: Use Simplified Background Script
1. Go to the extension folder
2. Rename `background.js` to `background_old.js`
3. Rename `background_simple.js` to `background.js`
4. Reload the extension in Chrome

### Solution 2: Clear Extension Data
1. Go to `chrome://extensions/`
2. Remove the Prompt Maker extension
3. Restart Chrome
4. Re-add the extension using "Load unpacked"

### Solution 3: Check File Permissions
1. Make sure all files are readable
2. On Mac/Linux: `chmod 644 *.js *.json *.html *.css`
3. Reload the extension

### Solution 4: Validate manifest.json
1. Check that `manifest.json` is valid JSON
2. Use an online JSON validator if needed
3. Make sure all referenced files exist

## Other Common Issues

### Extension Icon Not Showing
- Click the puzzle piece icon in Chrome toolbar
- Find "Prompt Maker" and click the pin icon

### Popup Not Opening
- Right-click the extension icon
- Select "Inspect popup" to check for errors
- Make sure popup.html exists and is valid

### Theme Toggle Not Working
- Check browser console for JavaScript errors
- Ensure popup.js and popup.css are loading

### Daily Counter Not Resetting
- The counter resets at midnight local time
- You can manually reset by removing and re-adding the extension

## Development Tips

### Debugging
1. Go to `chrome://extensions/`
2. Click "Inspect views: service worker" for background script
3. Click extension icon, then press F12 for popup debugging

### Reloading Changes
1. Make your code changes
2. Go to `chrome://extensions/`
3. Click the refresh icon on Prompt Maker
4. Test your changes

### Console Logs
- Background script logs: `chrome://extensions/` → "Inspect views"
- Popup logs: Open popup → Press F12

## Getting Help

If issues persist:
1. Check the browser console for errors
2. Try the simplified background script
3. Restart Chrome completely
4. Create a new Chrome profile for testing