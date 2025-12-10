import React from 'react';
import { ContentPiece, ContentStatus } from '../types';
import { ContentCard } from './ContentCard';

interface KanbanColumnProps {
  status: ContentStatus;
  contentPieces: ContentPiece[];
  onDrop: (contentId: string, targetStatus: ContentStatus) => void;
  onCardClick: (content: ContentPiece) => void;
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

  return (
    <div className="w-[320px] flex-shrink-0 flex flex-col h-full">
      <div className={`glass-panel rounded-2xl flex flex-col p-3 h-full transition-colors duration-300 bg-gray-100/50 dark:bg-[#151725]/50 border border-gray-200 dark:border-white/5 ${isOver ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30' : ''}`}>
        <div className="flex items-center justify-between px-2 py-3 mb-2">
            <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${status === 'Draft' ? 'bg-gray-400' : status === 'Approved' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
                {status}
            </h3>
            <span className="text-[10px] font-bold bg-white dark:bg-white/10 px-2 py-0.5 rounded-full text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-transparent">{contentPieces.length}</span>
        </div>
        
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="flex-grow overflow-y-auto custom-scrollbar px-1 pb-2 space-y-1"
        >
          {contentPieces.length > 0 ? (
            contentPieces.map(content => (
              <ContentCard key={content.id} content={content} onClick={() => onCardClick(content)} />
            ))
           ) : (
             <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-white/5 rounded-xl m-1 bg-white/30 dark:bg-white/5">
                <span className="text-xs text-gray-400 dark:text-gray-600 font-medium">Empty</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};