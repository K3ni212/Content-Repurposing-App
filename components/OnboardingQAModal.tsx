
import React, { useState } from 'react';
import { Settings } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { WorkflowIcon } from './icons/WorkflowIcon';
import { TemplateIcon } from './icons/TemplateIcon';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { BrandStudioIcon } from './icons/BrandStudioIcon';
import { UsersIcon } from './icons/UsersIcon';
import { MarketplaceIcon } from './icons/MarketplaceIcon';
import { RobotIcon } from './icons/RobotIcon';
import { analyzeCompanyBrand } from '../services/geminiService';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { XIcon } from './icons/XIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { TikTokIcon } from './icons/TikTokIcon';
import { FeatherIcon } from './icons/FeatherIcon';
import { EmailIcon } from './icons/EmailIcon';

interface OnboardingQAModalProps {
  onComplete: (data: Partial<Settings>, brandData: { sample: string, descriptors: string[] }) => void;
}

const roleOptions = [
    'Content Writer', 'Social Media Manager', 'Marketing Strategist', 'Copywriter', 
    'Thought Leader', 'Agency Owner', 'Brand Manager'
];

const goalsOptions = [
    'Thought Leadership', 'Lead Generation', 'Reach & Awareness', 
    'Conversion & Sales', 'Engagement & Community', 'Retention & Nurture'
];

const platformOptions = [
    'LinkedIn', 'X (Twitter)', 'Instagram', 'YouTube', 'TikTok', 'Blog / SEO', 'Newsletter'
];

const platformIcons: Record<string, React.FC<{ className?: string }>> = {
    'LinkedIn': LinkedInIcon,
    'X (Twitter)': XIcon,
    'Instagram': InstagramIcon,
    'YouTube': YouTubeIcon,
    'TikTok': TikTokIcon,
    'Blog / SEO': FeatherIcon,
    'Newsletter': EmailIcon,
};

const bottleneckOptions = [
    'Strategy & Planning', 'Writing Speed', 'Brand Consistency', 'Distribution & Scheduling', 'Performance Analysis'
];

const toolsOptions = ['Google Drive', 'Zapier', 'Analytics', 'Notion', 'Airtable'];

const featureOptions = [
    { id: 'agents', label: 'AI Agents', icon: <RobotIcon className="w-5 h-5"/>, desc: 'Specialized AI personas for strategy & review.' },
    { id: 'templates', label: 'AI Copywriter', icon: <TemplateIcon className="w-5 h-5"/>, desc: 'Access copywriting templates.' },
    { id: 'automation', label: 'Workflow Automation', icon: <WorkflowIcon className="w-5 h-5"/>, desc: 'Build automated pipelines.' },
    { id: 'analytics', label: 'Performance Analytics', icon: <AnalyticsIcon className="w-5 h-5"/>, desc: 'Track content metrics.' },
    { id: 'brand_studio', label: 'Brand Studio', icon: <BrandStudioIcon className="w-5 h-5"/>, desc: 'Manage voice and evergreen assets.' },
    { id: 'collaboration', label: 'Team & Collaboration', icon: <UsersIcon className="w-5 h-5"/>, desc: 'Invite team and manage roles.' },
];

