from app import db
from datetime import datetime
from sqlalchemy import Text, JSON

class SceneAnalysis(db.Model):
    """Model for storing scene analysis results"""
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(64), nullable=False)
    image_path = db.Column(db.String(256))
    video_path = db.Column(db.String(256))
    youtube_url = db.Column(db.String(512))
    analysis_results = db.Column(JSON)
    confidence_scores = db.Column(JSON)
    agent_outputs = db.Column(JSON)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_feedback = db.Column(JSON)
    status = db.Column(db.String(32), default='active')

class Communication(db.Model):
    """Model for tactical-command communication"""
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(64), nullable=False)
    sender_type = db.Column(db.String(16), nullable=False)  # 'tactical' or 'command'
    message = db.Column(Text, nullable=False)
    message_type = db.Column(db.String(32), default='text')  # 'text', 'image', 'alert'
    message_metadata = db.Column(JSON)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    read_status = db.Column(db.Boolean, default=False)

class SensorData(db.Model):
    """Model for storing sensor readings"""
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(64), nullable=False)
    sensor_type = db.Column(db.String(32), nullable=False)
    reading_value = db.Column(db.Float)
    unit = db.Column(db.String(16))
    location = db.Column(db.String(128))
    confidence = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    alert_level = db.Column(db.String(16), default='normal')  # 'normal', 'warning', 'critical'

class KnowledgeBase(db.Model):
    """Model for storing RAG knowledge base entries"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(256), nullable=False)
    content = db.Column(Text, nullable=False)
    category = db.Column(db.String(64))
    tags = db.Column(JSON)
    embedding_id = db.Column(db.String(128))
    source = db.Column(db.String(256))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    access_level = db.Column(db.String(16), default='tactical')  # 'tactical', 'command', 'restricted'
