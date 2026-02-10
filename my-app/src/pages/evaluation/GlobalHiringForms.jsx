import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Copy,
  ClipboardList,
  Settings,
  Users,
  TrendingUp,
  Calendar,
  Globe,
  Tag
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import apiService from '@/services/api'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Loader2 } from 'lucide-react'

const GlobalHiringForms = () => {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [roleTypeFilter, setRoleTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showCloneDialog, setShowCloneDialog] = useState(false)
  const [selectedForm, setSelectedForm] = useState(null)

  // Form states
  const [newForm, setNewForm] = useState({
    name: '',
    industry: '',
    roleType: '',
    experienceLevel: '',
    evaluationWeights: {
      technicalSkills: 30,
      experience: 25,
      education: 15,
      softSkills: 20,
      culturalFit: 10
    },
    cutOffThresholds: {
      minimumScore: 60,
      technicalSkills: 18,
      experience: 15,
      education: 9,
      softSkills: 12,
      culturalFit: 6
    },
    isActive: true
  })

  const [editForm, setEditForm] = useState({
    name: '',
    industry: '',
    roleType: '',
    experienceLevel: '',
    evaluationWeights: {},
    cutOffThresholds: {},
    isActive: true
  })

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.get('/global-hiring-forms')
      if (response.ok) {
        const result = await response.json()
        setForms(result.data || [])
      } else {
        const data = await response.json()
        setError(data.error?.message || 'Failed to fetch global hiring forms')
      }
    } catch (err) {
      setError('Failed to connect to the server')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredForms = forms
    .filter(form =>
      form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.roleType.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(form => industryFilter === 'all' || form.industry === industryFilter)
    .filter(form => roleTypeFilter === 'all' || form.roleType === roleTypeFilter)
    .filter(form => statusFilter === 'all' || (form.isActive && statusFilter === 'active') || (!form.isActive && statusFilter === 'inactive'))
    .sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'industry':
          aValue = a.industry
          bValue = b.industry
          break
        case 'roleType':
          aValue = a.roleType
          bValue = b.roleType
          break
        case 'usageCount':
          aValue = a.usageCount
          bValue = b.usageCount
          break
        default:
          aValue = a[sortBy]
          bValue = b[sortBy]
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const getIndustryColor = (industry) => {
    switch (industry) {
      case 'IT': return 'bg-blue-500'
      case 'Healthcare': return 'bg-green-500'
      case 'Finance': return 'bg-yellow-500'
      case 'Manufacturing': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleTypeColor = (roleType) => {
    switch (roleType) {
      case 'Senior Developer': return 'bg-purple-500'
      case 'Clinical Staff': return 'bg-teal-500'
      case 'Analyst': return 'bg-orange-500'
      case 'Manager': return 'bg-indigo-500'
      default: return 'bg-gray-500'
    }
  }

  const calculateTotalWeight = (weights) => {
    return Object.values(weights).reduce((sum, weight) => sum + weight, 0)
  }

  const handleCreateForm = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.post('/global-hiring-forms', newForm)
      if (response.ok) {
        setShowCreateDialog(false)
        setNewForm({
          name: '',
          industry: '',
          roleType: '',
          experienceLevel: '',
          evaluationWeights: {
            technicalSkills: 30,
            experience: 25,
            education: 15,
            softSkills: 20,
            culturalFit: 10
          },
          cutOffThresholds: {
            minimumScore: 60,
            technicalSkills: 18,
            experience: 15,
            education: 9,
            softSkills: 12,
            culturalFit: 6
          },
          isActive: true
        })
        fetchForms()
      } else {
        const data = await response.json()
        setError(data.error?.message || 'Failed to create template')
      }
    } catch (err) {
      setError('Failed to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  const handleEditForm = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.put(`/global-hiring-forms/${selectedForm._id}`, editForm)
      if (response.ok) {
        setShowEditDialog(false)
        fetchForms()
      } else {
        const data = await response.json()
        setError(data.error?.message || 'Failed to update template')
      }
    } catch (err) {
      setError('Failed to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFormStatus = async (form) => {
    setError(null)
    try {
      const response = await apiService.put(`/global-hiring-forms/${form._id}`, {
        isActive: !form.isActive
      })
      if (response.ok) {
        fetchForms()
      } else {
        const data = await response.json()
        setError(data.error?.message || 'Failed to update status')
      }
    } catch (err) {
      setError('Failed to connect to the server')
    }
  }

  const handleCloneForm = (form) => {
    setSelectedForm(form)
    setShowCloneDialog(true)
  }

  const handleCloneConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.post(`/global-hiring-forms/${selectedForm._id}/clone`)
      if (response.ok) {
        setShowCloneDialog(false)
        setSelectedForm(null)
        fetchForms()
      } else {
        const data = await response.json()
        setError(data.error?.message || 'Failed to clone template')
      }
    } catch (err) {
      setError('Failed to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Global Hiring Forms</h1>
          <p className="text-muted-foreground">Industry-specific hiring form templates for all companies</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="flex flex-col lg:flex-row gap-4 p-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search forms by name, industry, or role type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleTypeFilter} onValueChange={setRoleTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Role Types</SelectItem>
                <SelectItem value="Senior Developer">Senior Developer</SelectItem>
                <SelectItem value="Clinical Staff">Clinical Staff</SelectItem>
                <SelectItem value="Analyst">Analyst</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forms.length}</div>
            <p className="text-xs text-muted-foreground">Global templates available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
            <Settings className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forms.filter(f => f.isActive).length}</div>
            <p className="text-xs text-muted-foreground">{Math.round((forms.filter(f => f.isActive).length / forms.length) * 100)}% active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forms.reduce((sum, f) => sum + f.usageCount, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forms.length > 0 ? forms.reduce((prev, current) => prev.usageCount > current.usageCount ? prev : current).name : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Highest usage count</p>
          </CardContent>
        </Card>
      </div>

      {/* Forms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Global Hiring Forms</CardTitle>
          <CardDescription>Templates available to all companies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <Button variant="ghost" onClick={() => setSortBy('name')}>
                      Template Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => setSortBy('industry')}>
                      Industry {sortBy === 'industry' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => setSortBy('roleType')}>
                      Role Type {sortBy === 'roleType' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Button>
                  </TableHead>
                  <TableHead>Experience Level</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => setSortBy('usageCount')}>
                      Usage Count {sortBy === 'usageCount' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && forms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Loading templates...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredForms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No templates found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : filteredForms.map((form) => (
                  <TableRow key={form._id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{form.name}</div>
                        <div className="text-sm text-muted-foreground">Version: {form.version || 1} • Created: {form.createdAt}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getIndustryColor(form.industry)} text-white`}>
                        {form.industry}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getRoleTypeColor(form.roleType)} text-white`}>
                        {form.roleType}
                      </Badge>
                    </TableCell>
                    <TableCell>{form.experienceLevel}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{form.usageCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${form.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={form.isActive ? 'text-green-600' : 'text-red-600'}>
                          {form.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedForm(form)
                          setEditForm({
                            name: form.name,
                            industry: form.industry,
                            roleType: form.roleType,
                            experienceLevel: form.experienceLevel,
                            evaluationWeights: { ...form.evaluationWeights },
                            cutOffThresholds: { ...form.cutOffThresholds },
                            isActive: form.isActive
                          })
                          setShowEditDialog(true)
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleCloneForm(form)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFormStatus(form)}
                          className={form.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Form Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Global Hiring Form</DialogTitle>
            <DialogDescription>
              Create an industry-specific hiring form template for all companies
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                placeholder="e.g., Senior Software Engineer - IT"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={newForm.industry} onValueChange={(value) => setNewForm({ ...newForm, industry: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="roleType">Role Type</Label>
                <Select value={newForm.roleType} onValueChange={(value) => setNewForm({ ...newForm, roleType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Senior Developer">Senior Developer</SelectItem>
                    <SelectItem value="Clinical Staff">Clinical Staff</SelectItem>
                    <SelectItem value="Analyst">Analyst</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Input
                id="experienceLevel"
                value={newForm.experienceLevel}
                onChange={(e) => setNewForm({ ...newForm, experienceLevel: e.target.value })}
                placeholder="e.g., 8+ years"
              />
            </div>

            {/* Evaluation Weights */}
            <div className="grid gap-2">
              <Label>Evaluation Weights (Total: {calculateTotalWeight(newForm.evaluationWeights)}%)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="technicalSkills" className="text-sm">Technical Skills</Label>
                  <Input
                    id="technicalSkills"
                    type="number"
                    value={newForm.evaluationWeights.technicalSkills}
                    onChange={(e) => setNewForm({
                      ...newForm,
                      evaluationWeights: {
                        ...newForm.evaluationWeights,
                        technicalSkills: parseInt(e.target.value)
                      }
                    })}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="experience" className="text-sm">Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={newForm.evaluationWeights.experience}
                    onChange={(e) => setNewForm({
                      ...newForm,
                      evaluationWeights: {
                        ...newForm.evaluationWeights,
                        experience: parseInt(e.target.value)
                      }
                    })}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="education" className="text-sm">Education</Label>
                  <Input
                    id="education"
                    type="number"
                    value={newForm.evaluationWeights.education}
                    onChange={(e) => setNewForm({
                      ...newForm.evaluationWeights,
                      education: parseInt(e.target.value)
                    })}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="softSkills" className="text-sm">Soft Skills</Label>
                  <Input
                    id="softSkills"
                    type="number"
                    value={newForm.evaluationWeights.softSkills}
                    onChange={(e) => setNewForm({
                      ...newForm,
                      evaluationWeights: {
                        ...newForm.evaluationWeights,
                        softSkills: parseInt(e.target.value)
                      }
                    })}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="culturalFit" className="text-sm">Cultural Fit</Label>
                  <Input
                    id="culturalFit"
                    type="number"
                    value={newForm.evaluationWeights.culturalFit}
                    onChange={(e) => setNewForm({
                      ...newForm.evaluationWeights,
                      culturalFit: parseInt(e.target.value)
                    })}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            {/* Cut-off Thresholds */}
            <div className="grid gap-2">
              <Label>Cut-off Thresholds</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="minimumScore" className="text-sm">Minimum Score</Label>
                  <Input
                    id="minimumScore"
                    type="number"
                    value={newForm.cutOffThresholds.minimumScore}
                    onChange={(e) => setNewForm({
                      ...newForm.cutOffThresholds,
                      minimumScore: parseInt(e.target.value)
                    })}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="techThreshold" className="text-sm">Technical Skills</Label>
                  <Input
                    id="techThreshold"
                    type="number"
                    value={newForm.cutOffThresholds.technicalSkills}
                    onChange={(e) => setNewForm({
                      ...newForm.cutOffThresholds,
                      technicalSkills: parseInt(e.target.value)
                    })}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateForm} disabled={!newForm.name || !newForm.industry || !newForm.roleType || !newForm.experienceLevel}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Template: {selectedForm?.name}</DialogTitle>
            <DialogDescription>
              Update template configuration and evaluation criteria
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editName">Template Name</Label>
              <Input
                id="editName"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editIndustry">Industry (Locked)</Label>
                <Select
                  value={editForm.industry}
                  onValueChange={(value) => setEditForm({ ...editForm, industry: value })}
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editRoleType">Role Type</Label>
                <Select value={editForm.roleType} onValueChange={(value) => setEditForm({ ...editForm, roleType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Senior Developer">Senior Developer</SelectItem>
                    <SelectItem value="Clinical Staff">Clinical Staff</SelectItem>
                    <SelectItem value="Analyst">Analyst</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editExperienceLevel">Experience Level</Label>
              <Input
                id="editExperienceLevel"
                value={editForm.experienceLevel}
                onChange={(e) => setEditForm({ ...editForm, experienceLevel: e.target.value })}
              />
            </div>

            {/* Status Toggle */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="editStatus">Status</Label>
              <Select value={editForm.isActive ? 'active' : 'inactive'} onValueChange={(value) => setEditForm({ ...editForm, isActive: value === 'active' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditForm}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clone Form Dialog */}
      <Dialog open={showCloneDialog} onOpenChange={setShowCloneDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Clone Template</DialogTitle>
            <DialogDescription>
              Create a copy of "{selectedForm?.name}" with a new name
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cloneName">New Template Name</Label>
              <Input
                id="cloneName"
                value={selectedForm ? `${selectedForm.name} (Clone)` : ''}
                onChange={(e) => setSelectedForm({ ...selectedForm, name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloneDialog(false)}>Cancel</Button>
            <Button onClick={handleCloneConfirm}>Clone Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GlobalHiringForms