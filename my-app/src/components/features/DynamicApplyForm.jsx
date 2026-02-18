import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CloudUpload, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import apiService from '@/services/api';

const DynamicApplyForm = ({ job }) => {
    const [formData, setFormData] = useState({});
    const [resumeFile, setResumeFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [visibleFields, setVisibleFields] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Initialize Standard Fields logic
    useEffect(() => {
        evaluateVisibility();
    }, [formData, job]); // Re-evaluate when form data or job config changes

    const evaluateVisibility = () => {
        if (!job?.applyFormFields) return;

        const visible = job.applyFormFields.filter(field => {
            if (!field.showIf || !field.showIf.fieldId || field.showIf.fieldId === 'none') {
                return true;
            }
            const dependencyValue = formData[field.showIf.fieldId];
            if (!dependencyValue) return false;

            if (field.showIf.operator === 'equals') {
                return dependencyValue === field.showIf.value;
            }
            return false;
        }).map(f => f.id);

        setVisibleFields(visible);
    };

    const handleChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
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

        // 1. Standard Fields
        if (!formData.name) newErrors.name = 'Full Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!resumeFile) newErrors.resume = 'Resume is required';

        // 2. Toggleable Standard Fields
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

        // 3. Custom Fields
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
                            // Ignore invalid regex
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

            submitData.append('resume', resumeFile);

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
            const firstError = document.querySelector('[data-error="true"]');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    if (submitSuccess) {
        return (
            <Card className="w-full max-w-2xl mx-auto mt-8">
                <CardContent className="pt-6">
                    <div className="text-center py-10">
                        <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Application Submitted!</h3>
                        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                            Thank you for your interest. We have received your application and will review it carefully.
                        </p>
                        <Button
                            onClick={() => setSubmitSuccess(false)}
                            size="lg"
                            className="font-semibold"
                        >
                            Submit Another Application
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full mx-auto border-border/50 bg-card">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Apply Now</CardTitle>
                <CardDescription>
                    Please fill out the form below to apply for this position.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {submitError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{submitError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={formData.name || ''}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className={errors.name ? 'border-destructive' : ''}
                                data-error={errors.name ? "true" : "false"}
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email || ''}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className={errors.email ? 'border-destructive' : ''}
                                data-error={errors.email ? "true" : "false"}
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone || ''}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className={errors.phone ? 'border-destructive' : ''}
                            data-error={errors.phone ? "true" : "false"}
                        />
                        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                    </div>

                    {/* Standard Fields */}
                    {job.standardFields && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {job.standardFields.linkedIn && (
                                <div className="space-y-2">
                                    <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                                    <Input id="linkedIn" type="url" value={formData.linkedIn || ''} onChange={(e) => handleChange('linkedIn', e.target.value)} className={errors.linkedIn ? 'border-destructive' : ''} />
                                    {errors.linkedIn && <p className="text-xs text-destructive">{errors.linkedIn}</p>}
                                </div>
                            )}
                            {job.standardFields.portfolio && (
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio">Portfolio URL</Label>
                                    <Input id="portfolio" type="url" value={formData.portfolio || ''} onChange={(e) => handleChange('portfolio', e.target.value)} className={errors.portfolio ? 'border-destructive' : ''} />
                                    {errors.portfolio && <p className="text-xs text-destructive">{errors.portfolio}</p>}
                                </div>
                            )}
                            {job.standardFields.github && (
                                <div className="space-y-2">
                                    <Label htmlFor="github">GitHub Profile</Label>
                                    <Input id="github" type="url" value={formData.github || ''} onChange={(e) => handleChange('github', e.target.value)} className={errors.github ? 'border-destructive' : ''} />
                                    {errors.github && <p className="text-xs text-destructive">{errors.github}</p>}
                                </div>
                            )}
                            {job.standardFields.currentCompany && (
                                <div className="space-y-2">
                                    <Label htmlFor="currentCompany">Current Company</Label>
                                    <Input id="currentCompany" value={formData.currentCompany || ''} onChange={(e) => handleChange('currentCompany', e.target.value)} className={errors.currentCompany ? 'border-destructive' : ''} />
                                    {errors.currentCompany && <p className="text-xs text-destructive">{errors.currentCompany}</p>}
                                </div>
                            )}
                            {job.standardFields.currentDesignation && (
                                <div className="space-y-2">
                                    <Label htmlFor="currentDesignation">Current Designation</Label>
                                    <Input id="currentDesignation" value={formData.currentDesignation || ''} onChange={(e) => handleChange('currentDesignation', e.target.value)} className={errors.currentDesignation ? 'border-destructive' : ''} />
                                    {errors.currentDesignation && <p className="text-xs text-destructive">{errors.currentDesignation}</p>}
                                </div>
                            )}
                            {job.standardFields.experienceYears && (
                                <div className="space-y-2">
                                    <Label htmlFor="experienceYears">Years of Experience</Label>
                                    <Input id="experienceYears" type="number" value={formData.experienceYears || ''} onChange={(e) => handleChange('experienceYears', e.target.value)} className={errors.experienceYears ? 'border-destructive' : ''} />
                                    {errors.experienceYears && <p className="text-xs text-destructive">{errors.experienceYears}</p>}
                                </div>
                            )}
                            {job.standardFields.expectedSalary && (
                                <div className="space-y-2">
                                    <Label htmlFor="expectedSalary">Expected Salary</Label>
                                    <Input id="expectedSalary" value={formData.expectedSalary || ''} onChange={(e) => handleChange('expectedSalary', e.target.value)} className={errors.expectedSalary ? 'border-destructive' : ''} />
                                    {errors.expectedSalary && <p className="text-xs text-destructive">{errors.expectedSalary}</p>}
                                </div>
                            )}
                            {job.standardFields.currentSalary && (
                                <div className="space-y-2">
                                    <Label htmlFor="currentSalary">Current Salary</Label>
                                    <Input id="currentSalary" value={formData.currentSalary || ''} onChange={(e) => handleChange('currentSalary', e.target.value)} className={errors.currentSalary ? 'border-destructive' : ''} />
                                    {errors.currentSalary && <p className="text-xs text-destructive">{errors.currentSalary}</p>}
                                </div>
                            )}
                            {job.standardFields.noticePeriod && (
                                <div className="space-y-2">
                                    <Label htmlFor="noticePeriod">Notice Period</Label>
                                    <Input id="noticePeriod" value={formData.noticePeriod || ''} onChange={(e) => handleChange('noticePeriod', e.target.value)} className={errors.noticePeriod ? 'border-destructive' : ''} />
                                    {errors.noticePeriod && <p className="text-xs text-destructive">{errors.noticePeriod}</p>}
                                </div>
                            )}
                            {job.standardFields.workMode && (
                                <div className="space-y-2">
                                    <Label htmlFor="workMode">Preferred Work Mode</Label>
                                    <Select value={formData.workMode} onValueChange={(v) => handleChange('workMode', v)}>
                                        <SelectTrigger className={errors.workMode ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select Work Mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Remote">Remote</SelectItem>
                                            <SelectItem value="On-site">On-site</SelectItem>
                                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.workMode && <p className="text-xs text-destructive">{errors.workMode}</p>}
                                </div>
                            )}
                            {job.standardFields.relocate && (
                                <div className="space-y-2">
                                    <Label>Willing to Relocate?</Label>
                                    <RadioGroup value={formData.relocate?.toString()} onValueChange={(v) => handleChange('relocate', v === 'true')} className="flex gap-6 pt-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="true" id="relocate-yes" />
                                            <Label htmlFor="relocate-yes" className="font-normal">Yes</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="false" id="relocate-no" />
                                            <Label htmlFor="relocate-no" className="font-normal">No</Label>
                                        </div>
                                    </RadioGroup>
                                    {errors.relocate && <p className="text-xs text-destructive">{errors.relocate}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Custom Fields */}
                    {job.applyFormFields && job.applyFormFields.length > 0 && (
                        <div className="space-y-6 pt-6 border-t border-border/50">
                            <h3 className="text-lg font-semibold">Additional Questions</h3>
                            <div className="space-y-6">
                                {job.applyFormFields.map((field) => {
                                    if (!visibleFields.includes(field.id)) return null;
                                    return (
                                        <div key={field.id} className="space-y-2">
                                            <Label htmlFor={field.id}>
                                                {field.label} {field.required && <span className="text-destructive">*</span>}
                                            </Label>

                                            {field.type === 'textarea' ? (
                                                <Textarea
                                                    id={field.id}
                                                    placeholder={field.placeholder}
                                                    className={`min-h-[100px] resize-y ${errors[field.id] ? 'border-destructive' : ''}`}
                                                    value={formData[field.id] || ''}
                                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                                />
                                            ) : field.type === 'select' ? (
                                                <Select value={formData[field.id]} onValueChange={(v) => handleChange(field.id, v)}>
                                                    <SelectTrigger className={errors[field.id] ? 'border-destructive' : ''}>
                                                        <SelectValue placeholder={field.placeholder || "Select option"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {field.options?.map(opt => (
                                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : field.type === 'radio' ? (
                                                <RadioGroup value={formData[field.id]} onValueChange={(v) => handleChange(field.id, v)} className="flex flex-wrap gap-4 pt-2">
                                                    {field.options?.map(opt => (
                                                        <div key={opt} className="flex items-center space-x-2">
                                                            <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
                                                            <Label htmlFor={`${field.id}-${opt}`} className="font-normal">{opt}</Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            ) : field.type === 'checkbox' ? (
                                                <div className="flex flex-wrap gap-4 pt-2">
                                                    {field.options?.map(opt => (
                                                        <div key={opt} className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                id={`${field.id}-${opt}`}
                                                                checked={(formData[field.id] || []).includes(opt)}
                                                                onChange={(e) => {
                                                                    const current = formData[field.id] || [];
                                                                    const next = e.target.checked
                                                                        ? [...current, opt]
                                                                        : current.filter(o => o !== opt);
                                                                    handleChange(field.id, next);
                                                                }}
                                                                className="size-4 rounded border-primary text-primary focus:ring-primary"
                                                            />
                                                            <Label htmlFor={`${field.id}-${opt}`} className="font-normal">{opt}</Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : field.type === 'yesno' ? (
                                                <RadioGroup value={formData[field.id]} onValueChange={(v) => handleChange(field.id, v === 'true')} className="flex gap-6 pt-2">
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="true" id={`${field.id}-yes`} />
                                                        <Label htmlFor={`${field.id}-yes`} className="font-normal">Yes</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="false" id={`${field.id}-no`} />
                                                        <Label htmlFor={`${field.id}-no`} className="font-normal">No</Label>
                                                    </div>
                                                </RadioGroup>
                                            ) : (
                                                <Input
                                                    id={field.id}
                                                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                                                    placeholder={field.placeholder}
                                                    className={errors[field.id] ? 'border-destructive' : ''}
                                                    value={formData[field.id] || ''}
                                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                                />
                                            )}
                                            {errors[field.id] && <p className="text-xs text-destructive">{errors[field.id]}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Resume / CV</Label>
                        <div className={`border-2 border-dashed ${errors.resume ? 'border-destructive' : 'border-border'} hover:border-primary/50 bg-muted/30 rounded-xl p-10 transition-colors group cursor-pointer relative`}>
                            <input
                                type="file"
                                id="resume"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <CloudUpload className="text-primary" />
                                </div>
                                {resumeFile ? (
                                    <>
                                        <p className="font-medium">{resumeFile.name}</p>
                                        <p className="text-muted-foreground text-sm mt-1">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-medium">Click to upload or drag and drop</p>
                                        <p className="text-muted-foreground text-sm mt-1">PDF, DOCX (Max 10MB)</p>
                                    </>
                                )}
                            </div>
                        </div>
                        {errors.resume && <p className="text-xs text-destructive">{errors.resume}</p>}
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                        size="lg"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin h-5 w-5 mr-2" /> Submitting...
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
