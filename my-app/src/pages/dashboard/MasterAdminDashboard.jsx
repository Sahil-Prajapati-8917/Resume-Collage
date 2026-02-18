import React, { useState, useEffect } from 'react'
import apiService from '@/services/api'
import {
  TrendingUp,
  Users,
  FileText,
  Shield,
  AlertTriangle,
  Clock,
  BarChart3,
  Globe,
  Database,
  Activity,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const MasterAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    resumesProcessed: 0,
    evaluationsCount: 0,
    humanOverrides: 0,
    failedEvaluations: 0
  })

  // eslint-disable-next-line no-unused-vars
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [dailyData, setDailyData] = useState([])
  const [industryData, setIndustryData] = useState([])
  const [overrideData, setOverrideData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getSystemStats();
        if (response.ok) {
          const { data } = await response.json();
          setStats(data.metrics);
          setDailyData(data.trends);
          setIndustryData(data.performance.industryStats || []);
          // setOverrideData(data.performance.overrideStats || []); // Assuming these exist in response structure or need mapping
          // Mapping for demo structure if not direct match:

          // For now, let's just map trends to dailyData format if needed
          const mappedDaily = data.trends.map(t => ({
            date: t._id,
            resumes: t.resumes,
            evaluations: t.evaluations
          }));
          setDailyData(mappedDaily);

        }
      } catch (error) {
        console.error("Failed to load admin stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [])

  const getOverridePercentage = (overrides, total) => {
    return total > 0 ? Math.round((overrides / total) * 100) : 0
  }

  const getSuccessRate = () => {
    const total = stats.evaluationsCount + stats.failedEvaluations
    return total > 0 ? Math.round((stats.evaluationsCount / total) * 100) : 0
  }

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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Master Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform-wide overview and system health</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Export Report</Button>
          <Button>Refresh Data</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resumes Processed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resumesProcessed.toLocaleString()}</div>
            <div className="flex items-center space-x-2">
              <Progress value={85} className="flex-1" />
              <span className="text-xs text-muted-foreground">85% success rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Human Overrides</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.humanOverrides}</div>
            <p className="text-xs text-muted-foreground">
              {getSuccessRate()}% of total evaluations
            </p>
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
            <div className="flex justify-end mb-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">7d</Button>
                <Button variant="outline" size="sm" className="bg-primary/10">30d</Button>
                <Button variant="outline" size="sm">90d</Button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="resumes" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="evaluations" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Industry Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Industry Distribution</CardTitle>
            <CardDescription>Resumes by industry sector</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={industryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {industryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Override Rates */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Human Override Rates</CardTitle>
            <CardDescription>Override percentage by industry</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overrideData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="overrides" fill="#f59e0b" name="Overrides" />
                  <Bar dataKey="total" fill="#e5e7eb" name="Total Evaluations" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {overrideData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="outline">
                    {getOverridePercentage(item.overrides, item.total)}% override rate
                  </Badge>
                </div>
              ))}
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
                <span className="font-medium">98.3%</span>
              </div>
              <Progress value={98.3} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>AI Model Accuracy</span>
                <span className="font-medium">94.2%</span>
              </div>
              <Progress value={94.2} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Average Response Time</span>
                <span className="font-medium">2.3s</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Queue Health</span>
                <span className="font-medium">Optimal</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>Recent notifications and warnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <div className="font-medium">High Override Rate Detected</div>
                <div className="text-sm text-muted-foreground">
                  Healthcare industry showing 15% override rate (above 10% threshold)
                </div>
              </div>
              <Button variant="outline" size="sm">Review</Button>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium">New Company Registered</div>
                <div className="text-sm text-muted-foreground">
                  TechCorp Inc. registered with 50 users
                </div>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Database className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <div className="font-medium">Database Optimization Complete</div>
                <div className="text-sm text-muted-foreground">
                  Performance improved by 23% after optimization
                </div>
              </div>
              <Button variant="outline" size="sm">Details</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MasterAdminDashboard