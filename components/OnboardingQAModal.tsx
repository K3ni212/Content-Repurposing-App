import React, { useState } from 'react';

interface OnboardingQAModalProps {
  onComplete: (data: { userRole: string; companySize: string; goals: string[] }) => void;
}

const goalsOptions = [
    'Save time on content creation',
    'Increase social media engagement',
    'Generate more leads',
    'Build brand authority',
    'Repurpose existing assets',
    'Explore AI capabilities',
];

export const OnboardingQAModal: React.FC<OnboardingQAModalProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [userRole, setUserRole] = useState('Founder / CEO');
    const [companySize, setCompanySize] = useState('Just me');
    const [goals, setGoals] = useState<string[]>([]);

    const handleGoalToggle = (goal: string) => {
        setGoals(prev => 
            prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
        );
    }

    const handleSubmit = () => {
        if (goals.length > 0) {
            onComplete({ userRole, companySize, goals });
        }
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">What is your role?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This helps us personalize your experience.</p>
                        <select value={userRole} onChange={e => setUserRole(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            <option>Founder / CEO</option>
                            <option>Marketer</option>
                            <option>Content Creator</option>
                            <option>Agency</option>
                            <option>Other</option>
                        </select>
                         <button onClick={() => setStep(2)} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md">Next</button>
                    </div>
                );
            case 2:
                 return (
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">What is your company size?</h3>
                         <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Knowing your team size helps us suggest workflows.</p>
                        <select value={companySize} onChange={e => setCompanySize(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            <option>Just me</option>
                            <option>2-10 people</option>
                            <option>11-50 people</option>
                            <option>50+ people</option>
                        </select>
                         <div className="flex justify-between mt-6">
                            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">Back</button>
                            <button onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md">Next</button>
                        </div>
                    </div>
                );
            case 3:
                return (
                     <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">What are your main goals?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select all that apply. This will help us tailor content suggestions.</p>
                        <div className="grid grid-cols-2 gap-2">
                            {goalsOptions.map(goal => (
                                <button key={goal} onClick={() => handleGoalToggle(goal)}
                                    className={`p-3 border rounded-lg text-sm text-left ${goals.includes(goal) ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}
                                >
                                    {goal}
                                </button>
                            ))}
                        </div>
                         <div className="flex justify-between mt-6">
                            <button onClick={() => setStep(2)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">Back</button>
                            <button onClick={handleSubmit} disabled={goals.length === 0} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-md disabled:bg-gray-400">Finish Setup</button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-lg w-full transform transition-all animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome! Let's get started.</h2>
        </div>
        <div>
            {renderStep()}
        </div>
      </div>
    </div>
  );
};