import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Shield,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Database
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const Alerts = () => {
  const navigate = useNavigate()

  // Mock alerts data
  const mockAlerts = [
    {
      id: '1',
      type: 'warning',
      severity: 'high',
      title: 'High Override Rate Detected',
      message: 'Healthcare industry showing 15% override rate (above 10% threshold). This may indicate issues with AI evaluation accuracy.',
      category: 'Evaluation Quality',
      timestamp: '2 minutes ago',
      action: 'Review Evaluations',
      actionUrl: '/master-admin/evaluation-oversight'
    },
    {
      id: '2',
      type: 'info',
      severity: 'medium',
      title: 'New Company Registered',
      message: 'TechCorp Inc. registered with 50 users. Consider setting up industry-specific evaluation prompts.',
      category: 'Company Management',
      timestamp: '15 minutes ago',
      action: 'Configure Company',
      actionUrl: '/master-admin/companies'
    },
    {
      id: '3',
      type: 'error',
      severity: 'critical',
      title: 'AI Provider Rate Limit Approaching',
      message: 'OpenAI API calls at 90% of daily limit. System may experience delays in resume processing.',
      category: 'System Health',
      timestamp: '2 hours ago',
      action: 'Check Usage',
      actionUrl: '/master-admin/settings'
    },
    {
      id: '4',
      type: 'success',
      severity: 'low',
      title: 'Database Optimization Complete',
      message: 'Performance improved by 23% after optimization. Resume processing times reduced.',
      category: 'System Performance',
      timestamp: '1 hour ago',
      action: 'View Details',
      actionUrl: '/master-admin/analytics'
    },
    {
      id: '5',
      type: 'warning',
      severity: 'medium',
      title: 'Security Update Required',
      message: 'New security patches available. Scheduled maintenance window recommended.',
      category: 'Security',
      timestamp: '1 day ago',
      action: 'Schedule Maintenance',
      actionUrl: '/master-admin/settings/maintenance'
    }
  ]

  const [alerts] = useState(mockAlerts)
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set())

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return AlertTriangle
      case 'warning': return AlertTriangle
      case 'success': return CheckCircle
      case 'info': return Info
      default: return Info
    }
  }

  const getAlertColor = (type, severity) => {
    if (type === 'error') return 'border-red-500 bg-red-50'
    if (type === 'warning') {
      return severity === 'high' ? 'border-orange-500 bg-orange-50' : 'border-yellow-500 bg-yellow-50'
    }
    if (type === 'success') return 'border-green-500 bg-green-50'
    return 'border-blue-500 bg-blue-50'
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const handleDismiss = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]))
  }

  const handleAction = (alert) => {
    console.log(`Action clicked for: ${alert.title}`)
    // In a real app, this would navigate to the appropriate page
    navigate(alert.actionUrl)
  }

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id))

  if (visibleAlerts.length === 0) {
    return null
  }

  return (
    <div className="fixed top-16 right-4 z-50 space-y-3 max-w-sm">
      {visibleAlerts.map((alert) => {
        const Icon = getAlertIcon(alert.type)
        return (
          <Card
            key={alert.id}
            className={`border-l-4 ${getAlertColor(alert.type, alert.severity)} animate-in slide-in-from-right-2 duration-300`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className={`mt-1 ${alert.type === 'error' ? 'text-red-600' :
                  alert.type === 'warning' ? 'text-orange-600' :
                    alert.type === 'success' ? 'text-green-600' : 'text-blue-600'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{alert.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={`${getSeverityColor(alert.severity)} text-white text-xs`}>
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {alert.category}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(alert)}
                        className="text-xs"
                      >
                        {alert.action}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismiss(alert.id)}
                        className="text-xs"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default Alerts
