
import React, { useMemo } from 'react';
import { Project } from '../types';
import { TrendUpIcon } from './icons/TrendUpIcon';
import { ClockIcon } from './icons/ClockIcon';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';

interface AnalyticsPageProps {
    projects: Project[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ projects }) => {
    // Basic ROI Calculations
    const totalContent = useMemo(() => projects.flatMap(p => p.contentPieces).length, [projects]);
    const hoursSaved = useMemo(() => Math.round(totalContent * 0.75), [totalContent]); // 45 mins per piece
    const moneySaved = useMemo(() => hoursSaved * 50, [hoursSaved]); // $50/hr avg editor rate
    
    const topFormats = useMemo(() => {
        const counts: Record<string, number> = {};
        projects.flatMap(p => p.contentPieces).forEach(cp => {
            counts[cp.format] = (counts[cp.format] || 0) + 1;
        });
        return Object.entries(counts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);
    }, [projects]);

    return (
        <div className="p-6 md:p-10 animate-fade-in bg-[#FAFAFA] dark:bg-[#0B0C15] min-h-full">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 shadow-sm">
                    <AnalyticsIcon className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">ROI Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Real-time impact of your content operations.</p>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-md dark:shadow-lg border border-gray-200 dark:border-white/10 relative overflow-hidden group hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full blur-xl -mr-6 -mt-6 transition-opacity group-hover:opacity-100 opacity-50"></div>
                    <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
                        <ClockIcon className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Time Saved</span>
                    </div>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">{hoursSaved}</span>
                        <span className="text-lg font-medium text-gray-500 dark:text-gray-400">hours</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-medium">vs. manual creation</p>
                </div>

                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-md dark:shadow-lg border border-gray-200 dark:border-white/10 relative overflow-hidden group hover:border-blue-200 dark:hover:border-blue-500/30 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-500/10 rounded-full blur-xl -mr-6 -mt-6 transition-opacity group-hover:opacity-100 opacity-50"></div>
                    <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
                        <MegaphoneIcon className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Content Velocity</span>
                    </div>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">{totalContent}</span>
                        <span className="text-lg font-medium text-gray-500 dark:text-gray-400">assets</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-medium">generated this month</p>
                </div>

                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-md dark:shadow-lg border border-gray-200 dark:border-white/10 relative overflow-hidden group hover:border-purple-200 dark:hover:border-purple-500/30 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 dark:bg-purple-500/10 rounded-full blur-xl -mr-6 -mt-6 transition-opacity group-hover:opacity-100 opacity-50"></div>
                    <div className="flex items-center gap-2 mb-3 text-purple-600 dark:text-purple-400">
                        <TrendUpIcon className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Est. Value</span>
                    </div>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">${moneySaved.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-medium">based on avg. agency rates</p>
                </div>
            </div>

            {/* Top Formats Chart (Simplified Visual) */}
            <div className="bg-white dark:bg-gray-800/50 p-8 rounded-2xl shadow-md dark:shadow-lg border border-gray-200 dark:border-white/10">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Performing Formats</h3>
                <div className="space-y-6">
                    {topFormats.length > 0 ? topFormats.map(([format, count], index) => {
                        const max = topFormats[0][1];
                        const width = (count / max) * 100;
                        const colors = [
                            'bg-indigo-500 dark:bg-indigo-500', 
                            'bg-blue-500 dark:bg-blue-500', 
                            'bg-purple-500 dark:bg-purple-500'
                        ];
                        return (
                            <div key={format} className="relative">
                                <div className="flex justify-between text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                    <span>{format}</span>
                                    <span>{count}</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden border border-gray-100 dark:border-transparent">
                                    <div 
                                        className={`h-full rounded-full ${colors[index % 3]} shadow-sm`} 
                                        style={{ width: `${width}%` }}
                                    ></div>
                                </div>
                            </div>
                        )
                    }) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-10">No data available yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
