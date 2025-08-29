// Background script for Upwork Optimizer Pro
console.log("🚀 Upwork Optimizer Pro background script loaded");

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log("Extension installed successfully");
    
    // Show welcome notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Welcome to Upwork Optimizer Pro!',
      message: 'Your profile optimization journey starts now. Click the extension icon to begin!'
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will only trigger if no popup is defined
  console.log("Extension icon clicked");
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getProfileStats") {
    // Return profile statistics
    sendResponse({
      totalProfilesAnalyzed: getTotalProfilesAnalyzed(),
      averageScore: getAverageScore(),
      lastAnalysis: getLastAnalysis()
    });
  }
  
  if (request.action === "saveAnalysis") {
    // Save analysis data
    saveAnalysisData(request.data);
    sendResponse({ success: true });
  }
});

// Storage functions
function getTotalProfilesAnalyzed() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['totalProfiles'], (result) => {
      resolve(result.totalProfiles || 0);
    });
  });
}

function getAverageScore() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['averageScore'], (result) => {
      resolve(result.averageScore || 0);
    });
  });
}

function getLastAnalysis() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['lastAnalysis'], (result) => {
      resolve(result.lastAnalysis || null);
    });
  });
}

function saveAnalysisData(data) {
  chrome.storage.local.get(['totalProfiles', 'averageScore', 'lastAnalysis'], (result) => {
    const totalProfiles = (result.totalProfiles || 0) + 1;
    const currentAvg = result.averageScore || 0;
    const newAvg = ((currentAvg * (totalProfiles - 1)) + data.score) / totalProfiles;
    
    chrome.storage.local.set({
      totalProfiles: totalProfiles,
      averageScore: Math.round(newAvg),
      lastAnalysis: {
        score: data.score,
        timestamp: Date.now(),
        url: data.url
      }
    });
  });
}

// Context menu creation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzeProfile",
    title: "Analyze Upwork Profile",
    contexts: ["page"],
    documentUrlPatterns: ["*://www.upwork.com/*"]
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyzeProfile") {
    chrome.tabs.sendMessage(tab.id, { action: "analyzeProfile" });
  }
});

// Tab update handler
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('upwork.com')) {
    // Inject content script if needed
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(() => {
      // Content script might already be injected
    });
  }
});
