import React, { useState } from 'react';
import {
    BarChart3,
    Settings,
    FileText,
    ZoomOut,
    ZoomIn,
    Download,
    MapPin,
    Mail,
    Link as LinkIcon,
    Sparkles,
    CheckCircle,
    AlertTriangle,
    Star,
    X,
    Bookmark,
    Calendar,
    ArrowLeft,
    ThumbsUp,
    ThumbsDown,
    Eye,
    CheckCircle2
} from 'lucide-react';
import apiService from '@/services/api';
import { Button } from '@/components/ui/button';

const CandidateEvaluation = ({ candidate, onBack, onAction }) => {
    const [scale, setScale] = useState(100);
    const [notes, setNotes] = useState('');

    if (!candidate) return null;

    const handleZoomIn = () => setScale(prev => Math.min(prev + 10, 200));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 10, 50));

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    }; // Calculate score color based on threshold

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#f6f6f8] dark:bg-[#101622] text-slate-900 dark:text-slate-100 font-display">
            {/* Top Navigation Bar (Integrated or Separate) */}
            <nav className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Button>
                    <div className="bg-[#0f49bd]/10 p-2 rounded-lg">
                        <BarChart3 className="text-[#0f49bd] w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Evaluation Terminal</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Application Review • {candidate.roleType || 'Candidate'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex -space-x-2">
                        {/* Placeholder avatars */}
                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-500">AI</span>
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-[#0f49bd] text-white flex items-center justify-center text-[10px] font-bold">
                            You
                        </div>
                    </div>
                    <button className="text-slate-400 hover:text-[#0f49bd] transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            <main className="flex flex-1 overflow-hidden">
                {/* Left Section: Document Viewer */}
                <section className="w-1/2 flex flex-col bg-slate-100 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
                    <div className="h-12 flex items-center justify-between px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate max-w-[200px]">
                                {candidate.fileName || 'Resume.pdf'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={handleZoomOut} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
                                <ZoomOut className="w-4 h-4 text-slate-500" />
                            </button>
                            <span className="text-xs px-2 font-medium">{scale}%</span>
                            <button onClick={handleZoomIn} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
                                <ZoomIn className="w-4 h-4 text-slate-500" />
                            </button>
                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-2"></div>
                            <button onClick={() => window.open(apiService.getResumeUrl ? apiService.getResumeUrl(candidate._id) : '#', '_blank')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
                                <Download className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50 dark:bg-slate-950">
                        {/* Resume Iframe */}
                        <div className="max-w-2xl mx-auto shadow-2xl shadow-slate-200 dark:shadow-none bg-white dark:bg-slate-900 min-h-[1100px] rounded-lg overflow-hidden">
                            {candidate.resumePath ? (
                                <iframe
                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/resume/view/${candidate._id}`}
                                    className="w-full h-[1100px]"
                                    title="Resume"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <FileText className="w-16 h-16 mb-4" />
                                    <p>Resume not available for preview</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Right Section: Evaluation Panel */}
                <section className="w-1/2 flex flex-col bg-white dark:bg-slate-900">
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-8 max-w-xl mx-auto space-y-8 pb-32">
                            {/* Candidate Info Header */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#0f49bd]/10 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-[#0f49bd]">{candidate.candidateName?.charAt(0) || 'C'}</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-bold">{candidate.candidateName || 'Unknown Candidate'}</h2>
                                        <span className="bg-[#0f49bd]/10 text-[#0f49bd] text-[10px] px-2 py-1 rounded-full font-bold uppercase">{candidate.status}</span>
                                    </div>
                                    <p className="text-slate-500 font-medium">
                                        {candidate.candidateEmail} • {candidate.experienceYears ? `${candidate.experienceYears} years exp` : 'Exp N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* AI Insights Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="text-[#0f49bd] w-5 h-5" />
                                    <h3 className="font-bold text-lg">AI Talent Insights</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Strength */}
                                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="text-emerald-500 w-4 h-4" />
                                            <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Key Strengths</span>
                                        </div>
                                        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                                            {candidate.aiEvaluation?.strengths?.slice(0, 3).map((strength, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
                                                    <span>{strength}</span>
                                                </li>
                                            )) || <li>No specific strengths identified.</li>}
                                        </ul>
                                    </div>
                                    {/* Weakness */}
                                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertTriangle className="text-amber-500 w-4 h-4" />
                                            <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider">Potential Gaps</span>
                                        </div>
                                        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                                            {candidate.aiEvaluation?.weaknesses?.slice(0, 3).map((weakness, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>
                                                    <span>{weakness}</span>
                                                </li>
                                            )) || <li>No specific gaps identified.</li>}
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Competency Ratings */}
                            {candidate.aiEvaluation?.details && (
                                <section>
                                    <h3 className="font-bold text-lg mb-4">Competency Assessment</h3>
                                    <div className="space-y-5 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                                        {Object.entries(candidate.aiEvaluation.details).map(([key, score]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <div>
                                                    <span className="block text-sm font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                    <span className="text-xs text-slate-500">AI Score: {score}/100</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-4 h-4 ${star <= Math.round(score / 20) ? 'text-[#0f49bd] fill-[#0f49bd]' : 'text-slate-300 dark:text-slate-700'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Standard Fields Section */}
                            {(candidate.linkedIn || candidate.github || candidate.portfolio) && (
                                <section>
                                    <h3 className="font-bold text-lg mb-4">Professional Presence</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {candidate.linkedIn && (
                                            <a href={candidate.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#0f49bd] transition-all">
                                                <LinkIcon className="w-4 h-4 text-[#0f49bd]" />
                                                <span className="text-sm font-medium">LinkedIn</span>
                                            </a>
                                        )}
                                        {candidate.github && (
                                            <a href={candidate.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#0f49bd] transition-all">
                                                <LinkIcon className="w-4 h-4 text-[#0f49bd]" />
                                                <span className="text-sm font-medium">GitHub</span>
                                            </a>
                                        )}
                                        {candidate.portfolio && (
                                            <a href={candidate.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#0f49bd] transition-all">
                                                <LinkIcon className="w-4 h-4 text-[#0f49bd]" />
                                                <span className="text-sm font-medium">Portfolio</span>
                                            </a>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Candidate Form Responses (Dynamic Data) */}
                            {candidate.formData && Object.keys(candidate.formData).length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText className="text-[#0f49bd] w-5 h-5" />
                                        <h3 className="font-bold text-lg">Application Responses</h3>
                                    </div>
                                    <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                                        {Object.entries(candidate.formData).map(([key, value]) => (
                                            <div key={key} className="space-y-1">
                                                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                                                </span>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Notes Section */}
                            <section>
                                <h3 className="font-bold text-lg mb-4">Manual Evaluation Notes</h3>
                                <div className="relative">
                                    <textarea
                                        className="w-full h-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#0f49bd] focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                        placeholder="Type your personal observations here..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    ></textarea>
                                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Autosaved</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Docked Footer Actions */}
                    <footer className="h-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-10 sticky bottom-0">
                        <button
                            onClick={() => onAction('reject', candidate)}
                            className="px-6 py-3 border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold rounded-lg transition-all flex items-center gap-2"
                        >
                            <X className="w-5 h-5" />
                            Reject
                        </button>
                        <div className="flex gap-4">
                            <button
                                onClick={() => onAction('shortlist', candidate)}
                                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
                            >
                                <Bookmark className="w-5 h-5" />
                                Shortlist
                            </button>
                            <button
                                onClick={() => onAction('interview', candidate)}
                                className="px-8 py-3 bg-[#0f49bd] hover:bg-[#0f49bd]/90 text-white font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-[#0f49bd]/20"
                            >
                                <Calendar className="w-5 h-5" />
                                Schedule Interview
                            </button>
                        </div>
                    </footer>
                </section>
            </main>
        </div>
    );
};

export default CandidateEvaluation;
