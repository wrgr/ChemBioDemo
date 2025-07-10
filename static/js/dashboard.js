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
    uploadModal = new bootstrap.Modal(document.getElementById('uploadModal'));
    youtubeModal = new bootstrap.Modal(document.getElementById('youtubeModal'));
    communicationModal = new bootstrap.Modal(document.getElementById('communicationModal'));
}

// Setup drag and drop functionality
function setupDragDrop() {
    const uploadArea = document.getElementById('uploadArea');
    const hiddenFileInput = document.getElementById('hiddenFileInput');
    
    // Click handler
    uploadArea.addEventListener('click', function() {
        hiddenFileInput.click();
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
            hideUploadProgress();
            uploadModal.hide();
            
            // Display uploaded file
            displayUploadedFile(data, file);
            
            // Start analysis
            startAnalysis(data.scene_data, description);
        } else {
            hideUploadProgress();
            showAlert(data.error || 'Upload failed', 'danger');
        }
    })
    .catch(error => {
        hideUploadProgress();
        console.error('Upload error:', error);
        showAlert('Upload failed: ' + error.message, 'danger');
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
    
    // Send analysis request
    fetch('/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData)
    })
    .then(response => response.json())
    .then(data => {
        hideAnalysisProgress();
        
        if (data.status === 'success') {
            console.log('Analysis completed:', data.analysis_results);
            currentAnalysis = data.analysis_results;
            updateAnalysisDisplay(data.analysis_results);
        } else {
            showAlert(data.error || 'Analysis failed', 'danger');
        }
    })
    .catch(error => {
        hideAnalysisProgress();
        console.error('Analysis error:', error);
        showAlert('Analysis failed: ' + error.message, 'danger');
    });
}

function showUploadProgress() {
    // Implementation for upload progress
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <div class="d-flex align-items-center justify-content-center">
            <div class="spinner-border me-2" role="status"></div>
            <span>Uploading...</span>
        </div>
    `;
}

function hideUploadProgress() {
    // Reset upload area
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <div>
            <i class="bi bi-cloud-upload display-4 text-muted"></i>
            <p class="mt-2 text-muted">
                Drop files here or click to upload<br>
                <small>Supports images and videos (max 50MB)</small>
            </p>
            <button class="btn btn-outline-primary" onclick="uploadFile()">
                Choose Files
            </button>
        </div>
    `;
}

function showAnalysisProgress() {
    const progressDiv = document.getElementById('analysisProgress');
    progressDiv.style.display = 'block';
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
    
    // Update tactical display
    updateTacticalDisplay(analysisResults);
    
    // Update command display
    updateCommandDisplay(analysisResults);
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
    // Implementation would depend on the specific overlay type
    // For now, just log the action
}

function hideOverlay(overlayType) {
    console.log('Hiding overlay:', overlayType);
    // Implementation would depend on the specific overlay type
    // For now, just log the action
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
window.openCommunicationModal = openCommunicationModal;
window.sendMessage = sendMessage;
window.searchKnowledge = searchKnowledge;
window.toggleOverlay = toggleOverlay;
window.handleFileSelect = handleFileSelect;
