// Background service worker for Jira Bulk User Adder
// Only activates when user clicks the extension icon

console.log('[Jira Bulk] 🔧 Background service worker loaded');

chrome.action.onClicked.addListener(async (tab) => {
  console.log('[Jira Bulk] 🖱️ Extension icon clicked');
  console.log('[Jira Bulk] 📍 Tab:', tab.id, 'URL:', tab.url);

  try {
    // First, inject CSS
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['styles.css']
    });
    console.log('[Jira Bulk] ✅ CSS injected');

    // Then, inject JavaScript
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    console.log('[Jira Bulk] ✅ Script injected');

    // Wait a bit for script to initialize
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, { action: 'toggleUI' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('[Jira Bulk] ℹ️ First time injection, UI will auto-show');
        } else {
          console.log('[Jira Bulk] ✅ UI toggled');
        }
      });
    }, 100);

  } catch (error) {
    console.error('[Jira Bulk] ❌ Injection failed:', error);
    
    // Show user-friendly error
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'Jira Bulk User Adder',
      message: 'Cannot activate on this page. Please open a Jira page first.'
    });
  }
});
