import React from 'react';

export const VoiceCheckIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3m12 0h3m-9-9v3m0 12v3m-4.5-13.5l2.121 2.121M16.5 16.5l2.121 2.121M6.379 16.5L8.5 14.379M18.621 8.5L16.5 6.379" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6.75 6.75 0 100-13.5 6.75 6.75 0 000 13.5z" />
    </svg>
);