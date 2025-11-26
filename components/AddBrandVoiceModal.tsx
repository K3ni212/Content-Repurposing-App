
import React, { useState } from 'react';

interface AddBrandVoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (brandVoice: { name: string, description: string }) => void;
}

export const AddBrandVoiceModal: React.FC<AddBrandVoiceModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (name.trim() && description.trim()) {
            onSave({ name, description });
            setName('');
            setDescription('');
            onClose();
        }
    };
    
    const handleClose = () => {
        setName('');
        setDescription('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm" onClick={handleClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-lg w-full transform transition-all animate-fade-in relative overflow-hidden border border-gray-100 dark:border-gray-800" onClick={e => e.stopPropagation()}>
                {/* Gradient Top */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient bg-200%"></div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 mt-2">Add New Brand Voice</h2>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="bv-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name</label>
                        <input
                            id="bv-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Witty & Sarcastic"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="bv-description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea
                            id="bv-description"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the tone, style, and any key phrases to use or avoid."
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
                        />
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={handleClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
                    <button onClick={handleSave} disabled={!name.trim() || !description.trim()} className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/20 disabled:bg-gray-400 disabled:shadow-none transition-transform hover:scale-[1.02] active:scale-95">Save Voice</button>
                </div>
            </div>
        </div>
    );
};