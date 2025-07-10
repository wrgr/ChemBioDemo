#!/usr/bin/env python3
"""
Test script to demonstrate the enhanced overlay system
"""
import requests
import json
import os

def test_overlay_system():
    """Test the enhanced overlay system with a sample upload"""
    
    # Create a test chemical lab image description
    test_analysis = {
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
    }
    
    # Save the test analysis to a file for demonstration
    with open('test_analysis_demo.json', 'w') as f:
        json.dump(test_analysis, f, indent=2)
    
    print("Test analysis data created successfully!")
    print("This demonstrates the enhanced overlay system with:")
    print("- Hazard detection overlays (RED - Critical threat)")
    print("- Synthesis equipment highlights (ORANGE - High threat)")
    print("- MOPP recommendation zones (YELLOW - Moderate threat)")
    print("- Sampling point markers (GREEN - Low threat)")
    print("- Animated pulse effects and confidence indicators")
    print("- Interactive hover and click details")
    
    return test_analysis

if __name__ == "__main__":
    test_overlay_system()