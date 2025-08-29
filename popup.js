// Global variables
let currentAnalysis = null;
let isAnalyzing = false;

// DOM elements
const analyzeBtn = document.getElementById('analyzeBtn');
const refreshBtn = document.getElementById('refreshBtn');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const successState = document.getElementById('successState');
const scoreSection = document.getElementById('scoreSection');
const scoreCircle = document.getElementById('scoreCircle');
const scoreLabel = document.getElementById('scoreLabel');
const overviewContent = document.getElementById('overviewContent');
const suggestionsContent = document.getElementById('suggestionsContent');
const statsGrid = document.getElementById('statsGrid');

// Tab management
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Event listeners
analyzeBtn.addEventListener('click', analyzeProfile);
refreshBtn.addEventListener('click', analyzeProfile);

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetTab = tab.getAttribute('data-tab');
    switchTab(targetTab);
  });
});

function switchTab(tabName) {
  // Remove active class from all tabs and contents
  tabs.forEach(tab => tab.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  
  // Add active class to selected tab and content
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}Tab`).classList.add('active');
}

function showLoading() {
  isAnalyzing = true;
  loadingState.style.display = 'block';
  errorState.style.display = 'none';
  successState.style.display = 'none';
  scoreSection.style.display = 'none';
  analyzeBtn.disabled = true;
  refreshBtn.disabled = true;
}

function hideLoading() {
  isAnalyzing = false;
  loadingState.style.display = 'none';
  analyzeBtn.disabled = false;
  refreshBtn.disabled = false;
}

function showError(message) {
  errorState.textContent = message;
  errorState.style.display = 'block';
  successState.style.display = 'none';
}

function showSuccess(message) {
  successState.textContent = message;
  successState.style.display = 'block';
  errorState.style.display = 'none';
}

function analyzeProfile() {
  if (isAnalyzing) return;
  
  showLoading();
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    
    // Check if we're on an Upwork page
    if (!tab.url.includes("upwork.com")) {
      hideLoading();
      showError("❌ Please navigate to an Upwork profile page first.");
      return;
    }
    
    // Send message to content script
    chrome.tabs.sendMessage(tab.id, { action: "analyzeProfile" }, (response) => {
      if (chrome.runtime.lastError) {
        // Fallback to executeScript if content script isn't loaded
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: analyzeUpworkProfile
        }, (results) => {
          hideLoading();
          if (results && results[0] && results[0].result) {
            processAnalysisResults(results[0].result);
          } else {
            showError("❌ Could not analyze profile. Please refresh the page and try again.");
          }
        });
      } else if (response && response.result) {
        hideLoading();
        processAnalysisResults(response.result);
      } else {
        hideLoading();
        showError("❌ Analysis failed. Please try again.");
      }
    });
  });
}

function processAnalysisResults(result) {
  try {
    // Parse the result to extract score and suggestions
    const lines = result.split('\n');
    const scoreMatch = lines[0].match(/Profile Score: (\d+)\/100/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
    
    // Extract suggestions
    const suggestions = [];
    let inSuggestions = false;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('Optimization Suggestions:')) {
        inSuggestions = true;
        continue;
      }
      if (inSuggestions && line) {
        suggestions.push(line);
      }
    }
    
    currentAnalysis = {
      score: score,
      suggestions: suggestions,
      totalSuggestions: suggestions.length,
      criticalSuggestions: suggestions.filter(s => s.includes('⚠️')).length,
      optionalSuggestions: suggestions.filter(s => s.includes('💡')).length
    };
    
    displayResults();
    showSuccess("✅ Analysis completed successfully!");
    
  } catch (error) {
    console.error('Error processing results:', error);
    showError("❌ Error processing analysis results.");
  }
}

function displayResults() {
  if (!currentAnalysis) return;
  
  // Display score
  scoreSection.style.display = 'block';
  scoreCircle.textContent = currentAnalysis.score;
  scoreCircle.style.background = getScoreColor(currentAnalysis.score);
  scoreLabel.textContent = getScoreLabel(currentAnalysis.score);
  
  // Display overview
  displayOverview();
  
  // Display suggestions
  displaySuggestions();
  
  // Display statistics
  displayStatistics();
}

function getScoreColor(score) {
  if (score >= 80) return 'rgba(39, 174, 96, 0.8)'; // Green
  if (score >= 60) return 'rgba(243, 156, 18, 0.8)'; // Orange
  return 'rgba(231, 76, 60, 0.8)'; // Red
}

function getScoreLabel(score) {
  if (score >= 80) return 'Excellent Profile!';
  if (score >= 60) return 'Good Profile';
  if (score >= 40) return 'Needs Improvement';
  return 'Requires Major Work';
}

function displayOverview() {
  const { score, totalSuggestions, criticalSuggestions } = currentAnalysis;
  
  let overviewHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h3 style="color: #2c3e50; margin-bottom: 10px;">Profile Analysis Summary</h3>
      <p style="color: #7f8c8d; font-size: 13px; line-height: 1.5;">
        Your profile has been analyzed and scored based on key optimization factors.
      </p>
    </div>
  `;
  
  if (score >= 80) {
    overviewHTML += `
      <div class="suggestion-item suggestion-good">
        <strong>🎉 Excellent Work!</strong><br>
        Your profile is well-optimized and should perform well in Upwork searches.
      </div>
    `;
  } else if (score >= 60) {
    overviewHTML += `
      <div class="suggestion-item suggestion-important">
        <strong>👍 Good Foundation</strong><br>
        Your profile has potential but could benefit from some improvements.
      </div>
    `;
  } else {
    overviewHTML += `
      <div class="suggestion-item suggestion-critical">
        <strong>⚠️ Needs Attention</strong><br>
        Your profile requires significant improvements to compete effectively.
      </div>
    `;
  }
  
  if (criticalSuggestions > 0) {
    overviewHTML += `
      <div class="suggestion-item suggestion-critical">
        <strong>Priority Actions:</strong><br>
        ${criticalSuggestions} critical improvement${criticalSuggestions > 1 ? 's' : ''} needed
      </div>
    `;
  }
  
  overviewContent.innerHTML = overviewHTML;
}

