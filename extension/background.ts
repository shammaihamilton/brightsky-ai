
chrome.runtime.onMessage.addListener(
  (
    request: { action?: string },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: { success: boolean; error?: string }) => void
  ) => {
    if (request.action === 'openPopup') {
      // For Manifest V3
      if (chrome.action && chrome.action.openPopup) {
        chrome.action.openPopup()
          .then(() => {
            sendResponse({ success: true });
          })
          .catch((error: Error) => {
            console.error('Failed to open popup:', error);
            sendResponse({ success: false, error: error.message });
          });
      } else {
        // Fallback - the popup will open when user clicks the extension icon
        sendResponse({ success: false, error: 'Popup opening not supported' });
      }
    }
    return true; // Keep the message channel open for async response
  }
);