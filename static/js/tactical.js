// ChemBio Defense Dashboard - Tactical Operations

// Tactical-specific variables
let tacticalAnalysisResults = null;
let activeOverlays = new Set();

// Initialize tactical operations
function initializeTacticalOperations() {
    console.log('Initializing tactical operations');
    
    // Setup tactical event handlers
    setupTacticalEventHandlers();
    
    // Initialize tactical display
    initializeTacticalDisplay();
}

// Setup tactical event handlers
function setupTacticalEventHandlers() {
    // Overlay toggle handlers
    document.getElementById('hazardOverlay').addEventListener('click', () => toggleTacticalOverlay('hazards'));
    document.getElementById('samplingOverlay').addEventListener('click', () => toggleTacticalOverlay('sampling'));
    document.getElementById('evidenceOverlay').addEventListener('click', () => toggleTacticalOverlay('evidence'));
}

// Initialize tactical display
function initializeTacticalDisplay() {
    resetTacticalDisplay();
}

// Reset tactical display to initial state
function resetTacticalDisplay() {
    const threatAssessment = document.getElementById('threatAssessment');
    const nextSteps = document.getElementById('nextSteps');
    const keyFindings = document.getElementById('keyFindings');
    
    threatAssessment.innerHTML = `
        <i class="bi bi-hourglass-split display-4 text-muted"></i>
        <p class="text-muted mt-2">Upload scene for analysis</p>
    `;
    
    nextSteps.innerHTML = `
        <i class="bi bi-clipboard-check display-4 text-muted"></i>
        <p class="text-muted mt-2">Awaiting analysis results</p>
    `;
    
    keyFindings.innerHTML = `
        <i class="bi bi-file-earmark-text display-4 text-muted"></i>
        <p class="text-muted mt-2">No findings yet</p>
    `;
}

// Update tactical analysis display
function updateTacticalAnalysis(analysisResults) {
    console.log('Updating tactical analysis display');
    
    tacticalAnalysisResults = analysisResults;
    
    // Update threat assessment
    updateThreatAssessment(analysisResults);
    
    // Update next steps
    updateNextSteps(analysisResults);
    
    // Update key findings
    updateKeyFindings(analysisResults);
    
    // Show tactical summary alert
    showTacticalSummary(analysisResults);
}

