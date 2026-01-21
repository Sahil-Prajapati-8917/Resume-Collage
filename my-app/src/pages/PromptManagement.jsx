import React, { useState, useEffect } from 'react'
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
  const [selectedIndustry, setSelectedIndustry] = useState('Information Technology')
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [viewingPrompt, setViewingPrompt] = useState(null)
  const [newPromptName, setNewPromptName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [industries, setIndustries] = useState([])
  const [isAddingIndustry, setIsAddingIndustry] = useState(false)
  const [newIndustryName, setNewIndustryName] = useState('')

  useEffect(() => {
    fetchIndustries()
  }, [])

  const fetchIndustries = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/industries')
      const data = await response.json()
      if (data.success) {
        setIndustries(data.data) // Store full objects
      }
    } catch (error) {
      console.error('Failed to fetch industries:', error)
      // Fallback (mock ids for fallback strings if needed, or just strings? 
      // Better to just rely on backend, but if error, maybe valid strings are okay but won't be deletable)
      setIndustries([])
    }
  }

  const handleAddIndustry = async () => {
    if (!newIndustryName.trim()) return

    try {
      const response = await fetch('http://localhost:3001/api/industries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newIndustryName })
      })
      const data = await response.json()

      if (data.success) {
        const newName = newIndustryName
        setNewIndustryName('')
        setIsAddingIndustry(false)
        await fetchIndustries()
        setSelectedIndustry(newName)
      } else {
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
      const response = await fetch(`http://localhost:3001/api/industries/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        // If deleted industry was selected, select first available or default
        if (selectedIndustry === industries.find(i => i._id === id)?.name) {
          setSelectedIndustry(industries.length > 1 ? industries.find(i => i._id !== id).name : 'Information Technology')
        }
        fetchIndustries()
      } else {
        alert(data.message || 'Failed to delete industry')
      }
    } catch (error) {
      alert('Error deleting industry')
    }
  }

  const [prompts, setPrompts] = useState([]) // Prompts for the selected industry
  const [loadingPrompts, setLoadingPrompts] = useState(false)

  // ... (keep existing simple states like editingPrompt etc if they don't depend on the Map structure)

  useEffect(() => {
    if (selectedIndustry && industries.length > 0) {
      const industry = industries.find(i => (i.name || i) === selectedIndustry)
      if (industry && industry._id) {
        fetchPrompts(industry._id)
      } else {
        setPrompts([])
      }
    }
  }, [selectedIndustry, industries])

  const fetchPrompts = async (industryId) => {
    setLoadingPrompts(true)
    try {
      const response = await fetch(`http://localhost:3001/api/prompts/industry/${industryId}`)
      const data = await response.json()
      if (data.success) {
        setPrompts(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
    } finally {
      setLoadingPrompts(false)
    }
  }

  const [editingContent, setEditingContent] = useState('')

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt)
    setEditingContent(prompt.prompt)
  }

  const getSelectedIndustryId = () => {
    const industry = industries.find(i => (i.name || i) === selectedIndustry)
    return industry?._id
  }

  const handleSave = async () => {
    if (editingPrompt) {
      try {
        const response = await fetch(`http://localhost:3001/api/prompts/${editingPrompt._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: editingContent,
            name: editingPrompt.name // Ensure name is passed if needed or just patch
          })
        })
        const data = await response.json()
        if (data.success) {
          setPrompts(prev => prev.map(p => p._id === editingPrompt._id ? data.data : p))
          setEditingPrompt(null)
          setEditingContent('')
        }
      } catch (error) {
        alert('Failed to save prompt')
      }
    }
  }

  const handleDelete = async (promptId) => {
    if (!window.confirm('Delete this prompt?')) return;
    try {
      const response = await fetch(`http://localhost:3001/api/prompts/${promptId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setPrompts(prev => prev.filter(p => p._id !== promptId))
      }
    } catch (error) {
      alert('Failed to delete prompt')
    }
  }

  const handleDuplicate = async (prompt) => {
    const industryId = getSelectedIndustryId()
    if (!industryId) return

    try {
      const response = await fetch('http://localhost:3001/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${prompt.name} (Copy)`,
          industryId,
          prompt: prompt.prompt,
          version: prompt.version,
          isDefault: false
        })
      })
      const data = await response.json()
      if (data.success) {
        setPrompts(prev => [data.data, ...prev])
      }
    } catch (error) {
      alert('Failed to duplicate prompt')
    }
  }

  const handleSetDefault = async (promptId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/prompts/${promptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true })
      })
      const data = await response.json()
      if (data.success) {
        // Refresh all to update the previous default
        const industryId = getSelectedIndustryId()
        if (industryId) fetchPrompts(industryId)
      }
    } catch (error) {
      alert('Failed to set default')
    }
  }

  const handleCreateNew = async () => {
    const industryId = getSelectedIndustryId()
    if (newPromptName.trim() && industryId) {
      try {
        const response = await fetch('http://localhost:3001/api/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newPromptName,
            industryId,
            prompt: `Enter your evaluation prompt for ${selectedIndustry} here...`,
            version: '1.0',
            isDefault: false
          })
        })
        const data = await response.json()
        if (data.success) {
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
                className="text-blue-600 hover:text-blue-800 focus:outline-none"
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
                  className="p-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={!newIndustryName.trim()}
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="space-y-2">
              {industries.map(industry => (
                <div key={industry._id || industry} className="flex items-center gap-2 group">
                  <button
                    onClick={() => setSelectedIndustry(industry.name || industry)}
                    className={`flex-1 text-left px-3 py-2 rounded-md transition-colors ${selectedIndustry === (industry.name || industry)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {industry.name || industry}
                  </button>
                  {industry._id && (
                    <button
                      onClick={(e) => handleDeleteIndustry(industry._id, e)}
                      className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Industry"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Total Prompts</p>
                <p className="text-xl font-bold text-gray-900">
                  {prompts.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Industries</p>
                <p className="text-xl font-bold text-gray-900">
                  {industries.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Usage</p>
                <p className="text-xl font-bold text-gray-900">
                  {prompts.reduce((sum, p) => sum + (p.usageCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prompts List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedIndustry} Prompts
                </h2>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Prompt
                </button>
              </div>
            </div>

            {/* Create New Form */}
            {showCreateForm && (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
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
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <CheckIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewPromptName('')
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {currentPrompts.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No prompts found for {selectedIndustry}</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
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
                              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingPrompt(null)
                                setEditingContent('')
                              }}
                              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
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
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {prompt.name}
                              </h3>
                              {prompt.isDefault && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => setViewingPrompt(prompt)}
                              className="p-2 text-gray-600 hover:text-blue-600"
                              title="View"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(prompt)}
                              className="p-2 text-gray-600 hover:text-blue-600"
                              title="Edit"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(prompt)}
                              className="p-2 text-gray-600 hover:text-green-600"
                              title="Duplicate"
                            >
                              <DocumentDuplicateIcon className="h-5 w-5" />
                            </button>
                            {!prompt.isDefault && (
                              <button
                                onClick={() => handleSetDefault(prompt._id)}
                                className="p-2 text-gray-600 hover:text-yellow-600"
                                title="Set as Default"
                              >
                                <CheckIcon className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(prompt._id)}
                              className="p-2 text-gray-600 hover:text-red-600"
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
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-gray-50 p-4 rounded-lg">
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
