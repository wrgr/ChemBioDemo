import logging
from typing import Dict, Any, List
from agents.base_agent import BaseAgent, AgentResult
from services.gemini_service import GeminiService

class MOPPRecommendationAgent(BaseAgent):
    """Agent specialized in providing MOPP (Mission Oriented Protective Posture) recommendations"""
    
    def __init__(self):
        super().__init__("mopp_recommender")
        self.gemini_service = GeminiService()
        self.mopp_levels = {
            0: {
                'name': 'MOPP 0',
                'equipment': ['Carry protective mask', 'Have other MOPP gear readily available'],
                'description': 'Minimum protection - threat level low',
                'duration': 'Unlimited'
            },
            1: {
                'name': 'MOPP 1',
                'equipment': ['Overgarment worn', 'Protective mask carried', 'Gloves and overboots available'],
                'description': 'Chemical attack probable within 6 hours',
                'duration': 'Up to 6 hours'
            },
            2: {
                'name': 'MOPP 2',
                'equipment': ['Overgarment worn', 'Protective mask carried', 'Overboots worn', 'Gloves available'],
                'description': 'Chemical attack probable within 1 hour',
                'duration': 'Up to 2 hours'
            },
            3: {
                'name': 'MOPP 3',
                'equipment': ['Overgarment worn', 'Protective mask carried', 'Overboots worn', 'Gloves worn'],
                'description': 'Chemical attack imminent or confirmed',
                'duration': 'Up to 1 hour'
            },
            4: {
                'name': 'MOPP 4',
                'equipment': ['All protective equipment worn', 'Protective mask donned', 'Complete encapsulation'],
                'description': 'Chemical attack in progress or contamination present',
                'duration': 'Mission dependent - maximum protection'
            }
        }
        
    def analyze(self, scene_data: Dict[str, Any]) -> AgentResult:
        """Analyze scene and provide MOPP recommendations"""
        if not self.validate_input(scene_data):
            return self._create_error_result("Invalid input data")
            
        try:
            # Analyze threat level from scene
            threat_analysis = self._analyze_threat_level(scene_data)
            
            # Assess environmental factors
            environmental_factors = self._assess_environmental_factors(scene_data)
            
            # Determine MOPP level
            mopp_level = self._determine_mopp_level(threat_analysis, environmental_factors)
            
            # Generate specific recommendations
            recommendations = self._generate_mopp_recommendations(
                mopp_level, threat_analysis, environmental_factors
            )
            
            # Calculate confidence based on threat indicators
            confidence = self._calculate_mopp_confidence(threat_analysis, environmental_factors)
            
            # Determine overall hazard level
            hazard_level = self._determine_hazard_level_from_mopp(mopp_level)
            
            reasoning = self._build_mopp_reasoning(
                mopp_level, threat_analysis, environmental_factors, confidence
            )
            
            findings = self._generate_mopp_findings(threat_analysis, environmental_factors)
            
            return AgentResult(
                agent_name=self.name,
                confidence=confidence,
                findings=findings,
                recommendations=recommendations,
                hazard_level=hazard_level,
                metadata={
                    'mopp_level': mopp_level,
                    'threat_analysis': threat_analysis,
                    'environmental_factors': environmental_factors,
                    'equipment_required': self.mopp_levels[mopp_level]['equipment'],
                    'duration_limit': self.mopp_levels[mopp_level]['duration']
                },
                reasoning=reasoning
            )
            
        except Exception as e:
            self.logger.error(f"Error in MOPP analysis: {str(e)}")
            return self._create_error_result(f"Analysis failed: {str(e)}")
            
    def _analyze_threat_level(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the threat level from scene data"""
        prompt = """
        Analyze this scene for chemical and biological threat indicators that would affect MOPP level decisions. Consider:
        
        IMMEDIATE THREATS:
        - Active chemical leaks or spills
        - Visible vapors or gases
        - Biological aerosols or contamination
        - Ongoing chemical reactions
        - Breached containers or equipment
        
        POTENTIAL THREATS:
        - Chemical storage areas
        - Laboratory equipment with hazardous materials
        - Biological containment systems
        - Precursor chemicals present
        - Improvised chemical devices
        
        ENVIRONMENTAL FACTORS:
        - Ventilation conditions
        - Temperature and humidity
        - Wind patterns (if outdoor)
        - Enclosed vs open spaces
        - Proximity to populated areas
        
        Assess the immediacy and severity of chemical/biological threats present.
        """
        
        if scene_data.get('image_data'):
            analysis_text = self.gemini_service.analyze_image_with_prompt(
                scene_data['image_data'], prompt
            )
        else:
            analysis_text = "No image data available for threat analysis"
            
        # Extract threat indicators
        threat_indicators = self._extract_threat_indicators(analysis_text)
        
        return {
            'analysis_text': analysis_text,
            'threat_indicators': threat_indicators,
            'immediate_threats': self._count_immediate_threats(threat_indicators),
            'potential_threats': self._count_potential_threats(threat_indicators)
        }
        
    def _extract_threat_indicators(self, analysis_text: str) -> List[Dict[str, Any]]:
        """Extract threat indicators from analysis text"""
        indicators = []
        analysis_lower = analysis_text.lower()
        
        # Immediate threat indicators
        immediate_threats = [
            'chemical leak', 'gas release', 'vapor cloud', 'spill', 'aerosol',
            'active reaction', 'explosion', 'fire', 'breach', 'contamination'
        ]
        
        for threat in immediate_threats:
            if threat in analysis_lower:
                indicators.append({
                    'type': 'immediate',
                    'indicator': threat,
                    'severity': 'high',
                    'confidence': 0.9
                })
                
        # Potential threat indicators
        potential_threats = [
            'chemical storage', 'laboratory', 'precursor', 'container', 'tank',
            'reactor', 'synthesis', 'biological', 'hazardous material'
        ]
        
        for threat in potential_threats:
            if threat in analysis_lower:
                indicators.append({
                    'type': 'potential',
                    'indicator': threat,
                    'severity': 'medium',
                    'confidence': 0.7
                })
                
        return indicators
        
    def _assess_environmental_factors(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess environmental factors affecting MOPP decisions"""
        factors = {
            'ventilation': 'unknown',
            'space_type': 'unknown',
            'weather_conditions': 'unknown',
            'population_density': 'unknown'
        }
        
        # Extract environmental information from metadata if available
        metadata = scene_data.get('metadata', {})
        
        if 'indoor' in str(metadata).lower():
            factors['space_type'] = 'indoor'
        elif 'outdoor' in str(metadata).lower():
            factors['space_type'] = 'outdoor'
            
        if 'ventilation' in str(metadata).lower():
            factors['ventilation'] = 'present'
        elif 'no ventilation' in str(metadata).lower():
            factors['ventilation'] = 'absent'
            
        return factors
        
    def _determine_mopp_level(self, threat_analysis: Dict[str, Any], 
                             environmental_factors: Dict[str, Any]) -> int:
        """Determine appropriate MOPP level based on analysis"""
        immediate_threats = threat_analysis['immediate_threats']
        potential_threats = threat_analysis['potential_threats']
        
        # Start with base level
        mopp_level = 0
        
        # Escalate based on immediate threats
        if immediate_threats >= 3:
            mopp_level = 4  # Maximum protection
        elif immediate_threats >= 2:
            mopp_level = 3
        elif immediate_threats >= 1:
            mopp_level = 2
            
        # Escalate based on potential threats
        if potential_threats >= 5 and mopp_level < 2:
            mopp_level = 2
        elif potential_threats >= 3 and mopp_level < 1:
            mopp_level = 1
            
        # Adjust for environmental factors
        if environmental_factors['ventilation'] == 'absent' and mopp_level < 2:
            mopp_level += 1
            
        if environmental_factors['space_type'] == 'indoor' and mopp_level < 1:
            mopp_level += 1
            
        return min(mopp_level, 4)  # Cap at MOPP 4
        
    def _count_immediate_threats(self, threat_indicators: List[Dict[str, Any]]) -> int:
        """Count immediate threat indicators"""
        return len([t for t in threat_indicators if t['type'] == 'immediate'])
        
    def _count_potential_threats(self, threat_indicators: List[Dict[str, Any]]) -> int:
        """Count potential threat indicators"""
        return len([t for t in threat_indicators if t['type'] == 'potential'])
        
    def _calculate_mopp_confidence(self, threat_analysis: Dict[str, Any], 
                                  environmental_factors: Dict[str, Any]) -> float:
        """Calculate confidence in MOPP recommendation"""
        indicators = threat_analysis['threat_indicators']
        
        if not indicators:
            return 0.3  # Low confidence with no indicators
            
        # Base confidence on indicator quality
        total_confidence = sum(indicator['confidence'] for indicator in indicators)
        avg_confidence = total_confidence / len(indicators)
        
        # Adjust for environmental certainty
        known_factors = sum(1 for factor in environmental_factors.values() if factor != 'unknown')
        environmental_certainty = known_factors / len(environmental_factors)
        
        return min((avg_confidence + environmental_certainty) / 2, 1.0)
        
    def _determine_hazard_level_from_mopp(self, mopp_level: int) -> str:
        """Determine hazard level based on MOPP level"""
        if mopp_level >= 4:
            return "CRITICAL"
        elif mopp_level >= 3:
            return "HIGH"
        elif mopp_level >= 2:
            return "MODERATE"
        elif mopp_level >= 1:
            return "LOW"
        else:
            return "MINIMAL"
            
    def _generate_mopp_recommendations(self, mopp_level: int, 
                                     threat_analysis: Dict[str, Any],
                                     environmental_factors: Dict[str, Any]) -> List[str]:
        """Generate specific MOPP recommendations"""
        recommendations = []
        
        # Add MOPP level specific recommendations
        mopp_info = self.mopp_levels[mopp_level]
        recommendations.append(f"Implement {mopp_info['name']}: {mopp_info['description']}")
        
        for equipment in mopp_info['equipment']:
            recommendations.append(f"Equipment required: {equipment}")
            
        recommendations.append(f"Duration limit: {mopp_info['duration']}")
        
        # Add threat-specific recommendations
        if threat_analysis['immediate_threats'] > 0:
            recommendations.extend([
                "Establish immediate containment perimeter",
                "Implement emergency decontamination procedures",
                "Coordinate with HAZMAT response teams"
            ])
            
        if environmental_factors['ventilation'] == 'absent':
            recommendations.append("Implement forced ventilation if possible")
            
        # Add monitoring recommendations
        recommendations.extend([
            "Monitor personnel for exposure symptoms",
            "Establish decontamination checkpoints",
            "Implement buddy system for safety monitoring",
            "Regular equipment inspection and maintenance"
        ])
        
        return recommendations
        
    def _generate_mopp_findings(self, threat_analysis: Dict[str, Any], 
                               environmental_factors: Dict[str, Any]) -> List[str]:
        """Generate findings based on MOPP analysis"""
        findings = []
        
        # Threat-based findings
        immediate_count = threat_analysis['immediate_threats']
        potential_count = threat_analysis['potential_threats']
        
        if immediate_count > 0:
            findings.append(f"Immediate chemical/biological threats detected: {immediate_count}")
            
        if potential_count > 0:
            findings.append(f"Potential chemical/biological threats identified: {potential_count}")
            
        # Environmental findings
        for factor, value in environmental_factors.items():
            if value != 'unknown':
                findings.append(f"Environmental factor - {factor}: {value}")
                
        return findings
        
    def _build_mopp_reasoning(self, mopp_level: int, threat_analysis: Dict[str, Any],
                             environmental_factors: Dict[str, Any], confidence: float) -> str:
        """Build reasoning explanation for MOPP recommendation"""
        reasoning_parts = []
        
        reasoning_parts.append(f"MOPP Level {mopp_level} recommended")
        
        immediate_threats = threat_analysis['immediate_threats']
        potential_threats = threat_analysis['potential_threats']
        
        if immediate_threats > 0:
            reasoning_parts.append(f"Immediate threats: {immediate_threats}")
            
        if potential_threats > 0:
            reasoning_parts.append(f"Potential threats: {potential_threats}")
            
        # Environmental factors
        env_factors = [f"{k}:{v}" for k, v in environmental_factors.items() if v != 'unknown']
        if env_factors:
            reasoning_parts.append(f"Environmental factors: {', '.join(env_factors)}")
            
        reasoning_parts.append(f"Confidence: {confidence:.2f}")
        
        return " | ".join(reasoning_parts)
        
    def _create_error_result(self, error_message: str) -> AgentResult:
        """Create an error result"""
        return AgentResult(
            agent_name=self.name,
            confidence=0.0,
            findings=[f"Error: {error_message}"],
            recommendations=["Review input data and retry analysis"],
            hazard_level="UNKNOWN",
            metadata={'error': error_message},
            reasoning=f"Analysis failed: {error_message}"
        )
