
import React from 'react';

export const QuoteIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c1.356 0 2.648-.217 3.863-.636M12 21c-1.356 0-2.648-.217-3.863-.636M12 3c1.356 0 2.648.217 3.863.636M12 3c-1.356 0-2.648.217-3.863.636m16.5 6.083c.328.442.593.91.786 1.403M2.714 11.483c.193-.493.458-.961.786-1.403m15.9 0a9.004 9.004 0 00-8.716-6.747M4.15 11.483a9.004 9.004 0 018.716-6.747" />
  </svg>
);
