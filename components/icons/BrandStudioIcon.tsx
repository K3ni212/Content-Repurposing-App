import React from 'react';

export const BrandStudioIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.402-6.402a3.75 3.75 0 00-5.304-5.304L4.098 14.6a3.75 3.75 0 000 5.304z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-4.5 4.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 12.75L15 15" />
    </svg>
);