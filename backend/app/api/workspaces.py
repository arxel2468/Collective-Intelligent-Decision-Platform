from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.api import api_bp
from app.models.workspace import Workspace, WorkspaceMember
from app.models.user import User
from app.utils.api_config import error_response

@api_bp.route('/workspaces', methods=['GET'])
@jwt_required()
def get_workspaces():
    user_id = get_jwt_identity()
    
    # Get all workspaces where the user is a member
    memberships = WorkspaceMember.query.filter_by(user_id=user_id).all()
    workspace_ids = [m.workspace_id for m in memberships]
    workspaces = Workspace.query.filter(Workspace.id.in_(workspace_ids)).all()
    
    return jsonify({
        "workspaces": [w.to_dict() for w in workspaces]
    }), 200

@api_bp.route('/workspaces', methods=['POST'])
@jwt_required()
def create_workspace():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('name'):
        return error_response("Workspace name is required", 400)
    
    workspace = Workspace(
        name=data['name'],
        description=data.get('description', ''),
        created_by=user_id
    )
    
    db.session.add(workspace)
    
    # Add creator as admin member
    member = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=user_id,
        role='admin'
    )
    db.session.add(member)
    
    db.session.commit()
    
    return jsonify(workspace.to_dict()), 201

@api_bp.route('/workspaces/<workspace_id>', methods=['GET'])
@jwt_required()
def get_workspace(workspace_id):
    user_id = get_jwt_identity()
    
    # Check if user is a member
    member = WorkspaceMember.query.filter_by(
        workspace_id=workspace_id, 
        user_id=user_id
    ).first()
    
    if not member:
        return error_response("Access denied", 403)
    
    workspace = Workspace.query.get(workspace_id)
    
    if not workspace:
        return error_response("Workspace not found", 404)
    
    return jsonify(workspace.to_dict()), 200

@api_bp.route('/workspaces/<workspace_id>/members', methods=['GET'])
@jwt_required()
def get_workspace_members(workspace_id):
    user_id = get_jwt_identity()
    
    # Check if user is a member
    member = WorkspaceMember.query.filter_by(
        workspace_id=workspace_id, 
        user_id=user_id
    ).first()
    
    if not member:
        return error_response("Access denied", 403)
    
    members = WorkspaceMember.query.filter_by(workspace_id=workspace_id).all()
    
    # Get user details for each member
    result = []
    for m in members:
        user = User.query.get(m.user_id)
        if user:
            member_data = m.to_dict()
            member_data['username'] = user.username
            member_data['email'] = user.email
            result.append(member_data)
    
    return jsonify({
        "members": result
    }), 200

@api_bp.route('/workspaces/<workspace_id>/members', methods=['POST'])
@jwt_required()
def add_workspace_member(workspace_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('username'):
        return error_response("Username is required", 400)
    
    # Check if current user is an admin
    member = WorkspaceMember.query.filter_by(
        workspace_id=workspace_id, 
        user_id=user_id,
        role='admin'
    ).first()
    
    if not member:
        return error_response("Only workspace admins can add members", 403)
    
    # Find the user to add
    user_to_add = User.query.filter_by(username=data['username']).first()
    
    if not user_to_add:
        return error_response("User not found", 404)
    
    # Check if already a member
    existing_member = WorkspaceMember.query.filter_by(
        workspace_id=workspace_id,
        user_id=user_to_add.id
    ).first()
    
    if existing_member:
        return error_response("User is already a member of this workspace", 400)
    
    # Add the new member
    new_member = WorkspaceMember(
        workspace_id=workspace_id,
        user_id=user_to_add.id,
        role=data.get('role', 'member')
    )
    
    db.session.add(new_member)
    db.session.commit()
    
    return jsonify({
        "message": "Member added successfully",
        "member": new_member.to_dict()
    }), 201
