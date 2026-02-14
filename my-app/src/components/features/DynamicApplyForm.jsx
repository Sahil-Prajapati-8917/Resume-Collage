import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, Upload, Loader2, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import apiService from '@/services/api';

const DynamicApplyForm = ({ job }) => {
    const [formData, setFormData] = useState({});
    const [resumeFile, setResumeFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [visibleFields, setVisibleFields] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Initialize Standard Fields
    useEffect(() => {
        // Evaluate conditional logic whenever formData changes
        evaluateVisibility();
    }, [formData, job]);

    const evaluateVisibility = () => {
        if (!job?.applyFormFields) return;

        const visible = job.applyFormFields.filter(field => {
            if (!field.showIf || !field.showIf.fieldId || field.showIf.fieldId === 'none') {
                return true;
            }
            const dependencyValue = formData[field.showIf.fieldId];
            if (!dependencyValue) return false;

            // Simple equality check for now
            if (field.showIf.operator === 'equals') {
                return dependencyValue === field.showIf.value;
            }
            // Add more operators if needed
            return false;
        }).map(f => f.id);

        setVisibleFields(visible);
    };

    const handleChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
        // Clear error for this field
        if (errors[id]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[id];
                return newErrors;
            });
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
            if (errors.resume) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.resume;
                    return newErrors;
                });
            }
        }
    };

    const validate = () => {
        const newErrors = {};

        // 1. Standard Fields (Always Required: Name, Email, Phone, Resume)
        if (!formData.name) newErrors.name = 'Full Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!resumeFile) newErrors.resume = 'Resume is required';

        // 2. Toggleable Standard Fields (If enabled and required logic - assuming they are required if enabled for simplicity, or we can make them optional. 
        // Requirement says "HR Can Toggle ON/OFF". Usually standard fields like LinkedIn might be optional. 
        // Let's assume standard fields are optional unless we add a specific "required" config for them. 
        // However, looking at the backend validation I wrote, I made them REQUIRED if enabled. 
        // "if (standardFields.linkedIn && !req.body.linkedIn) missingStandardFields.push('LinkedIn Profile');"
        // So I must enforce them here.
        if (job.standardFields) {
            if (job.standardFields.linkedIn && !formData.linkedIn) newErrors.linkedIn = 'LinkedIn Profile is required';
            if (job.standardFields.portfolio && !formData.portfolio) newErrors.portfolio = 'Portfolio URL is required';
            if (job.standardFields.github && !formData.github) newErrors.github = 'GitHub Profile is required';
            if (job.standardFields.expectedSalary && !formData.expectedSalary) newErrors.expectedSalary = 'Expected Salary is required';
            if (job.standardFields.currentSalary && !formData.currentSalary) newErrors.currentSalary = 'Current Salary is required';
            if (job.standardFields.noticePeriod && !formData.noticePeriod) newErrors.noticePeriod = 'Notice Period is required';
            if (job.standardFields.experienceYears && !formData.experienceYears) newErrors.experienceYears = 'Years of Experience is required';
            if (job.standardFields.currentCompany && !formData.currentCompany) newErrors.currentCompany = 'Current Company is required';
            if (job.standardFields.currentDesignation && !formData.currentDesignation) newErrors.currentDesignation = 'Current Designation is required';
            if (job.standardFields.workMode && !formData.workMode) newErrors.workMode = 'Preferred Work Mode is required';
            if (job.standardFields.relocate && formData.relocate === undefined) newErrors.relocate = 'Please select an option';
        }

        // 3. Custom Fields (If visible and required)
        if (job.applyFormFields) {
            job.applyFormFields.forEach(field => {
                if (visibleFields.includes(field.id)) {
                    if (field.required && !formData[field.id]) {
                        newErrors[field.id] = `${field.label} is required`;
                    }
                    if (field.validation?.regex && formData[field.id]) {
                        try {
                            const regex = new RegExp(field.validation.regex);
                            if (!regex.test(formData[field.id])) {
                                newErrors[field.id] = `Invalid format`;
                            }
                        } catch (e) {
                            // Ignore invalid regex from backend config
                        }
                    }
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);

        if (validate()) {
            setIsSubmitting(true);

            const submitData = new FormData();

            // Append basic fields
            submitData.append('name', formData.name);
            submitData.append('email', formData.email);
            submitData.append('phone', formData.phone);
            if (formData.linkedIn) submitData.append('linkedIn', formData.linkedIn);
            if (formData.portfolio) submitData.append('portfolio', formData.portfolio);
            if (formData.github) submitData.append('github', formData.github);
            if (formData.expectedSalary) submitData.append('expectedSalary', formData.expectedSalary);
            if (formData.currentSalary) submitData.append('currentSalary', formData.currentSalary);
            if (formData.noticePeriod) submitData.append('noticePeriod', formData.noticePeriod);
            if (formData.experienceYears) submitData.append('experienceYears', formData.experienceYears);
            if (formData.currentCompany) submitData.append('currentCompany', formData.currentCompany);
            if (formData.currentDesignation) submitData.append('currentDesignation', formData.currentDesignation);
            if (formData.workMode) submitData.append('workMode', formData.workMode);
            if (formData.relocate !== undefined) submitData.append('relocate', formData.relocate);

            // Append Resume
            submitData.append('resume', resumeFile);

            // Append Custom Fields Data
            const customData = {};
            if (job.applyFormFields) {
                job.applyFormFields.forEach(field => {
                    if (visibleFields.includes(field.id) && formData[field.id] !== undefined) {
                        customData[field.id] = formData[field.id];
                    }
                });
            }
            submitData.append('formData', JSON.stringify(customData));

            try {
                const response = await apiService.applyForJob(job._id, submitData);
                const result = await response.json();

                if (response.ok && result.success) {
                    setSubmitSuccess(true);
                    setFormData({});
                    setResumeFile(null);
                } else {
                    setSubmitError(result.message || 'Application failed. Please try again.');
                }
            } catch (error) {
                setSubmitError(error.message || 'An error occurred. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            // Scroll to top error
            const firstError = document.querySelector('.text-destructive');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    if (submitSuccess) {
        return (
            <Card className="border-border/40 bg-card/50">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <CardTitle className="text-xl">Apply for this Position</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center py-8">
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
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/40 bg-card/50">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="text-xl">Apply for this Position</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {submitError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{submitError}</AlertDescription>
                        </Alert>
                    )}
                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Validation Error</AlertTitle>
                            <AlertDescription>Please fix the errors below to submit your application.</AlertDescription>
                        </Alert>
                    )}

                    {/* Always Present Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                            <Input id="name" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} className={errors.name ? 'border-destructive' : ''} />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                            <Input id="email" type="email" value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} className={errors.email ? 'border-destructive' : ''} />
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                            <Input id="phone" type="tel" value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} className={errors.phone ? 'border-destructive' : ''} />
                            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="resume">Resume (PDF/DOCX) <span className="text-destructive">*</span></Label>
                            <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className={errors.resume ? 'border-destructive' : ''} />
                            {errors.resume && <p className="text-xs text-destructive">{errors.resume}</p>}
                            {resumeFile && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md relative z-10 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-green-800" />
                                    <span className="text-sm font-medium text-green-800">{resumeFile.name}</span>
                                    <span className="text-xs text-green-600">({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Standard Configurable Fields */}
                    {job.standardFields && (
                        <div className="grid md:grid-cols-2 gap-6">
                            {job.standardFields.linkedIn && (
                                <div className="space-y-2">
                                    <Label htmlFor="linkedIn">LinkedIn Profile <span className="text-destructive">*</span></Label>
                                    <Input id="linkedIn" value={formData.linkedIn || ''} onChange={(e) => handleChange('linkedIn', e.target.value)} className={errors.linkedIn ? 'border-destructive' : ''} />
                                    {errors.linkedIn && <p className="text-xs text-destructive">{errors.linkedIn}</p>}
                                </div>
                            )}
                            {job.standardFields.portfolio && (
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio">Portfolio URL <span className="text-destructive">*</span></Label>
                                    <Input id="portfolio" value={formData.portfolio || ''} onChange={(e) => handleChange('portfolio', e.target.value)} className={errors.portfolio ? 'border-destructive' : ''} />
                                    {errors.portfolio && <p className="text-xs text-destructive">{errors.portfolio}</p>}
                                </div>
                            )}
                            {job.standardFields.github && (
                                <div className="space-y-2">
                                    <Label htmlFor="github">GitHub Profile <span className="text-destructive">*</span></Label>
                                    <Input id="github" value={formData.github || ''} onChange={(e) => handleChange('github', e.target.value)} className={errors.github ? 'border-destructive' : ''} />
                                    {errors.github && <p className="text-xs text-destructive">{errors.github}</p>}
                                </div>
                            )}
                            {job.standardFields.currentCompany && (
                                <div className="space-y-2">
                                    <Label htmlFor="currentCompany">Current Company <span className="text-destructive">*</span></Label>
                                    <Input id="currentCompany" value={formData.currentCompany || ''} onChange={(e) => handleChange('currentCompany', e.target.value)} className={errors.currentCompany ? 'border-destructive' : ''} />
                                    {errors.currentCompany && <p className="text-xs text-destructive">{errors.currentCompany}</p>}
                                </div>
                            )}
                            {job.standardFields.currentDesignation && (
                                <div className="space-y-2">
                                    <Label htmlFor="currentDesignation">Current Designation <span className="text-destructive">*</span></Label>
                                    <Input id="currentDesignation" value={formData.currentDesignation || ''} onChange={(e) => handleChange('currentDesignation', e.target.value)} className={errors.currentDesignation ? 'border-destructive' : ''} />
                                    {errors.currentDesignation && <p className="text-xs text-destructive">{errors.currentDesignation}</p>}
                                </div>
                            )}
                            {job.standardFields.experienceYears && (
                                <div className="space-y-2">
                                    <Label htmlFor="experienceYears">Years of Experience <span className="text-destructive">*</span></Label>
                                    <Input id="experienceYears" type="number" value={formData.experienceYears || ''} onChange={(e) => handleChange('experienceYears', e.target.value)} className={errors.experienceYears ? 'border-destructive' : ''} />
                                    {errors.experienceYears && <p className="text-xs text-destructive">{errors.experienceYears}</p>}
                                </div>
                            )}
                            {job.standardFields.expectedSalary && (
                                <div className="space-y-2">
                                    <Label htmlFor="expectedSalary">Expected Salary <span className="text-destructive">*</span></Label>
                                    <Input id="expectedSalary" value={formData.expectedSalary || ''} onChange={(e) => handleChange('expectedSalary', e.target.value)} className={errors.expectedSalary ? 'border-destructive' : ''} />
                                    {errors.expectedSalary && <p className="text-xs text-destructive">{errors.expectedSalary}</p>}
                                </div>
                            )}
                            {job.standardFields.currentSalary && (
                                <div className="space-y-2">
                                    <Label htmlFor="currentSalary">Current Salary <span className="text-destructive">*</span></Label>
                                    <Input id="currentSalary" value={formData.currentSalary || ''} onChange={(e) => handleChange('currentSalary', e.target.value)} className={errors.currentSalary ? 'border-destructive' : ''} />
                                    {errors.currentSalary && <p className="text-xs text-destructive">{errors.currentSalary}</p>}
                                </div>
                            )}
                            {job.standardFields.noticePeriod && (
                                <div className="space-y-2">
                                    <Label htmlFor="noticePeriod">Notice Period <span className="text-destructive">*</span></Label>
                                    <Input id="noticePeriod" value={formData.noticePeriod || ''} onChange={(e) => handleChange('noticePeriod', e.target.value)} className={errors.noticePeriod ? 'border-destructive' : ''} />
                                    {errors.noticePeriod && <p className="text-xs text-destructive">{errors.noticePeriod}</p>}
                                </div>
                            )}
                            {job.standardFields.workMode && (
                                <div className="space-y-2">
                                    <Label htmlFor="workMode">Preferred Work Mode <span className="text-destructive">*</span></Label>
                                    <Select value={formData.workMode} onValueChange={(v) => handleChange('workMode', v)}>
                                        <SelectTrigger className={errors.workMode ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select Mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Remote">Remote</SelectItem>
                                            <SelectItem value="Onsite">Onsite</SelectItem>
                                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.workMode && <p className="text-xs text-destructive">{errors.workMode}</p>}
                                </div>
                            )}
                            {job.standardFields.relocate && (
                                <div className="space-y-2">
                                    <Label>Willing to Relocate? <span className="text-destructive">*</span></Label>
                                    <RadioGroup value={formData.relocate !== undefined ? String(formData.relocate) : undefined} onValueChange={(v) => handleChange('relocate', v === 'true')}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="true" id="r1" />
                                            <Label htmlFor="r1">Yes</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="false" id="r2" />
                                            <Label htmlFor="r2">No</Label>
                                        </div>
                                    </RadioGroup>
                                    {errors.relocate && <p className="text-xs text-destructive">{errors.relocate}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Custom Fields */}
                    {job.applyFormFields && job.applyFormFields.length > 0 && (
                        <div className="space-y-6 pt-4 border-t">
                            <h3 className="text-lg font-medium">Additional Questions</h3>
                            <div className="grid gap-6">
                                {job.applyFormFields.map((field) => {
                                    if (!visibleFields.includes(field.id)) return null;

                                    return (
                                        <div key={field.id} className="space-y-2">
                                            <Label htmlFor={field.id}>
                                                {field.label} {field.required && <span className="text-destructive">*</span>}
                                            </Label>

                                            {field.type === 'text' && (
                                                <Input
                                                    id={field.id}
                                                    placeholder={field.placeholder}
                                                    value={formData[field.id] || ''}
                                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                                    className={errors[field.id] ? 'border-destructive' : ''}
                                                />
                                            )}

                                            {field.type === 'textarea' && (
                                                <Textarea
                                                    id={field.id}
                                                    placeholder={field.placeholder}
                                                    value={formData[field.id] || ''}
                                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                                    className={errors[field.id] ? 'border-destructive' : ''}
                                                />
                                            )}

                                            {field.type === 'number' && (
                                                <Input
                                                    id={field.id}
                                                    type="number"
                                                    placeholder={field.placeholder}
                                                    value={formData[field.id] || ''}
                                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                                    className={errors[field.id] ? 'border-destructive' : ''}
                                                />
                                            )}

                                            {field.type === 'email' && (
                                                <Input
                                                    id={field.id}
                                                    type="email"
                                                    placeholder={field.placeholder}
                                                    value={formData[field.id] || ''}
                                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                                    className={errors[field.id] ? 'border-destructive' : ''}
                                                />
                                            )}

                                            {field.type === 'url' && (
                                                <Input
                                                    id={field.id}
                                                    type="url"
                                                    placeholder={field.placeholder}
                                                    value={formData[field.id] || ''}
                                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                                    className={errors[field.id] ? 'border-destructive' : ''}
                                                />
                                            )}

                                            {/* Add other types as needed: Select, Checkbox, Radio */}

                                            {errors[field.id] && <p className="text-xs text-destructive">{errors[field.id]}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Application...
                            </>
                        ) : (
                            'Submit Application'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default DynamicApplyForm;
