from flask import Blueprint, request, jsonify, session
from flask_socketio import emit, join_room, leave_room
import os
import logging
import uuid
import time
from werkzeug.utils import secure_filename
from PIL import Image
import io

from services.analysis_service import AnalysisService
from services.vector_db import VectorDatabase
from services.audit_service import audit_service
from models import Communication, SensorData, db
from app import socketio

api_bp = Blueprint('api', __name__)
logger = logging.getLogger(__name__)

# Initialize services
analysis_service = AnalysisService()
vector_db = VectorDatabase()

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def ensure_upload_folder():
    """Ensure upload folder exists"""
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

@api_bp.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload for analysis"""
    try:
        ensure_upload_folder()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        # Check file type
        is_image = allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS)
        is_video = allowed_file(file.filename, ALLOWED_VIDEO_EXTENSIONS)
        
        if not (is_image or is_video):
            return jsonify({'error': 'Invalid file type. Please upload image or video files.'}), 400
            
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': 'File too large. Maximum size is 50MB.'}), 400
            
        # Save file
        filename = secure_filename(file.filename)
        timestamp = str(int(time.time()))
        filename = f"{timestamp}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Log upload activity
        audit_service.log_activity(
            action_type='upload',
            action_details={
                'filename': filename,
                'file_type': 'image' if is_image else 'video',
                'file_size': file_size
            },
            resource_accessed=filepath,
            classification_level='internal'
        )
        
        # Get session ID
        session_id = session.get('session_id', str(uuid.uuid4()))
        
        # Prepare scene data
        scene_data = {
            'file_path': filepath,
            'file_type': 'image' if is_image else 'video',
            'filename': filename,
            'metadata': {
                'upload_time': time.time(),
                'file_size': file_size,
                'user_type': session.get('user_type', 'tactical')
            }
        }
        
        # Add file data for analysis
        if is_image:
            scene_data['image_file'] = open(filepath, 'rb')
        else:
            scene_data['video_file'] = open(filepath, 'rb')
            
        return jsonify({
            'status': 'success',
            'file_id': filename,
            'file_type': scene_data['file_type'],
            'scene_data': {
                'file_path': filepath,
                'file_type': scene_data['file_type'],
                'filename': filename
            }
        })
        
    except Exception as e:
        logger.error(f"Error in file upload: {str(e)}")
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@api_bp.route('/analyze', methods=['POST'])
def analyze_scene():
    """Analyze uploaded scene"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        session_id = session.get('session_id', str(uuid.uuid4()))
        
        # Prepare scene data
        scene_data = {}
        
        # Handle file upload
        if 'file_path' in data:
            filepath = data['file_path']
            if os.path.exists(filepath):
                if data.get('file_type') == 'image':
                    with open(filepath, 'rb') as f:
                        scene_data['image_file'] = f
                        scene_data['image_path'] = filepath
                elif data.get('file_type') == 'video':
                    with open(filepath, 'rb') as f:
                        scene_data['video_file'] = f
                        scene_data['video_path'] = filepath
                        
        # Handle YouTube URL
        if 'youtube_url' in data:
            scene_data['youtube_url'] = data['youtube_url']
            
        # Add metadata
        scene_data['metadata'] = data.get('metadata', {})
        scene_data['metadata']['session_id'] = session_id
        scene_data['metadata']['user_type'] = session.get('user_type', 'tactical')
        
        # Add user feedback if provided
        user_feedback = data.get('user_feedback')
        
        # Perform analysis
        analysis_results = analysis_service.analyze_scene(
            session_id, scene_data, user_feedback
        )
        
        # Log analysis activity
        audit_service.log_activity(
            action_type='analysis',
            action_details={
                'scene_type': scene_data.get('file_type', 'unknown'),
                'analysis_confidence': analysis_results.get('agent_analysis', {}).get('overall_assessment', {}).get('overall_confidence', 0),
                'has_youtube_url': 'youtube_url' in scene_data
            },
            resource_accessed=scene_data.get('image_path') or scene_data.get('video_path') or scene_data.get('youtube_url'),
            classification_level='confidential'
        )
        
        # Emit real-time update to connected clients
        socketio.emit('analysis_update', {
            'session_id': session_id,
            'analysis_results': analysis_results,
            'timestamp': time.time()
        }, room=session_id)
        
        return jsonify({
            'status': 'success',
            'analysis_results': analysis_results,
            'session_id': session_id
        })
        
    except Exception as e:
        logger.error(f"Error in scene analysis: {str(e)}")
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@api_bp.route('/youtube_analyze', methods=['POST'])
def analyze_youtube():
    """Analyze YouTube video URL"""
    try:
        data = request.get_json()
        
        if not data or 'youtube_url' not in data:
            return jsonify({'error': 'No YouTube URL provided'}), 400
            
        youtube_url = data['youtube_url']
        session_id = session.get('session_id', str(uuid.uuid4()))
        
        # Prepare scene data
        scene_data = {
            'youtube_url': youtube_url,
            'metadata': {
                'session_id': session_id,
                'user_type': session.get('user_type', 'tactical'),
                'analysis_time': time.time()
            }
        }
        
        # Perform analysis
        analysis_results = analysis_service.analyze_scene(session_id, scene_data)
        
        # Emit real-time update
        socketio.emit('analysis_update', {
            'session_id': session_id,
            'analysis_results': analysis_results,
            'timestamp': time.time()
        }, room=session_id)
        
        return jsonify({
            'status': 'success',
            'analysis_results': analysis_results,
            'session_id': session_id
        })
        
    except Exception as e:
        logger.error(f"Error in YouTube analysis: {str(e)}")
        return jsonify({'error': f'YouTube analysis failed: {str(e)}'}), 500

