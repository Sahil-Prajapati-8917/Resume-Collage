import React, { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Eye,
  Flag,
  Shield,
  TrendingUp,
  Users,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Loader2
} from 'lucide-react'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Pie,
  Cell
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const EvaluationOversight = () => {
  const [evaluations, setEvaluations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [roleTypeFilter, setRoleTypeFilter] = useState('all')
  const [overrideFilter, setOverrideFilter] = useState('all')
  const [dateRange, setDateRange] = useState('30d')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder] = useState('desc')

  // Dialog states
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showFlagDialog, setShowFlagDialog] = useState(false)
  const [selectedEvaluation, setSelectedEvaluation] = useState(null)

  // Flag form state
  const [flagData, setFlagData] = useState({
    reason: '',
    severity: 'medium'
  })

  const [loading, setLoading] = useState(true)
  const [trends, setTrends] = useState([])
  const [industryStats, setIndustryStats] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const params = {
          industry: industryFilter,
          roleType: roleTypeFilter,
          isOverridden: overrideFilter === 'overridden' ? 'true' : overrideFilter === 'not_overridden' ? 'false' : undefined,
          searchTerm: searchTerm,
          dateRange: dateRange
        }

        const [evalsRes, processingRes, industryRes] = await Promise.all([
          apiService.getEvaluationsList(params),
          apiService.getResumeProcessingMetrics({ dateRange }),
          apiService.getIndustryDistribution({ dateRange })
        ])

        if (evalsRes.ok) {
          const result = await evalsRes.json()
          setEvaluations(result.data)
        }

        if (processingRes.ok) {
          const result = await processingRes.json()
          // Map processing metrics to trend data format
          // Backend returns: { date, processed, failed, total }
          setTrends(result.data.dailyUsage || [])
        }

        if (industryRes.ok) {
          const result = await industryRes.json()
          // Backend returns: { industry, count, avgScore, overrideRate }
          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
          setIndustryStats(result.data.map((item, idx) => ({
            name: item.industry,
            value: item.count,
            color: colors[idx % colors.length]
          })))
        }
      } catch (error) {
        console.error("Failed to fetch oversight data", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [industryFilter, roleTypeFilter, overrideFilter, searchTerm, dateRange])

  const getIndustryColor = (industry) => {
    switch (industry) {
      case 'IT': return 'bg-blue-500'
      case 'Healthcare': return 'bg-green-500'
      case 'Finance': return 'bg-yellow-500'
      case 'Manufacturing': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getOverrideTimeColor = (time) => {
    if (time <= 30) return 'text-green-600'
    if (time <= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleFlagEvaluation = async () => {
    const updatedEvaluations = evaluations.map(evaluation =>
      evaluation.id === selectedEvaluation.id
        ? {
          ...evaluation,
          flags: [...evaluation.flags, {
            reason: flagData.reason,
            severity: flagData.severity,
            flaggedAt: new Date().toISOString()
          }]
        }
        : evaluation
    )

    setEvaluations(updatedEvaluations)
    setShowFlagDialog(false)
    setFlagData({ reason: '', severity: 'medium' })
  }

  // Calculate summary statistics
  const summaryStats = {
    total: evaluations.length,
    overridden: evaluations.filter(e => e.isOverridden).length,
    avgAiScore: evaluations.length > 0 ? (evaluations.reduce((sum, e) => sum + e.aiScore, 0) / evaluations.length).toFixed(1) : 0,
    avgConfidence: evaluations.length > 0 ? (evaluations.reduce((sum, e) => sum + e.aiConfidence, 0) / evaluations.length).toFixed(1) : 0,
    avgOverrideTime: evaluations.filter(e => e.isOverridden).length > 0
      ? (evaluations.filter(e => e.isOverridden).reduce((sum, e) => sum + e.overrideTime, 0) / evaluations.filter(e => e.isOverridden).length).toFixed(1)
      : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Evaluation Oversight</h1>
          <p className="text-muted-foreground">Monitor AI decisions and human overrides across all companies</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="flex flex-col lg:flex-row gap-4 p-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search evaluations by candidate name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleTypeFilter} onValueChange={setRoleTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Role Types</SelectItem>
                <SelectItem value="Senior Developer">Senior Developer</SelectItem>
                <SelectItem value="Registered Nurse">Registered Nurse</SelectItem>
                <SelectItem value="Financial Analyst">Financial Analyst</SelectItem>
                <SelectItem value="Production Manager">Production Manager</SelectItem>
                <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={overrideFilter} onValueChange={setOverrideFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by override" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Evaluations</SelectItem>
                <SelectItem value="overridden">Human Override</SelectItem>
                <SelectItem value="not_overridden">AI Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.total}</div>
            <p className="text-xs text-muted-foreground">Across all companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Human Overrides</CardTitle>
            <Users className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.overridden}</div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.total > 0 ? Math.round((summaryStats.overridden / summaryStats.total) * 100) : 0}% override rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg AI Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.avgAiScore}%</div>
            <p className="text-xs text-muted-foreground">Average confidence: {summaryStats.avgConfidence}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Override Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.avgOverrideTime}s</div>
            <p className="text-xs text-muted-foreground">Human review time</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Trends</CardTitle>
            <CardDescription>AI evaluations and score trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="calls" name="Evaluations" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="avgScore" name="Avg Score" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Industry Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Industry Distribution</CardTitle>
            <CardDescription>Evalutions by industry sector</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={industryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {industryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evaluations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Details</CardTitle>
          <CardDescription>Individual evaluation records with AI and human scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <Button variant="ghost" onClick={() => setSortBy('candidateName')}>
                      Candidate {sortBy === 'candidateName' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Button>
                  </TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Role Type</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => setSortBy('aiScore')}>
                      AI Score {sortBy === 'aiScore' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => setSortBy('aiConfidence')}>
                      Confidence {sortBy === 'aiConfidence' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{evaluation.candidateName}</div>
                        <div className="text-sm text-muted-foreground">{evaluation.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{evaluation.company.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getIndustryColor(evaluation.industry)} text-white`}>
                        {evaluation.industry}
                      </Badge>
                    </TableCell>
                    <TableCell>{evaluation.roleType}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${evaluation.aiScore}%` }}></div>
                        </div>
                        <span className="font-medium">{evaluation.aiScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${evaluation.aiConfidence}%` }}></div>
                        </div>
                        <span className="font-medium">{evaluation.aiConfidence}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        {evaluation.isOverridden ? (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Users className="mr-1 h-3 w-3" />
                            Human Override
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Shield className="mr-1 h-3 w-3" />
                            AI Only
                          </Badge>
                        )}
                        {evaluation.flags.length > 0 && (
                          <Badge variant="destructive" className="bg-red-100 text-red-800">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            {evaluation.flags.length} Flag(s)
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedEvaluation(evaluation)
                          setShowDetailsDialog(true)
                        }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedEvaluation(evaluation)
                          setShowFlagDialog(true)
                        }}>
                          <Flag className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Evaluation Details: {selectedEvaluation?.candidateName}</DialogTitle>
            <DialogDescription>
              Complete evaluation information including AI reasoning and human override details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">AI Score</div>
                  <div className="text-2xl font-bold">{selectedEvaluation?.aiScore}%</div>
                  <div className="text-xs text-muted-foreground">Confidence: {selectedEvaluation?.aiConfidence}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Processing Time</div>
                  <div className="text-2xl font-bold">{selectedEvaluation?.processingTime}s</div>
                  <div className="text-xs text-muted-foreground">Model: {selectedEvaluation?.aiModel}</div>
                </CardContent>
              </Card>
            </div>

            {selectedEvaluation?.isOverridden && (
              <Card>
                <CardHeader>
                  <CardTitle>Human Override Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Human Score</div>
                        <div className="text-lg font-bold">{selectedEvaluation.humanScore}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Override Time</div>
                        <div className={`text-lg font-bold ${getOverrideTimeColor(selectedEvaluation.overrideTime)}`}>
                          {selectedEvaluation.overrideTime}s
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Override Reason</div>
                      <div className="p-3 bg-muted rounded-lg">
                        {selectedEvaluation.overrideReason}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedEvaluation?.flags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Flags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedEvaluation.flags.map((flag, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                        <div>
                          <div className="font-medium">{flag.reason}</div>
                          <div className="text-sm text-muted-foreground">{flag.flaggedAt}</div>
                        </div>
                        <Badge className={`${getSeverityColor(flag.severity)} text-white`}>
                          {flag.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Evaluation Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Flag Evaluation: {selectedEvaluation?.candidateName}</DialogTitle>
            <DialogDescription>
              Report suspicious or problematic evaluation for review
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="flagReason">Flag Reason</Label>
              <Textarea
                id="flagReason"
                value={flagData.reason}
                onChange={(e) => setFlagData({ ...flagData, reason: e.target.value })}
                placeholder="Describe why this evaluation should be flagged..."
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={flagData.severity} onValueChange={(value) => setFlagData({ ...flagData, severity: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlagDialog(false)}>Cancel</Button>
            <Button onClick={handleFlagEvaluation} disabled={!flagData.reason.trim()}>
              Flag Evaluation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EvaluationOversight
