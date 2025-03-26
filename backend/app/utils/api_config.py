from flask import jsonify
from functools import wraps
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

def error_response(message, status_code):
    response = jsonify({"message": message})
    response.status_code = status_code
    return response

def auth_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request()
                return fn(*args, **kwargs)
            except Exception as e:
                return error_response("Authentication required", 401)
        return decorator
    return wrapper
