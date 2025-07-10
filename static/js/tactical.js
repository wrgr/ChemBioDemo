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
    // Check if overlay elements exist before adding event listeners
    const hazardOverlay = document.getElementById('hazardOverlay');
    const samplingOverlay = document.getElementById('samplingOverlay');
    const synthesisOverlay = document.getElementById('synthesisOverlay');
    const moppOverlay = document.getElementById('moppOverlay');
    
    if (hazardOverlay) {
        hazardOverlay.addEventListener('click', () => toggleOverlay('hazard'));
    }
    if (samplingOverlay) {
        samplingOverlay.addEventListener('click', () => toggleOverlay('sampling'));
    }
    if (synthesisOverlay) {
        synthesisOverlay.addEventListener('click', () => toggleOverlay('synthesis'));
    }
    if (moppOverlay) {
        moppOverlay.addEventListener('click', () => toggleOverlay('mopp'));
    }
}

// Initialize tactical display
function initializeTacticalDisplay() {
    resetTacticalDisplay();
}

// Reset tactical display to initial state
function resetTacticalDisplay() {
    // Update with new element IDs
    const moppLevel = document.getElementById('moppLevel');
    const hazardAssessment = document.getElementById('hazardAssessment');
    const synthesisIntelligence = document.getElementById('synthesisIntelligence');
    const samplingStrategy = document.getElementById('samplingStrategy');
    const immediateActions = document.getElementById('immediateActions');
    
    if (moppLevel) {
        moppLevel.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-hourglass-split display-4 text-muted"></i>
                <p class="text-muted mt-2">Upload scene for MOPP assessment</p>
            </div>
        `;
    }
    
    if (hazardAssessment) {
        hazardAssessment.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-exclamation-triangle display-4 text-muted"></i>
                <p class="text-muted mt-2">Awaiting threat analysis</p>
            </div>
        `;
    }
    
    if (synthesisIntelligence) {
        synthesisIntelligence.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-flask display-4 text-muted"></i>
                <p class="text-muted mt-2">No synthesis activity detected</p>
            </div>
        `;
    }
    
    if (samplingStrategy) {
        samplingStrategy.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-droplet display-4 text-muted"></i>
                <p class="text-muted mt-2">No sampling points identified</p>
            </div>
        `;
    }
    
    if (immediateActions) {
        immediateActions.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-clipboard-check display-4 text-muted"></i>
                <p class="text-muted mt-2">Awaiting analysis results</p>
            </div>
        `;
    }
}

// Update tactical analysis display
function updateTacticalAnalysis(analysisResults) {
    console.log('Updating tactical analysis display');
    
    tacticalAnalysisResults = analysisResults;
    
    // Update all tactical components
    updateMoppLevel(analysisResults);
    updateHazardAssessment(analysisResults);
    updateSynthesisIntelligence(analysisResults);
    updateSamplingStrategy(analysisResults);
    updateImmediateActions(analysisResults);
}

// Update MOPP Level display
function updateMoppLevel(analysisResults) {
    const moppLevel = document.getElementById('moppLevel');
    if (!moppLevel) return;
    
    const moppData = analysisResults.agent_analysis?.agent_results?.mopp_recommendation;
    if (!moppData) return;
    
    const level = moppData.metadata?.mopp_level || '3';
    const confidence = Math.round(moppData.confidence * 100);
    
    moppLevel.innerHTML = `
        <div class="text-center">
            <div class="display-1 fw-bold text-warning">${level}</div>
            <div class="fw-bold mb-2">MOPP Level ${level}</div>
            <div class="mb-2">${formatThreatLevel(moppData.hazard_level)}</div>
            <div class="mb-2">${formatConfidence(moppData.confidence)}</div>
            <div class="small text-muted">
                <i class="bi bi-shield-check me-1"></i>
                Protection Required
            </div>
        </div>
    `;
}

// Update Hazard Assessment display
function updateHazardAssessment(analysisResults) {
    const hazardAssessment = document.getElementById('hazardAssessment');
    if (!hazardAssessment) return;
    
    const hazardData = analysisResults.agent_analysis?.agent_results?.hazard_detection;
    if (!hazardData) return;
    
    hazardAssessment.innerHTML = `
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="fw-bold mb-0">Threat Assessment</h6>
                ${formatConfidence(hazardData.confidence)}
            </div>
            <div class="mb-2">${formatThreatLevel(hazardData.hazard_level)}</div>
        </div>
        <div class="hazard-findings">
            <h6 class="small fw-bold text-muted mb-2">KEY THREATS:</h6>
            ${formatFindingsList(hazardData.findings.slice(0, 3))}
        </div>
    `;
}

// Update Synthesis Intelligence display
function updateSynthesisIntelligence(analysisResults) {
    const synthesisIntelligence = document.getElementById('synthesisIntelligence');
    if (!synthesisIntelligence) return;
    
    const synthesisData = analysisResults.agent_analysis?.agent_results?.synthesis_analysis;
    if (!synthesisData) return;
    
    synthesisIntelligence.innerHTML = `
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="fw-bold mb-0">
                    <i class="bi bi-flask me-2"></i>Synthesis Activity
                </h6>
                ${formatConfidence(synthesisData.confidence)}
            </div>
            <div class="mb-2">${formatThreatLevel(synthesisData.hazard_level)}</div>
        </div>
        <div class="synthesis-findings">
            <h6 class="small fw-bold text-muted mb-2">INDICATORS:</h6>
            ${formatFindingsList(synthesisData.findings.slice(0, 3))}
        </div>
    `;
}

// Update Sampling Strategy display
function updateSamplingStrategy(analysisResults) {
    const samplingStrategy = document.getElementById('samplingStrategy');
    if (!samplingStrategy) return;
    
    const samplingData = analysisResults.agent_analysis?.agent_results?.sampling_strategy;
    if (!samplingData) return;
    
    samplingStrategy.innerHTML = `
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="fw-bold mb-0">
                    <i class="bi bi-droplet me-2"></i>Sampling Strategy
                </h6>
                ${formatConfidence(samplingData.confidence)}
            </div>
            <div class="mb-2">${formatThreatLevel(samplingData.hazard_level)}</div>
        </div>
        <div class="sampling-findings">
            <h6 class="small fw-bold text-muted mb-2">SAMPLE POINTS:</h6>
            ${formatFindingsList(samplingData.findings.slice(0, 3))}
        </div>
    `;
}

// Update Immediate Actions display
function updateImmediateActions(analysisResults) {
    const immediateActions = document.getElementById('immediateActions');
    if (!immediateActions) return;
    
    // Get recommendations from multiple agents
    const agentResults = analysisResults.agent_analysis?.agent_results || {};
    const allRecommendations = [];
    
    // Collect urgent recommendations from all agents
    Object.values(agentResults).forEach(agentResult => {
        if (agentResult.recommendations) {
            allRecommendations.push(...agentResult.recommendations.slice(0, 2));
        }
    });
    
    immediateActions.innerHTML = `
        <div class="mb-3">
            <h6 class="fw-bold mb-2">
                <i class="bi bi-clipboard-check me-2"></i>Immediate Actions
            </h6>
        </div>
        <div class="actions-list">
            ${formatRecommendationsList(allRecommendations.slice(0, 4))}
        </div>
    `;
}

// Formatting helper functions
function formatConfidence(confidence) {
    const percentage = Math.round(confidence * 100);
    let badgeClass = 'bg-secondary';
    
    if (percentage >= 80) badgeClass = 'bg-success';
    else if (percentage >= 60) badgeClass = 'bg-warning';
    else if (percentage >= 40) badgeClass = 'bg-danger';
    
    return `<span class="badge ${badgeClass}">${percentage}% confidence</span>`;
}

function formatThreatLevel(level) {
    const levelMap = {
        'CRITICAL': { class: 'bg-danger', icon: 'bi-exclamation-triangle-fill' },
        'HIGH': { class: 'bg-warning', icon: 'bi-exclamation-triangle' },
        'MEDIUM': { class: 'bg-info', icon: 'bi-info-circle' },
        'LOW': { class: 'bg-success', icon: 'bi-check-circle' },
        'UNKNOWN': { class: 'bg-secondary', icon: 'bi-question-circle' }
    };
    
    const config = levelMap[level] || levelMap['UNKNOWN'];
    return `<span class="badge ${config.class}"><i class="${config.icon} me-1"></i>${level}</span>`;
}

function formatFindingsList(findings) {
    if (!findings || findings.length === 0) {
        return '<p class="text-muted small">No findings to display</p>';
    }
    
    return findings.map(finding => `
        <div class="alert alert-light border-start border-info border-3 mb-2 py-2">
            <small><i class="bi bi-info-circle text-info me-2"></i>${finding}</small>
        </div>
    `).join('');
}

function formatRecommendationsList(recommendations) {
    if (!recommendations || recommendations.length === 0) {
        return '<p class="text-muted small">No recommendations available</p>';
    }
    
    return recommendations.map((rec, index) => `
        <div class="alert alert-warning border-start border-warning border-3 mb-2 py-2">
            <div class="d-flex align-items-start">
                <span class="badge bg-warning text-dark me-2">${index + 1}</span>
                <small>${rec}</small>
            </div>
        </div>
    `).join('');
}

// Universal overlay toggle function (for demo and regular use)
function toggleOverlay(overlayType) {
    console.log(`Toggling overlay: ${overlayType}`);
    
    const button = document.getElementById(overlayType + 'Overlay');
    const isActive = button && button.classList.contains('active');
    
    if (isActive) {
        console.log(`Hiding overlay: ${overlayType}`);
        hideOverlay(overlayType);
        activeOverlays.delete(overlayType);
        if (button) button.classList.remove('active');
    } else {
        console.log(`Showing overlay: ${overlayType}`);
        showOverlay(overlayType);
        activeOverlays.add(overlayType);
        if (button) button.classList.add('active');
    }
}

// Show overlay highlights
function showOverlay(overlayType) {
    // Get highlights data from demo or analysis
    let highlights = [];
    
    if (window.demoHighlights && window.demoHighlights[overlayType]) {
        highlights = window.demoHighlights[overlayType];
    } else if (tacticalAnalysisResults && tacticalAnalysisResults.highlights && tacticalAnalysisResults.highlights[overlayType]) {
        highlights = tacticalAnalysisResults.highlights[overlayType];
    }
    
    if (highlights.length === 0) {
        console.log(`No highlights available for ${overlayType}`);
        return;
    }
    
    // Create overlay container if it doesn't exist
    let overlayContainer = document.getElementById(`overlay-${overlayType}`);
    if (!overlayContainer) {
        overlayContainer = document.createElement('div');
        overlayContainer.id = `overlay-${overlayType}`;
        overlayContainer.className = 'overlay-container';
        overlayContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10;
        `;
        
        const sceneDisplay = document.getElementById('sceneDisplay');
        if (sceneDisplay) {
            sceneDisplay.appendChild(overlayContainer);
        }
    }
    
    // Clear existing highlights
    overlayContainer.innerHTML = '';
    
    // Create highlights
    highlights.forEach((highlight, index) => {
        const highlightElement = createHighlightElement(highlight, overlayType, index);
        overlayContainer.appendChild(highlightElement);
    });
    
    // Show container
    overlayContainer.style.display = 'block';
    console.log(`Displayed ${highlights.length} highlights for ${overlayType}`);
}

