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

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const jobResponse = await apiService.get(`/hiring-forms/${id}`);
            if (jobResponse.ok) {
                const jobData = await jobResponse.json();
                setJob(jobData.data);
            }

            const appsResponse = await apiService.getJobApplications(id);
            if (appsResponse.ok) {
                const appsData = await appsResponse.json();
                setApplications(appsData.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
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
