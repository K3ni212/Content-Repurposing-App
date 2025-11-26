
import React from 'react';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { ChatIcon } from './icons/ChatIcon';
import { TemplateIcon } from './icons/TemplateIcon';
import { UsersIcon } from './icons/UsersIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { WorkflowIcon } from './icons/WorkflowIcon';
import { XCloseIcon } from './icons/XCloseIcon';
import { ExportIcon } from './icons/ExportIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { UserIcon } from './icons/UserIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { ContentPlannerIcon } from './icons/ContentPlannerIcon';
import { BrandStudioIcon } from './icons/BrandStudioIcon';
import { LibraryIcon } from './icons/LibraryIcon';
import { VoiceCheckIcon } from './icons/VoiceCheckIcon';
import { CollaborationIcon } from './icons/CollaborationIcon';
import { MarketplaceIcon } from './icons/MarketplaceIcon';
import { RobotIcon } from './icons/RobotIcon';

interface SidebarProps {
    currentView: string;
    onNavigate: (view: string) => void;
    isSidebarOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    isSidebarCollapsed: boolean;
    onToggleCollapse: () => void;
    userRole: string;
    enabledFeatures?: string[];
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; isDisabled?: boolean; isCollapsed: boolean; }> = ({ icon, label, isActive, onClick, isDisabled = false, isCollapsed }) => (
    <li>
        <button
            onClick={onClick}
            disabled={isDisabled}
            title={isCollapsed ? label : undefined}
            className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ease-out active:scale-95 ${isCollapsed ? 'justify-center' : ''} ${
                isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500/50 animate-gradient bg-200%'
                    : isDisabled 
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200 hover:translate-x-1'
            }`}
        >
            <span className={`transition-transform duration-300 ${isCollapsed ? '' : 'mr-3'} ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {React.cloneElement(icon as React.ReactElement, { 
                    className: `w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors duration-200'}`
                })}
            </span>
            {!isCollapsed && <span className="tracking-tight truncate">{label}</span>}
        </button>
    </li>
);

const getAllNavItems = (enabledFeatures: string[] = []) => {
    const coreItems = {
        'Projects': { icon: BriefcaseIcon, view: 'projects' },
        'AI Agents': { icon: RobotIcon, view: 'agents' },
        'Chat': { icon: ChatIcon, view: 'chat' },
    };

    let featureItems: Record<string, any> = {};

    if (enabledFeatures.includes('templates')) {
        featureItems['Templates'] = { icon: TemplateIcon, view: 'templates' };
        featureItems['History'] = { icon: HistoryIcon, view: 'history' };
    }
    if (enabledFeatures.includes('planner')) {
         featureItems['Content Planner'] = { icon: ContentPlannerIcon, view: 'planner' };
    }
    if (enabledFeatures.includes('analytics')) {
        featureItems['Performance'] = { icon: AnalyticsIcon, view: 'coming-soon-performance' };
    }
    
    featureItems['Export Center'] = { icon: ExportIcon, view: 'export' };

    if (enabledFeatures.includes('collaboration')) {
        featureItems['Team'] = { icon: UsersIcon, view: 'team' };
        featureItems['Collaboration'] = { icon: CollaborationIcon, view: 'coming-soon-collaboration' };
    }
    if (enabledFeatures.includes('automation')) {
        featureItems['Automation'] = { icon: WorkflowIcon, view: 'workflow' };
    }
    if (enabledFeatures.includes('brand_studio')) {
        featureItems['Brand Studio'] = { icon: BrandStudioIcon, view: 'coming-soon-brand-studio' };
        featureItems['Evergreen Library'] = { icon: LibraryIcon, view: 'coming-soon-library' };
        featureItems['Voice Check'] = { icon: VoiceCheckIcon, view: 'coming-soon-voice-check' };
    }
    if (enabledFeatures.includes('marketplace')) {
        featureItems['Marketplace'] = { icon: MarketplaceIcon, view: 'coming-soon-marketplace' };
    }

    return { ...coreItems, ...featureItems };
};


export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isSidebarOpen, onClose, onLogout, isSidebarCollapsed, onToggleCollapse, userRole, enabledFeatures }) => {
    
    const safeFeatures = enabledFeatures || ['templates', 'automation', 'analytics', 'collaboration', 'brand_studio', 'marketplace'];
    const navItems = getAllNavItems(safeFeatures);

    return (
        <aside className={`fixed top-0 left-0 z-40 h-screen bg-[#FBFBFD] dark:bg-[#0B0C15] border-r border-gray-100 dark:border-gray-800/50 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex items-center justify-between h-20 px-5">
                {!isSidebarCollapsed && (
                    <div className="flex items-center gap-2 animate-fade-in">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-glow transform transition-transform hover:rotate-12 hover:scale-110 duration-300 animate-gradient bg-200%">
                            R
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">RepurposeAI</h1>
                    </div>
                )}
                <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors p-1 rounded-md active:bg-gray-200 dark:active:bg-gray-800">
                    <XCloseIcon className="w-6 h-6" />
                </button>
                 <button 
                    onClick={onToggleCollapse} 
                    className={`hidden lg:flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-all active:scale-95 ${isSidebarCollapsed ? 'mx-auto' : ''}`}
                    aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <ChevronLeftIcon className={`w-4 h-4 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>
            <div className="flex flex-col justify-between h-[calc(100%-5rem)] px-3 pb-4">
                <nav className="overflow-y-auto no-scrollbar py-2">
                    <ul className="space-y-1">
                       {Object.entries(navItems).map(([label, {icon: Icon, view}]) => (
                            <NavItem
                                key={label}
                                icon={<Icon />}
                                label={label}
                                isActive={currentView === view || (view === 'projects' && currentView === 'kanban')}
                                onClick={() => onNavigate(view)}
                                isCollapsed={isSidebarCollapsed}
                            />
                       ))}
                    </ul>
                </nav>
                <div className={`pt-4 border-t border-gray-100 dark:border-gray-800/50 ${isSidebarCollapsed ? 'px-0' : 'px-1'}`}>
                    <ul className="space-y-1">
                        <NavItem
                            icon={<UserIcon />}
                            label="Profile"
                            isActive={currentView === 'profile'}
                            onClick={() => onNavigate('profile')}
                            isCollapsed={isSidebarCollapsed}
                        />
                        <NavItem
                            icon={<SettingsIcon />}
                            label="Settings"
                            isActive={currentView === 'settings'}
                            onClick={() => onNavigate('settings')}
                            isCollapsed={isSidebarCollapsed}
                        />
                        <NavItem
                            icon={<LogoutIcon />}
                            label="Logout"
                            isActive={false}
                            onClick={onLogout}
                            isCollapsed={isSidebarCollapsed}
                        />
                    </ul>
                </div>
            </div>
        </aside>
    );
};
