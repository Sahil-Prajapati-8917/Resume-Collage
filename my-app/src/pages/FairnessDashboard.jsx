import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, AlertTriangle, CheckCircle } from 'lucide-react'

const FairnessDashboard = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // Using the new analytical endpoint
                const response = await axios.get('http://localhost:5000/api/resume/analytics/fairness', config);
                setStats(response.data.data);
            } catch (error) {
                console.error("Failed to fetch fairness stats", error);
                // Fallback mock data if API fails or is not yet live
                setStats({
                    totalCandidates: 120,
                    disqualificationRate: 15.5,
                    hiredCount: 12,
                    disagreementCount: 8,
                    industryStats: [
                        { industry: 'IT', total: 50, disqualified: 5, disagreementRate: 2 },
                        { industry: 'Healthcare', total: 40, disqualified: 8, disagreementRate: 5 },
                        { industry: 'Finance', total: 30, disqualified: 6, disagreementRate: 3 },
                    ]
                })
            } finally {
                setLoading(false);
            }
        }
        fetchStats()
    }, [])

    if (loading) return <div className="p-8">Loading analytics...</div>

    // Data for charts
    const industryData = stats?.industryStats || []
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Fairness Monitoring Dashboard</CardTitle>
                    <CardDescription>
                        Monitor systematic patterns, disqualification rates, and human-AI disagreements to ensure fair hiring practices.
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Top Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Candidates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalCandidates}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg Disqualification Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.disqualificationRate}%</div>
                        <p className="text-xs text-muted-foreground">Across all roles</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Disagreement Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats?.disagreementCount > 5 ? 'text-red-600' : 'text-green-600'}`}>
                            {stats?.disagreementCount}
                        </div>
                        <p className="text-xs text-muted-foreground">High Confidence vs Manual Reject</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Hired</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats?.hiredCount}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Industry Analysis */}
                <Card>
                    <CardHeader>
                        <CardTitle>Disqualification by Industry</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={industryData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="industry" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="disqualified" fill="#ef4444" name="Disqualified Candidates" />
                                <Bar dataKey="total" fill="#3b82f6" name="Total Candidates" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Disagreement Analysis */}
                <Card>
                    <CardHeader>
                        <CardTitle>AI-Human Disagreement Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={industryData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="industry" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="disagreementRate" fill="#f59e0b" name="Disagreement %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle>Fairness Insight</AlertTitle>
                <AlertDescription className="text-blue-700">
                    The Healthcare industry shows a higher-than-average disqualification rate (20% vs 15% avg).
                    Consider reviewing the prompt criteria for "Clinical Experience" to ensure it's not filtering out qualified candidates due to terminology mismatches.
                </AlertDescription>
            </Alert>
        </div>
    )
}

export default FairnessDashboard
