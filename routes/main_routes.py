from flask import Blueprint, render_template, request, jsonify, session, send_from_directory
import uuid
import logging
import os

main_bp = Blueprint('main', __name__)
logger = logging.getLogger(__name__)

@main_bp.route('/')
def index():
    """Main dashboard page"""
    # Generate session ID if not exists
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    
    return render_template('dashboard.html', session_id=session['session_id'])

@main_bp.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ChemBio Defense Dashboard',
        'version': '1.0.0'
    })

@main_bp.route('/session')
def get_session():
    """Get current session information"""
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    
    return jsonify({
        'session_id': session['session_id'],
        'user_type': session.get('user_type', 'tactical')
    })

@main_bp.route('/session/type', methods=['POST'])
def set_user_type():
    """Set user type (tactical or command)"""
    data = request.get_json()
    user_type = data.get('user_type', 'tactical')
    
    if user_type in ['tactical', 'command']:
        session['user_type'] = user_type
        return jsonify({'status': 'success', 'user_type': user_type})
    else:
        return jsonify({'status': 'error', 'message': 'Invalid user type'}), 400

@main_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads')
    return send_from_directory(uploads_dir, filename)
