import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  Database,
  Activity,
  Clock,
  Users,
  FileText,
  Shield,
  BarChart3
} from 'lucide-react'
import {
  DollarSign
} from 'lucide-react'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  ReferenceLine,
  LineChart
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import apiService from '@/services/api'

const SystemAnalytics = () => {
  const [metrics, setMetrics] = useState({})
  const [costMetrics, setCostMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const [
          costRes,
          overviewRes,
          processingRes,
          aiRes,
          qualityRes,
          recruiterRes,
          industryRes
        ] = await Promise.allSettled([
          apiService.getCostAnalytics(),
          apiService.getSystemStats(),
          apiService.getResumeProcessingMetrics({ dateRange: timeRange }),
          apiService.getAIUsageAnalytics({ dateRange: timeRange }),
          apiService.getEvaluationQualityMetrics({ dateRange: timeRange }),
          apiService.getRecruiterPatterns({ dateRange: timeRange }),
          apiService.getIndustryDistribution({ dateRange: timeRange })
        ]);

        if (costRes.status === 'fulfilled' && costRes.value.ok) {
          const data = await costRes.value.json();
          setCostMetrics(data.data);
        }

        const newMetrics = {};

        if (overviewRes.status === 'fulfilled' && overviewRes.value.ok) {
          const data = await overviewRes.value.json();
          newMetrics.overview = data.data;
        }

        if (processingRes.status === 'fulfilled' && processingRes.value.ok) {
          const data = await processingRes.value.json();
          newMetrics.resumeProcessing = data.data;
        }

        if (aiRes.status === 'fulfilled' && aiRes.value.ok) {
          const data = await aiRes.value.json();
          newMetrics.aiUsage = data.data;
        }

        if (qualityRes.status === 'fulfilled' && qualityRes.value.ok) {
          const data = await qualityRes.value.json();
          newMetrics.evaluationQuality = data.data;
        }

        if (recruiterRes.status === 'fulfilled' && recruiterRes.value.ok) {
          const data = await recruiterRes.value.json();
          newMetrics.recruiterPatterns = data.data;
        }

        if (industryRes.status === 'fulfilled' && industryRes.value.ok) {
          const data = await industryRes.value.json();
          newMetrics.industryDistribution = data.data;
        }

        setMetrics(newMetrics);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics()
  }, [timeRange])

  const getSeverityColor = (rate) => {
    if (rate > 10) return 'bg-red-500'
    if (rate > 5) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'resume-processing', name: 'Resume Processing', icon: FileText },
    { id: 'ai-usage', name: 'AI Usage', icon: Activity },
    { id: 'cost-analysis', name: 'Cost Analysis', icon: DollarSign },
    { id: 'evaluation-quality', name: 'Evaluation Quality', icon: Shield },
    { id: 'recruiter-patterns', name: 'Recruiter Patterns', icon: Users },
    { id: 'industry-distribution', name: 'Industry Insights', icon: BarChart3 }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">System Analytics</h1>
          <p className="text-muted-foreground">Comprehensive platform performance and usage analytics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Inject Cost KPI into Overview if valid */}
          {costMetrics?.total && (
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <Card className="bg-slate-900 text-white border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total AI Cost</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${costMetrics.total.totalCost?.toFixed(4) || '0.00'}</div>
                  <p className="text-xs text-slate-400">Total spend</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.overview?.totalCompanies || 0}</div>
                <p className="text-xs text-muted-foreground">+12 this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.overview?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Across all companies</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processing Success</CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.overview?.processingSuccessRate || 0}%</div>
                <p className="text-xs text-muted-foreground">Resume processing success rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.overview?.avgProcessingTime || 0}s</div>
                <p className="text-xs text-muted-foreground">AI evaluation time</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Processing Trends */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Processing Trends</CardTitle>
                <CardDescription>Resumes and evaluations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.aiUsage?.dailyUsage || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* AI Model Performance */}
            <Card>
              <CardHeader>
                <CardTitle>AI Model Performance</CardTitle>
                <CardDescription>Average scores by model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.aiUsage?.byModel || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="model" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgScore" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Platform performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing Success Rate</span>
                    <span className="font-medium">{metrics.overview?.processingSuccessRate || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${metrics.overview?.processingSuccessRate || 0}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI Model Accuracy</span>
                    <span className="font-medium">{metrics.overview?.aiModelAccuracy || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${metrics.overview?.aiModelAccuracy || 0}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Queue Health</span>
                    <span className="font-medium">{metrics.overview?.queueHealth || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${metrics.overview?.queueHealth || 0}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Resume Processing Tab */}
      {activeTab === 'resume-processing' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.resumeProcessing?.totalResumes || 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processed</CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.resumeProcessing?.processedResumes || 0}</div>
                <p className="text-xs text-muted-foreground">Successfully processed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.resumeProcessing?.failedResumes || 0}</div>
                <p className="text-xs text-muted-foreground">Processing failures</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.resumeProcessing?.avgProcessingTime || 0}s</div>
                <p className="text-xs text-muted-foreground">Per resume</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* File Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>File Type Distribution</CardTitle>
                <CardDescription>Resumes by file format</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.resumeProcessing?.byFileType || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {metrics.resumeProcessing?.byFileType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Processing Status */}
            <Card>
              <CardHeader>
                <CardTitle>Processing Status</CardTitle>
                <CardDescription>Current processing state</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.resumeProcessing?.byStatus.map((status, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">{status.status}</div>
                        <div className="text-sm text-muted-foreground">Status</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{status.count}</div>
                        <div className="text-sm text-muted-foreground">
                          {((status.count / (metrics.resumeProcessing.totalResumes || 1)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Cost Analysis Tab */}
      {activeTab === 'cost-analysis' && costMetrics && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tokens Used</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(costMetrics.total?.totalTokens || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time usage</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${costMetrics.total?.totalCost?.toFixed(4) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">Estimated API spend</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Cost / Resume</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${costMetrics.total?.avgCost?.toFixed(4) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">Efficiency metric</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Evaluations Counted</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{costMetrics.total?.count || 0}</div>
                <p className="text-xs text-muted-foreground">Tracked evaluations</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Monthly Cost Trend */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Monthly Cost Trend</CardTitle>
                <CardDescription>AI spending over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costMetrics.monthly || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" tickFormatter={(val) => `Month ${val}`} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="cost" fill="#10b981" name="Cost ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Prompts by Cost */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Top Prompts by Cost</CardTitle>
                <CardDescription>Most expensive prompts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costMetrics.topPrompts?.map((prompt, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate w-1/2" title={prompt.name}>{prompt.name || 'Unknown Prompt'}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">{prompt.count} runs</span>
                        <span className="text-sm font-bold">${prompt.cost?.toFixed(3)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* AI Usage Tab */}
      {activeTab === 'ai-usage' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total AI Calls</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.aiUsage?.totalCalls || 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">GPT-4 Usage</CardTitle>
                <Badge variant="outline">GPT-4</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.aiUsage?.byModel[0]?.calls || 0}</div>
                <p className="text-xs text-muted-foreground">Most used model</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Model Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.aiUsage?.byModel.reduce((acc, model) => acc + model.avgScore, 0) / (metrics.aiUsage?.byModel.length || 1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">Across all models</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.aiUsage?.byModel.reduce((acc, model) => acc + model.avgConfidence, 0) / (metrics.aiUsage?.byModel.length || 1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">Model confidence</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Daily Usage Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Daily AI Usage</CardTitle>
                <CardDescription>AI model calls over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.aiUsage?.dailyUsage || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="calls" stroke="#3b82f6" fill="#3b82f6" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Model Performance Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>Score and confidence comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.aiUsage?.byModel || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="model" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgScore" fill="#3b82f6" name="Avg Score" />
                      <Bar dataKey="avgConfidence" fill="#10b981" name="Avg Confidence" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Evaluation Quality Tab */}
      {activeTab === 'evaluation-quality' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.evaluationQuality?.totalEvaluations || 0}</div>
                <p className="text-xs text-muted-foreground">All evaluations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg AI Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.evaluationQuality?.avgAiScore || 0}%</div>
                <p className="text-xs text-muted-foreground">Average score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Override Rate</CardTitle>
                <Users className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.evaluationQuality?.totalOverrides ?
                    Math.round((metrics.evaluationQuality.totalOverrides / metrics.evaluationQuality.totalEvaluations) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Human override rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Override Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.evaluationQuality?.avgOverrideTime || 0}s</div>
                <p className="text-xs text-muted-foreground">Human review time</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Override Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Override Trends</CardTitle>
                <CardDescription>Human overrides over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.evaluationQuality?.overrideTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="overrides" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="avgAiScore" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="avgOverrideScore" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
                <CardDescription>Evaluation accuracy and consistency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{metrics.evaluationQuality?.avgAiScore || 0}%</div>
                      <div className="text-sm text-muted-foreground">Avg AI Score</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{metrics.evaluationQuality?.avgConfidence || 0}%</div>
                      <div className="text-sm text-muted-foreground">Avg Confidence</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{metrics.evaluationQuality?.avgOverrideScore || 0}%</div>
                      <div className="text-sm text-muted-foreground">Avg Override Score</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{metrics.evaluationQuality?.avgOverrideTime || 0}s</div>
                      <div className="text-sm text-muted-foreground">Avg Override Time</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Recruiter Patterns Tab */}
      {activeTab === 'recruiter-patterns' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recruiter Override Patterns</CardTitle>
              <CardDescription>Human override behavior across recruiters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Recruiter</th>
                      <th className="text-left p-2">Company</th>
                      <th className="text-left p-2">Overrides</th>
                      <th className="text-left p-2">Avg Override Time</th>
                      <th className="text-left p-2">Avg AI Score</th>
                      <th className="text-left p-2">Avg Override Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.recruiterPatterns.map((recruiter, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{recruiter.recruiter}</td>
                        <td className="p-2">{recruiter.company}</td>
                        <td className="p-2">{recruiter.overrides}</td>
                        <td className="p-2">{recruiter.avgOverrideTime}s</td>
                        <td className="p-2">{recruiter.avgAiScore}%</td>
                        <td className="p-2">{recruiter.avgOverrideScore}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Industry Distribution Tab */}
      {activeTab === 'industry-distribution' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {metrics.industryDistribution.map((industry, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{industry.industry}</CardTitle>
                  <Badge className={`${getSeverityColor(industry.overrideRate)} text-white`}>
                    {industry.overrideRate}%
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{industry.count}</div>
                  <p className="text-xs text-muted-foreground">Avg Score: {industry.avgScore}%</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Industry Override Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Industry Override Rates</CardTitle>
                <CardDescription>Human override patterns by industry</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.industryDistribution || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="industry" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="overrideRate" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Industry Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Industry Performance</CardTitle>
                <CardDescription>Average scores by industry</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.industryDistribution || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="industry" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default SystemAnalytics
