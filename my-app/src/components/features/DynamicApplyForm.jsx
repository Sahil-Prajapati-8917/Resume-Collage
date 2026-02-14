import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CloudUpload, Loader2, AlertCircle, FileText, CheckCircle } from 'lucide-react';
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
            const firstError = document.querySelector('.text-destructive');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    if (submitSuccess) {
        return (
            <div className="text-center py-10">
                <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Application Submitted!</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">
                    Thank you for your interest. We have received your application and will review it carefully.
                </p>
                <button
                    onClick={() => setSubmitSuccess(false)}
                    className="bg-[#137fec] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#137fec]/90 transition-all shadow-lg shadow-[#137fec]/20"
                >
                    Submit Another Application
                </button>
            </div>
        );
    }

    const inputClasses = "w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#137fec] focus:border-[#137fec] outline-none transition-all";
    const labelClasses = "text-sm font-semibold text-slate-700 dark:text-slate-300";

    return (
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
                    <label htmlFor="name" className={labelClasses}>Full Name</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        className={`${inputClasses} ${errors.name ? 'border-red-500' : ''}`}
                        value={formData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className={labelClasses}>Email Address</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className={`${inputClasses} ${errors.email ? 'border-red-500' : ''}`}
                        value={formData.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="phone" className={labelClasses}>Phone Number</label>
                <input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className={`${inputClasses} ${errors.phone ? 'border-red-500' : ''}`}
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>

            {/* Standard Fields */}
            {job.standardFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {job.standardFields.linkedIn && (
                        <div className="space-y-2">
                            <label htmlFor="linkedIn" className={labelClasses}>LinkedIn Profile</label>
                            <input id="linkedIn" type="url" className={`${inputClasses} ${errors.linkedIn ? 'border-red-500' : ''}`} value={formData.linkedIn || ''} onChange={(e) => handleChange('linkedIn', e.target.value)} />
                            {errors.linkedIn && <p className="text-xs text-red-500">{errors.linkedIn}</p>}
                        </div>
                    )}
                    {job.standardFields.portfolio && (
                        <div className="space-y-2">
                            <label htmlFor="portfolio" className={labelClasses}>Portfolio URL</label>
                            <input id="portfolio" type="url" className={`${inputClasses} ${errors.portfolio ? 'border-red-500' : ''}`} value={formData.portfolio || ''} onChange={(e) => handleChange('portfolio', e.target.value)} />
                            {errors.portfolio && <p className="text-xs text-red-500">{errors.portfolio}</p>}
                        </div>
                    )}
                    {job.standardFields.github && (
                        <div className="space-y-2">
                            <label htmlFor="github" className={labelClasses}>GitHub Profile</label>
                            <input id="github" type="url" className={`${inputClasses} ${errors.github ? 'border-red-500' : ''}`} value={formData.github || ''} onChange={(e) => handleChange('github', e.target.value)} />
                            {errors.github && <p className="text-xs text-red-500">{errors.github}</p>}
                        </div>
                    )}
                    {job.standardFields.currentCompany && (
                        <div className="space-y-2">
                            <label htmlFor="currentCompany" className={labelClasses}>Current Company</label>
                            <input id="currentCompany" type="text" className={`${inputClasses} ${errors.currentCompany ? 'border-red-500' : ''}`} value={formData.currentCompany || ''} onChange={(e) => handleChange('currentCompany', e.target.value)} />
                            {errors.currentCompany && <p className="text-xs text-red-500">{errors.currentCompany}</p>}
                        </div>
                    )}
                    {job.standardFields.currentDesignation && (
                        <div className="space-y-2">
                            <label htmlFor="currentDesignation" className={labelClasses}>Current Designation</label>
                            <input id="currentDesignation" type="text" className={`${inputClasses} ${errors.currentDesignation ? 'border-red-500' : ''}`} value={formData.currentDesignation || ''} onChange={(e) => handleChange('currentDesignation', e.target.value)} />
                            {errors.currentDesignation && <p className="text-xs text-red-500">{errors.currentDesignation}</p>}
                        </div>
                    )}
                    {job.standardFields.experienceYears && (
                        <div className="space-y-2">
                            <label htmlFor="experienceYears" className={labelClasses}>Years of Experience</label>
                            <input id="experienceYears" type="number" className={`${inputClasses} ${errors.experienceYears ? 'border-red-500' : ''}`} value={formData.experienceYears || ''} onChange={(e) => handleChange('experienceYears', e.target.value)} />
                            {errors.experienceYears && <p className="text-xs text-red-500">{errors.experienceYears}</p>}
                        </div>
                    )}
                    {job.standardFields.expectedSalary && (
                        <div className="space-y-2">
                            <label htmlFor="expectedSalary" className={labelClasses}>Expected Salary</label>
                            <input id="expectedSalary" type="text" className={`${inputClasses} ${errors.expectedSalary ? 'border-red-500' : ''}`} value={formData.expectedSalary || ''} onChange={(e) => handleChange('expectedSalary', e.target.value)} />
                            {errors.expectedSalary && <p className="text-xs text-red-500">{errors.expectedSalary}</p>}
                        </div>
                    )}
                    {job.standardFields.currentSalary && (
                        <div className="space-y-2">
                            <label htmlFor="currentSalary" className={labelClasses}>Current Salary</label>
                            <input id="currentSalary" type="text" className={`${inputClasses} ${errors.currentSalary ? 'border-red-500' : ''}`} value={formData.currentSalary || ''} onChange={(e) => handleChange('currentSalary', e.target.value)} />
                            {errors.currentSalary && <p className="text-xs text-red-500">{errors.currentSalary}</p>}
                        </div>
                    )}
                    {job.standardFields.noticePeriod && (
                        <div className="space-y-2">
                            <label htmlFor="noticePeriod" className={labelClasses}>Notice Period</label>
                            <input id="noticePeriod" type="text" className={`${inputClasses} ${errors.noticePeriod ? 'border-red-500' : ''}`} value={formData.noticePeriod || ''} onChange={(e) => handleChange('noticePeriod', e.target.value)} />
                            {errors.noticePeriod && <p className="text-xs text-red-500">{errors.noticePeriod}</p>}
                        </div>
                    )}
                </div>
            )}

            {/* Custom Fields */}
            {job.applyFormFields && job.applyFormFields.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Additional Questions</h3>
                    <div className="space-y-6">
                        {job.applyFormFields.map((field) => {
                            if (!visibleFields.includes(field.id)) return null;
                            return (
                                <div key={field.id} className="space-y-2">
                                    <label htmlFor={field.id} className={labelClasses}>
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>

                                    {field.type === 'textarea' ? (
                                        <textarea
                                            id={field.id}
                                            placeholder={field.placeholder}
                                            className={`${inputClasses} min-h-[100px] resize-y`}
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleChange(field.id, e.target.value)}
                                        />
                                    ) : field.type === 'select' ? (
                                        <Select value={formData[field.id]} onValueChange={(v) => handleChange(field.id, v)}>
                                            <SelectTrigger className={inputClasses}>
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
                                                        className="size-4 rounded border-slate-300 text-[#137fec] focus:ring-[#137fec]"
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
                                        <input
                                            id={field.id}
                                            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                                            placeholder={field.placeholder}
                                            className={`${inputClasses} ${errors[field.id] ? 'border-red-500' : ''}`}
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleChange(field.id, e.target.value)}
                                        />
                                    )}
                                    {errors[field.id] && <p className="text-xs text-red-500">{errors[field.id]}</p>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <label className={labelClasses}>Resume / CV</label>
                <div className={`border-2 border-dashed ${errors.resume ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} hover:border-[#137fec] dark:hover:border-[#137fec]/50 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-10 transition-colors group cursor-pointer relative`}>
                    <input
                        type="file"
                        id="resume"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-[#137fec]/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <CloudUpload className="text-[#137fec]" />
                        </div>
                        {resumeFile ? (
                            <>
                                <p className="text-slate-900 dark:text-white font-medium">{resumeFile.name}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </>
                        ) : (
                            <>
                                <p className="text-slate-900 dark:text-white font-medium">Click to upload or drag and drop</p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">PDF, DOCX (Max 10MB)</p>
                            </>
                        )}
                    </div>
                </div>
                {errors.resume && <p className="text-xs text-red-500">{errors.resume}</p>}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#137fec] text-white font-bold py-4 rounded-xl hover:bg-[#137fec]/90 shadow-lg shadow-[#137fec]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin h-5 w-5" /> Submitting...
                    </>
                ) : (
                    'Submit Application'
                )}
            </button>
        </form>
    );
};

export default DynamicApplyForm;
