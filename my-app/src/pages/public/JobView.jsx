import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../../services/api';
import {
    AlertCircle,
    Briefcase,
    MapPin,
    Clock,
    Calendar,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DynamicApplyForm from '@/components/features/DynamicApplyForm';

const JobView = () => {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const response = await apiService.getPublicJob(id);
                if (response.ok) {
                    const data = await response.json();
                    setJob(data.data);
                } else {
                    setError('Job not found or closed.');
                }
            } catch {
                setError('Failed to load job details.');
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [id]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="size-8 animate-spin mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md border-red-200">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Not Found</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Button onClick={() => window.history.back()}>
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Job Details Card */}
                <Card className="mb-8 border-border/40 bg-card/50">
                    <CardHeader className="pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{job.title}</CardTitle>
                                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" />
                                        {job.industry || 'Engineering'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {job.location || 'Remote'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {job.jobType || 'Full-time'}
                                    </div>
                                </div>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                {job.status === 'Open' ? 'Accepting Applications' : 'Closed'}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                            <p className="text-gray-700 leading-relaxed">{job.description || 'No description provided.'}</p>
                        </div>

                        {job.responsibilities && job.responsibilities.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Responsibilities</h3>
                                <ul className="space-y-2">
                                    {job.responsibilities.map((res, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <span className="text-gray-700">{res}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {job.requirements && job.requirements.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements & Qualifications</h3>
                                <ul className="space-y-2">
                                    {job.requirements.map((req, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <span className="text-gray-700">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {job.deadline && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-amber-800">
                                    <Calendar className="h-4 w-4" />
                                    <span className="font-medium">Application Deadline:</span>
                                    <span>{formatDate(job.deadline)}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Application Form */}
                {job.status === 'Open' ? (
                    <DynamicApplyForm job={job} />
                ) : (
                    <Card className="border-border/40 bg-card/50">
                        <CardContent className="p-8 text-center text-muted-foreground">
                            <p>This job is currently closed for new applications.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default JobView;