@api_bp.route('/sensor_data', methods=['POST'])
def submit_sensor_data():
    """Submit sensor data for analysis"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No sensor data provided'}), 400
            
        session_id = session.get('session_id', str(uuid.uuid4()))
        
        # Create sensor data record
        sensor_data = SensorData(
            session_id=session_id,
            sensor_type=data.get('sensor_type', 'unknown'),
            reading_value=data.get('reading_value', 0.0),
            unit=data.get('unit', ''),
            location=data.get('location', ''),
            confidence=data.get('confidence', 0.0),
            alert_level=data.get('alert_level', 'normal')
        )
        
        db.session.add(sensor_data)
        db.session.commit()
        
        # Emit real-time sensor update
        socketio.emit('sensor_update', {
            'session_id': session_id,
            'sensor_data': {
                'sensor_type': sensor_data.sensor_type,
                'reading_value': sensor_data.reading_value,
                'unit': sensor_data.unit,
                'location': sensor_data.location,
                'confidence': sensor_data.confidence,
                'alert_level': sensor_data.alert_level,
                'timestamp': sensor_data.timestamp.isoformat()
            }
        }, room=session_id)
        
        return jsonify({
            'status': 'success',
            'sensor_id': sensor_data.id,
            'message': 'Sensor data recorded'
        })
        
    except Exception as e:
        logger.error(f"Error submitting sensor data: {str(e)}")
        db.session.rollback()
        return jsonify({'error': f'Sensor data submission failed: {str(e)}'}), 500

@api_bp.route('/history/<session_id>')
def get_analysis_history(session_id):
    """Get analysis history for a session"""
    try:
        history = analysis_service.get_analysis_history(session_id)
        
        return jsonify({
            'status': 'success',
            'history': history,
            'session_id': session_id
        })
        
    except Exception as e:
        logger.error(f"Error retrieving analysis history: {str(e)}")
        return jsonify({'error': f'Failed to retrieve history: {str(e)}'}), 500

@api_bp.route('/feedback', methods=['POST'])
def submit_feedback():
    """Submit user feedback on analysis"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No feedback data provided'}), 400
            
        session_id = session.get('session_id')
        analysis_id = data.get('analysis_id')
        feedback = data.get('feedback', {})
        
        if not session_id or not analysis_id:
            return jsonify({'error': 'Session ID and Analysis ID required'}), 400
            
        # Update feedback
        success = analysis_service.update_user_feedback(session_id, analysis_id, feedback)
        
        if success:
            return jsonify({
                'status': 'success',
                'message': 'Feedback recorded'
            })
        else:
            return jsonify({'error': 'Failed to record feedback'}), 500
            
    except Exception as e:
        logger.error(f"Error submitting feedback: {str(e)}")
        return jsonify({'error': f'Feedback submission failed: {str(e)}'}), 500

