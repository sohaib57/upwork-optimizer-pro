console.log("🚀 Upwork Optimizer Pro content script is running...");

// Enhanced profile analysis with more comprehensive checks
function analyzeUpworkProfile() {
  const text = document.body.innerText;
  const html = document.body.innerHTML;
  let suggestions = [];
  let score = 100;
  let analysisData = {
    overview: false,
    hourlyRate: false,
    portfolio: false,
    skills: false,
    experience: false,
    certifications: false,
    availability: false,
    communication: false,
    testimonials: false,
    education: false,
    languages: false,
    location: false,
    responseTime: false,
    completionRate: false,
    earnings: false
  };

  // Check for overview section (multiple variations)
  if (text.includes("Overview") || text.includes("About") || text.includes("Summary") || 
      text.includes("Introduction") || text.includes("Bio") || text.includes("Description")) {
    analysisData.overview = true;
  } else {
    suggestions.push("⚠️ Add a compelling overview/about section to explain your skills and experience.");
    score -= 20;
  }

  // Check for hourly rate (multiple patterns)
  if (text.match(/(\$|hour|rate|per hour|hourly)/i) || 
      html.includes('data-test="hourly-rate"') || 
      html.includes('data-test="rate"')) {
    analysisData.hourlyRate = true;
  } else {
    suggestions.push("⚠️ Set a clear hourly rate to attract serious clients.");
    score -= 15;
  }

  // Check for portfolio/work samples
  if (text.match(/Portfolio|Work samples|Projects|Showcase|Examples/i) ||
      html.includes('data-test="portfolio"') ||
      html.includes('data-test="work-samples"')) {
    analysisData.portfolio = true;
  } else {
    suggestions.push("⚠️ Upload portfolio items to showcase your work and build trust.");
    score -= 15;
  }

  // Check for skills section
  if (text.match(/Skills|Expertise|Technologies|Proficiencies/i) ||
      html.includes('data-test="skills"') ||
      html.includes('class="skills"')) {
    analysisData.skills = true;
  } else {
    suggestions.push("⚠️ Add relevant skills for better search ranking and client matching.");
    score -= 10;
  }

  // Check for experience level
  if (text.match(/Experience|Years|Level|Senior|Junior|Expert/i) ||
      text.match(/\d+\+?\s*(years?|yrs?)/i)) {
    analysisData.experience = true;
  } else {
    suggestions.push("⚠️ Clearly state your experience level and years of expertise.");
    score -= 10;
  }

  // Check for certifications
  if (text.match(/Certification|Certified|License|Certificate|Accreditation/i)) {
    analysisData.certifications = true;
  } else {
    suggestions.push("💡 Consider adding relevant certifications to boost credibility.");
    score -= 5;
  }

  // Check for availability
  if (text.match(/Available|Availability|Schedule|Time zone|Timezone/i) ||
      text.match(/Full.?time|Part.?time|Flexible/i)) {
    analysisData.availability = true;
  } else {
    suggestions.push("💡 Mention your availability to help clients plan projects.");
    score -= 5;
  }

  // Check for communication
  if (text.match(/Communication|Response|Contact|Reply|Message/i) ||
      text.match(/24.?hour|Same.?day|Quick.?response/i)) {
    analysisData.communication = true;
  } else {
    suggestions.push("💡 Highlight your communication style and response time.");
    score -= 5;
  }

  // Check for testimonials/reviews
  if (text.match(/Review|Testimonial|Feedback|Client.?feedback|Reference/i) ||
      html.includes('data-test="reviews"') ||
      html.includes('class="testimonials"')) {
    analysisData.testimonials = true;
  } else {
    suggestions.push("💡 Include client testimonials or references if available.");
    score -= 5;
  }

  // Check for education
  if (text.match(/Education|Degree|University|College|School|Bachelor|Master|PhD/i)) {
    analysisData.education = true;
  } else {
    suggestions.push("💡 Add your educational background to build credibility.");
    score -= 3;
  }

  // Check for languages
  if (text.match(/Languages?|Bilingual|Fluent|Native|English|Spanish|French/i)) {
    analysisData.languages = true;
  } else {
    suggestions.push("💡 List your language proficiencies for international clients.");
    score -= 3;
  }

  // Check for location/timezone
  if (text.match(/Location|Timezone|Time.?zone|Country|City|Based.?in/i)) {
    analysisData.location = true;
  } else {
    suggestions.push("💡 Mention your location or timezone for better client coordination.");
    score -= 2;
  }

  // Check for response time
  if (text.match(/Response.?time|Reply.?within|Quick.?reply|Fast.?response/i) ||
      text.match(/\d+\s*(hour|hr|minute|min)/i)) {
    analysisData.responseTime = true;
  } else {
    suggestions.push("💡 Specify your typical response time to set client expectations.");
    score -= 2;
  }

  // Check for completion rate
  if (text.match(/Completion.?rate|Success.?rate|On.?time|Delivered/i) ||
      text.match(/\d+%?\s*(complete|success|delivered)/i)) {
    analysisData.completionRate = true;
  } else {
    suggestions.push("💡 Highlight your project completion rate or success metrics.");
    score -= 2;
  }

  // Check for earnings/income
  if (text.match(/Earnings|Income|Revenue|Earned|Total.?earnings/i) ||
      text.match(/\$\d+[kK]?\s*(earned|total|income)/i)) {
    analysisData.earnings = true;
  } else {
    suggestions.push("💡 Consider showcasing your earnings to demonstrate success.");
    score -= 1;
  }

  // Additional advanced checks
  checkAdvancedElements(suggestions, score, analysisData);

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Generate detailed result
  let result = `📊 Profile Score: ${score}/100\n\n`;
  
  if (suggestions.length === 0) {
    result += "✅ Your profile looks excellent! Keep up the great work.";
  } else {
    result += "🔧 Optimization Suggestions:\n" + suggestions.join("\n");
  }

  // Add summary statistics
  result += `\n\n📈 Profile Completeness: ${Math.round((Object.values(analysisData).filter(Boolean).length / Object.keys(analysisData).length) * 100)}%`;
  result += `\n🎯 Key Strengths: ${getKeyStrengths(analysisData)}`;
  result += `\n🚀 Priority Actions: ${getPriorityActions(analysisData)}`;

  return result;
}

