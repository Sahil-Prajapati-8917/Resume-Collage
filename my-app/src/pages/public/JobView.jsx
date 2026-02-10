import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../../services/api';
import { AlertCircle, CheckCircle, Upload, Briefcase, MapPin, Clock } from 'lucide-react';

const JobView = () => {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [resumeFile, setResumeFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
        fetchJobDetails();
    }, [id]);

    const fetchJobDetails = async () => {
        try {
            const response = await apiService.getPublicJob(id);
            if (response.ok) {
                const data = await response.json();
                setJob(data.data);
            } else {
                setError('Job not found or closed.');
            }
        } catch (err) {
            setError('Failed to load job details.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!resumeFile) {
            setSubmitError('Please upload your resume.');
            return;
        }

        setSubmitting(true);
        setSubmitError(null);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('resume', resumeFile);

        try {
            const response = await apiService.applyForJob(id, data);
            const result = await response.json();

            if (response.ok && result.success) {
                setSubmitSuccess(true);
                setFormData({ name: '', email: '', phone: '' });
                setResumeFile(null);
            } else {
                setSubmitError(result.message || 'Application failed.');
            }
        } catch (err) {
            setSubmitError('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                    <div className="px-6 py-8 border-b border-gray-200">
                        <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                                <Briefcase className="mr-1.5 h-5 w-5 text-gray-400" />
                                {job.department || 'Engineering'}
                            </div>
                            <div className="flex items-center">
                                <MapPin className="mr-1.5 h-5 w-5 text-gray-400" />
                                {job.location || 'Remote'}
                            </div>
                            <div className="flex items-center">
                                <Clock className="mr-1.5 h-5 w-5 text-gray-400" />
                                {job.type || 'Full-time'}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-8 prose max-w-none text-gray-700">
                        <h3 className="text-lg font-medium text-gray-900">Description</h3>
                        <p className="mt-2">{job.description || 'No description provided.'}</p>

                        {job.responsibilities && job.responsibilities.length > 0 && (
                            <>
                                <h3 className="text-lg font-medium text-gray-900 mt-6">Responsibilities</h3>
                                <ul className="mt-2 list-disc pl-5">
                                    {job.responsibilities.map((res, idx) => (
                                        <li key={idx}>{res}</li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {job.requirements && job.requirements.length > 0 && (
                            <>
                                <h3 className="text-lg font-medium text-gray-900 mt-6">Requirements</h3>
                                <ul className="mt-2 list-disc pl-5">
                                    {job.requirements.map((req, idx) => (
                                        <li key={idx}>{req}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-6 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-xl font-semibold text-gray-900">Apply for this position</h2>
                    </div>

                    <div className="px-6 py-8">
                        {submitSuccess ? (
                            <div className="rounded-md bg-green-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-green-800">Application Submitted!</h3>
                                        <div className="mt-2 text-sm text-green-700">
                                            <p>Thank you for applying. We will review your application and get back to you shortly.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {submitError && (
                                    <div className="rounded-md bg-red-50 p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800">{submitError}</h3>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Full Name
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                required
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                required
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                            Phone
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="text"
                                                name="phone"
                                                id="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Resume / CV</label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                            <div className="space-y-1 text-center">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        <span>Upload a file</span>
                                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.docx,.doc,.txt" />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                                                {resumeFile && (
                                                    <p className="text-sm text-green-600 font-medium mt-2">{resumeFile.name}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Application'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobView;