@api_bp.route('/knowledge/search', methods=['POST'])
def search_knowledge():
    """Search knowledge base"""
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({'error': 'No search query provided'}), 400
            
        query = data['query']
        category = data.get('category')
        limit = data.get('limit', 10)
        
        results = vector_db.search_knowledge(query, category, limit)
        
        return jsonify({
            'status': 'success',
            'results': results,
            'query': query
        })
        
    except Exception as e:
        logger.error(f"Error searching knowledge base: {str(e)}")
        return jsonify({'error': f'Knowledge search failed: {str(e)}'}), 500

@api_bp.route('/knowledge/stats')
def get_knowledge_stats():
    """Get knowledge base statistics"""
    try:
        stats = vector_db.get_collection_stats()
        
        return jsonify({
            'status': 'success',
            'stats': stats
        })
        
    except Exception as e:
        logger.error(f"Error getting knowledge stats: {str(e)}")
        return jsonify({'error': f'Failed to retrieve stats: {str(e)}'}), 500

# Socket.IO event handlers
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    session_id = session.get('session_id')
    if session_id:
        join_room(session_id)
        emit('connected', {'session_id': session_id})
        logger.info(f"Client connected to session {session_id}")

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    session_id = session.get('session_id')
    if session_id:
        leave_room(session_id)
        logger.info(f"Client disconnected from session {session_id}")

@socketio.on('send_message')
def handle_message(data):
    """Handle tactical-command communication"""
    try:
        session_id = session.get('session_id')
        if not session_id:
            return
            
        # Create communication record
        communication = Communication(
            session_id=session_id,
            sender_type=data.get('sender_type', 'tactical'),
            message=data.get('message', ''),
            message_type=data.get('message_type', 'text'),
            metadata=data.get('metadata', {})
        )
        
        db.session.add(communication)
        db.session.commit()
        
        # Broadcast message to all clients in session
        emit('message_received', {
            'id': communication.id,
            'sender_type': communication.sender_type,
            'message': communication.message,
            'message_type': communication.message_type,
            'timestamp': communication.timestamp.isoformat(),
            'metadata': communication.metadata
        }, room=session_id)
        
    except Exception as e:
        logger.error(f"Error handling message: {str(e)}")
        db.session.rollback()

@socketio.on('request_analysis_update')
def handle_analysis_update_request(data):
    """Handle request for analysis update"""
    try:
        session_id = session.get('session_id')
        if not session_id:
            return
            
        # Get latest analysis for session
        history = analysis_service.get_analysis_history(session_id)
        
        if history:
            latest_analysis = history[0]
            emit('analysis_update', {
                'session_id': session_id,
                'analysis_results': latest_analysis,
                'timestamp': time.time()
            })
            
    except Exception as e:
        logger.error(f"Error handling analysis update request: {str(e)}")

@socketio.on('join_session')
def handle_join_session(data):
    """Handle joining a specific session"""
    try:
        new_session_id = data.get('session_id')
        if new_session_id:
            # Leave current session
            current_session = session.get('session_id')
            if current_session:
                leave_room(current_session)
                
            # Join new session
            join_room(new_session_id)
            session['session_id'] = new_session_id
            
            emit('session_joined', {'session_id': new_session_id})
            logger.info(f"Client joined session {new_session_id}")
            
    except Exception as e:
        logger.error(f"Error joining session: {str(e)}")
