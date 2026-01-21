import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Upload, 
  ClipboardList,
  BarChart,
  Settings,
  FileText,
  History,
  User
} from 'lucide-react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

const Layout = ({ children }) => {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Upload Resume', href: '/upload', icon: Upload },
    { name: 'Hiring Form', href: '/hiring-form', icon: ClipboardList },
    { name: 'Evaluation Results', href: '/results', icon: BarChart },
    { name: 'Prompt Management', href: '/prompts', icon: Settings },
    { name: 'Audit Trail', href: '/audit', icon: FileText },
    { name: 'History', href: '/history', icon: History },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <Sidebar>
          <SidebarHeader className="border-b">
            <div className="flex h-16 items-center px-6">
              <h1 className="text-xl font-bold">
                AI Resume Evaluator
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                    >
                      <Link to={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t">
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground text-center">
                Multi-Industry AI Hiring Platform
              </p>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 bg-background shadow-sm border-b">
            <div className="flex h-16 items-center px-6">
              <SidebarTrigger className="mr-4" />
              <div className="flex items-center justify-between flex-1">
                <h2 className="text-lg font-semibold">
                  Holistic Resume Evaluation Platform
                </h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    Powered by AI-driven evaluation
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Layout
