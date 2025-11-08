import React from 'react';

export const ThumbsUpIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.018a2 2 0 01-1.484-.62l-4.256-4.256a2 2 0 01-.56-1.414V6.354a2 2 0 012-2h4a2 2 0 012 2v4z" />
    </svg>
);
