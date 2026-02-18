import React, { useState, useEffect } from 'react'
import apiService from '@/services/api'
import {
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  FileText,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  MoreVertical,
  ChevronRight,
  FilterX
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const History = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [evaluationHistory, setEvaluationHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiService.get('/resume')
        if (response.ok) {
          const result = await response.json()
          const mappedData = (result.data || []).map(item => ({
            id: item._id,
            candidateName: item.candidateName || item.fileName || 'Candidate',
            jobTitle: item.roleType || 'Unknown Position',
            industry: item.industry || 'N/A',
            submittedDate: item.uploadedAt ? new Date(item.uploadedAt).toISOString().split('T')[0] : 'N/A',
            evaluatedDate: item.aiEvaluation?.metadata?.timestamp ? new Date(item.aiEvaluation.metadata.timestamp).toISOString().split('T')[0] : null,
            status: item.status,
            score: item.aiEvaluation?.totalScore || null,
            recommendation: mapStatusToRecommendation(item.status),
            resumeFile: item.fileName
          }))
          setEvaluationHistory(mappedData)
        }
      } catch (error) {
        console.error('Failed to fetch evaluation history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const mapStatusToRecommendation = (status) => {
    switch (status) {
      case 'Shortlisted': return 'shortlist'
      case 'Manual Review Required': return 'review'
      case 'Disqualified':
      case 'Rejected': return 'reject'
      case 'Hired': return 'shortlist'
      default: return null
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Shortlisted':
      case 'Hired':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] h-5 uppercase font-black px-1.5">{status}</Badge>
      case 'Pending':
      case 'Under Process':
        return <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[10px] h-5 uppercase font-black px-1.5">{status}</Badge>
      case 'Manual Review Required':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px] h-5 uppercase font-black px-1.5">Review</Badge>
      case 'Disqualified':
      case 'Rejected':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] h-5 uppercase font-black px-1.5">{status}</Badge>
      default:
        return <Badge variant="secondary" className="text-[10px] h-5 uppercase font-black px-1.5">{status}</Badge>
    }
  }

  const getRecommendationBadge = (recommendation) => {
    switch (recommendation) {
      case 'shortlist':
        return <Badge className="bg-green-500 text-white border-none text-[10px] h-5 uppercase font-black px-1.5">Shortlisted</Badge>
      case 'review':
        return <Badge className="bg-orange-500 text-white border-none text-[10px] h-5 uppercase font-black px-1.5">For Review</Badge>
      case 'reject':
        return <Badge className="bg-red-500 text-white border-none text-[10px] h-5 uppercase font-black px-1.5">Rejected</Badge>
      default:
        return null
    }
  }

  const filteredHistory = evaluationHistory.filter(item => {
    const matchesSearch = item.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.industry.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesDate = dateFilter === 'all' ||
      (dateFilter === 'today' && item.submittedDate === '2024-12-20') ||
      (dateFilter === 'week' && item.submittedDate >= '2024-12-14') ||
      (dateFilter === 'month' && item.submittedDate >= '2024-11-20')
    return matchesSearch && matchesStatus && matchesDate
  })

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Intelligence History</h1>
        <p className="text-muted-foreground font-medium">Archive of all candidate evaluations and AI decisioning logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Analyses', value: evaluationHistory.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'High Potential', value: evaluationHistory.filter(i => i.recommendation === 'shortlist').length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Needs Review', value: evaluationHistory.filter(i => i.recommendation === 'review').length, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Limited Match', value: evaluationHistory.filter(i => i.recommendation === 'reject').length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="border-border/40 bg-card/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative group flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Query by candidate, role or sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-card/40 border-border/40 focus-visible:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-11 bg-card/40 border-border/40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Disqualified">Disqualified</SelectItem>
                <SelectItem value="Manual Review Required">Review Required</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40 h-11 bg-card/40 border-border/40">
                <SelectValue placeholder="Timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-11 px-5 border-border/40 bg-card/40 hover:bg-card">
              <Download className="size-4 mr-2" /> Export
            </Button>
          </div>
        </div>

        <div className="grid gap-3">
          {filteredHistory.map((item) => (
            <Card key={item.id} className="group border-border/40 bg-card/40 transition-all hover:bg-card hover:border-primary/30">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="flex-[2] p-5 flex items-center gap-4 border-b md:border-b-0 md:border-r border-border/20">
                    <div className="size-11 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                      <User size={20} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="font-bold text-base leading-none group-hover:text-primary transition-colors">{item.candidateName}</h3>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                        <FileText size={12} /> {item.resumeFile}
                      </p>
                    </div>
                  </div>

                  <div className="flex-[2] p-5 flex flex-col gap-0.5 border-b md:border-b-0 md:border-r border-border/20">
                    <p className="text-sm font-bold">{item.jobTitle}</p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">{item.industry}</p>
                  </div>

                  <div className="flex-[1.5] p-5 flex flex-col gap-1.5 border-b md:border-b-0 md:border-r border-border/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Status</span>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Date</span>
                      <span className="flex items-center gap-1 text-xs font-bold"><Clock size={12} className="text-muted-foreground" /> {item.submittedDate}</span>
                    </div>
                  </div>

                  <div className="flex-[1.5] p-5 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">AI Rating</span>
                      {item.score ? (
                        <span className={`text-sm font-black ${item.score >= 80 ? 'text-green-500' : item.score >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                          {item.score}<span className="text-[10px] opacity-60 ml-0.5">%</span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-bold italic">Processing...</span>
                      )}
                    </div>
                    {item.recommendation && (
                      <div className="flex items-center justify-end">
                        {getRecommendationBadge(item.recommendation)}
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex md:flex-col justify-end gap-2 pr-5">
                    <Button variant="ghost" size="icon" className="size-9 rounded-lg opacity-40 group-hover:opacity-100 transition-opacity">
                      <Eye size={18} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-9 rounded-lg opacity-40 group-hover:opacity-100 transition-opacity">
                          <MoreVertical size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="gap-2"><Download size={16} /> Download Source</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2"><ArrowUpRight size={16} /> Full Report</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border/40 rounded-3xl bg-muted/10">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-6">
                <FilterX className="size-8 text-muted-foreground/40" />
              </div>
              <p className="font-medium text-muted-foreground text-center px-4">No records converged in this search space.</p>
              <Button variant="link" className="text-primary mt-2" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setDateFilter('all'); }}>Clear all filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default History

