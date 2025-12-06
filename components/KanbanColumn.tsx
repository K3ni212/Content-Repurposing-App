
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
    <div className={`w-full md:w-1/5 flex-shrink-0 p-2 transition-all duration-300 ${isOver ? 'scale-[1.01]' : ''}`}>
      <div className={`rounded-2xl glass-panel h-full flex flex-col p-4 transition-colors duration-300 ${isOver ? 'bg-white/10 border-indigo-500/50' : ''}`}>
        <h3 className="font-bold text-gray-200 mb-4 pb-2 border-b border-white/10 flex items-center justify-between">
            <span>{status}</span>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-400">{contentPieces.length}</span>
        </h3>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="min-h-[200px] flex-grow space-y-3"
        >
          {contentPieces.length > 0 ? (
            contentPieces.map(content => (
              <ContentCard key={content.id} content={content} onClick={() => onCardClick(content)} />
            ))
           ) : (
             <div className="text-center text-sm text-gray-500 h-full flex items-center justify-center border border-dashed border-white/10 rounded-xl p-4 min-h-[150px]">
                Drag cards here
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
