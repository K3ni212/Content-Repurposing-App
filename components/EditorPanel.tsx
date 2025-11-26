
import React, { useState, useEffect, useCallback } from 'react';
import { ContentPiece, ContentStatus, Project, Comment, BrandIntelligence } from '../types';
import { performTextAction, generateImageForContent, expandContentPiece } from '../services/geminiService';
import { calculateComplianceScore } from '../services/governanceService';
import { BrandShieldWidget } from './BrandShieldWidget';
import { StarIcon } from './icons/StarIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SmartReviewAssistant } from './SmartReviewAssistant';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChatIcon } from './icons/ChatIcon';
import { FeatherIcon } from './icons/FeatherIcon';
import { UserIcon } from './icons/UserIcon';
import { ImageIcon } from './icons/ImageIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { v4 as uuidv4 } from 'uuid';

interface EditorPanelProps {
  content: ContentPiece | null;
  onClose: () => void;
  onUpdate: (updatedContent: ContentPiece) => void;
  onDelete: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  groundingMetadata?: any;
  projects: Project[];
  brandIntelligence?: BrandIntelligence;
}

const mockUsers: Record<string, { name: string, avatarColor: string, initials: string }> = {
    'Current User': { name: 'You', avatarColor: 'bg-blue-500', initials: 'YOU' },
    'Alex Doe': { name: 'Alex Doe', avatarColor: 'bg-emerald-500', initials: 'AD' },
    'Jane Smith': { name: 'Jane Smith', avatarColor: 'bg-purple-500', initials: 'JS' },
};

const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 5) return "Just now";
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


