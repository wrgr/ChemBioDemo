// ChemBio Defense Dashboard - Main JavaScript

// Global variables
let currentAnalysis = null;
let uploadModal = null;
let youtubeModal = null;
let communicationModal = null;
let dragDropActive = false;

// Initialize dashboard
function initializeDashboard() {
    console.log('Initializing ChemBio Defense Dashboard');
    
    // Initialize modals
    initializeModals();
    
    // Setup drag and drop
    setupDragDrop();
    
    // Setup tab switching
    setupTabSwitching();
    
    // Load initial data
    loadInitialData();
    
    // Setup global event handlers
    setupGlobalEventHandlers();
    
    console.log('Dashboard initialization complete');
}

// Initialize Bootstrap modals
function initializeModals() {
    const uploadModalElement = document.getElementById('uploadModal');
    const youtubeModalElement = document.getElementById('youtubeModal');
    const communicationModalElement = document.getElementById('communicationModal');
    
    if (uploadModalElement) {
        uploadModal = new bootstrap.Modal(uploadModalElement);
    }
    if (youtubeModalElement) {
        youtubeModal = new bootstrap.Modal(youtubeModalElement);
    }
    if (communicationModalElement) {
        communicationModal = new bootstrap.Modal(communicationModalElement);
    }
}

// Setup drag and drop functionality
function setupDragDrop() {
    const uploadArea = document.getElementById('uploadArea');
    const hiddenFileInput = document.getElementById('hiddenFileInput');
    
    if (!uploadArea) {
        console.log('Upload area not found');
        return;
    }
    
    // Click handler
    uploadArea.addEventListener('click', function() {
        if (hiddenFileInput) {
            hiddenFileInput.click();
        }
    });
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('dragover');
        dragDropActive = true;
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('dragover');
        dragDropActive = false;
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('dragover');
        dragDropActive = false;
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect({ target: { files: files } });
        }
    });
    
    // Prevent default drag behaviors on document
    document.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
    });
    
    document.addEventListener('drop', function(e) {
        if (!dragDropActive) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
}

// Setup tab switching
function setupTabSwitching() {
    const tabElements = document.querySelectorAll('#dashboardTabs button[data-bs-toggle="tab"]');
    
    tabElements.forEach(function(tab) {
        tab.addEventListener('shown.bs.tab', function(e) {
            const targetTab = e.target.getAttribute('data-bs-target');
            console.log('Switched to tab:', targetTab);
            
            // Initialize tab-specific features
            if (targetTab === '#tactical') {
                initializeTacticalTab();
            } else if (targetTab === '#command') {
                initializeCommandTab();
            }
        });
    });
}

// Load initial data
function loadInitialData() {
    // Load knowledge base stats
    loadKnowledgeStats();
    
    // Load recent communications
    loadRecentCommunications();
    
    // Load sensor data
    loadSensorData();
}

// Setup global event handlers
function setupGlobalEventHandlers() {
    // Global analysis update handler
    window.handleAnalysisUpdate = function(data) {
        console.log('Received analysis update:', data);
        currentAnalysis = data.analysis_results;
        updateAnalysisDisplay(data.analysis_results);
    };
    
    // Global sensor update handler
    window.handleSensorUpdate = function(data) {
        console.log('Received sensor update:', data);
        updateSensorDisplay(data.sensor_data);
    };
    
    // Global communication handler
    window.handleCommunicationReceived = function(data) {
        console.log('Communication received:', data);
        addCommunicationToDisplay(data);
    };
    
    // Global message handler
    window.handleMessageReceived = function(data) {
        console.log('Received message:', data);
        addMessageToFeed(data);
    };
}

// File upload functions
function uploadFile() {
    uploadModal.show();
}

function showYouTubeModal() {
    const youtubeInput = document.getElementById('youtubeInput');
    youtubeInput.style.display = 'block';
    document.getElementById('youtubeUrl').focus();
}

function analyzeYouTube() {
    const url = document.getElementById('youtubeUrl').value.trim();
    
    if (!url) {
        showAlert('Please enter a YouTube URL', 'warning');
        return;
    }
    
    // Validate YouTube URL
    if (!isValidYouTubeUrl(url)) {
        showAlert('Please enter a valid YouTube URL', 'warning');
        return;
    }
    
    // Hide upload area and show analysis progress
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('youtubeInput').style.display = 'none';
    showAnalysisProgress();
    
    // Start YouTube analysis
    startYouTubeAnalysis(url, '');
}

// Add button to show YouTube input
function showYouTubeInput() {
    document.getElementById('youtubeInput').style.display = 'block';
    document.getElementById('youtubeUrl').focus();
}

function isValidYouTubeUrl(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
}

function startYouTubeAnalysis(url, description) {
    fetch('/api/youtube_analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            youtube_url: url,
            description: description || ''
        })
    })
    .then(response => response.json())
    .then(data => {
        hideAnalysisProgress();
        
        if (data.status === 'success') {
            console.log('YouTube analysis completed:', data.analysis_results);
            currentAnalysis = data.analysis_results;
            updateAnalysisDisplay(data.analysis_results);
        } else {
            showAlert(data.error || 'YouTube analysis failed', 'danger');
        }
    })
    .catch(error => {
        hideAnalysisProgress();
        console.error('YouTube analysis error:', error);
        showAlert('YouTube analysis failed: ' + error.message, 'danger');
    });
}

function previewFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        const previewContainer = document.getElementById('filePreview');
        const previewImage = document.getElementById('previewImage');
        const previewVideo = document.getElementById('previewVideo');
        
        reader.onload = function(e) {
            previewContainer.style.display = 'block';
            
            if (file.type.startsWith('image/')) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
                previewVideo.style.display = 'none';
            } else if (file.type.startsWith('video/')) {
                previewVideo.src = e.target.result;
                previewVideo.style.display = 'block';
                previewImage.style.display = 'none';
            }
        };
        
        reader.readAsDataURL(file);
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        // Show upload modal with selected file
        document.getElementById('fileInput').files = event.target.files;
        previewFile();
        uploadModal.show();
    }
}

function submitFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const description = document.getElementById('sceneDescription').value;
    
    if (!file) {
        showAlert('Please select a file to upload', 'warning');
        return;
    }
    
    // Show upload progress
    showUploadProgress();
    
    // Upload file
    const formData = new FormData();
    formData.append('file', file);
    
    fetch('/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Hide modal first
            uploadModal.hide();
            
            // Display uploaded file
            displayUploadedFile(data, file);
            
            // Start analysis
            startAnalysis(data.scene_data, description);
        } else {
            hideUploadProgress();
            showAlert(data.error || 'Upload failed', 'danger');
            // Show upload area again on error
            resetUploadArea();
        }
    })
    .catch(error => {
        hideUploadProgress();
        console.error('Upload error:', error);
        showAlert('Upload failed: ' + error.message, 'danger');
        // Show upload area again on error
        resetUploadArea();
    });
}

function displayUploadedFile(uploadData, file) {
    const uploadArea = document.getElementById('uploadArea');
    const sceneDisplay = document.getElementById('sceneDisplay');
    const sceneImage = document.getElementById('sceneImage');
    const sceneVideo = document.getElementById('sceneVideo');
    
    // Hide upload area
    uploadArea.style.display = 'none';
    
    // Show scene display
    sceneDisplay.style.display = 'block';
    
    // Display file
    if (file.type.startsWith('image/')) {
        sceneImage.src = URL.createObjectURL(file);
        sceneImage.style.display = 'block';
        sceneVideo.style.display = 'none';
    } else if (file.type.startsWith('video/')) {
        sceneVideo.src = URL.createObjectURL(file);
        sceneVideo.style.display = 'block';
        sceneImage.style.display = 'none';
    }
}

