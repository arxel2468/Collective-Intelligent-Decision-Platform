# app/models/decision.py
import uuid
from datetime import datetime

from app import db

class DecisionProcess(db.Model):
    __tablename__ = 'decision_processes'
    
    id = db.Column(db.String(36), primary_key=True)
    discussion_id = db.Column(db.String(36), db.ForeignKey('discussions.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='in_progress')
    process_template = db.Column(db.String(100), nullable=True)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    stages = db.relationship('DecisionStage', back_populates='process', cascade='all, delete-orphan')
    documents = db.relationship('DecisionDocument', back_populates='process', cascade='all, delete-orphan')
    
    def __init__(self, discussion_id, title, process_template=None):
        self.id = str(uuid.uuid4())
        self.discussion_id = discussion_id
        self.title = title
        self.process_template = process_template
    
    def to_dict(self):
        return {
            'id': self.id,
            'discussion_id': self.discussion_id,
            'title': self.title,
            'status': self.status,
            'process_template': self.process_template,
            'started_at': self.started_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

class DecisionStage(db.Model):
    __tablename__ = 'decision_stages'
    
    id = db.Column(db.String(36), primary_key=True)
    process_id = db.Column(db.String(36), db.ForeignKey('decision_processes.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    order_index = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), default='pending')
    started_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    process = db.relationship('DecisionProcess', back_populates='stages')
    
    def __init__(self, process_id, name, description, order_index):
        self.id = str(uuid.uuid4())
        self.process_id = process_id
        self.name = name
        self.description = description
        self.order_index = order_index
    
    def to_dict(self):
        return {
            'id': self.id,
            'process_id': self.process_id,
            'name': self.name,
            'description': self.description,
            'order_index': self.order_index,
            'status': self.status,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

class DecisionDocument(db.Model):
    __tablename__ = 'decision_documents'
    
    id = db.Column(db.String(36), primary_key=True)
    process_id = db.Column(db.String(36), db.ForeignKey('decision_processes.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    version = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    process = db.relationship('DecisionProcess', back_populates='documents')
    
    def __init__(self, process_id, title, content, version=1):
        self.id = str(uuid.uuid4())
        self.process_id = process_id
        self.title = title
        self.content = content
        self.version = version
    
    def to_dict(self):
        return {
            'id': self.id,
            'process_id': self.process_id,
            'title': self.title,
            'content': self.content,
            'version': self.version,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }