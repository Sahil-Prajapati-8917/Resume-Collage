import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Building2,
  Users,
  ClipboardList,
  Settings,
  FileText,
  BarChart3,
  Shield,
  Cog,
  Bell,
  Menu,
  X,
  Plus,
  Upload
} from 'lucide-react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Notifications from './Notifications'
import Alerts from './Alerts'

const MasterAdminLayout = ({ children }) => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/master-admin/dashboard', 
      icon: Home,
      description: 'System overview and key metrics'
    },
    { 
      name: 'Companies', 
      href: '/master-admin/companies', 
      icon: Building2,
      description: 'Manage all tenant companies'
    },
    { 
      name: 'HR & Users', 
      href: '/master-admin/hr-users', 
      icon: Users,
      description: 'Manage HR accounts and permissions'
    },
    { 
      name: 'Global Hiring Forms', 
      href: '/master-admin/global-hiring-forms', 
      icon: ClipboardList,
      description: 'Industry-specific form templates'
    },
    { 
      name: 'AI Prompt Management', 
      href: '/master-admin/prompt-management', 
      icon: Settings,
      description: 'Configure evaluation prompts'
    },
    { 
      name: 'Evaluation Oversight', 
      href: '/master-admin/evaluation-oversight', 
      icon: FileText,
      description: 'Monitor AI decisions across companies'
    },
    { 
      name: 'Audit & Compliance', 
      href: '/master-admin/audit-trail', 
      icon: Shield,
      description: 'Security logs and compliance'
    },
    { 
      name: 'System Analytics', 
      href: '/master-admin/analytics', 
      icon: BarChart3,
      description: 'Platform-wide insights'
    },
    { 
      name: 'System Settings', 
      href: '/master-admin/settings', 
      icon: Cog,
      description: 'Global configuration'
    }
  ]

  const alerts = [
    { type: 'warning', message: 'High override rate detected in Healthcare industry' },
    { type: 'info', message: 'New company registered: TechCorp Inc.' },
    { type: 'error', message: 'AI provider rate limit approaching' }
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <Sidebar className={`border-r bg-muted/40 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'}`}>
          <SidebarHeader className="border-b">
            <div className="flex h-16 items-center px-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Master Admin</h1>
                  <p className="text-xs text-muted-foreground">Platform Control</p>
                </div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 py-4">
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }`}
                    >
                      <item.icon className={`h-4 w-4 transition-colors ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        <span className="text-xs text-muted-foreground group-hover:text-foreground/70">
                          {item.description}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>

            {/* Quick Actions */}
            <div className="mt-6 px-3">
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Company
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  Bulk Import Users
                </Button>
              </div>
            </div>
          </SidebarContent>

          <SidebarFooter className="border-t">
            <div className="flex flex-col space-y-2 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">System Status</div>
                <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-500/30">
                  Operational
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                All systems running normally
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 bg-background border-b shadow-sm">
            <div className="flex h-16 items-center justify-between px-6">
              {/* Left Section */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden"
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
                <div className="hidden lg:flex items-center space-x-2">
                  <h2 className="text-lg font-semibold">AI Resume Evaluation Platform</h2>
                  <Badge variant="secondary" className="ml-2">Master Admin</Badge>
                </div>
              </div>

              {/* Center Section - Alerts */}
              <div className="hidden md:flex items-center space-x-4">
                {alerts.slice(0, 2).map((alert, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className={`h-2 w-2 rounded-full ${
                      alert.type === 'error' ? 'bg-red-500' :
                      alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-muted-foreground">{alert.message}</span>
                  </div>
                ))}
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-4">
                <Notifications />
                
                <div className="hidden md:flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">MA</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Master Admin</span>
                    <span className="text-xs text-muted-foreground">platform@company.com</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-background via-background to-muted/50">
            {children}
          </main>
        </div>

        {/* Alerts Component */}
        <Alerts />
      </div>
    </SidebarProvider>
  )
}

export default MasterAdminLayout
