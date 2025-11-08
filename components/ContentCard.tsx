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

const formatColors: Record<string, string> = {
    [ContentFormat.LinkedIn]: 'text-blue-700',
    [ContentFormat.XThread]: 'text-gray-800 dark:text-white',
    [ContentFormat.Email]: 'text-red-500',
    [ContentFormat.Carousel]: 'text-purple-500',
    [ContentFormat.Quote]: 'text-yellow-500',
    [ContentFormat.TikTok]: 'text-black dark:text-white',
    [ContentFormat.InstagramReels]: 'text-pink-600',
    [ContentFormat.InstagramFeed]: 'text-pink-500',
    [ContentFormat.Facebook]: 'text-blue-800',
}

const statusColors: Record<ContentStatus, string> = {
  [ContentStatus.Draft]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  [ContentStatus.Editing]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-300',
  [ContentStatus.Approved]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  [ContentStatus.ReadyToSchedule]: 'bg-purple-100 text-purple-800 dark:bg-purple-400/20 dark:text-purple-300',
  [ContentStatus.Exported]: 'bg-blue-100 text-blue-800 dark:bg-blue-400/20 dark:text-blue-300',
};


export const ContentCard: React.FC<ContentCardProps> = ({ content, onClick }) => {
  const Icon = formatIcons[content.format];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('contentId', content.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-600 border-2 border-transparent transition-all mb-4"
    >
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-gray-800 dark:text-white pr-2 flex-1">{content.title}</h4>
        <div className={`flex-shrink-0 ${formatColors[content.format]}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
        {content.content}
      </p>
      <div className="flex justify-between items-center mt-4">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[content.status]}`}>
          {content.status}
        </span>
        <span className="text-xs text-gray-400">{content.format}</span>
      </div>
    </div>
  );
};