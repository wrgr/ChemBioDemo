import json
import logging
import os
from typing import Dict, Any, List, Optional
import base64

from google import genai
from google.genai import types
from pydantic import BaseModel

class GeminiService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self):
        self.logger = logging.getLogger("gemini_service")
        self.client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", "default_key"))
        
    def analyze_image_with_prompt(self, image_data: bytes, prompt: str) -> str:
        """Analyze image with custom prompt"""
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-pro",
                contents=[
                    types.Part.from_bytes(
                        data=image_data,
                        mime_type="image/jpeg",
                    ),
                    prompt
                ],
            )
            
            return response.text if response.text else "No analysis generated"
            
        except Exception as e:
            self.logger.error(f"Error in image analysis: {str(e)}")
            return f"Error in image analysis: {str(e)}"
            
    def analyze_video_with_prompt(self, video_data: bytes, prompt: str) -> str:
        """Analyze video with custom prompt"""
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-pro",
                contents=[
                    types.Part.from_bytes(
                        data=video_data,
                        mime_type="video/mp4",
                    ),
                    prompt
                ],
            )
            
            return response.text if response.text else "No analysis generated"
            
        except Exception as e:
            self.logger.error(f"Error in video analysis: {str(e)}")
            return f"Error in video analysis: {str(e)}"
            
    def analyze_scene_comprehensively(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive scene analysis"""
        prompt = """
        Perform a comprehensive analysis of this ChemBio scene for tactical operations. Provide:
        
        1. IMMEDIATE HAZARDS:
           - Chemical threats and exposure risks
           - Biological hazards and contamination
           - Physical safety concerns
           - Environmental dangers
        
        2. OPERATIONAL ASSESSMENT:
           - Type of operation (synthesis, storage, research, etc.)
           - Sophistication level
           - Scale of operation
           - Security measures present
        
        3. EVIDENCE INDICATORS:
           - Smoking guns and key evidence
           - Precursor materials
           - Equipment and processes
           - Waste products and byproducts
        
        4. TACTICAL RECOMMENDATIONS:
           - Immediate safety actions
           - Containment strategies
           - Evidence preservation
           - Personnel protection levels
        
        5. CONFIDENCE ASSESSMENT:
           - Reliability of visual indicators
           - Certainty of threat assessment
           - Areas requiring additional investigation
        
        Format the response as structured JSON with clear sections and confidence scores.
        """
        
        try:
            if scene_data.get('image_data'):
                analysis_text = self.analyze_image_with_prompt(scene_data['image_data'], prompt)
            elif scene_data.get('video_data'):
                analysis_text = self.analyze_video_with_prompt(scene_data['video_data'], prompt)
            else:
                return {'error': 'No image or video data provided'}
                
            # Try to parse as JSON, fall back to structured text
            try:
                return json.loads(analysis_text)
            except json.JSONDecodeError:
                return {'comprehensive_analysis': analysis_text}
                
        except Exception as e:
            self.logger.error(f"Error in comprehensive scene analysis: {str(e)}")
            return {'error': f"Analysis failed: {str(e)}"}
            
    def generate_tactical_summary(self, analysis_results: Dict[str, Any]) -> str:
        """Generate tactical summary for operators"""
        prompt = f"""
        Based on the following analysis results, generate a concise tactical summary for field operators:
        
        Analysis Results:
        {json.dumps(analysis_results, indent=2)}
        
        Provide a brief, actionable summary focusing on:
        1. Immediate threats and hazards
        2. Required protective measures
        3. Next steps and priorities
        4. Key evidence to secure
        
        Keep the summary under 200 words and use clear, direct language suitable for tactical operations.
        """
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            
            return response.text if response.text else "Unable to generate tactical summary"
            
        except Exception as e:
            self.logger.error(f"Error generating tactical summary: {str(e)}")
            return f"Error generating summary: {str(e)}"
            
    def generate_command_briefing(self, analysis_results: Dict[str, Any]) -> str:
        """Generate detailed briefing for command center"""
        prompt = f"""
        Based on the following analysis results, generate a comprehensive briefing for command center personnel:
        
        Analysis Results:
        {json.dumps(analysis_results, indent=2)}
        
        Provide a detailed briefing including:
        1. Executive summary of the situation
        2. Detailed threat assessment with reasoning
        3. Agent analysis breakdown and confidence levels
        4. Strategic recommendations and resource allocation
        5. Coordination requirements with other agencies
        6. Long-term implications and follow-up actions
        
        Use professional briefing format suitable for command decision-making.
        """
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-pro",
                contents=prompt
            )
            
            return response.text if response.text else "Unable to generate command briefing"
            
        except Exception as e:
            self.logger.error(f"Error generating command briefing: {str(e)}")
            return f"Error generating briefing: {str(e)}"
            
    def extract_youtube_insights(self, youtube_url: str) -> Dict[str, Any]:
        """Extract insights from YouTube video URL"""
        # Note: This is a simplified implementation
        # In production, you would use YouTube API to extract video data
        prompt = f"""
        Analyze the YouTube video at this URL for ChemBio tactical relevance: {youtube_url}
        
        Note: This is a URL analysis only. Provide insights on:
        1. Potential relevance to ChemBio operations
        2. Recommended analysis approach
        3. Security considerations
        4. Information that may be extracted
        
        Return structured analysis recommendations.
        """
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            
            return {
                'youtube_url': youtube_url,
                'analysis_recommendations': response.text if response.text else "No recommendations generated",
                'status': 'url_analyzed'
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing YouTube URL: {str(e)}")
            return {
                'youtube_url': youtube_url,
                'error': f"Analysis failed: {str(e)}",
                'status': 'error'
            }
