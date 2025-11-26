import React from 'react';

export const CollaborationIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.289 2.72a3 3 0 01-4.682-2.72 9.094 9.094 0 013.741-.479m-4.26 1.22A9.095 9.095 0 0112 11.67a9.095 9.095 0 015.528 2.347m-11.056 0a3 3 0 11-4.682 2.72 9.094 9.094 0 013.741-.479m10.536 0a3 3 0 114.682 2.72 9.094 9.094 0 00-3.741-.479M12 11.67a9.095 9.095 0 01-5.528 2.347m11.056 0a9.095 9.095 0 00-5.528-2.347m0 0a9.095 9.095 0 005.528 2.347m-11.056 0a9.095 9.095 0 005.528-2.347m0 0a9.095 9.095 0 01-5.528 2.347m11.056 0a9.095 9.095 0 01-5.528-2.347M12 3.75a3 3 0 100 6 3 3 0 000-6z" />
    </svg>
);
