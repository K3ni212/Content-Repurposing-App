import React from 'react';
import { ContentPiece, ContentFormat, ContentStatus } from '../types';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { XIcon } from './icons/XIcon';
import { EmailIcon } from './icons/EmailIcon';
import { CarouselIcon } from './icons/CarouselIcon';
import { QuoteIcon } from './icons/QuoteIcon';
import { TikTokIcon } from './icons/TikTokIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { FeatherIcon } from './icons/FeatherIcon';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StarIcon } from './icons/StarIcon';

interface ContentCardProps {
  content: ContentPiece;
  onClick: () => void;
}

const formatIcons: Record<string, React.FC<{className?: string}>> = {
  [ContentFormat.LinkedIn]: LinkedInIcon,
  [ContentFormat.XThread]: XIcon,
  [ContentFormat.Email]: EmailIcon,
  [ContentFormat.Carousel]: CarouselIcon,
  [ContentFormat.Quote]: QuoteIcon,
  [ContentFormat.TikTok]: TikTokIcon,
  [ContentFormat.InstagramReels]: InstagramIcon,
  [ContentFormat.InstagramFeed]: InstagramIcon,
  [ContentFormat.Facebook]: FacebookIcon,
  [ContentFormat.Ads]: MegaphoneIcon,
  [ContentFormat.Blog]: FeatherIcon,
  [ContentFormat.YouTubeShort]: YouTubeIcon,
  [ContentFormat.PodcastSnippet]: MicrophoneIcon,
};

const formatStyles: Record<string, { bg: string, text: string, border: string }> = {
    [ContentFormat.LinkedIn]: { bg: 'bg-[#0077b5]/10', text: 'text-[#0077b5]', border: 'border-[#0077b5]/20' },
    [ContentFormat.XThread]: { bg: 'bg-black/5 dark:bg-white/10', text: 'text-gray-900 dark:text-white', border: 'border-black/10 dark:border-white/20' },
    [ContentFormat.Email]: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20' },
    [ContentFormat.InstagramReels]: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/20' },
    [ContentFormat.YouTubeShort]: { bg: 'bg-red-600/10', text: 'text-red-600', border: 'border-red-600/20' },
}

const formatBorderColors: Record<string, string> = {
    [ContentFormat.LinkedIn]: 'border-l-[#0077b5]',
    [ContentFormat.XThread]: 'border-l-black dark:border-l-white',
    [ContentFormat.Email]: 'border-l-orange-500',
    [ContentFormat.InstagramReels]: 'border-l-pink-500',
    [ContentFormat.YouTubeShort]: 'border-l-red-600',
    [ContentFormat.TikTok]: 'border-l-[#00f2ea]',
    [ContentFormat.Facebook]: 'border-l-[#1877F2]',
    [ContentFormat.Blog]: 'border-l-emerald-500',
}

const statusStyles: Record<ContentStatus, string> = {
  [ContentStatus.Draft]: 'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  [ContentStatus.Editing]: 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-200 dark:border-yellow-500/30',
  [ContentStatus.Approved]: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
  [ContentStatus.ReadyToSchedule]: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
  [ContentStatus.Exported]: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
};

export const ContentCard: React.FC<ContentCardProps> = ({ content, onClick }) => {
  const Icon = formatIcons[content.format] || MegaphoneIcon;
  const style = formatStyles[content.format] || { bg: 'bg-indigo-50 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-300', border: 'border-indigo-200 dark:border-white/10' };
  const borderClass = formatBorderColors[content.format] || 'border-l-indigo-500';

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('contentId', content.id);
    const target = e.target as HTMLElement;
    target.style.opacity = '0.5';
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      target.style.opacity = '1';
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      className={`group relative bg-white dark:bg-[#1E202E] rounded-xl p-4 
        border border-gray-200 dark:border-gray-700/50 ${borderClass} border-l-[4px]
        cursor-pointer 
        shadow-sm hover:shadow-lg dark:shadow-black/20 hover:-translate-y-1 
        transition-all duration-300 ease-out mb-3 active:scale-[0.98]
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-3">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {content.title}
            </h4>
        </div>
        <div className={`flex-shrink-0 p-1.5 rounded-lg ${style.bg} ${style.text} ${style.border}`}>
          {Icon && <Icon className="w-3.5 h-3.5" />}
        </div>
      </div>
      
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed font-medium">
        {content.content}
      </p>
      
      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-white/5">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${statusStyles[content.status]}`}>
          {content.status}
        </span>
        
        {content.smartScore && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-full border border-gray-200 dark:border-white/5">
                <StarIcon className="w-3 h-3 text-yellow-500" filled />
                <span>{content.smartScore}</span>
            </div>
        )}
      </div>
    </div>
  );
};