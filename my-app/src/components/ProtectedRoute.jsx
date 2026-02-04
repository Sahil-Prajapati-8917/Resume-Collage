import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import authService from '../services/auth'

const ProtectedRoute = ({ children, requiredRole = null, requiredPermission = null }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [hasAccess, setHasAccess] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const checkAccess = async () => {
      // Check if user is authenticated
      const token = localStorage.getItem('token')
      if (!token) {
        setIsAuthenticated(false)
        return
      }

      setIsAuthenticated(true)

      // Check role requirements
      if (requiredRole) {
        const isAdmin = await authService.isAdmin()
        const isMasterAdmin = await authService.isMasterAdmin()
        const isOpsAdmin = await authService.isOpsAdmin()

        let roleCheck = false
        switch (requiredRole) {
          case 'master_admin':
            roleCheck = isMasterAdmin
            break
          case 'ops_admin':
            roleCheck = isOpsAdmin
            break
          case 'admin':
            roleCheck = isAdmin
            break
          default:
            roleCheck = true
        }

        if (!roleCheck) {
          setHasAccess(false)
          return
        }
      }

      // Check permission requirements
      if (requiredPermission) {
        const hasPermission = await authService.hasPermission(requiredPermission)
        if (!hasPermission) {
          setHasAccess(false)
          return
        }
      }

      setHasAccess(true)
    }

    checkAccess()
  }, [requiredRole, requiredPermission])

  // Show loading spinner while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location, error: "Please log in to access this page" }} replace />
  }

  // Show access denied if no access
  if (isAuthenticated && !hasAccess) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Render children if authenticated and has access
  return children
}

export default ProtectedRoute