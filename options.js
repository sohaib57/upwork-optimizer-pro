// Options page JavaScript for Upwork Optimizer Pro

// Default settings
const defaultSettings = {
  autoAnalysis: false,
  showIndicator: true,
  detailedAnalysis: true,
  analysisNotifications: true,
  scoreThreshold: 70,
  saveHistory: true
};

// DOM elements
const totalProfilesEl = document.getElementById('totalProfiles');
const averageScoreEl = document.getElementById('averageScore');
const lastAnalysisEl = document.getElementById('lastAnalysis');
const saveStatusEl = document.getElementById('saveStatus');

// Toggle switches
const toggleSwitches = {
  autoAnalysis: document.getElementById('autoAnalysis'),
  showIndicator: document.getElementById('showIndicator'),
  detailedAnalysis: document.getElementById('detailedAnalysis'),
  analysisNotifications: document.getElementById('analysisNotifications'),
  saveHistory: document.getElementById('saveHistory')
};

// Buttons
const saveSettingsBtn = document.getElementById('saveSettings');
const resetSettingsBtn = document.getElementById('resetSettings');
const testAnalysisBtn = document.getElementById('testAnalysis');
const exportDataBtn = document.getElementById('exportData');
const clearDataBtn = document.getElementById('clearData');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadStatistics();
  setupEventListeners();
});

function setupEventListeners() {
  // Toggle switch listeners
  Object.keys(toggleSwitches).forEach(key => {
    toggleSwitches[key].addEventListener('click', () => {
      toggleSwitches[key].classList.toggle('active');
    });
  });

  // Button listeners
  saveSettingsBtn.addEventListener('click', saveSettings);
  resetSettingsBtn.addEventListener('click', resetSettings);
  testAnalysisBtn.addEventListener('click', testAnalysis);
  exportDataBtn.addEventListener('click', exportData);
  clearDataBtn.addEventListener('click', clearData);
}

function loadSettings() {
  chrome.storage.sync.get(defaultSettings, (settings) => {
    // Set toggle switches
    Object.keys(toggleSwitches).forEach(key => {
      if (settings[key]) {
        toggleSwitches[key].classList.add('active');
      }
    });

    // Set score threshold
    document.getElementById('scoreThreshold').value = settings.scoreThreshold;
  });
}

function loadStatistics() {
  chrome.storage.local.get(['totalProfiles', 'averageScore', 'lastAnalysis'], (result) => {
    totalProfilesEl.textContent = result.totalProfiles || 0;
    averageScoreEl.textContent = result.averageScore || 0;
    
    if (result.lastAnalysis) {
      const date = new Date(result.lastAnalysis.timestamp);
      lastAnalysisEl.textContent = date.toLocaleDateString();
    } else {
      lastAnalysisEl.textContent = 'Never';
    }
  });
}

function saveSettings() {
  const settings = {
    autoAnalysis: toggleSwitches.autoAnalysis.classList.contains('active'),
    showIndicator: toggleSwitches.showIndicator.classList.contains('active'),
    detailedAnalysis: toggleSwitches.detailedAnalysis.classList.contains('active'),
    analysisNotifications: toggleSwitches.analysisNotifications.classList.contains('active'),
    scoreThreshold: parseInt(document.getElementById('scoreThreshold').value),
    saveHistory: toggleSwitches.saveHistory.classList.contains('active')
  };

  chrome.storage.sync.set(settings, () => {
    showSaveStatus('Settings saved successfully!', 'success');
  });
}

function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to default?')) {
    chrome.storage.sync.set(defaultSettings, () => {
      loadSettings();
      showSaveStatus('Settings reset to default!', 'success');
    });
  }
}

function testAnalysis() {
  // Open a test Upwork profile page
  chrome.tabs.create({
    url: 'https://www.upwork.com/freelancers/~01a1b2c3d4e5f6g7h8'
  });
}

function exportData() {
  chrome.storage.local.get(['analysisHistory'], (result) => {
    if (!result.analysisHistory || result.analysisHistory.length === 0) {
      showSaveStatus('No analysis data to export.', 'error');
      return;
    }

    const csvContent = convertToCSV(result.analysisHistory);
    downloadCSV(csvContent, 'upwork_analysis_history.csv');
    showSaveStatus('Data exported successfully!', 'success');
  });
}

function clearData() {
  if (confirm('Are you sure you want to clear all analysis data? This action cannot be undone.')) {
    chrome.storage.local.clear(() => {
      loadStatistics();
      showSaveStatus('All data cleared successfully!', 'success');
    });
  }
}

function convertToCSV(data) {
  const headers = ['Date', 'Score', 'URL', 'Suggestions'];
  const csvRows = [headers.join(',')];

  data.forEach(item => {
    const row = [
      new Date(item.timestamp).toLocaleDateString(),
      item.score,
      item.url,
      `"${item.suggestions.join('; ')}"`
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function showSaveStatus(message, type) {
  saveStatusEl.textContent = message;
  saveStatusEl.className = `save-status ${type}`;
  saveStatusEl.style.display = 'block';

  setTimeout(() => {
    saveStatusEl.style.display = 'none';
  }, 3000);
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    loadStatistics();
  }
});
