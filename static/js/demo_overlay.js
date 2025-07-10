// Demo script for enhanced overlay system
function demoOverlaySystem() {
    console.log('Starting enhanced overlay system demo...');
    
    // Sample analysis data with enhanced highlight information
    const demoAnalysis = {
        "status": "success",
        "analysis_results": {
            "agent_analysis": {
                "agent_results": {
                    "hazard_detection": {
                        "agent_name": "hazard_detection",
                        "confidence": 0.85,
                        "findings": [
                            "Chemical containers with hazardous symbols detected",
                            "Toxic vapors potentially present in enclosed area",
                            "Inadequate ventilation system observed"
                        ],
                        "recommendations": [
                            "Implement MOPP Level 3 protective equipment",
                            "Evacuate non-essential personnel",
                            "Establish decontamination procedures"
                        ],
                        "hazard_level": "HIGH"
                    },
                    "synthesis_analysis": {
                        "agent_name": "synthesis_analysis", 
                        "confidence": 0.72,
                        "findings": [
                            "Synthesis equipment including distillation apparatus",
                            "Precursor chemicals stored in organized manner",
                            "Evidence of recent chemical synthesis activity"
                        ],
                        "recommendations": [
                            "Secure all chemical precursors",
                            "Document equipment for evidence",
                            "Test residues for illicit substances"
                        ],
                        "hazard_level": "MODERATE"
                    },
                    "mopp_recommendation": {
                        "agent_name": "mopp_recommendation",
                        "confidence": 0.88,
                        "findings": [
                            "High threat environment detected",
                            "Airborne contamination likely"
                        ],
                        "recommendations": [
                            "MOPP Level 3 required for entry",
                            "Full protective equipment mandatory",
                            "Continuous air monitoring needed"
                        ],
                        "hazard_level": "HIGH",
                        "metadata": {
                            "mopp_level": 3
                        }
                    },
                    "sampling_strategy": {
                        "agent_name": "sampling_strategy",
                        "confidence": 0.76,
                        "findings": [
                            "Multiple sampling points identified",
                            "Air samples required for vapor analysis"
                        ],
                        "recommendations": [
                            "Sample chemical residues from equipment",
                            "Collect air samples near ventilation",
                            "Document all evidence locations"
                        ],
                        "hazard_level": "MODERATE"
                    }
                },
                "synthesis": {
                    "smoking_guns": [
                        {
                            "finding": "Active chemical synthesis equipment with recent use",
                            "confidence": 0.89
                        },
                        {
                            "finding": "Precursor chemicals arranged for production",
                            "confidence": 0.82
                        }
                    ],
                    "consensus_findings": [
                        "Chemical synthesis laboratory confirmed",
                        "High threat environment requiring protective equipment",
                        "Evidence of recent synthesis activity"
                    ]
                },
                "overall_assessment": {
                    "threat_level": "HIGH",
                    "overall_confidence": 0.81
                }
            },
            "tactical_summary": "High-threat chemical synthesis laboratory detected. MOPP Level 3 required for safe entry. Multiple sampling points identified for evidence collection.",
            "actionable_intelligence": {
                "immediate_actions": [
                    "Establish perimeter and evacuate non-essential personnel",
                    "Deploy MOPP Level 3 protective equipment",
                    "Begin air monitoring for chemical vapors",
                    "Prepare decontamination procedures"
                ]
            }
        }
    };
    
    // Set current analysis for demo
    currentAnalysis = demoAnalysis;
    
    // Show demo image
    const sceneDisplay = document.getElementById('sceneDisplay');
    const sceneImage = document.getElementById('sceneImage');
    const uploadArea = document.getElementById('uploadArea');
    
    if (sceneImage && sceneDisplay && uploadArea) {
        // Load demo image with error handling
        sceneImage.onerror = function() {
            console.error('Failed to load demo image:', sceneImage.src);
            // Create a simple demo image as fallback
            createFallbackImage();
        };
        
        sceneImage.src = '/uploads/demo_chemical_lab.png';
        sceneImage.style.display = 'block';
        
        // Hide upload area and show scene
        uploadArea.style.display = 'none';
        sceneDisplay.style.display = 'block';
        
        // Add demo mode indicator
        sceneDisplay.classList.add('demo-mode');
        
        // Update analysis display
        updateAnalysisDisplay(demoAnalysis.analysis_results);
        
        // Also update tactical analysis display
        if (typeof updateTacticalAnalysis === 'function') {
            updateTacticalAnalysis(demoAnalysis.analysis_results);
        }
        
        // Create demo overlay highlights
        createDemoOverlays();
        
        // Show image immediately and set up overlays
        console.log('Demo image loaded, setting up overlays...');
        
        // Automatically show hazard overlays after image loads
        sceneImage.onload = function() {
            console.log('Demo image loaded successfully, showing overlays...');
            setTimeout(() => {
                console.log('Auto-showing hazard overlays for demo...');
                if (typeof toggleOverlay === 'function') {
                    toggleOverlay('hazard');
                    
                    // Show other overlays with delays
                    setTimeout(() => toggleOverlay('synthesis'), 2000);
                    setTimeout(() => toggleOverlay('mopp'), 4000);
                    setTimeout(() => toggleOverlay('sampling'), 6000);
                } else {
                    console.error('toggleOverlay function not found');
                }
            }, 1000);
        };
        
        // Force image load if already cached
        if (sceneImage.complete) {
            sceneImage.onload();
        }
        
        console.log('Demo overlay system loaded successfully!');
        return true;
    } else {
        console.error('Scene display elements not found', {
            sceneDisplay: !!sceneDisplay,
            sceneImage: !!sceneImage,
            uploadArea: !!uploadArea
        });
        return false;
    }
}

