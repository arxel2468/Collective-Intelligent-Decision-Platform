# app/services/clustering/perspective_analyzer.py
import re
from typing import Dict, Any, List
import numpy as np

class PerspectiveAnalyzer:
    """
    Analyzes text to extract perspective dimensions.
    In a production environment, this would use a more sophisticated model.
    """
    
    def __init__(self):
        """Initialize the perspective analyzer with dimension keywords."""
        # Define keywords for each perspective dimension
        self.dimensions = {
            'factual': [
                'fact', 'evidence', 'data', 'research', 'study', 'statistics',
                'proven', 'measured', 'observed', 'documented', 'verified',
                'objective', 'empirical', 'quantitative'
            ],
            'emotional': [
                'feel', 'feeling', 'emotion', 'emotional', 'care', 'worry',
                'excited', 'happy', 'sad', 'angry', 'frustrated', 'concerned',
                'love', 'hate', 'fear', 'hope', 'passionate'
            ],
            'logical': [
                'logic', 'reason', 'therefore', 'conclusion', 'premise',
                'argument', 'rational', 'analyze', 'consider', 'evaluate',
                'assess', 'implies', 'consequently', 'systematic'
            ],
            'intuitive': [
                'intuition', 'gut', 'sense', 'feeling', 'instinct', 'impression',
                'perceive', 'insight', 'hunch', 'suspect', 'believe', 'imagine',
                'creative', 'innovative', 'vision'
            ]
        }
        
        # Dimension names in order
        self.dimension_names = list(self.dimensions.keys())
    
    def analyze_perspective(self, text: str) -> Dict[str, Any]:
        """
        Analyze the perspective dimensions in the provided text.
        
        Args:
            text: The text to analyze
            
        Returns:
            Dictionary with perspective dimensions and values
        """
        # Convert to lowercase
        text_lower = text.lower()
        
        # Calculate scores for each dimension
        dimension_scores = []
        
        for dimension, keywords in self.dimensions.items():
            # Count keyword occurrences
            score = sum(1 for keyword in keywords if keyword in text_lower)
            
            # Normalize by text length (simple approach)
            word_count = len(re.findall(r'\b\w+\b', text_lower))
            if word_count > 0:
                normalized_score = score / word_count
            else:
                normalized_score = 0
                
            dimension_scores.append(normalized_score)
        
        # Normalize scores to sum to 1.0
        total_score = sum(dimension_scores)
        if total_score > 0:
            normalized_scores = [score / total_score for score in dimension_scores]
        else:
            # Default to equal distribution if no keywords found
            normalized_scores = [0.25, 0.25, 0.25, 0.25]
        
        return {
            "dimensions": self.dimension_names,
            "values": normalized_scores
        }

