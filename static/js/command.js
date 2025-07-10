// ChemBio Defense Dashboard - Command Center

// Command-specific variables
let commandAnalysisResults = null;
let agentCharts = {};
let analysisChart = null;

// Initialize command center
function initializeCommandCenter() {
    console.log('Initializing command center');
    
    // Setup command event handlers
    setupCommandEventHandlers();
    
    // Initialize command display
    initializeCommandDisplay();
    
    // Initialize charts
    initializeCharts();
}

// Setup command event handlers
function setupCommandEventHandlers() {
    // Tab switch handler for command center
    document.getElementById('command-tab').addEventListener('shown.bs.tab', function() {
        // Refresh charts when tab is shown
        refreshCharts();
    });
}

// Initialize command display
function initializeCommandDisplay() {
    resetCommandDisplay();
}

// Reset command display to initial state
function resetCommandDisplay() {
    const analysisOverview = document.getElementById('analysisOverview');
    const agentAnalysis = document.getElementById('agentAnalysis');
    
    analysisOverview.innerHTML = `
        <div class="text-center py-4">
            <i class="bi bi-bar-chart display-4 text-muted"></i>
            <p class="text-muted mt-2">No analysis data available</p>
        </div>
    `;
    
    agentAnalysis.innerHTML = `
        <div class="text-center py-4">
            <i class="bi bi-robot display-4 text-muted"></i>
            <p class="text-muted mt-2">No agent analysis available</p>
        </div>
    `;
}

// Initialize charts
function initializeCharts() {
    // Analysis overview chart will be created when data is available
    console.log('Chart initialization ready');
}

// Update command analysis display
function updateCommandAnalysis(analysisResults) {
    console.log('Updating command analysis display');
    
    commandAnalysisResults = analysisResults;
    
    // Update analysis overview
    updateAnalysisOverview(analysisResults);
    
    // Update agent analysis
    updateAgentAnalysis(analysisResults);
    
    // Show command briefing
    showCommandBriefing(analysisResults);
}

// Update analysis overview
function updateAnalysisOverview(analysisResults) {
    const analysisOverview = document.getElementById('analysisOverview');
    const overallAssessment = analysisResults.overall_assessment || {};
    const confidenceMetrics = analysisResults.confidence_metrics || {};
    
    const overviewHtml = `
        <div class="row">
            <div class="col-md-8">
                <div class="mb-3">
                    <canvas id="analysisChart" width="400" height="200"></canvas>
                </div>
            </div>
            <div class="col-md-4">
                <div class="row g-2">
                    <div class="col-12">
                        <div class="card border-primary">
                            <div class="card-body text-center">
                                <h5 class="card-title text-primary">Overall Confidence</h5>
                                <div class="display-4 fw-bold">${formatConfidence(overallAssessment.overall_confidence || 0)}</div>
                                <div class="progress mt-2">
                                    <div class="progress-bar bg-primary" 
                                         style="width: ${(overallAssessment.overall_confidence || 0) * 100}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="card border-warning">
                            <div class="card-body text-center">
                                <h6 class="card-title text-warning">Threat Level</h6>
                                <div class="h4 fw-bold ${getThreatLevelClass(overallAssessment.threat_level)}">
                                    ${overallAssessment.threat_level || 'UNKNOWN'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="card border-info">
                            <div class="card-body text-center">
                                <h6 class="card-title text-info">Operation Type</h6>
                                <div class="fw-bold">${(overallAssessment.operation_type || 'UNKNOWN').replace('_', ' ')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-3">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h6 class="card-title mb-0">Confidence Metrics</h6>
                    </div>
                    <div class="card-body">
                        <div class="mb-2">
                            <div class="d-flex justify-content-between">
                                <span>Overall Confidence</span>
                                <span class="fw-bold">${formatConfidence(confidenceMetrics.overall_confidence || 0)}</span>
                            </div>
                            <div class="progress">
                                <div class="progress-bar" style="width: ${(confidenceMetrics.overall_confidence || 0) * 100}%"></div>
                            </div>
                        </div>
                        <div class="mb-2">
                            <div class="d-flex justify-content-between">
                                <span>Consensus Score</span>
                                <span class="fw-bold">${formatConfidence(confidenceMetrics.consensus_score || 0)}</span>
                            </div>
                            <div class="progress">
                                <div class="progress-bar bg-info" style="width: ${(confidenceMetrics.consensus_score || 0) * 100}%"></div>
                            </div>
                        </div>
                        <div class="mb-0">
                            <div class="d-flex justify-content-between">
                                <span>Reliability</span>
                                <span class="badge ${getReliabilityClass(confidenceMetrics.reliability_rating)}">${confidenceMetrics.reliability_rating || 'UNKNOWN'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h6 class="card-title mb-0">Resource Requirements</h6>
                    </div>
                    <div class="card-body">
                        ${generateResourceRequirements(analysisResults)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    analysisOverview.innerHTML = overviewHtml;
    
    // Create analysis chart
    createAnalysisChart(analysisResults);
}

// Update agent analysis
function updateAgentAnalysis(analysisResults) {
    const agentAnalysis = document.getElementById('agentAnalysis');
    const agentResults = analysisResults.agent_analysis?.agent_results || {};
    
    if (Object.keys(agentResults).length === 0) {
        agentAnalysis.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-robot display-4 text-muted"></i>
                <p class="text-muted mt-2">No agent analysis available</p>
            </div>
        `;
        return;
    }
    
    // Create agent tabs
    const agentTabsHtml = `
        <ul class="nav nav-pills mb-3" id="agentTabs" role="tablist">
            ${Object.keys(agentResults).map((agentName, index) => `
                <li class="nav-item" role="presentation">
                    <button class="nav-link ${index === 0 ? 'active' : ''}" 
                            id="agent-${agentName}-tab" 
                            data-bs-toggle="pill" 
                            data-bs-target="#agent-${agentName}" 
                            type="button" 
                            role="tab">
                        ${formatAgentName(agentName)}
                        <span class="badge bg-secondary ms-1">${formatConfidence(agentResults[agentName].confidence)}</span>
                    </button>
                </li>
            `).join('')}
        </ul>
        
        <div class="tab-content" id="agentTabsContent">
            ${Object.entries(agentResults).map(([agentName, result], index) => `
                <div class="tab-pane fade ${index === 0 ? 'show active' : ''}" 
                     id="agent-${agentName}" 
                     role="tabpanel">
                    ${generateAgentAnalysisCard(agentName, result)}
                </div>
            `).join('')}
        </div>
    `;
    
    agentAnalysis.innerHTML = agentTabsHtml;
}

