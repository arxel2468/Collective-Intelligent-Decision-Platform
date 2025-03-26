import uuid
from datetime import datetime

from app import db

class Workspace(db.Model):
    __tablename__ = 'workspaces'
    
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    members = db.relationship('WorkspaceMember', back_populates='workspace', cascade='all, delete-orphan')
    discussions = db.relationship('Discussion', back_populates='workspace', cascade='all, delete-orphan')
    
    def __init__(self, name, description=None, created_by=None):
        self.id = str(uuid.uuid4())
        self.name = name
        self.description = description
        self.created_by = created_by
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class WorkspaceMember(db.Model):
    __tablename__ = 'workspace_members'
    
    workspace_id = db.Column(db.String(36), db.ForeignKey('workspaces.id'), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), primary_key=True)
    role = db.Column(db.String(50), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    workspace = db.relationship('Workspace', back_populates='members')
    user = db.relationship('User', back_populates='workspaces')
    
    def __init__(self, workspace_id, user_id, role='member'):
        self.workspace_id = workspace_id
        self.user_id = user_id
        self.role = role
    
    def to_dict(self):
        return {
            'workspace_id': self.workspace_id,
            'user_id': self.user_id,
            'role': self.role,
            'joined_at': self.joined_at.isoformat()
        }
