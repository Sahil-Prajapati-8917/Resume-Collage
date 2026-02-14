import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../../services/api';
import {
    Zap,
    MapPin,
    CheckCircle2,
    BadgeCheck,
    CloudUpload,
    Globe,
    Clock,
    TrendingUp,
    Users,
    Bookmark,
    Link,
    Share2,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays <= 30) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <Loader2 className="size-8 animate-spin mx-auto mb-4 text-[#137fec]" />
                    <p className="text-slate-600 dark:text-slate-400">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Card className="w-full max-w-md border-red-200 dark:border-red-900 bg-white dark:bg-slate-900">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Job Not Found</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
                        <Button onClick={() => window.history.back()} className="bg-[#137fec] hover:bg-[#137fec]/90">
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="font-display bg-[#f6f7f8] dark:bg-[#101922] text-slate-800 dark:text-slate-200 min-h-screen flex flex-col antialiased">
            {/* Navigation Removed */}

            <main className="flex-grow max-w-6xl mx-auto px-6 py-12 w-full">
                {/* Hero Header */}
                <header className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgNqMGicJSl5NLrkJJUdaWmRcVo6FrBU0iUdIcl5g6r6TDMonA33l4TQleW0PcDwtr8RqR6ElZ5YgV-8MyDZTsooH4HWdJeWrWfcFjs-Z0qS1EWBVM_QvIz1HGKuylAC-kcMpAKYkun4yyI4jSeNbeXPxRglogBLF5-XP1L2_Dfmtot09u4xNemWdkP1RYZWDsmafNYzbscPszKhAi4c9G42cE-_Z69SY4sWZWnlUpp4EuYAnS38MDZz6N4E3EELeSUrcRHDTNncM"
                                    alt="TechCorp Logo"
                                    className="w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm object-cover"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">TechCorp Solutions</h2>
                                    <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm gap-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{job.location || 'Remote'}</span>
                                    </div>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">{job.title}</h1>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-1 text-slate-800">
                            <span className="px-3 py-1 rounded-full bg-[#137fec]/10 text-[#137fec] text-xs font-bold uppercase tracking-wider">{job.industry || 'Engineering'}</span>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-wider">{job.jobType || 'Full-Time'}</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Description Section */}
                        <section>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-[#137fec] rounded-full"></span>
                                Description
                            </h3>
                            <div className="prose dark:prose-invert prose-slate max-w-none">
                                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                    {job.description || 'No description provided.'}
                                </p>
                            </div>
                        </section>

                        {/* Responsibilities Section */}
                        {job.responsibilities && job.responsibilities.length > 0 && (
                            <section>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-[#137fec] rounded-full"></span>
                                    Responsibilities
                                </h3>
                                <ul className="space-y-4">
                                    {job.responsibilities.map((res, idx) => (
                                        <li key={idx} className="flex items-start gap-4 text-slate-600 dark:text-slate-400">
                                            <CheckCircle2 className="w-5 h-5 text-[#137fec]/60 mt-0.5" />
                                            <span>{res}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Requirements Section */}
                        {job.requirements && job.requirements.length > 0 && (
                            <section>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-[#137fec] rounded-full"></span>
                                    Requirements
                                </h3>
                                <ul className="space-y-4">
                                    {job.requirements.map((req, idx) => (
                                        <li key={idx} className="flex items-start gap-4 text-slate-600 dark:text-slate-400">
                                            <BadgeCheck className="w-5 h-5 text-[#137fec]/60 mt-0.5" />
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Application Form Card */}
                        <section id="apply-form" className="bg-white dark:bg-[#101922]/50 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Apply for this position</h3>
                            {job.status === 'Open' ? (
                                <DynamicApplyForm job={job} />
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-slate-500 font-medium">This position is currently closed/not accepting applications.</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sticky Sidebar */}
                    <aside className="lg:col-span-4 h-fit sticky top-24">
                        <div className="bg-white dark:bg-[#101922]/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Salary Range</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                                        {job.salaryRange?.min && job.salaryRange?.max
                                            ? `$${job.salaryRange.min}k – $${job.salaryRange.max}k`
                                            : 'Competitive'}
                                        <span className="text-xs text-slate-400 font-normal"> / year</span>
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-y border-slate-100 dark:border-slate-800 py-6">
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Location</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                                            <Globe className="w-3 h-3 text-slate-400" /> {job.location || 'Remote'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Posted</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-slate-400" /> {formatDate(job.postedAt || job.createdAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Level</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3 text-slate-400" /> {job.experienceLevel ? job.experienceLevel.split('(')[0].trim() : (job.level || 'Senior')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Applicants</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                                            <Users className="w-3 h-3 text-slate-400" /> {job.applicantCount || 0}
                                        </p>
                                    </div>
                                </div>
                                <a href="#apply-form" className="block w-full text-center bg-[#137fec] text-white font-bold py-3 rounded-lg hover:bg-[#137fec]/90 transition-all shadow-md">
                                    Apply Now
                                </a>
                                <button className="w-full flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 font-medium py-3 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                                    <Bookmark className="w-4 h-4" /> Save Job
                                </button>
                                <div className="pt-4">
                                    <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                                        Share this opportunity with your network
                                    </p>
                                    <div className="flex justify-center gap-4 mt-3">
                                        <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-[#137fec] hover:bg-[#137fec]/10 transition-all">
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                        <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-[#137fec] hover:bg-[#137fec]/10 transition-all">
                                            <Link className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Image Placeholder */}
                        <div className="mt-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-40 relative group">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhMbaUAKXe8pR9UwKwpL8u2pxBwL-eZasWz8BTlggAA8Y6ztVnRU5TehQ5n2KvGXmnWgP673lWstR_a-iNssPzOmGTERfl-HKcZdZzq_O1kdQ3n8WaWSv1TUpXoHPWoHM54ItwFtJSgzlqTJTVMYaVID-odLsM5_cQg-NaDDJ5-wgrIgjDiKTqp4xA-V5jNXnqWomJagHgKLG32vIMQOR7y-fAa1ZIXmT3E848uLJJGAAUKv_RHfHnbCMAOPoLAnIdhnJ1Vp-jY38"
                                alt="Map"
                                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-4">
                                <div className="flex items-center gap-2 text-white">
                                    <MapPin className="w-3 h-3" />
                                    <span className="text-xs font-semibold">TechCorp HQ, Market St</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Footer Removed */}
        </div>
    );
};

export default JobView;