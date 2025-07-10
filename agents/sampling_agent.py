import logging
from typing import Dict, Any, List
from agents.base_agent import BaseAgent, AgentResult
from services.gemini_service import GeminiService

class SamplingStrategyAgent(BaseAgent):
    """Agent specialized in providing sampling strategy recommendations"""
    
    def __init__(self):
        super().__init__("sampling_strategist")
        self.gemini_service = GeminiService()
        self.sampling_priorities = {
            'critical': {
                'priority': 1,
                'samples': ['Active reaction products', 'Leaking containers', 'Vapor sources', 'Contaminated surfaces'],
                'equipment': ['Level A suit', 'Self-contained breathing apparatus', 'Chemical-resistant gloves'],
                'urgency': 'immediate'
            },
            'high': {
                'priority': 2,
                'samples': ['Precursor chemicals', 'Intermediate products', 'Waste materials', 'Unknown substances'],
                'equipment': ['Level B suit', 'Air-purifying respirator', 'Chemical-resistant clothing'],
                'urgency': 'within 1 hour'
            },
            'medium': {
                'priority': 3,
                'samples': ['Final products', 'Cleaning solutions', 'Equipment residues', 'Environmental samples'],
                'equipment': ['Level C suit', 'Full-face respirator', 'Disposable gloves'],
                'urgency': 'within 4 hours'
            },
            'low': {
                'priority': 4,
                'samples': ['Reference materials', 'Comparison samples', 'Background samples', 'Documentation'],
                'equipment': ['Standard PPE', 'Half-face respirator', 'Safety glasses'],
                'urgency': 'within 24 hours'
            }
        }
        
    def analyze(self, scene_data: Dict[str, Any]) -> AgentResult:
        """Analyze scene and provide sampling strategy recommendations"""
        if not self.validate_input(scene_data):
            return self._create_error_result("Invalid input data")
            
        try:
            # Analyze sampling targets
            sampling_analysis = self._analyze_sampling_targets(scene_data)
            
            # Identify sampling priorities
            priority_targets = self._identify_priority_targets(sampling_analysis)
            
            # Generate sampling strategy
            sampling_strategy = self._generate_sampling_strategy(priority_targets)
            
            # Assess sampling risks
            risk_assessment = self._assess_sampling_risks(sampling_analysis)
            
            # Generate recommendations
            recommendations = self._generate_sampling_recommendations(
                sampling_strategy, risk_assessment
            )
            
            # Calculate confidence
            confidence = self._calculate_sampling_confidence(priority_targets, risk_assessment)
            
            # Determine hazard level
            hazard_level = self._determine_sampling_hazard_level(risk_assessment)
            
            reasoning = self._build_sampling_reasoning(
                priority_targets, risk_assessment, confidence
            )
            
            findings = self._generate_sampling_findings(priority_targets, risk_assessment)
            
            return AgentResult(
                agent_name=self.name,
                confidence=confidence,
                findings=findings,
                recommendations=recommendations,
                hazard_level=hazard_level,
                metadata={
                    'sampling_strategy': sampling_strategy,
                    'priority_targets': priority_targets,
                    'risk_assessment': risk_assessment,
                    'sampling_sequence': self._create_sampling_sequence(priority_targets)
                },
                reasoning=reasoning
            )
            
        except Exception as e:
            self.logger.error(f"Error in sampling analysis: {str(e)}")
            return self._create_error_result(f"Analysis failed: {str(e)}")
            
    def _analyze_sampling_targets(self, scene_data: Dict[str, Any]) -> str:
        """Analyze the scene for sampling targets"""
        prompt = """
        Analyze this scene to identify sampling targets and priorities. Look for:
        
        CRITICAL SAMPLING TARGETS:
        - Active chemical reactions or processes
        - Leaking or damaged containers
        - Vapor sources or gas emissions
        - Contaminated surfaces or spills
        - Unknown substances requiring immediate identification
        
        HIGH PRIORITY TARGETS:
        - Precursor chemicals and reagents
        - Intermediate reaction products
        - Waste materials and byproducts
        - Suspicious or unlabeled containers
        
        MEDIUM PRIORITY TARGETS:
        - Final products and stored materials
        - Cleaning solutions and solvents
        - Equipment residues and deposits
        - Environmental samples (air, water, soil)
        
        LOW PRIORITY TARGETS:
        - Reference materials and controls
        - Comparison samples
        - Background environmental samples
        - Documentation and labeling
        
        SAMPLING CONSIDERATIONS:
        - Accessibility and safety of sampling locations
        - Potential for cross-contamination
        - Sample stability and degradation
        - Chain of custody requirements
        - Analytical method compatibility
        
        Provide detailed information about each sampling target, location, and recommended sampling approach.
        """
        
        if scene_data.get('image_data'):
            return self.gemini_service.analyze_image_with_prompt(
                scene_data['image_data'], prompt
            )
        else:
            return "No image data available for sampling analysis"
            
    def _identify_priority_targets(self, sampling_analysis: str) -> Dict[str, List[Dict[str, Any]]]:
        """Identify and categorize sampling targets by priority"""
        targets = {
            'critical': [],
            'high': [],
            'medium': [],
            'low': []
        }
        
        analysis_lower = sampling_analysis.lower()
        
        # Critical priority targets
        critical_indicators = [
            'active reaction', 'leaking', 'vapor', 'gas emission', 'spill',
            'contaminated surface', 'immediate identification', 'unknown substance'
        ]
        
        for indicator in critical_indicators:
            if indicator in analysis_lower:
                targets['critical'].append({
                    'target': indicator,
                    'location': 'scene dependent',
                    'urgency': 'immediate',
                    'risk_level': 'high'
                })
                
        # High priority targets
        high_indicators = [
            'precursor chemical', 'intermediate product', 'waste material',
            'suspicious container', 'unlabeled container', 'reagent'
        ]
        
        for indicator in high_indicators:
            if indicator in analysis_lower:
                targets['high'].append({
                    'target': indicator,
                    'location': 'scene dependent',
                    'urgency': 'within 1 hour',
                    'risk_level': 'medium'
                })
                
        # Medium priority targets
        medium_indicators = [
            'final product', 'stored material', 'cleaning solution',
            'equipment residue', 'environmental sample', 'solvent'
        ]
        
        for indicator in medium_indicators:
            if indicator in analysis_lower:
                targets['medium'].append({
                    'target': indicator,
                    'location': 'scene dependent',
                    'urgency': 'within 4 hours',
                    'risk_level': 'low'
                })
                
        # Low priority targets
        low_indicators = [
            'reference material', 'comparison sample', 'background sample',
            'documentation', 'control sample'
        ]
        
        for indicator in low_indicators:
            if indicator in analysis_lower:
                targets['low'].append({
                    'target': indicator,
                    'location': 'scene dependent',
                    'urgency': 'within 24 hours',
                    'risk_level': 'minimal'
                })
                
        return targets
        
    def _generate_sampling_strategy(self, priority_targets: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
        """Generate comprehensive sampling strategy"""
        strategy = {
            'sampling_sequence': [],
            'equipment_requirements': [],
            'safety_protocols': [],
            'analytical_methods': []
        }
        
        # Create sampling sequence based on priority
        for priority in ['critical', 'high', 'medium', 'low']:
            if priority_targets[priority]:
                priority_info = self.sampling_priorities[priority]
                strategy['sampling_sequence'].append({
                    'priority': priority,
                    'targets': priority_targets[priority],
                    'urgency': priority_info['urgency'],
                    'equipment': priority_info['equipment']
                })
                
        # Aggregate equipment requirements
        all_equipment = set()
        for priority in ['critical', 'high', 'medium', 'low']:
            if priority_targets[priority]:
                all_equipment.update(self.sampling_priorities[priority]['equipment'])
        strategy['equipment_requirements'] = list(all_equipment)
        
        # Define safety protocols
        strategy['safety_protocols'] = [
            'Establish sampling perimeter',
            'Implement decontamination procedures',
            'Monitor personnel exposure',
            'Maintain chain of custody',
            'Document sampling locations'
        ]
        
        # Define analytical methods
        strategy['analytical_methods'] = [
            'Gas chromatography-mass spectrometry (GC-MS)',
            'Liquid chromatography-mass spectrometry (LC-MS)',
            'Fourier transform infrared spectroscopy (FTIR)',
            'Nuclear magnetic resonance (NMR)',
            'X-ray fluorescence (XRF)',
            'Ion chromatography (IC)'
        ]
        
        return strategy
        
    def _assess_sampling_risks(self, sampling_analysis: str) -> Dict[str, Any]:
        """Assess risks associated with sampling operations"""
        risks = {
            'chemical_exposure': 'unknown',
            'cross_contamination': 'unknown',
            'sample_degradation': 'unknown',
            'access_difficulty': 'unknown',
            'overall_risk': 'unknown'
        }
        
        analysis_lower = sampling_analysis.lower()
        
        # Chemical exposure risk
        if any(term in analysis_lower for term in ['toxic', 'corrosive', 'volatile', 'hazardous']):
            risks['chemical_exposure'] = 'high'
        elif any(term in analysis_lower for term in ['chemical', 'reaction', 'solvent']):
            risks['chemical_exposure'] = 'medium'
        else:
            risks['chemical_exposure'] = 'low'
            
        # Cross-contamination risk
        if any(term in analysis_lower for term in ['multiple', 'mixed', 'contaminated']):
            risks['cross_contamination'] = 'high'
        else:
            risks['cross_contamination'] = 'medium'
            
        # Sample degradation risk
        if any(term in analysis_lower for term in ['unstable', 'reactive', 'degrading']):
            risks['sample_degradation'] = 'high'
        else:
            risks['sample_degradation'] = 'medium'
            
        # Access difficulty
        if any(term in analysis_lower for term in ['difficult', 'confined', 'elevated']):
            risks['access_difficulty'] = 'high'
        else:
            risks['access_difficulty'] = 'medium'
            
        # Overall risk assessment
        risk_scores = {
            'high': 3,
            'medium': 2,
            'low': 1,
            'unknown': 2
        }
        
        total_risk = sum(risk_scores[risk] for risk in risks.values() if risk != 'unknown')
        avg_risk = total_risk / (len(risks) - 1)  # Exclude overall_risk
        
        if avg_risk >= 2.5:
            risks['overall_risk'] = 'high'
        elif avg_risk >= 1.5:
            risks['overall_risk'] = 'medium'
        else:
            risks['overall_risk'] = 'low'
            
        return risks
        
    def _generate_sampling_recommendations(self, sampling_strategy: Dict[str, Any], 
                                         risk_assessment: Dict[str, Any]) -> List[str]:
        """Generate specific sampling recommendations"""
        recommendations = []
        
        # Priority-based recommendations
        if sampling_strategy['sampling_sequence']:
            recommendations.append("Follow prioritized sampling sequence:")
            for seq in sampling_strategy['sampling_sequence']:
                recommendations.append(f"  - {seq['priority'].upper()}: {seq['urgency']}")
                
        # Equipment recommendations
        if sampling_strategy['equipment_requirements']:
            recommendations.append("Required sampling equipment:")
            for equipment in sampling_strategy['equipment_requirements']:
                recommendations.append(f"  - {equipment}")
                
        # Risk-based recommendations
        if risk_assessment['chemical_exposure'] == 'high':
            recommendations.extend([
                "Implement maximum chemical protection protocols",
                "Use remote sampling techniques where possible",
                "Establish emergency decontamination procedures"
            ])
            
        if risk_assessment['cross_contamination'] == 'high':
            recommendations.extend([
                "Use dedicated sampling equipment for each target",
                "Implement strict decontamination between samples",
                "Collect blank samples for quality control"
            ])
            
        if risk_assessment['sample_degradation'] == 'high':
            recommendations.extend([
                "Minimize sample exposure time",
                "Use appropriate preservatives",
                "Transport samples under controlled conditions"
            ])
            
        # General recommendations
        recommendations.extend([
            "Document all sampling locations with photographs",
            "Maintain detailed chain of custody records",
            "Coordinate with analytical laboratory for method selection",
            "Implement quality assurance protocols"
        ])
        
        return recommendations
        
    def _calculate_sampling_confidence(self, priority_targets: Dict[str, List[Dict[str, Any]]],
                                     risk_assessment: Dict[str, Any]) -> float:
        """Calculate confidence in sampling strategy"""
        # Base confidence on number of identified targets
        total_targets = sum(len(targets) for targets in priority_targets.values())
        
        if total_targets == 0:
            return 0.2
        elif total_targets < 3:
            return 0.5
        elif total_targets < 6:
            return 0.7
        else:
            return 0.9
            
    def _determine_sampling_hazard_level(self, risk_assessment: Dict[str, Any]) -> str:
        """Determine hazard level for sampling operations"""
        if risk_assessment['overall_risk'] == 'high':
            return "HIGH"
        elif risk_assessment['overall_risk'] == 'medium':
            return "MODERATE"
        else:
            return "LOW"
            
    def _create_sampling_sequence(self, priority_targets: Dict[str, List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
        """Create detailed sampling sequence"""
        sequence = []
        
        for priority in ['critical', 'high', 'medium', 'low']:
            if priority_targets[priority]:
                priority_info = self.sampling_priorities[priority]
                sequence.append({
                    'step': len(sequence) + 1,
                    'priority': priority,
                    'targets': priority_targets[priority],
                    'equipment': priority_info['equipment'],
                    'urgency': priority_info['urgency'],
                    'estimated_duration': self._estimate_sampling_duration(priority_targets[priority])
                })
                
        return sequence
        
    def _estimate_sampling_duration(self, targets: List[Dict[str, Any]]) -> str:
        """Estimate sampling duration based on targets"""
        num_targets = len(targets)
        
        if num_targets <= 2:
            return "30-60 minutes"
        elif num_targets <= 5:
            return "1-2 hours"
        else:
            return "2-4 hours"
            
    def _generate_sampling_findings(self, priority_targets: Dict[str, List[Dict[str, Any]]],
                                   risk_assessment: Dict[str, Any]) -> List[str]:
        """Generate findings based on sampling analysis"""
        findings = []
        
        # Target-based findings
        for priority, targets in priority_targets.items():
            if targets:
                findings.append(f"{priority.upper()} priority targets identified: {len(targets)}")
                
        # Risk-based findings
        for risk_type, risk_level in risk_assessment.items():
            if risk_level == 'high':
                findings.append(f"High risk identified: {risk_type}")
                
        return findings
        
    def _build_sampling_reasoning(self, priority_targets: Dict[str, List[Dict[str, Any]]],
                                 risk_assessment: Dict[str, Any], confidence: float) -> str:
        """Build reasoning explanation for sampling strategy"""
        reasoning_parts = []
        
        # Target summary
        total_targets = sum(len(targets) for targets in priority_targets.values())
        reasoning_parts.append(f"Total sampling targets identified: {total_targets}")
        
        # Priority breakdown
        priority_counts = {priority: len(targets) for priority, targets in priority_targets.items() if targets}
        if priority_counts:
            priority_summary = ", ".join([f"{priority}: {count}" for priority, count in priority_counts.items()])
            reasoning_parts.append(f"Priority breakdown: {priority_summary}")
            
        # Risk summary
        high_risks = [risk_type for risk_type, risk_level in risk_assessment.items() if risk_level == 'high']
        if high_risks:
            reasoning_parts.append(f"High risks: {', '.join(high_risks)}")
            
        reasoning_parts.append(f"Strategy confidence: {confidence:.2f}")
        
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
