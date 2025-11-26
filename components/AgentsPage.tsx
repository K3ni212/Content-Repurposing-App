
import React, { useState } from 'react';
import { AGENTS } from '../services/agentService';
import { AgentCard } from './AgentCard';
import { AgentInteractionModal } from './AgentInteractionModal';
import { RobotIcon } from './icons/RobotIcon';
import { BrandIntelligence } from '../types';

interface AgentsPageProps {
    brandIntelligence: BrandIntelligence;
    showToast: (msg: string, type: 'success' | 'error') => void;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({ brandIntelligence, showToast }) => {
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

    const activeAgent = AGENTS.find(a => a.id === selectedAgent);

    return (
        <div className="p-4 md:p-8 animate-fade-in relative">
            {/* Header Glow */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50/80 to-transparent dark:from-indigo-900/20 dark:to-transparent pointer-events-none -z-10"></div>

            <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="p-4 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900 rounded-2xl text-indigo-600 dark:text-indigo-300 shadow-sm animate-gradient bg-200%">
                    <RobotIcon className="w-10 h-10" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">AI Agents</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Specialized AI personas to automate strategy, creation, and review tasks.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
                {AGENTS.map(agent => (
                    <AgentCard 
                        key={agent.id} 
                        agent={agent} 
                        onClick={() => setSelectedAgent(agent.id)} 
                    />
                ))}
            </div>

            {activeAgent && (
                <AgentInteractionModal 
                    agent={activeAgent} 
                    onClose={() => setSelectedAgent(null)} 
                    brandIntelligence={brandIntelligence}
                    showToast={showToast}
                />
            )}
        </div>
    );
};