

import React from 'react';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { ChatIcon } from './icons/ChatIcon';
import { TemplateIcon } from './icons/TemplateIcon';
import { UsersIcon } from './icons/UsersIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { ChecklistIcon } from './icons/ChecklistIcon';
import { WorkflowIcon } from './icons/WorkflowIcon';
import { AgentIcon } from './icons/AgentIcon';
import { XCloseIcon } from './icons/XCloseIcon';
import { ExportIcon } from './icons/ExportIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { UserIcon } from './icons/UserIcon';

interface SidebarProps {
    currentView: string;
    onNavigate: (view: string) => void;
    isSidebarOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; isDisabled?: boolean; }> = ({ icon, label, isActive, onClick, isDisabled = false }) => (
    <li>
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDisabled 
                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            <span className="w-6 h-6 mr-3">{icon}</span>
            <span>{label}</span>
        </button>
    </li>
);

const NavHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">{children}</h3>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isSidebarOpen, onClose, onLogout }) => {
    
    return (
        <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            <div className="flex items-center justify-between h-20 px-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">RepurposeAI</h1>
                <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                    <XCloseIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="flex flex-col justify-between h-[calc(100%-5rem)] p-4">
                <nav>
                    <ul className="space-y-1.5">
                        <NavItem
                            icon={<BriefcaseIcon />}
                            label="Projects"
                            isActive={currentView === 'projects' || currentView === 'kanban'}
                            onClick={() => onNavigate('projects')}
                        />
                         <NavHeader>Tools</NavHeader>
                        <NavItem
                            icon={<ChatIcon />}
                            label="Chat"
                            isActive={currentView === 'chat'}
                            onClick={() => onNavigate('chat')}
                        />
                        <NavItem
                            icon={<ChecklistIcon />}
                            label="Kanban Board"
                            isActive={false}
                            onClick={() => onNavigate('coming-soon-kanban')}
                            isDisabled={true}
                        />
                         <NavItem
                            icon={<TemplateIcon />}
                            label="Templates"
                            isActive={currentView === 'templates'}
                            onClick={() => onNavigate('templates')}
                        />
                         <NavItem
                            icon={<WorkflowIcon />}
                            label="Workflow"
                            isActive={currentView === 'workflow'}
                            onClick={() => onNavigate('coming-soon-workflow')}
                            isDisabled={true}
                        />
                         <NavItem
                            icon={<AgentIcon />}
                            label="Agent"
                            isActive={currentView === 'agent'}
                            onClick={() => onNavigate('coming-soon-agent')}
                            isDisabled={true}
                        />
                        <NavHeader>Manage</NavHeader>
                        <NavItem
                            icon={<ExportIcon />}
                            label="Export Center"
                            isActive={currentView === 'export'}
                            onClick={() => onNavigate('export')}
                        />
                        <NavItem
                            icon={<HistoryIcon />}
                            label="History"
                            isActive={currentView === 'history'}
                            onClick={() => onNavigate('history')}
                        />
                        <NavItem
                            icon={<UsersIcon />}
                            label="Collaboration"
                            isActive={currentView === 'collaboration'}
                            onClick={() => onNavigate('coming-soon-collab')}
                            isDisabled={true}
                        />
                        <NavItem
                            icon={<UsersIcon />}
                            label="Team"
                            isActive={currentView === 'team'}
                            onClick={() => onNavigate('team')}
                        />
                    </ul>
                </nav>
                <ul className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <NavItem
                        icon={<UserIcon />}
                        label="Profile"
                        isActive={currentView === 'profile'}
                        onClick={() => onNavigate('profile')}
                    />
                    <NavItem
                        icon={<SettingsIcon />}
                        label="Settings"
                        isActive={currentView === 'settings'}
                        onClick={() => onNavigate('settings')}
                    />
                    <NavItem
                        icon={<LogoutIcon />}
                        label="Logout"
                        isActive={false}
                        onClick={onLogout}
                    />
                </ul>
            </div>
        </aside>
    );
};