// Update threat assessment display
function updateThreatAssessment(analysisResults) {
    const threatAssessment = document.getElementById('threatAssessment');
    const overallAssessment = analysisResults.overall_assessment || {};
    
    const threatLevel = overallAssessment.threat_level || 'UNKNOWN';
    const confidence = overallAssessment.overall_confidence || 0;
    const operationType = overallAssessment.operation_type || 'UNKNOWN';
    
    const threatLevelClass = getThreatLevelClass(threatLevel);
    const threatLevelIcon = getThreatLevelIcon(threatLevel);
    const confidenceClass = getConfidenceClass(confidence);
    
    threatAssessment.innerHTML = `
        <div class="text-center">
            <i class="bi ${threatLevelIcon} display-3 ${threatLevelClass}"></i>
            <h4 class="mt-2 ${threatLevelClass}">${threatLevel}</h4>
            <p class="text-muted mb-2">${operationType.replace('_', ' ')}</p>
            
            <div class="row text-center">
                <div class="col-6">
                    <div class="border rounded p-2">
                        <h6 class="mb-1">Confidence</h6>
                        <div class="progress mb-1" style="height: 8px;">
                            <div class="progress-bar ${confidenceClass}" 
                                 style="width: ${confidence * 100}%"></div>
                        </div>
                        <small class="text-muted">${formatConfidence(confidence)}</small>
                    </div>
                </div>
                <div class="col-6">
                    <div class="border rounded p-2">
                        <h6 class="mb-1">MOPP Level</h6>
                        <div class="display-6 fw-bold ${threatLevelClass}">
                            ${getMOPPLevel(analysisResults)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Update next steps display
function updateNextSteps(analysisResults) {
    const nextSteps = document.getElementById('nextSteps');
    const actionableIntelligence = analysisResults.actionable_intelligence || {};
    
    const immediateActions = actionableIntelligence.immediate_actions || [];
    const tacticalPriorities = actionableIntelligence.tactical_priorities || [];
    
    let stepsHtml = '';
    
    if (immediateActions.length > 0) {
        stepsHtml += '<h6 class="text-danger mb-2"><i class="bi bi-exclamation-triangle me-1"></i>Immediate Actions</h6>';
        stepsHtml += '<ul class="list-unstyled">';
        immediateActions.forEach((action, index) => {
            stepsHtml += `<li class="mb-1"><i class="bi bi-arrow-right text-danger me-1"></i> ${action}</li>`;
        });
        stepsHtml += '</ul>';
    }
    
    if (tacticalPriorities.length > 0) {
        stepsHtml += '<h6 class="text-warning mb-2 mt-3"><i class="bi bi-list-ol me-1"></i>Tactical Priorities</h6>';
        stepsHtml += '<ul class="list-unstyled">';
        tacticalPriorities.forEach((priority, index) => {
            stepsHtml += `<li class="mb-1"><i class="bi bi-arrow-right text-warning me-1"></i> ${priority}</li>`;
        });
        stepsHtml += '</ul>';
    }
    
    if (stepsHtml === '') {
        stepsHtml = `
            <div class="text-center py-2">
                <i class="bi bi-check-circle display-4 text-success"></i>
                <p class="text-muted mt-2">No immediate actions required</p>
            </div>
        `;
    }
    
    nextSteps.innerHTML = stepsHtml;
}

// Update key findings display
function updateKeyFindings(analysisResults) {
    const keyFindings = document.getElementById('keyFindings');
    const synthesis = analysisResults.synthesis || {};
    
    const consensusFindings = synthesis.consensus_findings || [];
    const smokingGuns = synthesis.smoking_guns || [];
    const keyInsights = synthesis.key_insights || [];
    
    let findingsHtml = '';
    
    if (smokingGuns.length > 0) {
        findingsHtml += '<h6 class="text-danger mb-2"><i class="bi bi-exclamation-diamond me-1"></i>Smoking Guns</h6>';
        findingsHtml += '<ul class="list-unstyled">';
        smokingGuns.forEach(gun => {
            findingsHtml += `
                <li class="mb-2 p-2 border rounded border-danger">
                    <div class="d-flex justify-content-between">
                        <span>${gun.finding}</span>
                        <span class="badge bg-danger">${formatConfidence(gun.confidence)}</span>
                    </div>
                    <small class="text-muted">Agent: ${gun.agent}</small>
                </li>
            `;
        });
        findingsHtml += '</ul>';
    }
    
    if (consensusFindings.length > 0) {
        findingsHtml += '<h6 class="text-info mb-2 mt-3"><i class="bi bi-check-all me-1"></i>Consensus Findings</h6>';
        findingsHtml += '<ul class="list-unstyled">';
        consensusFindings.forEach(finding => {
            findingsHtml += `<li class="mb-1"><i class="bi bi-dot text-info"></i> ${finding}</li>`;
        });
        findingsHtml += '</ul>';
    }
    
    if (keyInsights.length > 0) {
        findingsHtml += '<h6 class="text-primary mb-2 mt-3"><i class="bi bi-lightbulb me-1"></i>Key Insights</h6>';
        findingsHtml += '<ul class="list-unstyled">';
        keyInsights.forEach(insight => {
            findingsHtml += `<li class="mb-1"><i class="bi bi-dot text-primary"></i> ${insight}</li>`;
        });
        findingsHtml += '</ul>';
    }
    
    if (findingsHtml === '') {
        findingsHtml = `
            <div class="text-center py-2">
                <i class="bi bi-search display-4 text-muted"></i>
                <p class="text-muted mt-2">No significant findings</p>
            </div>
        `;
    }
    
    keyFindings.innerHTML = findingsHtml;
}

// Show tactical summary alert
function showTacticalSummary(analysisResults) {
    const tacticalSummary = analysisResults.tactical_summary || '';
    
    if (tacticalSummary) {
        const alertType = getTacticalAlertType(analysisResults);
        showAlert(tacticalSummary, alertType, 10000); // Show for 10 seconds
    }
}

// Get tactical alert type based on threat level
function getTacticalAlertType(analysisResults) {
    const threatLevel = analysisResults.overall_assessment?.threat_level || 'UNKNOWN';
    
    switch (threatLevel) {
        case 'CRITICAL':
            return 'danger';
        case 'HIGH':
            return 'warning';
        case 'MODERATE':
            return 'info';
        default:
            return 'primary';
    }
}

// Toggle tactical overlay
function toggleTacticalOverlay(overlayType) {
    const button = document.getElementById(overlayType + 'Overlay');
    const isActive = button.classList.contains('active');
    
    if (isActive) {
        button.classList.remove('active');
        activeOverlays.delete(overlayType);
        hideTacticalOverlay(overlayType);
    } else {
        button.classList.add('active');
        activeOverlays.add(overlayType);
        showTacticalOverlay(overlayType);
    }
}

// Show tactical overlay
function showTacticalOverlay(overlayType) {
    console.log('Showing tactical overlay:', overlayType);
    
    if (!tacticalAnalysisResults) {
        showAlert('No analysis results available for overlay', 'warning');
        return;
    }
    
    const sceneDisplay = document.getElementById('sceneDisplay');
    const existingOverlay = sceneDisplay.querySelector(`.overlay-${overlayType}`);
    
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    // Create overlay based on type
    const overlay = createTacticalOverlay(overlayType, tacticalAnalysisResults);
    if (overlay) {
        sceneDisplay.appendChild(overlay);
    }
}

// Hide tactical overlay
function hideTacticalOverlay(overlayType) {
    console.log('Hiding tactical overlay:', overlayType);
    
    const sceneDisplay = document.getElementById('sceneDisplay');
    const overlay = sceneDisplay.querySelector(`.overlay-${overlayType}`);
    
    if (overlay) {
        overlay.remove();
    }
}

// Create tactical overlay
function createTacticalOverlay(overlayType, analysisResults) {
    const overlay = document.createElement('div');
    overlay.className = `overlay-${overlayType} position-absolute top-0 start-0 w-100 h-100`;
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '5';
    
    switch (overlayType) {
        case 'hazards':
            return createHazardOverlay(overlay, analysisResults);
        case 'sampling':
            return createSamplingOverlay(overlay, analysisResults);
        case 'evidence':
            return createEvidenceOverlay(overlay, analysisResults);
        default:
            return null;
    }
}

// Create hazard overlay
function createHazardOverlay(overlay, analysisResults) {
    const agentResults = analysisResults.agent_analysis?.agent_results || {};
    const hazardAgent = agentResults.hazard_detector;
    
    if (!hazardAgent) {
        return null;
    }
    
    // Create hazard markers based on findings
    const hazardFindings = hazardAgent.findings || [];
    const hazardLevel = hazardAgent.hazard_level || 'UNKNOWN';
    
    let overlayHtml = '';
    
    // Add general hazard indication
    overlayHtml += `
        <div class="position-absolute top-0 start-0 m-2 p-2 bg-danger text-white rounded" 
             style="opacity: 0.9; pointer-events: auto;">
            <i class="bi bi-exclamation-triangle me-1"></i>
            <strong>Hazard Level: ${hazardLevel}</strong>
            <br>
            <small>Confidence: ${formatConfidence(hazardAgent.confidence)}</small>
        </div>
    `;
    
    // Add specific hazard markers (would be positioned based on actual scene analysis)
    hazardFindings.forEach((finding, index) => {
        const x = 20 + (index * 30); // Mock positioning
        const y = 60 + (index * 25);
        
        overlayHtml += `
            <div class="position-absolute bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center" 
                 style="left: ${x}%; top: ${y}%; width: 24px; height: 24px; opacity: 0.8; pointer-events: auto;"
                 title="${finding}">
                <i class="bi bi-exclamation" style="font-size: 12px;"></i>
            </div>
        `;
    });
    
    overlay.innerHTML = overlayHtml;
    return overlay;
}

// Create sampling overlay
function createSamplingOverlay(overlay, analysisResults) {
    const agentResults = analysisResults.agent_analysis?.agent_results || {};
    const samplingAgent = agentResults.sampling_strategist;
    
    if (!samplingAgent) {
        return null;
    }
    
    const samplingStrategy = samplingAgent.metadata?.sampling_strategy || {};
    const samplingSequence = samplingStrategy.sampling_sequence || [];
    
    let overlayHtml = '';
    
    // Add sampling strategy info
    overlayHtml += `
        <div class="position-absolute top-0 end-0 m-2 p-2 bg-info text-white rounded" 
             style="opacity: 0.9; pointer-events: auto;">
            <i class="bi bi-droplet me-1"></i>
            <strong>Sampling Strategy</strong>
            <br>
            <small>Confidence: ${formatConfidence(samplingAgent.confidence)}</small>
        </div>
    `;
    
    // Add sampling point markers
    samplingSequence.forEach((sequence, index) => {
        const x = 25 + (index * 35); // Mock positioning
        const y = 40 + (index * 20);
        
        const priorityColor = getPriorityColor(sequence.priority);
        
        overlayHtml += `
            <div class="position-absolute rounded-circle d-flex align-items-center justify-content-center" 
                 style="left: ${x}%; top: ${y}%; width: 32px; height: 32px; background-color: ${priorityColor}; opacity: 0.8; pointer-events: auto;"
                 title="Priority: ${sequence.priority} | Urgency: ${sequence.urgency}">
                <span class="text-white fw-bold" style="font-size: 12px;">${sequence.step}</span>
            </div>
        `;
    });
    
    overlay.innerHTML = overlayHtml;
    return overlay;
}

// Create evidence overlay
function createEvidenceOverlay(overlay, analysisResults) {
    const synthesis = analysisResults.synthesis || {};
    const smokingGuns = synthesis.smoking_guns || [];
    const consensusFindings = synthesis.consensus_findings || [];
    
    let overlayHtml = '';
    
    // Add evidence summary
    overlayHtml += `
        <div class="position-absolute bottom-0 start-0 m-2 p-2 bg-success text-white rounded" 
             style="opacity: 0.9; pointer-events: auto;">
            <i class="bi bi-bookmark me-1"></i>
            <strong>Evidence Found</strong>
            <br>
            <small>Smoking Guns: ${smokingGuns.length} | Consensus: ${consensusFindings.length}</small>
        </div>
    `;
    
    // Add evidence markers
    smokingGuns.forEach((gun, index) => {
        const x = 30 + (index * 25); // Mock positioning
        const y = 35 + (index * 15);
        
        overlayHtml += `
            <div class="position-absolute bg-danger text-white rounded d-flex align-items-center justify-content-center" 
                 style="left: ${x}%; top: ${y}%; width: 28px; height: 28px; opacity: 0.9; pointer-events: auto;"
                 title="${gun.finding}">
                <i class="bi bi-exclamation-diamond" style="font-size: 14px;"></i>
            </div>
        `;
    });
    
    overlay.innerHTML = overlayHtml;
    return overlay;
}

// Utility functions
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

function getThreatLevelIcon(threatLevel) {
    switch (threatLevel) {
        case 'CRITICAL':
            return 'bi-exclamation-triangle-fill';
        case 'HIGH':
            return 'bi-exclamation-triangle';
        case 'MODERATE':
            return 'bi-exclamation-circle';
        case 'LOW':
            return 'bi-info-circle';
        default:
            return 'bi-question-circle';
    }
}

function getConfidenceClass(confidence) {
    if (confidence >= 0.8) return 'bg-success';
    if (confidence >= 0.6) return 'bg-warning';
    return 'bg-danger';
}

function getMOPPLevel(analysisResults) {
    const agentResults = analysisResults.agent_analysis?.agent_results || {};
    const moppAgent = agentResults.mopp_recommender;
    
    if (moppAgent && moppAgent.metadata && moppAgent.metadata.mopp_level !== undefined) {
        return moppAgent.metadata.mopp_level;
    }
    
    return '?';
}

function getPriorityColor(priority) {
    switch (priority) {
        case 'critical':
            return '#dc3545';
        case 'high':
            return '#fd7e14';
        case 'medium':
            return '#ffc107';
        case 'low':
            return '#28a745';
        default:
            return '#6c757d';
    }
}

// Export functions for global access
window.updateTacticalAnalysis = updateTacticalAnalysis;
window.toggleTacticalOverlay = toggleTacticalOverlay;

// Initialize tactical operations when loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTacticalOperations();
});