export const EditorPanel: React.FC<EditorPanelProps> = ({ content, onClose, onUpdate, onDelete, showToast, groundingMetadata, projects, brandIntelligence }) => {
  const [editedContent, setEditedContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [contentBeforeAction, setContentBeforeAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState('witty');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'comments' | 'visuals'>('edit');
  const [hasRemoteChanges, setHasRemoteChanges] = useState(true);
  
  // Image Gen State
  const [generatedImage, setGeneratedImage] = useState<string | undefined>(undefined);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Progressive State
  const [isOutline, setIsOutline] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);

  // Compliance State
  const [isCompliant, setIsCompliant] = useState(true);


  useEffect(() => {
    if (content) {
      setEditedContent(content.content);
      setIsOutline(!!content.isOutline);
      if (!content.comments || content.comments.length === 0) {
        setComments([
          { id: uuidv4(), author: 'Alex Doe', text: 'Looks great! Maybe we can shorten the intro a bit?', createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
          { id: uuidv4(), author: 'Jane Smith', text: 'Agreed. And let\'s add another CTA at the end.', createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString() }
        ]);
      } else {
        setComments(content.comments);
      }
      setContentBeforeAction(null);
      setRating(0);
      setHoverRating(0);
      setIsSourcesExpanded(true);
      setIsReviewing(false);
      setActiveTab('edit');
      setHasRemoteChanges(true);
      setGeneratedImage(content.imageUrl);
      setImagePrompt(`Create a modern, minimalist social media image for a post titled: "${content.title}". Use abstract shapes and a professional color palette.`);
    }
  }, [content]);
  
  // Check Compliance
  useEffect(() => {
      if (brandIntelligence && editedContent && !isOutline) {
          const result = calculateComplianceScore(editedContent, brandIntelligence);
          setIsCompliant(result.isCompliant);
      } else {
          setIsCompliant(true); // Default pass if no profile or is outline
      }
  }, [editedContent, brandIntelligence, isOutline]);

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

  const handleExpand = async () => {
      if (!content.outlineData) return;
      setIsExpanding(true);
      try {
          // We need the original project source text to expand properly. 
          // For now, we'll assume the project's sourceText is available in the parent scope or via props.
          // In this simplified version, we assume we can access it via the passed projects prop if we find the ID.
          const project = projects.find(p => p.contentPieces.some(cp => cp.id === content.id));
          const sourceText = project ? project.sourceText : ""; 
          const brandVoice = project ? project.brandVoice : "Professional";

          const expandedText = await expandContentPiece(content.outlineData, sourceText, brandVoice, brandIntelligence);
          setEditedContent(expandedText);
          setIsOutline(false);
          
          onUpdate({ ...content, content: expandedText, isOutline: false });
          showToast("Content expanded successfully!", "success");
      } catch (e) {
          showToast("Failed to expand content.", "error");
      } finally {
          setIsExpanding(false);
      }
  };

  const handleSave = () => {
    onUpdate({ ...content, content: editedContent, comments, imageUrl: generatedImage });
    showToast('Changes saved successfully!', 'success');
    onClose();
  };
  
  const handleApprove = () => {
    if (!isCompliant) {
        showToast('Cannot approve: Brand compliance failed.', 'error');
        return;
    }
    onUpdate({ ...content, content: editedContent, comments, status: ContentStatus.Approved, imageUrl: generatedImage });
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
    if (!isCompliant) {
        showToast('Cannot export: Brand compliance failed.', 'error');
        return;
    }
    onUpdate({ ...content, content: editedContent, comments, status: ContentStatus.ReadyToSchedule, imageUrl: generatedImage });
    showToast('Added to export queue!', 'success');
    onClose();
  }
  
  const handleMarkAsExported = () => {
    onUpdate({ ...content, content: editedContent, comments, status: ContentStatus.Exported, imageUrl: generatedImage });
    showToast('Content marked as exported!', 'success');
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to permanently delete this content piece?')) {
      onDelete();
    }
  };

  const handleAcceptReview = (newContent: string) => {
    setEditedContent(newContent);
    onUpdate({ ...content, content: newContent, status: ContentStatus.Editing });
    showToast('Revisions applied successfully!', 'success');
  };
  
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
        id: uuidv4(),
        author: 'Current User',
        text: newComment,
        createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const handleGenerateImage = async () => {
      if (!imagePrompt.trim()) return;
      setIsGeneratingImage(true);
      try {
          const base64Image = await generateImageForContent(imagePrompt);
          setGeneratedImage(base64Image);
          showToast('Image generated successfully!', 'success');
      } catch (error) {
          showToast('Failed to generate image. Please try again.', 'error');
      } finally {
          setIsGeneratingImage(false);
      }
  };

  const renderEditTab = () => (
     <>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{content.title}</h3>
          <button 
                onClick={() => setIsReviewing(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/50 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                disabled={isOutline}
            >
                <SparklesIcon className="w-4 h-4" />
                Smart Review
            </button>
        </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
          {content.format}
          {isOutline && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Outline Mode</span>}
      </p>

      <div className="relative w-full flex flex-col md:flex-row gap-4">
        <div className="flex-1">
            <textarea
                className="w-full h-[400px] p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-600 focus:outline-none resize-y"
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
                disabled={isLoading || isExpanding}
                readOnly={isOutline}
            />
            {isOutline && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center backdrop-blur-[1px]">
                    <button 
                        onClick={handleExpand}
                        disabled={isExpanding}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                    >
                        {isExpanding ? <SpinnerIcon className="w-5 h-5"/> : <SparklesIcon className="w-5 h-5"/>}
                        {isExpanding ? 'Writing Content...' : 'Generate Full Draft'}
                    </button>
                </div>
            )}
        </div>
        
        {/* Brand Shield Sidebar */}
        {!isOutline && brandIntelligence && (
            <div className="w-full md:w-72 shrink-0">
                <BrandShieldWidget text={editedContent} profile={brandIntelligence} />
            </div>
        )}
      </div>

      <div className="text-right text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">{editedContent.length} characters</div>
      
      {!isOutline && (
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
      )}
      
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

      {!isOutline && (
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
      )}
    </>
  );
  
  const renderCommentsTab = () => (
    <div className="flex flex-col h-full">
        <div className="flex-grow overflow-y-auto space-y-4 pr-2">
            {comments.length > 0 ? comments.map(comment => {
                const user = mockUsers[comment.author] || { name: comment.author, avatarColor: 'bg-gray-500', initials: comment.author.substring(0,2) };
                const isCurrentUser = comment.author === 'Current User';
                return (
                    <div key={comment.id} className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
                        {!isCurrentUser && (
                            <div className={`w-8 h-8 rounded-full ${user.avatarColor} text-white flex items-center justify-center flex-shrink-0 text-xs font-bold`}>
                                {user.initials}
                            </div>
                        )}
                        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">{user.name}</span>
                                <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
                            </div>
                            <p className={`text-sm p-3 rounded-2xl mt-1 max-w-xs ${isCurrentUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700/50 rounded-bl-none'}`}>{comment.text}</p>
                        </div>
                         {isCurrentUser && (
                            <div className={`w-8 h-8 rounded-full ${user.avatarColor} text-white flex items-center justify-center flex-shrink-0 text-xs font-bold`}>
                                {user.initials}
                            </div>
                        )}
                    </div>
                );
            }) : (
                <div className="text-center py-10">
                    <ChatIcon className="mx-auto h-12 w-12 text-gray-400"/>
                    <h4 className="mt-2 font-semibold">No comments yet</h4>
                    <p className="text-sm text-gray-500">Be the first to leave feedback!</p>
                </div>
            )}
        </div>
        <div className="mt-4 flex items-start gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <button onClick={handleAddComment} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 h-full">Send</button>
        </div>
    </div>
  );

  const renderVisualsTab = () => (
      <div className="flex flex-col h-full">
          <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">AI Image Studio</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Generate visuals to accompany your post.</p>
          </div>

          <div className="flex-grow flex flex-col gap-4">
              <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden relative group min-h-[250px]">
                  {generatedImage ? (
                      <>
                        <img src={`data:image/png;base64,${generatedImage}`} alt="Generated" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <a 
                                href={`data:image/png;base64,${generatedImage}`} 
                                download={`visual-${content.id}.png`}
                                className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100"
                            >
                                Download Image
                            </a>
                        </div>
                      </>
                  ) : isGeneratingImage ? (
                      <div className="text-center">
                          <SpinnerIcon className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 animate-pulse">Generating image...</p>
                      </div>
                  ) : (
                      <div className="text-center text-gray-400">
                          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No image generated yet</p>
                      </div>
                  )}
              </div>

              <div className="space-y-3">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Image Prompt</label>
                      <textarea 
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                          rows={3}
                          placeholder="Describe the image you want to generate..."
                      />
                  </div>
                  <button 
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage || !imagePrompt.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2.5 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                      <SparklesIcon className="w-4 h-4" />
                      {isGeneratingImage ? 'Dreaming...' : generatedImage ? 'Regenerate Image' : 'Generate Image'}
                  </button>
              </div>
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={onClose}>
      <div
        className="fixed top-0 right-0 h-full w-full max-w-4xl bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{isReviewing ? 'Smart Review Assistant' : 'Edit Content'}</h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
                <div className="flex -space-x-2 overflow-hidden mr-2">
                    <div title="Alex Doe" className="inline-block h-7 w-7 rounded-full text-white bg-emerald-500 ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-xs font-bold">AD</div>
                    <div title="Jane Smith" className="inline-block h-7 w-7 rounded-full text-white bg-purple-500 ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-xs font-bold">JS</div>
                </div>
            </div>
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
        
        {isReviewing ? (
          <SmartReviewAssistant
              originalContent={editedContent}
              projects={projects}
              onAccept={handleAcceptReview}
              onClose={() => setIsReviewing(false)}
              showToast={showToast}
          />
        ) : (
          <>
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 flex justify-between items-center">
                <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar">
                    <button onClick={() => setActiveTab('edit')} className={`relative flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium whitespace-nowrap ${activeTab === 'edit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-200 dark:hover:border-gray-500'}`}>
                        <FeatherIcon className="w-4 h-4"/> 
                        Editor
                        {hasRemoteChanges && (
                            <span className="absolute top-2 right-[-6px] flex h-2 w-2" title="Team updates available">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                        )}
                    </button>
                    <button onClick={() => setActiveTab('comments')} className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium whitespace-nowrap ${activeTab === 'comments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-200 dark:hover:border-gray-500'}`}>
                       <ChatIcon className="w-4 h-4"/> Collaboration ({comments.length})
                    </button>
                    <button onClick={() => setActiveTab('visuals')} className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium whitespace-nowrap ${activeTab === 'visuals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-200 dark:hover:border-gray-500'}`}>
                       <ImageIcon className="w-4 h-4"/> Visuals
                    </button>
                </nav>
                <button 
                    onClick={() => showToast("Invite to collaborate feature coming soon!", "success")}
                    className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition-all shrink-0"
                    title="Add team member"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
          
            <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                {activeTab === 'edit' ? renderEditTab() : activeTab === 'comments' ? renderCommentsTab() : renderVisualsTab()}
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
                        <button 
                            onClick={handleApprove} 
                            disabled={!isCompliant || isOutline}
                            className={`flex-1 text-white font-bold py-3 px-4 rounded-md transition-colors ${!isCompliant || isOutline ? 'bg-emerald-300 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                        >
                            {isOutline ? 'Drafting...' : isCompliant ? 'Approve' : 'Fix Issues'}
                        </button>
                        <button 
                            onClick={handleAddToExportQueue} 
                            disabled={!isCompliant || isOutline}
                            className={`flex-1 text-white font-bold py-3 px-4 rounded-md transition-colors ${!isCompliant || isOutline ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            Add to Export Queue
                        </button>
                    </>
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
