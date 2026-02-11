import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '@/services/api';
import { Loader2, ArrowLeft, Mail, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Wand2 } from 'lucide-react';

const JobApplications = () => {
    const { id } = useParams();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [job, setJob] = useState(null);

    // Action State
    const [selectedApp, setSelectedApp] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    // AI Evaluation State
    const [prompts, setPrompts] = useState([]);
    const [selectedPromptId, setSelectedPromptId] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jobResponse = await apiService.get(`/hiring-forms/${id}`);
                let currentJob = null;
                if (jobResponse.ok) {
                    const jobData = await jobResponse.json();
                    currentJob = jobData.data;
                    setJob(currentJob);
                }

                const appsResponse = await apiService.getJobApplications(id);
                if (appsResponse.ok) {
                    const appsData = await appsResponse.json();
                    setApplications(appsData.data);
                }

                // Fetch Prompts if job has industry
                if (currentJob && currentJob.industry) {
                    const promptsResponse = await apiService.getPromptsByIndustry(currentJob.industry);
                    if (promptsResponse.ok) {
                        const promptsData = await promptsResponse.json();
                        setPrompts(promptsData.data);
                        // Default to job's prompt or first available
                        if (currentJob.promptId) {
                            setSelectedPromptId(currentJob.promptId);
                        } else if (promptsData.data.length > 0) {
                            setSelectedPromptId(promptsData.data[0]._id);
                        }
                    }
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleRunEvaluation = async () => {
        if (!selectedPromptId) return;
        setIsEvaluating(true);
        try {
            const response = await apiService.bulkEvaluateResumes(id, selectedPromptId);
            if (response.ok) {
                // Refresh applications
                const appsResponse = await apiService.getJobApplications(id);
                if (appsResponse.ok) {
                    const appsData = await appsResponse.json();
                    setApplications(appsData.data);
                }
                // Show success message (could be a toast)
                alert("AI Evaluation completed successfully!");
            } else {
                alert("Failed to run evaluation");
            }
        } catch (error) {
            console.error(error);
            alert("Error running evaluation");
        } finally {
            setIsEvaluating(false);
        }
    };

    const handleStatusUpdate = async (appId, status, reason = '') => {
        setActionLoading(true);
        try {
            const response = await apiService.updateResumeStatus(appId, status, reason);
            if (response.ok) {
                setApplications(prev => prev.map(app =>
                    app._id === appId ? { ...app, status: status } : app
                ));
                setIsRejectDialogOpen(false);
                setRejectReason('');
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating status');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-6">
                <Button variant="ghost" asChild className="pl-0 hover:bg-transparent">
                    <Link to="/hiring-form" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                        <ArrowLeft className="size-4" /> Back to Jobs
                    </Link>
                </Button>
                <div className="mt-4 flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">{job?.title || 'Job Applications'}</h1>
                    <p className="text-muted-foreground">Managing {applications.length} applications for {job?.formName}</p>
                </div>
            </div>

            {/* AI Toolbar */}
            <Card className="mb-6 bg-muted/30">
                <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Wand2 className="size-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">AI Resume Screening</h3>
                            <p className="text-sm text-muted-foreground">Evaluate all candidates against job requirements</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Select value={selectedPromptId} onValueChange={setSelectedPromptId}>
                            <SelectTrigger className="w-[200px] bg-background">
                                <SelectValue placeholder="Select Prompt" />
                            </SelectTrigger>
                            <SelectContent>
                                {prompts.map(prompt => (
                                    <SelectItem key={prompt._id} value={prompt._id}>
                                        {prompt.name} (v{prompt.version})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={handleRunEvaluation}
                            disabled={!selectedPromptId || isEvaluating || applications.length === 0}
                        >
                            {isEvaluating ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" /> Evaluating...
                                </>
                            ) : (
                                "Run Analysis"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6">
                {applications.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Mail className="size-12 mb-4 opacity-20" />
                            <p>No applications received yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    applications.map(app => (
                        <Card key={app._id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row justify-between p-6 gap-6">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold">{app.candidateName || 'Unknown Candidate'}</h3>
                                        <Badge variant={
                                            app.status === 'Shortlisted' ? 'default' :
                                                app.status === 'Disqualified' ? 'destructive' :
                                                    app.status === 'Pending' ? 'secondary' : 'outline'
                                        }>
                                            {app.status}
                                        </Badge>
                                        {app.aiEvaluation?.totalScore > 0 && (
                                            <Badge variant="outline" className={
                                                app.aiEvaluation.totalScore >= 80 ? "border-green-500 text-green-600" :
                                                    app.aiEvaluation.totalScore >= 50 ? "border-yellow-500 text-yellow-600" :
                                                        "border-red-500 text-red-600"
                                            }>
                                                AI Score: {app.aiEvaluation.totalScore}/100
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p>Email: {app.candidateEmail}</p>
                                        <p>Phone: {app.candidatePhone}</p>
                                        <p>Applied: {new Date(app.uploadedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3 min-w-[200px]">
                                    {/* Actions */}
                                    {app.status === 'Pending' || app.status === 'Under Process' ? (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => handleStatusUpdate(app._id, 'Shortlisted')}
                                                disabled={actionLoading}
                                            >
                                                <CheckCircle2 className="mr-2 size-4" /> Shortlist
                                            </Button>

                                            <Dialog open={isRejectDialogOpen && selectedApp === app._id} onOpenChange={(open) => {
                                                setIsRejectDialogOpen(open);
                                                if (open) setSelectedApp(app._id);
                                                else setSelectedApp(null);
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        <XCircle className="mr-2 size-4" /> Disqualify
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Disqualify Candidate</DialogTitle>
                                                        <DialogDescription>
                                                            Please provide a reason for disqualification. This will be sent to the candidate.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="py-4">
                                                        <Label htmlFor="reason">Reason</Label>
                                                        <Textarea
                                                            id="reason"
                                                            value={rejectReason}
                                                            onChange={(e) => setRejectReason(e.target.value)}
                                                            placeholder="e.g., Does not meet experience capability..."
                                                        />
                                                    </div>
                                                    <DialogFooter>
                                                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => handleStatusUpdate(app._id, 'Disqualified', rejectReason)}
                                                            disabled={!rejectReason || actionLoading}
                                                        >
                                                            Confirm Disqualification
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            {app.status === 'Shortlisted' ? 'Email sent to candidate.' : 'Rejection email sent.'}
                                        </div>
                                    )}

                                    {/* Resume Link */}
                                    {/* Assuming we just display the parsed text or download if URL available */}
                                    {/* For now, just a placeholder or if we stored content */}
                                    <div className="mt-2">
                                        <Button variant="outline" size="sm" onClick={() => {
                                            // Prepare a blob for download or open in new tab if URL
                                            if (app.resumeUrl) {
                                                window.open(app.resumeUrl, '_blank');
                                            } else {
                                                // View parsed text modal maybe?
                                                alert("Resume preview not available in MVP without Cloud Storage. Content key: " + app.fileName);
                                            }
                                        }}>
                                            View Resume
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default JobApplications;
