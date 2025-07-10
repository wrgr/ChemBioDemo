"""
Audit Trail and Compliance Service
Handles activity logging, compliance tracking, and regulatory reporting
"""

import logging
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from flask import request, session
from sqlalchemy import and_, or_, func, desc
from app import db
from models import AuditLog, ComplianceReport, DataRetention, SceneAnalysis, Communication, SensorData

logger = logging.getLogger(__name__)

class AuditService:
    """Service for handling audit trails and compliance"""
    
    def __init__(self):
        self.compliance_rules = self._load_compliance_rules()
    
    def log_activity(self, action_type: str, action_details: Dict[str, Any], 
                    resource_accessed: str = None, outcome: str = 'success',
                    classification_level: str = 'unclassified') -> int:
        """Log user activity for audit trail"""
        try:
            # Get session information
            session_id = session.get('session_id', 'unknown')
            user_type = session.get('user_type', 'unknown')
            
            # Get request information
            ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR'))
            user_agent = request.environ.get('HTTP_USER_AGENT', '')
            
            # Calculate retention date based on data type
            retention_date = self._calculate_retention_date(action_type, classification_level)
            
            # Check for compliance flags
            compliance_flags = self._check_compliance_flags(action_type, action_details, classification_level)
            
            # Create audit log entry
            audit_entry = AuditLog(
                session_id=session_id,
                user_type=user_type,
                action_type=action_type,
                action_details=action_details,
                resource_accessed=resource_accessed,
                ip_address=ip_address,
                user_agent=user_agent,
                outcome=outcome,
                compliance_flags=compliance_flags,
                retention_date=retention_date,
                classification_level=classification_level
            )
            
            db.session.add(audit_entry)
            db.session.commit()
            
            logger.info(f"Audit log created: {action_type} by {user_type} from {ip_address}")
            return audit_entry.id
            
        except Exception as e:
            logger.error(f"Failed to create audit log: {e}")
            db.session.rollback()
            return None
    
    def get_audit_trail(self, session_id: str = None, user_type: str = None,
                       action_type: str = None, start_date: datetime = None,
                       end_date: datetime = None, limit: int = 100) -> List[Dict]:
        """Retrieve audit trail with filters"""
        try:
            query = AuditLog.query
            
            # Apply filters
            if session_id:
                query = query.filter(AuditLog.session_id == session_id)
            if user_type:
                query = query.filter(AuditLog.user_type == user_type)
            if action_type:
                query = query.filter(AuditLog.action_type == action_type)
            if start_date:
                query = query.filter(AuditLog.timestamp >= start_date)
            if end_date:
                query = query.filter(AuditLog.timestamp <= end_date)
            
            # Order by timestamp desc and limit
            audit_logs = query.order_by(desc(AuditLog.timestamp)).limit(limit).all()
            
            return [self._format_audit_entry(log) for log in audit_logs]
            
        except Exception as e:
            logger.error(f"Failed to retrieve audit trail: {e}")
            return []
    
    def generate_compliance_report(self, report_type: str, start_date: datetime,
                                 end_date: datetime) -> Optional[int]:
        """Generate compliance report for specified period"""
        try:
            # Gather compliance data
            compliance_data = self._gather_compliance_data(start_date, end_date)
            
            # Calculate compliance score
            compliance_score = self._calculate_compliance_score(compliance_data)
            
            # Identify compliance findings
            findings = self._identify_compliance_findings(compliance_data)
            
            # Generate recommendations
            recommendations = self._generate_compliance_recommendations(findings)
            
            # Create compliance report
            report = ComplianceReport(
                report_type=report_type,
                report_period_start=start_date,
                report_period_end=end_date,
                report_data=compliance_data,
                generated_by='system',
                compliance_score=compliance_score,
                findings=findings,
                recommendations=recommendations
            )
            
            db.session.add(report)
            db.session.commit()
            
            logger.info(f"Compliance report generated: {report_type} for period {start_date} to {end_date}")
            return report.id
            
        except Exception as e:
            logger.error(f"Failed to generate compliance report: {e}")
            db.session.rollback()
            return None
    
    def get_compliance_reports(self, report_type: str = None, limit: int = 50) -> List[Dict]:
        """Retrieve compliance reports"""
        try:
            query = ComplianceReport.query
            
            if report_type:
                query = query.filter(ComplianceReport.report_type == report_type)
            
            reports = query.order_by(desc(ComplianceReport.timestamp)).limit(limit).all()
            
            return [self._format_compliance_report(report) for report in reports]
            
        except Exception as e:
            logger.error(f"Failed to retrieve compliance reports: {e}")
            return []
    
    def check_data_retention_compliance(self) -> Dict[str, Any]:
        """Check data retention compliance and identify items for purge"""
        try:
            retention_status = {
                'compliant_items': 0,
                'items_due_for_archive': [],
                'items_due_for_purge': [],
                'compliance_violations': []
            }
            
            current_date = datetime.utcnow()
            
            # Check audit logs retention
            overdue_audits = AuditLog.query.filter(
                AuditLog.retention_date < current_date
            ).all()
            
            for audit in overdue_audits:
                retention_status['items_due_for_purge'].append({
                    'type': 'audit_log',
                    'id': audit.id,
                    'retention_date': audit.retention_date.isoformat(),
                    'days_overdue': (current_date - audit.retention_date).days
                })
            
            # Check scene analyses retention
            old_analyses = SceneAnalysis.query.filter(
                SceneAnalysis.timestamp < (current_date - timedelta(days=365))
            ).all()
            
            for analysis in old_analyses:
                retention_status['items_due_for_archive'].append({
                    'type': 'scene_analysis',
                    'id': analysis.id,
                    'timestamp': analysis.timestamp.isoformat(),
                    'session_id': analysis.session_id
                })
            
            # Check communications retention
            old_communications = Communication.query.filter(
                Communication.timestamp < (current_date - timedelta(days=90))
            ).all()
            
            for comm in old_communications:
                retention_status['items_due_for_purge'].append({
                    'type': 'communication',
                    'id': comm.id,
                    'timestamp': comm.timestamp.isoformat(),
                    'session_id': comm.session_id
                })
            
            retention_status['compliant_items'] = (
                AuditLog.query.filter(AuditLog.retention_date >= current_date).count() +
                SceneAnalysis.query.filter(SceneAnalysis.timestamp >= (current_date - timedelta(days=365))).count() +
                Communication.query.filter(Communication.timestamp >= (current_date - timedelta(days=90))).count()
            )
            
            return retention_status
            
        except Exception as e:
            logger.error(f"Failed to check data retention compliance: {e}")
            return {'error': str(e)}
    
    def _load_compliance_rules(self) -> Dict[str, Any]:
        """Load compliance rules and regulations"""
        return {
            'data_retention': {
                'audit_logs': {'days': 2555, 'classification': 'restricted'},  # 7 years
                'scene_analysis': {'days': 365, 'classification': 'confidential'},  # 1 year
                'communications': {'days': 90, 'classification': 'internal'},  # 3 months
                'sensor_data': {'days': 30, 'classification': 'internal'}  # 1 month
            },
            'access_controls': {
                'tactical_access': ['scene_analysis', 'communications', 'sensor_data'],
                'command_access': ['all']
            },
            'encryption_requirements': {
                'at_rest': True,
                'in_transit': True,
                'key_rotation_days': 90
            },
            'audit_requirements': {
                'all_access': True,
                'failed_access': True,
                'data_modification': True,
                'export_operations': True
            }
        }
    
    def _calculate_retention_date(self, action_type: str, classification_level: str) -> datetime:
        """Calculate retention date based on action type and classification"""
        base_retention_days = {
            'analysis': 365,
            'upload': 365,
            'communication': 90,
            'data_access': 2555,  # 7 years for audit logs
            'export': 2555
        }
        
        # Extend retention for higher classifications
        classification_multiplier = {
            'unclassified': 1.0,
            'internal': 1.5,
            'confidential': 2.0,
            'restricted': 3.0
        }
        
        base_days = base_retention_days.get(action_type, 365)
        multiplier = classification_multiplier.get(classification_level, 1.0)
        retention_days = int(base_days * multiplier)
        
        return datetime.utcnow() + timedelta(days=retention_days)
    
    def _check_compliance_flags(self, action_type: str, action_details: Dict,
                               classification_level: str) -> Dict[str, Any]:
        """Check for compliance flags and violations"""
        flags = {
            'requires_review': False,
            'sensitive_data': False,
            'export_controlled': False,
            'retention_extended': False
        }
        
        # Check for sensitive data indicators
        if classification_level in ['confidential', 'restricted']:
            flags['sensitive_data'] = True
            flags['requires_review'] = True
        
        # Check for export-controlled data
        if action_type == 'export' or 'export' in str(action_details):
            flags['export_controlled'] = True
            flags['requires_review'] = True
        
        # Check for extended retention requirements
        if classification_level == 'restricted':
            flags['retention_extended'] = True
        
        return flags
    
    def _gather_compliance_data(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Gather compliance data for reporting period"""
        data = {
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            },
            'activity_summary': {},
            'access_patterns': {},
            'data_handling': {},
            'retention_compliance': {}
        }
        
        # Activity summary
        activities = db.session.query(
            AuditLog.action_type,
            func.count(AuditLog.id).label('count')
        ).filter(
            and_(AuditLog.timestamp >= start_date, AuditLog.timestamp <= end_date)
        ).group_by(AuditLog.action_type).all()
        
        data['activity_summary'] = {activity.action_type: activity.count for activity in activities}
        
        # Access patterns
        access_patterns = db.session.query(
            AuditLog.user_type,
            AuditLog.outcome,
            func.count(AuditLog.id).label('count')
        ).filter(
            and_(AuditLog.timestamp >= start_date, AuditLog.timestamp <= end_date)
        ).group_by(AuditLog.user_type, AuditLog.outcome).all()
        
        for pattern in access_patterns:
            user_type = pattern.user_type
            if user_type not in data['access_patterns']:
                data['access_patterns'][user_type] = {}
            data['access_patterns'][user_type][pattern.outcome] = pattern.count
        
        # Data handling compliance
        sensitive_data_access = AuditLog.query.filter(
            and_(
                AuditLog.timestamp >= start_date,
                AuditLog.timestamp <= end_date,
                AuditLog.classification_level.in_(['confidential', 'restricted'])
            )
        ).count()
        
        data['data_handling']['sensitive_access_count'] = sensitive_data_access
        
        return data
    
    def _calculate_compliance_score(self, compliance_data: Dict[str, Any]) -> float:
        """Calculate overall compliance score"""
        score = 100.0
        
        # Deduct points for failed access attempts
        access_patterns = compliance_data.get('access_patterns', {})
        total_access = 0
        failed_access = 0
        
        for user_type, outcomes in access_patterns.items():
            total_access += sum(outcomes.values())
            failed_access += outcomes.get('failure', 0)
        
        if total_access > 0:
            failure_rate = failed_access / total_access
            score -= (failure_rate * 20)  # Max 20 point deduction for failures
        
        # Deduct points for compliance violations
        # This would be expanded based on specific compliance requirements
        
        return max(0.0, min(100.0, score))
    
    def _identify_compliance_findings(self, compliance_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify compliance issues and findings"""
        findings = []
        
        # Check for excessive failed access attempts
        access_patterns = compliance_data.get('access_patterns', {})
        for user_type, outcomes in access_patterns.items():
            failures = outcomes.get('failure', 0)
            total = sum(outcomes.values())
            
            if total > 0 and failures / total > 0.1:  # More than 10% failure rate
                findings.append({
                    'severity': 'medium',
                    'category': 'access_control',
                    'description': f'High failure rate for {user_type} users: {failures}/{total} attempts failed',
                    'recommendation': 'Review access controls and user training'
                })
        
        # Check for unusual activity patterns
        activity_summary = compliance_data.get('activity_summary', {})
        if activity_summary.get('data_access', 0) > 1000:  # Threshold for review
            findings.append({
                'severity': 'low',
                'category': 'data_access',
                'description': 'High volume of data access events detected',
                'recommendation': 'Review data access patterns for appropriateness'
            })
        
        return findings
    
    def _generate_compliance_recommendations(self, findings: List[Dict[str, Any]]) -> List[str]:
        """Generate compliance recommendations based on findings"""
        recommendations = []
        
        high_severity_count = len([f for f in findings if f.get('severity') == 'high'])
        medium_severity_count = len([f for f in findings if f.get('severity') == 'medium'])
        
        if high_severity_count > 0:
            recommendations.append('Immediate review required - high severity compliance issues detected')
        
        if medium_severity_count > 0:
            recommendations.append('Schedule compliance review within 7 days')
        
        # Category-specific recommendations
        categories = set(f.get('category') for f in findings)
        
        if 'access_control' in categories:
            recommendations.append('Review and update access control policies')
        
        if 'data_access' in categories:
            recommendations.append('Implement additional monitoring for data access patterns')
        
        if not findings:
            recommendations.append('No compliance issues identified - maintain current practices')
        
        return recommendations
    
    def _format_audit_entry(self, audit_log: AuditLog) -> Dict[str, Any]:
        """Format audit log entry for API response"""
        return {
            'id': audit_log.id,
            'session_id': audit_log.session_id,
            'user_type': audit_log.user_type,
            'action_type': audit_log.action_type,
            'action_details': audit_log.action_details,
            'resource_accessed': audit_log.resource_accessed,
            'timestamp': audit_log.timestamp.isoformat(),
            'ip_address': audit_log.ip_address,
            'outcome': audit_log.outcome,
            'compliance_flags': audit_log.compliance_flags,
            'classification_level': audit_log.classification_level
        }
    
    def _format_compliance_report(self, report: ComplianceReport) -> Dict[str, Any]:
        """Format compliance report for API response"""
        return {
            'id': report.id,
            'report_type': report.report_type,
            'period_start': report.report_period_start.isoformat(),
            'period_end': report.report_period_end.isoformat(),
            'generated_timestamp': report.timestamp.isoformat(),
            'compliance_score': report.compliance_score,
            'findings_count': len(report.findings) if report.findings else 0,
            'recommendations_count': len(report.recommendations) if report.recommendations else 0,
            'status': report.status
        }

# Global audit service instance
audit_service = AuditService()