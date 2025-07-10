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

class AuditLog(db.Model):
    """Model for storing audit trail and compliance data"""
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(64), nullable=False)
    user_type = db.Column(db.String(16), nullable=False)  # 'tactical', 'command'
    action_type = db.Column(db.String(32), nullable=False)  # 'analysis', 'upload', 'communication', 'data_access'
    action_details = db.Column(JSON)
    resource_accessed = db.Column(db.String(256))  # file path, analysis ID, etc.
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(45))  # IPv4/IPv6 address
    user_agent = db.Column(db.String(512))
    outcome = db.Column(db.String(16), default='success')  # 'success', 'failure', 'denied'
    compliance_flags = db.Column(JSON)  # regulatory compliance markers
    retention_date = db.Column(db.DateTime)  # data retention policy
    classification_level = db.Column(db.String(16), default='unclassified')  # security classification

class ComplianceReport(db.Model):
    """Model for storing compliance reports"""
    id = db.Column(db.Integer, primary_key=True)
    report_type = db.Column(db.String(32), nullable=False)  # 'daily', 'weekly', 'monthly', 'incident'
    report_period_start = db.Column(db.DateTime, nullable=False)
    report_period_end = db.Column(db.DateTime, nullable=False)
    report_data = db.Column(JSON)  # aggregated compliance data
    generated_by = db.Column(db.String(64))  # system or user ID
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(16), default='generated')  # 'generated', 'reviewed', 'approved'
    compliance_score = db.Column(db.Float)  # overall compliance score
    findings = db.Column(JSON)  # compliance issues found
    recommendations = db.Column(JSON)  # compliance recommendations

class DataRetention(db.Model):
    """Model for tracking data retention policies"""
    id = db.Column(db.Integer, primary_key=True)
    data_type = db.Column(db.String(32), nullable=False)  # 'analysis', 'communication', 'sensor_data'
    retention_period_days = db.Column(db.Integer, nullable=False)
    data_classification = db.Column(db.String(16))  # security classification
    regulatory_basis = db.Column(db.String(128))  # legal/regulatory requirement
    purge_after_days = db.Column(db.Integer)  # automatic purge period
    archive_location = db.Column(db.String(256))  # archive storage location
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(16), default='active')  # 'active', 'suspended', 'archived'
