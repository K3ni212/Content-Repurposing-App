import React from 'react';

export const SkeletonDashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden lg:block p-4 space-y-4">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8"></div>
        {[...Array(6)].map((_, i) => (
           <div key={i} className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {/* Header Skeleton */}
        <div className="h-20 bg-white/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
           <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
           <div className="h-10 w-96 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse hidden md:block"></div>
           <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        </div>

        {/* Main Content Skeleton */}
        <div className="p-8 flex-1 overflow-y-auto">
            <div className="flex justify-between mb-8">
                <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            
            <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-8"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-48 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4">
                        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-4"></div>
                    </div>
                 ))}
            </div>
        </div>
      </div>
    </div>
  );
};