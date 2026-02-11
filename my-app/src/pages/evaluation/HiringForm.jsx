import React, { useState, useEffect } from 'react'
import apiService from '@/services/api'
import {
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Briefcase,
  Target,
  Settings2,
  ListChecks,
  History,
  CheckCircle2,
  Trash,
  Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

const HiringForm = () => {
  const [formData, setFormData] = useState({
    description: '',
    deadline: '',
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
    } catch {
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
      description: form.description || '',
      deadline: form.deadline ? new Date(form.deadline).toISOString().split('T')[0] : '',
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({
      description: '',
      deadline: '',
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
    if (!window.confirm('Are you sure? This action cannot be undone.')) return
    try {
      const response = await apiService.delete(`/hiring-forms/${id}`)
      if (response.ok) {
        setSavedForms(prev => prev.filter(f => f._id !== id))
        if (editingId === id) handleCancelEdit()
        setStatus({ type: 'success', message: 'Evaluation criteria deleted.' })
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
      let response = editingId
        ? await apiService.put(`/hiring-forms/${editingId}`, formData)
        : await apiService.post('/hiring-forms', formData)

      if (response.ok) {
        const data = await response.json()
        setStatus({
          type: 'success',
          message: editingId
            ? 'Criteria updated successfully'
            : 'Job posting created successfully!'
        })

        // Show shareable link for new forms
        if (!editingId && data.data) {
          setTimeout(() => {
            const link = `${window.location.origin}/apply/${data.data._id}`
            if (window.confirm(`Job created! Share this link with candidates:\n\n${link}\n\nClick OK to copy to clipboard`)) {
              navigator.clipboard.writeText(link)
              setStatus({ type: 'success', message: 'Link copied to clipboard!' })
            }
          }, 1000)
        }

        fetchSavedForms()
        if (!editingId) handleCancelEdit()
      } else {
        const data = await response.json()
        throw new Error(data.error?.message || data.message || 'Validation failed.')
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  const copyPublicLink = (id) => {
    const link = `${window.location.origin}/apply/${id}`;
    navigator.clipboard.writeText(link);
    setStatus({ type: 'success', message: 'Public link copied to clipboard!' });
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  }

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Hiring Criteria / Jobs</h1>
        <p className="text-muted-foreground">Create job openings and define evaluation constraints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          {status.message && (
            <Alert variant={status.type === 'error' ? 'destructive' : 'default'} className="bg-card/50 border-border/40">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{status.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}

          <Card className="border-border/40 bg-card/50">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Briefcase className="size-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Job Details</CardTitle>
                <CardDescription>Primary job identity and industry sector.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="formName" className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Internal Reference Name</Label>
                  <Input id="formName" name="formName" value={formData.formName} onChange={handleInputChange} placeholder="e.g., Q3 Senior React Engineer" className="bg-background/50 h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Application Deadline</Label>
                  <Input id="deadline" name="deadline" type="date" value={formData.deadline} onChange={handleInputChange} className="bg-background/50 h-11" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Job Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter detailed job description..."
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Job Title</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Frontend Lead" className="bg-background/50 h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Industry</Label>
                  <Select value={formData.industry} onValueChange={(v) => setFormData(p => ({ ...p, industry: v }))} disabled={!!editingId}>
                    <SelectTrigger className="bg-background/50 h-11">
                      <SelectValue placeholder="Select Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(i => (
                        <SelectItem key={i._id || i} value={i.name || i}>{i.name || i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Target className="size-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Evaluation Metrics</CardTitle>
                <CardDescription>Define responsibilities and key qualifications.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Key Responsibilities</Label>
                  <Button variant="ghost" size="sm" onClick={() => addArrayItem('responsibilities')} className="h-7 text-[10px] uppercase font-bold tracking-wider">
                    <Plus className="size-3 mr-1" /> Add Item
                  </Button>
                </div>
                <div className="flex flex-col gap-3">
                  {formData.responsibilities.map((r, i) => (
                    <div key={i} className="group relative">
                      <Input value={r} onChange={(e) => handleArrayChange('responsibilities', i, e.target.value)} placeholder="Enter responsibility..." className="bg-background/50 pr-10" />
                      {formData.responsibilities.length > 1 && (
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 size-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeArrayItem('responsibilities', i)}>
                          <Trash className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-border/20" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Minimum Qualifications</Label>
                  <Button variant="ghost" size="sm" onClick={() => addArrayItem('requirements')} className="h-7 text-[10px] uppercase font-bold tracking-wider">
                    <Plus className="size-3 mr-1" /> Add Item
                  </Button>
                </div>
                <div className="flex flex-col gap-3">
                  {formData.requirements.map((r, i) => (
                    <div key={i} className="group relative">
                      <Input value={r} onChange={(e) => handleArrayChange('requirements', i, e.target.value)} placeholder="Required skill or experience..." className="bg-background/50 pr-10" />
                      {formData.requirements.length > 1 && (
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 size-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeArrayItem('requirements', i)}>
                          <Trash className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="border-border/40 bg-card/50 sticky top-24">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Deployment Settings</CardTitle>
              <CardDescription>AI Model constraints and levels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black text-muted-foreground">Evaluation Prompt</Label>
                <Select value={formData.promptId} onValueChange={(v) => setFormData(p => ({ ...p, promptId: v }))} disabled={!formData.industry || availablePrompts.length === 0}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select AI Prompt" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePrompts.map(p => (
                      <SelectItem key={p._id} value={p._id}>{p.name} (v{p.version})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black text-muted-foreground">Seniority Level</Label>
                <Select value={formData.experienceLevel} onValueChange={(v) => setFormData(p => ({ ...p, experienceLevel: v }))}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map(l => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-0">
              <Button
                className="w-full h-11"
                disabled={
                  loading ||
                  !formData.formName ||
                  !formData.title ||
                  !formData.industry ||
                  !formData.promptId ||
                  !formData.experienceLevel ||
                  !formData.description ||
                  !formData.deadline
                }
                onClick={handleSave}
              >
                {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : editingId ? 'Update Criteria' : 'Save Job Opening'}
              </Button>
              {editingId && (
                <Button variant="ghost" className="w-full" onClick={handleCancelEdit}>Cancel Modification</Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <History className="size-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold tracking-tight">Active Jobs / Configurations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fetchingForms ? (
            <div className="col-span-full py-10 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-8 animate-spin" />
              <p className="text-xs uppercase tracking-widest font-bold">Synchronizing...</p>
            </div>
          ) : savedForms.map((form) => (
            <Card key={form._id} className={`group border-border/40 bg-card/40 transition-all hover:bg-card hover:border-primary/30 ${editingId === form._id ? 'ring-2 ring-primary border-primary/50' : ''}`}>
              <CardHeader className="p-5 pb-2">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="text-[10px] px-1.5 h-4 bg-primary/5 text-primary border-primary/10">{form.industry}</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-primary" onClick={() => handleEdit(form)} title="Edit">
                      <ChevronRight className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-blue-500" onClick={() => copyPublicLink(form._id)} title="Copy Public Link">
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-sm font-bold line-clamp-1">{form.formName}</CardTitle>
                <CardDescription className="text-xs line-clamp-1">{form.title}</CardDescription>
              </CardHeader>
              <CardFooter className="p-5 pt-4 flex items-center justify-between border-t border-border/20 mt-4 flex-wrap gap-2">
                <span className="text-[10px] text-muted-foreground font-medium">{form.experienceLevel.split('(')[0]}</span>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => window.location.href = `/job-applications/${form._id}`}>
                    Applications
                  </Button>
                  <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(form._id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
          {!fetchingForms && savedForms.length === 0 && (
            <div className="col-span-full py-12 border-2 border-dashed border-border/40 rounded-3xl flex flex-col items-center justify-center text-muted-foreground">
              <ListChecks className="size-10 mb-2 opacity-20" />
              <p className="text-sm">No criteria configurations found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

}

export default HiringForm

