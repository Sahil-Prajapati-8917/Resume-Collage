import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import authService from '../../services/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogIn, Eye, EyeOff, Sparkles } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState(location.state?.error || '')
  const [loading, setLoading] = useState(false)


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await authService.login(email, password)

    if (result.success) {
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userEmail', email)
      navigate('/dashboard')
    } else {
      setError(result.error?.message || 'Invalid email or password')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
        backgroundSize: '48px 48px'
      }} />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="text-center space-y-4 pb-8 pt-10 bg-gradient-to-b from-gray-50/50 to-white">
            {/* Logo/Brand */}
            <div className="flex justify-center mb-2">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full group-hover:bg-primary/20 transition-all duration-500" />
                <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-500">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base text-gray-600 font-medium">
                Sign in to your AI Resume Evaluator account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="animate-slide-down border-destructive/50">
                  <AlertDescription className="font-medium">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base pr-12 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-4 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 mt-8"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/create-account')}
                  className="text-primary hover:text-primary/80 font-semibold hover:underline underline-offset-4 transition-all duration-200"
                >
                  Create one here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tagline */}
        <p className="text-center mt-8 text-gray-500 text-sm font-medium animate-fade-in">
          🚀 Powered by AI-driven holistic evaluation
        </p>
      </div>
    </div>
  )
}

export default Login
