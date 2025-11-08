
import React from 'react';

export const AgentIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0118 11c-1.5-1.5-5-2-7-1s-3.5 1.5-5 3c-1.5 1.5-2 4.5-1 7 .5 1.5 1.5 2.5 3 3s2-1 3-2.5a7.999 7.999 0 013.657-3.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 14.121A3 3 0 1014.12 9.88a3 3 0 00-4.242 4.242z" />
    </svg>
);
