# app/api/decision.py
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from app import db
from app.api import api_bp
from app.models.discussion import Discussion
from app.models.workspace import WorkspaceMember
from app.models.decision import DecisionProcess, DecisionStage, DecisionDocument
from app.utils.api_config import error_response

@api_bp.route('/discussions/<discussion_id>/decision-process', methods=['GET'])
@jwt_required()
def get_decision_process(discussion_id):
    user_id = get_jwt_identity()
    print(f"GET /api/discussions/{discussion_id}/decision-process called by user {user_id}")
    
    # Check if discussion exists
    from app.models.discussion import Discussion
    discussion = Discussion.query.get(discussion_id)
    if not discussion:
        return jsonify({"message": "Discussion not found"}), 404
    
    # Check if user is a member of the workspace
    from app.models.workspace import WorkspaceMember
    member = WorkspaceMember.query.filter_by(
        workspace_id=discussion.workspace_id, 
        user_id=user_id
    ).first()
    
    if not member:
        return jsonify({"message": "Access denied"}), 403
    
    # Get decision process
    from app.models.decision import DecisionProcess
    process = DecisionProcess.query.filter_by(discussion_id=discussion_id).first()
    
    if not process:
        return jsonify({"message": "Decision process not found"}), 404
    
    # Get stages
    from app.models.decision import DecisionStage
    stages = DecisionStage.query.filter_by(process_id=process.id).order_by(DecisionStage.order_index).all()
    
    return jsonify({
        "process": process.to_dict(),
        "stages": [stage.to_dict() for stage in stages]
    }), 200


@api_bp.route('/discussions/<discussion_id>/decision-process', methods=['POST'])
@jwt_required()
def create_decision_process(discussion_id):
    user_id = get_jwt_identity()
    print(f"POST /api/discussions/{discussion_id}/decision-process called by user {user_id}")
    
    data = request.get_json()
    print(f"Request data: {data}")
    
    if not data or not data.get('title'):
        return jsonify({"message": "Process title is required"}), 400
    
    # Check if discussion exists
    from app.models.discussion import Discussion
    discussion = Discussion.query.get(discussion_id)
    if not discussion:
        return jsonify({"message": "Discussion not found"}), 404
    
    # Check if user is a member of the workspace
    from app.models.workspace import WorkspaceMember
    member = WorkspaceMember.query.filter_by(
        workspace_id=discussion.workspace_id, 
        user_id=user_id
    ).first()
    
    if not member:
        return jsonify({"message": "Access denied"}), 403
    
    # Check if a process already exists
    from app.models.decision import DecisionProcess
    existing_process = DecisionProcess.query.filter_by(discussion_id=discussion_id).first()
    if existing_process:
        return jsonify({"message": "A decision process already exists for this discussion"}), 400
    
    # Create the process
    from app.models.decision import DecisionProcess, DecisionStage
    process = DecisionProcess(
        discussion_id=discussion_id,
        title=data['title'],
        process_template=data.get('template')
    )
    
    db.session.add(process)
    
    # Create default stages
    stages = [
        DecisionStage(
            process_id=process.id,
            name="Problem Definition",
            description="Define the problem or decision to be made",
            order_index=0
        ),
        DecisionStage(
            process_id=process.id,
            name="Gather Information",
            description="Collect relevant information and data",
            order_index=1
        ),
        DecisionStage(
            process_id=process.id,
            name="Identify Alternatives",
            description="Brainstorm possible solutions or alternatives",
            order_index=2
        ),
        DecisionStage(
            process_id=process.id,
            name="Evaluate Alternatives",
            description="Assess the pros and cons of each alternative",
            order_index=3
        ),
        DecisionStage(
            process_id=process.id,
            name="Make Decision",
            description="Choose the best alternative based on evaluation",
            order_index=4
        )
    ]
    
    for stage in stages:
        db.session.add(stage)
    
    db.session.commit()
    
    print(f"Created decision process with ID {process.id}")
    
    return jsonify({
        "process": process.to_dict(),
        "stages": [stage.to_dict() for stage in stages]
    }), 201

