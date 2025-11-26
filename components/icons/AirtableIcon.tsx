import React from 'react';

export const AirtableIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3.3 12.3L12 17.7l8.7-5.4-8.7-5.4L3.3 12.3zm-1.8 1.4L12 19.8l10.5-6.1-2.1-1.3L12 17.2l-8.4-4.9-2.1 1.3zM12 2.2L22.5 8.3 12 14.4 1.5 8.3 12 2.2z" />
    </svg>
);
