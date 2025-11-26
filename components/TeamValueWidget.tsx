
import React from 'react';
import { Project } from '../types';

interface TeamValueWidgetProps {
    projects: Project[];
    hourlyRate?: number;
}

export const TeamValueWidget: React.FC<TeamValueWidgetProps> = ({ projects, hourlyRate = 50 }) => {
    const totalWords = projects.reduce((acc, project) => {
        return acc + project.contentPieces.reduce((pAcc, piece) => pAcc + (piece.content ? piece.content.split(' ').length : 0), 0);
    }, 0);

    const hoursSaved = totalWords / 300; // Avg drafting speed: 300 words/hr
    const moneySaved = Math.floor(hoursSaved * hourlyRate);

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-1">ROI Calculator</p>
                    <h3 className="text-3xl font-bold">💰 ${moneySaved.toLocaleString()} Generated</h3>
                    <p className="text-indigo-100 text-xs mt-1 opacity-80">
                        Based on {totalWords.toLocaleString()} words generated @ ${hourlyRate}/hr editor rate.
                    </p>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 border border-white/10">
                    <div className="text-center">
                        <span className="block text-2xl font-bold">{Math.round(hoursSaved)}</span>
                        <span className="text-[10px] uppercase tracking-wide text-indigo-100">Hours Saved</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
