import React, { useState, useEffect } from 'react'
import apiService from '@/services/api'
import { Plus, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  const [fetchingForms, setFetchingForms] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [savedForms, setSavedForms] = useState([])
  const [editingId, setEditingId] = useState(null)

  const [industries, setIndustries] = useState([])
  const [availablePrompts, setAvailablePrompts] = useState([])

  useEffect(() => {
    fetchIndustries()
    fetchSavedForms()
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
      const response = await apiService.get(`/prompts/industry/${industryId}`)
      if (response.ok) {
        const data = await response.json()
        setAvailablePrompts(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
      setAvailablePrompts([])
    }
  }

  const fetchIndustries = async () => {
    try {
      const response = await apiService.get('/industries')
      if (response.ok) {
        const data = await response.json()
        setIndustries(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch industries:', error)
    }
  }

  const fetchSavedForms = async () => {
    setFetchingForms(true)
    try {
      const response = await apiService.get('/hiring-forms')
      if (response.ok) {
        const data = await response.json()
        setSavedForms(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch saved forms:', error)
    } finally {
      setFetchingForms(false)
    }
  }

  const handleEdit = (form) => {
    setEditingId(form._id)
    setFormData({
      formName: form.formName,
      title: form.title,
      industry: form.industry,
      promptId: form.promptId,
      experienceLevel: form.experienceLevel,
      jobType: form.jobType || 'full-time',
      responsibilities: form.responsibilities?.length > 0 ? form.responsibilities : [''],
      requirements: form.requirements?.length > 0 ? form.requirements : [''],
      roleExpectations: form.roleExpectations?.length > 0 ? form.roleExpectations : [''],
      performanceIndicators: form.performanceIndicators?.length > 0 ? form.performanceIndicators : ['']
    })
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({
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
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hiring form?')) return

    try {
      const response = await apiService.delete(`/hiring-forms/${id}`)
      if (response.ok) {
        setSavedForms(prev => prev.filter(f => f._id !== id))
        if (editingId === id) handleCancelEdit()
        setStatus({ type: 'success', message: 'Hiring form deleted successfully!' })
      } else {
        const data = await response.json()
        throw new Error(data.message || 'Failed to delete form')
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
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
      let response;
      if (editingId) {
        response = await apiService.put(`/hiring-forms/${editingId}`, formData)
      } else {
        response = await apiService.post('/hiring-forms', formData)
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save hiring form')
      }

      setStatus({ type: 'success', message: editingId ? 'Hiring form updated successfully!' : 'Hiring form saved successfully!' })
      fetchSavedForms()
      if (!editingId) {
        // Reset form after successful create
        setFormData({
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
      }
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
          <CardTitle className="text-2xl">{editingId ? 'Edit Hiring Form' : 'Create Hiring Form'}</CardTitle>
        </CardHeader>
        <CardContent>
          {editingId
            ? `Updating evaluation criteria for ${formData.formName}.`
            : 'Define role requirements and evaluation criteria for AI-powered candidate assessment.'}
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
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                    disabled={!!editingId}
                  >
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
                  {editingId && <p className="text-xs text-muted-foreground mt-1">Industry cannot be changed after creation.</p>}
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

          <Card>
            <CardHeader>
              <CardTitle>Key Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.responsibilities.map((responsibility, index) => (
                <div key={index} className="flex space-x-2 mb-3">
                  <Input
                    type="text"
                    value={responsibility}
                    onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                    placeholder="e.g., Lead development of web applications"
                    className="flex-1"
                  />
                  {formData.responsibilities.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeArrayItem('responsibilities', index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button onClick={() => addArrayItem('responsibilities')} variant="ghost" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-1" />
                Add Responsibility
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex space-x-2 mb-3">
                  <Input
                    type="text"
                    value={requirement}
                    onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                    placeholder="e.g., 5+ years of experience with React"
                    className="flex-1"
                  />
                  {formData.requirements.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeArrayItem('requirements', index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button onClick={() => addArrayItem('requirements')} variant="ghost" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-1" />
                Add Requirement
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role Expectations</CardTitle>
              <CardDescription>
                Define what you expect from candidate in this role (performance goals, cultural fit, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formData.roleExpectations.map((expectation, index) => (
                <div key={index} className="flex space-x-2 mb-3">
                  <Input
                    type="text"
                    value={expectation}
                    onChange={(e) => handleArrayChange('roleExpectations', index, e.target.value)}
                    placeholder="e.g., Lead a team of 3-5 developers"
                    className="flex-1"
                  />
                  {formData.roleExpectations.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeArrayItem('roleExpectations', index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button onClick={() => addArrayItem('roleExpectations')} variant="ghost" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-1" />
                Add Role Expectation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>
                Define measurable indicators for success in this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formData.performanceIndicators.map((indicator, index) => (
                <div key={index} className="flex space-x-2 mb-3">
                  <Input
                    type="text"
                    value={indicator}
                    onChange={(e) => handleArrayChange('performanceIndicators', index, e.target.value)}
                    placeholder="e.g., Complete projects within 10% of budget"
                    className="flex-1"
                  />
                  {formData.performanceIndicators.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeArrayItem('performanceIndicators', index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button onClick={() => addArrayItem('performanceIndicators')} variant="ghost" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-1" />
                Add Performance Indicator
              </Button>
            </CardContent>
          </Card>
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
                  {editingId ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                editingId ? 'Update Hiring Form' : 'Save Hiring Form'
              )}
            </Button>
            {editingId && (
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="w-full mt-3"
              >
                Cancel Edit
              </Button>
            )}
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

      {/* Previous Hiring Forms List */}
      <Card>
        <CardHeader>
          <CardTitle>Previous Hiring Forms</CardTitle>
          <CardDescription>View and manage previously created evaluation configurations.</CardDescription>
        </CardHeader>
        <CardContent>
          {fetchingForms ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : savedForms.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Form Name</th>
                    <th className="text-left py-3 px-2 font-medium">Job Title</th>
                    <th className="text-left py-3 px-2 font-medium">Industry</th>
                    <th className="text-left py-3 px-2 font-medium">Exp. Level</th>
                    <th className="text-right py-3 px-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {savedForms.map((form) => (
                    <tr key={form._id} className={`hover:bg-muted/50 ${editingId === form._id ? 'bg-blue-50' : ''}`}>
                      <td className="py-3 px-2 font-medium">{form.formName}</td>
                      <td className="py-3 px-2">{form.title}</td>
                      <td className="py-3 px-2">{form.industry}</td>
                      <td className="py-3 px-2">{form.experienceLevel}</td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex justify-end space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(form)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(form._id)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No previous hiring forms found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default HiringForm
