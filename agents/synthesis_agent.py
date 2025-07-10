import logging
from typing import Dict, Any, List
from agents.base_agent import BaseAgent, AgentResult
from services.gemini_service import GeminiService

class SynthesisAnalysisAgent(BaseAgent):
    """Agent specialized in analyzing chemical synthesis operations"""
    
    def __init__(self):
        super().__init__("synthesis_analyzer")
        self.gemini_service = GeminiService()
        self.synthesis_indicators = {
            'equipment': [
                'round bottom flasks', 'distillation columns', 'rotary evaporators',
                'reflux condensers', 'heating mantles', 'magnetic stirrers',
                'separatory funnels', 'vacuum pumps', 'reaction vessels'
            ],
            'precursors': [
                'acetone', 'toluene', 'benzene', 'methanol', 'ethanol',
                'sulfuric acid', 'hydrochloric acid', 'sodium hydroxide',
                'red phosphorus', 'iodine', 'lithium', 'anhydrous ammonia'
            ],
            'processes': [
                'crystallization', 'purification', 'extraction', 'filtration',
                'distillation', 'evaporation', 'precipitation', 'reduction'
            ],
            'illicit_indicators': [
                'clandestine lab', 'drug manufacturing', 'illicit synthesis',
                'precursor diversion', 'waste disposal', 'chemical waste'
            ]
        }
        
    def analyze(self, scene_data: Dict[str, Any]) -> AgentResult:
        """Analyze scene for chemical synthesis operations"""
        if not self.validate_input(scene_data):
            return self._create_error_result("Invalid input data")
            
        try:
            # Analyze image with Gemini for synthesis indicators
            synthesis_analysis = self._analyze_synthesis_operation(scene_data)
            
            # Extract synthesis indicators
            equipment_found = self._detect_synthesis_equipment(synthesis_analysis)
            precursors_found = self._detect_precursor_chemicals(synthesis_analysis)
            processes_found = self._detect_synthesis_processes(synthesis_analysis)
            illicit_indicators = self._detect_illicit_indicators(synthesis_analysis)
            
            # Combine findings
            findings = (equipment_found['findings'] + precursors_found['findings'] + 
                       processes_found['findings'] + illicit_indicators['findings'])
                       
            recommendations = self._generate_synthesis_recommendations(
                equipment_found, precursors_found, processes_found, illicit_indicators
            )
            
            # Calculate overall confidence
            all_indicators = (equipment_found['indicators'] + precursors_found['indicators'] + 
                            processes_found['indicators'] + illicit_indicators['indicators'])
            confidence = self.calculate_confidence(all_indicators)
            
            # Determine synthesis threat level
            threat_level = self._determine_synthesis_threat(confidence, illicit_indicators)
            
            reasoning = self._build_synthesis_reasoning(
                equipment_found, precursors_found, processes_found, illicit_indicators, confidence
            )
            
            return AgentResult(
                agent_name=self.name,
                confidence=confidence,
                findings=findings,
                recommendations=recommendations,
                hazard_level=threat_level,
                metadata={
                    'equipment_detected': equipment_found,
                    'precursors_detected': precursors_found,
                    'processes_detected': processes_found,
                    'illicit_indicators': illicit_indicators,
                    'synthesis_complexity': self._assess_complexity(equipment_found, processes_found)
                },
                reasoning=reasoning
            )
            
        except Exception as e:
            self.logger.error(f"Error in synthesis analysis: {str(e)}")
            return self._create_error_result(f"Analysis failed: {str(e)}")
            
    def _analyze_synthesis_operation(self, scene_data: Dict[str, Any]) -> str:
        """Use Gemini to analyze the scene for synthesis operations"""
        prompt = """
        Analyze this scene for chemical synthesis operations. Look for:
        
        SYNTHESIS EQUIPMENT:
        - Laboratory glassware (round bottom flasks, condensers, separatory funnels)
        - Heating and cooling equipment
        - Distillation and purification apparatus
        - Reaction vessels and stirring equipment
        - Vacuum systems and pumps
        
        PRECURSOR CHEMICALS:
        - Chemical containers and labeling
        - Solvent bottles and storage
        - Acid and base containers
        - Reagent bottles and chemicals
        - Bulk chemical storage
        
        SYNTHESIS PROCESSES:
        - Active reactions or setups
        - Purification operations
        - Crystallization or precipitation
        - Distillation or extraction processes
        - Waste products or byproducts
        
        ILLICIT INDICATORS:
        - Improvised or makeshift equipment
        - Unusual chemical combinations
        - Improper ventilation or safety
        - Suspicious waste disposal
        - Concealed or hidden operations
        
        Provide detailed observations about the synthesis operation, equipment sophistication, and potential products.
        """
        
        if scene_data.get('image_data'):
            return self.gemini_service.analyze_image_with_prompt(
                scene_data['image_data'], prompt
            )
        else:
            return "No image data available for analysis"
            
    def _detect_synthesis_equipment(self, analysis_text: str) -> Dict[str, Any]:
        """Extract synthesis equipment information from analysis"""
        findings = []
        indicators = []
        
        analysis_lower = analysis_text.lower()
        
        for equipment in self.synthesis_indicators['equipment']:
            if equipment in analysis_lower:
                findings.append(f"Synthesis equipment detected: {equipment}")
                indicators.append({
                    'type': 'equipment',
                    'indicator': equipment,
                    'confidence': 0.8,
                    'weight': 1.0
                })
        
        return {
            'findings': findings,
            'indicators': indicators,
            'equipment_count': len(findings)
        }
        
    def _detect_precursor_chemicals(self, analysis_text: str) -> Dict[str, Any]:
        """Extract precursor chemical information from analysis"""
        findings = []
        indicators = []
        
        analysis_lower = analysis_text.lower()
        
        for precursor in self.synthesis_indicators['precursors']:
            if precursor in analysis_lower:
                findings.append(f"Precursor chemical detected: {precursor}")
                indicators.append({
                    'type': 'precursor',
                    'indicator': precursor,
                    'confidence': 0.9,
                    'weight': 1.5
                })
        
        return {
            'findings': findings,
            'indicators': indicators,
            'precursor_count': len(findings)
        }
        
    def _detect_synthesis_processes(self, analysis_text: str) -> Dict[str, Any]:
        """Extract synthesis process information from analysis"""
        findings = []
        indicators = []
        
        analysis_lower = analysis_text.lower()
        
        for process in self.synthesis_indicators['processes']:
            if process in analysis_lower:
                findings.append(f"Synthesis process detected: {process}")
                indicators.append({
                    'type': 'process',
                    'indicator': process,
                    'confidence': 0.7,
                    'weight': 1.0
                })
        
        return {
            'findings': findings,
            'indicators': indicators,
            'process_count': len(findings)
        }
        
    def _detect_illicit_indicators(self, analysis_text: str) -> Dict[str, Any]:
        """Extract illicit synthesis indicators from analysis"""
        findings = []
        indicators = []
        
        analysis_lower = analysis_text.lower()
        
        for indicator in self.synthesis_indicators['illicit_indicators']:
            if indicator in analysis_lower:
                findings.append(f"Illicit synthesis indicator: {indicator}")
                indicators.append({
                    'type': 'illicit',
                    'indicator': indicator,
                    'confidence': 0.95,
                    'weight': 3.0
                })
        
        return {
            'findings': findings,
            'indicators': indicators,
            'illicit_count': len(findings)
        }
        
    def _assess_complexity(self, equipment_found: Dict[str, Any], 
                          processes_found: Dict[str, Any]) -> str:
        """Assess the complexity of the synthesis operation"""
        equipment_count = equipment_found['equipment_count']
        process_count = processes_found['process_count']
        
        if equipment_count >= 5 and process_count >= 3:
            return "HIGH_COMPLEXITY"
        elif equipment_count >= 3 and process_count >= 2:
            return "MEDIUM_COMPLEXITY"
        elif equipment_count >= 1 or process_count >= 1:
            return "LOW_COMPLEXITY"
        else:
            return "MINIMAL"
            
    def _determine_synthesis_threat(self, confidence: float, 
                                   illicit_indicators: Dict[str, Any]) -> str:
        """Determine synthesis threat level"""
        if illicit_indicators['illicit_count'] > 0 and confidence >= 0.8:
            return "CRITICAL"
        elif illicit_indicators['illicit_count'] > 0 or confidence >= 0.7:
            return "HIGH"
        elif confidence >= 0.5:
            return "MODERATE"
        else:
            return "LOW"
            
    def _generate_synthesis_recommendations(self, equipment_found: Dict[str, Any],
                                          precursors_found: Dict[str, Any],
                                          processes_found: Dict[str, Any],
                                          illicit_indicators: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on synthesis analysis"""
        recommendations = []
        
        if equipment_found['equipment_count'] > 0:
            recommendations.extend([
                "Document all synthesis equipment and configurations",
                "Collect samples from reaction vessels and equipment",
                "Photograph equipment setup and connections"
            ])
            
        if precursors_found['precursor_count'] > 0:
            recommendations.extend([
                "Secure and catalog all precursor chemicals",
                "Test chemical containers for identification",
                "Document chemical storage and quantities"
            ])
            
        if processes_found['process_count'] > 0:
            recommendations.extend([
                "Analyze active reactions and processes",
                "Collect process waste and byproducts",
                "Document process flow and methodology"
            ])
            
        if illicit_indicators['illicit_count'] > 0:
            recommendations.extend([
                "Implement enhanced security protocols",
                "Coordinate with specialized investigation teams",
                "Preserve evidence for prosecution",
                "Analyze for controlled substance production"
            ])
            
        return recommendations
        
    def _build_synthesis_reasoning(self, equipment_found: Dict[str, Any],
                                  precursors_found: Dict[str, Any],
                                  processes_found: Dict[str, Any],
                                  illicit_indicators: Dict[str, Any],
                                  confidence: float) -> str:
        """Build reasoning explanation for synthesis analysis"""
        reasoning_parts = []
        
        if equipment_found['equipment_count'] > 0:
            reasoning_parts.append(
                f"Synthesis equipment detected: {equipment_found['equipment_count']} items"
            )
            
        if precursors_found['precursor_count'] > 0:
            reasoning_parts.append(
                f"Precursor chemicals identified: {precursors_found['precursor_count']} types"
            )
            
        if processes_found['process_count'] > 0:
            reasoning_parts.append(
                f"Active synthesis processes: {processes_found['process_count']} detected"
            )
            
        if illicit_indicators['illicit_count'] > 0:
            reasoning_parts.append(
                f"Illicit indicators present: {illicit_indicators['illicit_count']} found"
            )
            
        reasoning_parts.append(f"Analysis confidence: {confidence:.2f}")
        
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
