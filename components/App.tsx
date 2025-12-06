
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ProjectCard } from './ProjectCard';
import { KanbanPage } from './KanbanPage';
import { EditorPanel } from './EditorPanel';
import { NewProjectForm } from './NewProjectForm';
import { SettingsPage } from './SettingsPage';
import { OnboardingQAModal } from './OnboardingQAModal';
import { Toast } from './Toast';
import { Project, ContentPiece, ContentStatus, Settings, ContentFormat, BrandVoice, Workflow, BrandIntelligence } from '../types';
import { GeneratingLoader } from './GeneratingLoader';
import { ProjectEmptyState } from './ProjectEmptyState';
import { ChatPage } from './ChatPage';
import { ExportPage } from './ExportPage';
import { LoginPage } from './LoginPage';
import { WorkflowPage } from './WorkflowPage';
import { ComingSoonPage } from './ComingSoonPage';
import { ResumeProjectCard } from './ResumeProjectCard';
import { SettingsIcon } from './icons/SettingsIcon';
import { SkeletonDashboard } from './SkeletonDashboard';
import { CustomizingLoader } from './CustomizingLoader';
import { DashboardNameLoader } from './DashboardNameLoader';
import { ContentPlannerPage } from './ContentPlannerPage';
import { TeamValueWidget } from './TeamValueWidget';
import { AnalyticsPage } from './AnalyticsPage';
import { BrandStudioPage } from './BrandStudioPage';

const defaultSettings: Settings = {
    theme: 'dark', 
    hasCompletedOnboarding: false,
    userRole: '',
    companySize: '',
    goals: [],
    companyName: '',
    companyUrl: '',
    connectedTools: [],
    enabledFeatures: [],
    industry: '',
    primaryContentType: '',
    platforms: [],
    bottlenecks: [],
    teamMembers: [],
    aiConfig: { creativity: 0.7, model: 'gemini-2.5-flash', language: 'English' },
    notificationPreferences: { email: true, inApp: true },
    integrationStatus: {},
    billing: { plan: 'Pro', creditsUsed: 4500, creditsLimit: 10000 },
    avgEditorHourlyRate: 50,
}

const defaultBrandIntelligence: BrandIntelligence = {
    voiceDescriptors: [],
    preferredCTAs: [],
    preferredHashtags: [],
    toneSamples: [],
    contentSamples: [],
    vocabulary: [],
    avoidCompetitors: [],
    brandDo: [],
    brandDont: [],
    ctaRules: [],
    industryExpertise: [],
    voice_rules: [],
    forbidden_terms: ['synergy', 'innovative', 'disrupt'],
    compliance_threshold: 70,
    default_cta: 'Click here'
};

const getUsersFromStorage = () => {
    try {
        const users = localStorage.getItem('repurposeAI_users');
        return users ? JSON.parse(users) : {};
    } catch {
        return {};
    }
};

const saveUsersToStorage = (users: any) => {
    localStorage.setItem('repurposeAI_users', JSON.stringify(users));
};


