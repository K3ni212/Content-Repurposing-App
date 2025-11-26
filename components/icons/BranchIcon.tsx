import React from 'react';

export const BranchIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v4a3 3 0 003 3h6a3 3 0 003-3V3M6 21v-4a3 3 0 013-3h6a3 3 0 013 3v4M12 10v4" />
    </svg>
);