/**
 * CSV Export Utility
 * Provides functions to export data to CSV format
 */

export interface CSVExportOptions {
  filename?: string;
  headers?: string[];
  delimiter?: string;
  includeTimestamp?: boolean;
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  options: CSVExportOptions = {}
): string {
  if (!data || data.length === 0) {
    return '';
  }

  const {
    headers = Object.keys(data[0]),
    delimiter = ',',
    includeTimestamp = true
  } = options;

  // Escape CSV values
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    
    const stringValue = String(value);
    
    // If the value contains delimiter, newline, or quote, wrap it in quotes
    if (stringValue.includes(delimiter) || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  };

  // Create CSV content
  const csvRows: string[] = [];
  
  // Add headers
  csvRows.push(headers.map(escapeCSV).join(delimiter));
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => escapeCSV(row[header]));
    csvRows.push(values.join(delimiter));
  });

  return csvRows.join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(
  csvContent: string,
  filename: string = 'export.csv'
): void {
  // Add timestamp to filename if not already present
  if (!filename.includes('_') && !filename.includes('export')) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    filename = `${filename.replace('.csv', '')}_${timestamp}.csv`;
  }

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Export users data to CSV
 */
export function exportUsersToCSV(users: any[], filename: string = 'users_export.csv'): void {
  const headers = [
    'ID',
    'Email',
    'First Name',
    'Last Name',
    'Role',
    'Status',
    'Organization',
    'Signup Reason',
    'Research Area',
    'Created At',
    'Last Login',
    'Approved At',
    'Approved By'
  ];

  const csvData = users.map(user => ({
    'ID': user.id || user.user_id || '',
    'Email': user.email || '',
    'First Name': user.first_name || '',
    'Last Name': user.last_name || '',
    'Role': user.role || user.role_type || '',
    'Status': user.status || '',
    'Organization': user.organization || '',
    'Signup Reason': user.signup_reason || '',
    'Research Area': user.research_area || '',
    'Created At': user.created_at ? new Date(user.created_at).toLocaleString() : '',
    'Last Login': user.last_login ? new Date(user.last_login).toLocaleString() : '',
    'Approved At': user.approved_at ? new Date(user.approved_at).toLocaleString() : '',
    'Approved By': user.approved_by || ''
  }));

  const csvContent = arrayToCSV(csvData, { headers });
  downloadCSV(csvContent, filename);
}

/**
 * Export organizations data to CSV
 */
export function exportOrganizationsToCSV(organizations: any[], filename: string = 'organizations_export.csv'): void {
  const headers = [
    'ID',
    'Name',
    'Type',
    'Admin Email',
    'Admin Name',
    'Member Count',
    'Created At',
    'Updated At'
  ];

  const csvData = organizations.map(org => ({
    'ID': org.id || '',
    'Name': org.name || '',
    'Type': org.type || '',
    'Admin Email': org.admin_email || '',
    'Admin Name': org.admin_name || '',
    'Member Count': org.member_count || 0,
    'Created At': org.created_at ? new Date(org.created_at).toLocaleString() : '',
    'Updated At': org.updated_at ? new Date(org.updated_at).toLocaleString() : ''
  }));

  const csvContent = arrayToCSV(csvData, { headers });
  downloadCSV(csvContent, filename);
}

/**
 * Export services data to CSV
 */
export function exportServicesToCSV(services: any[], filename: string = 'services_export.csv'): void {
  const headers = [
    'ID',
    'Name',
    'Type',
    'Description',
    'Status',
    'Endpoint',
    'Access Level',
    'Created At',
    'Updated At'
  ];

  const csvData = services.map(service => ({
    'ID': service.id || '',
    'Name': service.name || '',
    'Type': service.type || '',
    'Description': service.description || '',
    'Status': service.status || '',
    'Endpoint': service.endpoint || '',
    'Access Level': service.access_level || '',
    'Created At': service.created_at ? new Date(service.created_at).toLocaleString() : '',
    'Updated At': service.updated_at ? new Date(service.updated_at).toLocaleString() : ''
  }));

  const csvContent = arrayToCSV(csvData, { headers });
  downloadCSV(csvContent, filename);
}

/**
 * Export audit log data to CSV
 */
export function exportAuditLogToCSV(auditLogs: any[], filename: string = 'audit_log_export.csv'): void {
  const headers = [
    'ID',
    'User ID',
    'Action Type',
    'Action Description',
    'IP Address',
    'User Agent',
    'Created At'
  ];

  const csvData = auditLogs.map(log => ({
    'ID': log.id || '',
    'User ID': log.user_id || '',
    'Action Type': log.action_type || '',
    'Action Description': log.action_description || '',
    'IP Address': log.ip_address || '',
    'User Agent': log.user_agent || '',
    'Created At': log.created_at ? new Date(log.created_at).toLocaleString() : ''
  }));

  const csvContent = arrayToCSV(csvData, { headers });
  downloadCSV(csvContent, filename);
}

/**
 * Generic CSV export function
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  headers: string[],
  filename: string = 'data_export.csv'
): void {
  const csvContent = arrayToCSV(data, { headers });
  downloadCSV(csvContent, filename);
}
