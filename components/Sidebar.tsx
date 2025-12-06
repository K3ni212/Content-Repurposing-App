
import React from 'react';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { ChatIcon } from './icons/ChatIcon';
import { WorkflowIcon } from './icons/WorkflowIcon';
import { XCloseIcon } from './icons/XCloseIcon';
import { ExportIcon } from './icons/ExportIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { UserIcon } from './icons/UserIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { ContentPlannerIcon } from './icons/ContentPlannerIcon';
import { BrandStudioIcon } from './icons/BrandStudioIcon';

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

const NavItem: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    isActive: boolean; 
    onClick: () => void; 
    isDisabled?: boolean; 
    isCollapsed: boolean; 
}> = ({ icon, label, isActive, onClick, isDisabled = false, isCollapsed }) => (
    <li className="relative px-3 mb-1.5">
        {isActive && !isCollapsed && (
            <div className="absolute left-0 w-1 h-8 bg-indigo-600 rounded-r-full top-1/2 -translate-y-1/2 shadow-[0_0_12px_rgba(79,70,229,0.5)]" />
        )}
        
        <button
            onClick={onClick}
            disabled={isDisabled}
            title={isCollapsed ? label : undefined}
            className={`relative flex items-center w-full px-3.5 py-3 text-sm font-medium rounded-xl transition-all duration-300 ease-out group outline-none
            ${isCollapsed ? 'justify-center' : ''}
            ${isActive 
                ? 'bg-indigo-50 dark:bg-white/10 text-indigo-700 dark:text-white shadow-sm border border-indigo-100 dark:border-white/10' 
                : isDisabled 
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-white/5 border border-transparent'
            }
            `}
        >
            <span className={`flex-shrink-0 transition-transform duration-300 ${isCollapsed ? '' : 'mr-3'} ${isActive ? 'scale-110 text-indigo-600 dark:text-white' : 'text-current group-hover:scale-105'}`}>
                {React.cloneElement(icon as React.ReactElement, { 
                    className: `w-5 h-5 transition-colors`
                })}
            </span>
            
            {!isCollapsed && (
                <span className={`tracking-tight truncate font-sans ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {label}
                </span>
            )}
        </button>
    </li>
);

const SectionHeader: React.FC<{ title: string; isCollapsed: boolean }> = ({ title, isCollapsed }) => {
    if (isCollapsed) return <div className="h-4" />; 
    return (
        <div className="px-6 mt-6 mb-3">
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{title}</h3>
        </div>
    );
};

// Configurable Navigation Structure
const getAllNavItems = (enabledFeatures: string[] = []) => {
    // 1. Core
    const coreItems: Record<string, any> = {
        'Dashboard': { icon: BriefcaseIcon, view: 'projects' },
        'Chat Copilot': { icon: ChatIcon, view: 'chat' },
    };
    
    // 2. Creation Suite
    let createItems: Record<string, any> = {};
    if (enabledFeatures.includes('automation')) {
        createItems['Workflows'] = { icon: WorkflowIcon, view: 'workflow' };
    }
    if (enabledFeatures.includes('planner')) {
         createItems['Planner'] = { icon: ContentPlannerIcon, view: 'planner' };
    }

    // 3. Brand & Management
    let manageItems: Record<string, any> = {};
    if (enabledFeatures.includes('brand_studio')) {
        manageItems['Brand Studio'] = { icon: BrandStudioIcon, view: 'brand-studio' };
    }
    
    // 4. Operations
    let opsItems: Record<string, any> = {};
    if (enabledFeatures.includes('analytics')) {
        opsItems['Analytics'] = { icon: AnalyticsIcon, view: 'analytics' };
    }
    opsItems['Export Center'] = { icon: ExportIcon, view: 'export' };

    return { coreItems, createItems, manageItems, opsItems };
};


export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isSidebarOpen, onClose, onLogout, isSidebarCollapsed, onToggleCollapse, userRole, enabledFeatures }) => {
    
    // Default to showing ALL features if the user hasn't customized (empty array)
    const safeFeatures = (enabledFeatures && enabledFeatures.length > 0) 
        ? enabledFeatures 
        : ['automation', 'planner', 'analytics', 'brand_studio'];
        
    const { coreItems, createItems, manageItems, opsItems } = getAllNavItems(safeFeatures);

    const isActive = (view: string) => currentView === view || (view === 'projects' && currentView === 'kanban');

    return (
        <>
            {/* Mobile Overlay */}
            <div 
                className={`fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <aside className={`fixed top-0 left-0 z-[60] h-screen transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
                
                {/* Main Glass Container */}
                <div className="absolute inset-0 bg-white/95 dark:bg-[#0B0C15]/95 backdrop-blur-2xl border-r border-gray-200 dark:border-white/5 shadow-xl"></div>

                <div className="relative flex flex-col h-full z-10">
                    {/* Brand / Logo Area */}
                    <div className={`flex items-center h-24 px-6 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => onNavigate('projects')}>
                            <div className="relative w-10 h-10 flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300 opacity-20 dark:opacity-40 blur-md"></div>
                                <div className="relative w-10 h-10 bg-white dark:bg-[#1A1C29] border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-white font-bold text-xl shadow-lg">
                                    R
                                </div>
                            </div>
                            
                            {!isSidebarCollapsed && (
                                <div className="flex flex-col animate-fade-in">
                                    <h1 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight leading-none font-sans">RepurposeAI</h1>
                                    <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold tracking-wider mt-0.5 uppercase">Pro Workspace</span>
                                </div>
                            )}
                        </div>

                        {/* Mobile Close */}
                        <button onClick={onClose} className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
                            <XCloseIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Navigation */}
                    <nav className="flex-1 overflow-y-auto custom-scrollbar py-2 space-y-1 px-3">
                        
                        {!isSidebarCollapsed && <SectionHeader title="Overview" isCollapsed={isSidebarCollapsed} />}
                        <ul className="space-y-0.5">
                           {Object.entries(coreItems).map(([label, {icon: Icon, view}]) => (
                                <NavItem key={label} icon={<Icon />} label={label} isActive={isActive(view)} onClick={() => onNavigate(view)} isCollapsed={isSidebarCollapsed} />
                           ))}
                        </ul>

                        {Object.keys(createItems).length > 0 && (
                            <>
                                <SectionHeader title="Create" isCollapsed={isSidebarCollapsed} />
                                <ul className="space-y-0.5">
                                    {Object.entries(createItems).map(([label, {icon: Icon, view}]) => (
                                        <NavItem key={label} icon={<Icon />} label={label} isActive={isActive(view)} onClick={() => onNavigate(view)} isCollapsed={isSidebarCollapsed} />
                                    ))}
                                </ul>
                            </>
                        )}

                        {Object.keys(manageItems).length > 0 && (
                            <>
                                <SectionHeader title="Brand & Assets" isCollapsed={isSidebarCollapsed} />
                                <ul className="space-y-0.5">
                                    {Object.entries(manageItems).map(([label, {icon: Icon, view}]) => (
                                        <NavItem key={label} icon={<Icon />} label={label} isActive={isActive(view)} onClick={() => onNavigate(view)} isCollapsed={isSidebarCollapsed} />
                                    ))}
                                </ul>
                            </>
                        )}

                        {Object.keys(opsItems).length > 0 && (
                            <>
                                <SectionHeader title="Operations" isCollapsed={isSidebarCollapsed} />
                                <ul className="space-y-0.5">
                                    {Object.entries(opsItems).map(([label, {icon: Icon, view}]) => (
                                        <NavItem key={label} icon={<Icon />} label={label} isActive={isActive(view)} onClick={() => onNavigate(view)} isCollapsed={isSidebarCollapsed} />
                                    ))}
                                </ul>
                            </>
                        )}
                    </nav>

                    {/* Bottom Profile Section - Glass Card Style */}
                    <div className={`p-4 ${isSidebarCollapsed ? 'items-center' : ''}`}>
                        <div className={`relative group ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
                            <div className={`
                                flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer border
                                ${isSidebarCollapsed 
                                    ? 'justify-center w-12 h-12 p-0 bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-white/10' 
                                    : 'bg-white/60 dark:bg-white/5 border-gray-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-lg shadow-sm backdrop-blur-md'
                                }
                            `}>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-md flex-shrink-0">
                                    <div className="w-full h-full rounded-full bg-white dark:bg-[#1A1C29] flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">
                                        <UserIcon className="w-4 h-4" />
                                    </div>
                                </div>
                                
                                {!isSidebarCollapsed && (
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Alex Doe</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">Online</p>
                                        </div>
                                    </div>
                                )}

                                {!isSidebarCollapsed && (
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => onNavigate('settings')}
                                            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-white/10 rounded-lg transition-colors"
                                            title="Settings"
                                        >
                                            <SettingsIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={onLogout}
                                            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Logout"
                                        >
                                            <LogoutIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {/* Collapse Toggle */}
                            <button 
                                onClick={onToggleCollapse}
                                className={`absolute -right-7 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-[#1A1C29] border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white shadow-md transition-transform hover:scale-110 z-20 hidden lg:flex`}
                            >
                                <ChevronLeftIcon className={`w-3 h-3 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
