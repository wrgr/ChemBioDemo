import logging
from typing import Dict, Any, List
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

from agents.hazard_agent import HazardDetectionAgent
from agents.synthesis_agent import SynthesisAnalysisAgent
from agents.mopp_agent import MOPPRecommendationAgent
from agents.sampling_agent import SamplingStrategyAgent
from agents.base_agent import AgentResult

class AgentCoordinator:
    """Coordinates multiple agents for comprehensive scene analysis"""
    
    def __init__(self):
        self.logger = logging.getLogger("coordinator")
        self.agents = {
            'hazard_detector': HazardDetectionAgent(),
            'synthesis_analyzer': SynthesisAnalysisAgent(),
            'mopp_recommender': MOPPRecommendationAgent(),
            'sampling_strategist': SamplingStrategyAgent()
        }
        
    def analyze_scene(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """Coordinate analysis across all agents"""
        start_time = time.time()
        
        try:
            # Run all agents in parallel
            agent_results = self._run_agents_parallel(scene_data)
            
            # Synthesize results
            synthesis = self._synthesize_results(agent_results)
            
            # Generate unified recommendations
            unified_recommendations = self._generate_unified_recommendations(agent_results)
            
            # Calculate overall assessment
            overall_assessment = self._calculate_overall_assessment(agent_results)
            
            analysis_time = time.time() - start_time
            
            return {
                'timestamp': time.time(),
                'analysis_duration': analysis_time,
                'agent_results': agent_results,
                'synthesis': synthesis,
                'unified_recommendations': unified_recommendations,
                'overall_assessment': overall_assessment,
                'coordination_metadata': {
                    'agents_used': list(self.agents.keys()),
                    'successful_analyses': len([r for r in agent_results.values() if r.confidence > 0]),
                    'failed_analyses': len([r for r in agent_results.values() if r.confidence == 0])
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error in scene analysis coordination: {str(e)}")
            return self._create_error_response(str(e))
            
    def _run_agents_parallel(self, scene_data: Dict[str, Any]) -> Dict[str, AgentResult]:
        """Run all agents in parallel for efficiency"""
        agent_results = {}
        
        with ThreadPoolExecutor(max_workers=4) as executor:
            # Submit all agent tasks
            future_to_agent = {
                executor.submit(agent.analyze, scene_data): agent_name
                for agent_name, agent in self.agents.items()
            }
            
            # Collect results as they complete
            for future in as_completed(future_to_agent):
                agent_name = future_to_agent[future]
                try:
                    result = future.result(timeout=30)  # 30 second timeout per agent
                    agent_results[agent_name] = result
                    self.logger.info(f"Agent {agent_name} completed analysis with confidence {result.confidence}")
                except Exception as e:
                    self.logger.error(f"Agent {agent_name} failed: {str(e)}")
                    agent_results[agent_name] = self._create_agent_error_result(agent_name, str(e))
                    
        return agent_results
        
    def _synthesize_results(self, agent_results: Dict[str, AgentResult]) -> Dict[str, Any]:
        """Synthesize findings across all agents"""
        synthesis = {
            'consensus_findings': [],
            'conflicting_findings': [],
            'smoking_guns': [],
            'confidence_distribution': {},
            'hazard_level_consensus': 'UNKNOWN',
            'key_insights': []
        }
        
        # Analyze confidence distribution
        for agent_name, result in agent_results.items():
            synthesis['confidence_distribution'][agent_name] = result.confidence
            
        # Find consensus findings (mentioned by multiple agents)
        all_findings = []
        for result in agent_results.values():
            all_findings.extend(result.findings)
            
        finding_counts = {}
        for finding in all_findings:
            # Simple keyword matching for consensus
            key_words = set(finding.lower().split())
            for counted_finding, count in finding_counts.items():
                if len(key_words.intersection(set(counted_finding.lower().split()))) >= 2:
                    finding_counts[counted_finding] += 1
                    break
            else:
                finding_counts[finding] = 1
                
        # Consensus findings (mentioned by 2+ agents)
        synthesis['consensus_findings'] = [
            finding for finding, count in finding_counts.items() if count >= 2
        ]
        
        # Identify smoking guns (high confidence + critical findings)
        for agent_name, result in agent_results.items():
            if result.confidence >= 0.8 and result.hazard_level in ['CRITICAL', 'HIGH']:
                for finding in result.findings:
                    if any(keyword in finding.lower() for keyword in 
                          ['explosive', 'toxic', 'illegal', 'clandestine', 'illicit']):
                        synthesis['smoking_guns'].append({
                            'agent': agent_name,
                            'finding': finding,
                            'confidence': result.confidence
                        })
                        
        # Determine hazard level consensus
        hazard_levels = [result.hazard_level for result in agent_results.values()]
        hazard_priority = {'CRITICAL': 4, 'HIGH': 3, 'MODERATE': 2, 'LOW': 1, 'MINIMAL': 0, 'UNKNOWN': 0}
        
        if hazard_levels:
            max_hazard = max(hazard_levels, key=lambda x: hazard_priority.get(x, 0))
            synthesis['hazard_level_consensus'] = max_hazard
            
        # Generate key insights
        synthesis['key_insights'] = self._generate_key_insights(agent_results)
        
        return synthesis
        
    def _generate_unified_recommendations(self, agent_results: Dict[str, AgentResult]) -> List[str]:
        """Generate unified recommendations combining all agent outputs"""
        unified_recommendations = []
        
        # Collect all recommendations
        all_recommendations = []
        for result in agent_results.values():
            all_recommendations.extend(result.recommendations)
            
        # Prioritize recommendations
        priority_keywords = {
            'immediate': ['immediate', 'emergency', 'critical', 'urgent'],
            'safety': ['safety', 'protective', 'decontamination', 'hazard'],
            'operational': ['coordinate', 'establish', 'implement', 'monitor'],
            'documentation': ['document', 'record', 'photograph', 'catalog']
        }
        
        categorized_recommendations = {
            'immediate': [],
            'safety': [],
            'operational': [],
            'documentation': []
        }
        
        for recommendation in all_recommendations:
            rec_lower = recommendation.lower()
            categorized = False
            
            for category, keywords in priority_keywords.items():
                if any(keyword in rec_lower for keyword in keywords):
                    if recommendation not in categorized_recommendations[category]:
                        categorized_recommendations[category].append(recommendation)
                    categorized = True
                    break
                    
            if not categorized:
                if recommendation not in categorized_recommendations['operational']:
                    categorized_recommendations['operational'].append(recommendation)
                    
        # Build unified list in priority order
        for category in ['immediate', 'safety', 'operational', 'documentation']:
            if categorized_recommendations[category]:
                unified_recommendations.append(f"=== {category.upper()} ACTIONS ===")
                unified_recommendations.extend(categorized_recommendations[category])
                
        return unified_recommendations
        
    def _calculate_overall_assessment(self, agent_results: Dict[str, AgentResult]) -> Dict[str, Any]:
        """Calculate overall assessment of the scene"""
        assessment = {
            'overall_confidence': 0.0,
            'threat_level': 'UNKNOWN',
            'operation_type': 'UNKNOWN',
            'immediate_actions_required': False,
            'specialist_teams_needed': [],
            'summary': ''
        }
        
        # Calculate overall confidence (weighted average)
        weights = {
            'hazard_detector': 1.5,
            'synthesis_analyzer': 1.5,
            'mopp_recommender': 1.0,
            'sampling_strategist': 1.0
        }
        
        total_weighted_confidence = 0
        total_weight = 0
        
        for agent_name, result in agent_results.items():
            weight = weights.get(agent_name, 1.0)
            total_weighted_confidence += result.confidence * weight
            total_weight += weight
            
        if total_weight > 0:
            assessment['overall_confidence'] = total_weighted_confidence / total_weight
            
        # Determine threat level (highest from all agents)
        threat_levels = [result.hazard_level for result in agent_results.values()]
        threat_priority = {'CRITICAL': 4, 'HIGH': 3, 'MODERATE': 2, 'LOW': 1, 'MINIMAL': 0, 'UNKNOWN': 0}
        
        if threat_levels:
            assessment['threat_level'] = max(threat_levels, key=lambda x: threat_priority.get(x, 0))
            
        # Determine operation type based on synthesis agent
        synthesis_result = agent_results.get('synthesis_analyzer')
        if synthesis_result and synthesis_result.confidence > 0.6:
            if synthesis_result.hazard_level in ['CRITICAL', 'HIGH']:
                assessment['operation_type'] = 'ILLICIT_SYNTHESIS'
            else:
                assessment['operation_type'] = 'CHEMICAL_OPERATION'
        elif agent_results.get('hazard_detector') and agent_results['hazard_detector'].confidence > 0.6:
            assessment['operation_type'] = 'HAZARDOUS_MATERIALS'
        else:
            assessment['operation_type'] = 'UNKNOWN'
            
        # Determine if immediate actions are required
        assessment['immediate_actions_required'] = (
            assessment['threat_level'] in ['CRITICAL', 'HIGH'] or
            assessment['overall_confidence'] >= 0.8
        )
        
        # Determine specialist teams needed
        if assessment['threat_level'] in ['CRITICAL', 'HIGH']:
            assessment['specialist_teams_needed'].extend(['HAZMAT', 'EOD'])
            
        if assessment['operation_type'] == 'ILLICIT_SYNTHESIS':
            assessment['specialist_teams_needed'].extend(['DEA', 'Forensics'])
            
        if agent_results.get('mopp_recommender') and agent_results['mopp_recommender'].metadata.get('mopp_level', 0) >= 3:
            assessment['specialist_teams_needed'].append('CBRN')
            
        # Generate summary
        assessment['summary'] = self._generate_assessment_summary(assessment, agent_results)
        
        return assessment
        
    def _generate_key_insights(self, agent_results: Dict[str, AgentResult]) -> List[str]:
        """Generate key insights from agent analysis"""
        insights = []
        
        # High confidence insights
        for agent_name, result in agent_results.items():
            if result.confidence >= 0.8:
                insights.append(f"High confidence from {agent_name}: {result.hazard_level} threat level")
                
        # Consensus insights
        hazard_levels = [result.hazard_level for result in agent_results.values()]
        if len(set(hazard_levels)) == 1 and hazard_levels[0] != 'UNKNOWN':
            insights.append(f"All agents agree on {hazard_levels[0]} threat level")
            
        # Specific agent insights
        synthesis_result = agent_results.get('synthesis_analyzer')
        if synthesis_result and synthesis_result.confidence > 0.7:
            complexity = synthesis_result.metadata.get('synthesis_complexity', 'UNKNOWN')
            insights.append(f"Synthesis operation complexity: {complexity}")
            
        mopp_result = agent_results.get('mopp_recommender')
        if mopp_result and mopp_result.confidence > 0.7:
            mopp_level = mopp_result.metadata.get('mopp_level', 0)
            insights.append(f"MOPP Level {mopp_level} recommended")
            
        return insights
        
    def _generate_assessment_summary(self, assessment: Dict[str, Any], 
                                   agent_results: Dict[str, AgentResult]) -> str:
        """Generate a comprehensive assessment summary"""
        summary_parts = []
        
        summary_parts.append(f"Threat Level: {assessment['threat_level']}")
        summary_parts.append(f"Operation Type: {assessment['operation_type']}")
        summary_parts.append(f"Overall Confidence: {assessment['overall_confidence']:.2f}")
        
        if assessment['immediate_actions_required']:
            summary_parts.append("IMMEDIATE ACTIONS REQUIRED")
            
        if assessment['specialist_teams_needed']:
            summary_parts.append(f"Specialist Teams: {', '.join(assessment['specialist_teams_needed'])}")
            
        # Add agent-specific summary points
        for agent_name, result in agent_results.items():
            if result.confidence > 0.7:
                summary_parts.append(f"{agent_name}: {result.hazard_level} ({result.confidence:.2f})")
                
        return " | ".join(summary_parts)
        
    def _create_agent_error_result(self, agent_name: str, error_message: str) -> AgentResult:
        """Create an error result for a failed agent"""
        return AgentResult(
            agent_name=agent_name,
            confidence=0.0,
            findings=[f"Agent {agent_name} failed: {error_message}"],
            recommendations=[f"Retry {agent_name} analysis"],
            hazard_level="UNKNOWN",
            metadata={'error': error_message},
            reasoning=f"Agent {agent_name} analysis failed: {error_message}"
        )
        
    def _create_error_response(self, error_message: str) -> Dict[str, Any]:
        """Create an error response for coordination failure"""
        return {
            'timestamp': time.time(),
            'analysis_duration': 0,
            'error': error_message,
            'agent_results': {},
            'synthesis': {'error': error_message},
            'unified_recommendations': [f"Error in analysis coordination: {error_message}"],
            'overall_assessment': {
                'overall_confidence': 0.0,
                'threat_level': 'UNKNOWN',
                'operation_type': 'UNKNOWN',
                'immediate_actions_required': False,
                'specialist_teams_needed': [],
                'summary': f"Analysis failed: {error_message}"
            }
        }
