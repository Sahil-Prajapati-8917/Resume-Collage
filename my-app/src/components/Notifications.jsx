import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  Shield,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [isVisible, setIsVisible] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Mock notifications data
  useEffect(() => {
    const mockNotifications = [
      {
        id: '1',
        type: 'warning',
        title: 'High Override Rate Detected',
        message: 'Healthcare industry showing 15% override rate (above 10% threshold)',
        timestamp: '2 minutes ago',
        action: 'Review Evaluations',
        read: false
      },
      {
        id: '2',
        type: 'info',
        title: 'New Company Registered',
        message: 'TechCorp Inc. registered with 50 users',
        timestamp: '15 minutes ago',
        action: 'View Company',
        read: false
      },
      {
        id: '3',
        type: 'success',
        title: 'Database Optimization Complete',
        message: 'Performance improved by 23% after optimization',
        timestamp: '1 hour ago',
        action: 'View Details',
        read: true
      },
      {
        id: '4',
        type: 'error',
        title: 'AI Provider Rate Limit Approaching',
        message: 'OpenAI API calls at 90% of daily limit',
        timestamp: '2 hours ago',
        action: 'Check Usage',
        read: false
      },
      {
        id: '5',
        type: 'info',
        title: 'Security Update Applied',
        message: 'Latest security patches applied successfully',
        timestamp: '1 day ago',
        action: 'View Changelog',
        read: true
      }
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
  }, [])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'error': return AlertTriangle
      case 'warning': return AlertTriangle
      case 'success': return CheckCircle
      case 'info': return Info
      default: return Info
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      case 'success': return 'text-green-600'
      case 'info': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getNotificationBg = (type) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'success': return 'bg-green-50 border-green-200'
      case 'info': return 'bg-blue-50 border-blue-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleClearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    setUnreadCount(prev => prev - 1)
  }

  const handleAction = (notification) => {
    console.log(`Action clicked for: ${notification.title}`)
    // Handle specific actions based on notification type
    switch (notification.type) {
      case 'warning':
        // Navigate to evaluation oversight
        break
      case 'info':
        // Navigate to company management
        break
      case 'error':
        // Navigate to system settings
        break
      default:
        break
    }
  }

  return (
    <>
      {/* Notification Bell Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible(!isVisible)}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notifications Dropdown */}
      {isVisible && (
        <div className="fixed top-16 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark All Read
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsVisible(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No notifications
                </div>
              ) : (
                <ScrollArea className="h-80 pr-4">
                  <div className="space-y-3">
                    {notifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type)
                      return (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg border ${getNotificationBg(notification.type)} ${
                            !notification.read ? 'ring-2 ring-primary/20' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {notification.timestamp}
                                </span>
                                <div className="flex space-x-2">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMarkAsRead(notification.id)}
                                      className="text-xs"
                                    >
                                      Mark Read
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAction(notification)}
                                    className="text-xs"
                                  >
                                    {notification.action}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleClearNotification(notification.id)}
                                    className="text-xs"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Click outside to close */}
      {isVisible && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsVisible(false)}
        />
      )}
    </>
  )
}

export default Notifications