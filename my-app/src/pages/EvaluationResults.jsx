import React, { useState } from 'react'
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
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="under review">Under Review</SelectItem>
                  <SelectItem value="needs review">Needs Review</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
                  <h3 className="text-lg font-semibold">{evaluation.candidateName}</h3>
                  <p className="text-sm text-muted-foreground">{evaluation.position}</p>
                  <p className="text-xs text-muted-foreground mt-1">{evaluation.industry}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(evaluation.score)}`}>
                    {evaluation.score}
                  </div>
                  <div className="text-xs text-muted-foreground">/ 100</div>
                </div>
              </div>

              {/* Status and Confidence */}
              <div className="flex items-center justify-between mb-4">
                <Badge className={getStatusColor(evaluation.status)}>
                  {evaluation.status}
                </Badge>
                <Badge variant="outline" className={getConfidenceColor(evaluation.confidence)}>
                  Confidence: {evaluation.confidence}
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
                  {evaluation.strengths.slice(0, 2).map((strength, index) => (
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
                    onClick={() => handleOverride('approve')}
                  >
                    <ThumbsUp className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOverride('reject')}
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
            <DialogTitle className="text-2xl">{selectedCandidate?.candidateName}</DialogTitle>
            <DialogDescription>
              {selectedCandidate?.position} • {selectedCandidate?.industry}
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
                      <div className={`text-5xl font-bold ${selectedCandidate ? getScoreColor(selectedCandidate.score) : ''}`}>
                        {selectedCandidate?.score || 0}
                      </div>
                      <div className="text-gray-500 mt-2">out of 100</div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-3 ${selectedCandidate ? getConfidenceColor(selectedCandidate.confidence) : ''}`}>
                        {selectedCandidate?.confidence || 'N/A'} Confidence
                      </div>
                    </div>
                  </div>

                  {/* Detailed Scores */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
                    <div className="space-y-3">
                      {selectedCandidate?.detailedScores && Object.entries(selectedCandidate.detailedScores).map(([category, score]) => (
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
                        <span className="text-gray-900 ml-1">{selectedCandidate?.evaluatedAt || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-500">Resume:</span>
                        <span className="text-gray-900 ml-1">{selectedCandidate?.resumeFile || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-500">Evaluator:</span>
                        <span className="text-gray-900 ml-1">{selectedCandidate?.evaluator || 'N/A'}</span>
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
                      {selectedCandidate?.strengths?.map((strength, index) => (
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
                      {selectedCandidate?.gaps?.map((gap, index) => (
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
                      {selectedCandidate?.evidence?.map((evidence, index) => (
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
                          onClick={() => handleOverride('approve')}
                          className="w-full"
                          variant="default"
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Approve Candidate
                        </Button>
                        <Button
                          onClick={() => handleOverride('reject')}
                          className="w-full"
                          variant="destructive"
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Reject Candidate
                        </Button>
                        <Button
                          onClick={() => handleOverride('review')}
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
