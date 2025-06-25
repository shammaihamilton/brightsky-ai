# Testing Settings Integration

This document explains how to test that all the chat widget settings are working properly.

## Button Size Setting

1. Load the extension in Chrome
2. Open the popup (click the extension icon)
3. Go to the "Chat Settings" section
4. Change the "Button Size" from Medium to Large or Small
5. Close the popup
6. Check the floating chat button on the page - it should now be visually larger or smaller

**Expected behavior:**
- Small: 44px × 44px button with 18px icon
- Medium: 56px × 56px button with 24px icon  
- Large: 68px × 68px button with 28px icon

## Notification Settings

1. In the popup, enable "Sound notifications" and/or "Desktop notifications"
2. Close the popup
3. Send a message to the AI chat
4. When the AI responds, you should hear a sound (if enabled) and/or see a desktop notification (if enabled)

**Note:** Desktop notifications require permission. The extension will request permission automatically.

## Accessibility Settings

1. In the popup, enable "Reduced motion"
2. Close the popup
3. Check the floating button - the pulse animation should be disabled

1. Enable "High contrast" - this would apply high contrast styling (not fully implemented yet)
2. Enable "Screen reader optimized" - this adds additional ARIA labels and descriptions

## Privacy Settings (Auto-clear)

1. In the popup, set "Auto-clear days" to a low number (like 1)
2. The system will log when it would clear old messages (currently just logs to console)
3. In a full implementation, this would automatically delete chat messages older than the specified number of days

## Assistant Name and Tone

1. Change the "Assistant Name" in the popup
2. The name should appear in AI message avatars in the chat
3. Change the "Tone" setting
4. This affects the system prompt sent to the AI, changing how it responds

## Troubleshooting

- If settings don't seem to apply immediately, try refreshing the page
- Check the browser console for any error messages
- Verify that the extension has the necessary permissions
- Make sure you're testing on a page where the content script can run (not chrome:// pages)

## Architecture Notes

- API settings (like API key, provider) are stored in Chrome storage
- Chat UI settings are stored in localStorage  
- Redux selectors provide unified access to all settings
- Settings changes in the popup are immediately reflected in Redux
- The chat widget subscribes to Redux state changes to update its appearance and behavior
