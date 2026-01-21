import React, { useState, useEffect } from 'react'
import { Plus, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

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
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Hiring Form</h1>
        <p className="text-gray-600">
          Define role requirements and evaluation criteria for AI-powered candidate assessment.
        </p>
      </div>

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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Name *</label>
              <input
                type="text"
                name="formName"
                value={formData.formName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Senior Developer Assessment v1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select industry...</option>
                    {industries.map(industry => (
                      <option key={industry._id || industry} value={industry.name || industry}>{industry.name || industry}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Prompt *</label>
                <select
                  name="promptId" // Updated to promptId
                  value={formData.promptId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!formData.industry || availablePrompts.length === 0}
                >
                  <option value="">Select prompt...</option>
                  {availablePrompts.map(prompt => (
                    <option key={prompt._id} value={prompt._id}>
                      {prompt.name} (v{prompt.version})
                    </option>
                  ))}
                </select>
                {formData.industry && availablePrompts.length === 0 && (
                  <div className="text-xs text-orange-500 mt-1">No prompts available for this industry.</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level *</label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select experience level...</option>
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {jobTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

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
