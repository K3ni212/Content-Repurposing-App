import React from 'react';

export const ZapierIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M22.5 5.5H19V2h-4v3.5h-5V2H6v3.5H1.5c-.8 0-1.5.7-1.5 1.5v13c0 .8.7 1.5 1.5 1.5h21c.8 0 1.5-.7 1.5-1.5v-13c0-.8-.7-1.5-1.5-1.5zM15 19H9v-2h6v2zm4-4h-5v-2h5v2z" />
    </svg>
);
