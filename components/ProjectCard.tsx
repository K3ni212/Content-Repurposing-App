import React from 'react';
import { Project } from '../types';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface ProjectCardProps {
  project: Project;
  onSelect: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, onDelete }) => {
  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.id);
  }

  return (
    <div
      onClick={() => onSelect(project.id)}
      className="group relative glass-card rounded-2xl p-5 cursor-pointer flex flex-col justify-between h-48 overflow-hidden transition-all duration-300"
    >
      {/* Subtle Gradient Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-indigo-600 dark:text-indigo-400 border border-gray-100 dark:border-white/5 group-hover:bg-white dark:group-hover:bg-white/10 group-hover:shadow-sm transition-all duration-300">
                <BriefcaseIcon className="w-6 h-6"/>
            </div>
            <button
                onClick={handleDelete}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-white/5 rounded-lg transition-all duration-200"
                title="Delete Project"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors duration-300 pr-4">
            {project.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          {project.contentPieces.length} asset{project.contentPieces.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="relative z-10 flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
         <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></div>
             <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{formattedDate}</span>
         </div>
         
         <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
             <div className="bg-gray-100 dark:bg-white/10 p-1.5 rounded-full text-gray-600 dark:text-white">
                 <ArrowRightIcon className="w-3 h-3" />
             </div>
         </div>
      </div>
    </div>
  );
};