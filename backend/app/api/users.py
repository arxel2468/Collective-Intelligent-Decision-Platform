from flask import jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app import db
from app.api import api_bp
from app.models.user import User
from app.utils.api_config import error_response

@api_bp.route('/users/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return error_response("Missing required fields", 400)
    
    if User.query.filter_by(username=data['username']).first():
        return error_response("Username already exists", 400)
        
    if User.query.filter_by(email=data['email']).first():
        return error_response("Email already exists", 400)
    
    user = User(
        username=data['username'],
        email=data['email']
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "User created successfully"}), 201

@api_bp.route('/users/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return error_response("Missing credentials", 400)
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return error_response("Invalid credentials", 401)
    
    access_token = create_access_token(identity=user.id)
    return jsonify({
        "token": access_token, 
        "user_id": user.id,
        "username": user.username
    }), 200

@api_bp.route('/users/me', methods=['GET'])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return error_response("User not found", 404)
    
    return jsonify(user.to_dict()), 200

@api_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    return jsonify({
        "users": [user.to_dict() for user in users]
    }), 200
