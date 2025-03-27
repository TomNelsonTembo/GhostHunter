importScripts('./utils.js');

// Add tab listener when background script starts
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if URL matches the expected OAuth redirect URL
  const redirectUrl = chrome.identity.getRedirectURL();
  if (changeInfo.url?.startsWith(redirectUrl)) {
    handleUrl(changeInfo.url);

    // Close the authentication tab
    chrome.tabs.remove(tabId, () => {
      if (chrome.runtime.lastError) {
        console.error("Failed to remove tab:", chrome.runtime.lastError);
      } else {
        console.log("Tab removed successfully.");
      }

      // Open the Chrome extension popup or dashboard
      // chrome.windows.create({
      //   url: `chrome-extension://${chrome.runtime.id}/index.html#/`,
      //   type: "popup",
      // });
    });
  }
});


// Optional: Listen for extension install/update
chrome.runtime.onInstalled.addListener(() => {
  console.log("GhostHunter extension installed/updated.");
});
