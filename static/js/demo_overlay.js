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
        // Load demo image
        sceneImage.src = '/uploads/demo_chemical_lab.png';
        sceneImage.style.display = 'block';
        
        // Hide upload area and show scene
        uploadArea.style.display = 'none';
        sceneDisplay.style.display = 'block';
        
        // Add demo mode indicator
        sceneDisplay.classList.add('demo-mode');
        
        // Update analysis display
        updateAnalysisDisplay(demoAnalysis.analysis_results);
        
        // Create demo overlay highlights
        createDemoOverlays();
        
        // Automatically show hazard overlays after image loads
        sceneImage.onload = function() {
            setTimeout(() => {
                console.log('Auto-showing hazard overlays for demo...');
                if (typeof toggleOverlay === 'function') {
                    toggleOverlay('hazard');
                    
                    // Show other overlays with delays
                    setTimeout(() => toggleOverlay('synthesis'), 2000);
                    setTimeout(() => toggleOverlay('mopp'), 4000);
                    setTimeout(() => toggleOverlay('sampling'), 6000);
                }
            }, 1000);
        };
        
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

// Export for global access
window.demoOverlaySystem = demoOverlaySystem;