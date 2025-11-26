
import React, { useState, useMemo } from 'react';
import { Project, ContentPiece, ContentFormat } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { XIcon } from './icons/XIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { EmailIcon } from './icons/EmailIcon';
import { FeatherIcon } from './icons/FeatherIcon';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';

interface ContentPlannerPageProps {
    projects: Project[];
    onUpdateContent: (content: ContentPiece, projectId: string) => void;
    onCardClick: (content: ContentPiece) => void;
}

const formatIcons: Record<string, React.FC<{className?: string}>> = {
  [ContentFormat.LinkedIn]: LinkedInIcon,
  [ContentFormat.XThread]: XIcon,
  [ContentFormat.Email]: EmailIcon,
  [ContentFormat.InstagramReels]: InstagramIcon,
  [ContentFormat.InstagramFeed]: InstagramIcon,
  [ContentFormat.Blog]: FeatherIcon,
  [ContentFormat.YouTubeShort]: YouTubeIcon,
  [ContentFormat.Facebook]: MegaphoneIcon,
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ContentPlannerPage: React.FC<ContentPlannerPageProps> = ({ projects, onUpdateContent, onCardClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [draggedContent, setDraggedContent] = useState<{contentId: string, projectId: string} | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Helper to get content
    const allContent = useMemo(() => {
        return projects.flatMap(p => p.contentPieces.map(c => ({...c, projectId: p.id, projectName: p.name})));
    }, [projects]);

    const unscheduledContent = useMemo(() => {
        return allContent.filter(c => 
            !c.scheduledDate && 
            (c.status === 'Ready to Schedule' || c.status === 'Approved' || c.status === 'Exported')
        );
    }, [allContent]);

    const scheduledContent = useMemo(() => {
        return allContent.filter(c => c.scheduledDate);
    }, [allContent]);

    // Calendar Logic
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const prevMonthDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        prevMonthDays.push(null);
    }
    
    const monthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
        monthDays.push(new Date(year, month, i));
    }

    const calendarGrid = [...prevMonthDays, ...monthDays];

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const handleDragStart = (contentId: string, projectId: string) => {
        setDraggedContent({ contentId, projectId });
    };

    const handleDrop = (date: Date) => {
        if (draggedContent) {
            const { contentId, projectId } = draggedContent;
            const project = projects.find(p => p.id === projectId);
            const content = project?.contentPieces.find(c => c.id === contentId);
            
            if (content) {
                // Format date as YYYY-MM-DD
                const dateStr = date.toISOString().split('T')[0];
                onUpdateContent({ ...content, scheduledDate: dateStr, status: 'Ready to Schedule' }, projectId);
            }
            setDraggedContent(null);
        }
    };

    const getContentForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return scheduledContent.filter(c => c.scheduledDate === dateStr);
    };

    return (
        <div className="flex h-full animate-fade-in bg-[#FAFAFA] dark:bg-[#0B0C15] overflow-hidden">
            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="p-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <CalendarIcon className="w-6 h-6"/>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Planner</h1>
                    </div>
                    <div className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400">
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[140px] text-center">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400">
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="grid grid-cols-7 gap-4 mb-4">
                        {DAYS.map(day => (
                            <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-4 auto-rows-fr min-h-[600px]">
                        {calendarGrid.map((date, index) => {
                            if (!date) return <div key={`empty-${index}`} className="bg-transparent"></div>;
                            
                            const isToday = new Date().toDateString() === date.toDateString();
                            const dayContent = getContentForDate(date);

                            return (
                                <div 
                                    key={date.toISOString()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => { e.preventDefault(); handleDrop(date); }}
                                    className={`bg-white dark:bg-gray-800 rounded-xl border p-2 min-h-[120px] flex flex-col transition-colors ${isToday ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
                                >
                                    <span className={`text-sm font-medium mb-2 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {date.getDate()}
                                    </span>
                                    
                                    <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                                        {dayContent.map(content => {
                                            const Icon = formatIcons[content.format] || MegaphoneIcon;
                                            return (
                                                <div 
                                                    key={content.id}
                                                    onClick={() => onCardClick(content)}
                                                    className="bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded-lg border border-gray-100 dark:border-gray-600 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group flex items-center gap-2 text-xs"
                                                >
                                                    <Icon className="w-3 h-3 text-gray-500 dark:text-gray-400 group-hover:text-indigo-500"/>
                                                    <span className="truncate text-gray-700 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 font-medium">{content.title}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Sidebar: Unscheduled */}
            <aside className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col shadow-xl z-10">
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <h2 className="font-bold text-gray-900 dark:text-white">Unscheduled Queue</h2>
                    <p className="text-xs text-gray-500 mt-1">Drag content onto the calendar</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {unscheduledContent.length > 0 ? (
                        unscheduledContent.map(content => {
                            const Icon = formatIcons[content.format] || MegaphoneIcon;
                            return (
                                <div
                                    key={content.id}
                                    draggable
                                    onDragStart={() => handleDragStart(content.id, content.projectId)}
                                    onClick={() => onCardClick(content)}
                                    className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-indigo-400 cursor-grab active:cursor-grabbing transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{content.projectName}</span>
                                        <Icon className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors"/>
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-2 mb-2">{content.title}</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">Ready</span>
                                        <span className="text-[10px] text-gray-400">{content.format}</span>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            <p>No content ready to schedule.</p>
                            <p className="text-xs mt-2">Approve drafts in the Kanban board first.</p>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
};
