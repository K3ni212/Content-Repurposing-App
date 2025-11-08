import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onSelect: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, onDelete }) => {
  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the project "${project.name}"?`)) {
        onDelete(project.id);
    }
  }

  return (
    <div
      onClick={() => onSelect(project.id)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md hover:shadow-blue-600/10 hover:-translate-y-1 transition-all duration-200 ease-in-out flex flex-col justify-between"
    >
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">{project.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {project.contentPieces.length} content piece{project.contentPieces.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 font-mono">Created on {formattedDate}</p>
      </div>
       <div className="mt-4 flex justify-end">
            <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 text-xs font-semibold"
            >
                Delete
            </button>
        </div>
    </div>
  );
};