
import React from 'react';

export const RobotIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <rect x="4" y="6" width="16" height="14" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 11h.01" strokeWidth={3} />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11h.01" strokeWidth={3} />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 16h6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 13h2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13h2" />
    </svg>
);
