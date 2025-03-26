from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.api import api_bp
from app.models.discussion import Discussion, Message
from app.models.workspace import WorkspaceMember
from app.utils.api_config import error_response

@api_bp.route('/workspaces/<workspace_id>/discussions', methods=['GET'])
@jwt_required()
def get_discussions(workspace_id):
    user_id = get_jwt_identity()
    
    # Check if user is a member of the workspace
    member = WorkspaceMember.query.filter_by(
        workspace_id=workspace_id, 
        user_id=user_id
    ).first()
    
    if not member:
        return error_response("Access denied", 403)
    
    discussions = Discussion.query.filter_by(workspace_id=workspace_id).all()
    
    return jsonify({
        "discussions": [d.to_dict() for d in discussions]
    }), 200

@api_bp.route('/workspaces/<workspace_id>/discussions', methods=['POST'])
@jwt_required()
def create_discussion(workspace_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('title'):
        return error_response("Discussion title is required", 400)
    
    # Check if user is a member of the workspace
    member = WorkspaceMember.query.filter_by(
        workspace_id=workspace_id, 
        user_id=user_id
    ).first()
    
    if not member:
        return error_response("Access denied", 403)
    
    discussion = Discussion(
        workspace_id=workspace_id,
        title=data['title'],
        description=data.get('description', ''),
        created_by=user_id
    )
    
    db.session.add(discussion)
    db.session.commit()
    
    return jsonify(discussion.to_dict()), 201

@api_bp.route('/discussions/<discussion_id>', methods=['GET'])
@jwt_required()
def get_discussion(discussion_id):
    user_id = get_jwt_identity()
    
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
    
    return jsonify(discussion.to_dict()), 200

@api_bp.route('/discussions/<discussion_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(discussion_id):
    user_id = get_jwt_identity()
    
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
    
    messages = Message.query.filter_by(discussion_id=discussion_id).all()
    
    return jsonify({
        "messages": [m.to_dict() for m in messages]
    }), 200

@api_bp.route('/discussions/<discussion_id>/messages', methods=['POST'])
@jwt_required()
def post_message(discussion_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('content'):
        return error_response("Message content is required", 400)
    
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
    
    message = Message(
        discussion_id=discussion_id,
        user_id=user_id,
        content=data['content'],
        parent_id=data.get('parent_id')
    )
    
    db.session.add(message)
    db.session.commit()
    
    # Here we would trigger message analysis in the background
    # For now, we'll just return the message
    
    return jsonify(message.to_dict()), 201
