
import React from 'react';

export const ProjectEmptyState: React.FC = () => (
    <div className="text-center py-16">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800">
             <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        </div>
        <h3 className="mt-6 text-xl font-semibold text-gray-800 dark:text-white">No projects yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Create your first project using the button above to start repurposing content.</p>
    </div>
);