@api_bp.route('/decision-stages/<stage_id>', methods=['PATCH'])
@jwt_required()
def update_decision_stage(stage_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'status' not in data:
        return error_response("Status is required", 400)
    
    # Get the stage
    stage = DecisionStage.query.get(stage_id)
    if not stage:
        return error_response("Stage not found", 404)
    
    # Get the process and discussion
    process = DecisionProcess.query.get(stage.process_id)
    discussion = Discussion.query.get(process.discussion_id)
    
    # Check if user is a member of the workspace
    member = WorkspaceMember.query.filter_by(
        workspace_id=discussion.workspace_id, 
        user_id=user_id
    ).first()
    
    if not member:
        return error_response("Access denied", 403)
    
    # Update the stage
    stage.status = data['status']
    
    if data['status'] == 'in_progress' and not stage.started_at:
        stage.started_at = datetime.utcnow()
    elif data['status'] == 'completed' and not stage.completed_at:
        stage.completed_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify(stage.to_dict()), 200

@api_bp.route('/decision-processes/<process_id>/document', methods=['GET'])
@jwt_required()
def get_decision_document(process_id):
    user_id = get_jwt_identity()
    
    # Get the process and document
    process = DecisionProcess.query.get(process_id)
    if not process:
        return error_response("Process not found", 404)
    
    # Get the discussion
    discussion = Discussion.query.get(process.discussion_id)
    
    # Check if user is a member of the workspace
    member = WorkspaceMember.query.filter_by(
        workspace_id=discussion.workspace_id, 
        user_id=user_id
    ).first()
    
    if not member:
        return error_response("Access denied", 403)
    
    # Get the latest document
    document = DecisionDocument.query.filter_by(process_id=process_id).order_by(DecisionDocument.version.desc()).first()
    
    if not document:
        return error_response("Document not found", 404)
    
    return jsonify({
        "document": document.to_dict()
    }), 200

@api_bp.route('/decision-processes/<process_id>/document', methods=['POST'])
@jwt_required()
def create_decision_document(process_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('content'):
        return error_response("Title and content are required", 400)
    
    # Get the process
    process = DecisionProcess.query.get(process_id)
    if not process:
        return error_response("Process not found", 404)
    
    # Get the discussion
    discussion = Discussion.query.get(process.discussion_id)
    
    # Check if user is a member of the workspace
    member = WorkspaceMember.query.filter_by(
        workspace_id=discussion.workspace_id, 
        user_id=user_id
    ).first()
    
    if not member:
        return error_response("Access denied", 403)
    
    # Create the document
    document = DecisionDocument(
        process_id=process_id,
        title=data['title'],
        content=data['content'],
        version=1
    )
    
    db.session.add(document)
    db.session.commit()
    
    return jsonify({
        "document": document.to_dict()
    }), 201

@api_bp.route('/decision-documents/<document_id>', methods=['PUT'])
@jwt_required()
def update_decision_document(document_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('content'):
        return error_response("Title and content are required", 400)
    
    # Get the document
    document = DecisionDocument.query.get(document_id)
    if not document:
        return error_response("Document not found", 404)
    
    # Get the process and discussion
    process = DecisionProcess.query.get(document.process_id)
    discussion = Discussion.query.get(process.discussion_id)
    
    # Check if user is a member of the workspace
    member = WorkspaceMember.query.filter_by(
        workspace_id=discussion.workspace_id, 
        user_id=user_id
    ).first()
    
    if not member:
        return error_response("Access denied", 403)
    
    # Create a new version
    new_document = DecisionDocument(
        process_id=document.process_id,
        title=data['title'],
        content=data['content'],
        version=document.version + 1
    )
    
    db.session.add(new_document)
    db.session.commit()
    
    return jsonify({
        "document": new_document.to_dict()
    }), 200
    
@api_bp.route('/test-decision', methods=['GET'])
def test_decision():
    """Test endpoint to verify decision module is loaded."""
    return jsonify({"message": "Decision module is working!"}), 200

@api_bp.route('/test-auth', methods=['GET'])
@jwt_required()
def test_auth():
    """Test endpoint to verify authentication is working."""
    user_id = get_jwt_identity()
    return jsonify({"message": "Authentication is working!", "user_id": user_id}), 200