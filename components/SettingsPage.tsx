
import React, { useState } from 'react';
import { UserIcon } from './icons/UserIcon';
import { Settings, BrandIntelligence } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { WebhookIcon } from './icons/WebhookIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BrandStudioIcon } from './icons/BrandStudioIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { CheckIcon } from './icons/CheckIcon';
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

// Reusable Glass Components
const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white/60 dark:bg-[#151725]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
        {children}
    </div>
);

const GlassInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, className = '', ...props }) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">{label}</label>
        <input 
            className={`w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 text-sm ${className}`}
            {...props} 
        />
    </div>
);

const GlassSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, className = '', ...props }) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">{label}</label>
        <div className="relative">
            <select 
                className={`w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all text-gray-900 dark:text-white appearance-none cursor-pointer text-sm ${className}`}
                {...props}
            >
                {children}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    </div>
);

const SectionHeader: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
);

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onUpdateSettings, userName, userEmail, brandIntelligence, onUpdateBrandIntelligence }) => {
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('Writer');

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

    const handleClearCache = () => {
        if (window.confirm("This will clear all local data and reload the app. Are you sure?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const navItems: { id: Tab; label: string; icon: any }[] = [
        { id: 'general', label: 'General', icon: UserIcon },
        { id: 'workspace', label: 'Workspace', icon: UsersIcon },
        { id: 'intelligence', label: 'Intelligence', icon: SparklesIcon },
        { id: 'connections', label: 'Connections', icon: WebhookIcon },
        { id: 'billing', label: 'Billing', icon: CreditCardIcon },
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'general':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <GlassCard className="p-8">
                            <SectionHeader title="Profile" description="Manage your personal information." />
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1">
                                    <div className="w-full h-full rounded-full bg-white dark:bg-[#151725] flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-white">
                                        {userName ? userName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{userName}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{userEmail}</p>
                                    <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-2 hover:underline">Change Avatar</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <GlassInput label="Full Name" value={userName || ''} readOnly className="cursor-not-allowed opacity-75" />
                                <GlassInput label="Email" value={userEmail || ''} readOnly className="cursor-not-allowed opacity-75" />
                                <GlassSelect label="Role" name="userRole" value={settings.userRole} onChange={handleInputChange}>
                                    <option>Content Writer</option><option>Social Media Manager</option><option>Founder</option>
                                </GlassSelect>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-8">
                            <SectionHeader title="Appearance" description="Customize how RepurposeAI looks." />
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => onUpdateSettings(prev => ({...prev, theme: 'light'}))}
                                    className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${settings.theme === 'light' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500'}`}
                                >
                                    <SunIcon className="w-6 h-6" />
                                    <span className="font-semibold text-sm">Light Mode</span>
                                </button>
                                <button 
                                    onClick={() => onUpdateSettings(prev => ({...prev, theme: 'dark'}))}
                                    className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${settings.theme === 'dark' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500'}`}
                                >
                                    <MoonIcon className="w-6 h-6" />
                                    <span className="font-semibold text-sm">Dark Mode</span>
                                </button>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-8">
                            <SectionHeader title="Data" description="Manage your local storage." />
                            <button onClick={handleClearCache} className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold border border-red-200 dark:border-red-800 transition-colors">
                                <DatabaseIcon className="w-4 h-4"/> Clear App Cache
                            </button>
                        </GlassCard>
                    </div>
                );
            case 'workspace':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <GlassCard className="p-8">
                            <SectionHeader title="Team Members" description="Invite and manage your team." />
                            <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/5 mb-6">
                                <form onSubmit={handleInviteMember} className="flex gap-3 items-end">
                                    <div className="flex-grow">
                                        <GlassInput label="Email Address" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" required />
                                    </div>
                                    <div className="w-1/3">
                                        <GlassSelect label="Role" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                                            <option>Admin</option><option>Editor</option><option>Writer</option>
                                        </GlassSelect>
                                    </div>
                                    <button type="submit" className="h-[46px] px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2">
                                        <PlusIcon className="w-5 h-5"/> Invite
                                    </button>
                                </form>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/5">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-white/5">
                                        <tr>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                        <tr className="bg-white dark:bg-transparent">
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{userEmail} (You)</td>
                                            <td className="px-6 py-4"><span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">Owner</span></td>
                                            <td className="px-6 py-4"><span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Active</span></td>
                                            <td className="px-6 py-4"></td>
                                        </tr>
                                        {settings.teamMembers?.map(member => (
                                            <tr key={member.id} className="bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{member.email}</td>
                                                <td className="px-6 py-4">{member.role}</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                                                        {member.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleRemoveMember(member.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </div>
                );
            case 'intelligence':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <GlassCard className="p-8">
                            <SectionHeader title="AI Configuration" description="Tune the creativity and model settings." />
                            <div className="mb-6">
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Creativity Level</label>
                                    <span className="text-xs font-bold px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md">{settings.aiConfig?.creativity || 0.7}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.1" 
                                    value={settings.aiConfig?.creativity || 0.7} 
                                    onChange={e => onUpdateSettings(prev => ({...prev, aiConfig: {...prev.aiConfig!, creativity: parseFloat(e.target.value)}}))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                                    <span>Precise</span>
                                    <span>Balanced</span>
                                    <span>Creative</span>
                                </div>
                            </div>
                            <GlassSelect label="Output Language" value={settings.aiConfig?.language || 'English'} onChange={e => onUpdateSettings(prev => ({...prev, aiConfig: {...prev.aiConfig!, language: e.target.value}}))}>
                                <option>English</option><option>Spanish</option><option>French</option><option>German</option><option>Japanese</option>
                            </GlassSelect>
                        </GlassCard>

                        <GlassCard className="p-8">
                            <SectionHeader title="Brand Intelligence" description="Core brand rules for all generated content." />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 ml-1">Brand DOs</label>
                                    <textarea rows={4} defaultValue={arrayToString(brandIntelligence.brandDo)} onBlur={(e) => handleDoDontChange('brandDo', e.target.value)} className="w-full px-4 py-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-gray-900 dark:text-white text-sm" placeholder="e.g. Use data, Keep it punchy" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2 ml-1">Brand DON'Ts</label>
                                    <textarea rows={4} defaultValue={arrayToString(brandIntelligence.brandDont)} onBlur={(e) => handleDoDontChange('brandDont', e.target.value)} className="w-full px-4 py-3 bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl focus:ring-2 focus:ring-red-500/50 outline-none text-gray-900 dark:text-white text-sm" placeholder="e.g. No jargon, No passive voice" />
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                );
            case 'connections':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <GlassCard className="p-8">
                            <SectionHeader title="Integrations" description="Connect your social platforms." />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['LinkedIn', 'X (Twitter)', 'Instagram', 'YouTube'].map(platform => (
                                    <div key={platform} className="flex items-center justify-between p-4 border border-gray-200 dark:border-white/10 rounded-xl bg-white/50 dark:bg-black/20">
                                        <div className="flex items-center gap-3">
                                            <GlobeIcon className="w-5 h-5 text-gray-500"/>
                                            <span className="font-bold text-gray-800 dark:text-white text-sm">{platform}</span>
                                        </div>
                                        <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                                            Connect
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                );
            case 'billing':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="p-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
                                <div>
                                    <p className="text-indigo-100 text-sm font-semibold uppercase tracking-wider mb-1">Current Plan</p>
                                    <h3 className="text-3xl font-bold">{settings.billing?.plan || 'Pro Plan'}</h3>
                                    <p className="text-indigo-100 text-sm mt-2 opacity-90">Renews on Nov 1, 2023</p>
                                </div>
                                <button className="mt-4 md:mt-0 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-50 transition-colors">
                                    Upgrade
                                </button>
                            </div>
                        </div>
                        <GlassCard className="p-8">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Credit Usage</span>
                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{settings.billing?.creditsUsed} / {settings.billing?.creditsLimit}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full w-[45%]"></div>
                            </div>
                        </GlassCard>
                    </div>
                );
        }
    };

    return (
        <div className="p-6 md:p-10 animate-fade-in min-h-full bg-[#FAFAFA] dark:bg-[#0B0C15]">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your workspace preferences.</p>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Nav */}
                    <nav className="flex flex-row lg:flex-col lg:w-64 shrink-0 gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                        isActive 
                                        ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm border border-gray-200 dark:border-white/5' 
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};
