import React from 'react';

export const MicrosoftIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M11.4 21.9L3.1 21.9L3.1 14.1L11.4 14.1L11.4 21.9ZM11.4 11.4L3.1 11.4L3.1 3.6L11.4 3.6L11.4 11.4ZM21.9 21.9L14.1 21.9L14.1 14.1L21.9 14.1L21.9 21.9ZM21.9 11.4L14.1 11.4L14.1 3.6L21.9 3.6L21.9 11.4Z" />
    </svg>
);