function checkAdvancedElements(suggestions, score, analysisData) {
  const text = document.body.innerText;
  const html = document.body.innerHTML;

  // Check for professional keywords
  const professionalKeywords = ['professional', 'expert', 'specialist', 'consultant', 'developer', 'designer', 'manager'];
  const hasProfessionalKeywords = professionalKeywords.some(keyword => 
    text.toLowerCase().includes(keyword)
  );

  if (!hasProfessionalKeywords) {
    suggestions.push("💡 Use professional keywords to improve search visibility.");
    score -= 2;
  }

  // Check for action verbs
  const actionVerbs = ['developed', 'created', 'managed', 'led', 'implemented', 'designed', 'built', 'delivered'];
  const hasActionVerbs = actionVerbs.some(verb => 
    text.toLowerCase().includes(verb)
  );

  if (!hasActionVerbs) {
    suggestions.push("💡 Use strong action verbs to make your experience more compelling.");
    score -= 2;
  }

  // Check for metrics/numbers
  const hasMetrics = /\d+%|\d+\+|\$\d+|\d+\s*(clients?|projects?|years?)/i.test(text);
  if (!hasMetrics) {
    suggestions.push("💡 Include specific metrics and numbers to quantify your achievements.");
    score -= 2;
  }

  // Check for industry-specific terms
  const industryTerms = ['agile', 'scrum', 'waterfall', 'api', 'ui/ux', 'seo', 'ppc', 'crm', 'erp'];
  const hasIndustryTerms = industryTerms.some(term => 
    text.toLowerCase().includes(term)
  );

  if (!hasIndustryTerms) {
    suggestions.push("💡 Include industry-specific terminology to show expertise.");
    score -= 1;
  }
}

function getKeyStrengths(analysisData) {
  const strengths = [];
  if (analysisData.overview) strengths.push('Strong Overview');
  if (analysisData.hourlyRate) strengths.push('Clear Pricing');
  if (analysisData.portfolio) strengths.push('Portfolio Showcase');
  if (analysisData.skills) strengths.push('Skills Listed');
  if (analysisData.experience) strengths.push('Experience Highlighted');
  
  return strengths.length > 0 ? strengths.join(', ') : 'Basic Profile';
}

function getPriorityActions(analysisData) {
  const priorities = [];
  if (!analysisData.overview) priorities.push('Add Overview');
  if (!analysisData.hourlyRate) priorities.push('Set Rate');
  if (!analysisData.portfolio) priorities.push('Upload Portfolio');
  if (!analysisData.skills) priorities.push('Add Skills');
  if (!analysisData.experience) priorities.push('Show Experience');
  
  return priorities.length > 0 ? priorities.slice(0, 3).join(', ') : 'Profile Complete';
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeProfile") {
    const result = analyzeUpworkProfile();
    sendResponse({ result: result });
  }
});

// Auto-analyze when page loads (optional)
if (window.location.hostname === "www.upwork.com" && 
    (window.location.pathname.includes("/freelancers/") || 
     window.location.pathname.includes("/profile/") ||
     window.location.pathname.includes("/ab/"))) {
  console.log("🎯 Upwork profile page detected - ready for analysis");
  
  // Add a subtle indicator that the extension is active
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(52, 152, 219, 0.9);
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
    z-index: 10000;
    pointer-events: none;
    opacity: 0.8;
  `;
  indicator.textContent = '🚀 Optimizer Active';
  document.body.appendChild(indicator);
  
  // Remove indicator after 3 seconds
  setTimeout(() => {
    if (indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  }, 3000);
}
