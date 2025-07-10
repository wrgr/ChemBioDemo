// Enhanced Demo System for ChemBio Defense Dashboard

// Demo data with realistic analysis results
const demoData = {
    agent_analysis: {
        agent_results: {
            hazard_detection: {
                agent_name: "hazard_detection",
                confidence: 0.85,
                findings: [
                    "Chemical containers with hazardous symbols detected",
                    "Toxic vapors potentially present in enclosed area",
                    "Inadequate ventilation system observed",
                    "Corrosive materials improperly stored"
                ],
                recommendations: [
                    "Implement MOPP Level 3 protective equipment",
                    "Evacuate non-essential personnel",
                    "Establish decontamination procedures",
                    "Secure ventilation systems"
                ],
                hazard_level: "HIGH",
                reasoning: "Multiple chemical hazards detected with high confidence based on visual indicators and storage patterns.",
                metadata: {
                    chemical_indicators: ["corrosive_symbols", "toxic_vapors", "improper_storage"],
                    threat_level: "HIGH",
                    confidence_factors: ["visual_confirmation", "pattern_recognition", "hazard_symbols"]
                }
            },
            synthesis_analysis: {
                agent_name: "synthesis_analysis",
                confidence: 0.72,
                findings: [
                    "Synthesis equipment including distillation apparatus",
                    "Precursor chemicals stored in organized manner",
                    "Evidence of recent chemical synthesis activity",
                    "Reaction vessels and heating equipment present"
                ],
                recommendations: [
                    "Secure all chemical precursors",
                    "Document equipment for evidence",
                    "Test residues for illicit substances",
                    "Establish evidence chain of custody"
                ],
                hazard_level: "MODERATE",
                reasoning: "Chemical synthesis equipment detected with moderate confidence, indicating potential illicit manufacturing.",
                metadata: {
                    equipment_types: ["distillation", "reaction_vessels", "heating_equipment"],
                    synthesis_indicators: ["precursor_chemicals", "organized_storage", "recent_activity"],
                    complexity_level: "MODERATE"
                }
            },
            mopp_recommendation: {
                agent_name: "mopp_recommendation",
                confidence: 0.88,
                findings: [
                    "High threat environment detected",
                    "Airborne contamination risk present",
                    "Chemical protective equipment required",
                    "Decontamination procedures necessary"
                ],
                recommendations: [
                    "Implement MOPP Level 3 immediately",
                    "Establish decontamination station",
                    "Limit personnel exposure time",
                    "Monitor for symptoms of exposure"
                ],
                hazard_level: "HIGH",
                reasoning: "High threat environment requires immediate MOPP Level 3 protection based on chemical hazard assessment.",
                metadata: {
                    mopp_level: 3,
                    threat_factors: ["chemical_hazards", "airborne_contamination", "exposure_risk"],
                    environmental_conditions: ["enclosed_space", "poor_ventilation", "chemical_storage"]
                }
            },
            sampling_strategy: {
                agent_name: "sampling_strategy",
                confidence: 0.76,
                findings: [
                    "Multiple sampling points identified",
                    "High priority areas for evidence collection",
                    "Environmental contamination zones detected",
                    "Surface residue sampling required"
                ],
                recommendations: [
                    "Collect samples from reaction vessels",
                    "Test air quality in enclosed areas",
                    "Document surface contamination",
                    "Secure samples for laboratory analysis"
                ],
                hazard_level: "MODERATE",
                reasoning: "Strategic sampling points identified for comprehensive evidence collection and contamination assessment.",
                metadata: {
                    sampling_points: 5,
                    priority_areas: ["reaction_vessels", "storage_areas", "ventilation_systems"],
                    sample_types: ["surface_residue", "air_quality", "liquid_samples"]
                }
            }
        }
    },
    actionable_intelligence: {
        immediate_actions: [
            "Implement MOPP Level 3 protective equipment",
            "Evacuate non-essential personnel immediately",
            "Establish decontamination procedures",
            "Secure all chemical precursors and evidence"
        ],
        tactical_priorities: [
            "Document all equipment and chemical storage",
            "Collect samples from high-priority areas",
            "Monitor personnel for exposure symptoms",
            "Coordinate with hazmat response teams"
        ]
    },
    synthesis: {
        consensus_findings: [
            "Active chemical synthesis operation detected",
            "High risk of toxic exposure in enclosed environment",
            "Organized storage suggests intentional manufacturing",
            "Multiple safety violations observed"
        ],
        smoking_guns: [
            {
                finding: "Industrial distillation equipment in residential setting",
                confidence: 0.92,
                agent: "synthesis_analysis"
            },
            {
                finding: "Toxic chemical storage without proper ventilation",
                confidence: 0.88,
                agent: "hazard_detection"
            }
        ],
        key_insights: [
            "Chemical synthesis operation appears to be active and ongoing",
            "Safety protocols are inadequate for the hazardous materials present",
            "Evidence suggests organized criminal manufacturing operation",
            "Immediate health risks require emergency response protocols"
        ]
    },
    overall_assessment: {
        threat_level: "HIGH",
        confidence: 0.83,
        summary: "Active chemical synthesis operation with significant safety hazards requiring immediate MOPP Level 3 response and evidence collection."
    }
};

