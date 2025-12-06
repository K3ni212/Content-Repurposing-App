
import React, { useState, useEffect, useCallback } from 'react';
import { ContentPiece, ContentStatus, Project, Comment, BrandIntelligence } from '../types';
import { performTextAction, generateImageForContent, expandContentPiece } from '../services/geminiService';
import { calculateComplianceScore } from '../services/governanceService';
import { BrandShieldWidget } from './BrandShieldWidget';
import { StarIcon } from './icons/StarIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SmartReviewAssistant } from './SmartReviewAssistant';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChatIcon } from './icons/ChatIcon';
import { FeatherIcon } from './icons/FeatherIcon';
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
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white">{content.title}</h3>
          <button 
                onClick={() => setIsReviewing(true)}
                className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full hover:from-indigo-500 hover:to-violet-500 transition-all shadow-glow animate-pulse-glow"
                disabled={isOutline}
            >
                <SparklesIcon className="w-3 h-3" />
                Smart Review
            </button>
        </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
          {content.format}
          {isOutline && <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/30">Outline Mode</span>}
      </p>

      <div className="relative w-full flex flex-col md:flex-row gap-6">
        <div className="flex-1">
            <textarea
                className="w-full h-[500px] p-6 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-gray-50 dark:bg-[#0F1119] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:outline-none resize-none font-sans leading-relaxed shadow-inner"
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
                disabled={isLoading || isExpanding}
                readOnly={isOutline}
            />
            {isOutline && (
                <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
                    <button 
                        onClick={handleExpand}
                        disabled={isExpanding}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl shadow-glow-lg transform hover:scale-105 transition-all flex items-center gap-3 animate-bounce"
                    >
                        {isExpanding ? <SpinnerIcon className="w-6 h-6"/> : <SparklesIcon className="w-6 h-6"/>}
                        {isExpanding ? 'Writing Content...' : 'Generate Full Draft'}
                    </button>
                </div>
            )}
        </div>
        
        {/* Brand Shield Sidebar - High Contrast Panel */}
        {!isOutline && brandIntelligence && (
            <div className="w-full md:w-80 shrink-0">
                <BrandShieldWidget text={editedContent} profile={brandIntelligence} />
            </div>
        )}
      </div>

      <div className="text-right text-xs text-gray-500 mt-2 font-mono">{editedContent.length} characters</div>
      
      {!isOutline && (
          <div className="mt-4 flex justify-between items-center">
             <button onClick={handleUndo} disabled={contentBeforeAction === null} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed">Undo Last Action</button>
             <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-medium">Rate Quality:</span>
                <div className="flex" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map((starIndex) => {
                        const isFilled = (hoverRating || rating) >= starIndex;
                        return (
                            <button
                                key={starIndex}
                                type="button"
                                onClick={() => setRating(starIndex)}
                                onMouseEnter={() => setHoverRating(starIndex)}
                                className={`p-0.5 ${isFilled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-700'} transition-colors`}
                            >
                                <StarIcon
                                    className="w-4 h-4"
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
          <div className="mt-6 p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl backdrop-blur-sm">
              <div className="flex justify-between items-center">
                    <div
                        className="flex items-center gap-2 cursor-pointer flex-grow"
                        onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
                    >
                        <h4 className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Sources from Google Search ({groundingMetadata.groundingChunks.filter((c:any) => c.web).length})
                        </h4>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
                        >
                            {isSourcesExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                        </button>
                    </div>
              </div>
              {isSourcesExpanded && (
                  <ul className="space-y-2 mt-3">
                      {groundingMetadata.groundingChunks.map((chunk: any, index: number) => (
                          chunk.web ? (
                              <li key={index} className="text-xs">
                                  <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline truncate block flex items-center gap-2">
                                      <span className="w-4 h-4 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center text-[8px] text-gray-600 dark:text-gray-300">{index + 1}</span> {chunk.web.title || chunk.web.uri}
                                  </a>
                              </li>
                          ) : null
                      ))}
                  </ul>
              )}
          </div>
      )}

      {!isOutline && (
          <div className="mt-8">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">AI Editor Tools</label>
            <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-lg border border-gray-200 dark:border-white/10 mr-2">
                    <select id="tone" value={tone} onChange={e => setTone(e.target.value)} className="bg-transparent text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 focus:outline-none cursor-pointer">
                        <option value="witty">Tone: Witty</option>
                        <option value="expert">Tone: Expert</option>
                        <option value="formal">Tone: Formal</option>
                        <option value="casual">Tone: Casual</option>
                    </select>
                    <button onClick={() => handleAction('rephrase')} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50">Apply</button>
                </div>
                
                {['shorten', 'expand', 'cta', 'hashtags'].map((action) => (
                    <button 
                        key={action}
                        onClick={() => handleAction(action as any)} 
                        disabled={isLoading} 
                        className="bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50 text-xs capitalize"
                    >
                        {action === 'cta' ? 'CTA Ideas' : action}
                    </button>
                ))}
            </div>
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
                            <div className={`w-8 h-8 rounded-full ${user.avatarColor} text-white flex items-center justify-center flex-shrink-0 text-xs font-bold border-2 border-white dark:border-gray-800`}>
                                {user.initials}
                            </div>
                        )}
                        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-xs text-gray-700 dark:text-gray-300">{user.name}</span>
                                <span className="text-[10px] text-gray-500">{timeAgo(comment.createdAt)}</span>
                            </div>
                            <p className={`text-sm p-3 rounded-2xl max-w-xs leading-relaxed ${isCurrentUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-700'}`}>{comment.text}</p>
                        </div>
                         {isCurrentUser && (
                            <div className={`w-8 h-8 rounded-full ${user.avatarColor} text-white flex items-center justify-center flex-shrink-0 text-xs font-bold border-2 border-white dark:border-gray-800`}>
                                {user.initials}
                            </div>
                        )}
                    </div>
                );
            }) : (
                <div className="text-center py-20">
                    <ChatIcon className="mx-auto h-12 w-12 text-gray-400 mb-3 opacity-50"/>
                    <h4 className="font-bold text-gray-500 dark:text-gray-400">No comments yet</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Start the conversation with your team.</p>
                </div>
            )}
        </div>
        <div className="mt-4 flex items-start gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
            <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-sm"
            />
            <button onClick={handleAddComment} className="bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-500 font-bold text-sm h-full transition-colors">Send</button>
        </div>
    </div>
  );

  const renderVisualsTab = () => (
      <div className="flex flex-col h-full">
          <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">AI Image Studio</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Generate visuals to accompany your post.</p>
          </div>

          <div className="flex-grow flex flex-col gap-6">
              <div className="flex-1 bg-gray-100 dark:bg-black/40 rounded-2xl border border-gray-200 dark:border-gray-700/50 flex items-center justify-center overflow-hidden relative group min-h-[300px]">
                  {generatedImage ? (
                      <>
                        <img src={`data:image/png;base64,${generatedImage}`} alt="Generated" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                            <a 
                                href={`data:image/png;base64,${generatedImage}`} 
                                download={`visual-${content.id}.png`}
                                className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-100 shadow-lg transform hover:scale-105 transition-all"
                            >
                                Download Image
                            </a>
                        </div>
                      </>
                  ) : isGeneratingImage ? (
                      <div className="text-center">
                          <SpinnerIcon className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
                          <p className="text-sm text-indigo-500 dark:text-indigo-400 animate-pulse font-medium">Dreaming up your image...</p>
                      </div>
                  ) : (
                      <div className="text-center text-gray-400 dark:text-gray-600">
                          <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No image generated yet</p>
                      </div>
                  )}
              </div>

              <div className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Image Prompt</label>
                      <textarea 
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-inner"
                          rows={3}
                          placeholder="Describe the image you want to generate..."
                      />
                  </div>
                  <button 
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage || !imagePrompt.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                      <SparklesIcon className="w-5 h-5" />
                      {isGeneratingImage ? 'Dreaming...' : generatedImage ? 'Regenerate Image' : 'Generate Image'}
                  </button>
              </div>
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-[60] flex justify-end" onClick={onClose}>
      <div
        className="h-full w-full max-w-5xl bg-white dark:bg-[#151725] border-l border-gray-200 dark:border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{isReviewing ? 'Smart Review Assistant' : 'Editor'}</h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-200 dark:bg-black/20 rounded-full px-3 py-1 border border-gray-300 dark:border-white/5">
                <div className="flex -space-x-2 overflow-hidden mr-2">
                    <div title="Alex Doe" className="inline-block h-6 w-6 rounded-full text-white bg-emerald-600 ring-2 ring-white dark:ring-[#0B0C15] flex items-center justify-center text-[10px] font-bold">AD</div>
                    <div title="Jane Smith" className="inline-block h-6 w-6 rounded-full text-white bg-purple-600 ring-2 ring-white dark:ring-[#0B0C15] flex items-center justify-center text-[10px] font-bold">JS</div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Editing</span>
            </div>
            <div className="h-6 w-px bg-gray-300 dark:bg-white/10 mx-2"></div>
            <button 
              onClick={handleDelete} 
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              title="Delete"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
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
            <div className="border-b border-gray-200 dark:border-white/10 px-8 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => setActiveTab('edit')} className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-bold transition-all ${activeTab === 'edit' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                        <FeatherIcon className="w-4 h-4"/> 
                        Editor
                        {hasRemoteChanges && (
                            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 ml-1"></span>
                        )}
                    </button>
                    <button onClick={() => setActiveTab('comments')} className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-bold transition-all ${activeTab === 'comments' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                       <ChatIcon className="w-4 h-4"/> Collaboration <span className="bg-gray-200 dark:bg-white/10 px-1.5 rounded text-[10px] text-gray-600 dark:text-gray-400">{comments.length}</span>
                    </button>
                    <button onClick={() => setActiveTab('visuals')} className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-bold transition-all ${activeTab === 'visuals' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                       <ImageIcon className="w-4 h-4"/> Visuals
                    </button>
                </nav>
            </div>
          
            <div className="flex-grow p-8 overflow-y-auto custom-scrollbar bg-white dark:bg-black/20">
                {activeTab === 'edit' ? renderEditTab() : activeTab === 'comments' ? renderCommentsTab() : renderVisualsTab()}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0F1119] flex flex-col sm:flex-row gap-4">
                {content.status === ContentStatus.ReadyToSchedule ? (
                    <>
                        <button onClick={handleSave} className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold py-3 px-4 rounded-xl transition-colors border border-gray-200 dark:border-white/10">Save & Close</button>
                        <button onClick={handleMarkAsExported} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20">Mark as Exported</button>
                    </>
                ) : (
                    <>
                        <button onClick={handleSave} className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold py-3 px-4 rounded-xl transition-colors border border-gray-200 dark:border-white/10">Save Draft</button>
                        <button 
                            onClick={handleApprove} 
                            disabled={!isCompliant || isOutline}
                            className={`flex-1 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg ${!isCompliant || isOutline ? 'bg-emerald-900/50 text-emerald-500/50 cursor-not-allowed border border-emerald-900' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30 dark:shadow-emerald-900/30'}`}
                        >
                            {isOutline ? 'Drafting...' : isCompliant ? 'Approve Content' : 'Fix Issues'}
                        </button>
                        <button 
                            onClick={handleAddToExportQueue} 
                            disabled={!isCompliant || isOutline}
                            className={`flex-1 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg ${!isCompliant || isOutline ? 'bg-blue-900/50 text-blue-500/50 cursor-not-allowed border border-blue-900' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30 dark:shadow-blue-900/30'}`}
                        >
                            Ready to Schedule
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
