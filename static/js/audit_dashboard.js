// Audit Dashboard JavaScript
let auditDashboard = {
    data: null,
    refreshInterval: null
};

// Initialize audit dashboard
function initializeAuditDashboard() {
    console.log('Initializing audit dashboard...');
    
    // Load initial data
    loadAuditDashboard();
    
    // Set up auto-refresh
    auditDashboard.refreshInterval = setInterval(loadAuditDashboard, 60000); // Refresh every minute
    
    // Initialize modals
    initializeModals();
    
    // Set default dates for forms
    setDefaultDates();
}

// Load audit dashboard data
function loadAuditDashboard() {
    fetch('/api/audit/dashboard')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                auditDashboard.data = data.dashboard;
                updateDashboardDisplay(data.dashboard);
            } else {
                showAlert('Failed to load audit dashboard: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error loading audit dashboard:', error);
            showAlert('Error loading audit dashboard', 'danger');
        });
}

// Update dashboard display
function updateDashboardDisplay(dashboardData) {
    // Update summary cards
    updateSummaryCards(dashboardData.summary);
    
    // Update audit trail table
    updateAuditTrailTable(dashboardData.recent_activity);
    
    // Update retention status
    updateRetentionStatus(dashboardData.retention_status);
    
    // Update recent reports
    updateRecentReports(dashboardData.recent_reports);
}

// Update summary cards
function updateSummaryCards(summary) {
    document.getElementById('recentActivityCount').textContent = summary.total_activities_7d || 0;
    document.getElementById('complianceScore').textContent = 
        summary.latest_report_score ? summary.latest_report_score.toFixed(1) + '%' : 'N/A';
    document.getElementById('retentionItemsCount').textContent = summary.items_due_for_purge || 0;
    document.getElementById('compliantItemsCount').textContent = summary.compliance_items || 0;
}

