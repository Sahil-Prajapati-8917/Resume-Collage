import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';
import { Loader2, Github, Linkedin, ExternalLink } from 'lucide-react';

const PortfolioDisplay = () => {
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const response = await apiService.getPortfolioData();
                if (response.ok) {
                    const data = await response.json();
                    setPortfolio(data.data);
                } else {
                    // It's possible 404 if no portfolio created yet
                    if (response.status === 404) {
                        setError('Portfolio not found. Please check back later.');
                    } else {
                        setError('Failed to load portfolio data.');
                    }
                }
            } catch (err) {
                console.error('Error fetching portfolio:', err);
                setError('An error occurred while loading the portfolio.');
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10 text-gray-500">
                <p>{error}</p>
            </div>
        );
    }

    if (!portfolio) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <header className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">{portfolio.ownerName}</h1>
                <p className="text-xl text-gray-600">{portfolio.title}</p>
                <div className="flex justify-center space-x-4">
                    {portfolio.socialLinks?.github && (
                        <a href={portfolio.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black">
                            <Github className="h-6 w-6" />
                        </a>
                    )}
                    {portfolio.socialLinks?.linkedin && (
                        <a href={portfolio.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-700">
                            <Linkedin className="h-6 w-6" />
                        </a>
                    )}
                    {portfolio.socialLinks?.website && (
                        <a href={portfolio.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-500">
                            <ExternalLink className="h-6 w-6" />
                        </a>
                    )}
                </div>
                <p className="max-w-2xl mx-auto text-gray-700">{portfolio.bio}</p>
            </header>

            {/* Skills */}
            <section>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Skills</h2>
                <div className="flex flex-wrap gap-2">
                    {portfolio.skills?.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {skill.name} <span className="text-xs opacity-75">({skill.level})</span>
                        </span>
                    ))}
                </div>
            </section>

            {/* Experience */}
            <section>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Experience</h2>
                <div className="space-y-6">
                    {portfolio.experience?.map((exp, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-bold">{exp.position}</h3>
                                    <p className="text-gray-600">{exp.company}</p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                                </div>
                            </div>
                            <p className="text-gray-700 whitespace-pre-line">{exp.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Projects */}
            <section>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Projects</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {portfolio.projects?.map((project, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border flex flex-col">
                            <h3 className="text-lg font-bold mb-2">{project.title}</h3>
                            <p className="text-gray-700 mb-4 flex-grow">{project.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {project.technologies?.map((tech, i) => (
                                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{tech}</span>
                                ))}
                            </div>
                            <div className="flex space-x-3 mt-auto">
                                {project.link && (
                                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center">
                                        <ExternalLink className="h-3 w-3 mr-1" /> Live Demo
                                    </a>
                                )}
                                {project.githubLink && (
                                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black hover:underline text-sm flex items-center">
                                        <Github className="h-3 w-3 mr-1" /> Code
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Education */}
            <section>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Education</h2>
                <div className="space-y-4">
                    {portfolio.education?.map((edu, index) => (
                        <div key={index}>
                            <h3 className="text-lg font-bold">{edu.institution}</h3>
                            <p className="text-gray-700">{edu.degree}, {edu.fieldOfStudy}</p>
                            <p className="text-sm text-gray-500">
                                {new Date(edu.startDate).getFullYear()} - {new Date(edu.endDate).getFullYear()}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default PortfolioDisplay;
