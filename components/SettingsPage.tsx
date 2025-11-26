
import React, { useState } from 'react';
import { UserIcon } from './icons/UserIcon';
import { Settings, BrandIntelligence } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { WebhookIcon } from './icons/WebhookIcon';
import { ZapierIcon } from './icons/ZapierIcon';
import { GoogleIcon } from './icons/GoogleIcon';
import { AirtableIcon } from './icons/AirtableIcon';
import { CheckIcon } from './icons/CheckIcon';
import { EmailIcon } from './icons/EmailIcon';
import { TemplateIcon } from './icons/TemplateIcon';
import { WorkflowIcon } from './icons/WorkflowIcon';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BrandStudioIcon } from './icons/BrandStudioIcon';
import { MarketplaceIcon } from './icons/MarketplaceIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { BellIcon } from './icons/BellIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { CpuIcon } from './icons/CpuIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { XIcon } from './icons/XIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { v4 as uuidv4 } from 'uuid';

interface SettingsPageProps {
    settings: Settings;
    onUpdateSettings: (newSettings: Settings | ((prev: Settings) => Settings)) => void;
    userName?: string;
    userEmail?: string;
    brandIntelligence: BrandIntelligence;
    onUpdateBrandIntelligence: (newBI: BrandIntelligence | ((prev: BrandIntelligence) => BrandIntelligence)) => void;
}

type Tab = 'general' | 'workspace' | 'intelligence' | 'connections' | 'billing';

const arrayToString = (arr: string[] = []) => arr.join(', ');
const stringToArray = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean);

