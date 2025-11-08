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
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4" onClick={handleClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-lg w-full transform transition-all animate-fade-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Add New Brand Voice</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="bv-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input
                            id="bv-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Witty & Sarcastic"
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="bv-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                            id="bv-description"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the tone, style, and any key phrases to use or avoid."
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md">Cancel</button>
                    <button onClick={handleSave} disabled={!name.trim() || !description.trim()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:bg-blue-400">Save</button>
                </div>
            </div>
        </div>
    );
};