// Demo highlights for overlay system
const demoHighlights = {
    hazard: [
        {
            x: 500,
            y: 250,
            width: 120,
            height: 80,
            label: "Chemical Containers",
            confidence: 0.85
        },
        {
            x: 50,
            y: 50,
            width: 200,
            height: 40,
            label: "Ventilation Issue",
            confidence: 0.78
        },
        {
            x: 350,
            y: 300,
            width: 100,
            height: 60,
            label: "Corrosive Storage",
            confidence: 0.82
        }
    ],
    synthesis: [
        {
            x: 300,
            y: 180,
            width: 120,
            height: 80,
            label: "Distillation Setup",
            confidence: 0.72
        },
        {
            x: 100,
            y: 200,
            width: 100,
            height: 100,
            label: "Reaction Vessel",
            confidence: 0.69
        },
        {
            x: 450,
            y: 150,
            width: 80,
            height: 60,
            label: "Heating Equipment",
            confidence: 0.74
        }
    ],
    mopp: [
        {
            x: 200,
            y: 150,
            width: 400,
            height: 200,
            label: "MOPP Level 3 Zone",
            confidence: 0.88
        }
    ],
    sampling: [
        {
            x: 320,
            y: 200,
            width: 20,
            height: 20,
            label: "Sample Point 1",
            confidence: 0.76
        },
        {
            x: 520,
            y: 280,
            width: 20,
            height: 20,
            label: "Sample Point 2",
            confidence: 0.82
        },
        {
            x: 150,
            y: 250,
            width: 20,
            height: 20,
            label: "Sample Point 3",
            confidence: 0.74
        },
        {
            x: 380,
            y: 320,
            width: 20,
            height: 20,
            label: "Sample Point 4",
            confidence: 0.79
        }
    ]
};

// Main demo function
function startEnhancedDemo() {
    console.log('Starting enhanced overlay system demo...');
    
    // Hide upload area and show demo image
    const uploadArea = document.getElementById('uploadArea');
    const sceneDisplay = document.getElementById('sceneDisplay');
    const sceneImage = document.getElementById('sceneImage');
    
    if (uploadArea) {
        uploadArea.style.display = 'none';
    }
    
    if (sceneDisplay) {
        sceneDisplay.style.display = 'block';
    }
    
    // Load demo image
    if (sceneImage) {
        sceneImage.src = '/uploads/demo_chemical_lab.png';
        sceneImage.style.display = 'block';
        sceneImage.onload = function() {
            console.log('Demo image loaded, setting up overlays...');
            setupDemoOverlays();
        };
    }
    
    // Update analysis displays
    updateAnalysisDisplay(demoData);
    
    // Store demo data globally
    window.demoHighlights = demoHighlights;
    window.currentAnalysis = demoData;
    
    console.log('Demo overlay system loaded successfully!');
}

// Setup demo overlays
function setupDemoOverlays() {
    console.log('Demo highlights created:', demoHighlights);
    
    // Update tactical analysis if function exists
    if (typeof updateTacticalAnalysis === 'function') {
        console.log('Updating tactical analysis components...', demoData);
        updateTacticalAnalysis(demoData);
        console.log('Tactical analysis components updated successfully');
    }
    
    // Update command analysis if function exists
    if (typeof updateCommandAnalysis === 'function') {
        console.log('Updating command analysis display');
        updateCommandAnalysis(demoData);
    }
}

// Legacy compatibility function 
function runDemo() {
    startEnhancedDemo();
}

// Export for global access
window.startEnhancedDemo = startEnhancedDemo;
window.runDemo = runDemo;
window.demoData = demoData;
window.demoHighlights = demoHighlights;