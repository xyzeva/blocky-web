function sendMessageToTab(tabId, message) {
  chrome.tabs.sendMessage(tabId, message).catch((error) => {
    if (error.message.includes("Receiving end does not exist")) {
      // ignore this error
    } else {
      console.error("Error sending message:", error);
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleBlockify") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendMessageToTab(tabs[0].id, {
          action: "toggleBlockify",
          value: request.value,
        });
      }
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ blockifyEnabled: false, excludedSites: [] });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.excludedSites) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        sendMessageToTab(tab.id, {
          action: "updateExcludedSites",
          excludedSites: changes.excludedSites.newValue,
        });
      });
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.storage.sync.get(["blockifyEnabled", "excludedSites"], (result) => {
      sendMessageToTab(tabId, {
        action: "toggleBlockify",
        value: result.blockifyEnabled,
      });
      sendMessageToTab(tabId, {
        action: "updateExcludedSites",
        excludedSites: result.excludedSites || [],
      });
    });
  }
});
