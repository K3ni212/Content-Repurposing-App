
import React, { useMemo } from 'react';
import { Project } from '../types';
import { TrendUpIcon } from './icons/TrendUpIcon';
import { ClockIcon } from './icons/ClockIcon';

// Helper to generate chart path
const generateSparkline = (data: number[], width: number, height: number) => {
    if (data.length === 0) return "";
    const max = Math.max(...data, 1);
    const stepX = width / (data.length - 1 || 1);
    
    const points = data.map((val, i) => {
        const x = i * stepX;
        const y = height - (val / max) * height;
        return `${x},${y}`;
    });

    return `M0,${height} L${points.join(' L')} L${width},${height} Z`;
};

const generateLinePath = (data: number[], width: number, height: number) => {
    if (data.length === 0) return "";
    const max = Math.max(...data, 1);
    const stepX = width / (data.length - 1 || 1);
    
    const points = data.map((val, i) => {
        const x = i * stepX;
        const y = height - (val / max) * height;
        return `${x},${y}`;
    });

    return `M${points.join(' L')}`;
};

interface TeamValueWidgetProps {
    projects: Project[];
    hourlyRate?: number;
}

export const TeamValueWidget: React.FC<TeamValueWidgetProps> = ({ projects }) => {
    const allContent = useMemo(() => projects.flatMap(p => p.contentPieces), [projects]);
    const totalSourceCount = projects.length;
    const totalContentCount = allContent.length;
    const totalTimeSaved = totalContentCount * 0.75;
    const multiplier = totalSourceCount > 0 ? (totalContentCount / totalSourceCount).toFixed(1) : "0.0";

    const chartData = useMemo(() => {
        const days = 30;
        const now = new Date();
        const dailySaved: number[] = new Array(days).fill(0);
        
        allContent.forEach(piece => {
            const created = new Date(piece.createdAt);
            const diffTime = Math.abs(now.getTime() - created.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            if (diffDays <= days) {
                const index = days - diffDays;
                if (index >= 0 && index < days) dailySaved[index] += 0.75;
            }
        });

        let runningTotal = 0;
        return dailySaved.map(val => {
            runningTotal += val;
            return runningTotal;
        });
    }, [allContent]);

    return (
        <div className="bg-white dark:bg-gradient-to-br dark:from-indigo-900 dark:via-indigo-900/50 dark:to-blue-900/30 rounded-2xl p-6 text-gray-900 dark:text-white shadow-xl shadow-gray-200/50 dark:shadow-indigo-900/20 mb-10 relative overflow-hidden border border-gray-100 dark:border-white/10 group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-stretch">
                {/* Primary Metric: Time Saved */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/30 rounded-lg backdrop-blur-sm">
                                <ClockIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-200" />
                            </div>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-200 uppercase tracking-wider">Time Saved</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-5xl font-extrabold tracking-tight">{Math.round(totalTimeSaved)}</h3>
                            <span className="text-xl font-medium text-gray-500 dark:text-indigo-200">hours</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-indigo-300/80 mt-2 flex items-center gap-1">
                            <TrendUpIcon className="w-4 h-4 text-green-500 dark:text-green-400" />
                            <span className="text-green-600 dark:text-green-400 font-bold">+12%</span> this month
                        </p>
                    </div>
                </div>

                {/* Secondary Metric: Content Multiplier */}
                <div className="flex-none md:w-48 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-4 backdrop-blur-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-gray-500 dark:text-indigo-200 uppercase tracking-wider mb-2 text-center">Content Multiplier</p>
                    <div className="text-center">
                        <div className="text-3xl font-bold mb-1">{multiplier}x</div>
                        <div className="text-[10px] text-gray-500 dark:text-indigo-300 bg-gray-100 dark:bg-indigo-900/50 px-2 py-1 rounded-full inline-block border border-gray-200 dark:border-white/10">
                            1 Source &rarr; {Math.floor(Number(multiplier))} Pieces
                        </div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1 relative h-32 md:h-auto min-h-[100px] flex items-end">
                    <div className="absolute inset-0 flex items-end opacity-90">
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(99, 102, 241, 0.5)" />
                                    <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                                </linearGradient>
                            </defs>
                            <path 
                                d={generateSparkline(chartData, 100, 50)} 
                                fill="url(#chartGradient)" 
                                className="transition-all duration-1000 ease-in-out"
                            />
                            <path 
                                d={generateLinePath(chartData, 100, 50)} 
                                fill="none" 
                                stroke="#6366F1" 
                                strokeWidth="2"
                                className="transition-all duration-1000 ease-in-out"
                            />
                        </svg>
                    </div>
                    <div className="w-full text-right relative z-10 pr-2 pb-1">
                        <span className="text-[10px] font-medium text-gray-400 dark:text-indigo-300">30-Day Velocity</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
