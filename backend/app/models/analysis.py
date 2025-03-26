import uuid
from datetime import datetime
import json

from app import db

class MessageAnalysis(db.Model):
    __tablename__ = 'message_analysis'
    
    id = db.Column(db.String(36), primary_key=True)
    message_id = db.Column(db.String(36), db.ForeignKey('messages.id'), nullable=False, unique=True)
    sentiment_score = db.Column(db.Float, nullable=True)
    perspective_vector = db.Column(db.Text, nullable=True)  # JSON string
    detected_biases = db.Column(db.Text, nullable=True)  # JSON string
    analyzed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    message = db.relationship('Message', back_populates='analysis')
    
    def __init__(self, message_id, sentiment_score=None, perspective_vector=None, detected_biases=None):
        self.id = str(uuid.uuid4())
        self.message_id = message_id
        self.sentiment_score = sentiment_score
        
        if perspective_vector is not None:
            self.set_perspective_vector(perspective_vector)
            
        if detected_biases is not None:
            self.set_detected_biases(detected_biases)
    
    def set_perspective_vector(self, vector):
        self.perspective_vector = json.dumps(vector)
        
    def get_perspective_vector(self):
        if self.perspective_vector:
            return json.loads(self.perspective_vector)
        return None
    
    def set_detected_biases(self, biases):
        self.detected_biases = json.dumps(biases)
        
    def get_detected_biases(self):
        if self.detected_biases:
            return json.loads(self.detected_biases)
        return None
    
    def to_dict(self):
        return {
            'id': self.id,
            'message_id': self.message_id,
            'sentiment_score': self.sentiment_score,
            'perspective_vector': self.get_perspective_vector(),
            'detected_biases': self.get_detected_biases(),
            'analyzed_at': self.analyzed_at.isoformat()
        }

class CognitiveBias(db.Model):
    __tablename__ = 'cognitive_biases'
    
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=False)
    detection_patterns = db.Column(db.Text, nullable=True)  # JSON string
    mitigation_strategies = db.Column(db.Text, nullable=True)
    
    def __init__(self, name, description, detection_patterns=None, mitigation_strategies=None):
        self.id = str(uuid.uuid4())
        self.name = name
        self.description = description
        
        if detection_patterns is not None:
            self.set_detection_patterns(detection_patterns)
            
        self.mitigation_strategies = mitigation_strategies
    
    def set_detection_patterns(self, patterns):
        self.detection_patterns = json.dumps(patterns)
        
    def get_detection_patterns(self):
        if self.detection_patterns:
            return json.loads(self.detection_patterns)
        return None
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'detection_patterns': self.get_detection_patterns(),
            'mitigation_strategies': self.mitigation_strategies
        }
