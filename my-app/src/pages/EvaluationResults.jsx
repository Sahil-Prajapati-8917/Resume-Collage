import React, { useState } from 'react'
import { 
  ChartBarIcon,
  EyeIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentTextIcon,
  UserIcon,
  ClockIcon,
  StarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

const EvaluationResults = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [showOverrideModal, setShowOverrideModal] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [overrideAction, setOverrideAction] = useState('')

  const [evaluations] = useState([
    {
      id: 1,
      candidateName: 'John Smith',
      position: 'Senior Software Engineer',
      industry: 'Information Technology',
      score: 85,
      confidence: 'High',
      status: 'Shortlisted',
      evaluatedAt: '2024-01-20 14:30',
      resumeFile: 'john_smith_resume.pdf',
      hiringForm: 'Senior Developer Evaluation',
      evaluator: 'AI System v2.1',
      strengths: [
        'Strong technical leadership experience',
        'Led multiple high-impact projects',
        'Excellent system design skills',
        'Active contributor to open source'
      ],
      gaps: [
        'Limited experience with cloud-native architectures',
        'No formal management experience'
      ],
      evidence: [
        {
          type: 'project',
          text: 'Led development of microservices architecture serving 1M+ users',
          relevance: 'High',
          score: 9
        },
        {
          type: 'experience',
          text: '5+ years of experience with React and Node.js',
          relevance: 'High',
          score: 8
        },
        {
          type: 'skill',
          text: 'Proficient in AWS, Docker, and Kubernetes',
          relevance: 'Medium',
          score: 7
        }
      ],
      detailedScores: {
        experience: 88,
        skills: 82,
        projects: 90,
        education: 75,
        communication: 78
      }
    },
    {
      id: 2,
      candidateName: 'Sarah Johnson',
      position: 'Product Manager',
      industry: 'Healthcare',
      score: 78,
      confidence: 'Medium',
      status: 'Under Review',
      evaluatedAt: '2024-01-20 13:15',
      resumeFile: 'sarah_johnson_resume.pdf',
      hiringForm: 'Healthcare IT Specialist',
      evaluator: 'AI System v2.1',
      strengths: [
        'Strong healthcare domain knowledge',
        'Experience with HIPAA compliance',
        'Good stakeholder management skills'
      ],
      gaps: [
        'Limited technical background',
        'No experience with EMR systems'
      ],
      evidence: [
        {
          type: 'domain',
          text: '3 years working in healthcare technology startups',
          relevance: 'High',
          score: 8
        }
      ],
      detailedScores: {
        experience: 75,
        skills: 70,
        projects: 80,
        education: 85,
        communication: 82
      }
    },
    {
      id: 3,
      candidateName: 'Michael Chen',
      position: 'Data Scientist',
      industry: 'Finance',
      score: 92,
      confidence: 'High',
      status: 'Shortlisted',
      evaluatedAt: '2024-01-20 11:45',
      resumeFile: 'michael_chen_resume.pdf',
      hiringForm: 'Financial Analyst',
      evaluator: 'AI System v2.1',
      strengths: [
        'Exceptional analytical skills',
        'Strong machine learning background',
        'Published research papers',
        'Experience with financial modeling'
      ],
      gaps: [
        'Limited real-world deployment experience'
      ],
      evidence: [
        {
          type: 'project',
          text: 'Developed fraud detection algorithm reducing false positives by 40%',
          relevance: 'High',
          score: 10
        }
      ],
      detailedScores: {
        experience: 90,
        skills: 95,
        projects: 92,
        education: 88,
        communication: 85
      }
    },
    {
      id: 4,
      candidateName: 'Emily Davis',
      position: 'UX Designer',
      industry: 'Retail',
      score: 68,
      confidence: 'Low',
      status: 'Needs Review',
      evaluatedAt: '2024-01-20 10:30',
      resumeFile: 'emily_davis_resume.pdf',
      hiringForm: 'UX Designer - Retail',
      evaluator: 'AI System v2.1',
      strengths: [
        'Good design portfolio',
        'Experience with e-commerce platforms'
      ],
      gaps: [
        'Limited user research experience',
        'No experience with A/B testing',
        'Weak technical skills'
      ],
      evidence: [
        {
          type: 'project',
          text: 'Designed mobile app for retail client',
          relevance: 'Medium',
          score: 6
        }
      ],
      detailedScores: {
        experience: 65,
        skills: 70,
        projects: 68,
        education: 72,
        communication: 65
      }
    }
  ])

  const filteredEvaluations = evaluations.filter(evaluation => {
    if (filterStatus === 'all') return true
    return evaluation.status.toLowerCase() === filterStatus.toLowerCase()
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Shortlisted': return 'bg-green-100 text-green-800'
      case 'Under Review': return 'bg-yellow-100 text-yellow-800'
      case 'Needs Review': return 'bg-orange-100 text-orange-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'High': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleOverride = (action) => {
    setOverrideAction(action)
    setShowOverrideModal(true)
  }

  const submitOverride = () => {
    // In a real app, this would update the evaluation status
    // console.log('Override:', { action, reason: overrideReason, candidateId: selectedCandidate?.id })
    setShowOverrideModal(false)
    setOverrideReason('')
    setOverrideAction('')
    setSelectedCandidate(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Evaluation Results</h1>
        <p className="text-gray-600">
          Review AI-powered candidate evaluations with explainable scoring and evidence highlighting.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Candidates</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="under review">Under Review</option>
              <option value="needs review">Needs Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            Showing {filteredEvaluations.length} of {evaluations.length} candidates
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvaluations.map(evaluation => (
          <div key={evaluation.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{evaluation.candidateName}</h3>
                  <p className="text-sm text-gray-500">{evaluation.position}</p>
                  <p className="text-xs text-gray-400 mt-1">{evaluation.industry}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(evaluation.score)}`}>
                    {evaluation.score}
                  </div>
                  <div className="text-xs text-gray-500">/ 100</div>
                </div>
              </div>

              {/* Status and Confidence */}
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                  {evaluation.status}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(evaluation.confidence)}`}>
                  Confidence: {evaluation.confidence}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Evaluated</p>
                  <p className="text-sm font-medium text-gray-900">{evaluation.evaluatedAt}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Resume</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{evaluation.resumeFile}</p>
                </div>
              </div>

              {/* Strengths Preview */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Key Strengths:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {evaluation.strengths.slice(0, 2).map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedCandidate(evaluation)}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  View Details
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOverride('approve')}
                    className="p-2 text-green-600 hover:text-green-800"
                    title="Approve"
                  >
                    <HandThumbUpIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleOverride('reject')}
                    className="p-2 text-red-600 hover:text-red-800"
                    title="Reject"
                  >
                    <HandThumbDownIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Evaluation Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCandidate.candidateName}</h2>
                  <p className="text-gray-600">{selectedCandidate.position} • {selectedCandidate.industry}</p>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Score Breakdown */}
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Score</h3>
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${getScoreColor(selectedCandidate.score)}`}>
                        {selectedCandidate.score}
                      </div>
                      <div className="text-gray-500 mt-2">out of 100</div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-3 ${getConfidenceColor(selectedCandidate.confidence)}`}>
                        {selectedCandidate.confidence} Confidence
                      </div>
                    </div>
                  </div>

                  {/* Detailed Scores */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedCandidate.detailedScores).map(([category, score]) => (
                        <div key={category}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {category.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-sm font-medium text-gray-900">{score}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                score >= 80 ? 'bg-green-500' :
                                score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evaluation Info */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-500">Evaluated:</span>
                        <span className="text-gray-900 ml-1">{selectedCandidate.evaluatedAt}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-500">Resume:</span>
                        <span className="text-gray-900 ml-1">{selectedCandidate.resumeFile}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-500">Evaluator:</span>
                        <span className="text-gray-900 ml-1">{selectedCandidate.evaluator}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Column - Analysis */}
                <div className="space-y-6">
                  {/* Strengths */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {selectedCandidate.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-700">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Gaps */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      Areas for Improvement
                    </h3>
                    <ul className="space-y-2">
                      {selectedCandidate.gaps.map((gap, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-700">
                          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column - Evidence */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <StarIcon className="h-5 w-5 text-blue-500 mr-2" />
                      Evidence Highlights
                    </h3>
                    <div className="space-y-4">
                      {selectedCandidate.evidence.map((evidence, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500 uppercase">
                              {evidence.type}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                evidence.relevance === 'High' ? 'bg-green-100 text-green-800' :
                                evidence.relevance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {evidence.relevance} Relevance
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                Score: {evidence.score}/10
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            "{evidence.text}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Human Override</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => handleOverride('approve')}
                        className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <HandThumbUpIcon className="h-4 w-4 mr-2" />
                        Approve Candidate
                      </button>
                      <button
                        onClick={() => handleOverride('reject')}
                        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        <HandThumbDownIcon className="h-4 w-4 mr-2" />
                        Reject Candidate
                      </button>
                      <button
                        onClick={() => handleOverride('review')}
                        className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Flag for Manual Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Override
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                You are about to {overrideAction} this candidate. Please provide a reason for this override.
              </p>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter override reason..."
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowOverrideModal(false)
                  setOverrideReason('')
                  setOverrideAction('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitOverride}
                disabled={!overrideReason.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Confirm Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EvaluationResults
