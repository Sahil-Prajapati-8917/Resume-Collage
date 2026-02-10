import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
    if (filterStatus === 'all') return true
    return evaluation.status.toLowerCase() === filterStatus.toLowerCase()
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Shortlisted': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">Shortlisted</Badge>
      case 'Manual Review Required': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Review Required</Badge>
      case 'Under Process': return <Badge variant="secondary">Processing</Badge>
      case 'Disqualified': return <Badge variant="destructive">Disqualified</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-destructive'
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">Evaluations</h1>
          <p className="text-muted-foreground">Detailed AI analysis and candidate scoring history.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search candidates..." className="pl-9 bg-card/50" />
          </div>
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
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvaluations.map(evaluation => {
          const isHighlight = evaluation._id === singleViewId
          return (
            <Card
              key={evaluation._id}
              className={`group flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/40 bg-card/50 ${isHighlight ? 'ring-2 ring-primary bg-primary/[0.02]' : ''}`}
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
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Top Strengths</p>
                  <div className="space-y-2">
                    {evaluation.aiEvaluation?.strengths?.slice(0, 2).map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-muted-foreground line-clamp-1">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  variant="outline"
                  className="w-full h-9 text-xs group/btn"
                  onClick={() => setSelectedCandidate(evaluation)}
                >
                  Deep Context Analysis
                  <ChevronRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Detailed Analysis Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-4xl p-0 border-border/40 bg-background/95 backdrop-blur-xl gap-0 overflow-hidden">
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

          <div className="p-8 pt-0 grid md:grid-cols-2 gap-8 overflow-y-auto max-h-[60vh]">
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Override Evidence</DialogTitle>
            <DialogDescription>Provide justification for overriding the AI's {overrideAction} decision.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Enter audit trail comments..."
              className="resize-none h-32"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowOverrideModal(false)}>Cancel</Button>
              <Button disabled={!overrideReason.trim()} onClick={() => handleStatusChange(selectedCandidate._id, 'Disqualified', overrideReason)}>
                Apply Override
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EvaluationResults

