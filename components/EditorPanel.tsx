import React, { useState, useEffect, useCallback } from 'react';
import { ContentPiece, ContentStatus } from '../types';
import { performTextAction } from '../services/geminiService';
import { StarIcon } from './icons/StarIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';


interface EditorPanelProps {
  content: ContentPiece | null;
  onClose: () => void;
  onUpdate: (updatedContent: ContentPiece) => void;
  onDelete: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  groundingMetadata?: any;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ content, onClose, onUpdate, onDelete, showToast, groundingMetadata }) => {
  const [editedContent, setEditedContent] = useState('');
  const [contentBeforeAction, setContentBeforeAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState('witty');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(true);


  useEffect(() => {
    if (content) {
      setEditedContent(content.content);
      setContentBeforeAction(null);
      setRating(0);
      setHoverRating(0);
      setIsSourcesExpanded(true);
    }
  }, [content]);
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);


  if (!content) return null;

  const handleAction = async (action: 'rephrase' | 'shorten' | 'expand' | 'cta' | 'hashtags') => {
    setIsLoading(true);
    setContentBeforeAction(editedContent);
    try {
        const newText = await performTextAction(action, editedContent, tone);
        if (action === 'cta' || action === 'hashtags') {
            setEditedContent(prev => `${prev}\n\n${newText}`);
        } else {
            setEditedContent(newText);
        }
    } catch (error) {
        console.error("Action failed:", error);
        showToast(`Failed to perform action: ${action}`, 'error');
    } finally {
        setIsLoading(false);
    }
  };

  const handleSave = () => {
    onUpdate({ ...content, content: editedContent });
    showToast('Changes saved successfully!', 'success');
    onClose();
  };
  
  const handleApprove = () => {
    onUpdate({ ...content, content: editedContent, status: ContentStatus.Approved });
    showToast('Content approved!', 'success');
    onClose();
  }

  const handleUndo = () => {
    if (contentBeforeAction !== null) {
      setEditedContent(contentBeforeAction);
      setContentBeforeAction(null);
    }
  };
  
  const handleAddToExportQueue = () => {
    onUpdate({ ...content, content: editedContent, status: ContentStatus.ReadyToSchedule });
    showToast('Added to export queue!', 'success');
    onClose();
  }
  
  const handleMarkAsExported = () => {
    onUpdate({ ...content, content: editedContent, status: ContentStatus.Exported });
    showToast('Content marked as exported!', 'success');
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to permanently delete this content piece?')) {
      onDelete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={onClose}>
      <div
        className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Content</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleDelete} 
              className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              aria-label="Delete content piece"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-3xl leading-none">&times;</button>
          </div>
        </div>
        
        <div className="flex-grow p-6 overflow-y-auto">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{content.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{content.format}</p>

          <textarea
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            value={editedContent}
            onChange={e => setEditedContent(e.target.value)}
            disabled={isLoading}
          />

          <div className="text-right text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">{editedContent.length} characters</div>
          
          <div className="mt-2 flex justify-between items-center">
             <button onClick={handleUndo} disabled={contentBeforeAction === null} className="text-sm text-blue-600 hover:underline disabled:opacity-50 disabled:no-underline">Undo Last Action</button>
             <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Rate this generation:</span>
                <div className="flex" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map((starIndex) => {
                        const isFilled = (hoverRating || rating) >= starIndex;
                        return (
                            <button
                                key={starIndex}
                                type="button"
                                onClick={() => setRating(starIndex)}
                                onMouseEnter={() => setHoverRating(starIndex)}
                                className={`p-0.5 ${isFilled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} transition-colors`}
                                aria-label={`Rate ${starIndex} out of 5 stars`}
                            >
                                <StarIcon
                                    className="w-5 h-5"
                                    filled={isFilled}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>
          </div>
          
           {groundingMetadata?.groundingChunks?.length > 0 && (
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex justify-between items-center">
                        <div
                            className="flex items-center gap-2 cursor-pointer flex-grow"
                            onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
                        >
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                Sources from Google Search ({groundingMetadata.groundingChunks.filter((c:any) => c.web).length})
                            </h4>
                        </div>
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    showToast('Adding new sources is coming soon!', 'success');
                                }}
                                className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                                aria-label="Add new source"
                            >
                                <PlusIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                                aria-label={isSourcesExpanded ? "Collapse sources" : "Expand sources"}
                            >
                                {isSourcesExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                            </button>
                        </div>
                  </div>
                  {isSourcesExpanded && (
                      <ul className="space-y-1 mt-2">
                          {groundingMetadata.groundingChunks.map((chunk: any, index: number) => (
                              chunk.web ? (
                                  <li key={index} className="text-xs">
                                      <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate block">
                                          {index + 1}. {chunk.web.title || chunk.web.uri}
                                      </a>
                                  </li>
                              ) : null
                          ))}
                      </ul>
                  )}
              </div>
          )}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2 flex items-center gap-2">
                <label htmlFor="tone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Tone:</label>
                <select id="tone" value={tone} onChange={e => setTone(e.target.value)} className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-blue-600 focus:border-blue-600 text-sm">
                    <option value="witty">Witty</option>
                    <option value="expert">Expert</option>
                    <option value="formal">Formal</option>
                    <option value="casual">Casual</option>
                </select>
                <button onClick={() => handleAction('rephrase')} disabled={isLoading} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 disabled:opacity-50 text-sm">Rephrase</button>
            </div>
            
            <button onClick={() => handleAction('shorten')} disabled={isLoading} className="w-full text-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50">Shorten</button>
            <button onClick={() => handleAction('expand')} disabled={isLoading} className="w-full text-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50">Expand</button>
            <button onClick={() => handleAction('cta')} disabled={isLoading} className="w-full text-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50">CTA Ideas</button>
            <button onClick={() => handleAction('hashtags')} disabled={isLoading} className="w-full text-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50">Hashtags</button>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50 flex flex-col sm:flex-row gap-4">
            {content.status === ContentStatus.ReadyToSchedule ? (
                <>
                    <button onClick={handleSave} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-md transition-colors">Save & Close</button>
                    <button onClick={handleMarkAsExported} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors">Mark as Exported</button>
                </>
            ) : (
                <>
                    <button onClick={handleSave} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-md transition-colors">Save & Close</button>
                    <button onClick={handleApprove} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-md transition-colors">Approve</button>
                    <button onClick={handleAddToExportQueue} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors">Add to Export Queue</button>
                </>
            )}
        </div>
      </div>
    </div>
  );
};