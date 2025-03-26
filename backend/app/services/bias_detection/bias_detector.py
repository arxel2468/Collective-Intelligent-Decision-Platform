# app/services/bias_detection/bias_detector.py
import re
import json
from typing import Dict, List, Any, Tuple

class BiasDetector:
    """
    Detects cognitive biases in text using pattern matching and NLP techniques.
    """
    
    def __init__(self, bias_patterns: Dict[str, List[str]]):
        """
        Initialize the bias detector with patterns for different bias types.
        
        Args:
            bias_patterns: Dictionary mapping bias names to lists of detection patterns
        """
        self.bias_patterns = bias_patterns
    
    def detect_biases(self, text: str) -> List[Dict[str, Any]]:
        """
        Detect potential cognitive biases in the provided text.
        
        Args:
            text: The text to analyze
            
        Returns:
            List of detected biases with confidence scores and evidence
        """
        detected_biases = []
        
        # Convert text to lowercase for case-insensitive matching
        text_lower = text.lower()
        
        for bias_name, patterns in self.bias_patterns.items():
            # Check for pattern matches
            evidence = []
            for pattern in patterns:
                matches = re.findall(pattern.lower(), text_lower)
                evidence.extend(matches)
            
            # Calculate confidence based on number of matches
            confidence = min(len(evidence) * 0.2, 0.9) if evidence else 0.0
            
            if confidence > 0.1:  # Only include biases with some confidence
                detected_biases.append({
                    "name": bias_name,
                    "confidence": round(confidence, 2),
                    "evidence": ", ".join(evidence) if evidence else "No strong evidence found"
                })
        
        return detected_biases
    
    def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        Analyze text for biases and return structured results.
        
        Args:
            text: The text to analyze
            
        Returns:
            Dictionary with detected biases
        """
        biases = self.detect_biases(text)
        
        return {
            "biases": biases
        }


# app/services/nlp/sentiment_analyzer.py
import re
from typing import Dict, Any, List, Tuple

class SentimentAnalyzer:
    """
    Simple sentiment analyzer for text content.
    In a production environment, this would use a more sophisticated model.
    """
    
    def __init__(self):
        """Initialize the sentiment analyzer with positive and negative word lists."""
        self.positive_words = {
            'good', 'great', 'excellent', 'positive', 'wonderful', 'fantastic',
            'amazing', 'love', 'best', 'better', 'superior', 'outstanding',
            'happy', 'glad', 'pleased', 'delighted', 'agree', 'correct',
            'right', 'yes', 'perfect', 'impressive', 'awesome'
        }
        
        self.negative_words = {
            'bad', 'terrible', 'awful', 'negative', 'horrible', 'worst',
            'worse', 'inferior', 'poor', 'disappointing', 'disagree', 'wrong',
            'no', 'not', 'never', 'dislike', 'hate', 'problem', 'issue',
            'mistake', 'error', 'fail', 'failure', 'useless', 'stupid'
        }
        
        self.intensifiers = {
            'very', 'extremely', 'incredibly', 'absolutely', 'completely',
            'totally', 'utterly', 'really', 'truly', 'highly'
        }
        
        self.negators = {
            'not', "n't", 'no', 'never', 'none', 'neither', 'nor', 'nothing'
        }
    
    def analyze_sentiment(self, text: str) -> float:
        """
        Analyze the sentiment of the provided text.
        
        Args:
            text: The text to analyze
            
        Returns:
            Sentiment score between -1 (negative) and 1 (positive)
        """
        # Convert to lowercase and tokenize
        words = re.findall(r'\b\w+\b', text.lower())
        
        score = 0
        total_sentiment_words = 0
        
        # Simple negation handling
        negated = False
        
        for i, word in enumerate(words):
            # Check for negators
            if word in self.negators:
                negated = True
                continue
            
            # Check for sentiment words
            sentiment = 0
            if word in self.positive_words:
                sentiment = -1 if negated else 1
                total_sentiment_words += 1
            elif word in self.negative_words:
                sentiment = 1 if negated else -1
                total_sentiment_words += 1
            
            # Check for intensifiers
            if sentiment != 0 and i > 0 and words[i-1] in self.intensifiers:
                sentiment *= 1.5
            
            score += sentiment
            
            # Reset negation after using it
            if sentiment != 0:
                negated = False
        
        # Normalize score to range [-1, 1]
        if total_sentiment_words > 0:
            score = max(min(score / total_sentiment_words, 1.0), -1.0)
        
        return score