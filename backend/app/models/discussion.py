import uuid
from datetime import datetime

from app import db

class Discussion(db.Model):
    __tablename__ = 'discussions'
    
    id = db.Column(db.String(36), primary_key=True)
    workspace_id = db.Column(db.String(36), db.ForeignKey('workspaces.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(50), default='active')
    created_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    workspace = db.relationship('Workspace', back_populates='discussions')
    messages = db.relationship('Message', back_populates='discussion', cascade='all, delete-orphan')
    
    def __init__(self, workspace_id, title, description=None, created_by=None):
        self.id = str(uuid.uuid4())
        self.workspace_id = workspace_id
        self.title = title
        self.description = description
        self.created_by = created_by
    
    def to_dict(self):
        return {
            'id': self.id,
            'workspace_id': self.workspace_id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.String(36), primary_key=True)
    discussion_id = db.Column(db.String(36), db.ForeignKey('discussions.id'), nullable=False)
    parent_id = db.Column(db.String(36), db.ForeignKey('messages.id'), nullable=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    discussion = db.relationship('Discussion', back_populates='messages')
    user = db.relationship('User', back_populates='messages')
    replies = db.relationship('Message', backref=db.backref('parent', remote_side=[id]), lazy='dynamic')
    analysis = db.relationship('MessageAnalysis', back_populates='message', uselist=False, cascade='all, delete-orphan')
    
    def __init__(self, discussion_id, user_id, content, parent_id=None):
        self.id = str(uuid.uuid4())
        self.discussion_id = discussion_id
        self.user_id = user_id
        self.content = content
        self.parent_id = parent_id
    
    def to_dict(self):
        return {
            'id': self.id,
            'discussion_id': self.discussion_id,
            'parent_id': self.parent_id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else None,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
