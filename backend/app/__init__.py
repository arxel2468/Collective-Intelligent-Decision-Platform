from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import os

from config import config

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_CONFIG', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    # Register blueprints
    from app.api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Import models to ensure they're registered with SQLAlchemy
    from app.models.user import User
    from app.models.workspace import Workspace, WorkspaceMember
    from app.models.discussion import Discussion, Message
    from app.models.analysis import MessageAnalysis, CognitiveBias
    # Import the decision models from the correct location
    from app.models.decision import DecisionProcess, DecisionStage, DecisionDocument
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app
