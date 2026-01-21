import React, { useState, useEffect } from 'react'
import { Plus, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const HiringForm = () => {
  const [formData, setFormData] = useState({
    formName: '',
    title: '',
    industry: '',
    promptId: '',
    experienceLevel: '',
    jobType: 'full-time',
    responsibilities: [''],
    requirements: [''],
    roleExpectations: [''],
    performanceIndicators: ['']
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const [industries, setIndustries] = useState([])
  const [availablePrompts, setAvailablePrompts] = useState([])

  useEffect(() => {
    fetchIndustries()
  }, [])

  useEffect(() => {
    if (formData.industry && industries.length > 0) {
      const selectedInd = industries.find(i => (i.name || i) === formData.industry)
      if (selectedInd && selectedInd._id) {
        fetchPrompts(selectedInd._id)
      } else {
        setAvailablePrompts([])
      }
    } else {
      setAvailablePrompts([])
    }
  }, [formData.industry, industries])

  const fetchPrompts = async (industryId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/prompts/industry/${industryId}`)
      const data = await response.json()
      if (data.success) {
        setAvailablePrompts(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
      setAvailablePrompts([])
    }
  }

  const fetchIndustries = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/industries')
      const data = await response.json()
      if (data.success) {
        setIndustries(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch industries:', error)
      setIndustries([
        { name: 'Information Technology' },
        { name: 'Automobile & Car Industry' },
        { name: 'Manufacturing & Production' },
        { name: 'Electronics & Hardware' },
        { name: 'Banking & Finance' },
        { name: 'Healthcare & Medical Technology' },
        { name: 'Logistics & Supply Chain' },
        { name: 'Education & Research' },
        { name: 'Retail & Corporate Services' }
      ])
    }
  }




  const experienceLevels = [
    'Entry Level (0-2 years)',
    'Junior (2-5 years)',
    'Mid-Level (5-8 years)',
    'Senior (8-12 years)',
    'Lead/Principal (12+ years)'
  ]

  const jobTypes = [
    { value: 'full-time', label: 'Full-time Position' },
    { value: 'internship', label: 'Internship' },
    { value: 'placement', label: 'Placement' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }))
  }

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await fetch('http://localhost:3001/api/hiring-forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save hiring form')
      }

      setStatus({ type: 'success', message: 'Hiring form saved successfully!' })
      // Optional: Reset form or redirect
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Hiring Form</CardTitle>
        </CardHeader>
        <CardContent>
          Define role requirements and evaluation criteria for AI-powered candidate assessment.
        </CardContent>
      </Card>

      {status.message && (
        <Alert variant={status.type === 'error' ? 'destructive' : 'default'} className={`mb-6 ${status.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : ''}`}>
          {status.type === 'error' && <AlertTriangle className="h-4 w-4" />}
          <AlertTitle>{status.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>
            {status.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="formName">Form Name *</Label>
                <Input
                  id="formName"
                  name="formName"
                  value={formData.formName}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior Developer Assessment v1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry..." />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry._id || industry} value={industry.name || industry}>
                          {industry.name || industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="promptId">Evaluation Prompt *</Label>
                  <Select
                    value={formData.promptId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, promptId: value }))}
                    disabled={!formData.industry || availablePrompts.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select prompt..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePrompts.map(prompt => (
                        <SelectItem key={prompt._id} value={prompt._id}>
                          {prompt.name} (v{prompt.version})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.industry && availablePrompts.length === 0 && (
                    <p className="text-xs text-orange-500 mt-1">No prompts available for this industry.</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="experienceLevel">Experience Level *</Label>
                  <Select value={formData.experienceLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level..." />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map(level => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="jobType">Job Type *</Label>
                  <Select value={formData.jobType} onValueChange={(value) => setFormData(prev => ({ ...prev, jobType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Responsibilities</h2>
            {formData.responsibilities.map((responsibility, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={responsibility}
                  onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Lead development of web applications"
                />
                {formData.responsibilities.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeArrayItem('responsibilities', index)} className="p-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button onClick={() => addArrayItem('responsibilities')} variant="ghost" className="mt-2">
              <Plus className="h-4 w-4 mr-1" />
              Add Responsibility
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Qualifications</h2>
            {formData.requirements.map((requirement, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5+ years of experience with React"
                />
                {formData.requirements.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeArrayItem('requirements', index)} className="p-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button onClick={() => addArrayItem('requirements')} variant="ghost" className="mt-2">
              <Plus className="h-4 w-4 mr-1" />
              Add Requirement
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Expectations</h2>
            <p className="text-sm text-gray-600 mb-4">
              Define what you expect from candidate in this role (performance goals, cultural fit, etc.)
            </p>
            {formData.roleExpectations.map((expectation, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={expectation}
                  onChange={(e) => handleArrayChange('roleExpectations', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Lead a team of 3-5 developers"
                />
                {formData.roleExpectations.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeArrayItem('roleExpectations', index)} className="p-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button onClick={() => addArrayItem('roleExpectations')} variant="ghost" className="mt-2">
              <Plus className="h-4 w-4 mr-1" />
              Add Role Expectation
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h2>
            <p className="text-sm text-gray-600 mb-4">
              Define measurable indicators for success in this role
            </p>
            {formData.performanceIndicators.map((indicator, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={indicator}
                  onChange={(e) => handleArrayChange('performanceIndicators', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Complete projects within 10% of budget"
                />
                {formData.performanceIndicators.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeArrayItem('performanceIndicators', index)} className="p-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button onClick={() => addArrayItem('performanceIndicators')} variant="ghost" className="mt-2">
              <Plus className="h-4 w-4 mr-1" />
              Add Performance Indicator
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Button
              onClick={handleSave}
              disabled={loading || !formData.formName || !formData.title || !formData.industry || !formData.experienceLevel}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Hiring Form'
              )}
            </Button>
          </div>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Smart Evaluation</p>
                  <p className="text-sm text-blue-700 mt-1">
                    The AI will use these criteria to evaluate candidates holistically, considering context and experience depth rather than just keyword matching.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default HiringForm
