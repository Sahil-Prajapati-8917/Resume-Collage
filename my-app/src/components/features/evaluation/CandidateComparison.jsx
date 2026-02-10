import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, Star } from 'lucide-react'

const CandidateComparison = ({ isOpen, onClose, candidates }) => {
    if (!candidates || candidates.length === 0) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[90vw] h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Candidate Comparison</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-x-auto overflow-y-auto mt-4">
                    <div className="grid grid-cols-[200px_repeat(3,minmax(300px,1fr))] gap-0 border rounded-lg">
                        {/* Header Row */}
                        <div className="p-4 bg-muted font-bold border-r border-b">Metric</div>
                        {candidates.map(candidate => (
                            <div key={candidate._id} className="p-4 bg-muted font-bold border-b text-center border-r last:border-r-0">
                                {candidate.fileName}
                            </div>
                        ))}

                        {/* Role */}
                        <div className="p-4 border-r border-b font-medium">Role</div>
                        {candidates.map(candidate => (
                            <div key={candidate._id} className="p-4 border-r border-b text-center last:border-r-0 text-sm">
                                {candidate.roleType}
                            </div>
                        ))}

                        {/* Score */}
                        <div className="p-4 border-r border-b font-medium">AI Score</div>
                        {candidates.map(candidate => (
                            <div key={candidate._id} className="p-4 border-r border-b text-center last:border-r-0">
                                <div className="text-2xl font-bold">{candidate.aiEvaluation?.totalScore}</div>
                                <Badge variant="outline">{candidate.aiEvaluation?.confidenceLevel} Confidence</Badge>
                            </div>
                        ))}

                        {/* Quality Score */}
                        <div className="p-4 border-r border-b font-medium">Quality Score</div>
                        {candidates.map(candidate => (
                            <div key={candidate._id} className="p-4 border-r border-b text-center last:border-r-0">
                                <span className={candidate.qualityScore < 70 ? 'text-red-500 font-medium' : 'text-green-600 font-medium'}>
                                    {candidate.qualityScore || 'N/A'}
                                </span>
                            </div>
                        ))}

                        {/* Strengths */}
                        <div className="p-4 border-r border-b font-medium">Top Strengths</div>
                        {candidates.map(candidate => (
                            <div key={candidate._id} className="p-4 border-r border-b text-sm last:border-r-0">
                                <ul className="space-y-2">
                                    {candidate.aiEvaluation?.strengths?.slice(0, 3).map((s, i) => (
                                        <li key={i} className="flex items-start">
                                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-1" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Weaknesses */}
                        <div className="p-4 border-r border-b font-medium">Risks / Weaknesses</div>
                        {candidates.map(candidate => (
                            <div key={candidate._id} className="p-4 border-r border-b text-sm last:border-r-0">
                                <ul className="space-y-2">
                                    {candidate.aiEvaluation?.weaknesses?.slice(0, 3).map((w, i) => (
                                        <li key={i} className="flex items-start">
                                            <AlertTriangle className="h-3 w-3 text-red-500 mr-2 mt-1" />
                                            {w}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default CandidateComparison
