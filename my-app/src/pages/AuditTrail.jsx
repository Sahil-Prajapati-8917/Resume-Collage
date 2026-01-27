import React, { useState } from 'react'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

const AuditTrail = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('all')
  const [filterDate, setFilterDate] = useState('all')
  const [selectedEntry, setSelectedEntry] = useState(null)

  const [auditLogs] = useState([
    {
      id: 1,
      timestamp: '2024-01-20 14:35:22',
      action: 'Evaluation Completed',
      user: 'AI System v2.1',
      candidateName: 'John Smith',
      position: 'Senior Software Engineer',
      industry: 'Information Technology',
      score: 85,
      confidence: 'High',
      promptVersion: 'Senior Developer Evaluation v1.2',
      hiringFormId: 'HF-001',
      resumeFile: 'john_smith_resume.pdf',
      ipAddress: '192.168.1.100',
      sessionId: 'sess_abc123',
      details: {
        processingTime: '2.3s',
        evidenceCount: 12,
        strengthsCount: 4,
        gapsCount: 2
      }
    },
    {
      id: 2,
      timestamp: '2024-01-20 14:40:15',
      action: 'Human Override',
      user: 'Sarah Johnson (HR Manager)',
      candidateName: 'John Smith',
      position: 'Senior Software Engineer',
      industry: 'Information Technology',
      originalScore: 85,
      newStatus: 'Shortlisted',
      overrideReason: 'Strong technical leadership experience aligns well with team needs',
      promptVersion: 'Senior Developer Evaluation v1.2',
      hiringFormId: 'HF-001',
      ipAddress: '192.168.1.105',
      sessionId: 'sess_def456',
      details: {
        overrideType: 'approve',
        previousStatus: 'Under Review',
        newStatus: 'Shortlisted'
      }
    },
    {
      id: 3,
      timestamp: '2024-01-20 13:15:45',
      action: 'Resume Uploaded',
      user: 'Michael Chen (Recruiter)',
      candidateName: 'Sarah Johnson',
      position: 'Product Manager',
      industry: 'Healthcare',
      resumeFile: 'sarah_johnson_resume.pdf',
      hiringFormId: 'HF-002',
      ipAddress: '192.168.1.102',
      sessionId: 'sess_ghi789',
      details: {
        fileSize: '2.4MB',
        fileType: 'PDF',
        uploadDuration: '1.2s'
      }
    },
    {
      id: 4,
      timestamp: '2024-01-20 13:20:33',
      action: 'Evaluation Started',
      user: 'AI System v2.1',
      candidateName: 'Sarah Johnson',
      position: 'Product Manager',
      industry: 'Healthcare',
      promptVersion: 'Healthcare IT Specialist v1.1',
      hiringFormId: 'HF-002',
      resumeFile: 'sarah_johnson_resume.pdf',
      ipAddress: '192.168.1.100',
      sessionId: 'sess_abc123',
      details: {
        queuePosition: 1,
        estimatedDuration: '3-5 minutes'
      }
    },
    {
      id: 5,
      timestamp: '2024-01-20 11:45:12',
      action: 'Prompt Modified',
      user: 'Admin User',
      targetPrompt: 'Senior Developer Evaluation',
      industry: 'Information Technology',
      previousVersion: 'v1.1',
      newVersion: 'v1.2',
      changes: ['Updated scoring guidelines', 'Added cloud architecture focus'],
      ipAddress: '192.168.1.200',
      sessionId: 'sess_jkl012',
      details: {
        modificationType: 'prompt_update',
        affectedEvaluations: 23
      }
    },
    {
      id: 6,
      timestamp: '2024-01-20 10:30:18',
      action: 'Hiring Form Created',
      user: 'Emily Davis (HR Specialist)',
      formTitle: 'UX Designer - Retail',
      industry: 'Retail',
      formId: 'HF-005',
      ipAddress: '192.168.1.108',
      sessionId: 'sess_mno345',
      details: {
        experienceLevel: 'Mid-Level (5-8 years)',
        cutOffSettings: {
          autoShortlist: 80,
          manualReview: 60,
          autoReject: 40
        }
      }
    },
    {
      id: 7,
      timestamp: '2024-01-20 09:15:44',
      action: 'System Error',
      user: 'AI System v2.1',
      candidateName: 'Robert Wilson',
      position: 'Data Analyst',
      industry: 'Finance',
      errorType: 'Parse Error',
      errorMessage: 'Unable to extract text from corrupted PDF file',
      resumeFile: 'robert_wilson_resume.pdf',
      ipAddress: '192.168.1.100',
      sessionId: 'sess_pqr678',
      details: {
        errorCode: 'PARSE_001',
        retryAttempts: 3,
        resolution: 'Manual review required'
      }
    }
  ])

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchTerm === '' ||
      log.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.position?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAction = filterAction === 'all' || log.action === filterAction

    const matchesDate = filterDate === 'all' || (() => {
      const logDate = new Date(log.timestamp)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const lastWeek = new Date(today)
      lastWeek.setDate(lastWeek.getDate() - 7)

      switch (filterDate) {
        case 'today': return logDate.toDateString() === today.toDateString()
        case 'yesterday': return logDate.toDateString() === yesterday.toDateString()
        case 'week': return logDate >= lastWeek
        default: return true
      }
    })()

    return matchesSearch && matchesAction && matchesDate
  })

  const getActionColor = (action) => {
    switch (action) {
      case 'Evaluation Completed': return 'bg-green-100 text-green-800'
      case 'Human Override': return 'bg-yellow-100 text-yellow-800'
      case 'Resume Uploaded': return 'bg-blue-100 text-blue-800'
      case 'Evaluation Started': return 'bg-purple-100 text-purple-800'
      case 'Prompt Modified': return 'bg-indigo-100 text-indigo-800'
      case 'Hiring Form Created': return 'bg-pink-100 text-pink-800'
      case 'System Error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'Evaluation Completed': return CheckCircleIcon
      case 'Human Override': return ExclamationTriangleIcon
      case 'Resume Uploaded': return DocumentArrowDownIcon
      case 'Evaluation Started': return ClockIcon
      case 'Prompt Modified': return EyeIcon
      case 'Hiring Form Created': return CheckCircleIcon
      case 'System Error': return XCircleIcon
      default: return ClockIcon
    }
  }

  const exportAuditLog = () => {
    // In a real app, this would generate and download a CSV/Excel file
    const csvContent = [
      ['Timestamp', 'Action', 'User', 'Candidate', 'Position', 'Industry', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.action,
        log.user,
        log.candidateName || 'N/A',
        log.position || 'N/A',
        log.industry || 'N/A',
        JSON.stringify(log.details)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Audit Trail</h1>
        <p className="text-gray-600">
          Comprehensive logging and audit trail for compliance, accountability, and system transparency.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by candidate, user, action, or position..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Actions</option>
              <option value="Evaluation Completed">Evaluation Completed</option>
              <option value="Human Override">Human Override</option>
              <option value="Resume Uploaded">Resume Uploaded</option>
              <option value="Evaluation Started">Evaluation Started</option>
              <option value="Prompt Modified">Prompt Modified</option>
              <option value="Hiring Form Created">Hiring Form Created</option>
              <option value="System Error">System Error</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            Showing {filteredLogs.length} of {auditLogs.length} entries
          </div>
          <button
            onClick={exportAuditLog}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate/Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position/Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score/Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => {
                const Icon = getActionIcon(log.action)
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                        {log.timestamp}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                        {log.user}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.candidateName || log.targetPrompt || log.formTitle || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {log.position && <div>{log.position}</div>}
                        {log.industry && <div className="text-xs text-gray-500">{log.industry}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {log.score && <div className="font-medium">Score: {log.score}</div>}
                        {log.confidence && <div className="text-xs text-gray-500">Confidence: {log.confidence}</div>}
                        {log.newStatus && <div className="text-xs text-green-600">Status: {log.newStatus}</div>}
                        {log.errorType && <div className="text-xs text-red-600">Error: {log.errorType}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedEntry(log)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Audit Entry Details</h2>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Timestamp</h3>
                    <p className="text-gray-900">{selectedEntry.timestamp}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Action</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(selectedEntry.action)}`}>
                      {selectedEntry.action}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">User</h3>
                    <p className="text-gray-900">{selectedEntry.user}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Session ID</h3>
                    <p className="text-gray-900 font-mono text-sm">{selectedEntry.sessionId}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">IP Address</h3>
                    <p className="text-gray-900 font-mono text-sm">{selectedEntry.ipAddress}</p>
                  </div>
                </div>

                {/* Context Information */}
                <div className="space-y-4">
                  {selectedEntry.candidateName && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Candidate</h3>
                      <p className="text-gray-900">{selectedEntry.candidateName}</p>
                    </div>
                  )}
                  {selectedEntry.position && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Position</h3>
                      <p className="text-gray-900">{selectedEntry.position}</p>
                    </div>
                  )}
                  {selectedEntry.industry && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Industry</h3>
                      <p className="text-gray-900">{selectedEntry.industry}</p>
                    </div>
                  )}
                  {selectedEntry.resumeFile && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Resume File</h3>
                      <p className="text-gray-900">{selectedEntry.resumeFile}</p>
                    </div>
                  )}
                  {selectedEntry.promptVersion && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Prompt Version</h3>
                      <p className="text-gray-900">{selectedEntry.promptVersion}</p>
                    </div>
                  )}
                  {selectedEntry.hiringFormId && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Hiring Form ID</h3>
                      <p className="text-gray-900">{selectedEntry.hiringFormId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              {selectedEntry.details && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedEntry.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Override Reason */}
              {selectedEntry.overrideReason && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Override Reason</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedEntry.overrideReason}</p>
                  </div>
                </div>
              )}

              {/* Error Information */}
              {selectedEntry.errorMessage && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Details</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedEntry.errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuditTrail
