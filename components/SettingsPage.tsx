
import React from 'react';
import { UserIcon } from './icons/UserIcon';
import { Settings } from '../types';

interface SettingsPageProps {
    settings: Settings;
    onUpdateSettings: (newSettings: Settings | ((prev: Settings) => Settings)) => void;
    userName?: string;
    userEmail?: string;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onUpdateSettings, userName, userEmail }) => {
    
    const handleThemeToggle = () => {
        onUpdateSettings(prev => ({...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        onUpdateSettings(prev => ({...prev, [name]: value}));
    }

    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

            <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Profile</h2>
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <UserIcon className="w-8 h-8 text-gray-500" />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-gray-900 dark:text-white">{userName || 'User'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{userEmail || 'no-email@example.com'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">About You</h2>
                     <div className="space-y-4">
                        <div>
                            <label htmlFor="userRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Role</label>
                            <select id="userRole" name="userRole" value={settings.userRole} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                <option>Founder / CEO</option>
                                <option>Marketer</option>
                                <option>Content Creator</option>
                                <option>Agency</option>
                                <option>Other</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Size</label>
                            <select id="companySize" name="companySize" value={settings.companySize} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                <option>Just me</option>
                                <option>2-10 people</option>
                                <option>11-50 people</option>
                                <option>50+ people</option>
                            </select>
                        </div>
                          <div>
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Primary Goals</span>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{settings.goals.join(', ') || 'Not set'}</p>
                        </div>
                    </div>
                </div>


                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Preferences</h2>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Theme</span>
                        <div className="flex items-center rounded-full bg-gray-200 dark:bg-gray-700 p-1">
                            <button onClick={handleThemeToggle} className={`px-3 py-1 rounded-full text-sm ${settings.theme === 'light' ? 'bg-white shadow' : ''}`}>Light</button>
                            <button onClick={handleThemeToggle} className={`px-3 py-1 rounded-full text-sm ${settings.theme === 'dark' ? 'bg-gray-800 shadow text-white' : ''}`}>Dark</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