function startAnalysis(sceneData, description) {
    // Show analysis progress
    showAnalysisProgress();
    
    // Prepare analysis request
    const analysisData = {
        ...sceneData,
        metadata: {
            description: description,
            timestamp: new Date().toISOString()
        }
    };
    
    // Send analysis request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
    
    fetch('/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
        signal: controller.signal
    })
    .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`Analysis request failed: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        hideAnalysisProgress();
        
        if (data.status === 'success') {
            console.log('Analysis completed:', data.analysis_results);
            currentAnalysis = data.analysis_results;
            updateAnalysisDisplay(data.analysis_results);
        } else {
            console.error('Analysis failed:', data.error);
            showAlert(data.error || 'Analysis failed', 'danger');
            // Show upload area again on analysis failure
            resetUploadArea();
        }
    })
    .catch(error => {
        clearTimeout(timeoutId);
        hideAnalysisProgress();
        console.error('Analysis error:', error);
        
        if (error.name === 'AbortError') {
            showAlert('Analysis timed out. Please try again with a smaller image.', 'warning');
        } else {
            showAlert('Analysis failed: ' + error.message, 'danger');
        }
        
        // Show upload area again on analysis failure
        resetUploadArea();
    });
}

function showUploadProgress() {
    // Hide upload area and show progress
    const uploadArea = document.getElementById('uploadArea');
    const analysisProgress = document.getElementById('analysisProgress');
    
    uploadArea.style.display = 'none';
    analysisProgress.style.display = 'block';
    
    // Update progress text
    const progressText = analysisProgress.querySelector('span');
    if (progressText) {
        progressText.textContent = 'Uploading file...';
    }
}

function hideUploadProgress() {
    // Hide progress and potentially show upload area again
    const analysisProgress = document.getElementById('analysisProgress');
    analysisProgress.style.display = 'none';
}

function resetUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const sceneDisplay = document.getElementById('sceneDisplay');
    
    uploadArea.style.display = 'flex';
    sceneDisplay.style.display = 'none';
    
    // Reset form
    const fileInput = document.getElementById('fileInput');
    const sceneDescription = document.getElementById('sceneDescription');
    const filePreview = document.getElementById('filePreview');
    
    if (fileInput) fileInput.value = '';
    if (sceneDescription) sceneDescription.value = '';
    if (filePreview) filePreview.style.display = 'none';
}

function showAnalysisProgress() {
    const progressDiv = document.getElementById('analysisProgress');
    progressDiv.style.display = 'block';
    
    // Update progress text
    const progressText = progressDiv.querySelector('span');
    if (progressText) {
        progressText.textContent = 'Analyzing scene...';
    }
    
    // Start progress simulation
    simulateAnalysisProgress();
}

function simulateAnalysisProgress() {
    const progressBar = document.querySelector('#analysisProgress .progress-bar');
    const progressText = document.querySelector('#analysisProgress span');
    
    if (!progressBar || !progressText) return;
    
    let progress = 0;
    const steps = [
        { progress: 10, text: 'Preprocessing image...' },
        { progress: 25, text: 'Initializing AI agents...' },
        { progress: 40, text: 'Running hazard detection...' },
        { progress: 55, text: 'Analyzing chemical synthesis...' },
        { progress: 70, text: 'Assessing MOPP requirements...' },
        { progress: 85, text: 'Generating sampling strategy...' },
        { progress: 95, text: 'Finalizing analysis...' }
    ];
    
    let currentStep = 0;
    
    const updateProgress = () => {
        if (currentStep < steps.length) {
            const step = steps[currentStep];
            progressBar.style.width = step.progress + '%';
            progressText.textContent = step.text;
            currentStep++;
            
            // Variable timing to simulate real processing
            const delay = Math.random() * 8000 + 5000; // 5-13 seconds per step
            setTimeout(updateProgress, delay);
        }
    };
    
    updateProgress();
}

function hideAnalysisProgress() {
    const progressDiv = document.getElementById('analysisProgress');
    progressDiv.style.display = 'none';
}

// YouTube analysis functions
function showYouTubeModal() {
    youtubeModal.show();
}

function analyzeYoutube() {
    const url = document.getElementById('youtubeUrl').value;
    const description = document.getElementById('youtubeDescription').value;
    
    if (!url) {
        showAlert('Please enter a YouTube URL', 'warning');
        return;
    }
    
    youtubeModal.hide();
    showAnalysisProgress();
    
    fetch('/api/youtube_analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            youtube_url: url,
            description: description
        })
    })
    .then(response => response.json())
    .then(data => {
        hideAnalysisProgress();
        
        if (data.status === 'success') {
            console.log('YouTube analysis completed:', data.analysis_results);
            currentAnalysis = data.analysis_results;
            updateAnalysisDisplay(data.analysis_results);
        } else {
            showAlert(data.error || 'YouTube analysis failed', 'danger');
        }
    })
    .catch(error => {
        hideAnalysisProgress();
        console.error('YouTube analysis error:', error);
        showAlert('YouTube analysis failed: ' + error.message, 'danger');
    });
}

// Communication functions
function openCommunicationModal() {
    communicationModal.show();
}

function sendMessage() {
    const messageType = document.getElementById('messageType').value;
    const messageContent = document.getElementById('messageContent').value;
    const messagePriority = document.getElementById('messagePriority').value;
    
    if (!messageContent.trim()) {
        showAlert('Please enter a message', 'warning');
        return;
    }
    
    const messageData = {
        sender_type: currentUserType,
        message: messageContent,
        message_type: messageType,
        metadata: {
            priority: messagePriority,
            timestamp: new Date().toISOString()
        }
    };
    
    // Send via socket
    socket.emit('send_message', messageData);
    
    // Close modal and reset form
    communicationModal.hide();
    document.getElementById('messageContent').value = '';
    document.getElementById('messageType').value = 'text';
    document.getElementById('messagePriority').value = 'normal';
}

function addMessageToFeed(message) {
    const feedContainer = document.getElementById('communicationFeed');
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message-item from-${message.sender_type}`;
    
    if (message.metadata && message.metadata.priority === 'urgent') {
        messageElement.classList.add('urgent');
    } else if (message.message_type === 'alert') {
        messageElement.classList.add('alert');
    }
    
    messageElement.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
                <small class="text-muted">
                    ${message.sender_type === 'tactical' ? 'Tactical' : 'Command'} • 
                    ${formatTimestamp(message.timestamp)}
                </small>
                <p class="mb-1">${message.message}</p>
                ${message.message_type !== 'text' ? `<span class="badge bg-secondary">${message.message_type}</span>` : ''}
            </div>
        </div>
    `;
    
    // Add to feed
    feedContainer.prepend(messageElement);
    
    // Remove empty state if present
    const emptyState = feedContainer.querySelector('.text-center');
    if (emptyState) {
        emptyState.remove();
    }
    
    // Limit to 20 messages
    const messages = feedContainer.querySelectorAll('.message-item');
    if (messages.length > 20) {
        messages[messages.length - 1].remove();
    }
}

// Knowledge base functions
function searchKnowledge() {
    const query = document.getElementById('knowledgeSearch').value.trim();
    
    if (!query) {
        showAlert('Please enter a search query', 'warning');
        return;
    }
    
    fetch('/api/knowledge/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            displayKnowledgeResults(data.results);
        } else {
            showAlert(data.error || 'Search failed', 'danger');
        }
    })
    .catch(error => {
        console.error('Knowledge search error:', error);
        showAlert('Search failed: ' + error.message, 'danger');
    });
}

function displayKnowledgeResults(results) {
    const resultsContainer = document.getElementById('knowledgeResults');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-search display-4 text-muted"></i>
                <p class="text-muted mt-2">No results found</p>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = results.map(result => `
        <div class="knowledge-item">
            <h6>${result.metadata.title}</h6>
            <p>${result.content.substring(0, 150)}...</p>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">${result.metadata.source}</small>
                <span class="badge bg-secondary">${result.metadata.category}</span>
            </div>
        </div>
    `).join('');
}

function loadKnowledgeStats() {
    fetch('/api/knowledge/stats')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('Knowledge base stats:', data.stats);
                // Update stats display if needed
            }
        })
        .catch(error => {
            console.error('Error loading knowledge stats:', error);
        });
}

// Sensor data functions
function loadSensorData() {
    // This would typically fetch real sensor data
    // For now, we'll just show the empty state
    console.log('Loading sensor data...');
}

function updateSensorDisplay(sensorData) {
    const sensorContainer = document.getElementById('sensorData');
    
    // Create sensor reading element
    const sensorElement = document.createElement('div');
    sensorElement.className = `sensor-reading ${sensorData.alert_level}`;
    
    sensorElement.innerHTML = `
        <div>
            <strong>${sensorData.sensor_type}</strong>
            <br>
            <small class="text-muted">${sensorData.location}</small>
        </div>
        <div class="text-end">
            <div class="sensor-value">${sensorData.reading_value} ${sensorData.unit}</div>
            <small class="text-muted">${formatConfidence(sensorData.confidence)}</small>
        </div>
    `;
    
    // Add to container
    sensorContainer.prepend(sensorElement);
    
    // Remove empty state if present
    const emptyState = sensorContainer.querySelector('.text-center');
    if (emptyState) {
        emptyState.remove();
    }
    
    // Limit to 10 readings
    const readings = sensorContainer.querySelectorAll('.sensor-reading');
    if (readings.length > 10) {
        readings[readings.length - 1].remove();
    }
}

// Communication loading
function loadRecentCommunications() {
    // This would typically load recent communications from the server
    console.log('Loading recent communications...');
}

// Tab initialization functions
function initializeTacticalTab() {
    console.log('Initializing tactical tab');
    // Initialize tactical-specific features
}

function initializeCommandTab() {
    console.log('Initializing command tab');
    // Initialize command-specific features
}

// Analysis display functions
function updateAnalysisDisplay(analysisResults) {
    console.log('Updating analysis display with results:', analysisResults);
    
    // Update scene summary first (most prominent)
    updateSceneSummary(analysisResults);
    
    // Update tactical display
    updateTacticalDisplay(analysisResults);
    
    // Update command display
    updateCommandDisplay(analysisResults);
}

function updateSceneSummary(analysisResults) {
    const sceneSummary = document.getElementById('sceneSummary');
    const sceneSummaryContent = document.getElementById('sceneSummaryContent');
    const sceneSummaryEmpty = document.getElementById('sceneSummaryEmpty');
    
    if (!analysisResults || analysisResults.status === 'error') {
        sceneSummary.style.display = 'none';
        if (sceneSummaryEmpty) sceneSummaryEmpty.style.display = 'block';
        return;
    }
    
    // Hide empty state and show summary
    if (sceneSummaryEmpty) sceneSummaryEmpty.style.display = 'none';
    sceneSummary.style.display = 'block';
    
    // Get the most significant findings
    let summaryHtml = '';
    
    // Overall threat level
    const overallAssessment = analysisResults.agent_analysis?.overall_assessment;
    if (overallAssessment) {
        const threatLevel = overallAssessment.threat_level || 'UNKNOWN';
        const threatBadge = getThreatBadge(threatLevel);
        summaryHtml += `<div class="mb-2"><strong>Threat Level:</strong> ${threatBadge}</div>`;
        
        // Add overall summary
        if (overallAssessment.summary) {
            summaryHtml += `<div class="mb-3">${overallAssessment.summary}</div>`;
        }
    }
    
    // Key findings from synthesis
    const synthesis = analysisResults.agent_analysis?.synthesis;
    if (synthesis) {
        if (synthesis.smoking_guns && synthesis.smoking_guns.length > 0) {
            summaryHtml += `<div class="mb-2"><strong>Smoking Guns:</strong></div>`;
            synthesis.smoking_guns.forEach(gun => {
                summaryHtml += `<div class="ms-3 mb-1">• ${gun.finding} <span class="badge bg-warning">Confidence: ${Math.round(gun.confidence * 100)}%</span></div>`;
            });
        }
        
        if (synthesis.consensus_findings && synthesis.consensus_findings.length > 0) {
            summaryHtml += `<div class="mb-2"><strong>Key Findings:</strong></div>`;
            synthesis.consensus_findings.slice(0, 3).forEach(finding => {
                summaryHtml += `<div class="ms-3 mb-1">• ${finding}</div>`;
            });
        }
    }
    
    // Tactical summary
    if (analysisResults.tactical_summary) {
        summaryHtml += `<div class="mb-2"><strong>Tactical Summary:</strong></div>`;
        summaryHtml += `<div class="ms-3">${analysisResults.tactical_summary}</div>`;
    }
    
    // Immediate actions
    const actionableIntel = analysisResults.actionable_intelligence;
    if (actionableIntel && actionableIntel.immediate_actions && actionableIntel.immediate_actions.length > 0) {
        summaryHtml += `<div class="mb-2 mt-3"><strong>Immediate Actions:</strong></div>`;
        actionableIntel.immediate_actions.forEach(action => {
            summaryHtml += `<div class="ms-3 mb-1">• ${action}</div>`;
        });
    }
    
    if (!summaryHtml) {
        summaryHtml = '<div class="text-muted">Analysis in progress...</div>';
    }
    
    sceneSummaryContent.innerHTML = summaryHtml;
}

function getThreatBadge(threatLevel) {
    const badges = {
        'CRITICAL': '<span class="badge bg-danger">CRITICAL</span>',
        'HIGH': '<span class="badge bg-warning">HIGH</span>',
        'MODERATE': '<span class="badge bg-info">MODERATE</span>',
        'LOW': '<span class="badge bg-success">LOW</span>',
        'MINIMAL': '<span class="badge bg-secondary">MINIMAL</span>',
        'UNKNOWN': '<span class="badge bg-secondary">UNKNOWN</span>'
    };
    return badges[threatLevel] || badges['UNKNOWN'];
}

function updateTacticalDisplay(analysisResults) {
    // This function is implemented in tactical.js
    if (window.updateTacticalAnalysis) {
        window.updateTacticalAnalysis(analysisResults);
    }
}

function updateCommandDisplay(analysisResults) {
    // This function is implemented in command.js
    if (window.updateCommandAnalysis) {
        window.updateCommandAnalysis(analysisResults);
    }
}

// Overlay functions
function toggleOverlay(overlayType) {
    const button = document.getElementById(overlayType + 'Overlay');
    const isActive = button.classList.contains('active');
    
    if (isActive) {
        button.classList.remove('active');
        hideOverlay(overlayType);
    } else {
        button.classList.add('active');
        showOverlay(overlayType);
    }
}

function showOverlay(overlayType) {
    console.log('Showing overlay:', overlayType);
    
    if (!currentAnalysis || !currentAnalysis.analysis_results) {
        console.log('No analysis results available for overlay');
        return;
    }
    
    const sceneContainer = document.getElementById('sceneDisplay');
    const sceneImage = document.getElementById('sceneImage');
    
    if (!sceneContainer || !sceneImage) {
        console.log('Scene elements not found');
        return;
    }
    
    // Create overlay container if it doesn't exist
    let overlayContainer = sceneContainer.querySelector('.overlay-container');
    if (!overlayContainer) {
        overlayContainer = document.createElement('div');
        overlayContainer.className = 'overlay-container';
        sceneContainer.appendChild(overlayContainer);
    }
    
    // Clear existing overlays
    overlayContainer.innerHTML = '';
    
    // Generate highlights based on overlay type and analysis results
    const highlights = generateHighlights(overlayType, currentAnalysis.analysis_results);
    
    highlights.forEach(highlight => {
        const highlightElement = createHighlightElement(highlight);
        overlayContainer.appendChild(highlightElement);
    });
}

function hideOverlay(overlayType) {
    console.log('Hiding overlay:', overlayType);
    
    const sceneContainer = document.getElementById('sceneDisplay');
    const overlayContainer = sceneContainer?.querySelector('.overlay-container');
    
    if (overlayContainer) {
        overlayContainer.innerHTML = '';
    }
}

function generateHighlights(overlayType, analysisResults) {
    const highlights = [];
    
    // Generate highlights based on overlay type
    switch (overlayType) {
        case 'hazard':
            highlights.push(...generateHazardHighlights(analysisResults));
            break;
        case 'synthesis':
            highlights.push(...generateSynthesisHighlights(analysisResults));
            break;
        case 'mopp':
            highlights.push(...generateMOPPHighlights(analysisResults));
            break;
        case 'sampling':
            highlights.push(...generateSamplingHighlights(analysisResults));
            break;
        default:
            highlights.push(...generateGenericHighlights(analysisResults));
    }
    
    return highlights;
}

function generateHazardHighlights(analysisResults) {
    const highlights = [];
    
    // Generate highlights for hazard detection
    if (analysisResults.agent_analysis?.agent_results?.hazard_detection) {
        const hazardAgent = analysisResults.agent_analysis.agent_results.hazard_detection;
        
        // Create highlights for high-confidence hazards
        if (hazardAgent.confidence > 0.6) {
            highlights.push({
                x: 20, y: 20, width: 120, height: 80,
                threatLevel: 'critical',
                label: 'Chemical Hazard',
                confidence: hazardAgent.confidence,
                details: hazardAgent.findings.join(', ')
            });
        }
        
        // Additional hazard regions based on findings
        hazardAgent.findings.forEach((finding, index) => {
            if (finding.toLowerCase().includes('chemical') || finding.toLowerCase().includes('toxic')) {
                highlights.push({
                    x: 50 + (index * 100), y: 60 + (index * 50), 
                    width: 100, height: 70,
                    threatLevel: 'high',
                    label: 'Toxic Material',
                    confidence: Math.max(0.5, hazardAgent.confidence - 0.1),
                    details: finding
                });
            }
        });
    }
    
    return highlights;
}

function generateSynthesisHighlights(analysisResults) {
    const highlights = [];
    
    if (analysisResults.agent_analysis?.agent_results?.synthesis_analysis) {
        const synthesisAgent = analysisResults.agent_analysis.agent_results.synthesis_analysis;
        
        // Equipment highlights
        if (synthesisAgent.confidence > 0.5) {
            highlights.push({
                x: 30, y: 100, width: 140, height: 90,
                threatLevel: 'high',
                label: 'Synthesis Equipment',
                confidence: synthesisAgent.confidence,
                details: 'Chemical synthesis apparatus detected'
            });
        }
        
        // Precursor highlights
        synthesisAgent.findings.forEach((finding, index) => {
            if (finding.toLowerCase().includes('precursor') || finding.toLowerCase().includes('equipment')) {
                highlights.push({
                    x: 80 + (index * 120), y: 40 + (index * 60), 
                    width: 110, height: 80,
                    threatLevel: 'moderate',
                    label: 'Precursor',
                    confidence: Math.max(0.4, synthesisAgent.confidence - 0.2),
                    details: finding
                });
            }
        });
    }
    
    return highlights;
}

function generateMOPPHighlights(analysisResults) {
    const highlights = [];
    
    if (analysisResults.agent_analysis?.agent_results?.mopp_recommendation) {
        const moppAgent = analysisResults.agent_analysis.agent_results.mopp_recommendation;
        
        // MOPP level areas
        if (moppAgent.metadata?.mopp_level >= 3) {
            highlights.push({
                x: 10, y: 150, width: 160, height: 100,
                threatLevel: 'critical',
                label: `MOPP ${moppAgent.metadata.mopp_level}`,
                confidence: moppAgent.confidence,
                details: 'High threat environment'
            });
        } else if (moppAgent.metadata?.mopp_level >= 2) {
            highlights.push({
                x: 60, y: 80, width: 120, height: 80,
                threatLevel: 'high',
                label: `MOPP ${moppAgent.metadata.mopp_level}`,
                confidence: moppAgent.confidence,
                details: 'Moderate threat environment'
            });
        }
    }
    
    return highlights;
}

function generateSamplingHighlights(analysisResults) {
    const highlights = [];
    
    if (analysisResults.agent_analysis?.agent_results?.sampling_strategy) {
        const samplingAgent = analysisResults.agent_analysis.agent_results.sampling_strategy;
        
        // Priority sampling locations
        samplingAgent.recommendations.forEach((rec, index) => {
            if (rec.toLowerCase().includes('sample') || rec.toLowerCase().includes('collect')) {
                highlights.push({
                    x: 40 + (index * 80), y: 120 + (index * 40), 
                    width: 90, height: 60,
                    threatLevel: 'moderate',
                    label: 'Sample Point',
                    confidence: samplingAgent.confidence,
                    details: rec
                });
            }
        });
    }
    
    return highlights;
}

function generateGenericHighlights(analysisResults) {
    const highlights = [];
    
    // Generic highlights for overall analysis
    if (analysisResults.agent_analysis?.synthesis?.smoking_guns) {
        analysisResults.agent_analysis.synthesis.smoking_guns.forEach((gun, index) => {
            highlights.push({
                x: 25 + (index * 100), y: 30 + (index * 70), 
                width: 130, height: 90,
                threatLevel: 'critical',
                label: 'Smoking Gun',
                confidence: gun.confidence,
                details: gun.finding
            });
        });
    }
    
    return highlights;
}

function createHighlightElement(highlight) {
    const highlightDiv = document.createElement('div');
    highlightDiv.className = `highlight-region threat-${highlight.threatLevel}`;
    
    // Position and size
    highlightDiv.style.left = `${highlight.x}px`;
    highlightDiv.style.top = `${highlight.y}px`;
    highlightDiv.style.width = `${highlight.width}px`;
    highlightDiv.style.height = `${highlight.height}px`;
    
    // Create label
    const labelDiv = document.createElement('div');
    labelDiv.className = `highlight-label threat-${highlight.threatLevel}`;
    labelDiv.textContent = highlight.label;
    
    // Create confidence indicator
    const confidenceDiv = document.createElement('div');
    confidenceDiv.className = `confidence-indicator ${getConfidenceClass(highlight.confidence)}`;
    confidenceDiv.textContent = `${Math.round(highlight.confidence * 100)}%`;
    
    // Add tooltip on hover
    highlightDiv.title = highlight.details;
    
    // Add event listener for click
    highlightDiv.addEventListener('click', () => {
        showHighlightDetails(highlight);
    });
    
    highlightDiv.appendChild(labelDiv);
    highlightDiv.appendChild(confidenceDiv);
    
    return highlightDiv;
}

function getConfidenceClass(confidence) {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
}

function showHighlightDetails(highlight) {
    // Show detailed information about the highlight
    const detailsModal = new bootstrap.Modal(document.getElementById('highlightDetailsModal') || createHighlightDetailsModal());
    
    document.getElementById('highlightDetailsTitle').textContent = highlight.label;
    document.getElementById('highlightDetailsContent').innerHTML = `
        <p><strong>Threat Level:</strong> ${highlight.threatLevel.toUpperCase()}</p>
        <p><strong>Confidence:</strong> ${Math.round(highlight.confidence * 100)}%</p>
        <p><strong>Details:</strong> ${highlight.details}</p>
    `;
    
    detailsModal.show();
}

function createHighlightDetailsModal() {
    const modalHtml = `
        <div class="modal fade" id="highlightDetailsModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="highlightDetailsTitle">Highlight Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="highlightDetailsContent"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    return document.getElementById('highlightDetailsModal');
}