// Create demo overlay highlights
function createDemoOverlays() {
    // Create demo highlights for the chemical lab scene
    const demoHighlights = {
        hazard: [
            { x: 500, y: 250, width: 120, height: 80, label: 'Chemical Containers', confidence: 0.85 },
            { x: 50, y: 50, width: 200, height: 40, label: 'Ventilation Issue', confidence: 0.78 }
        ],
        synthesis: [
            { x: 300, y: 180, width: 120, height: 80, label: 'Distillation Setup', confidence: 0.72 },
            { x: 100, y: 200, width: 100, height: 100, label: 'Reaction Vessel', confidence: 0.69 }
        ],
        mopp: [
            { x: 200, y: 150, width: 400, height: 200, label: 'MOPP Level 3 Zone', confidence: 0.88 }
        ],
        sampling: [
            { x: 320, y: 200, width: 20, height: 20, label: 'Sample Point 1', confidence: 0.76 },
            { x: 520, y: 280, width: 20, height: 20, label: 'Sample Point 2', confidence: 0.82 },
            { x: 150, y: 250, width: 20, height: 20, label: 'Sample Point 3', confidence: 0.74 }
        ]
    };
    
    // Store demo highlights globally
    window.demoHighlights = demoHighlights;
    console.log('Demo highlights created:', demoHighlights);
}

// Create fallback image if demo image fails to load
function createFallbackImage() {
    const sceneImage = document.getElementById('sceneImage');
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 800, 600);
    
    // Chemical equipment representations
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(100, 200, 100, 100);
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(140, 150, 20, 50);
    
    // Distillation setup
    ctx.fillStyle = '#808080';
    ctx.fillRect(300, 180, 50, 40);
    ctx.beginPath();
    ctx.moveTo(350, 200);
    ctx.lineTo(400, 150);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Chemical containers
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(500, 250, 50, 70);
    ctx.fillStyle = '#FFD93D';
    ctx.fillRect(570, 250, 50, 70);
    ctx.fillStyle = '#6BCF7F';
    ctx.fillRect(640, 250, 50, 70);
    
    // Warning symbols
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.moveTo(520, 230);
    ctx.lineTo(510, 250);
    ctx.lineTo(530, 250);
    ctx.closePath();
    ctx.fill();
    
    // Ventilation duct
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(50, 50, 700, 30);
    
    // Labels
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.fillText('Chemical Lab Demo Scene', 50, 40);
    ctx.fillText('Reaction Vessel', 120, 340);
    ctx.fillText('Distillation', 300, 240);
    ctx.fillText('Chemicals', 500, 340);
    ctx.fillText('Ventilation', 50, 100);
    
    // Convert to data URL and set as image source
    sceneImage.src = canvas.toDataURL();
    console.log('Created fallback demo image');
}

// Export for global access
window.demoOverlaySystem = demoOverlaySystem;