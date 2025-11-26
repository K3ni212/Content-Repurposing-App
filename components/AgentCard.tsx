
import React from 'react';
import { Agent } from '../types';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface AgentCardProps {
    agent: Agent;
    onClick: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick }) => {
    const Icon = agent.icon;

    return (
        <div 
            onClick={onClick}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-xl hover:shadow-indigo-500/10 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 group relative overflow-hidden hover:-translate-y-1 active:scale-[0.99]"
        >
            <div className={`absolute top-0 right-0 p-2 rounded-bl-xl ${agent.color} text-white opacity-10 group-hover:opacity-20 transition-opacity duration-500`}>
                <Icon className="w-12 h-12 transform group-hover:rotate-12 transition-transform duration-500" />
            </div>
            
            <div className="flex items-start mb-4">
                <div className={`p-3 rounded-lg ${agent.color} text-white mr-4 shadow-sm group-hover:shadow-lg group-hover:shadow-${agent.color}/40 transition-all duration-300`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{agent.name}</h3>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        {agent.role}
                    </span>
                </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 line-clamp-2">
                {agent.description}
            </p>
            
            <div className="space-y-2 mb-6">
                {agent.capabilities.slice(0, 3).map((cap, i) => (
                    <div key={i} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mr-2 group-hover:${agent.color.replace('bg-', 'bg-')} transition-colors`} />
                        {cap}
                    </div>
                ))}
            </div>
            
            <div className="flex justify-end">
                <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center group-hover:translate-x-1 transition-transform duration-200">
                    Activate Agent <ArrowRightIcon className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
            </div>
        </div>
    );
};