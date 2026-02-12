import React, { useState, useEffect } from 'react'
import apiService from '@/services/api'
import {
  Users,
  Download,
  FileText,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  Filter,
  Search,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle,
  Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const Queue = () => {
  const [applications, setApplications] = useState([])
  const [hiringForms, setHiringForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedForm, setSelectedForm] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('uploadedAt')
  const [sortOrder, setSortOrder] = useState('desc')

  const [error, setError] = useState(null)

  useEffect(() => {
    fetchQueueData()
  }, [])

  const fetchQueueData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch all hiring forms for filtering
      const formsResponse = await apiService.get('/hiring-forms')
      if (formsResponse.ok) {
        const formsData = await formsResponse.json()
        setHiringForms(formsData.data)
      } else {
        throw new Error('Failed to fetch hiring forms')
      }

      // Fetch all applications by getting applications for each form
      const applicationsResponse = await apiService.get('/queue/applications')
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json()
        setApplications(applicationsData.data)
      } else {
        throw new Error('Failed to fetch applications')
      }
    } catch (error) {
      console.error('Failed to fetch queue data:', error)
      setError('Failed to load application data. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }

  const downloadResume = async (applicationId, fileName) => {
    try {
      const response = await apiService.get(`/resume/download/${applicationId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to download resume:', error)
    }
  }

  const copyJobLink = async (jobId) => {
    try {
      const id = jobId?._id || jobId
      const jobUrl = `${window.location.origin}/apply/${id}`
      await navigator.clipboard.writeText(jobUrl)
      // You could add a toast notification here if you have one
      console.log('Job link copied to clipboard:', jobUrl)
    } catch (error) {
      console.error('Failed to copy job link:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      const id = jobId?._id || jobId
      textArea.value = `${window.location.origin}/apply/${id}`
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Shortlisted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.candidateEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.fileName?.toLowerCase().includes(searchTerm.toLowerCase())

    const appId = app.jobId?._id || app.jobId
    const matchesForm = selectedForm === 'all' || appId === selectedForm
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter

    return matchesSearch && matchesForm && matchesStatus
  })

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]

    if (sortBy === 'uploadedAt') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const getJobTitle = (jobId) => {
    if (jobId && jobId.title) return jobId.title
    const id = jobId?._id || jobId
    const form = hiringForms.find(f => f._id === id)
    return form?.title || 'Unknown Position'
  }

  const getFormName = (jobId) => {
    if (jobId && jobId.formName) return jobId.formName
    const id = jobId?._id || jobId
    const form = hiringForms.find(f => f._id === id)
    return form?.formName || 'Unknown Form'
  }

  // Bulk Evaluation Logic
  const [prompts, setPrompts] = useState([])
  const [selectedPrompt, setSelectedPrompt] = useState('')
  const [industries, setIndustries] = useState([])
  const [isBulkEvaluating, setIsBulkEvaluating] = useState(false)
  const [evaluationStats, setEvaluationStats] = useState(null)

  useEffect(() => {
    fetchIndustries()
  }, [])

  const fetchIndustries = async () => {
    try {
      const response = await apiService.getIndustries()
      if (response.ok) {
        const data = await response.json()
        setIndustries(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch industries:', error)
    }
  }

  useEffect(() => {
    if (selectedForm !== 'all') {
      fetchPromptsForJob(selectedForm)
    } else {
      setPrompts([])
      setSelectedPrompt('')
    }
  }, [selectedForm, industries])

  const fetchPromptsForJob = async (jobId) => {
    try {
      const job = hiringForms.find(f => f._id === jobId)
      if (!job) return

      // Find industry ID by name
      const industry = industries.find(ind => ind.name === job.industry)
      if (industry) {
        const response = await apiService.getPromptsByIndustry(industry._id)
        if (response.ok) {
          const data = await response.json()
          setPrompts(data.data)
          // Set default prompt if available
          if (data.data.length > 0) {
            const defaultPrompt = data.data.find(p => p.isDefault) || data.data[0]
            setSelectedPrompt(defaultPrompt._id)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
    }
  }

  const handleBulkEvaluation = async () => {
    if (selectedForm === 'all' || !selectedPrompt) return

    setIsBulkEvaluating(true)
    setEvaluationStats(null)

    try {
      // Get all pending resumes for this job or just rely on backend to find all?
      // Backend bulkEvaluateResumes takes candidateIds (optional) or processes all.
      // Let's filter visible candidates on current screen or just send the job ID to process all eligible.
      // Based on my backend implementation, if I don't send candidateIds, it finds all Pending/Under Process.
      // Or I can send the IDs of the filtered list to be precise.

      const candidateIds = sortedApplications.map(app => app._id)

      const response = await apiService.bulkEvaluateResumes(selectedForm, selectedPrompt, candidateIds)

      if (response.ok) {
        const result = await response.json()
        setEvaluationStats(result.data)
        // Refresh queue
        fetchQueueData()
      }
    } catch (error) {
      console.error('Bulk evaluation failed:', error)
    } finally {
      setIsBulkEvaluating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-10 pb-20">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">Application Queue</h1>
          <p className="text-muted-foreground">Manage and review candidate applications.</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Application Queue</h1>
        <p className="text-muted-foreground">Manage and review candidate applications across all job postings.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/40 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">Across all positions</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(app => app.status === 'Pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(app => app.status === 'Shortlisted').length}
            </div>
            <p className="text-xs text-muted-foreground">Qualified candidates</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hiringForms.length}</div>
            <p className="text-xs text-muted-foreground">Open positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-border/40 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or file..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={selectedForm} onValueChange={setSelectedForm}>
                <SelectTrigger className="w-48 bg-background/50">
                  <SelectValue placeholder="Filter by job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {hiringForms.map(form => (
                    <SelectItem key={form._id} value={form._id}>
                      {form.formName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-background/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Reviewed">Reviewed</SelectItem>
                  <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-')
                setSortBy(field)
                setSortOrder(order)
              }}>
                <SelectTrigger className="w-40 bg-background/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uploadedAt-desc">Newest First</SelectItem>
                  <SelectItem value="uploadedAt-asc">Oldest First</SelectItem>
                  <SelectItem value="candidateName-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="candidateName-desc">Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        {selectedForm !== 'all' && (
          <CardContent className="border-t border-border/20 pt-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Select Evaluation Prompt</label>
                <Select value={selectedPrompt} onValueChange={setSelectedPrompt}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Choose a prompt" />
                  </SelectTrigger>
                  <SelectContent>
                    {prompts.map(prompt => (
                      <SelectItem key={prompt._id} value={prompt._id}>
                        {prompt.name} {prompt.isDefault && '(Default)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleBulkEvaluation}
                disabled={isBulkEvaluating || !selectedPrompt || sortedApplications.length === 0}
                className="min-w-[150px]"
              >
                {isBulkEvaluating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Run Bulk Evaluation
                  </>
                )}
              </Button>
            </div>
            {evaluationStats && (
              <Alert className="mt-4 bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Evaluation Completed</AlertTitle>
                <AlertDescription>
                  Processed: {evaluationStats.successful + evaluationStats.failed} |
                  Success: {evaluationStats.successful} |
                  Failed: {evaluationStats.failed}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
      </Card>

      {/* Applications List */}
      <Card className="border-border/40 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Applications ({sortedApplications.length})
          </CardTitle>
          <CardDescription>
            Review and manage candidate submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No applications found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || selectedForm !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'No applications have been submitted yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedApplications.map((application) => (
                <div key={application._id} className="border border-border/20 rounded-lg p-4 hover:bg-background/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{application.candidateName || 'Unknown'}</h3>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status || 'Pending'}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {application.candidateEmail || 'No email'}
                        </div>
                        {application.candidatePhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {application.candidatePhone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {getJobTitle(application.jobId)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(application.uploadedAt)}
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground">Form:</span> {getFormName(application.jobId)}
                        {application.fileName && (
                          <><span className="ml-4 text-muted-foreground">Resume:</span> {application.fileName}</>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {application.fileName && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadResume(application._id, application.fileName)}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Resume
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyJobLink(application.jobId)}
                        className="flex items-center gap-2"
                        title="Copy job link"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = `/job-applications/${application.jobId?._id || application.jobId}`}
                      >
                        View Job
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Queue
