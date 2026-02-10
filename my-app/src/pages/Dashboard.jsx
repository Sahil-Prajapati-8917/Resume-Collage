import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Upload,
  ClipboardList,
  BarChart,
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HeroSection } from '@/components/ui/hero-section'
import { StatCard } from '@/components/ui/stat-card'
import { FeatureCard } from '@/components/ui/feature-card'

const Dashboard = () => {
  const navigate = useNavigate()

  const stats = [
    { name: 'Total Resumes Processed', value: 247, icon: Upload, change: '+12%', changeType: 'positive', description: 'from last month' },
    { name: 'Active Hiring Forms', value: 8, icon: ClipboardList, change: '+2', changeType: 'positive', description: 'new this week' },
    { name: 'Average Evaluation Score', value: '72.5', icon: BarChart, change: '+5.2%', changeType: 'positive', description: 'improvement' },
    { name: 'Candidates Shortlisted', value: 43, icon: Users, change: '+8', changeType: 'positive', description: 'this month' },
  ]

  const recentActivity = [
    { id: 1, candidate: 'John Smith', position: 'Senior Developer', score: 85, status: 'Shortlisted', time: '2 hours ago' },
    { id: 2, candidate: 'Sarah Johnson', position: 'Product Manager', score: 78, status: 'Under Process', time: '4 hours ago' },
    { id: 3, candidate: 'Michael Chen', position: 'Data Scientist', score: 92, status: 'Shortlisted', time: '6 hours ago' },
    { id: 4, candidate: 'Emily Davis', position: 'UX Designer', score: 68, status: 'Manual Review Required', time: '8 hours ago' },
  ]

  const industries = [
    { name: 'Information Technology', count: 45, color: 'bg-blue-500' },
    { name: 'Healthcare', count: 32, color: 'bg-green-500' },
    { name: 'Finance', count: 28, color: 'bg-yellow-500' },
    { name: 'Manufacturing', count: 21, color: 'bg-purple-500' },
    { name: 'Retail', count: 18, color: 'bg-pink-500' },
  ]

  const quickActions = [
    {
      title: 'Upload Resume',
      description: 'Start evaluating new candidates with AI-powered analysis',
      icon: Upload,
      iconColor: 'text-blue-500',
      onClick: () => navigate('/upload')
    },
    {
      title: 'Create Hiring Form',
      description: 'Define role requirements and evaluation criteria',
      icon: ClipboardList,
      iconColor: 'text-green-500',
      onClick: () => navigate('/hiring-form')
    },
    {
      title: 'Manage Prompts',
      description: 'Configure industry-specific evaluation templates',
      icon: FileText,
      iconColor: 'text-purple-500',
      onClick: () => navigate('/prompts')
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <HeroSection
        subtitle="AI-POWERED HIRING"
        title="Welcome to Your Dashboard"
        description="Evaluate candidates holistically across multiple industries with AI-driven insights. Make smarter hiring decisions faster."
        primaryAction={{
          label: 'Upload Resume',
          onClick: () => navigate('/upload')
        }}
        secondaryAction={{
          label: 'View Results',
          onClick: () => navigate('/results')
        }}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={stat.name} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <StatCard
              title={stat.name}
              value={stat.value}
              icon={stat.icon}
              change={stat.change}
              changeType={stat.changeType}
              description={stat.description}
              gradient={index % 2 === 0}
              animate={true}
            />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-6 gradient-text">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <div key={action.title} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <FeatureCard
                title={action.title}
                description={action.description}
                icon={action.icon}
                iconColor={action.iconColor}
                onClick={action.onClick}
                gradient={index === 1}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card hover className="animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Evaluations
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/results">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{activity.candidate}</p>
                      <p className="text-sm text-muted-foreground">{activity.position}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{activity.score}</span>
                        <span className="text-sm text-muted-foreground">/100</span>
                      </div>
                      <Badge
                        variant={
                          activity.status === 'Shortlisted' ? 'default' :
                            activity.status === 'Under Process' ? 'secondary' :
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
        <Card hover className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              Industry Distribution
            </CardTitle>
            <CardDescription>Candidates by industry sector</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {industries.map((industry) => {
                const percentage = (industry.count / industries.reduce((sum, i) => sum + i.count, 0)) * 100
                return (
                  <div key={industry.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${industry.color}`}></div>
                        <span className="font-medium">{industry.name}</span>
                      </div>
                      <span className="text-muted-foreground">{industry.count} candidates</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${industry.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card variant="gradient" className="animate-slide-up">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">🎉 Great Progress!</h3>
              <p className="text-muted-foreground">
                You've processed 12% more resumes this month. Keep up the excellent work!
              </p>
            </div>
            <Button variant="secondary" asChild>
              <Link to="/analytics">View Analytics</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
