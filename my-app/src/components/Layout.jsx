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
  User,
  Sparkles
} from 'lucide-react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

const Layout = ({ children }) => {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
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
        <Sidebar className="border-r border-border/50">
          <SidebarHeader className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex h-16 items-center px-6 gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-md rounded-lg" />
                <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-lg p-2">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">
                  AI Resume
                </h1>
                <p className="text-xs text-muted-foreground">Evaluator</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="py-4">
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        transition-all duration-300 mx-2 rounded-lg
                        ${isActive
                          ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-l-2 border-primary shadow-sm'
                          : 'hover:bg-muted/50 hover:translate-x-1'
                        }
                      `}
                    >
                      <Link to={item.href} className="flex items-center gap-3 px-3 py-2">
                        <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                        <span className={isActive ? 'font-semibold' : ''}>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs font-medium text-muted-foreground">
                  System Online
                </p>
              </div>
              <p className="text-xs text-muted-foreground/70">
                Multi-Industry AI Hiring Platform
              </p>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md shadow-sm">
            <div className="flex h-16 items-center px-6">
              <SidebarTrigger className="mr-4 hover:bg-muted/50 transition-colors duration-200" />
              <div className="flex items-center justify-between flex-1">
                <div>
                  <h2 className="text-lg font-semibold">
                    Holistic Resume Evaluation
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Powered by AI-driven evaluation
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-medium text-primary">AI Active</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-gradient-to-br from-background via-background to-muted/20">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Layout
