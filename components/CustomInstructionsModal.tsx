
import React, { useState, useEffect } from 'react';

interface CustomInstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (instructions: { aboutUser: string; responseStyle: string }) => void;
    initialInstructions: { aboutUser: string; responseStyle: string };
}

export const CustomInstructionsModal: React.FC<CustomInstructionsModalProps> = ({ isOpen, onClose, onSave, initialInstructions }) => {
    const [aboutUser, setAboutUser] = useState(initialInstructions.aboutUser);
    const [responseStyle, setResponseStyle] = useState(initialInstructions.responseStyle);

    useEffect(() => {
        setAboutUser(initialInstructions.aboutUser);
        setResponseStyle(initialInstructions.responseStyle);
    }, [initialInstructions]);
    
    if (!isOpen) return null;

    const handleSave = () => {
        onSave({ aboutUser, responseStyle });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-2xl w-full transform transition-all animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Custom Instructions</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Provide details for a more tailored chat experience.</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-3xl leading-none">&times;</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="about-user" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            What would you like Gemini to know about you to provide better responses?
                        </label>
                        <textarea
                            id="about-user"
                            rows={5}
                            value={aboutUser}
                            onChange={(e) => setAboutUser(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"
                            placeholder="e.g., I'm a founder of a B2B SaaS startup in the marketing tech space. My audience consists of experienced marketers."
                        />
                    </div>
                    <div>
                        <label htmlFor="response-style" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                           How would you like Gemini to respond?
                        </label>
                        <textarea
                            id="response-style"
                            rows={5}
                            value={responseStyle}
                            onChange={(e) => setResponseStyle(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"
                            placeholder="e.g., Respond in a professional yet friendly tone. Use markdown for formatting. End responses with a relevant question."
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button type="button" onClick={onClose} className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSave} className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
