import logging
from typing import Dict, Any, List
from agents.base_agent import BaseAgent, AgentResult
from services.gemini_service import GeminiService

class HazardDetectionAgent(BaseAgent):
    """Agent specialized in detecting chemical and biological hazards"""
    
    def __init__(self):
        super().__init__("hazard_detector")
        self.gemini_service = GeminiService()
        self.hazard_indicators = {
            'chemical': [
                'chemical containers', 'laboratory glassware', 'fume hoods',
                'chemical storage', 'reaction vessels', 'distillation equipment',
                'precursor chemicals', 'unusual odors', 'discoloration'
            ],
            'biological': [
                'bioreactors', 'fermentation equipment', 'cell cultures',
                'biological samples', 'containment equipment', 'lab animals',
                'biosafety cabinets', 'sterilization equipment'
            ],
            'general': [
                'protective equipment', 'ventilation systems', 'safety signs',
                'emergency equipment', 'waste containers', 'decontamination areas'
            ]
        }
        
    def analyze(self, scene_data: Dict[str, Any]) -> AgentResult:
        """Analyze scene for chemical and biological hazards"""
        if not self.validate_input(scene_data):
            return self._create_error_result("Invalid input data")
            
        try:
            # Analyze image with Gemini for hazard detection
            hazard_analysis = self._analyze_hazards(scene_data)
            
            # Extract specific hazard indicators
            chemical_hazards = self._detect_chemical_hazards(hazard_analysis)
            biological_hazards = self._detect_biological_hazards(hazard_analysis)
            
            # Combine findings
            findings = chemical_hazards['findings'] + biological_hazards['findings']
            recommendations = self._generate_recommendations(chemical_hazards, biological_hazards)
            
            # Calculate overall confidence
            indicators = chemical_hazards['indicators'] + biological_hazards['indicators']
            confidence = self.calculate_confidence(indicators)
            
            # Determine hazard level
            risk_factors = [f for f in findings if any(keyword in f.lower() for keyword in ['toxic', 'explosive', 'corrosive', 'infectious'])]
            hazard_level = self.determine_hazard_level(confidence, risk_factors)
            
            reasoning = self._build_reasoning(chemical_hazards, biological_hazards, confidence)
            
            return AgentResult(
                agent_name=self.name,
                confidence=confidence,
                findings=findings,
                recommendations=recommendations,
                hazard_level=hazard_level,
                metadata={
                    'chemical_hazards': chemical_hazards,
                    'biological_hazards': biological_hazards,
                    'detection_methods': ['visual_analysis', 'pattern_recognition']
                },
                reasoning=reasoning
            )
            
        except Exception as e:
            self.logger.error(f"Error in hazard analysis: {str(e)}")
            return self._create_error_result(f"Analysis failed: {str(e)}")
            
    def _analyze_hazards(self, scene_data: Dict[str, Any]) -> str:
        """Use Gemini to analyze the scene for hazards"""
        prompt = """
        Analyze this scene for chemical and biological hazards. Look for:
        
        CHEMICAL HAZARDS:
        - Laboratory equipment (glassware, reactors, distillation setups)
        - Chemical containers and storage
        - Precursor chemicals for illicit synthesis
        - Signs of chemical reactions or processes
        - Protective equipment indicating hazardous materials
        
        BIOLOGICAL HAZARDS:
        - Biological containment equipment
        - Cell culture apparatus
        - Fermentation or bioreactor systems
        - Biological samples or specimens
        - Biosafety equipment
        
        ENVIRONMENTAL INDICATORS:
        - Ventilation systems
        - Safety signage
        - Waste disposal areas
        - Decontamination zones
        
        Provide detailed observations about potential hazards, their locations, and severity indicators.
        """
        
        if scene_data.get('image_data'):
            return self.gemini_service.analyze_image_with_prompt(
                scene_data['image_data'], prompt
            )
        else:
            return "No image data available for analysis"
            
    def _detect_chemical_hazards(self, analysis_text: str) -> Dict[str, Any]:
        """Extract chemical hazard information from analysis"""
        findings = []
        indicators = []
        
        analysis_lower = analysis_text.lower()
        
        for indicator in self.hazard_indicators['chemical']:
            if indicator in analysis_lower:
                findings.append(f"Chemical hazard indicator detected: {indicator}")
                indicators.append({
                    'type': 'chemical',
                    'indicator': indicator,
                    'confidence': 0.7,
                    'weight': 1.0
                })
        
        # Look for high-risk chemical terms
        high_risk_terms = ['explosive', 'toxic', 'corrosive', 'flammable', 'oxidizer']
        for term in high_risk_terms:
            if term in analysis_lower:
                findings.append(f"High-risk chemical hazard: {term}")
                indicators.append({
                    'type': 'chemical_high_risk',
                    'indicator': term,
                    'confidence': 0.9,
                    'weight': 2.0
                })
        
        return {
            'findings': findings,
            'indicators': indicators,
            'hazard_count': len(findings)
        }
        
    def _detect_biological_hazards(self, analysis_text: str) -> Dict[str, Any]:
        """Extract biological hazard information from analysis"""
        findings = []
        indicators = []
        
        analysis_lower = analysis_text.lower()
        
        for indicator in self.hazard_indicators['biological']:
            if indicator in analysis_lower:
                findings.append(f"Biological hazard indicator detected: {indicator}")
                indicators.append({
                    'type': 'biological',
                    'indicator': indicator,
                    'confidence': 0.7,
                    'weight': 1.0
                })
        
        # Look for high-risk biological terms
        high_risk_terms = ['infectious', 'pathogen', 'culture', 'containment']
        for term in high_risk_terms:
            if term in analysis_lower:
                findings.append(f"High-risk biological hazard: {term}")
                indicators.append({
                    'type': 'biological_high_risk',
                    'indicator': term,
                    'confidence': 0.9,
                    'weight': 2.0
                })
        
        return {
            'findings': findings,
            'indicators': indicators,
            'hazard_count': len(findings)
        }
        
    def _generate_recommendations(self, chemical_hazards: Dict[str, Any], 
                                biological_hazards: Dict[str, Any]) -> List[str]:
        """Generate safety recommendations based on detected hazards"""
        recommendations = []
        
        if chemical_hazards['hazard_count'] > 0:
            recommendations.extend([
                "Implement chemical containment protocols",
                "Use appropriate chemical PPE (respirators, chemical suits)",
                "Establish decontamination procedures",
                "Monitor for chemical vapors and gases"
            ])
            
        if biological_hazards['hazard_count'] > 0:
            recommendations.extend([
                "Implement biological containment protocols",
                "Use appropriate biological PPE (biosafety equipment)",
                "Establish biological decontamination procedures",
                "Monitor for biological aerosols"
            ])
            
        # General recommendations
        recommendations.extend([
            "Establish safety perimeter",
            "Implement entry/exit controls",
            "Document all hazard locations",
            "Coordinate with specialized response teams"
        ])
        
        return recommendations
        
    def _build_reasoning(self, chemical_hazards: Dict[str, Any], 
                        biological_hazards: Dict[str, Any], confidence: float) -> str:
        """Build reasoning explanation for the analysis"""
        reasoning_parts = []
        
        if chemical_hazards['hazard_count'] > 0:
            reasoning_parts.append(
                f"Chemical hazards detected based on {chemical_hazards['hazard_count']} indicators"
            )
            
        if biological_hazards['hazard_count'] > 0:
            reasoning_parts.append(
                f"Biological hazards detected based on {biological_hazards['hazard_count']} indicators"
            )
            
        reasoning_parts.append(f"Overall confidence: {confidence:.2f}")
        
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