const featureOptions = [
    { id: 'templates', label: 'AI Copywriter', icon: <TemplateIcon className="w-5 h-5"/>, desc: 'Templates & history.' },
    { id: 'automation', label: 'Automation', icon: <WorkflowIcon className="w-5 h-5"/>, desc: 'Workflows pipelines.' },
    { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon className="w-5 h-5"/>, desc: 'Metrics tracking.' },
    { id: 'collaboration', label: 'Team', icon: <UsersIcon className="w-5 h-5"/>, desc: 'Manage members.' },
    { id: 'brand_studio', label: 'Brand Studio', icon: <BrandStudioIcon className="w-5 h-5"/>, desc: 'Voice & assets.' },
    { id: 'marketplace', label: 'Marketplace', icon: <MarketplaceIcon className="w-5 h-5"/>, desc: 'Hire creators.' },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onUpdateSettings, userName, userEmail, brandIntelligence, onUpdateBrandIntelligence }) => {
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('Writer');

    const handleThemeToggle = () => {
        onUpdateSettings(prev => ({...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        onUpdateSettings(prev => ({...prev, [name]: value}));
    }
    
    const handleBrandIntelligenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        onUpdateBrandIntelligence(prev => ({...prev, [name]: stringToArray(value) }));
    }
    
    const handleDoDontChange = (type: 'brandDo' | 'brandDont', value: string) => {
        onUpdateBrandIntelligence(prev => ({...prev, [type]: stringToArray(value) }));
    }

    const handleFeatureToggle = (featureId: string) => {
        onUpdateSettings(prev => {
            const enabledFeatures = prev.enabledFeatures || [];
            const newFeatures = enabledFeatures.includes(featureId) 
                ? enabledFeatures.filter(f => f !== featureId) 
                : [...enabledFeatures, featureId];
            return { ...prev, enabledFeatures: newFeatures };
        });
    };

    const handleInviteMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;
        const newMember = { id: uuidv4(), email: inviteEmail, role: inviteRole, status: 'Pending' };
        onUpdateSettings(prev => ({ ...prev, teamMembers: [...(prev.teamMembers || []), newMember] }));
        setInviteEmail('');
    };

    const handleRemoveMember = (id: string) => {
        onUpdateSettings(prev => ({ ...prev, teamMembers: (prev.teamMembers || []).filter(m => m.id !== id) }));
    };

    const handleIntegrationToggle = (key: string) => {
        onUpdateSettings(prev => ({
            ...prev,
            integrationStatus: { ...prev.integrationStatus, [key]: !prev.integrationStatus?.[key] }
        }));
    };

    const handleClearCache = () => {
        if (window.confirm("This will clear all local data and reload the app. Are you sure?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleExportData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "repurpose_ai_data_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'general':
                return (
                    <div className="space-y-6 animate-fade-in">
                        {/* Profile Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2"><UserIcon className="w-5 h-5 text-blue-500"/> Profile</h2>
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold animate-gradient bg-200%">
                                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-gray-900 dark:text-white">{userName || 'User'}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{userEmail || 'no-email@example.com'}</p>
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Role</label>
                                    <select name="userRole" value={settings.userRole} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                                        <option>Content Writer</option><option>Social Media Manager</option><option>Marketing Strategist</option><option>Copywriter</option><option>Thought Leader</option>
                                    </select>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Size</label>
                                    <select name="companySize" value={settings.companySize} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                                        <option>Just me</option><option>2-10 people</option><option>11-50 people</option><option>50+ people</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Preferences Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2"><BellIcon className="w-5 h-5 text-yellow-500"/> Preferences</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Theme</span>
                                    <div className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                                        <button onClick={() => onUpdateSettings(prev => ({...prev, theme: 'light'}))} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${settings.theme === 'light' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Light</button>
                                        <button onClick={() => onUpdateSettings(prev => ({...prev, theme: 'dark'}))} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${settings.theme === 'dark' ? 'bg-gray-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Dark</button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white">Email Notifications</p>
                                        <p className="text-xs text-gray-500">Receive weekly digests and alerts.</p>
                                    </div>
                                    <button 
                                        onClick={() => onUpdateSettings(prev => ({...prev, notificationPreferences: {...prev.notificationPreferences, email: !prev.notificationPreferences?.email}}))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notificationPreferences?.email ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notificationPreferences?.email ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white">In-App Alerts</p>
                                        <p className="text-xs text-gray-500">Popups for completed tasks.</p>
                                    </div>
                                    <button 
                                        onClick={() => onUpdateSettings(prev => ({...prev, notificationPreferences: {...prev.notificationPreferences, inApp: !prev.notificationPreferences?.inApp}}))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notificationPreferences?.inApp ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notificationPreferences?.inApp ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Data Management */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2"><DatabaseIcon className="w-5 h-5 text-red-500"/> Data Management</h2>
                            <div className="flex gap-4">
                                <button onClick={handleExportData} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg text-sm font-medium transition-colors">
                                    Export All Data
                                </button>
                                <button onClick={handleClearCache} className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-200 dark:border-red-800">
                                    Clear Cache
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'workspace':
                return (
                    <div className="space-y-6 animate-fade-in">
                         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2"><UsersIcon className="w-5 h-5 text-purple-500"/> Team Management</h2>
                            
                            <div className="mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <form onSubmit={handleInviteMember} className="flex gap-2 items-end">
                                    <div className="flex-grow">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
                                        <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" required />
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Role</label>
                                        <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm">
                                            <option>Admin</option><option>Editor</option><option>Writer</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-md transition-colors h-[38px] flex items-center gap-1">
                                        <PlusIcon className="w-4 h-4"/> Invite
                                    </button>
                                </form>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th className="px-4 py-3 rounded-tl-lg">User</th>
                                            <th className="px-4 py-3">Role</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 rounded-tr-lg text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{userEmail} (You)</td>
                                            <td className="px-4 py-3"><span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">Owner</span></td>
                                            <td className="px-4 py-3"><span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Active</span></td>
                                            <td className="px-4 py-3 text-right text-gray-400">-</td>
                                        </tr>
                                        {settings.teamMembers?.map(member => (
                                            <tr key={member.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{member.email}</td>
                                                <td className="px-4 py-3">{member.role}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${member.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                                                        {member.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleRemoveMember(member.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Enabled Features</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                               {featureOptions.map(feature => {
                                   const isEnabled = (settings.enabledFeatures || []).includes(feature.id);
                                   return (
                                       <button
                                            key={feature.id}
                                            onClick={() => handleFeatureToggle(feature.id)}
                                            className={`flex items-center justify-between p-3 border rounded-lg text-left transition-all ${isEnabled ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-sm' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-75'}`}
                                       >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-md ${isEnabled ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-600 text-gray-500'}`}>
                                                    {feature.icon}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{feature.label}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{feature.desc}</p>
                                                </div>
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border-2 ${isEnabled ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}></div>
                                       </button>
                                   );
                               })}
                            </div>
                        </div>
                    </div>
                );
            case 'intelligence':
                return (
                    <div className="space-y-6 animate-fade-in">
                        {/* AI Config */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2"><CpuIcon className="w-5 h-5 text-indigo-500"/> AI Model Configuration</h2>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Creativity Level</label>
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{settings.aiConfig?.creativity || 0.7}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="1" 
                                        step="0.1" 
                                        value={settings.aiConfig?.creativity || 0.7} 
                                        onChange={e => onUpdateSettings(prev => ({...prev, aiConfig: {...prev.aiConfig!, creativity: parseFloat(e.target.value)}}))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Precise</span>
                                        <span>Balanced</span>
                                        <span>Creative</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Model</label>
                                        <select 
                                            value={settings.aiConfig?.model || 'gemini-2.5-flash'}
                                            onChange={e => onUpdateSettings(prev => ({...prev, aiConfig: {...prev.aiConfig!, model: e.target.value}}))}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                        >
                                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                                            <option value="gemini-2.5-pro">Gemini 2.5 Pro (Reasoning)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Output Language</label>
                                        <select 
                                            value={settings.aiConfig?.language || 'English'}
                                            onChange={e => onUpdateSettings(prev => ({...prev, aiConfig: {...prev.aiConfig!, language: e.target.value}}))}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                        >
                                            <option>English</option><option>Spanish</option><option>French</option><option>German</option><option>Japanese</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Brand Intelligence (Existing) */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                            <div>
                                 <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-emerald-500" />Brand Intelligence</h2>
                                 <p className="text-sm text-gray-500 dark:text-gray-400">Teach the AI your brand voice guidelines.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Voice Descriptors</label>
                                    <textarea name="voiceDescriptors" rows={2} defaultValue={arrayToString(brandIntelligence.voiceDescriptors)} onBlur={handleBrandIntelligenceChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm" placeholder="e.g. authoritative, playful" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preferred CTAs</label>
                                    <textarea name="preferredCTAs" rows={2} defaultValue={arrayToString(brandIntelligence.preferredCTAs)} onBlur={handleBrandIntelligenceChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm" placeholder="e.g. Learn more" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-emerald-600 dark:text-emerald-400">Brand DO's</label>
                                    <textarea name="brandDo" rows={2} defaultValue={arrayToString(brandIntelligence.brandDo)} onBlur={(e) => handleDoDontChange('brandDo', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm" placeholder="e.g. Use data" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-red-600 dark:text-red-400">Brand DON'Ts</label>
                                    <textarea name="brandDont" rows={2} defaultValue={arrayToString(brandIntelligence.brandDont)} onBlur={(e) => handleDoDontChange('brandDont', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm" placeholder="e.g. No jargon" />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'connections':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2"><GlobeIcon className="w-5 h-5 text-blue-500"/> Connected Accounts</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['LinkedIn', 'X (Twitter)', 'Instagram', 'YouTube', 'WordPress', 'Webflow'].map(platform => {
                                    const isConnected = settings.integrationStatus?.[platform];
                                    let Icon = GlobeIcon;
                                    if (platform.includes('LinkedIn')) Icon = LinkedInIcon;
                                    if (platform.includes('X')) Icon = XIcon;
                                    if (platform.includes('Instagram')) Icon = InstagramIcon;
                                    if (platform.includes('YouTube')) Icon = YouTubeIcon;

                                    return (
                                        <div key={platform} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                                                    <Icon className="w-6 h-6"/>
                                                </div>
                                                <span className="font-bold text-gray-800 dark:text-gray-200">{platform}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleIntegrationToggle(platform)}
                                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isConnected ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200'}`}
                                            >
                                                {isConnected ? 'Connected' : 'Connect'}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2"><WebhookIcon className="w-5 h-5 text-orange-500"/> Automation Hub</h2>
                             <div className="space-y-3">
                                <div className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <AirtableIcon className="w-8 h-8 mr-4"/>
                                    <div className="flex-1">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">Airtable Sync</span>
                                        <p className="text-xs text-gray-500">Auto-export approved content rows.</p>
                                    </div>
                                    <button className="bg-gray-200 dark:bg-gray-700 text-xs font-bold px-3 py-1.5 rounded-md">Configure</button>
                                </div>
                                 <div className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <ZapierIcon className="w-8 h-8 mr-4"/>
                                    <div className="flex-1">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">Zapier Webhooks</span>
                                        <p className="text-xs text-gray-500">Trigger actions on content status change.</p>
                                    </div>
                                    <button className="bg-gray-200 dark:bg-gray-700 text-xs font-bold px-3 py-1.5 rounded-md">Configure</button>
                                </div>
                             </div>
                        </div>
                    </div>
                );
            case 'billing':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold mb-6 text-gray-800 dark:text-white flex items-center gap-2"><CreditCardIcon className="w-5 h-5 text-green-500"/> Subscription & Usage</h2>
                            
                            <div className="mb-8">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Credit Usage</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{settings.billing?.creditsUsed || 0} / {settings.billing?.creditsLimit || 10000}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div 
                                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full transition-all duration-1000 animate-gradient bg-200%" 
                                        style={{ width: `${Math.min(((settings.billing?.creditsUsed || 0) / (settings.billing?.creditsLimit || 1)), 100) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Resets on Nov 1, 2023</p>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Current Plan</p>
                                    <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">{settings.billing?.plan || 'Pro Plan'}</h3>
                                </div>
                                <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105">
                                    Upgrade
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Billing History</h2>
                            <div className="space-y-2">
                                {[
                                    { date: 'Oct 1, 2023', amount: '$29.00', status: 'Paid' },
                                    { date: 'Sep 1, 2023', amount: '$29.00', status: 'Paid' },
                                    { date: 'Aug 1, 2023', amount: '$29.00', status: 'Paid' },
                                ].map((invoice, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500">
                                                <CheckIcon className="w-4 h-4"/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Invoice #{2023001 + i}</p>
                                                <p className="text-xs text-gray-500">{invoice.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{invoice.amount}</p>
                                            <p className="text-xs text-green-600 font-medium">{invoice.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
        }
    }

    const TabButton: React.FC<{tab: Tab, label: string}> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex-1 md:flex-none px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === tab ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-4 md:p-8 animate-fade-in min-h-full bg-[#FAFAFA] dark:bg-[#0B0C15]">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">Settings</h1>
                
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Nav */}
                    <nav className="flex flex-row lg:flex-col lg:w-64 shrink-0 gap-1 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl h-fit sticky top-24 overflow-x-auto">
                        <TabButton tab="general" label="General"/>
                        <TabButton tab="workspace" label="Workspace"/>
                        <TabButton tab="intelligence" label="Intelligence"/>
                        <TabButton tab="connections" label="Connections"/>
                        <TabButton tab="billing" label="Billing"/>
                    </nav>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};