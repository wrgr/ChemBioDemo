import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from dataclasses import dataclass

@dataclass
class AgentResult:
    """Standard result format for all agents"""
    agent_name: str
    confidence: float
    findings: List[str]
    recommendations: List[str]
    hazard_level: str
    metadata: Dict[str, Any]
    reasoning: str

class BaseAgent(ABC):
    """Base class for all ChemBio analysis agents"""
    
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f"agent.{name}")
        
    @abstractmethod
    def analyze(self, scene_data: Dict[str, Any]) -> AgentResult:
        """Analyze scene data and return structured results"""
        pass
        
    def validate_input(self, scene_data: Dict[str, Any]) -> bool:
        """Validate input data before analysis"""
        required_fields = ['image_data', 'metadata']
        return all(field in scene_data for field in required_fields)
        
    def calculate_confidence(self, indicators: List[Dict[str, Any]]) -> float:
        """Calculate confidence score based on indicators"""
        if not indicators:
            return 0.0
            
        total_weight = sum(indicator.get('weight', 1.0) for indicator in indicators)
        if total_weight == 0:
            return 0.0
            
        weighted_confidence = sum(
            indicator.get('confidence', 0.0) * indicator.get('weight', 1.0)
            for indicator in indicators
        )
        
        return min(weighted_confidence / total_weight, 1.0)
        
    def determine_hazard_level(self, confidence: float, risk_factors: List[str]) -> str:
        """Determine hazard level based on confidence and risk factors"""
        if confidence >= 0.8 and len(risk_factors) > 2:
            return "CRITICAL"
        elif confidence >= 0.6 and len(risk_factors) > 1:
            return "HIGH"
        elif confidence >= 0.4 or len(risk_factors) > 0:
            return "MODERATE"
        else:
            return "LOW"