export const OnboardingQAModal: React.FC<OnboardingQAModalProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [userRole, setUserRole] = useState(roleOptions[0]);
    const [industry, setIndustry] = useState('');
    const [primaryContentType, setPrimaryContentType] = useState('');
    const [goals, setGoals] = useState<string[]>([]);
    const [platforms, setPlatforms] = useState<string[]>([]);
    const [bottlenecks, setBottlenecks] = useState<string[]>([]);
    const [companyName, setCompanyName] = useState('');
    const [companyUrl, setCompanyUrl] = useState('');
    const [connectedTools, setConnectedTools] = useState<string[]>([]);
    const [brandSample, setBrandSample] = useState('');
    const [voiceDescriptorsInput, setVoiceDescriptorsInput] = useState('');
    const [enabledFeatures, setEnabledFeatures] = useState<string[]>(['agents', 'templates', 'automation']);
    
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleToggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
        setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    };

    const handleFeatureToggle = (featureId: string) => {
        setEnabledFeatures(prev => prev.includes(featureId) ? prev.filter(f => f !== featureId) : [...prev, featureId]);
    };

    const handleSubmit = () => {
        const descriptors = voiceDescriptorsInput.split(',').map(s => s.trim()).filter(Boolean);
        
        if (brandSample.trim() || descriptors.length > 0) {
            const settingsData: Partial<Settings> = { 
                userRole, 
                industry,
                primaryContentType,
                goals,
                platforms,
                bottlenecks,
                companyName, 
                companyUrl, 
                connectedTools,
                enabledFeatures
            };
            onComplete(settingsData, { sample: brandSample, descriptors });
        }
    };

    const handleAnalyzeBrand = async () => {
        if (!companyUrl) return;
        setIsAnalyzing(true);
        try {
            const result = await analyzeCompanyBrand(companyUrl);
            if (result) {
                if (result.voiceDescriptors && result.voiceDescriptors.length > 0) {
                    setVoiceDescriptorsInput(result.voiceDescriptors.join(', '));
                }
                if (result.summary) {
                    setBrandSample((prev) => prev ? `${prev}\n\n**About ${companyName || 'Company'}**:\n${result.summary}` : `**About ${companyName || 'Company'}**:\n${result.summary}`);
                }
            }
        } catch (error) {
            console.error("Analysis failed", error);
            // Ideally show a toast here, but for now we rely on the UI state
        } finally {
            setIsAnalyzing(false);
        }
    }

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <div className="animate-fade-in">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">What’s your role?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This helps us tailor the dashboard to your needs.</p>
                        <select value={userRole} onChange={e => setUserRole(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm">
                           {roleOptions.map(r => <option key={r}>{r}</option>)}
                        </select>
                         <button onClick={() => setStep(2)} className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.02]">Next</button>
                    </div>
                );
            case 2:
                return (
                    <div className="animate-fade-in">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Tell us more about your work</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
                                <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. SaaS, Health, Finance" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Content Type</label>
                                <input value={primaryContentType} onChange={e => setPrimaryContentType(e.target.value)} placeholder="e.g. Blog posts, Videos, Podcasts" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            </div>
                        </div>
                        <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">Back</button>
                            <button onClick={() => setStep(3)} disabled={!industry || !primaryContentType} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-indigo-500/30 disabled:bg-gray-400 disabled:shadow-none transition-transform hover:scale-[1.02]">Next</button>
                        </div>
                    </div>
                );
            case 3:
                return (
                     <div className="animate-fade-in">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">What are your strategic goals?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">We'll optimize content performance for these outcomes.</p>
                        <div className="grid grid-cols-2 gap-3">
                            {goalsOptions.map(goal => (
                                <button key={goal} onClick={() => handleToggle(setGoals, goal)} className={`p-3 border rounded-xl text-sm text-left transition-all ${goals.includes(goal) ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-300'}`}>
                                    {goal}
                                </button>
                            ))}
                        </div>
                         <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(2)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">Back</button>
                            <button onClick={() => setStep(4)} disabled={goals.length === 0} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-indigo-500/30 disabled:bg-gray-400 disabled:shadow-none transition-transform hover:scale-[1.02]">Next</button>
                        </div>
                    </div>
                );
            case 4:
                return (
                     <div className="animate-fade-in">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Where do you publish?</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {platformOptions.map(p => {
                                const Icon = platformIcons[p];
                                const isSelected = platforms.includes(p);
                                return (
                                    <button 
                                        key={p} 
                                        onClick={() => handleToggle(setPlatforms, p)} 
                                        className={`flex items-center p-3 border rounded-xl text-sm text-left transition-all ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-300'}`}
                                    >
                                        {Icon && <div className={`mr-3 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}><Icon className="w-5 h-5"/></div>}
                                        <span className={isSelected ? 'font-semibold' : 'font-medium text-gray-700 dark:text-gray-200'}>{p}</span>
                                    </button>
                                );
                            })}
                        </div>
                         <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(3)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">Back</button>
                            <button onClick={() => setStep(5)} disabled={platforms.length === 0} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-indigo-500/30 disabled:bg-gray-400 disabled:shadow-none transition-transform hover:scale-[1.02]">Next</button>
                        </div>
                    </div>
                );
            case 5:
                return (
                     <div className="animate-fade-in">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">What slows you down?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">We'll suggest specific AI Agents to help.</p>
                        <div className="grid grid-cols-1 gap-3">
                            {bottleneckOptions.map(b => (
                                <button key={b} onClick={() => handleToggle(setBottlenecks, b)} className={`p-3 border rounded-xl text-sm text-left transition-all ${bottlenecks.includes(b) ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-300'}`}>
                                    {b}
                                </button>
                            ))}
                        </div>
                         <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(4)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">Back</button>
                            <button onClick={() => setStep(6)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.02]">Next</button>
                        </div>
                    </div>
                );
            case 6:
                 return (
                    <div className="animate-fade-in">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Tell us about your company</h3>
                        <div className="space-y-4 mt-4">
                             <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company Name" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                             <div className="flex gap-2">
                                <input value={companyUrl} onChange={e => setCompanyUrl(e.target.value)} placeholder="Company URL" className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                                <button 
                                    onClick={handleAnalyzeBrand}
                                    disabled={!companyUrl || isAnalyzing}
                                    className="flex items-center justify-center gap-2 px-4 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-semibold rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900 disabled:opacity-50 transition-colors min-w-[120px]"
                                >
                                    {isAnalyzing ? <SpinnerIcon className="w-5 h-5"/> : <SparklesIcon className="w-5 h-5"/>}
                                    {isAnalyzing ? 'Scanning...' : 'Analyze'}
                                </button>
                             </div>
                             {isAnalyzing && <p className="text-xs text-purple-600 dark:text-purple-400 animate-pulse">Scanning website for voice, tone, and style...</p>}
                             {(voiceDescriptorsInput || brandSample) && !isAnalyzing && (
                                 <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-300 animate-fade-in">
                                     <p><strong>Success!</strong> Brand data extracted. Review it in step 9.</p>
                                 </div>
                             )}
                        </div>
                         <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(5)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">Back</button>
                            <button onClick={() => setStep(7)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.02]">Next</button>
                        </div>
                    </div>
                );
            case 7:
                return (
                     <div className="animate-fade-in">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Customize your workspace</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select the tools you want on your dashboard.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                           {featureOptions.map(feature => {
                               const isSelected = enabledFeatures.includes(feature.id);
                               return (
                                   <button 
                                        key={feature.id} 
                                        onClick={() => handleFeatureToggle(feature.id)} 
                                        className={`flex items-center p-3 border rounded-xl text-left transition-all ${
                                            isSelected 
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 shadow-sm' 
                                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-80 hover:opacity-100'
                                        }`}
                                   >
                                        <div className={`p-2 rounded-full mr-3 shrink-0 ${isSelected ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300' : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300'}`}>
                                            {feature.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold ${isSelected ? 'text-indigo-800 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-200'}`}>{feature.label}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{feature.desc}</p>
                                        </div>
                                        {isSelected && <div className="ml-2 text-indigo-600 dark:text-indigo-400"><CheckIcon className="w-5 h-5"/></div>}
                                   </button>
                               );
                           })}
                        </div>
                         <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(6)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">Back</button>
                            <button onClick={() => setStep(8)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.02]">Next</button>
                        </div>
                    </div>
                );
            case 8:
                return (
                     <div className="animate-fade-in">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Connect your existing tools?</h3>
                         <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">(Optional) This will help us suggest automations.</p>
                        <div className="grid grid-cols-2 gap-3">
                           {toolsOptions.map(tool => (
                                <button key={tool} onClick={() => handleToggle(setConnectedTools, tool)} className={`p-3 border rounded-xl text-sm text-left transition-all ${connectedTools.includes(tool) ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-300'}`}>
                                    {tool}
                                </button>
                            ))}
                        </div>
                         <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(7)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">Back</button>
                            <button onClick={() => setStep(9)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.02]">Next</button>
                        </div>
                    </div>
                );
            case 9:
                return (
                    <div className="animate-fade-in">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Establish your Brand Intelligence</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Our Agents use this to ensure consistency.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand Voice (3 adjectives)</label>
                                <input 
                                    value={voiceDescriptorsInput} 
                                    onChange={e => setVoiceDescriptorsInput(e.target.value)} 
                                    placeholder="e.g. Witty, Professional, Empathetic" 
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sample Content (Optional)</label>
                                <textarea 
                                    value={brandSample} 
                                    onChange={e => setBrandSample(e.target.value)} 
                                    rows={4} 
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                                    placeholder="Paste a post or article that represents your best writing..."
                                ></textarea>
                            </div>
                        </div>

                         <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(8)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">Back</button>
                            <button onClick={handleSubmit} disabled={!voiceDescriptorsInput.trim() && !brandSample.trim()} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-emerald-500/30 disabled:bg-gray-400 disabled:shadow-none transition-transform hover:scale-[1.02]">Finish Setup</button>
                        </div>
                    </div>
                )
            default:
                return null;
        }
    }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-lg w-full transform transition-all animate-fade-in border border-gray-200 dark:border-gray-800 relative overflow-hidden">
        {/* Top Gradient Border */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient bg-200%"></div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome!</h2>
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">Step {step}/9</div>
        </div>
        <div>
            {renderStep()}
        </div>
      </div>
    </div>
  );
};