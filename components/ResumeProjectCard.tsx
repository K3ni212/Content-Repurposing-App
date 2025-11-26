import React from 'react';
import { Project } from '../types';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface ResumeProjectCardProps {
  project: Project;
  onSelect: (projectId: string) => void;
}

export const ResumeProjectCard: React.FC<ResumeProjectCardProps> = ({ project, onSelect }) => {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div
      onClick={() => onSelect(project.id)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md hover:shadow-blue-600/10 transition-all duration-200 ease-in-out flex items-center justify-between mb-8 border border-gray-200 dark:border-gray-700"
    >
      <div>
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">RESUME PROJECT</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{project.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last updated {timeAgo(project.lastModified)}
        </p>
      </div>
      <button className="bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full p-3 hover:bg-blue-600/20">
        <ArrowRightIcon className="w-6 h-6"/>
      </button>
    </div>
  );
};
