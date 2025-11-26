import React from 'react';

export const MarketplaceIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.25a.75.75 0 01-.75-.75v-7.5c0-.414.336-.75.75-.75h11.25c.414 0 .75.336.75.75v7.5a.75.75 0 01-.75.75m-4.5 0v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12v-.75a.75.75 0 01.75-.75h17.25c.414 0 .75.336.75.75v.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v2.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 3v2.25" />
    </svg>
);
