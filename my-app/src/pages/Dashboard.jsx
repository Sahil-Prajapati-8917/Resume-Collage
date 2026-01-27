import React from 'react'
import { Link } from 'react-router-dom'
import {
  Upload,
  ClipboardList,
  BarChart,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const Dashboard = () => {
  const stats = [
    { name: 'Total Resumes Processed', value: '247', icon: Upload, change: '+12%', changeType: 'positive' },
    { name: 'Active Hiring Forms', value: '8', icon: ClipboardList, change: '+2', changeType: 'positive' },
    { name: 'Average Evaluation Score', value: '72.5', icon: BarChart, change: '+5.2%', changeType: 'positive' },
    { name: 'Candidates Shortlisted', value: '43', icon: Users, change: '+8', changeType: 'positive' },
  ]

  const recentActivity = [
    { id: 1, candidate: 'John Smith', position: 'Senior Developer', score: 85, status: 'Shortlisted', time: '2 hours ago' },
    { id: 2, candidate: 'Sarah Johnson', position: 'Product Manager', score: 78, status: 'Under Review', time: '4 hours ago' },
    { id: 3, candidate: 'Michael Chen', position: 'Data Scientist', score: 92, status: 'Shortlisted', time: '6 hours ago' },
    { id: 4, candidate: 'Emily Davis', position: 'UX Designer', score: 68, status: 'Needs Review', time: '8 hours ago' },
  ]

  const industries = [
    { name: 'Information Technology', count: 45, color: 'bg-blue-500' },
    { name: 'Healthcare', count: 32, color: 'bg-green-500' },
    { name: 'Finance', count: 28, color: 'bg-yellow-500' },
    { name: 'Manufacturing', count: 21, color: 'bg-purple-500' },
    { name: 'Retail', count: 18, color: 'bg-pink-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">
            Welcome to AI Resume Evaluation Platform
          </CardTitle>
          <CardDescription>
            Evaluate candidates holistically across multiple industries with AI-driven insights
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">from last month</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-full p-3">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" asChild className="h-auto p-4 justify-start">
              <Link to="/upload" className="flex items-center">
                <Upload className="h-8 w-8 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Upload Resume</p>
                  <p className="text-sm text-muted-foreground">Start evaluating new candidates</p>
                </div>
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-auto p-4 justify-start">
              <Link to="/hiring-form" className="flex items-center">
                <ClipboardList className="h-8 w-8 text-green-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Create Hiring Form</p>
                  <p className="text-sm text-muted-foreground">Define role requirements</p>
                </div>
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-auto p-4 justify-start">
              <Link to="/prompts" className="flex items-center">
                <BarChart className="h-8 w-8 text-purple-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Manage Prompts</p>
                  <p className="text-sm text-muted-foreground">Configure industry-specific evaluation</p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Evaluations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{activity.candidate}</p>
                      <p className="text-sm text-muted-foreground">{activity.position}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <span className="text-lg font-semibold">{activity.score}</span>
                        <span className="text-sm text-muted-foreground ml-1">/100</span>
                      </div>
                      <Badge
                        variant={
                          activity.status === 'Shortlisted' ? 'default' :
                            activity.status === 'Under Review' ? 'secondary' :
                              'outline'
                        }
                        className="mt-1"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Industry Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Industry Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {industries.map((industry) => (
                <div key={industry.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${industry.color} mr-3`}></div>
                    <span className="text-sm font-medium">{industry.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{industry.count} candidates</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