// Hide overlay highlights
function hideOverlay(overlayType) {
    const overlayContainer = document.getElementById(`overlay-${overlayType}`);
    if (overlayContainer) {
        overlayContainer.style.display = 'none';
    }
}

// Create highlight element
function createHighlightElement(highlight, overlayType, index) {
    const element = document.createElement('div');
    element.className = `highlight highlight-${overlayType}`;
    
    // Define threat level colors
    const colors = {
        hazard: '#dc3545',    // Red
        synthesis: '#fd7e14', // Orange
        mopp: '#ffc107',      // Yellow
        sampling: '#28a745'   // Green
    };
    
    const color = colors[overlayType] || '#6c757d';
    
    element.style.cssText = `
        position: absolute;
        left: ${highlight.x}px;
        top: ${highlight.y}px;
        width: ${Math.max(highlight.width, 80)}px;
        height: ${Math.max(highlight.height, 80)}px;
        border: 3px solid ${color};
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 20px ${color}60;
        animation: pulse 2s infinite;
        cursor: pointer;
        z-index: 10;
        pointer-events: auto;
    `;
    
    // Add label
    const label = document.createElement('div');
    label.className = 'highlight-label';
    label.textContent = `${highlight.label} (${Math.round(highlight.confidence * 100)}%)`;
    label.style.cssText = `
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: ${color};
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;
    
    element.appendChild(label);
    
    // Add click handler
    element.addEventListener('click', () => {
        showHighlightDetails(highlight, overlayType);
    });
    
    return element;
}

// Show highlight details
function showHighlightDetails(highlight, overlayType) {
    const details = `
        <strong>${highlight.label}</strong><br>
        Type: ${overlayType}<br>
        Confidence: ${Math.round(highlight.confidence * 100)}%<br>
        Location: ${highlight.x}, ${highlight.y}
    `;
    
    showAlert(details, 'info', 5000);
}

// Show alert function
function showAlert(message, type = 'info', duration = 5000) {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertElement.style.cssText = `
        top: 20px;
        right: 20px;
        max-width: 400px;
        z-index: 1050;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertElement);
    
    // Auto-dismiss after duration
    setTimeout(() => {
        if (alertElement.parentNode) {
            alertElement.remove();
        }
    }, duration);
}

// Initialize tactical operations when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeTacticalOperations();
});