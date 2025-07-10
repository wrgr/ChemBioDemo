"""
Audit and Compliance API Routes
Provides endpoints for audit trail access and compliance reporting
"""

from flask import Blueprint, request, jsonify, session
from datetime import datetime, timedelta
import logging
from services.audit_service import audit_service
from models import AuditLog, ComplianceReport

audit_bp = Blueprint('audit', __name__, url_prefix='/api/audit')
logger = logging.getLogger(__name__)

@audit_bp.route('/log', methods=['POST'])
def create_audit_log():
    """Create an audit log entry"""
    try:
        data = request.get_json()
        
        audit_id = audit_service.log_activity(
            action_type=data.get('action_type'),
            action_details=data.get('action_details', {}),
            resource_accessed=data.get('resource_accessed'),
            outcome=data.get('outcome', 'success'),
            classification_level=data.get('classification_level', 'unclassified')
        )
        
        if audit_id:
            return jsonify({
                'status': 'success',
                'audit_id': audit_id,
                'message': 'Audit log created successfully'
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Failed to create audit log'
            }), 500
            
    except Exception as e:
        logger.error(f"Error creating audit log: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@audit_bp.route('/trail', methods=['GET'])
def get_audit_trail():
    """Retrieve audit trail with optional filters"""
    try:
        # Parse query parameters
        session_id = request.args.get('session_id')
        user_type = request.args.get('user_type')
        action_type = request.args.get('action_type')
        limit = int(request.args.get('limit', 100))
        
        # Parse date filters
        start_date = None
        end_date = None
        
        if request.args.get('start_date'):
            start_date = datetime.fromisoformat(request.args.get('start_date'))
        
        if request.args.get('end_date'):
            end_date = datetime.fromisoformat(request.args.get('end_date'))
        
        # Get audit trail
        audit_trail = audit_service.get_audit_trail(
            session_id=session_id,
            user_type=user_type,
            action_type=action_type,
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )
        
        return jsonify({
            'status': 'success',
            'audit_trail': audit_trail,
            'count': len(audit_trail)
        })
        
    except Exception as e:
        logger.error(f"Error retrieving audit trail: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@audit_bp.route('/reports/generate', methods=['POST'])
def generate_compliance_report():
    """Generate a compliance report"""
    try:
        data = request.get_json()
        
        report_type = data.get('report_type', 'daily')
        
        # Parse date range
        if data.get('start_date') and data.get('end_date'):
            start_date = datetime.fromisoformat(data.get('start_date'))
            end_date = datetime.fromisoformat(data.get('end_date'))
        else:
            # Default to last 24 hours for daily report
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=1)
        
        report_id = audit_service.generate_compliance_report(
            report_type=report_type,
            start_date=start_date,
            end_date=end_date
        )
        
        if report_id:
            return jsonify({
                'status': 'success',
                'report_id': report_id,
                'message': 'Compliance report generated successfully'
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Failed to generate compliance report'
            }), 500
            
    except Exception as e:
        logger.error(f"Error generating compliance report: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@audit_bp.route('/reports', methods=['GET'])
def get_compliance_reports():
    """Retrieve compliance reports"""
    try:
        report_type = request.args.get('report_type')
        limit = int(request.args.get('limit', 50))
        
        reports = audit_service.get_compliance_reports(
            report_type=report_type,
            limit=limit
        )
        
        return jsonify({
            'status': 'success',
            'reports': reports,
            'count': len(reports)
        })
        
    except Exception as e:
        logger.error(f"Error retrieving compliance reports: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@audit_bp.route('/reports/<int:report_id>', methods=['GET'])
def get_compliance_report_details():
    """Get detailed compliance report"""
    try:
        report = ComplianceReport.query.get_or_404(report_id)
        
        return jsonify({
            'status': 'success',
            'report': {
                'id': report.id,
                'report_type': report.report_type,
                'period_start': report.report_period_start.isoformat(),
                'period_end': report.report_period_end.isoformat(),
                'generated_timestamp': report.timestamp.isoformat(),
                'generated_by': report.generated_by,
                'compliance_score': report.compliance_score,
                'report_data': report.report_data,
                'findings': report.findings,
                'recommendations': report.recommendations,
                'status': report.status
            }
        })
        
    except Exception as e:
        logger.error(f"Error retrieving compliance report details: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@audit_bp.route('/retention/status', methods=['GET'])
def get_retention_status():
    """Check data retention compliance status"""
    try:
        retention_status = audit_service.check_data_retention_compliance()
        
        return jsonify({
            'status': 'success',
            'retention_status': retention_status
        })
        
    except Exception as e:
        logger.error(f"Error checking retention status: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@audit_bp.route('/dashboard', methods=['GET'])
def get_audit_dashboard():
    """Get audit dashboard data"""
    try:
        # Get recent activity summary
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)  # Last 7 days
        
        recent_activity = audit_service.get_audit_trail(
            start_date=start_date,
            end_date=end_date,
            limit=10
        )
        
        # Get retention status
        retention_status = audit_service.check_data_retention_compliance()
        
        # Get recent compliance reports
        recent_reports = audit_service.get_compliance_reports(limit=5)
        
        return jsonify({
            'status': 'success',
            'dashboard': {
                'recent_activity': recent_activity,
                'retention_status': retention_status,
                'recent_reports': recent_reports,
                'summary': {
                    'total_activities_7d': len(recent_activity),
                    'compliance_items': retention_status.get('compliant_items', 0),
                    'items_due_for_purge': len(retention_status.get('items_due_for_purge', [])),
                    'latest_report_score': recent_reports[0].get('compliance_score') if recent_reports else None
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error retrieving audit dashboard: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@audit_bp.route('/export', methods=['POST'])
def export_audit_data():
    """Export audit data for external compliance systems"""
    try:
        # Log the export activity
        audit_service.log_activity(
            action_type='export',
            action_details={
                'export_type': 'audit_data',
                'requested_by': session.get('user_type', 'unknown')
            },
            classification_level='restricted'
        )
        
        data = request.get_json()
        
        # Parse export parameters
        start_date = datetime.fromisoformat(data.get('start_date'))
        end_date = datetime.fromisoformat(data.get('end_date'))
        export_format = data.get('format', 'json')
        
        # Get audit data for export
        audit_data = audit_service.get_audit_trail(
            start_date=start_date,
            end_date=end_date,
            limit=10000  # Large limit for export
        )
        
        export_package = {
            'export_metadata': {
                'generated_at': datetime.utcnow().isoformat(),
                'period_start': start_date.isoformat(),
                'period_end': end_date.isoformat(),
                'record_count': len(audit_data),
                'format': export_format
            },
            'audit_records': audit_data
        }
        
        return jsonify({
            'status': 'success',
            'export_data': export_package,
            'message': f'Exported {len(audit_data)} audit records'
        })
        
    except Exception as e:
        logger.error(f"Error exporting audit data: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500