// Update audit trail table
function updateAuditTrailTable(auditTrail) {
    const tbody = document.getElementById('auditTrailTable');
    
    if (!auditTrail || auditTrail.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">No recent audit activity</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = auditTrail.map(entry => `
        <tr>
            <td>
                <small>${formatTimestamp(entry.timestamp)}</small>
            </td>
            <td>
                <span class="badge bg-${getUserTypeBadgeColor(entry.user_type)}">${entry.user_type}</span>
            </td>
            <td>${formatActionType(entry.action_type)}</td>
            <td>
                <small class="text-muted">${entry.resource_accessed || 'N/A'}</small>
            </td>
            <td>
                <span class="badge bg-${getOutcomeBadgeColor(entry.outcome)}">${entry.outcome}</span>
            </td>
            <td>
                <span class="badge bg-secondary">${entry.classification_level}</span>
            </td>
        </tr>
    `).join('');
}

// Update retention status
function updateRetentionStatus(retentionStatus) {
    const container = document.getElementById('retentionStatus');
    
    if (!retentionStatus) {
        container.innerHTML = '<div class="text-muted">No retention data available</div>';
        return;
    }
    
    const dueForPurge = retentionStatus.items_due_for_purge?.length || 0;
    const dueForArchive = retentionStatus.items_due_for_archive?.length || 0;
    
    container.innerHTML = `
        <div class="row g-2">
            <div class="col-6">
                <div class="text-center">
                    <div class="h4 text-success">${retentionStatus.compliant_items || 0}</div>
                    <small class="text-muted">Compliant</small>
                </div>
            </div>
            <div class="col-6">
                <div class="text-center">
                    <div class="h4 text-warning">${dueForPurge}</div>
                    <small class="text-muted">Due for Purge</small>
                </div>
            </div>
        </div>
        ${dueForArchive > 0 ? `
            <div class="mt-2">
                <small class="text-info">
                    <i class="bi bi-info-circle me-1"></i>
                    ${dueForArchive} items due for archive
                </small>
            </div>
        ` : ''}
    `;
}

// Update recent reports
function updateRecentReports(reports) {
    const container = document.getElementById('recentReports');
    
    if (!reports || reports.length === 0) {
        container.innerHTML = '<div class="text-muted">No recent reports</div>';
        return;
    }
    
    container.innerHTML = reports.map(report => `
        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
            <div>
                <div class="fw-bold">${formatReportType(report.report_type)}</div>
                <small class="text-muted">${formatTimestamp(report.generated_timestamp)}</small>
            </div>
            <div class="text-end">
                <div class="badge bg-${getComplianceScoreBadgeColor(report.compliance_score)}">
                    ${report.compliance_score ? report.compliance_score.toFixed(1) + '%' : 'N/A'}
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary mt-1" onclick="viewReport(${report.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Generate compliance report
function generateComplianceReport() {
    const modal = new bootstrap.Modal(document.getElementById('generateReportModal'));
    modal.show();
}

// Submit report generation
function submitReportGeneration() {
    const form = document.getElementById('reportGenerationForm');
    const formData = new FormData(form);
    
    const reportData = {
        report_type: formData.get('reportType') || document.getElementById('reportType').value,
        start_date: document.getElementById('reportStartDate').value,
        end_date: document.getElementById('reportEndDate').value
    };
    
    // Validate dates
    if (!reportData.start_date || !reportData.end_date) {
        showAlert('Please select both start and end dates', 'warning');
        return;
    }
    
    if (new Date(reportData.start_date) >= new Date(reportData.end_date)) {
        showAlert('Start date must be before end date', 'warning');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#generateReportModal .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';
    submitBtn.disabled = true;
    
    fetch('/api/audit/reports/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
    })
    .then(response => response.json())
    .then(data => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (data.status === 'success') {
            showAlert('Compliance report generated successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('generateReportModal')).hide();
            loadAuditDashboard(); // Refresh dashboard
        } else {
            showAlert('Failed to generate report: ' + data.message, 'danger');
        }
    })
    .catch(error => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        console.error('Error generating report:', error);
        showAlert('Error generating report', 'danger');
    });
}

// Export audit data
function exportAuditData() {
    const modal = new bootstrap.Modal(document.getElementById('exportDataModal'));
    modal.show();
}

// Submit data export
function submitDataExport() {
    const exportData = {
        start_date: document.getElementById('exportStartDate').value,
        end_date: document.getElementById('exportEndDate').value,
        format: document.getElementById('exportFormat').value
    };
    
    // Validate dates
    if (!exportData.start_date || !exportData.end_date) {
        showAlert('Please select both start and end dates', 'warning');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#exportDataModal .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Exporting...';
    submitBtn.disabled = true;
    
    fetch('/api/audit/export', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData)
    })
    .then(response => response.json())
    .then(data => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (data.status === 'success') {
            // Download the exported data
            downloadExportData(data.export_data, exportData.format);
            showAlert('Audit data exported successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('exportDataModal')).hide();
        } else {
            showAlert('Failed to export data: ' + data.message, 'danger');
        }
    })
    .catch(error => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        console.error('Error exporting data:', error);
        showAlert('Error exporting data', 'danger');
    });
}

// Download export data
function downloadExportData(exportData, format) {
    let content, mimeType, filename;
    
    switch (format) {
        case 'json':
            content = JSON.stringify(exportData, null, 2);
            mimeType = 'application/json';
            filename = `audit_export_${new Date().toISOString().split('T')[0]}.json`;
            break;
        case 'csv':
            content = convertToCSV(exportData.audit_records);
            mimeType = 'text/csv';
            filename = `audit_export_${new Date().toISOString().split('T')[0]}.csv`;
            break;
        case 'xml':
            content = convertToXML(exportData);
            mimeType = 'application/xml';
            filename = `audit_export_${new Date().toISOString().split('T')[0]}.xml`;
            break;
        default:
            content = JSON.stringify(exportData, null, 2);
            mimeType = 'application/json';
            filename = `audit_export_${new Date().toISOString().split('T')[0]}.json`;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Convert to CSV format
function convertToCSV(records) {
    if (!records || records.length === 0) return '';
    
    const headers = ['timestamp', 'session_id', 'user_type', 'action_type', 'resource_accessed', 'outcome', 'classification_level'];
    const csvContent = [
        headers.join(','),
        ...records.map(record => 
            headers.map(header => {
                const value = record[header] || '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            }).join(',')
        )
    ].join('\n');
    
    return csvContent;
}

// Convert to XML format
function convertToXML(exportData) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<audit_export>\n';
    xml += `  <metadata>\n`;
    xml += `    <generated_at>${exportData.export_metadata.generated_at}</generated_at>\n`;
    xml += `    <period_start>${exportData.export_metadata.period_start}</period_start>\n`;
    xml += `    <period_end>${exportData.export_metadata.period_end}</period_end>\n`;
    xml += `    <record_count>${exportData.export_metadata.record_count}</record_count>\n`;
    xml += `  </metadata>\n`;
    xml += `  <records>\n`;
    
    exportData.audit_records.forEach(record => {
        xml += `    <record>\n`;
        Object.entries(record).forEach(([key, value]) => {
            xml += `      <${key}>${value || ''}</${key}>\n`;
        });
        xml += `    </record>\n`;
    });
    
    xml += `  </records>\n</audit_export>`;
    return xml;
}

// View specific report
function viewReport(reportId) {
    fetch(`/api/audit/reports/${reportId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                displayReportDetails(data.report);
            } else {
                showAlert('Failed to load report: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error loading report:', error);
            showAlert('Error loading report', 'danger');
        });
}

// Display report details
function displayReportDetails(report) {
    // Create a modal or navigate to a detailed view
    // For now, show basic details in an alert
    const details = `
        Report Type: ${report.report_type}
        Period: ${formatTimestamp(report.period_start)} to ${formatTimestamp(report.period_end)}
        Compliance Score: ${report.compliance_score}%
        Findings: ${report.findings?.length || 0}
        Recommendations: ${report.recommendations?.length || 0}
    `;
    
    showAlert(details, 'info', 10000);
}

// Refresh audit trail
function refreshAuditTrail() {
    loadAuditDashboard();
    showAlert('Audit trail refreshed', 'success', 2000);
}

// Filter audit trail (placeholder)
function filterAuditTrail() {
    showAlert('Filter functionality coming soon', 'info', 3000);
}

// Initialize modals
function initializeModals() {
    // No additional initialization needed for Bootstrap modals
}

// Set default dates for forms
function setDefaultDates() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Format dates for datetime-local input
    const formatDate = (date) => {
        return date.toISOString().slice(0, 16);
    };
    
    // Set default dates for report generation (last 24 hours)
    document.getElementById('reportStartDate').value = formatDate(yesterday);
    document.getElementById('reportEndDate').value = formatDate(now);
    
    // Set default dates for export (last week)
    document.getElementById('exportStartDate').value = formatDate(lastWeek);
    document.getElementById('exportEndDate').value = formatDate(now);
}

// Utility functions
function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}

function formatActionType(actionType) {
    return actionType.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatReportType(reportType) {
    return reportType.charAt(0).toUpperCase() + reportType.slice(1) + ' Report';
}

function getUserTypeBadgeColor(userType) {
    switch (userType) {
        case 'command': return 'primary';
        case 'tactical': return 'success';
        default: return 'secondary';
    }
}

function getOutcomeBadgeColor(outcome) {
    switch (outcome) {
        case 'success': return 'success';
        case 'failure': return 'danger';
        case 'denied': return 'warning';
        default: return 'secondary';
    }
}

function getComplianceScoreBadgeColor(score) {
    if (!score) return 'secondary';
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
}

function showAlert(message, type = 'info', duration = 5000) {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertElement.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 1050;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to body
    document.body.appendChild(alertElement);
    
    // Auto dismiss after duration
    setTimeout(() => {
        if (alertElement.parentNode) {
            alertElement.remove();
        }
    }, duration);
}

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (auditDashboard.refreshInterval) {
        clearInterval(auditDashboard.refreshInterval);
    }
});