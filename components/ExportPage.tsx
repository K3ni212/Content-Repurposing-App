
import React, { useState, useMemo } from 'react';
import { Project, ContentPiece, ContentStatus, ContentFormat } from '../types';
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
import { ExportIcon } from './icons/ExportIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';

// Augment ContentPiece with project info for the view
interface ExportableContentPiece extends ContentPiece {
    projectId: string;
    projectName: string;
}

interface ExportPageProps {
    projects: Project[];
    onUpdateContent: (updatedContent: ContentPiece, projectId: string) => void;
    showToast: (message: string, type: 'success' | 'error') => void;
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

export const ExportPage: React.FC<ExportPageProps> = ({ projects, onUpdateContent, showToast }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    const exportableContent = useMemo<ExportableContentPiece[]>(() => {
        return projects.flatMap(project => 
            project.contentPieces
                .filter(cp => cp.status === ContentStatus.ReadyToSchedule || cp.status === ContentStatus.Exported)
                .map(cp => ({
                    ...cp,
                    projectId: project.id,
                    projectName: project.name,
                }))
        ).sort((a,b) => a.projectName.localeCompare(b.projectName));
    }, [projects]);

    const handleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(exportableContent.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };
    
    const handleCopyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content);
        showToast('Copied to clipboard!', 'success');
    };

    const handleMarkAsExported = () => {
        if (selectedIds.length === 0) {
            showToast('Please select items to update.', 'error');
            return;
        }

        const selectedContent = exportableContent.filter(c => selectedIds.includes(c.id));
        
        selectedContent.forEach(item => {
            if (item.status !== ContentStatus.Exported) {
                const { projectId, projectName, ...originalContent } = item;
                onUpdateContent({ ...originalContent, status: ContentStatus.Exported }, item.projectId);
            }
        });

        showToast(`${selectedContent.length} items marked as exported.`, 'success');
        setSelectedIds([]);
    };

    const handleExportCSV = () => {
        if (selectedIds.length === 0) {
            showToast('Please select items to export.', 'error');
            return;
        }

        const selectedContent = exportableContent.filter(c => selectedIds.includes(c.id));
        
        const headers = ['id', 'projectName', 'format', 'title', 'content', 'status'];
        const csvRows = [headers.join(',')];

        selectedContent.forEach(item => {
            const row = [
                item.id,
                `"${item.projectName.replace(/"/g, '""')}"`,
                item.format,
                `"${item.title.replace(/"/g, '""')}"`,
                `"${item.content.replace(/"/g, '""')}"`,
                item.status,
            ].join(',');
            csvRows.push(row);
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'content_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Update status to Exported
        handleMarkAsExported();

        showToast(`${selectedContent.length} items exported successfully!`, 'success');
        setSelectedIds([]);
    };

    return (
        <div className="p-6 md:p-10 animate-fade-in h-full flex flex-col bg-[#FAFAFA] dark:bg-[#0B0C15] relative">
             {/* Background Glow */}
             <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="mb-8 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                        <ExportIcon className="w-6 h-6"/>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Export Center</h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                    Finalize your content pipeline. Select items to mark as complete or export for publishing.
                </p>
            </div>
            
            <div className="flex-1 flex flex-col min-h-0 relative z-10">
                {/* Toolbar */}
                <div className="flex flex-wrap justify-between items-center mb-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-sm">
                     <div className="flex items-center">
                        <label className="flex items-center cursor-pointer group">
                            <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === exportableContent.length && exportableContent.length > 0} className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"/>
                            <span className="ml-3 text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 transition-colors">Select All</span>
                        </label>
                     </div>
                     <div className="flex items-center gap-3">
                        <button 
                            onClick={handleMarkAsExported} 
                            disabled={selectedIds.length === 0} 
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <CheckIcon className="w-4 h-4 text-emerald-500" /> Mark Exported
                        </button>
                        <button 
                            onClick={handleExportCSV} 
                            disabled={selectedIds.length === 0} 
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                        >
                            <ExportIcon className="w-4 h-4" /> Export CSV
                        </button>
                     </div>
                </div>

                {/* Glass Table Container */}
                <div className="flex-1 overflow-hidden bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl flex flex-col">
                     <div className="overflow-y-auto custom-scrollbar flex-1">
                         <table className="w-full text-sm text-left">
                            <thead className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur sticky top-0 z-10 border-b border-gray-200 dark:border-white/5">
                                <tr>
                                    <th scope="col" className="p-4 w-12 text-center">#</th>
                                    <th scope="col" className="px-6 py-4">Title</th>
                                    <th scope="col" className="px-6 py-4">Format</th>
                                    <th scope="col" className="px-6 py-4">Project</th>
                                    <th scope="col" className="px-6 py-4">Status</th>
                                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                 {exportableContent.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-20 text-gray-400 text-base">No content is ready for export.</td></tr>
                                ) : (
                                    exportableContent.map(item => {
                                        const Icon = formatIcons[item.format] || MegaphoneIcon;
                                        const isSelected = selectedIds.includes(item.id);
                                        return (
                                        <tr 
                                            key={item.id} 
                                            className={`group transition-colors ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-white/60 dark:hover:bg-white/5'}`}
                                        >
                                            <td className="p-4 text-center">
                                                <input type="checkbox" checked={isSelected} onChange={() => handleSelect(item.id)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"/>
                                            </td>
                                            <th scope="row" className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                <div className="line-clamp-1 max-w-md">{item.title}</div>
                                            </th>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg w-fit">
                                                    <Icon className="w-4 h-4"/> 
                                                    <span className="text-xs font-medium">{item.format}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                    <BriefcaseIcon className="w-4 h-4 opacity-50"/>
                                                    {item.projectName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    item.status === ContentStatus.Exported 
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.status === ContentStatus.Exported ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleCopyToClipboard(item.content)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" aria-label="Copy content" title="Copy to Clipboard">
                                                    <CopyIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )})
                                )}
                            </tbody>
                         </table>
                     </div>
                </div>
            </div>
        </div>
    );
}
