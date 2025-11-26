
import React, { useMemo } from 'react';
import { calculateComplianceScore } from '../services/governanceService';
import { BrandProfile } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { XCloseIcon } from './icons/XCloseIcon';

interface BrandShieldWidgetProps {
    text: string;
    profile?: BrandProfile;
}

export const BrandShieldWidget: React.FC<BrandShieldWidgetProps> = ({ text, profile }) => {
    // Default profile if none provided
    const safeProfile: BrandProfile = profile || {
        voice_rules: [],
        forbidden_terms: ['synergy', 'disrupt', 'innovative', 'guru'],
        compliance_threshold: 70,
        default_cta: 'Click the link'
    };

    const compliance = useMemo(() => calculateComplianceScore(text, safeProfile), [text, safeProfile]);

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-emerald-500 stroke-emerald-500';
        if (score >= 70) return 'text-yellow-500 stroke-yellow-500';
        return 'text-red-500 stroke-red-500';
    };

    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (compliance.score / 100) * circumference;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    Brand Shield
                </h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${compliance.isCompliant ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                    {compliance.isCompliant ? 'PASS' : 'FAIL'}
                </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
                {/* Gauge Chart */}
                <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                        <circle 
                            cx="40" 
                            cy="40" 
                            r={radius} 
                            stroke="currentColor" 
                            strokeWidth="6" 
                            fill="transparent" 
                            strokeDasharray={circumference} 
                            strokeDashoffset={strokeDashoffset} 
                            className={`transition-all duration-1000 ease-out ${getScoreColor(compliance.score)}`} 
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className={`absolute text-lg font-bold ${getScoreColor(compliance.score).split(' ')[0]}`}>
                        {compliance.score}
                    </span>
                </div>
                <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Brand Alignment Score</p>
                    <p className="text-[10px] text-gray-400 mt-1">Threshold: {safeProfile.compliance_threshold}%</p>
                </div>
            </div>

            {compliance.violations.length > 0 && (
                <div className="mb-3">
                    <p className="text-xs font-semibold text-red-500 mb-1">Violations Found:</p>
                    <ul className="space-y-1">
                        {compliance.violations.map((v, i) => (
                            <li key={i} className="text-[10px] text-red-600 dark:text-red-400 flex items-start gap-1">
                                <XCloseIcon className="w-3 h-3 mt-0.5 shrink-0"/> {v}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {compliance.suggestions.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Suggestions:</p>
                    <ul className="space-y-1">
                        {compliance.suggestions.map((s, i) => (
                            <li key={i} className="text-[10px] text-gray-600 dark:text-gray-300 flex items-start gap-1">
                                <div className="w-1 h-1 bg-yellow-400 rounded-full mt-1.5 shrink-0"></div> {s}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {compliance.isCompliant && compliance.violations.length === 0 && compliance.suggestions.length === 0 && (
                <div className="text-center py-2">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                        <CheckIcon className="w-4 h-4"/> Brand Safe
                    </p>
                </div>
            )}
        </div>
    );
};
