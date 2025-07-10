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
    
    if (sceneImage && sceneDisplay) {
        // Load demo image
        sceneImage.src = '/uploads/demo_chemical_lab.png';
        sceneImage.style.display = 'block';
        
        // Hide upload area and show scene
        uploadArea.style.display = 'none';
        sceneDisplay.style.display = 'block';
        
        // Update analysis display
        updateAnalysisDisplay(demoAnalysis.analysis_results);
        
        // Automatically show hazard overlays after image loads
        sceneImage.onload = function() {
            setTimeout(() => {
                console.log('Auto-showing hazard overlays for demo...');
                toggleOverlay('hazard');
                
                // Show other overlays with delays
                setTimeout(() => toggleOverlay('synthesis'), 2000);
                setTimeout(() => toggleOverlay('mopp'), 4000);
                setTimeout(() => toggleOverlay('sampling'), 6000);
            }, 1000);
        };
        
        console.log('Demo overlay system loaded successfully!');
        return true;
    } else {
        console.error('Scene display elements not found');
        return false;
    }
}

// Export for global access
window.demoOverlaySystem = demoOverlaySystem;