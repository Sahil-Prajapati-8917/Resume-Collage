import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../../services/api';
import {
    AlertCircle,
    CheckCircle,
    Upload,
    Briefcase,
    MapPin,
    Clock,
    Calendar,
    User,
    Mail,
    Phone,
    FileText,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// New Imports for Shadcn Form
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z.string().optional(),
    resume: z.custom((file) => file instanceof File, "Resume file is required.")
        .refine((file) => file.size <= 5 * 1024 * 1024, { message: "File size must be less than 5MB." })
})

const JobView = () => {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [dragActive, setDragActive] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

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

    // 1. Define your form.
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
        },
    })

    const { isSubmitting } = form.formState

    const onSubmit = async (values) => {
        const data = new FormData();
        data.append('name', values.name);
        data.append('email', values.email);
        data.append('phone', values.phone || '');
        data.append('resume', values.resume);

        try {
            const response = await apiService.applyForJob(id, data);
            const result = await response.json();

            if (response.ok && result.success) {
                setSubmitSuccess(true);
                form.reset();
            } else {
                form.setError("root", {
                    type: "manual",
                    message: result.message || 'Application failed.'
                });
            }
        } catch {
            form.setError("root", {
                type: "manual",
                message: 'An error occurred. Please try again.'
            });
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            form.setValue("resume", file, { shouldValidate: true });
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            form.setValue("resume", file, { shouldValidate: true });
        }
    };

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

                {/* Application Form Card */}
                <Card className="border-border/40 bg-card/50">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <CardTitle className="text-xl">Apply for this Position</CardTitle>
                        <CardDescription>
                            Fill in your details and upload your resume to apply
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                        {submitSuccess ? (
                            <div className="text-center py-8">
                                <div className="bg-green-50 border border-green-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted Successfully!</h3>
                                <p className="text-gray-600 mb-6">
                                    Thank you for your interest in this position. We have received your application and will review it carefully.
                                    Our team will get back to you within 3-5 business days.
                                </p>
                                <Button onClick={() => setSubmitSuccess(false)} variant="outline">
                                    Submit Another Application
                                </Button>
                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    {form.formState.errors.root && (
                                        <Alert variant="destructive" className="border-red-200 bg-red-50">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name *</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                            <Input placeholder="John Doe" className="pl-10 bg-background/50" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address *</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                            <Input placeholder="john@example.com" className="pl-10 bg-background/50" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                            <Input type="tel" placeholder="+1 (555) 123-4567" className="pl-10 bg-background/50" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="resume"
                                            render={({ field: { value, onChange: _onChange, ...field } }) => ( // eslint-disable-line no-unused-vars
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>Resume/CV *</FormLabel>
                                                    <FormControl>
                                                        <div
                                                            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-gray-300 hover:border-gray-400 bg-background/50'
                                                                }`}
                                                            onDragEnter={handleDrag}
                                                            onDragLeave={handleDrag}
                                                            onDragOver={handleDrag}
                                                            onDrop={handleDrop}
                                                        >
                                                            <input
                                                                type="file"
                                                                accept=".pdf,.docx,.doc"
                                                                onChange={handleFileChange}
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                {...field}
                                                                value="" // controlled input workaround for file
                                                            />

                                                            <div className="space-y-2">
                                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                                <div>
                                                                    <p className="text-sm text-gray-600">
                                                                        <span className="font-medium text-primary">Click to upload</span> or drag and drop
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 5MB)</p>
                                                                </div>
                                                                {value && (
                                                                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md relative z-10">
                                                                        <div className="flex items-center gap-2 text-green-800">
                                                                            <FileText className="h-4 w-4" />
                                                                            <span className="text-sm font-medium">{value.name}</span>
                                                                            <span className="text-xs text-green-600">({(value.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-11 text-base font-medium"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Submitting Application...
                                                </>
                                            ) : (
                                                <>
                                                    Submit Application
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default JobView;