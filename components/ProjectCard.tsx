
import React from 'react';
import { Project } from '../types';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ProjectCardProps {
  project: Project;
  onSelect: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, onDelete }) => {
  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
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
      className="group relative bg-white dark:bg-[#151725] rounded-2xl p-6 cursor-pointer border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 ease-out flex flex-col justify-between h-48 hover:-translate-y-1 active:scale-[0.99] animate-scale-in"
    >
      <div>
        <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-900/30 dark:group-hover:text-indigo-400 transition-colors duration-300">
                <BriefcaseIcon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"/>
            </div>
            <button
                onClick={handleDelete}
                className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300"
                title="Delete Project"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
            {project.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          {project.contentPieces.length} asset{project.contentPieces.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
         <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{formattedDate}</span>
         {project.goal && (
             <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md group-hover:bg-indigo-100 group-hover:text-indigo-700 dark:group-hover:bg-indigo-900/50 dark:group-hover:text-indigo-300 transition-colors duration-300">
                 {project.goal.split(' ')[0]}
             </span>
         )}
      </div>
    </div>
  );
};