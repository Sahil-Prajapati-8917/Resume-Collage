import React, { useState, useEffect } from 'react'
import {
  Settings,
  Shield,
  Database,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  RefreshCw,
  Play,
  Pause,
  ToggleLeft,
  ToggleRight,
  FileText,
  Users,
  Globe,
  Zap,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import apiService from '@/services/api'

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    general: {
      fileUpload: { maxFileSize: 10485760, allowedTypes: ['pdf', 'doc', 'docx', 'txt'], maxFilesPerUpload: 10 },
      aiProviders: { google: { enabled: true, rateLimit: 200 } },
      rateLimits: { api: { windowMs: 900000, max: 1000 } }
    },
    features: {},
    maintenance: {},
    security: { ipWhitelist: [] },
    notifications: {}
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await apiService.getSystemSettings()
      if (response.ok) {
        const result = await response.json()
        setSettings(result.data || settings)
      }
    } catch (error) {
      console.error("Failed to fetch system settings", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await apiService.updateSystemSettings(settings)
      if (response.ok) {
        setHasChanges(false)
      }
    } catch (error) {
      console.error("Failed to save settings", error)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleFeature = (feature, enabled) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: enabled
      }
    }))
    setHasChanges(true)
  }

  const handleToggleMaintenance = (enabled) => {
    setSettings(prev => ({
      ...prev,
      maintenance: {
        ...prev.maintenance,
        mode: enabled
      }
    }))
    setHasChanges(true)
  }

  const handleSaveAudit = async () => {
    setSaving(true)
    try {
      const response = await apiService.updateSystemSettings({ notifications: settings.notifications })
      if (response.ok) {
        setHasChanges(false)
        console.log("Audit settings saved")
      }
    } catch (error) {
      console.error("Failed to save audit settings", error)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'features', name: 'Features', icon: Zap },
    { id: 'maintenance', name: 'Maintenance', icon: RefreshCw },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Wifi }
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
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Configure platform-wide settings and system behavior</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
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

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* File Upload Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>File Upload Configuration</span>
              </CardTitle>
              <CardDescription>Configure file upload limits and allowed types</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (bytes)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.general?.fileUpload?.maxFileSize || 0}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        fileUpload: {
                          ...settings.general.fileUpload,
                          maxFileSize: parseInt(e.target.value)
                        }
                      }
                    })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Current: {(settings.general?.fileUpload?.maxFileSize / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFilesPerUpload">Max Files Per Upload</Label>
                  <Input
                    id="maxFilesPerUpload"
                    type="number"
                    value={settings.general?.fileUpload?.maxFilesPerUpload || 0}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        fileUpload: {
                          ...settings.general.fileUpload,
                          maxFilesPerUpload: parseInt(e.target.value)
                        }
                      }
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Allowed File Types</Label>
                <div className="flex flex-wrap gap-2">
                  {settings.general?.fileUpload?.allowedTypes.map((type, index) => (
                    <Badge key={index} variant="outline">
                      {type.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Provider Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>AI Provider Configuration</span>
              </CardTitle>
              <CardDescription>Configure AI service providers and rate limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.general?.aiProviders || {}).map(([provider, config]) => (
                <div key={provider} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{provider}</div>
                    <div className="text-sm text-muted-foreground">Rate limit: {config.rateLimit} requests/minute</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-muted-foreground">Enabled</div>
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        general: {
                          ...settings.general,
                          aiProviders: {
                            ...settings.general.aiProviders,
                            [provider]: {
                              ...config,
                              enabled: checked
                            }
                          }
                        }
                      })}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Rate Limiting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wifi className="h-5 w-5" />
                <span>Rate Limiting Configuration</span>
              </CardTitle>
              <CardDescription>Configure API rate limits for different endpoints</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {Object.entries(settings.general?.rateLimits || {}).map(([endpoint, config]) => (
                <div key={endpoint} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{endpoint.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="text-sm text-muted-foreground">
                      Window: {config.windowMs / 1000 / 60} minutes
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${endpoint}-max`}>Max Requests</Label>
                    <Input
                      id={`${endpoint}-max`}
                      type="number"
                      value={config.max}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: {
                          ...settings.general,
                          rateLimits: {
                            ...settings.general.rateLimits,
                            [endpoint]: {
                              ...config,
                              max: parseInt(e.target.value)
                            }
                          }
                        }
                      })}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features Tab */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Feature Management</span>
              </CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.features || {}).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{feature.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="text-sm text-muted-foreground">
                      {feature === 'customPrompts' && 'Allow companies to create custom evaluation prompts'}
                      {feature === 'advancedAnalytics' && 'Enable advanced analytics and reporting'}
                      {feature === 'apiAccess' && 'Provide API access for integrations'}
                      {feature === 'bulkImport' && 'Enable bulk user and resume import'}
                      {feature === 'emailNotifications' && 'Send email notifications for events'}
                      {feature === 'auditLogging' && 'Enable comprehensive audit logging'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-muted-foreground">Enabled</div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => handleToggleFeature(feature, checked)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5" />
                <span>Maintenance Mode</span>
              </CardTitle>
              <CardDescription>Control system-wide maintenance and operational status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Maintenance Mode Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">System Maintenance Mode</div>
                  <div className="text-sm text-muted-foreground">
                    When enabled, the system will show a maintenance message to all users
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-muted-foreground">Active</div>
                  <Switch
                    checked={settings.maintenance?.mode}
                    onCheckedChange={handleToggleMaintenance}
                  />
                </div>
              </div>

              {/* Maintenance Message */}
              <div className="space-y-2">
                <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                <Textarea
                  id="maintenanceMessage"
                  value={settings.maintenance?.message || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    maintenance: {
                      ...settings.maintenance,
                      message: e.target.value
                    }
                  })}
                  placeholder="Enter maintenance message..."
                  className="min-h-[100px]"
                />
              </div>

              {/* System Status */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Wifi className="h-4 w-4" />
                      <span>System Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div className={`h-3 w-3 rounded-full ${settings.maintenance?.mode ? 'bg-red-500' : 'bg-green-500'}`} />
                      <span className={settings.maintenance?.mode ? 'text-red-600' : 'text-green-600'}>
                        {settings.maintenance?.mode ? 'Maintenance Mode' : 'Operational'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>User Impact</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {settings.maintenance?.mode
                        ? 'Users will see maintenance message and limited functionality'
                        : 'All features available to users'
                      }
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Scheduled Time</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {settings.maintenance?.scheduled
                        ? new Date(settings.maintenance.scheduled).toLocaleString()
                        : 'No scheduled maintenance'
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button variant="outline">
                  <Play className="mr-2 h-4 w-4" />
                  Resume Operations
                </Button>
                <Button variant="outline">
                  <Pause className="mr-2 h-4 w-4" />
                  Pause Processing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Configuration</span>
              </CardTitle>
              <CardDescription>Configure security policies and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Policy */}
              <div className="space-y-4">
                <div>
                  <div className="font-medium">Password Policy</div>
                  <div className="text-sm text-muted-foreground">Configure password requirements</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minLength">Minimum Length</Label>
                    <Input
                      id="minLength"
                      type="number"
                      value={settings.security?.passwordPolicy?.minLength || 8}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordPolicy: {
                            ...settings.security.passwordPolicy,
                            minLength: parseInt(e.target.value)
                          }
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (ms)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security?.sessionTimeout || 3600000}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          sessionTimeout: parseInt(e.target.value)
                        }
                      })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Current: {(settings.security?.sessionTimeout / 1000 / 60).toFixed(0)} minutes
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.security?.passwordPolicy?.requireUppercase}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordPolicy: {
                            ...settings.security.passwordPolicy,
                            requireUppercase: checked
                          }
                        }
                      })}
                    />
                    <Label>Require Uppercase</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.security?.passwordPolicy?.requireLowercase}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordPolicy: {
                            ...settings.security.passwordPolicy,
                            requireLowercase: checked
                          }
                        }
                      })}
                    />
                    <Label>Require Lowercase</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.security?.passwordPolicy?.requireNumbers}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordPolicy: {
                            ...settings.security.passwordPolicy,
                            requireNumbers: checked
                          }
                        }
                      })}
                    />
                    <Label>Require Numbers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.security?.passwordPolicy?.requireSpecialChars}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordPolicy: {
                            ...settings.security.passwordPolicy,
                            requireSpecialChars: checked
                          }
                        }
                      })}
                    />
                    <Label>Require Special Characters</Label>
                  </div>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-muted-foreground">
                    Require 2FA for all admin users
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-muted-foreground">Enabled</div>
                  <Switch
                    checked={settings.security?.twoFactorAuth}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        twoFactorAuth: checked
                      }
                    })}
                  />
                </div>
              </div>

              {/* IP Whitelist */}
              <div className="space-y-2">
                <Label>IP Whitelist</Label>
                <Textarea
                  value={settings.security?.ipWhitelist.join('\n') || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      ipWhitelist: e.target.value.split('\n').filter(ip => ip.trim())
                    }
                  })}
                  placeholder="Enter allowed IP addresses (one per line)..."
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to allow all IPs. When populated, only listed IPs can access admin functions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wifi className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
              <CardDescription>Configure email and alert notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.notifications || {}).map(([notification, enabled]) => (
                <div key={notification} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{notification.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="text-sm text-muted-foreground">
                      {notification === 'emailAlerts' && 'General email notifications for system events'}
                      {notification === 'criticalAlerts' && 'Critical system alerts and warnings'}
                      {notification === 'aiProviderFailures' && 'Notifications when AI providers fail'}
                      {notification === 'queueBacklog' && 'Alerts when processing queue builds up'}
                      {notification === 'highOverrideRates' && 'Notifications for high human override rates'}
                      {notification === 'securityEvents' && 'Security-related event notifications'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-muted-foreground">Enabled</div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          [notification]: checked
                        }
                      })}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default SystemSettings