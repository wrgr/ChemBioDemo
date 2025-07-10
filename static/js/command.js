// Command Center Analysis JavaScript

// Initialize command center functionality
function initializeCommandCenter() {
    console.log('Initializing command center...');
    
    // Initialize command center specific features
    setupCommandEventHandlers();
    loadCommandData();
}

// Setup command center event handlers
function setupCommandEventHandlers() {
    // Add any command center specific event handlers here
    console.log('Command center event handlers setup complete');
}

// Load command center data
function loadCommandData() {
    // Load any initial command center data
    console.log('Command center data loaded');
}

// Update command center analysis display
function updateCommandAnalysis(analysisResults) {
    console.log('Updating command analysis display:', analysisResults);
    
    if (!analysisResults) {
        console.log('No analysis results available');
        return;
    }
    
    // Update analysis overview
    updateAnalysisOverview(analysisResults);
    
    // Update agent analysis details
    updateAgentAnalysisDetails(analysisResults);
}

// Update analysis overview
function updateAnalysisOverview(analysisResults) {
    const analysisOverview = document.getElementById('analysisOverview');
    if (!analysisOverview) return;
    
    const overallAssessment = analysisResults.agent_analysis?.overall_assessment;
    if (!overallAssessment) return;
    
    analysisOverview.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="card border-0 bg-light">
                    <div class="card-body text-center">
                        <h5 class="card-title text-muted">Threat Level</h5>
                        <div class="display-4 ${getThreatColor(overallAssessment.threat_level)}">${overallAssessment.threat_level}</div>
                        <p class="card-text">${formatConfidence(overallAssessment.confidence)}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-0 bg-light">
                    <div class="card-body text-center">
                        <h5 class="card-title text-muted">Overall Confidence</h5>
                        <div class="display-4 text-info">${Math.round(overallAssessment.confidence * 100)}%</div>
                        <p class="card-text">System Assessment</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-3">
            <h6 class="text-muted">Assessment Summary:</h6>
            <p class="mb-0">${overallAssessment.summary || 'No summary available'}</p>
        </div>
    `;
}

// Update agent analysis details
function updateAgentAnalysisDetails(analysisResults) {
    const agentAnalysis = document.getElementById('agentAnalysis');
    if (!agentAnalysis) return;
    
    const agentResults = analysisResults.agent_analysis?.agent_results;
    if (!agentResults) return;
    
    let agentHtml = `
        <ul class="nav nav-tabs mb-3" id="agentTabs" role="tablist">
    `;
    
    // Create tabs for each agent
    const agents = Object.keys(agentResults);
    agents.forEach((agentKey, index) => {
        const agent = agentResults[agentKey];
        const isActive = index === 0 ? 'active' : '';
        const agentName = formatAgentName(agentKey);
        
        agentHtml += `
            <li class="nav-item" role="presentation">
                <button class="nav-link ${isActive}" id="${agentKey}-tab" data-bs-toggle="tab" 
                        data-bs-target="#${agentKey}" type="button" role="tab">
                    ${agentName}
                    <span class="badge bg-secondary ms-2">${Math.round(agent.confidence * 100)}%</span>
                </button>
            </li>
        `;
    });
    
    agentHtml += `</ul><div class="tab-content" id="agentTabsContent">`;
    
    // Create content for each agent
    agents.forEach((agentKey, index) => {
        const agent = agentResults[agentKey];
        const isActive = index === 0 ? 'show active' : '';
        
        agentHtml += `
            <div class="tab-pane fade ${isActive}" id="${agentKey}" role="tabpanel">
                <div class="row mb-3">
                    <div class="col-md-4">
                        <div class="card border-0 bg-light">
                            <div class="card-body text-center">
                                <h6 class="card-title text-muted">Confidence</h6>
                                <div class="h4 text-info">${Math.round(agent.confidence * 100)}%</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card border-0 bg-light">
                            <div class="card-body text-center">
                                <h6 class="card-title text-muted">Hazard Level</h6>
                                <div class="h4 ${getThreatColor(agent.hazard_level)}">${agent.hazard_level}</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card border-0 bg-light">
                            <div class="card-body text-center">
                                <h6 class="card-title text-muted">Findings</h6>
                                <div class="h4 text-secondary">${agent.findings ? agent.findings.length : 0}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="card-title mb-0">Key Findings</h6>
                            </div>
                            <div class="card-body">
                                ${formatFindingsList(agent.findings)}
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="card-title mb-0">Recommendations</h6>
                            </div>
                            <div class="card-body">
                                ${formatRecommendationsList(agent.recommendations)}
                            </div>
                        </div>
                    </div>
                </div>
                
                ${agent.metadata ? `
                    <div class="card mt-3">
                        <div class="card-header">
                            <h6 class="card-title mb-0">Technical Details</h6>
                        </div>
                        <div class="card-body">
                            ${formatMetadata(agent.metadata)}
                        </div>
                    </div>
                ` : ''}
                
                ${agent.reasoning ? `
                    <div class="card mt-3">
                        <div class="card-header">
                            <h6 class="card-title mb-0">AI Reasoning</h6>
                        </div>
                        <div class="card-body">
                            <p class="mb-0">${agent.reasoning}</p>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    agentHtml += `</div>`;
    agentAnalysis.innerHTML = agentHtml;
}

// Format agent name for display
function formatAgentName(agentKey) {
    const names = {
        'hazard_detection': 'Hazard Detection',
        'synthesis_analysis': 'Synthesis Analysis',
        'mopp_recommendation': 'MOPP Recommendation',
        'sampling_strategy': 'Sampling Strategy'
    };
    return names[agentKey] || agentKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Format metadata for display
function formatMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') {
        return '<p class="text-muted">No metadata available</p>';
    }
    
    let html = '<div class="row">';
    
    Object.keys(metadata).forEach(key => {
        const value = metadata[key];
        const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        html += `
            <div class="col-md-6 mb-3">
                <div class="border rounded p-3 bg-light">
                    <h6 class="text-muted mb-2">${displayKey}</h6>
                    <div class="text-dark">
                        ${Array.isArray(value) ? 
                            value.map(item => `<span class="badge bg-secondary me-1">${item}</span>`).join('') :
                            `<span class="fw-bold">${value}</span>`
                        }
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// Format findings list
function formatFindingsList(findings) {
    if (!findings || findings.length === 0) {
        return '<p class="text-muted">No findings available</p>';
    }
    
    return findings.map(finding => `
        <div class="alert alert-light border-start border-info border-3 py-2 mb-2">
            <small><i class="bi bi-info-circle text-info me-2"></i>${finding}</small>
        </div>
    `).join('');
}

// Format recommendations list
function formatRecommendationsList(recommendations) {
    if (!recommendations || recommendations.length === 0) {
        return '<p class="text-muted">No recommendations available</p>';
    }
    
    return recommendations.map((rec, index) => `
        <div class="alert alert-warning border-start border-warning border-3 py-2 mb-2">
            <div class="d-flex align-items-start">
                <span class="badge bg-warning text-dark me-2">${index + 1}</span>
                <small>${rec}</small>
            </div>
        </div>
    `).join('');
}

// Format confidence with color coding
function formatConfidence(confidence) {
    const percentage = Math.round(confidence * 100);
    let badgeClass = 'bg-secondary';
    
    if (percentage >= 80) badgeClass = 'bg-success';
    else if (percentage >= 60) badgeClass = 'bg-warning';
    else if (percentage >= 40) badgeClass = 'bg-danger';
    
    return `<span class="badge ${badgeClass}">${percentage}% confidence</span>`;
}

// Get threat level color
function getThreatColor(threatLevel) {
    const colors = {
        'CRITICAL': 'text-danger',
        'HIGH': 'text-warning',
        'MODERATE': 'text-info',
        'LOW': 'text-success',
        'MINIMAL': 'text-secondary',
        'UNKNOWN': 'text-muted'
    };
    return colors[threatLevel] || 'text-muted';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeCommandCenter();
});

// Export functions for global access
window.updateCommandAnalysis = updateCommandAnalysis;
window.initializeCommandCenter = initializeCommandCenter;