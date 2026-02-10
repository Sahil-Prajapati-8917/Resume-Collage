import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, Eye, EyeOff } from 'lucide-react'

const PasswordPrompt = ({ onPasswordCorrect, onCancel }) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  // In a real app, this would come from environment variables or a secure config
  // Use environment variable for admin password, fallback for local dev if needed
  const CORRECT_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (password === CORRECT_PASSWORD) {
      onPasswordCorrect()
    } else {
      // Immediately redirect to login page on wrong password
      onCancel()
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => { }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Access Required
          </DialogTitle>
          <DialogDescription>
            Please enter the administrator password to access account creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Administrator Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Verify Password
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PasswordPrompt
