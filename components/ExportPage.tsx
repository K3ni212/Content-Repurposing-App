

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
        <div className="p-4 md:p-8 animate-fade-in h-full flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Export Center</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Manage and export your finalized content. Select items and export them as a CSV.
            </p>
            
            <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center">
                    <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === exportableContent.length && exportableContent.length > 0} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                    <label className="ml-2 text-sm text-gray-600 dark:text-gray-300">Select All</label>
                 </div>
                 <div className="flex items-center gap-2">
                    <button onClick={handleMarkAsExported} disabled={selectedIds.length === 0} className="flex items-center bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <CheckIcon className="w-5 h-5 mr-2" /> Mark as Exported {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
                    </button>
                    <button onClick={handleExportCSV} disabled={selectedIds.length === 0} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <ExportIcon className="w-5 h-5 mr-2" /> Export {selectedIds.length > 0 ? `(${selectedIds.length})` : ''} as CSV
                    </button>
                 </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                 <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                        <tr>
                            <th scope="col" className="p-4"></th>
                            <th scope="col" className="px-6 py-3">Title</th>
                            <th scope="col" className="px-6 py-3">Format</th>
                            <th scope="col" className="px-6 py-3">Project</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                         {exportableContent.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-16 text-gray-500">No content is ready for export.</td></tr>
                        ) : (
                            exportableContent.map(item => {
                                const Icon = formatIcons[item.format];
                                return (
                                <tr key={item.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="w-4 p-4"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelect(item.id)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/></td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.title}</th>
                                    <td className="px-6 py-4 flex items-center">{Icon && <Icon className="w-4 h-4 mr-2"/>}{item.format}</td>
                                    <td className="px-6 py-4">{item.projectName}</td>
                                    <td className="px-6 py-4">{item.status}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleCopyToClipboard(item.content)} className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" aria-label="Copy content">
                                            <CopyIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            )})
                        )}
                    </tbody>
                 </table>
            </div>
        </div>
    );
}