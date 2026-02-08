import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import apiService from '@/services/api'
import axios from 'axios'
import {
  BarChart3,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  X,
  FileText,
  User,
  Clock,
  Star,
  Filter,
  CheckCircle as CheckCircleIcon,
  AlertTriangle as ExclamationTriangleIcon,
  Star as StarIcon,
  Eye as EyeIcon,
  Clock as ClockIcon,
  FileText as DocumentTextIcon,
  User as UserIcon
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const EvaluationResults = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [showOverrideModal, setShowOverrideModal] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [overrideAction, setOverrideAction] = useState('')
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const singleViewId = location.state?.resumeId

  const fetchResumes = async () => {
    setLoading(true)
    try {
      const response = await apiService.get('/resume');
      if (response.ok) {
        const result = await response.json();
        setEvaluations(result.data || []);
      } else {
        console.error('Failed to fetch resumes');
      }
    } catch (error) {
      console.error("Failed to fetch resumes", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResumes()
  }, [])

  useEffect(() => {
    if (singleViewId && evaluations.length > 0) {
      const target = evaluations.find(e => e._id === singleViewId);
      if (target) {
        setSelectedCandidate(target);
      }
    }
  }, [singleViewId, evaluations])

  const handleStatusChange = async (evaluationId, newStatus, reason = '') => {
    try {
      await apiService.put(`/resume/${evaluationId}/status`, {
        status: newStatus,
        reason: reason
      });

      fetchResumes(); // Refresh data
      setShowOverrideModal(false);
      setOverrideReason('');
      setOverrideAction('');
      if (selectedCandidate && selectedCandidate._id === evaluationId) {
        setSelectedCandidate(null); // Close modal if open
      }

    } catch (error) {
      console.error("Failed to update status", error);
    }
  }

  const filteredEvaluations = evaluations.filter(evaluation => {
    if (singleViewId) {
      return evaluation._id === singleViewId;
    }
    if (filterStatus === 'all') return true
    return evaluation.status.toLowerCase() === filterStatus.toLowerCase()
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Shortlisted': return 'bg-green-100 text-green-800'
      case 'Manual Review Required': return 'bg-yellow-100 text-yellow-800'
      case 'Under Process': return 'bg-blue-100 text-blue-800'
      case 'Disqualified': return 'bg-red-100 text-red-800'
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

  const handleOverride = (action, candidate) => {
    if (action === 'approve') {
      handleStatusChange(candidate._id, 'Shortlisted');
    } else if (action === 'reject') {
      setOverrideAction('Disqualified')
      setSelectedCandidate(candidate)
      setShowOverrideModal(true)
    } else if (action === 'review') {
      handleStatusChange(candidate._id, 'Manual Review Required');
    }
  }

  const submitOverride = () => {
    if (selectedCandidate) {
      handleStatusChange(selectedCandidate._id, 'Disqualified', overrideReason);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Evaluation Results</CardTitle>
          <CardDescription>
            Review AI-powered candidate evaluations with explainable scoring and evidence highlighting.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-sm font-medium">Filter by Status:</span>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Candidates</SelectItem>
                  <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="Under Process">Under Process</SelectItem>
                  <SelectItem value="Manual Review Required">Manual Review Required</SelectItem>
                  <SelectItem value="Disqualified">Disqualified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredEvaluations.length} of {evaluations.length} candidates
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvaluations.map(evaluation => (
          <Card key={evaluation.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{evaluation.fileName || 'Unknown Candidate'}</h3>
                  <p className="text-sm text-muted-foreground">{evaluation.roleType}</p>
                  <p className="text-xs text-muted-foreground mt-1">{evaluation.industry}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(evaluation.aiEvaluation?.totalScore || 0)}`}>
                    {evaluation.aiEvaluation?.totalScore || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">/ 100</div>
                </div>
              </div>

              {/* Status and Confidence */}
              <div className="flex items-center justify-between mb-4">
                <Badge className={getStatusColor(evaluation.status)}>
                  {evaluation.status}
                </Badge>
                <Badge variant="outline" className={getConfidenceColor(evaluation.aiEvaluation?.confidenceLevel || 'Medium')}>
                  Confidence: {evaluation.aiEvaluation?.confidenceLevel || 'Medium'}
                </Badge>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Evaluated</p>
                  <p className="text-sm font-medium">{evaluation.evaluatedAt}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Resume</p>
                  <p className="text-sm font-medium truncate">{evaluation.resumeFile}</p>
                </div>
              </div>

              {/* Strengths Preview */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Key Strengths:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {evaluation.aiEvaluation?.strengths?.slice(0, 2).map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedCandidate(evaluation)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOverride('approve', evaluation)}
                  >
                    <ThumbsUp className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOverride('reject', evaluation)}
                  >
                    <ThumbsDown className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Evaluation Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedCandidate?.fileName}</DialogTitle>
            <DialogDescription>
              {selectedCandidate?.roleType} • {selectedCandidate?.industry}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[70vh] pr-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Score Breakdown */}
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Score</h3>
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${selectedCandidate ? getScoreColor(selectedCandidate.aiEvaluation?.totalScore) : ''}`}>
                      {selectedCandidate?.aiEvaluation?.totalScore || 0}
                    </div>
                    <div className="text-gray-500 mt-2">out of 100</div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-3 ${selectedCandidate ? getConfidenceColor(selectedCandidate.aiEvaluation?.confidenceLevel) : ''}`}>
                      {selectedCandidate?.aiEvaluation?.confidenceLevel || 'N/A'} Confidence
                    </div>
                  </div>
                </div>

                {/* Detailed Scores */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
                  <div className="space-y-3">
                    {selectedCandidate?.aiEvaluation?.details && Object.entries(selectedCandidate.aiEvaluation.details).map(([category, score]) => (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {category.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{score}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${score >= 80 ? 'bg-green-500' :
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
                      <span className="text-gray-900 ml-1">{selectedCandidate?.uploadedAt || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-500">Resume:</span>
                      <span className="text-gray-900 ml-1">{selectedCandidate?.fileName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-500">Model:</span>
                      <span className="text-gray-900 ml-1">{selectedCandidate?.aiEvaluation?.metadata?.model || 'N/A'}</span>
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
                    {selectedCandidate?.aiEvaluation?.strengths?.map((strength, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    )) || <li className="text-sm text-gray-500">No strengths available</li>}
                  </ul>
                </div>

                {/* Gaps */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {selectedCandidate?.aiEvaluation?.weaknesses?.map((gap, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        {gap}
                      </li>
                    )) || <li className="text-sm text-gray-500">No areas for improvement identified</li>}
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
                    {/* No evidence mapping in schema yet, hiding or adapting */}
                    {(selectedCandidate?.evidence || []).map((evidence, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            {evidence.type}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${evidence.relevance === 'High' ? 'bg-green-100 text-green-800' :
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
                    )) || <p className="text-sm text-gray-500">No evidence highlights available</p>}
                  </div>
                </div>

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Human Override</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        onClick={() => handleOverride('approve', selectedCandidate)}
                        className="w-full"
                        variant="default"
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Approve Candidate
                      </Button>
                      <Button
                        onClick={() => handleOverride('reject', selectedCandidate)}
                        className="w-full"
                        variant="destructive"
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Reject Candidate
                      </Button>
                      <Button
                        onClick={() => handleOverride('review', selectedCandidate)}
                        className="w-full"
                        variant="secondary"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Flag for Manual Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Override Dialog */}
      <Dialog open={showOverrideModal} onOpenChange={() => {
        setShowOverrideModal(false)
        setOverrideReason('')
        setOverrideAction('')
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Override</DialogTitle>
            <DialogDescription>
              You are about to {overrideAction} this candidate. Please provide a reason for this override.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              rows={4}
              placeholder="Enter override reason..."
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowOverrideModal(false)
                setOverrideReason('')
                setOverrideAction('')
              }}>
                Cancel
              </Button>
              <Button
                onClick={submitOverride}
                disabled={!overrideReason.trim()}
              >
                Confirm Override
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EvaluationResults
