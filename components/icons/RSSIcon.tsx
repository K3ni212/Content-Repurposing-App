import React from 'react';

export const RSSIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5h-.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 5.25v-.75a2.25 2.25 0 00-2.25-2.25h-.75a2.25 2.25 0 00-2.25 2.25v.75m6 14.25a2.25 2.25 0 01-2.25-2.25v-.75a2.25 2.25 0 012.25-2.25h.75a2.25 2.25 0 012.25 2.25v.75a2.25 2.25 0 01-2.25 2.25h-.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75a9 9 0 019-9h.75a9 9 0 019 9v.75a9 9 0 01-9 9h-.75a9 9 0 01-9-9v-.75z" />
    </svg>
);