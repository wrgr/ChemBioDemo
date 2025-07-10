import logging
from typing import Dict, Any, List, Optional
import io
import base64
from PIL import Image
import cv2
import numpy as np
import time

from agents.coordinator import AgentCoordinator
from services.gemini_service import GeminiService
from services.vector_db import VectorDatabase
from models import SceneAnalysis, db

class AnalysisService:
    """Main service for coordinating ChemBio scene analysis"""
    
    def __init__(self):
        self.logger = logging.getLogger("analysis_service")
        self.coordinator = AgentCoordinator()
        self.gemini_service = GeminiService()
        self.vector_db = VectorDatabase()
        
    def analyze_scene(self, session_id: str, scene_data: Dict[str, Any], 
                     user_feedback: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Main method to analyze a scene with all available agents"""
        try:
            self.logger.info(f"Starting scene analysis for session {session_id}")
            
            # Preprocess scene data
            processed_data = self._preprocess_scene_data(scene_data)
            
            # Add contextual knowledge from RAG
            enhanced_data = self._enhance_with_rag_knowledge(processed_data)
            
            # Run coordinated agent analysis
            analysis_results = self.coordinator.analyze_scene(enhanced_data)
            
            # Generate supplementary analysis with Gemini
            supplementary_analysis = self._generate_supplementary_analysis(enhanced_data)
            
            # Combine results
            final_results = self._combine_analysis_results(
                analysis_results, supplementary_analysis, user_feedback
            )
            
            # Store results in database
            self._store_analysis_results(session_id, scene_data, final_results)
            
            self.logger.info(f"Scene analysis completed for session {session_id}")
            return final_results
            
        except Exception as e:
            self.logger.error(f"Error in scene analysis: {str(e)}")
            return self._create_error_response(str(e))
            
    def _preprocess_scene_data(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """Preprocess scene data for analysis"""
        processed_data = scene_data.copy()
        
        # Handle image data
        if 'image_file' in scene_data:
            image_data = self._process_image_file(scene_data['image_file'])
            processed_data['image_data'] = image_data
            
        # Handle video data
        if 'video_file' in scene_data:
            video_data = self._process_video_file(scene_data['video_file'])
            processed_data['video_data'] = video_data
            
        # Handle YouTube URL
        if 'youtube_url' in scene_data:
            youtube_analysis = self.gemini_service.extract_youtube_insights(scene_data['youtube_url'])
            processed_data['youtube_analysis'] = youtube_analysis
            
        # Add metadata
        processed_data['metadata'] = {
            'timestamp': time.time(),
            'data_types': [],
            'preprocessing_info': {}
        }
        
        if 'image_data' in processed_data:
            processed_data['metadata']['data_types'].append('image')
            
        if 'video_data' in processed_data:
            processed_data['metadata']['data_types'].append('video')
            
        if 'youtube_url' in processed_data:
            processed_data['metadata']['data_types'].append('youtube')
            
        return processed_data
        
    def _process_image_file(self, image_file) -> bytes:
        """Process uploaded image file"""
        try:
            # Read image file
            image_data = image_file.read()
            
            # Convert to PIL Image for processing
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
                
            # Resize if too large (max 2048x2048)
            max_size = 2048
            if image.width > max_size or image.height > max_size:
                image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                
            # Convert back to bytes
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=90)
            return output.getvalue()
            
        except Exception as e:
            self.logger.error(f"Error processing image: {str(e)}")
            return b''
            
    def _process_video_file(self, video_file) -> bytes:
        """Process uploaded video file"""
        try:
            # For now, just return the raw video data
            # In production, you might want to extract frames or compress
            return video_file.read()
            
        except Exception as e:
            self.logger.error(f"Error processing video: {str(e)}")
            return b''
            
    def _enhance_with_rag_knowledge(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance scene data with relevant knowledge from RAG database"""
        enhanced_data = scene_data.copy()
        
        # Generate initial context query
        context_query = self._generate_context_query(scene_data)
        
        # Search for relevant knowledge
        relevant_knowledge = self.vector_db.search_knowledge(context_query, limit=10)
        
        # Add knowledge to scene data
        enhanced_data['rag_knowledge'] = relevant_knowledge
        
        return enhanced_data
        
    def _generate_context_query(self, scene_data: Dict[str, Any]) -> str:
        """Generate a context query for RAG knowledge search"""
        query_parts = []
        
        # Add metadata context
        metadata = scene_data.get('metadata', {})
        if 'location' in metadata:
            query_parts.append(f"location: {metadata['location']}")
            
        if 'environment' in metadata:
            query_parts.append(f"environment: {metadata['environment']}")
            
        # Add data type context
        data_types = metadata.get('data_types', [])
        if 'image' in data_types:
            query_parts.append("visual scene analysis")
            
        if 'video' in data_types:
            query_parts.append("video surveillance analysis")
            
        # Default context
        if not query_parts:
            query_parts.append("chemical biological hazard analysis")
            
        return " ".join(query_parts)
        
    def _generate_supplementary_analysis(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate supplementary analysis using Gemini"""
        try:
            # Generate comprehensive scene analysis
            comprehensive_analysis = self.gemini_service.analyze_scene_comprehensively(scene_data)
            
            return {
                'comprehensive_analysis': comprehensive_analysis,
                'generation_time': time.time()
            }
            
        except Exception as e:
            self.logger.error(f"Error in supplementary analysis: {str(e)}")
            return {'error': str(e)}
            
    def _combine_analysis_results(self, agent_results: Dict[str, Any], 
                                supplementary_analysis: Dict[str, Any],
                                user_feedback: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Combine all analysis results into final output"""
        combined_results = {
            'timestamp': time.time(),
            'agent_analysis': agent_results,
            'supplementary_analysis': supplementary_analysis,
            'user_feedback': user_feedback,
            'tactical_summary': '',
            'command_briefing': '',
            'confidence_metrics': {},
            'actionable_intelligence': {},
            'alerts': []
        }
        
        # Generate tactical summary
        combined_results['tactical_summary'] = self.gemini_service.generate_tactical_summary(
            agent_results
        )
        
        # Generate command briefing
        combined_results['command_briefing'] = self.gemini_service.generate_command_briefing(
            agent_results
        )
        
        # Calculate confidence metrics
        combined_results['confidence_metrics'] = self._calculate_confidence_metrics(agent_results)
        
        # Generate actionable intelligence
        combined_results['actionable_intelligence'] = self._generate_actionable_intelligence(agent_results)
        
        # Generate alerts
        combined_results['alerts'] = self._generate_alerts(agent_results)
        
        return combined_results
        
    def _calculate_confidence_metrics(self, agent_results: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate confidence metrics for the analysis"""
        metrics = {
            'overall_confidence': 0.0,
            'agent_confidences': {},
            'consensus_score': 0.0,
            'reliability_rating': 'UNKNOWN'
        }
        
        if 'agent_results' in agent_results:
            agent_data = agent_results['agent_results']
            
            # Calculate individual agent confidences
            confidences = []
            for agent_name, result in agent_data.items():
                confidence = result.confidence
                metrics['agent_confidences'][agent_name] = confidence
                confidences.append(confidence)
                
            # Calculate overall confidence
            if confidences:
                metrics['overall_confidence'] = sum(confidences) / len(confidences)
                
            # Calculate consensus score (how much agents agree)
            if len(confidences) > 1:
                confidence_variance = np.var(confidences)
                metrics['consensus_score'] = max(0, 1 - confidence_variance)
            else:
                metrics['consensus_score'] = 1.0
                
            # Determine reliability rating
            if metrics['overall_confidence'] >= 0.8 and metrics['consensus_score'] >= 0.8:
                metrics['reliability_rating'] = 'HIGH'
            elif metrics['overall_confidence'] >= 0.6 and metrics['consensus_score'] >= 0.6:
                metrics['reliability_rating'] = 'MEDIUM'
            else:
                metrics['reliability_rating'] = 'LOW'
                
        return metrics
        
    def _generate_actionable_intelligence(self, agent_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate actionable intelligence from analysis results"""
        intelligence = {
            'immediate_actions': [],
            'tactical_priorities': [],
            'resource_requirements': [],
            'risk_mitigation': []
        }
        
        if 'overall_assessment' in agent_results:
            assessment = agent_results['overall_assessment']
            
            # Immediate actions
            if assessment.get('immediate_actions_required', False):
                intelligence['immediate_actions'].extend([
                    'Establish safety perimeter',
                    'Implement protective measures',
                    'Coordinate with specialized teams'
                ])
                
            # Tactical priorities
            threat_level = assessment.get('threat_level', 'UNKNOWN')
            if threat_level in ['CRITICAL', 'HIGH']:
                intelligence['tactical_priorities'].extend([
                    'Secure and contain threat',
                    'Evacuate non-essential personnel',
                    'Implement emergency protocols'
                ])
                
            # Resource requirements
            specialist_teams = assessment.get('specialist_teams_needed', [])
            if specialist_teams:
                intelligence['resource_requirements'].extend([
                    f'Request {team} team support' for team in specialist_teams
                ])
                
        return intelligence
        
    def _generate_alerts(self, agent_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate alerts based on analysis results"""
        alerts = []
        
        if 'overall_assessment' in agent_results:
            assessment = agent_results['overall_assessment']
            
            # Threat level alerts
            threat_level = assessment.get('threat_level', 'UNKNOWN')
            if threat_level == 'CRITICAL':
                alerts.append({
                    'level': 'CRITICAL',
                    'message': 'Critical threat detected - immediate action required',
                    'timestamp': time.time(),
                    'type': 'threat_level'
                })
            elif threat_level == 'HIGH':
                alerts.append({
                    'level': 'HIGH',
                    'message': 'High threat detected - enhanced precautions required',
                    'timestamp': time.time(),
                    'type': 'threat_level'
                })
                
            # Confidence alerts
            confidence = assessment.get('overall_confidence', 0.0)
            if confidence < 0.4:
                alerts.append({
                    'level': 'WARNING',
                    'message': 'Low confidence in analysis - additional data required',
                    'timestamp': time.time(),
                    'type': 'confidence'
                })
                
        return alerts
        
    def _store_analysis_results(self, session_id: str, scene_data: Dict[str, Any], 
                              analysis_results: Dict[str, Any]):
        """Store analysis results in database"""
        try:
            scene_analysis = SceneAnalysis(
                session_id=session_id,
                image_path=scene_data.get('image_path'),
                video_path=scene_data.get('video_path'),
                youtube_url=scene_data.get('youtube_url'),
                analysis_results=analysis_results,
                confidence_scores=analysis_results.get('confidence_metrics', {}),
                agent_outputs=analysis_results.get('agent_analysis', {})
            )
            
            db.session.add(scene_analysis)
            db.session.commit()
            
        except Exception as e:
            self.logger.error(f"Error storing analysis results: {str(e)}")
            db.session.rollback()
            
    def _create_error_response(self, error_message: str) -> Dict[str, Any]:
        """Create error response"""
        return {
            'timestamp': time.time(),
            'error': error_message,
            'status': 'error',
            'tactical_summary': f'Analysis failed: {error_message}',
            'command_briefing': f'Analysis error: {error_message}',
            'confidence_metrics': {'overall_confidence': 0.0},
            'actionable_intelligence': {'immediate_actions': ['Retry analysis']},
            'alerts': [{
                'level': 'ERROR',
                'message': f'Analysis failed: {error_message}',
                'timestamp': time.time(),
                'type': 'system_error'
            }]
        }
        
    def get_analysis_history(self, session_id: str) -> List[Dict[str, Any]]:
        """Get analysis history for a session"""
        try:
            analyses = SceneAnalysis.query.filter_by(session_id=session_id).order_by(
                SceneAnalysis.timestamp.desc()
            ).all()
            
            return [
                {
                    'id': analysis.id,
                    'timestamp': analysis.timestamp.isoformat(),
                    'analysis_results': analysis.analysis_results,
                    'confidence_scores': analysis.confidence_scores,
                    'status': analysis.status
                }
                for analysis in analyses
            ]
            
        except Exception as e:
            self.logger.error(f"Error retrieving analysis history: {str(e)}")
            return []
            
    def update_user_feedback(self, session_id: str, analysis_id: int, 
                           feedback: Dict[str, Any]) -> bool:
        """Update user feedback for an analysis"""
        try:
            analysis = SceneAnalysis.query.filter_by(
                session_id=session_id,
                id=analysis_id
            ).first()
            
            if analysis:
                analysis.user_feedback = feedback
                db.session.commit()
                return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error updating user feedback: {str(e)}")
            db.session.rollback()
            return False
