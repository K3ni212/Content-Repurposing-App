import React from 'react';
import { ContentPiece, ContentStatus } from '../types';
import { ContentCard } from './ContentCard';

interface KanbanColumnProps {
  status: ContentStatus;
  contentPieces: ContentPiece[];
  onDrop: (contentId: string, targetStatus: ContentStatus) => void;
  onCardClick: (content: ContentPiece) => void;
}

const statusStyles: Record<ContentStatus, { bg: string, text: string, border: string }> = {
    [ContentStatus.Draft]: { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-500', border: 'border-gray-300 dark:border-gray-700' },
    [ContentStatus.Editing]: { bg: 'bg-yellow-500/5 dark:bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/50' },
    [ContentStatus.Approved]: { bg: 'bg-emerald-500/5 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/50' },
    [ContentStatus.ReadyToSchedule]: { bg: 'bg-purple-500/5 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/50' },
    [ContentStatus.Exported]: { bg: 'bg-blue-500/5 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/50' },
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, contentPieces, onDrop, onCardClick }) => {
  const [isOver, setIsOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };
  
  const handleDragLeave = () => {
    setIsOver(false);
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const contentId = e.dataTransfer.getData('contentId');
    if (contentId) {
        onDrop(contentId, status);
    }
    setIsOver(false);
  };

  const style = statusStyles[status];

  return (
    <div className={`w-full md:w-1/5 flex-shrink-0 p-2 ${isOver ? 'bg-blue-100 dark:bg-blue-900/50' : ''} transition-colors rounded-lg`}>
      <div className={`rounded-xl ${style.bg} p-4 h-full flex flex-col`}>
        <h3 className={`font-bold ${style.text} mb-4 pb-2 border-b-2 ${style.border}`}>
            {status} ({contentPieces.length})
        </h3>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="min-h-[200px] flex-grow"
        >
          {contentPieces.length > 0 ? (
            contentPieces.map(content => (
              <ContentCard key={content.id} content={content} onClick={() => onCardClick(content)} />
            ))
           ) : (
             <div className="text-center text-sm text-gray-400 dark:text-gray-500 h-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4">
                Drag cards here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};