// Utility functions
function resetUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const sceneDisplay = document.getElementById('sceneDisplay');
    
    uploadArea.style.display = 'flex';
    sceneDisplay.style.display = 'none';
    
    // Reset form
    document.getElementById('fileInput').value = '';
    document.getElementById('sceneDescription').value = '';
    document.getElementById('filePreview').style.display = 'none';
}

// Export functions for global access
window.uploadFile = uploadFile;
window.previewFile = previewFile;
window.submitFile = submitFile;
window.showYouTubeModal = showYouTubeModal;
window.analyzeYoutube = analyzeYoutube;
window.analyzeYouTube = analyzeYouTube;
window.openCommunicationModal = openCommunicationModal;
window.sendMessage = sendMessage;
window.searchKnowledge = searchKnowledge;
window.toggleOverlay = toggleOverlay;
window.handleFileSelect = handleFileSelect;
window.showHighlightDetails = showHighlightDetails;
window.showYouTubeInput = showYouTubeInput;
window.resetToUpload = resetToUpload;

// Reset to upload function
function resetToUpload() {
    console.log('Resetting to upload area...');
    
    // Hide scene display
    const sceneDisplay = document.getElementById('sceneDisplay');
    if (sceneDisplay) {
        sceneDisplay.style.display = 'none';
    }
    
    // Show upload area
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.style.display = 'flex';
    }
    
    // Clear scene data
    clearSceneData();
    
    // Reset analysis displays
    resetAnalysisDisplays();
    
    // Hide YouTube input if visible
    const youtubeInput = document.getElementById('youtubeInput');
    if (youtubeInput) {
        youtubeInput.style.display = 'none';
    }
    
    // Clear analysis progress
    const analysisProgress = document.getElementById('analysisProgress');
    if (analysisProgress) {
        analysisProgress.style.display = 'none';
    }
    
    // Reset overlay states
    resetOverlayStates();
    
    console.log('Reset to upload complete');
}