// Generate agent analysis card
function generateAgentAnalysisCard(agentName, agentResult) {
    const agentClass = getAgentClass(agentName);
    
    return `
        <div class="card agent-card ${agentClass}">
            <div class="card-header">
                <div class="row align-items-center">
                    <div class="col">
                        <h5 class="card-title mb-0">
                            ${getAgentIcon(agentName)}
                            ${formatAgentName(agentName)}
                        </h5>
                    </div>
                    <div class="col-auto">
                        <div class="d-flex align-items-center">
                            <span class="badge bg-primary me-2">
                                Confidence: ${formatConfidence(agentResult.confidence)}
                            </span>
                            <span class="badge ${getHazardLevelBadgeClass(agentResult.hazard_level)}">
                                ${agentResult.hazard_level}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h6>Key Findings</h6>
                        <ul class="list-unstyled">
                            ${(agentResult.findings || []).map(finding => `
                                <li class="mb-1">
                                    <i class="bi bi-dot text-primary"></i>
                                    ${finding}
                                </li>
                            `).join('')}
                        </ul>
                        
                        ${agentResult.metadata ? `
                            <h6 class="mt-3">Metadata</h6>
                            <div class="row g-2">
                                ${Object.entries(agentResult.metadata).map(([key, value]) => `
                                    <div class="col-sm-6">
                                        <div class="border rounded p-2">
                                            <small class="text-muted">${formatMetadataKey(key)}</small>
                                            <div class="fw-bold">${formatMetadataValue(value)}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="col-md-6">
                        <h6>Recommendations</h6>
                        <ul class="list-unstyled">
                            ${(agentResult.recommendations || []).map(rec => `
                                <li class="mb-1">
                                    <i class="bi bi-arrow-right text-success"></i>
                                    ${rec}
                                </li>
                            `).join('')}
                        </ul>
                        
                        <h6 class="mt-3">Reasoning</h6>
                        <p class="text-muted">${agentResult.reasoning || 'No reasoning provided'}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Generate resource requirements
function generateResourceRequirements(analysisResults) {
    const actionableIntelligence = analysisResults.actionable_intelligence || {};
    const resourceRequirements = actionableIntelligence.resource_requirements || [];
    const overallAssessment = analysisResults.overall_assessment || {};
    const specialistTeams = overallAssessment.specialist_teams_needed || [];
    
    let html = '';
    
    if (resourceRequirements.length > 0) {
        html += '<h6 class="mb-2">Resource Requirements</h6>';
        html += '<ul class="list-unstyled">';
        resourceRequirements.forEach(req => {
            html += `<li class="mb-1"><i class="bi bi-arrow-right text-primary"></i> ${req}</li>`;
        });
        html += '</ul>';
    }
    
    if (specialistTeams.length > 0) {
        html += '<h6 class="mb-2 mt-3">Specialist Teams</h6>';
        html += '<div class="d-flex flex-wrap gap-1">';
        specialistTeams.forEach(team => {
            html += `<span class="badge bg-warning">${team}</span>`;
        });
        html += '</div>';
    }
    
    if (overallAssessment.immediate_actions_required) {
        html += '<div class="alert alert-danger mt-3 mb-0">';
        html += '<i class="bi bi-exclamation-triangle me-2"></i>';
        html += '<strong>Immediate Actions Required</strong>';
        html += '</div>';
    }
    
    if (html === '') {
        html = '<p class="text-muted">No specific resource requirements identified</p>';
    }
    
    return html;
}

// Create analysis chart
function createAnalysisChart(analysisResults) {
    const ctx = document.getElementById('analysisChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (analysisChart) {
        analysisChart.destroy();
    }
    
    const agentResults = analysisResults.agent_analysis?.agent_results || {};
    const agents = Object.keys(agentResults);
    const confidences = agents.map(agent => agentResults[agent].confidence);
    
    analysisChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: agents.map(agent => formatAgentName(agent)),
            datasets: [{
                label: 'Agent Confidence',
                data: confidences,
                backgroundColor: 'rgba(13, 110, 253, 0.2)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(13, 110, 253, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(13, 110, 253, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        display: false
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    pointLabels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Show command briefing
function showCommandBriefing(analysisResults) {
    const commandBriefing = analysisResults.command_briefing || '';
    
    if (commandBriefing) {
        // Create briefing modal or alert
        const briefingAlert = `
            <div class="alert alert-info alert-dismissible fade show" role="alert">
                <h6 class="alert-heading">
                    <i class="bi bi-file-earmark-text me-2"></i>
                    Command Briefing
                </h6>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${commandBriefing.replace(/\n/g, '<br>')}
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        const alertContainer = document.getElementById('alertContainer');
        alertContainer.insertAdjacentHTML('afterbegin', briefingAlert);
    }
}

// Refresh charts
function refreshCharts() {
    if (analysisChart) {
        analysisChart.resize();
    }
    
    Object.values(agentCharts).forEach(chart => {
        if (chart) {
            chart.resize();
        }
    });
}

// Utility functions
function formatAgentName(agentName) {
    return agentName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getAgentIcon(agentName) {
    const icons = {
        'hazard_detector': '<i class="bi bi-shield-exclamation me-2"></i>',
        'synthesis_analyzer': '<i class="bi bi-bezier2 me-2"></i>',
        'mopp_recommender': '<i class="bi bi-person-gear me-2"></i>',
        'sampling_strategist': '<i class="bi bi-droplet me-2"></i>'
    };
    return icons[agentName] || '<i class="bi bi-robot me-2"></i>';
}

function getAgentClass(agentName) {
    const classes = {
        'hazard_detector': 'agent-hazard',
        'synthesis_analyzer': 'agent-synthesis',
        'mopp_recommender': 'agent-mopp',
        'sampling_strategist': 'agent-sampling'
    };
    return classes[agentName] || '';
}

function getHazardLevelBadgeClass(hazardLevel) {
    switch (hazardLevel) {
        case 'CRITICAL':
            return 'bg-danger';
        case 'HIGH':
            return 'bg-warning';
        case 'MODERATE':
            return 'bg-info';
        case 'LOW':
            return 'bg-success';
        default:
            return 'bg-secondary';
    }
}

function getReliabilityClass(reliability) {
    switch (reliability) {
        case 'HIGH':
            return 'bg-success';
        case 'MEDIUM':
            return 'bg-warning';
        case 'LOW':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

function formatMetadataKey(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatMetadataValue(value) {
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    if (typeof value === 'number' && value < 1 && value > 0) {
        return formatConfidence(value);
    }
    return String(value);
}

function getThreatLevelClass(threatLevel) {
    switch (threatLevel) {
        case 'CRITICAL':
            return 'text-danger';
        case 'HIGH':
            return 'text-warning';
        case 'MODERATE':
            return 'text-info';
        case 'LOW':
            return 'text-success';
        default:
            return 'text-muted';
    }
}

// Export functions for global access
window.updateCommandAnalysis = updateCommandAnalysis;
window.refreshCharts = refreshCharts;

// Initialize command center when loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCommandCenter();
});
