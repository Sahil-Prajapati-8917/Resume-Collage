import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import apiService from '@/services/api'
import {
  BarChart3,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle2,
  FileText,
  User,
  Clock,
  ArrowRight,
  Filter,
  BrainCircuit,
  ShieldCheck,
  ChevronRight,
  Search,
  AlertTriangle,
  Star,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

import CandidateComparison from '../../components/features/evaluation/CandidateComparison'

const EvaluationResults = () => {
  const location = useLocation()
  const singleViewId = location.state?.resumeId

  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [showOverrideModal, setShowOverrideModal] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [overrideAction, setOverrideAction] = useState('')
  const [evaluations, setEvaluations] = useState([])
  const [hiringForms, setHiringForms] = useState([])
  const [selectedJob, setSelectedJob] = useState('all')

  // Feature states
  const [explainMode, setExplainMode] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [showComparisonModal, setShowComparisonModal] = useState(false)
  const [selectedForComparison, setSelectedForComparison] = useState([])

  const fetchResumes = async () => {
    try {
      const response = await apiService.get('/resume');
      if (response.ok) {
        const result = await response.json();
        setEvaluations(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch resumes", error);
    } finally {
      // setLoading(false);
    }
  }

  useEffect(() => {
    fetchResumes()
    fetchHiringForms()
  }, [])

  const fetchHiringForms = async () => {
    try {
      const response = await apiService.get('/hiring-forms')
      if (response.ok) {
        const data = await response.json()
        setHiringForms(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch hiring forms:', error)
    }
  }

  useEffect(() => {
    if (singleViewId && evaluations.length > 0) {
      const target = evaluations.find(e => e._id === singleViewId);
      if (target) setSelectedCandidate(target);
    }
  }, [singleViewId, evaluations])

  const handleStatusChange = async (evaluationId, newStatus, reason = '') => {
    try {
      await apiService.put(`/resume/${evaluationId}/status`, {
        status: newStatus,
        reason: reason
      });
      fetchResumes();
      setShowOverrideModal(false);
      setOverrideReason('');
      setOverrideAction('');
      if (selectedCandidate && selectedCandidate._id === evaluationId) setSelectedCandidate(null);
    } catch (error) {
      console.error("Failed to update status", error);
    }
  }

  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesStatus = filterStatus === 'all' || evaluation.status.toLowerCase() === filterStatus.toLowerCase()

    // Check if evaluation.jobId matches (it can be an object or a string ID)
    const evalJobId = evaluation.jobId?._id || evaluation.jobId
    const matchesJob = selectedJob === 'all' || evalJobId === selectedJob

    return matchesStatus && matchesJob
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Shortlisted': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">Shortlisted</Badge>
      case 'Manual Review Required': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Review Required</Badge>
      case 'Under Process': return <Badge variant="secondary">Processing</Badge>
      case 'Disqualified': return <Badge variant="destructive">Disqualified</Badge>
      case 'Hired': return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Hired</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-destructive'
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
    } else if (action === 'hired') {
      handleStatusChange(candidate._id, 'Hired');
    }
  }

  const submitOverride = () => {
    if (selectedCandidate) {
      handleStatusChange(selectedCandidate._id, 'Disqualified', overrideReason);
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">Evaluations</h1>
          <p className="text-muted-foreground">Detailed AI analysis and candidate scoring history.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Added Feature Buttons */}
          <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg mr-2">
            <Button
              variant={!explainMode ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setExplainMode(false)}
            >
              Standard
            </Button>
            <Button
              variant={explainMode ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setExplainMode(true)}
            >
              Explainable
            </Button>
          </div>
          <Button
            variant={compareMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCompareMode(!compareMode);
              setSelectedForComparison([]);
            }}
          >
            {compareMode ? 'Cancel' : 'Compare'}
          </Button>
          {/* End Feature Buttons */}

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search candidates..." className="pl-9 bg-card/50" />
          </div>
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-48 bg-card/50">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Jobs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {hiringForms.map(form => (
                <SelectItem key={form._id} value={form._id}>
                  {form.formName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-card/50">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Shortlisted">Shortlisted</SelectItem>
              <SelectItem value="Manual Review Required">Review</SelectItem>
              <SelectItem value="Disqualified">Disqualified</SelectItem>
              <SelectItem value="Hired">Hired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {compareMode && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex justify-between items-center">
          <span className="text-blue-800 font-medium">Select candidates to compare ({selectedForComparison.length}/3)</span>
          {selectedForComparison.length > 1 && (
            <Button size="sm" onClick={() => setShowComparisonModal(true)}>Compare Selected</Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvaluations.map(evaluation => {
          const isHighlight = evaluation._id === singleViewId
          const isSelected = selectedForComparison.some(c => c._id === evaluation._id)

          return (
            <Card
              key={evaluation._id}
              className={`group flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/40 bg-card/50 ${isHighlight ? 'ring-2 ring-primary bg-primary/[0.02]' : ''} ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}`}
              onClick={() => {
                if (compareMode) {
                  if (isSelected) {
                    setSelectedForComparison(selectedForComparison.filter(c => c._id !== evaluation._id));
                  } else if (selectedForComparison.length < 3) {
                    setSelectedForComparison([...selectedForComparison, evaluation]);
                  }
                }
              }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                      {evaluation.fileName || 'Candidate'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-3 h-3" />
                      {evaluation.industry} • {evaluation.roleType}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-2xl font-bold font-mono ${getScoreColor(evaluation.aiEvaluation?.totalScore || 0)}`}>
                      {evaluation.aiEvaluation?.totalScore || '--'}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Score</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="flex items-center justify-between mb-6">
                  {getStatusBadge(evaluation.status)}
                  <div className="flex items-center text-[10px] text-muted-foreground">
                    <Clock className="size-3 mr-1" />
                    {evaluation.evaluatedAt || 'Recent'}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {explainMode ? 'AI Reasoning' : 'Top Strengths'}
                  </p>

                  {explainMode ? (
                    <div className="text-xs text-muted-foreground italic bg-muted/50 p-2 rounded border">
                      "Strong fit for {evaluation.roleType} mainly due to {evaluation.aiEvaluation?.strengths?.[0] || 'skills'}."
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {evaluation.aiEvaluation?.strengths?.slice(0, 2).map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-xs text-muted-foreground line-clamp-1">{s}</span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </CardContent>
              <CardFooter className="pt-0">
                {compareMode ? (
                  <div className="w-full flex items-center gap-2 text-xs text-muted-foreground justify-center py-2">
                    {isSelected ? <CheckCircle2 className="w-4 h-4 text-blue-500" /> : <div className="w-4 h-4 border rounded-full" />}
                    {isSelected ? 'Selected for Comparison' : 'Tap to Select'}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-9 text-xs group/btn"
                    onClick={() => setSelectedCandidate(evaluation)}
                  >
                    Deep Context Analysis
                    <ChevronRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {showComparisonModal && (
        <CandidateComparison
          candidates={selectedForComparison}
          onClose={() => setShowComparisonModal(false)}
        />
      )}

      {/* Detailed Analysis Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-[95vw] w-full md:max-w-7xl h-[90vh] p-0 border-border/40 bg-background/95 backdrop-blur-xl gap-0 overflow-hidden flex flex-col">
          <div className="p-8 pb-0">
            <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold tracking-tight">{selectedCandidate?.fileName}</h2>
                  {selectedCandidate && getStatusBadge(selectedCandidate.status)}
                </div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <User className="size-4" />
                  {selectedCandidate?.roleType} • {selectedCandidate?.industry}
                </p>
              </div>
              <div className="flex items-center gap-6 bg-accent/30 p-6 rounded-2xl border border-border/40">
                <div className="text-center">
                  <p className="text-4xl font-black font-mono tracking-tighter text-primary">
                    {selectedCandidate?.aiEvaluation?.totalScore || 0}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-widest">AI Aggregate</p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">
                    {selectedCandidate?.aiEvaluation?.confidenceLevel || 'Medium'}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-widest">Confidence</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 pt-0 grid md:grid-cols-2 gap-8 overflow-y-auto flex-1">
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <BrainCircuit className="size-3 text-primary" /> Metrics Breakdown
                </h4>
                <div className="space-y-4">
                  {selectedCandidate?.aiEvaluation?.details && Object.entries(selectedCandidate.aiEvaluation.details).map(([key, value]) => (
                    <div key={key} className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold text-muted-foreground uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-mono">{value}%</span>
                      </div>
                      <Progress value={value} className="h-1.5 bg-accent" indicatorClassName="bg-primary" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Skills */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="size-3 text-green-500" /> Matched Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate?.aiEvaluation?.matchedSkills?.length > 0 ? (
                    selectedCandidate.aiEvaluation.matchedSkills.map((s, i) => (
                      <Badge key={i} variant="outline" className="bg-green-500/5 text-green-600 border-green-200 hover:bg-green-500/10">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No specific matches found or data unavailable.</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="size-3 text-red-500" /> Missing Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate?.aiEvaluation?.missingSkills?.length > 0 ? (
                    selectedCandidate.aiEvaluation.missingSkills.map((s, i) => (
                      <Badge key={i} variant="outline" className="bg-red-500/5 text-red-600 border-red-200 hover:bg-red-500/10">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No missing skills identified or data unavailable.</span>
                  )}
                </div>
              </div>


              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="size-3 text-green-500" /> Latent Strengths
                </h4>
                <div className="flex flex-col gap-2">
                  {selectedCandidate?.aiEvaluation?.strengths?.map((s, i) => (
                    <div key={i} className="text-xs p-3 rounded-lg bg-green-500/5 text-muted-foreground flex gap-2 border border-green-500/10">
                      <ArrowRight className="size-3 text-green-500 shrink-0 mt-0.5" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Skills (Candidate's Skills) */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <User className="size-3 text-blue-500" /> Candidate Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate?.aiEvaluation?.candidateSkills?.length > 0 ? (
                    selectedCandidate.aiEvaluation.candidateSkills.map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No extracted skills found or data unavailable.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  Critical Gaps
                </h4>
                <div className="flex flex-col gap-2">
                  {selectedCandidate?.aiEvaluation?.weaknesses?.map((w, i) => (
                    <div key={i} className="text-xs p-3 rounded-lg bg-destructive/5 text-muted-foreground flex gap-2 border border-destructive/10">
                      <AlertCircle className="size-3 text-destructive shrink-0 mt-0.5" />
                      {w}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-primary/[0.03] border border-primary/10 space-y-4">
                <div>
                  <h4 className="text-sm font-bold tracking-tight">Human Override</h4>
                  <p className="text-[11px] text-muted-foreground mt-1">Audit Trail logged with your identity.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="default" size="sm" className="h-9 text-xs" onClick={() => handleStatusChange(selectedCandidate._id, 'Shortlisted')}>
                      <ThumbsUp className="size-3 mr-1.5" /> Shortlist
                    </Button>
                    <Button variant="destructive" size="sm" className="h-9 text-xs" onClick={() => {
                      setOverrideAction('Disqualified')
                      setShowOverrideModal(true)
                    }}>
                      <ThumbsDown className="size-3 mr-1.5" /> Reject
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="h-9 text-xs w-full" onClick={() => handleStatusChange(selectedCandidate._id, 'Manual Review Required')}>
                    <Clock className="size-3 mr-1.5" /> Flag for Review
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border/40 bg-accent/20 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setSelectedCandidate(null)}>Close Analysis</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Override Dialog */}
      <Dialog open={showOverrideModal} onOpenChange={() => setShowOverrideModal(false)}>
        <DialogContent className="max-w-[90vw] md:max-w-6xl h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedCandidate?.fileName}</DialogTitle>
            <DialogDescription>
              {selectedCandidate?.roleType} • {selectedCandidate?.industry}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 pr-2">
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
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-500">Evaluated:</span>
                      <span className="text-gray-900 ml-1">{selectedCandidate?.uploadedAt || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-500">Resume:</span>
                      <span className="text-gray-900 ml-1">{selectedCandidate?.fileName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
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
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {selectedCandidate?.aiEvaluation?.strengths?.map((strength, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    )) || <li className="text-sm text-gray-500">No strengths available</li>}
                  </ul>
                </div>

                {/* Gaps */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {selectedCandidate?.aiEvaluation?.weaknesses?.map((gap, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
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
                    <Star className="h-5 w-5 text-blue-500 mr-2" />
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
                        <Eye className="h-4 w-4 mr-2" />
                        Flag for Manual Review
                      </Button>
                      <Button
                        onClick={() => handleOverride('hired', selectedCandidate)}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        variant="default"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as Hired
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
      {/* Comparison Modal */}
      <CandidateComparison
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        candidates={selectedForComparison}
      />

      {/* Floating Action Button for Comparison */}
      {
        compareMode && selectedForComparison.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button size="lg" className="shadow-xl" onClick={() => setShowComparisonModal(true)}>
              Compare ({selectedForComparison.length}) Candidates
            </Button>
          </div>
        )
      }

    </div >
  )
}

export default EvaluationResults

