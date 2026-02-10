import React, { useState, useEffect, useMemo } from 'react'
import apiService from '@/services/api'
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

const PromptManagement = () => {
  // Removed getAuthHeaders as apiService handles it

  const [selectedIndustry, setSelectedIndustry] = useState('Information Technology')
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [viewingPrompt, setViewingPrompt] = useState(null)
  const [newPromptName, setNewPromptName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [industries, setIndustries] = useState(() => {
    const cached = localStorage.getItem('cached_industries')
    return cached ? JSON.parse(cached) : []
  })
  const [loadingIndustries, setLoadingIndustries] = useState(false)
  const [isAddingIndustry, setIsAddingIndustry] = useState(false)
  const [newIndustryName, setNewIndustryName] = useState('')

  useEffect(() => {
    fetchIndustries()
  }, [])

  const fetchIndustries = async () => {
    setLoadingIndustries(true)
    try {
      const response = await apiService.get('/industries')
      if (response.ok) {
        const data = await response.json()
        setIndustries(data.data) // Store full objects
        localStorage.setItem('cached_industries', JSON.stringify(data.data))
      }
    } catch (error) {
      console.error('Failed to fetch industries:', error)
      if (industries.length === 0) setIndustries([])
    } finally {
      setLoadingIndustries(false)
    }
  }

  const handleAddIndustry = async () => {
    if (!newIndustryName.trim()) return

    try {
      const response = await apiService.post('/industries', { name: newIndustryName })
      if (response.ok) {
        const data = await response.json()
        const newName = newIndustryName
        setNewIndustryName('')
        setIsAddingIndustry(false)
        await fetchIndustries()
        setSelectedIndustry(newName)
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to add industry')
      }
    } catch (error) {
      alert('Error adding industry')
    }
  }

  const handleDeleteIndustry = async (id, e) => {
    e.stopPropagation() // Prevent selection when deleting
    if (!window.confirm('Are you sure you want to delete this industry?')) return

    try {
      const response = await apiService.delete(`/industries/${id}`)
      if (response.ok) {
        // If deleted industry was selected, select first available or default
        if (selectedIndustry === industries.find(i => i._id === id)?.name) {
          setSelectedIndustry(industries.length > 1 ? industries.find(i => i._id !== id).name : 'Information Technology')
        }
        fetchIndustries()
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to delete industry')
      }
    } catch (error) {
      alert('Error deleting industry')
    }
  }

  const [prompts, setPrompts] = useState([]) // Prompts for the selected industry
  const [loadingPrompts, setLoadingPrompts] = useState(false)
  const [promptsCache, setPromptsCache] = useState({}) // Cache for prompts by industryId

  const selectedIndustryId = useMemo(() => {
    const industry = industries.find(i => (i.name || i) === selectedIndustry)
    return industry?._id
  }, [selectedIndustry, industries])

  const stats = useMemo(() => ({
    totalPrompts: prompts.length,
    activeIndustries: industries.length,
    totalUsage: prompts.reduce((sum, p) => sum + (p.usageCount || 0), 0)
  }), [prompts, industries])

  const fetchPrompts = async (industryId) => {
    setLoadingPrompts(true)
    try {
      // Use all=true to keep current behavior but indexed and lean on backend
      const response = await apiService.get(`/prompts/industry/${industryId}?all=true`)
      if (response.ok) {
        const data = await response.json()
        const fetchedPrompts = data.data
        setPrompts(fetchedPrompts)
        setPromptsCache(prev => ({ ...prev, [industryId]: fetchedPrompts }))
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
    } finally {
      setLoadingPrompts(false)
    }
  }

  useEffect(() => {
    if (selectedIndustry && industries.length > 0) {
      if (selectedIndustryId) {
        if (promptsCache[selectedIndustryId]) {
          setPrompts(promptsCache[selectedIndustryId])
        } else {
          fetchPrompts(selectedIndustryId)
        }
      } else {
        setPrompts([])
      }
    }
  }, [selectedIndustry, industries, selectedIndustryId])

  // Sync cache when prompts change
  useEffect(() => {
    if (selectedIndustryId) {
      setPromptsCache(prev => ({ ...prev, [selectedIndustryId]: prompts }))
    }
  }, [prompts, selectedIndustryId])

  const [editingContent, setEditingContent] = useState('')


  const handleEdit = (prompt) => {
    setEditingPrompt(prompt)
    setEditingContent(prompt.prompt)
  }

  const handleSave = async () => {
    if (editingPrompt) {
      try {
        const response = await apiService.put(`/prompts/${editingPrompt._id}`, {
          prompt: editingContent,
          name: editingPrompt.name // Ensure name is passed if needed or just patch
        })
        if (response.ok) {
          const data = await response.json()
          setPrompts(prev => prev.map(p => p._id === editingPrompt._id ? data.data : p))
          setEditingPrompt(null)
          setEditingContent('')
        } else {
          alert('Failed to save prompt')
        }
      } catch (error) {
        alert('Failed to save prompt')
      }
    }
  }

  const handleDelete = async (promptId) => {
    if (!window.confirm('Delete this prompt?')) return;
    try {
      const response = await apiService.delete(`/prompts/${promptId}`)
      if (response.ok) {
        setPrompts(prev => prev.filter(p => p._id !== promptId))
      }
    } catch (error) {
      alert('Failed to delete prompt')
    }
  }

  const handleDuplicate = async (prompt) => {
    if (!selectedIndustryId) return

    try {
      const response = await apiService.post('/prompts', {
        name: `${prompt.name} (Copy)`,
        industryId: selectedIndustryId,
        prompt: prompt.prompt,
        version: prompt.version,
        isDefault: false
      })
      if (response.ok) {
        const data = await response.json()
        setPrompts(prev => [data.data, ...prev])
      }
    } catch (error) {
      alert('Failed to duplicate prompt')
    }
  }

  const handleSetDefault = async (promptId) => {
    try {
      const response = await apiService.put(`/prompts/${promptId}`, { isDefault: true })
      if (response.ok) {
        // Refresh all to update the previous default
        if (selectedIndustryId) fetchPrompts(selectedIndustryId)
      }
    } catch (error) {
      alert('Failed to set default')
    }
  }

  const handleCreateNew = async () => {
    if (newPromptName.trim() && selectedIndustryId) {
      try {
        const response = await apiService.post('/prompts', {
          name: newPromptName,
          industryId: selectedIndustryId,
          prompt: `Enter your evaluation prompt for ${selectedIndustry} here...`,
          version: '1.0',
          isDefault: false
        })
        if (response.ok) {
          const data = await response.json()
          setPrompts(prev => [data.data, ...prev])
          setNewPromptName('')
          setShowCreateForm(false)
          setEditingPrompt(data.data)
          setEditingContent(data.data.prompt)
        }
      } catch (error) {
        alert('Failed to create prompt')
      }
    }
  }

  const currentPrompts = prompts

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Prompt Management</h1>
        <p className="text-gray-600">
          Configure industry-specific evaluation prompts that guide AI assessment for different roles and sectors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Industry Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Industries</h2>
              <button
                onClick={() => setIsAddingIndustry(!isAddingIndustry)}
                className="text-primary hover:text-primary/80 focus:outline-none"
                title="Add New Industry"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>

            {isAddingIndustry && (
              <div className="mb-4 flex space-x-2">
                <input
                  type="text"
                  value={newIndustryName}
                  onChange={(e) => setNewIndustryName(e.target.value)}
                  placeholder="New Industry"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddIndustry}
                  className="p-1 bg-accent text-accent-foreground rounded-md hover:bg-accent/90"
                  disabled={!newIndustryName.trim()}
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="space-y-2">
              {loadingIndustries && industries.length === 0 ? (
                // Skeleton loading for industries
                [...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-50 animate-pulse rounded-md" />
                ))
              ) : industries.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No industries found</p>
              ) : (
                industries.map(industry => (
                  <div key={industry._id || (industry.name || industry)} className="flex items-center gap-2 group">
                    <button
                      onClick={() => setSelectedIndustry(industry.name || industry)}
                      className={`flex-1 text-left px-3 py-2 rounded-md transition-colors ${selectedIndustry === (industry.name || industry)
                        ? 'bg-primary/10 text-primary border-r-2 border-primary'
                        : 'text-muted-foreground hover:bg-muted/50'
                        }`}
                    >
                      {industry.name || industry}
                    </button>
                    {industry._id && (
                      <button
                        onClick={(e) => handleDeleteIndustry(industry._id, e)}
                        className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Industry"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Total Prompts</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.totalPrompts}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Industries</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.activeIndustries}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Usage</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.totalUsage}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prompts List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedIndustry} Prompts
                </h2>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Prompt
                </button>
              </div>
            </div>

            {/* Create New Form */}
            {showCreateForm && (
              <div className="p-6 border-b bg-muted/30">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newPromptName}
                    onChange={(e) => setNewPromptName(e.target.value)}
                    placeholder="Enter prompt name..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleCreateNew}
                    disabled={!newPromptName.trim()}
                    className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 disabled:bg-muted disabled:cursor-not-allowed transition-colors"
                  >
                    <CheckIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewPromptName('')
                    }}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {loadingPrompts ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Loading prompts...</p>
              </div>
            ) : currentPrompts.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No prompts found for {selectedIndustry}</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 text-primary hover:text-primary/80 font-medium"
                >
                  Create the first prompt
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {currentPrompts.map(prompt => (
                  <div key={prompt._id} className="p-6">
                    {editingPrompt?._id === prompt._id ? (
                      /* Edit Mode */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={editingPrompt.name}
                            onChange={(e) => setEditingPrompt(prev => ({ ...prev, name: e.target.value }))}
                            className="text-lg font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                          />
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={handleSave}
                              className="px-3 py-1 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingPrompt(null)
                                setEditingContent('')
                              }}
                              className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          rows={12}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        />
                      </div>
                    ) : (
                      /* View Mode */
                      <div>
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {prompt.name}
                              </h3>
                              {prompt.isDefault && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground">
                                  Default
                                </span>
                              )}
                              <span className="text-sm text-gray-500">v{prompt.version}</span>
                            </div>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span>Created: {prompt.createdAt}</span>
                              <span>Modified: {prompt.lastModified}</span>
                              <span>Used: {prompt.usageCount} times</span>
                            </div>
                            <div className="mt-3">
                              <p className="text-gray-700 line-clamp-3">
                                {prompt.prompt.substring(0, 200)}...
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                            <button
                              onClick={() => setViewingPrompt(prompt)}
                              className="p-2 text-muted-foreground hover:text-primary"
                              title="View"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(prompt)}
                              className="p-2 text-muted-foreground hover:text-primary"
                              title="Edit"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(prompt)}
                              className="p-2 text-muted-foreground hover:text-accent"
                              title="Duplicate"
                            >
                              <DocumentDuplicateIcon className="h-5 w-5" />
                            </button>
                            {!prompt.isDefault && (
                              <button
                                onClick={() => handleSetDefault(prompt._id)}
                                className="p-2 text-muted-foreground hover:text-muted"
                                title="Set as Default"
                              >
                                <CheckIcon className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(prompt._id)}
                              className="p-2 text-muted-foreground hover:text-destructive"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prompt View Modal */}
      {viewingPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">{viewingPrompt.name}</h3>
                <button
                  onClick={() => setViewingPrompt(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>Version: {viewingPrompt.version}</span>
                <span>Industry: {selectedIndustry}</span>
                <span>Usage: {viewingPrompt.usageCount} times</span>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-mono bg-muted/30 p-4 rounded-lg">
                {viewingPrompt.prompt}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PromptManagement
