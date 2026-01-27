import React, { useState } from 'react'
import {
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  FileText,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const History = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  const evaluationHistory = [
    {
      id: 1,
      candidateName: 'John Doe',
      jobTitle: 'Senior Software Engineer',
      industry: 'Information Technology',
      submittedDate: '2024-12-20',
      evaluatedDate: '2024-12-20',
      status: 'completed',
      score: 85,
      recommendation: 'shortlist',
      resumeFile: 'john_doe_resume.pdf'
    },
    {
      id: 2,
      candidateName: 'Jane Smith',
      jobTitle: 'Product Manager',
      industry: 'Healthcare',
      submittedDate: '2024-12-19',
      evaluatedDate: '2024-12-19',
      status: 'completed',
      score: 92,
      recommendation: 'shortlist',
      resumeFile: 'jane_smith_resume.pdf'
    },
    {
      id: 3,
      candidateName: 'Mike Johnson',
      jobTitle: 'Financial Analyst',
      industry: 'Banking & Finance',
      submittedDate: '2024-12-18',
      evaluatedDate: '2024-12-18',
      status: 'completed',
      score: 45,
      recommendation: 'reject',
      resumeFile: 'mike_johnson_resume.pdf'
    },
    {
      id: 4,
      candidateName: 'Sarah Williams',
      jobTitle: 'UX Designer',
      industry: 'Retail',
      submittedDate: '2024-12-17',
      evaluatedDate: null,
      status: 'pending',
      score: null,
      recommendation: null,
      resumeFile: 'sarah_williams_resume.pdf'
    },
    {
      id: 5,
      candidateName: 'David Brown',
      jobTitle: 'Manufacturing Engineer',
      industry: 'Manufacturing',
      submittedDate: '2024-12-16',
      evaluatedDate: '2024-12-16',
      status: 'completed',
      score: 78,
      recommendation: 'review',
      resumeFile: 'david_brown_resume.pdf'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'shortlist':
        return 'bg-green-100 text-green-800'
      case 'review':
        return 'bg-yellow-100 text-yellow-800'
      case 'reject':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'shortlist':
        return <CheckCircle className="h-4 w-4" />
      case 'review':
        return <AlertTriangle className="h-4 w-4" />
      case 'reject':
        return <XCircle className="h-4 w-4" />
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

  const handleViewDetails = (id) => {
    // Navigate to detailed evaluation view
    console.log('View details for:', id)
  }

  const handleDownloadResume = (fileName) => {
    // Download resume file
    console.log('Download resume:', fileName)
  }

  const handleExportData = () => {
    // Export evaluation data
    console.log('Export evaluation data')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Evaluation History</CardTitle>
          <CardDescription>
            Track and manage all resume evaluations and their outcomes.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by candidate name, job title, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
                <p className="text-2xl font-bold text-gray-900">{evaluationHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {evaluationHistory.filter(item => item.recommendation === 'shortlist').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">For Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {evaluationHistory.filter(item => item.recommendation === 'review').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {evaluationHistory.filter(item => item.recommendation === 'reject').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evaluation History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Candidate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Job Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Industry</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Submitted</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Recommendation</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium">{item.candidateName}</p>
                          <p className="text-sm text-gray-500">{item.resumeFile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{item.jobTitle}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">{item.industry}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {item.submittedDate}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {item.score ? (
                        <div className="flex items-center">
                          <span className={`font-bold ${item.score >= 80 ? 'text-green-600' :
                              item.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {item.score}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.recommendation ? (
                        <Badge className={getRecommendationColor(item.recommendation)}>
                          <div className="flex items-center">
                            {getRecommendationIcon(item.recommendation)}
                            <span className="ml-1 capitalize">{item.recommendation}</span>
                          </div>
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(item.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadResume(item.resumeFile)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No evaluation records found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default History