const App: React.FC = () => {
    // Auth State
    const [users, setUsers] = useState(() => getUsersFromStorage());
    const [currentUser, setCurrentUser] = useState<string | null>(() => localStorage.getItem('currentUser'));

    // Onboarding
    const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
    
    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [isMainSidebarCollapsed, setIsMainSidebarCollapsed] = useState<boolean>(false);
    const [currentView, setCurrentView] = useState<string>('projects');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; onUndo?: () => void } | null>(null);

    // Modals
    const [isNewProjectFormOpen, setIsNewProjectFormOpen] = useState<boolean>(false);
    const [newProjectInitialTemplate, setNewProjectInitialTemplate] = useState<any>(null);

    // Data State
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [projects, setProjects] = useState<Project[]>([]);
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);
    const [brandIntelligence, setBrandIntelligence] = useState<BrandIntelligence>(defaultBrandIntelligence);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedContent, setSelectedContent] = useState<ContentPiece | null>(null);

    const [recentlyDeletedProject, setRecentlyDeletedProject] = useState<Project | null>(null);
    const [recentlyDeletedWorkflow, setRecentlyDeletedWorkflow] = useState<Workflow | null>(null);
    const deleteUndoTimer = useRef<number | null>(null);

    const [isSigningUp, setIsSigningUp] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isCustomizing, setIsCustomizing] = useState(false);

    useEffect(() => {
        saveUsersToStorage(users);
    }, [users]);

    // Load data
    useEffect(() => {
        if (currentUser) {
            const projectsKey = `${currentUser}_projects`;
            const settingsKey = `${currentUser}_settings`;
            const brandVoicesKey = `${currentUser}_brandVoices`;
            const brandIntelligenceKey = `${currentUser}_brandIntelligence`;
            const workflowsKey = `${currentUser}_workflows`;

            try {
                const savedProjectsJSON = localStorage.getItem(projectsKey);
                 if (savedProjectsJSON) {
                    const parsedProjects = JSON.parse(savedProjectsJSON);
                    const sanitizedProjects = Array.isArray(parsedProjects) ? parsedProjects.map((p: any) => {
                        // ... existing sanitization logic ...
                        return p;
                    }).filter((p: any) => p !== null) : [];
                    setProjects(sanitizedProjects); 
                }
            } catch (e) {
                setProjects([]);
            }

            try {
                const savedSettingsJSON = localStorage.getItem(settingsKey);
                if (savedSettingsJSON) { setSettings({ ...defaultSettings, ...JSON.parse(savedSettingsJSON) }); } 
                else { setSettings(defaultSettings); }
            } catch (e) { setSettings(defaultSettings); }
            
            try {
                const savedBrandVoicesJSON = localStorage.getItem(brandVoicesKey);
                setBrandVoices(savedBrandVoicesJSON ? JSON.parse(savedBrandVoicesJSON) : []);
            } catch (e) { setBrandVoices([]); }
            
            try {
                const savedBrandIntelligenceJSON = localStorage.getItem(brandIntelligenceKey);
                if(savedBrandIntelligenceJSON) { setBrandIntelligence({...defaultBrandIntelligence, ...JSON.parse(savedBrandIntelligenceJSON)}); }
                else { setBrandIntelligence(defaultBrandIntelligence); }
            } catch (e) { setBrandIntelligence(defaultBrandIntelligence); }

            try {
                const savedWorkflowsJSON = localStorage.getItem(workflowsKey);
                setWorkflows(savedWorkflowsJSON ? JSON.parse(savedWorkflowsJSON) : []);
            } catch (e) { setWorkflows([]); }
        }
    }, [currentUser]);

    // Persist data
    useEffect(() => { if (currentUser) localStorage.setItem(`${currentUser}_settings`, JSON.stringify(settings)); }, [settings, currentUser]);
    useEffect(() => { if (currentUser) localStorage.setItem(`${currentUser}_projects`, JSON.stringify(projects)); }, [projects, currentUser]);
    useEffect(() => { if (currentUser) localStorage.setItem(`${currentUser}_workflows`, JSON.stringify(workflows)); }, [workflows, currentUser]);
    useEffect(() => { if (currentUser) localStorage.setItem(`${currentUser}_brandVoices`, JSON.stringify(brandVoices)); }, [brandVoices, currentUser]);
    useEffect(() => { if (currentUser) localStorage.setItem(`${currentUser}_brandIntelligence`, JSON.stringify(brandIntelligence)); }, [brandIntelligence, currentUser]);

    // Theme effect
    useEffect(() => {
        if (settings.theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [settings.theme]);

    useEffect(() => { if (currentUser && !settings.hasCompletedOnboarding && !isSigningUp) setShowOnboarding(true); }, [currentUser, settings.hasCompletedOnboarding, isSigningUp]);

    const showToast = useCallback((message: string, type: 'success' | 'error', onUndo?: () => void) => setToast({ message, type, onUndo }), []);

    // ... Auth handlers (handleSignUp, handleLogin, etc.) kept same as before ... 
    const handleSignUp = useCallback(async (name: string, email: string, password: string) => {
        if (users[email]) {
            showToast('An account with this email already exists. Please sign in.', 'error');
            throw new Error('User already exists');
        }

        setIsSigningUp(true);
        await new Promise(resolve => setTimeout(resolve, 4500));

        setUsers(prev => ({ ...prev, [email]: { password, name } }));
        localStorage.setItem('currentUser', email);
        setCurrentUser(email);
        
        setIsSigningUp(false);
        showToast(`Welcome, ${name}! Your account has been created.`, 'success');
    }, [users, showToast]);

    const handleLogin = useCallback(async (email: string, password: string) => {
        const user = users[email];
        if (!user) { showToast('Account not found. Please sign up first.', 'error'); throw new Error('Account not found'); }
        if (user.password !== password) { showToast('Incorrect password. Please try again.', 'error'); throw new Error('Incorrect password'); }
        
        setIsLoggingIn(true);
        await new Promise(resolve => setTimeout(resolve, 2500));

        localStorage.setItem('currentUser', email);
        setCurrentUser(email);
        setIsLoggingIn(false);
        showToast(`Welcome back!`, 'success');
    }, [users, showToast]);

    const handleGoogleLogin = useCallback(async () => {
        const googleUser = { name: 'Alex Doe', email: 'alex.doe@example.com', googleId: '10987654321-google-id' };
        const user = users[googleUser.email];
        if (!user) {
            setIsSigningUp(true);
            await new Promise(resolve => setTimeout(resolve, 4500));

            setUsers(prev => ({ ...prev, [googleUser.email]: { name: googleUser.name, googleId: googleUser.googleId } }));
            
            const settingsForGoogleUser = { ...defaultSettings, hasCompletedOnboarding: true };
            localStorage.setItem(`${googleUser.email}_settings`, JSON.stringify(settingsForGoogleUser));
            setSettings(settingsForGoogleUser);

            localStorage.setItem('currentUser', googleUser.email);
            setCurrentUser(googleUser.email);
            
            setIsSigningUp(false);
            showToast(`Welcome, ${googleUser.name}! Your account has been created.`, 'success');
        } else {
            setIsLoggingIn(true);
            await new Promise(resolve => setTimeout(resolve, 2500));

            if (!user.googleId) {
                setUsers(prev => ({ ...prev, [googleUser.email]: { ...prev[googleUser.email], googleId: googleUser.googleId } }));
                showToast(`Your Google account has been linked, ${user.name || 'user'}!`, 'success');
            }
            
            const savedSettingsJSON = localStorage.getItem(`${googleUser.email}_settings`);
            if (savedSettingsJSON) {
                 setSettings({ ...defaultSettings, ...JSON.parse(savedSettingsJSON) });
            }

            localStorage.setItem('currentUser', googleUser.email);
            setCurrentUser(googleUser.email);
            setIsLoggingIn(false);
            showToast(`Welcome back, ${user?.name || googleUser.name}!`, 'success');
        }
    }, [users, showToast]);
    
    const handleLogout = useCallback(() => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        setProjects([]); setWorkflows([]); setSettings(defaultSettings); setBrandVoices([]); setBrandIntelligence(defaultBrandIntelligence);
        setCurrentView('projects'); setSelectedProjectId(null); setSelectedContent(null);
        showToast('You have been logged out.', 'success');
    }, [showToast]);

    // ... Project handlers ...

    const handleNavigate = useCallback((view: string, id?: string) => {
        if (view === 'new-project') {
            setIsNewProjectFormOpen(true);
            setNewProjectInitialTemplate(null);
        }
        else if (view === 'kanban' && id) {
            setSelectedProjectId(id);
            setCurrentView('kanban');
        } else {
            setCurrentView(view);
            if (view === 'projects') setSelectedProjectId(null);
        }
        setIsSidebarOpen(false);
    }, []);

    const handleCreateProject = useCallback((newProject: Project) => {
        setIsLoading(true);
        // Show loading screen for 3 seconds to ensure user sees the "generation" process
        setTimeout(() => {
            setProjects(prev => [newProject, ...prev]);
            setSelectedProjectId(newProject.id);
            setCurrentView('kanban');
            setIsNewProjectFormOpen(false);
            setNewProjectInitialTemplate(null);
            setIsLoading(false);
            showToast('Project created successfully!', 'success');
        }, 3000);
    }, [showToast]);

    const handleSelectProject = useCallback((projectId: string) => {
        setSelectedProjectId(projectId);
        setCurrentView('kanban');
    }, []);

    const handleDeleteProject = useCallback((projectId: string) => {
        setProjects(prev => {
            const projectToDelete = prev.find(p => p.id === projectId);
            if (!projectToDelete) return prev;
            
            if (deleteUndoTimer.current) clearTimeout(deleteUndoTimer.current);
            setRecentlyDeletedProject(projectToDelete);
            
            if (selectedProjectId === projectId) { setSelectedProjectId(null); setCurrentView('projects'); }
            showToast('Project deleted.', 'success', handleUndoDeleteProject);
            deleteUndoTimer.current = window.setTimeout(() => { setRecentlyDeletedProject(null); deleteUndoTimer.current = null; }, 5000);
            
            return prev.filter(p => p.id !== projectId);
        });
    }, [selectedProjectId, showToast]);

    const handleUndoDeleteProject = useCallback(() => {
        if (deleteUndoTimer.current) { clearTimeout(deleteUndoTimer.current); deleteUndoTimer.current = null; }
        if (recentlyDeletedProject) {
            setProjects(prev => [recentlyDeletedProject, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setRecentlyDeletedProject(null);
            showToast('Project restored.', 'success');
        }
    }, [recentlyDeletedProject, showToast]);

    const handleUpdateContentPiece = useCallback((updatedContent: ContentPiece, projectId: string) => {
        setProjects(prevProjects =>
            prevProjects.map(p =>
                p.id === projectId
                    ? { ...p, lastModified: new Date().toISOString(), contentPieces: p.contentPieces.map(cp => cp.id === updatedContent.id ? updatedContent : cp) }
                    : p
            )
        );
    }, []);

    const handleDeleteContentPiece = useCallback(() => {
        if (!selectedContent || !selectedProjectId) return;
        setProjects(prevProjects =>
            prevProjects.map(p =>
                p.id === selectedProjectId
                    ? { ...p, lastModified: new Date().toISOString(), contentPieces: p.contentPieces.filter(cp => cp.id !== selectedContent.id) }
                    : p
            )
        );
        setSelectedContent(null);
        showToast('Content piece deleted.', 'success');
    }, [selectedContent, selectedProjectId, showToast]);

    const handleSaveBrandVoice = useCallback((newBrandVoice: { name: string, description: string }) => {
        const voice: BrandVoice = { ...newBrandVoice, id: `bv_${Date.now()}` };
        setBrandVoices(prev => [...prev, voice]);
        showToast(`Brand voice "${newBrandVoice.name}" saved!`, 'success');
    }, [showToast]);

    const handleSaveWorkflow = useCallback((updatedWorkflow: Workflow) => {
        setWorkflows(prev => {
            const exists = prev.some(w => w.id === updatedWorkflow.id);
            if (exists) return prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w);
            return [...prev, updatedWorkflow];
        });
        showToast(`Workflow "${updatedWorkflow.name}" saved!`, 'success');
    }, [showToast]);

    const handleDeleteWorkflow = useCallback((workflowId: string) => {
        setWorkflows(prev => {
            const workflowToDelete = prev.find(w => w.id === workflowId);
            if (!workflowToDelete) return prev;
            
            if (deleteUndoTimer.current) clearTimeout(deleteUndoTimer.current);
            setRecentlyDeletedWorkflow(workflowToDelete);
            
            showToast('Workflow deleted.', 'success', handleUndoDeleteWorkflow);
            deleteUndoTimer.current = window.setTimeout(() => { setRecentlyDeletedWorkflow(null); deleteUndoTimer.current = null; }, 5000);
            
            return prev.filter(w => w.id !== workflowId);
        });
    }, [showToast]);

    const handleUndoDeleteWorkflow = useCallback(() => {
        if (deleteUndoTimer.current) { clearTimeout(deleteUndoTimer.current); deleteUndoTimer.current = null; }
        if (recentlyDeletedWorkflow) {
            setWorkflows(prev => [recentlyDeletedWorkflow, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setRecentlyDeletedWorkflow(null);
            showToast('Workflow restored.', 'success');
        }
    }, [recentlyDeletedWorkflow, showToast]);

    const handleCreateProjectFromTemplate = (data: any) => {
        setNewProjectInitialTemplate(data.initialTemplate);
        setIsNewProjectFormOpen(true);
    };

    const handleOnboardingComplete = useCallback((data: Partial<Settings>, brandData: { sample: string, descriptors: string[] }) => {
        setIsCustomizing(true);

        // Simulate customization processing time
        setTimeout(() => {
            setSettings(prev => ({...prev, ...data, hasCompletedOnboarding: true }));
            
            setBrandIntelligence(prev => ({ 
                ...prev, 
                toneSamples: brandData.sample ? [brandData.sample] : prev.toneSamples,
                voiceDescriptors: brandData.descriptors.length > 0 ? brandData.descriptors : prev.voiceDescriptors
            }));

            setShowOnboarding(false);
            setIsCustomizing(false);
            showToast("Your profile is set up!", 'success');
        }, 2500);
    }, [showToast]);

    if (isSigningUp) return <SkeletonDashboard />;
    if (isLoggingIn) return <DashboardNameLoader />;
    if (!currentUser) return <LoginPage onLogin={handleLogin} onSignUp={handleSignUp} onGoogleLogin={handleGoogleLogin} />; 

    const currentUserDetails = currentUser ? users[currentUser] : null;
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const resumeProject = projects.length > 0 
        ? [...projects].sort((a,b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())[0] 
        : null;

    const renderMainContent = () => {
        if (isLoading && isNewProjectFormOpen) return <div className="w-full h-full flex items-center justify-center"><GeneratingLoader /></div>;
        
        if (currentView.startsWith('coming-soon-')) {
            const feature = currentView.split('coming-soon-')[1];
            return <ComingSoonPage title="Coming Soon" description="This feature is under construction." icon={<SettingsIcon/>} />;
        }

        switch(currentView) {
            case 'kanban':
                if (selectedProject) return <KanbanPage project={selectedProject} onBack={() => { setCurrentView('projects'); setSelectedProjectId(null); }} onDrop={()=>{}} onCardClick={setSelectedContent} onUpdateProject={()=>{}} />;
                return null;
            case 'chat': return <ChatPage currentUser={currentUser} />;
            case 'brand-studio': return <BrandStudioPage brandVoices={brandVoices} brandIntelligence={brandIntelligence} />;
            case 'workflow': return <WorkflowPage workflows={workflows} onSave={handleSaveWorkflow} onDelete={handleDeleteWorkflow} brandIntelligence={brandIntelligence} onCreateProject={handleCreateProjectFromTemplate} />;
            case 'analytics': return <AnalyticsPage projects={projects} />;
            case 'export': return <ExportPage projects={projects} onUpdateContent={handleUpdateContentPiece} showToast={showToast} />;
            case 'planner': return <ContentPlannerPage projects={projects} onUpdateContent={handleUpdateContentPiece} onCardClick={(c) => { setSelectedContent(c); setIsNewProjectFormOpen(false); }} />;
            case 'settings': return <SettingsPage settings={settings} onUpdateSettings={setSettings} userName={currentUserDetails?.name} userEmail={currentUser} brandIntelligence={brandIntelligence} onUpdateBrandIntelligence={setBrandIntelligence} />;
            case 'projects': default: return (
                 <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
                     <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                                Good Morning, {currentUserDetails?.name?.split(' ')[0] || 'Creator'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                                Ready to scale your content output today?
                            </p>
                        </div>
                        <div className="flex gap-3 mt-4 md:mt-0">
                            <button onClick={() => { setIsNewProjectFormOpen(true); setNewProjectInitialTemplate(null); }} className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 flex items-center">
                                <span className="mr-2 text-xl leading-none">+</span> New Project
                            </button>
                        </div>
                     </div>
                     
                     <TeamValueWidget projects={projects} hourlyRate={settings.avgEditorHourlyRate} />

                     <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        Recent Projects
                     </h2>
                     
                     {projects.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {projects.map(project => (
                                <ProjectCard key={project.id} project={project} onSelect={handleSelectProject} onDelete={handleDeleteProject}/>
                            ))}
                        </div>
                     ) : ( <ProjectEmptyState /> )}
                </div>
            );
        }
    };

    return (
        <div className={`flex h-screen bg-[#FAFAFA] dark:bg-[#0B0C15] text-gray-900 dark:text-gray-100 overflow-hidden relative selection:bg-indigo-500 selection:text-white transition-colors duration-500`}>
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-500/5 dark:bg-indigo-900/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 dark:bg-violet-900/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

            <Sidebar currentView={currentView} onNavigate={handleNavigate} isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} isSidebarCollapsed={isMainSidebarCollapsed} onToggleCollapse={() => setIsMainSidebarCollapsed(prev => !prev)} userRole={settings.userRole} enabledFeatures={settings.enabledFeatures} />
            
            <div className={`flex-1 flex flex-col overflow-hidden ${isMainSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'} transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] relative z-10`}>
                <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} currentProjectName={selectedProject?.name} projects={projects} workflows={workflows} onNavigate={handleNavigate} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth custom-scrollbar">{renderMainContent()}</main>
            </div>
            
            {isNewProjectFormOpen && !isLoading && (
                <NewProjectForm 
                    onClose={() => { setIsNewProjectFormOpen(false); setNewProjectInitialTemplate(null); }} 
                    onProjectCreated={handleCreateProject} 
                    showToast={showToast} 
                    brandVoices={brandVoices} 
                    onSaveBrandVoice={handleSaveBrandVoice} 
                    brandIntelligence={brandIntelligence}
                    initialTemplate={newProjectInitialTemplate}
                />
            )}

            <EditorPanel content={selectedContent} onClose={() => setSelectedContent(null)} onUpdate={handleUpdateContentPiece} onDelete={handleDeleteContentPiece} showToast={showToast} groundingMetadata={selectedProject?.groundingMetadata} projects={projects} brandIntelligence={brandIntelligence} />
            
            {showOnboarding && <OnboardingQAModal onComplete={handleOnboardingComplete} />}
            
            {isCustomizing && <CustomizingLoader />}
            
            {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} onUndo={toast.onUndo} />}
        </div>
    );
};

export default App;
