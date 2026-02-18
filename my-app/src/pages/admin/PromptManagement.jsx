import React, { useState, useEffect, useMemo, useCallback } from 'react'
import apiService from '@/services/api'
import {
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
  Copy,
  Eye,
  Settings2,
  Database,
  BarChart3,
  ChevronRight,
  PlusCircle,
  MoreVertical,
  Terminal,
  Clock,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

const PromptManagement = () => {
  const [selectedIndustry, setSelectedIndustry] = useState('Information Technology')
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [viewingPrompt, setViewingPrompt] = useState(null)
  const [newPromptName, setNewPromptName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingContent, setEditingContent] = useState('')
  const [isAddingIndustry, setIsAddingIndustry] = useState(false)
  const [newIndustryName, setNewIndustryName] = useState('')

  const [industries, setIndustries] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_industries')
      if (cached) {
        const parsed = JSON.parse(cached)
        // Validate cache structure
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]._id) {
          return parsed
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached industries', e)
    }
    localStorage.removeItem('cached_industries')
    return []
  })

  const [prompts, setPrompts] = useState([])
  const [loadingPrompts, setLoadingPrompts] = useState(false)
  const [promptsCache, setPromptsCache] = useState({})

  useEffect(() => {
    fetchIndustries()
  }, [])

  const fetchIndustries = async () => {

    try {
      const response = await apiService.get('/industries')
      if (response.ok) {
        const data = await response.json()
        setIndustries(data.data)
        localStorage.setItem('cached_industries', JSON.stringify(data.data))
      }
    } catch (error) {
      console.error('Failed to fetch industries:', error)
    } finally {
      // setLoadingIndustries(false)
    }
  }

  const handleAddIndustry = async () => {
    if (!newIndustryName.trim()) return
    try {
      const response = await apiService.post('/industries', { name: newIndustryName })
      if (response.ok) {
        const newName = newIndustryName
        setNewIndustryName('')
        setIsAddingIndustry(false)
        await fetchIndustries()
        setSelectedIndustry(newName)
      }
    } catch {
      console.error('Error adding industry')
    }
  }

  const handleDeleteIndustry = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this industry?')) return
    try {
      const response = await apiService.delete(`/industries/${id}`)
      if (response.ok) {
        if (selectedIndustry === industries.find(i => i._id === id)?.name) {
          setSelectedIndustry(industries.length > 1 ? industries.find(i => i._id !== id).name : 'Information Technology')
        }
        fetchIndustries()
      }
    } catch {
      console.error('Error deleting industry')
    }
  }

  const selectedIndustryId = useMemo(() => {
    const industry = industries.find(i => (i.name || i) === selectedIndustry)
    return industry?._id
  }, [selectedIndustry, industries])

  const stats = useMemo(() => ({
    totalPrompts: prompts.length,
    activeIndustries: industries.length,
    totalUsage: prompts.reduce((sum, p) => sum + (p.usageCount || 0), 0)
  }), [prompts, industries])

  const fetchPrompts = useCallback(async (industryId) => {
    setLoadingPrompts(true)
    try {
      const response = await apiService.get(`/prompts/industry/${industryId}?all=true`)
      if (response.ok) {
        const data = await response.json()
        setPrompts(data.data)
        setPromptsCache(prev => ({ ...prev, [industryId]: data.data }))
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
    } finally {
      setLoadingPrompts(false)
    }
  }, [])

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
  }, [selectedIndustry, industries, selectedIndustryId, promptsCache, fetchPrompts])

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt)
    setEditingContent(prompt.prompt)
  }

  const handleSave = async () => {
    if (!editingPrompt) return
    try {
      const response = await apiService.put(`/prompts/${editingPrompt._id}`, {
        prompt: editingContent,
        name: editingPrompt.name
      })
      if (response.ok) {
        const data = await response.json()
        setPrompts(prev => prev.map(p => p._id === editingPrompt._id ? data.data : p))
        setEditingPrompt(null)
        setEditingContent('')
      }
    } catch {
      console.error('Failed to save prompt')
    }
  }

  const handleDelete = async (promptId) => {
    if (!window.confirm('Delete this prompt?')) return;
    try {
      const response = await apiService.delete(`/prompts/${promptId}`)
      if (response.ok) {
        setPrompts(prev => prev.filter(p => p._id !== promptId))
      }
    } catch {
      console.error('Failed to delete prompt')
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
    } catch {
      console.error('Failed to duplicate prompt')
    }
  }

  const handleSetDefault = async (promptId) => {
    try {
      const response = await apiService.put(`/prompts/${promptId}`, { isDefault: true })
      if (response.ok) {
        if (selectedIndustryId) fetchPrompts(selectedIndustryId)
      }
    } catch {
      console.error('Failed to set default')
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
      } catch {
        console.error('Failed to create prompt')
      }
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">AI Prompts</h1>
        <p className="text-muted-foreground font-medium">Engineer and version control industry-specific evaluation protocols.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Industry Sidebar */}
        <aside className="lg:col-span-1 flex flex-col gap-6">
          <Card className="border-border/40 bg-card/50 overflow-hidden">
            <CardHeader className="pb-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Database className="size-3.5" /> Sectors
                </CardTitle>
                <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => setIsAddingIndustry(!isAddingIndustry)}>
                  <PlusCircle className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isAddingIndustry && (
                <div className="p-4 border-b border-border/20 bg-muted/20 flex gap-2">
                  <Input
                    value={newIndustryName}
                    onChange={(e) => setNewIndustryName(e.target.value)}
                    placeholder="New Sector..."
                    className="h-9 bg-background focus-visible:ring-primary/20"
                  />
                  <Button size="icon" variant="default" className="size-9 shrink-0" onClick={handleAddIndustry}>
                    <Check className="size-4" />
                  </Button>
                </div>
              )}
              <ScrollArea className="h-[400px]">
                <div className="p-2 space-y-1">
                  {industries.map(industry => (
                    <div key={industry._id || industry.name} className="group relative flex items-center">
                      <button
                        onClick={() => setSelectedIndustry(industry.name || industry)}
                        className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${selectedIndustry === (industry.name || industry)
                          ? 'bg-primary/10 text-primary shadow-sm'
                          : 'text-muted-foreground hover:bg-muted/50'
                          }`}
                      >
                        {industry.name || industry}
                        <ChevronRight className={`size-3.5 opacity-0 group-hover:opacity-40 transition-opacity ${selectedIndustry === (industry.name || industry) ? 'opacity-40' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteIndustry(industry._id, e)}
                        className="absolute right-2 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all size-6 flex items-center justify-center rounded-md"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50">
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <BarChart3 className="size-3.5" /> Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm text-muted-foreground font-medium">Local Pool</span>
                <span className="text-xl font-black tracking-tighter">{stats.totalPrompts}</span>
              </div>
              <Separator className="bg-border/20" />
              <div className="flex justify-between items-end">
                <span className="text-sm text-muted-foreground font-medium">Global Usage</span>
                <span className="text-xl font-black tracking-tighter">{stats.totalUsage}</span>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Prompts Main Content */}
        <main className="lg:col-span-3 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="h-6 font-bold uppercase tracking-widest text-[10px] bg-primary/5 border-primary/20 text-primary">
                {selectedIndustry}
              </Badge>
              <h2 className="text-xl font-bold tracking-tight">Deployment Pool</h2>
            </div>
            <Button onClick={() => setShowCreateForm(true)} className="gap-2 shadow-lg shadow-primary/10 transition-all hover:scale-[1.02]">
              <Plus className="size-4" /> New AI protocol
            </Button>
          </div>

          {showCreateForm && (
            <Card className="border-dashed border-primary/30 bg-primary/5">
              <CardContent className="p-4 flex gap-3">
                <Input
                  value={newPromptName}
                  onChange={(e) => setNewPromptName(e.target.value)}
                  placeholder="Enter protocol name (e.g., Senior Technical Filter v1)..."
                  className="h-10 bg-background"
                />
                <Button variant="default" className="h-10 px-6 font-bold" onClick={handleCreateNew}>Deploy</Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={() => setShowCreateForm(false)}>
                  <X className="size-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {loadingPrompts ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
              <Zap className="size-10 animate-pulse text-primary/40" />
              <p className="text-xs uppercase font-bold tracking-[0.2em] animate-pulse">Initializing Data Stream...</p>
            </div>
          ) : prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border/40 rounded-3xl bg-muted/10">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-6">
                <Terminal className="size-8 text-muted-foreground/40" />
              </div>
              <p className="font-medium text-muted-foreground">No evaluation protocols configured for this sector.</p>
              <Button variant="link" className="text-primary mt-2" onClick={() => setShowCreateForm(true)}>Deploy your first protocol</Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {prompts.map(prompt => (
                <Card key={prompt._id} className={`group border-border/40 transition-all hover:border-primary/30 hover:bg-card/80 ${prompt.isDefault ? 'ring-1 ring-primary/20 bg-primary/[0.02]' : 'bg-card/40'}`}>
                  <CardHeader className="p-5 pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base tracking-tight">{prompt.name}</h3>
                          {prompt.isDefault && <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] uppercase font-black tracking-widest h-4">Default</Badge>}
                          <Badge variant="outline" className="text-[9px] font-bold h-4">v{prompt.version}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium">
                          <span className="flex items-center gap-1"><Clock className="size-3" /> {new Date(prompt.lastModified || prompt.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1 font-bold text-primary/60"><Zap className="size-3" /> {prompt.usageCount || 0} Deployments</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => setViewingPrompt(prompt)}><Eye className="size-4" /></Button>
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEdit(prompt)}><Pencil className="size-4" /></Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8"><MoreVertical className="size-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="gap-2" onClick={() => handleDuplicate(prompt)}><Copy className="size-4" /> Duplicate</DropdownMenuItem>
                            {!prompt.isDefault && <DropdownMenuItem className="gap-2" onClick={() => handleSetDefault(prompt._id)}><Check className="size-4" /> Set Default</DropdownMenuItem>}
                            <Separator className="my-1" />
                            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => handleDelete(prompt._id)}><Trash2 className="size-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-3">
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed italic border-l-2 border-border/30 pl-3">
                      "{prompt.prompt}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Editor Dialog */}
      <Dialog open={!!editingPrompt} onOpenChange={(open) => !open && setEditingPrompt(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-border/40 bg-card">
          <DialogHeader className="p-6 pb-4 border-b border-border/20 bg-muted/10">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Settings2 className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">Engineering Protocol</DialogTitle>
                <DialogDescription>Refine evaluation logic and system constraints.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest pl-1">Protocol Identity</Label>
              <Input
                value={editingPrompt?.name || ''}
                onChange={(e) => setEditingPrompt(p => ({ ...p, name: e.target.value }))}
                className="font-bold h-12 bg-background/50 border-border/40 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest pl-1">System Prompt Payload</Label>
              <div className="relative group">
                <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none opacity-40">
                  <Terminal className="size-4" />
                  <span className="text-[10px] uppercase font-bold tracking-tighter">System Console</span>
                </div>
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full min-h-[400px] bg-background border border-border/40 rounded-xl p-5 pt-10 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all shadow-inner"
                  placeholder="System instructions go here..."
                />
              </div>
            </div>
          </div>
          <DialogFooter className="p-4 border-t border-border/20 bg-muted/5">
            <Button variant="ghost" onClick={() => setEditingPrompt(null)}>Abandon Configuration</Button>
            <Button className="px-8 h-10 font-bold" onClick={handleSave}>Sync Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewingPrompt} onOpenChange={(open) => !open && setViewingPrompt(null)}>
        <DialogContent className="max-w-3xl border-border/40 bg-card">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-[10px] uppercase font-black">v{viewingPrompt?.version}</Badge>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-black">{selectedIndustry}</Badge>
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">{viewingPrompt?.name}</DialogTitle>
            <DialogDescription>Read-only deployment protocol snapshot.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-6 rounded-2xl bg-muted/30 border border-border/20 relative">
            <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap text-muted-foreground max-h-[500px] overflow-auto scrollbar-hide">
              {viewingPrompt?.prompt}
            </pre>
          </div>
          <DialogFooter>
            <Button className="w-full" variant="outline" onClick={() => setViewingPrompt(null)}>Close Inspection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PromptManagement

