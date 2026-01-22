import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, ArrowLeft, ArrowRight, UserPlus, Building, User, Settings, Shield, Eye, EyeOff } from 'lucide-react'

const CreateAccount = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Organization Details
    organizationName: '',
    industry: '',
    companySize: '',
    country: '',
    organizationType: '',

    // Step 2: Recruiter Identity
    fullName: '',
    workEmail: '',
    jobTitle: '',
    linkedinProfile: '',
    phoneNumber: '',

    // Step 3: Account Setup
    username: '',
    password: '',
    confirmPassword: '',
    role: '',

    // Step 4: Compliance & Consent
    aiAcknowledgment: false,
    humanLoopUnderstanding: false,
    auditLoggingAcceptance: false,
    dataProcessingAcceptance: false
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const steps = [
    { id: 1, title: 'Organization Details', icon: Building },
    { id: 2, title: 'Recruiter Identity', icon: User },
    { id: 3, title: 'Account Setup', icon: Settings },
    { id: 4, title: 'Compliance & Consent', icon: Shield },
    { id: 5, title: 'Review & Confirm', icon: CheckCircle }
  ]

  const industries = [
    'IT', 'Healthcare', 'Finance', 'Manufacturing', 'Education', 'Other'
  ]

  const companySizes = [
    '1–10', '11–50', '51–200', '200+'
  ]

  const organizationTypes = [
    'Startup', 'Enterprise', 'Agency', 'Consultancy'
  ]

  const jobTitles = [
    'HR', 'Recruiter', 'Hiring Manager', 'Talent Partner', 'Admin'
  ]

  const roles = [
    'Admin', 'HR Manager', 'Recruiter', 'Viewer'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1:
        if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name is required'
        if (!formData.industry) newErrors.industry = 'Please select an industry'
        if (!formData.companySize) newErrors.companySize = 'Please select company size'
        if (!formData.country.trim()) newErrors.country = 'Country is required'
        if (!formData.organizationType) newErrors.organizationType = 'Please select organization type'
        break

      case 2:
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
        if (!formData.workEmail.trim()) {
          newErrors.workEmail = 'Work email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.workEmail)) {
          newErrors.workEmail = 'Please enter a valid email address'
        }
        if (!formData.jobTitle) newErrors.jobTitle = 'Please select a job title'
        break

      case 3:
        if (!formData.username.trim()) newErrors.username = 'Username is required'
        if (!formData.password) {
          newErrors.password = 'Password is required'
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters long'
        }
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password'
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match'
        }
        if (!formData.role) newErrors.role = 'Please select a role'
        break

      case 4:
        if (!formData.aiAcknowledgment) newErrors.consent = 'Please acknowledge AI-assisted evaluation'
        if (!formData.humanLoopUnderstanding) newErrors.consent = 'Please confirm understanding of human-in-the-loop decisions'
        if (!formData.auditLoggingAcceptance) newErrors.consent = 'Please accept audit logging'
        if (!formData.dataProcessingAcceptance) newErrors.consent = 'Please accept data processing policy'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    setCurrentStep(6) // Success step
    setIsSubmitting(false)
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            currentStep > step.id
              ? 'bg-primary border-primary text-primary-foreground'
              : currentStep === step.id
              ? 'border-primary text-primary'
              : 'border-muted-foreground text-muted-foreground'
          }`}>
            <step.icon className="w-5 h-5" />
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-4 ${
              currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="organizationName">Organization Name *</Label>
              <Input
                id="organizationName"
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                placeholder="e.g., TechCorp Inc."
                className={errors.organizationName ? 'border-red-500' : ''}
              />
              {errors.organizationName && (
                <p className="text-sm text-red-500 mt-1">{errors.organizationName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="industry">Industry *</Label>
              <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-sm text-red-500 mt-1">{errors.industry}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companySize">Company Size *</Label>
                <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                  <SelectTrigger className={errors.companySize ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map(size => (
                      <SelectItem key={size} value={size}>{size} employees</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.companySize && (
                  <p className="text-sm text-red-500 mt-1">{errors.companySize}</p>
                )}
              </div>

              <div>
                <Label htmlFor="country">Country/Region *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="e.g., United States"
                  className={errors.country ? 'border-red-500' : ''}
                />
                {errors.country && (
                  <p className="text-sm text-red-500 mt-1">{errors.country}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="organizationType">Organization Type *</Label>
              <Select value={formData.organizationType} onValueChange={(value) => handleInputChange('organizationType', value)}>
                <SelectTrigger className={errors.organizationType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {organizationTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.organizationType && (
                <p className="text-sm text-red-500 mt-1">{errors.organizationType}</p>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="e.g., John Smith"
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="workEmail">Work Email *</Label>
              <Input
                id="workEmail"
                type="email"
                value={formData.workEmail}
                onChange={(e) => handleInputChange('workEmail', e.target.value)}
                placeholder="john.smith@company.com"
                className={errors.workEmail ? 'border-red-500' : ''}
              />
              {errors.workEmail && (
                <p className="text-sm text-red-500 mt-1">{errors.workEmail}</p>
              )}
            </div>

            <div>
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Select value={formData.jobTitle} onValueChange={(value) => handleInputChange('jobTitle', value)}>
                <SelectTrigger className={errors.jobTitle ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {jobTitles.map(title => (
                    <SelectItem key={title} value={title}>{title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.jobTitle && (
                <p className="text-sm text-red-500 mt-1">{errors.jobTitle}</p>
              )}
            </div>

            <div>
              <Label htmlFor="linkedinProfile">LinkedIn Profile (Optional)</Label>
              <Input
                id="linkedinProfile"
                value={formData.linkedinProfile}
                onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                placeholder="https://linkedin.com/in/johnsmith"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Choose a username"
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a strong password"
                  className={errors.password ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500 mt-1">{errors.role}</p>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Please review and accept the following terms to continue with account creation.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="aiAcknowledgment"
                  checked={formData.aiAcknowledgment}
                  onCheckedChange={(checked) => handleInputChange('aiAcknowledgment', checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="aiAcknowledgment" className="text-sm font-medium">
                    I acknowledge AI-assisted evaluation
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    I understand that candidate evaluations will be assisted by AI technology.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="humanLoopUnderstanding"
                  checked={formData.humanLoopUnderstanding}
                  onCheckedChange={(checked) => handleInputChange('humanLoopUnderstanding', checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="humanLoopUnderstanding" className="text-sm font-medium">
                    I understand human-in-the-loop decisions
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    I acknowledge that final hiring decisions remain with human recruiters.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="auditLoggingAcceptance"
                  checked={formData.auditLoggingAcceptance}
                  onCheckedChange={(checked) => handleInputChange('auditLoggingAcceptance', checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="auditLoggingAcceptance" className="text-sm font-medium">
                    I accept audit logging
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    I agree to have my actions logged for compliance and quality assurance.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="dataProcessingAcceptance"
                  checked={formData.dataProcessingAcceptance}
                  onCheckedChange={(checked) => handleInputChange('dataProcessingAcceptance', checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="dataProcessingAcceptance" className="text-sm font-medium">
                    I accept data processing policy
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    I consent to the processing of candidate and evaluation data as outlined in our policy.
                  </p>
                </div>
              </div>
            </div>

            {errors.consent && (
              <Alert variant="destructive">
                <AlertDescription>{errors.consent}</AlertDescription>
              </Alert>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Please review your information below. You can go back to edit any section.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Organization Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Organization:</span>
                    <span className="text-sm font-medium">{formData.organizationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Industry:</span>
                    <span className="text-sm font-medium">{formData.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Company Size:</span>
                    <span className="text-sm font-medium">{formData.companySize} employees</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <span className="text-sm font-medium">{formData.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <span className="text-sm font-medium">{formData.organizationType}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recruiter Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span className="text-sm font-medium">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="text-sm font-medium">{formData.workEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Job Title:</span>
                    <span className="text-sm font-medium">{formData.jobTitle}</span>
                  </div>
                  {formData.linkedinProfile && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">LinkedIn:</span>
                      <span className="text-sm font-medium">{formData.linkedinProfile}</span>
                    </div>
                  )}
                  {formData.phoneNumber && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Phone:</span>
                      <span className="text-sm font-medium">{formData.phoneNumber}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Username:</span>
                    <span className="text-sm font-medium">{formData.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Role:</span>
                    <span className="text-sm font-medium">{formData.role}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-600">Account Created Successfully!</h3>
              <p className="text-muted-foreground mt-2">
                Welcome to the AI Resume Evaluator platform. Your account has been set up and you can now start evaluating candidates.
              </p>
            </div>
            <Button onClick={() => navigate('/login')} className="w-full">
              Continue to Login
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.organizationName && formData.industry && formData.companySize && formData.country && formData.organizationType
      case 2:
        return formData.fullName && formData.workEmail && formData.jobTitle && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.workEmail)
      case 3:
        return formData.username && formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length >= 8 && formData.role
      case 4:
        return formData.aiAcknowledgment && formData.humanLoopUnderstanding && formData.auditLoggingAcceptance && formData.dataProcessingAcceptance
      case 5:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground">Join the AI Resume Evaluator platform</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Step Indicator - Left Sidebar */}
          <div className="lg:col-span-1">
            {currentStep < 6 && (
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      currentStep > step.id
                        ? 'bg-primary border-primary text-primary-foreground'
                        : currentStep === step.id
                        ? 'border-primary text-primary'
                        : 'border-muted-foreground text-muted-foreground'
                    }`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        Step {step.id}
                      </p>
                      <p className={`text-xs ${
                        currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Content - Right Side */}
          <div className="lg:col-span-3">
            <Card className="h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">
                  {currentStep < 6 ? `Step ${currentStep}: ${steps[currentStep - 1]?.title}` : 'Success'}
                </CardTitle>
                {currentStep < 6 && (
                  <CardDescription className="text-sm">
                    {currentStep === 1 && "Tell us about your organization"}
                    {currentStep === 2 && "Provide your professional information"}
                    {currentStep === 3 && "Set up your account credentials"}
                    {currentStep === 4 && "Review and accept our policies"}
                    {currentStep === 5 && "Confirm your information"}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-6">
                {renderStepContent()}
              </CardContent>
              {currentStep < 6 && (
                <div className="flex justify-between items-center px-6 py-4 border-t bg-muted/50">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    size="sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  {currentStep < 5 ? (
                    <Button onClick={handleNext} disabled={!isStepValid()} size="sm">
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/90"
                      size="sm"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {currentStep < 6 && (
              <div className="text-center mt-4">
                <p className="text-xs text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAccount
