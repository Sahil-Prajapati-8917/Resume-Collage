import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiService from '@/services/api'
import {
    FileText,
    Search,
    Filter,
    Download,
    MoreVertical,
    Eye,
    Trash2,
    Calendar,
    Briefcase,
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    Copy
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const JobHistory = () => {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        setLoading(true)
        try {
            const response = await apiService.get('/hiring-forms')
            if (response.ok) {
                const data = await response.json()
                setJobs(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error)
        } finally {
            setLoading(false)
        }
    }

    const copyJobLink = async (jobId) => {
        try {
            const jobUrl = `${window.location.origin}/apply/${jobId}`
            await navigator.clipboard.writeText(jobUrl)
            // You could add a toast notification here if you have one
            console.log('Job link copied to clipboard:', jobUrl)
        } catch (error) {
            console.error('Failed to copy job link:', error)
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = `${window.location.origin}/apply/${jobId}`
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
        }
    }

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.formName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.industry?.toLowerCase().includes(searchTerm.toLowerCase())

        // Assuming status field exists or deriving it. 
        // If status field is not yet in API response fully, we might rely on deadline.
        // Use 'Open' as default if status not present.
        const jobStatus = job.status || (new Date(job.deadline) < new Date() ? 'Closed' : 'Open');

        const matchesStatus = statusFilter === 'all' || jobStatus.toLowerCase() === statusFilter.toLowerCase()

        return matchesSearch && matchesStatus
    })

    // Calculations for stats
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => !j.status || j.status === 'Open').length; // Fallback logic
    const closedJobs = totalJobs - activeJobs;

    return (
        <div className="flex flex-col gap-8 pb-20">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold tracking-tight">Job Archives</h1>
                <p className="text-muted-foreground">Comprehensive history of all job postings and their recruitment lifecycle.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card/50 border-border/40">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Postings</p>
                            <h3 className="text-3xl font-bold">{totalJobs}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/40">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active</p>
                            <h3 className="text-3xl font-bold">{activeJobs}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/40">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Closed</p>
                            <h3 className="text-3xl font-bold">{closedJobs}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col gap-4">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title, reference or industry..."
                            className="pl-9 bg-card/40"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-40 bg-card/40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="bg-card/40">
                            <Download className="mr-2 size-4" /> Export
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <Card className="border-border/40 bg-card/40 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[300px]">Job Title</TableHead>
                                    <TableHead>Industry</TableHead>
                                    <TableHead>Created Date</TableHead>
                                    <TableHead>Deadline</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredJobs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredJobs.map((job) => (
                                        <TableRow key={job._id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground">{job.title}</span>
                                                    <span className="text-xs text-muted-foreground">{job.formName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary font-normal">
                                                    {job.industry}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {/* Status Logic */}
                                                <Badge variant={
                                                    (job.status === 'Open' || (!job.status && new Date(job.deadline) >= new Date())) ? 'default' : 'secondary'
                                                } className={
                                                    (job.status === 'Open' || (!job.status && new Date(job.deadline) >= new Date())) ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                                }>
                                                    {job.status || (new Date(job.deadline) < new Date() ? 'Closed' : 'Open')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="size-8" asChild>
                                                        <Link to={`/job-applications/${job._id}`} title="View Applications">
                                                            <Users className="size-4 text-muted-foreground hover:text-primary" />
                                                        </Link>
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="size-8">
                                                                <MoreVertical className="size-4 text-muted-foreground" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => copyJobLink(job._id)}>
                                                                <Copy className="mr-2 size-4" /> Copy Link
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Eye className="mr-2 size-4" /> View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <FileText className="mr-2 size-4" /> Edit Criteria
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive">
                                                                <Trash2 className="mr-2 size-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default JobHistory
