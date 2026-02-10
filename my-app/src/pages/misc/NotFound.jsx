import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileQuestion, Home, Search, ArrowLeft } from 'lucide-react'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <FileQuestion className="w-10 h-10 text-primary" />
          </div>
          <div>
            <CardTitle className="text-4xl font-bold text-primary">404</CardTitle>
            <CardDescription className="text-lg mt-2">
              Page Not Found
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist in our AI Resume Evaluator system.
            It might have been moved, deleted, or you entered the wrong URL.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/')}
              className="w-full"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>

            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>

            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>AI Resume Evaluator</strong><br />
              Holistic candidate assessment powered by advanced AI
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotFound
