import React from 'react';

export const ThumbsDownIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.484.062l4.256 1.65A2 2 0 0118 6.354V12a2 2 0 01-2 2h-4m-2 4h2m-4-4v4m-2-4-1.612 3.225a2 2 0 001.612 2.775H10m-2-4h2m-2 4h2m-4 4v-4m0 4H5a2 2 0 01-2-2v-2.5" />
    </svg>
);
