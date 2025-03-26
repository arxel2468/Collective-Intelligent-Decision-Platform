from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid
from datetime import datetime

from app import db
from app.api import api_bp
from app.models.discussion import Discussion, Message
from app.models.analysis import MessageAnalysis, CognitiveBias
from app.models.workspace import WorkspaceMember
from app.utils.api_config import error_response

@api_bp.route('/messages/<message_id>/analysis', methods=['GET'])
@jwt_required()
def get_message_analysis(message_id):
    user_id = get_jwt_identity()
    
    message = Message.query.get(message_id)
    
    if not message:
        return error_response("Message not found", 404)
    
    # Check if user is a member of the workspace
    member = WorkspaceMember.query.filter_by(
        workspace_id=message.discussion.workspace_id, 
        user_id=user_id
    ).first()
    
    if not member:
        return error_response("Access denied", 403)
    
    analysis = MessageAnalysis.query.filter_by(message_id=message_id).first()
    
    if not analysis:
        return jsonify({
            "message": "No analysis available for this message yet"
        }), 404
    
    return jsonify(analysis.to_dict()), 200

@api_bp.route('/biases', methods=['GET'])
@jwt_required()
def get_cognitive_biases():
    biases = CognitiveBias.query.all()
    
    return jsonify({
        "biases": [bias.to_dict() for bias in biases]
    }), 200

# This would normally be a background task
@api_bp.route('/messages/<message_id>/analyze', methods=['POST'])
@jwt_required()
def analyze_message(message_id):
    user_id = get_jwt_identity()
    
    message = Message.query.get(message_id)
    
    if not message:
        return error_response("Message not found", 404)
    
    # Check if user is a member of the workspace
    member = WorkspaceMember.query.filter_by(
        workspace_id=message.discussion.workspace_id, 
        user_id=user_id
    ).first()
    
    if not member:
        return error_response("Access denied", 403)
    
    # For now, just create a placeholder analysis
    # In a real implementation, this would use NLP models to analyze the message
    
    # Check if analysis already exists
    existing_analysis = MessageAnalysis.query.filter_by(message_id=message_id).first()
    
    if existing_analysis:
        return jsonify({
            "message": "Analysis already exists for this message",
            "analysis": existing_analysis.to_dict()
        }), 200
    
    # Simple sentiment score between -1 and 1
    sentiment_score = 0.0
    
    # Simple perspective vector (placeholder)
    perspective_vector = {
        "dimensions": ["factual", "emotional", "logical", "intuitive"],
        "values": [0.5, 0.3, 0.7, 0.2]
    }
    
    # Sample detected biases (placeholder)
    detected_biases = {
        "biases": [
            {
                "name": "confirmation_bias",
                "confidence": 0.2,
                "evidence": "No strong evidence found"
            }
        ]
    }
    
    # Create the analysis
    analysis = MessageAnalysis(
        message_id=message_id,
        sentiment_score=sentiment_score,
        perspective_vector=perspective_vector,
        detected_biases=detected_biases
    )
    
    db.session.add(analysis)
    db.session.commit()
    
    return jsonify(analysis.to_dict()), 201


@api_bp.route('/discussions/<discussion_id>/analysis', methods=['GET'])
@jwt_required()
def get_discussion_analysis(discussion_id):
    user_id = get_jwt_identity()
    
    # Check if discussion exists
    discussion = Discussion.query.get(discussion_id)
    if not discussion:
        return error_response("Discussion not found", 404)
    
    # Check if user is a member of the workspace
    member = WorkspaceMember.query.filter_by(
        workspace_id=discussion.workspace_id, 
        user_id=user_id
    ).first()
    
    if not member:
        return error_response("Access denied", 403)
    
    # Get all messages in the discussion
    messages = Message.query.filter_by(discussion_id=discussion_id).all()
    
    # Create mock analysis data for demonstration
    analyses = []
    for message in messages:
        # Simple mock sentiment score between -1 and 1
        sentiment_score = 0.5
        
        # Mock perspective vector
        perspective_vector = {
            "dimensions": ["factual", "emotional", "logical", "intuitive"],
            "values": [0.7, 0.3, 0.6, 0.2]
        }
        
        # Mock detected biases
        detected_biases = {
            "biases": [
                {
                    "name": "Confirmation Bias",
                    "confidence": 0.7,
                    "evidence": "Sample evidence"
                },
                {
                    "name": "Anchoring Bias",
                    "confidence": 0.4,
                    "evidence": "Sample evidence"
                }
            ]
        }
        
        # Create analysis object
        analysis = {
            "id": str(uuid.uuid4()),
            "message_id": message.id,
            "sentiment_score": sentiment_score,
            "perspective_vector": perspective_vector,
            "detected_biases": detected_biases,
            "analyzed_at": datetime.utcnow().isoformat()
        }
        
        analyses.append(analysis)
    
    return jsonify({
        "discussion_id": discussion_id,
        "message_count": len(messages),
        "analyzed_messages": len(analyses),
        "analyses": analyses
    }), 200

# Seed database with common cognitive biases
@api_bp.route('/seed/biases', methods=['POST'])
@jwt_required()
def seed_biases():
    user_id = get_jwt_identity()
    
    # In a real app, we would check if the user is an admin
    
    # Check if biases already exist
    if CognitiveBias.query.count() > 0:
        return jsonify({
            "message": "Biases already seeded"
        }), 200
    
    # List of common cognitive biases
    biases = [
        {
            "name": "Confirmation Bias",
            "description": "The tendency to search for, interpret, favor, and recall information in a way that confirms one's preexisting beliefs or hypotheses.",
            "detection_patterns": ["agreement with prior statements", "ignoring contradictory evidence", "selective information seeking"],
            "mitigation_strategies": "Actively seek out contradictory evidence and alternative viewpoints."
        },
        {
            "name": "Anchoring Bias",
            "description": "The tendency to rely too heavily on the first piece of information encountered (the 'anchor') when making decisions.",
            "detection_patterns": ["fixation on initial values", "insufficient adjustment from initial estimates"],
            "mitigation_strategies": "Consider multiple reference points and deliberately challenge your initial impressions."
        },
        {
            "name": "Groupthink",
            "description": "The tendency for groups to make irrational decisions due to pressure to conform and avoid conflict.",
            "detection_patterns": ["lack of dissent", "unanimous decisions", "pressure to agree"],
            "mitigation_strategies": "Assign someone to play devil's advocate and encourage diverse viewpoints."
        },
        {
            "name": "Availability Heuristic",
            "description": "The tendency to overestimate the likelihood of events that are more readily available in memory.",
            "detection_patterns": ["recency bias", "vivid examples", "emotionally charged reasoning"],
            "mitigation_strategies": "Look at objective statistics and base rates rather than relying on memorable examples."
        },
        {
            "name": "Status Quo Bias",
            "description": "The preference for the current state of affairs and resistance to change.",
            "detection_patterns": ["resistance to change", "preference for familiar options", "risk aversion"],
            "mitigation_strategies": "Evaluate options based on merit rather than familiarity, and consider the cost of inaction."
        }
    ]
    
    # Add biases to database
    for bias_data in biases:
        bias = CognitiveBias(
            name=bias_data["name"],
            description=bias_data["description"],
            detection_patterns=bias_data["detection_patterns"],
            mitigation_strategies=bias_data["mitigation_strategies"]
        )
        db.session.add(bias)
    
    db.session.commit()
    
    return jsonify({
        "message": "Biases seeded successfully",
        "count": len(biases)
    }), 201