function displaySuggestions() {
  if (!currentAnalysis.suggestions.length) {
    suggestionsContent.innerHTML = `
      <div class="suggestion-item suggestion-good">
        <strong>✅ Perfect Profile!</strong><br>
        No suggestions found. Your profile is well-optimized!
      </div>
    `;
    return;
  }
  
  let suggestionsHTML = '';
  
  currentAnalysis.suggestions.forEach(suggestion => {
    let className = 'suggestion-optional';
    if (suggestion.includes('⚠️')) {
      className = 'suggestion-critical';
    } else if (suggestion.includes('💡')) {
      className = 'suggestion-optional';
    }
    
    suggestionsHTML += `
      <div class="suggestion-item ${className}">
        ${suggestion}
      </div>
    `;
  });
  
  suggestionsContent.innerHTML = suggestionsHTML;
}

function displayStatistics() {
  const { score, totalSuggestions, criticalSuggestions, optionalSuggestions } = currentAnalysis;
  
  const statsHTML = `
    <div class="stat-card">
      <div class="stat-number">${score}</div>
      <div class="stat-label">Profile Score</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${totalSuggestions}</div>
      <div class="stat-label">Total Suggestions</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${criticalSuggestions}</div>
      <div class="stat-label">Critical Issues</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${optionalSuggestions}</div>
      <div class="stat-label">Optional Improvements</div>
    </div>
  `;
  
  statsGrid.innerHTML = statsHTML;
}

// Enhanced analysis function (fallback)
function analyzeUpworkProfile() {
  const text = document.body.innerText;
  let suggestions = [];
  let score = 100;

  // Check for overview section
  if (!text.includes("Overview") && !text.includes("About")) {
    suggestions.push("⚠️ Add a compelling overview/about section to explain your skills and experience.");
    score -= 20;
  }

  // Check for hourly rate
  if (!text.match(/(\$|hour|rate)/i)) {
    suggestions.push("⚠️ Set a clear hourly rate to attract serious clients.");
    score -= 15;
  }

  // Check for portfolio
  if (!text.match(/Portfolio|Work samples|Projects/i)) {
    suggestions.push("⚠️ Upload portfolio items to showcase your work and build trust.");
    score -= 15;
  }

  // Check for skills
  if (!text.match(/Skills|Expertise|Technologies/i)) {
    suggestions.push("⚠️ Add relevant skills for better search ranking and client matching.");
    score -= 10;
  }

  // Check for experience level
  if (!text.match(/Experience|Years|Level/i)) {
    suggestions.push("⚠️ Clearly state your experience level and years of expertise.");
    score -= 10;
  }

  // Check for certifications
  if (!text.match(/Certification|Certified|License/i)) {
    suggestions.push("💡 Consider adding relevant certifications to boost credibility.");
    score -= 5;
  }

  // Check for availability
  if (!text.match(/Available|Availability|Schedule/i)) {
    suggestions.push("💡 Mention your availability to help clients plan projects.");
    score -= 5;
  }

  // Check for communication
  if (!text.match(/Communication|Response|Contact/i)) {
    suggestions.push("💡 Highlight your communication style and response time.");
    score -= 5;
  }

  // Check for testimonials/reviews
  if (!text.match(/Review|Testimonial|Feedback/i)) {
    suggestions.push("💡 Include client testimonials or references if available.");
    score -= 5;
  }

  // Generate result
  let result = `📊 Profile Score: ${score}/100\n\n`;
  
  if (suggestions.length === 0) {
    result += "✅ Your profile looks excellent! Keep up the great work.";
  } else {
    result += "🔧 Optimization Suggestions:\n" + suggestions.join("\n");
  }

  return result;
}
  