// Clear scene data
function clearSceneData() {
    const sceneImage = document.getElementById('sceneImage');
    const sceneVideo = document.getElementById('sceneVideo');
    
    if (sceneImage) {
        sceneImage.src = '';
        sceneImage.style.display = 'none';
    }
    
    if (sceneVideo) {
        sceneVideo.src = '';
        sceneVideo.style.display = 'none';
    }
    
    // Clear global analysis data
    currentAnalysis = null;
    window.currentAnalysis = null;
}

// Reset analysis displays
function resetAnalysisDisplays() {
    // Reset tactical displays
    resetTacticalDisplays();
    
    // Reset command displays
    resetCommandDisplays();
    
    // Reset scene summary
    const sceneSummaryContent = document.getElementById('sceneSummaryContent');
    if (sceneSummaryContent) {
        sceneSummaryContent.innerHTML = '<div class="text-muted">Upload a scene to begin analysis</div>';
    }
}

// Reset tactical displays
function resetTacticalDisplays() {
    const moppLevel = document.getElementById('moppLevel');
    if (moppLevel) {
        moppLevel.innerHTML = `
            <i class="bi bi-hourglass-split display-4 text-muted"></i>
            <p class="text-muted mt-2">Upload scene for MOPP assessment</p>
        `;
    }
    
    const hazardAssessment = document.getElementById('hazardAssessment');
    if (hazardAssessment) {
        hazardAssessment.innerHTML = `
            <i class="bi bi-exclamation-triangle display-4 text-muted"></i>
            <p class="text-muted mt-2">Awaiting threat analysis</p>
        `;
    }
    
    const synthesisIntelligence = document.getElementById('synthesisIntelligence');
    if (synthesisIntelligence) {
        synthesisIntelligence.innerHTML = `
            <i class="bi bi-flask display-4 text-muted"></i>
            <p class="text-muted mt-2">No synthesis activity detected</p>
        `;
    }
    
    const samplingStrategy = document.getElementById('samplingStrategy');
    if (samplingStrategy) {
        samplingStrategy.innerHTML = `
            <i class="bi bi-droplet display-4 text-muted"></i>
            <p class="text-muted mt-2">Sampling strategy pending</p>
        `;
    }
    
    const immediateActions = document.getElementById('immediateActions');
    if (immediateActions) {
        immediateActions.innerHTML = `
            <i class="bi bi-list-check display-4 text-muted"></i>
            <p class="text-muted mt-2">Actions will appear after analysis</p>
        `;
    }
}

// Reset command displays
function resetCommandDisplays() {
    const analysisOverview = document.getElementById('analysisOverview');
    if (analysisOverview) {
        analysisOverview.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-graph-up display-4 text-muted"></i>
                <p class="text-muted mt-2">Analysis overview will appear here</p>
            </div>
        `;
    }
    
    const agentAnalysis = document.getElementById('agentAnalysis');
    if (agentAnalysis) {
        agentAnalysis.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-robot display-4 text-muted"></i>
                <p class="text-muted mt-2">Agent analysis will appear here</p>
            </div>
        `;
    }
}

// Reset overlay states
function resetOverlayStates() {
    const overlayButtons = document.querySelectorAll('.overlay-toggle');
    overlayButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Clear any overlay containers
    const overlayContainers = document.querySelectorAll('.overlay-container');
    overlayContainers.forEach(container => {
        container.innerHTML = '';
    });
}
