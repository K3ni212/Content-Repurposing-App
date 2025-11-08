import React from 'react';

interface OnboardingModalProps {
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-lg w-full text-center transform transition-all animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome!</h2>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Ready to supercharge your content? Here's how it works:
        </p>
        <div className="mt-8 space-y-6 text-left">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">1</div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Create a Project</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Start by giving your project a name and providing your source content—paste text or upload a video for analysis.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">2</div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Generate Content</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Our AI will magically repurpose your content into multiple formats for different social platforms.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">3</div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Edit, Approve & Export</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Use the Kanban board to manage your new content pieces. Edit them, get them approved, and export them for publishing.</p>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md shadow-lg transition-transform hover:scale-105"
          >
            Let's Get Started!
          </button>
        </div>
      </div>
    </div>
  );
};
