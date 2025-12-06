
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProjectCard } from './components/ProjectCard';
import { KanbanPage } from './components/KanbanPage';
import { EditorPanel } from './components/EditorPanel';
import { NewProjectForm } from './components/NewProjectForm';
import { SettingsPage } from './components/SettingsPage';
import { OnboardingQAModal } from './components/OnboardingQAModal';
import { Toast } from './components/Toast';
import { Project, ContentPiece, ContentStatus, Settings, ContentFormat, BrandVoice, Workflow, BrandIntelligence } from './types';
import { GeneratingLoader } from './components/GeneratingLoader';
import { ProjectEmptyState } from './components/ProjectEmptyState';
import { ChatPage } from './components/ChatPage';
import { TemplatesPage } from './components/TemplatesPage';
import { TeamPage } from './components/TeamPage';
import { HistoryPage } from './components/HistoryPage';
import { ExportPage } from './components/ExportPage';
import { LoginPage } from './components/LoginPage';
import { WorkflowPage } from './components/WorkflowPage';
import { ComingSoonPage } from './components/ComingSoonPage';
import { AnalyticsIcon } from './components/icons/AnalyticsIcon';
import { ContentPlannerIcon } from './components/icons/ContentPlannerIcon';
import { BrandStudioIcon } from './components/icons/BrandStudioIcon';
import { LibraryIcon } from './components/icons/LibraryIcon';
import { VoiceCheckIcon } from './components/icons/VoiceCheckIcon';
import { CollaborationIcon } from './components/icons/CollaborationIcon';
import { MarketplaceIcon } from './components/icons/MarketplaceIcon';
import { ResumeProjectCard } from './components/ResumeProjectCard';
import { SettingsIcon } from './components/icons/SettingsIcon';
import { SkeletonDashboard } from './components/SkeletonDashboard';
import { CustomizingLoader } from './components/CustomizingLoader';
import { AgentsPage } from './components/AgentsPage';
import { DashboardNameLoader } from './components/DashboardNameLoader';
import { ContentPlannerPage } from './components/ContentPlannerPage';
import { TeamValueWidget } from './components/TeamValueWidget';
import { AnalyticsPage } from './components/AnalyticsPage';

const defaultSettings: Settings = {
    theme: 'light',
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
    // Brand Profile defaults
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

    // State for Undo functionality
    const [recentlyDeletedProject, setRecentlyDeletedProject] = useState<Project | null>(null);
    const [recentlyDeletedWorkflow, setRecentlyDeletedWorkflow] = useState<Workflow | null>(null);
    const deleteUndoTimer = useRef<number | null>(null);

    // State for loading transitions
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isCustomizing, setIsCustomizing] = useState(false);


    // Save users to storage whenever the state changes
    useEffect(() => {
        saveUsersToStorage(users);
    }, [users]);


    // Load data on user login
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
                        if (typeof p !== 'object' || p === null || !p.id) return null;
                        const createdAtIsValid = p.createdAt && !isNaN(new Date(p.createdAt).getTime());
                        const sanitizedContentPieces = (Array.isArray(p.contentPieces) ? p.contentPieces : []).map((cp: any) => {
                            if (typeof cp !== 'object' || cp === null || !cp.id) return null;
                            const cpCreatedAtIsValid = cp.createdAt && !isNaN(new Date(cp.createdAt).getTime());
                            const isValidStatus = Object.values(ContentStatus).includes(cp.status);
                            return {
                                id: cp.id, 
                                format: cp.format || ContentFormat.LinkedIn, 
                                title: cp.title || 'Untitled Content', 
                                content: cp.content || '',
                                status: isValidStatus ? cp.status : ContentStatus.Draft, 
                                createdAt: cpCreatedAtIsValid ? cp.createdAt : new Date().toISOString(),
                                smartScore: cp.smartScore || undefined, 
                                comments: cp.comments || [],
                                scheduledDate: cp.scheduledDate || undefined,
                                imageUrl: cp.imageUrl || undefined,
                                isOutline: cp.isOutline || false,
                                outlineData: cp.outlineData || undefined
                            };
                        }).filter((cp): cp is ContentPiece => cp !== null);
                        return { ...p, name: p.name || 'Untitled Project', createdAt: createdAtIsValid ? p.createdAt : new Date().toISOString(),
                            lastModified: p.lastModified || (createdAtIsValid ? p.createdAt : new Date().toISOString()), contentPieces: sanitizedContentPieces,
                            summary: p.summary || undefined, groundingMetadata: p.groundingMetadata || undefined,
                        };
                    }).filter((p): p is Project => p !== null) : [];
                    setProjects(sanitizedProjects);
                } else {
                    setProjects([]);
                }
            } catch (e) {
                console.error("Failed to parse projects from localStorage", e);
                setProjects([]);
            }

            try {
                const savedSettingsJSON = localStorage.getItem(settingsKey);
                if (savedSettingsJSON) { setSettings({ ...defaultSettings, ...JSON.parse(savedSettingsJSON) }); } 
                else { setSettings(defaultSettings); }
            } catch (e) { console.error("Failed to parse settings from localStorage", e); setSettings(defaultSettings); }
            
            try {
                const savedBrandVoicesJSON = localStorage.getItem(brandVoicesKey);
                setBrandVoices(savedBrandVoicesJSON ? JSON.parse(savedBrandVoicesJSON) : []);
            } catch (e) { console.error("Failed to parse brand voices from localStorage", e); setBrandVoices([]); }
            
            try {
                const savedBrandIntelligenceJSON = localStorage.getItem(brandIntelligenceKey);
                if(savedBrandIntelligenceJSON) { setBrandIntelligence({...defaultBrandIntelligence, ...JSON.parse(savedBrandIntelligenceJSON)}); }
                else { setBrandIntelligence(defaultBrandIntelligence); }
            } catch (e) { console.error("Failed to parse brand intelligence from localStorage", e); setBrandIntelligence(defaultBrandIntelligence); }

            try {
                const savedWorkflowsJSON = localStorage.getItem(workflowsKey);
                setWorkflows(savedWorkflowsJSON ? JSON.parse(savedWorkflowsJSON) : []);
            } catch (e) { console.error("Failed to parse workflows from localStorage", e); setWorkflows([]); }
        }
    }, [currentUser]);

    // Save data when it changes
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

    // Onboarding effect
    useEffect(() => { if (currentUser && !settings.hasCompletedOnboarding && !isSigningUp) setShowOnboarding(true); }, [currentUser, settings.hasCompletedOnboarding, isSigningUp]);

    // Navigation Guard Effect
    useEffect(() => {
        if (currentView === 'kanban') {
            const projectExists = projects.some(p => p.id === selectedProjectId);
            // If no project selected, OR if project selected but doesn't exist (and we have loaded projects), redirect.
            if (!selectedProjectId || (!projectExists && projects.length > 0)) {
                setCurrentView('projects');
                setSelectedProjectId(null);
            }
        }
    }, [currentView, selectedProjectId, projects]);

    const showToast = useCallback((message: string, type: 'success' | 'error', onUndo?: () => void) => setToast({ message, type, onUndo }), []);

    const createInitialUserData = (email: string) => {
        localStorage.setItem(`${email}_projects`, JSON.stringify([]));
        localStorage.setItem(`${email}_settings`, JSON.stringify(defaultSettings));
        localStorage.setItem(`${email}_brandVoices`, JSON.stringify([]));
        localStorage.setItem(`${email}_workflows`, JSON.stringify([]));
        localStorage.setItem(`${email}_brandIntelligence`, JSON.stringify(defaultBrandIntelligence));
    };
    
    const ensureUserDataExists = (email: string) => {
        if (!localStorage.getItem(`${email}_projects`)) localStorage.setItem(`${email}_projects`, JSON.stringify([]));
        if (!localStorage.getItem(`${email}_settings`)) localStorage.setItem(`${email}_settings`, JSON.stringify(defaultSettings));
        if (!localStorage.getItem(`${email}_brandVoices`)) localStorage.setItem(`${email}_brandVoices`, JSON.stringify([]));
        if (!localStorage.getItem(`${email}_workflows`)) localStorage.setItem(`${email}_workflows`, JSON.stringify([]));
        if (!localStorage.getItem(`${email}_brandIntelligence`)) localStorage.setItem(`${email}_brandIntelligence`, JSON.stringify(defaultBrandIntelligence));
    };
    
    const handleSignUp = useCallback(async (name: string, email: string, password: string) => {
        if (users[email]) {
            showToast('An account with this email already exists. Please sign in.', 'error');
            throw new Error('User already exists');
        }

        setIsSigningUp(true);

        // Simulate network delay and initial setup time to show skeleton - increased to 4.5s
        await new Promise(resolve => setTimeout(resolve, 4500));

        setUsers(prev => ({ ...prev, [email]: { password, name } }));
        createInitialUserData(email);
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
        await new Promise(resolve => setTimeout(resolve, 2500)); // Animation delay for existing users

        ensureUserDataExists(email);
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
             // Simulate network delay for new Google users - increased to 4.5s
            await new Promise(resolve => setTimeout(resolve, 4500));

            setUsers(prev => ({ ...prev, [googleUser.email]: { name: googleUser.name, googleId: googleUser.googleId } }));
            createInitialUserData(googleUser.email);
            
            // Ensure new Google users SKIP onboarding questions by setting hasCompletedOnboarding to true
            const settingsForGoogleUser = { ...defaultSettings, hasCompletedOnboarding: true };
            localStorage.setItem(`${googleUser.email}_settings`, JSON.stringify(settingsForGoogleUser));
            
            // Force update settings state immediately to avoid race condition with the onboarding effect
            setSettings(settingsForGoogleUser);

            ensureUserDataExists(googleUser.email);
            localStorage.setItem('currentUser', googleUser.email);
            setCurrentUser(googleUser.email);
            
            setIsSigningUp(false);
            showToast(`Welcome, ${googleUser.name}! Your account has been created.`, 'success');
        } else {
            setIsLoggingIn(true);
            await new Promise(resolve => setTimeout(resolve, 2500)); // Animation delay

            if (!user.googleId) {
                setUsers(prev => ({ ...prev, [googleUser.email]: { ...prev[googleUser.email], googleId: googleUser.googleId } }));
                showToast(`Your Google account has been linked, ${user.name || 'user'}!`, 'success');
            }
            ensureUserDataExists(googleUser.email);
            
            // Pre-load settings to ensure it loads correctly
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

    const handleCreateProject = useCallback((newProject: Project) => {
        setIsLoading(true);
        setTimeout(() => {
            setProjects(prev => [newProject, ...prev]);
            setSelectedProjectId(newProject.id);
            setCurrentView('kanban');
            setIsNewProjectFormOpen(false);
            setNewProjectInitialTemplate(null);
            setIsLoading(false);
            showToast('Project created successfully!', 'success');
        }, 500);
    }, [showToast]);
    
    const handleSelectProject = useCallback((projectId: string) => {
        setSelectedProjectId(projectId);
        setCurrentView('kanban');
    }, []);

    const handleUndoDeleteProject = useCallback(() => {
        if (deleteUndoTimer.current) { clearTimeout(deleteUndoTimer.current); deleteUndoTimer.current = null; }
        if (recentlyDeletedProject) {
            setProjects(prev => [recentlyDeletedProject, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setRecentlyDeletedProject(null);
            showToast('Project restored.', 'success');
        }
    }, [recentlyDeletedProject, showToast]);

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
    }, [selectedProjectId, handleUndoDeleteProject, showToast]);

    const handleUpdateProject = useCallback((projectId: string, updates: Partial<Project>) => {
        setProjects(prevProjects =>
            prevProjects.map(p =>
                p.id === projectId ? { ...p, ...updates, lastModified: new Date().toISOString() } : p
            )
        );
    }, []);

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
    
    const handleUndoDeleteWorkflow = useCallback(() => {
        if (deleteUndoTimer.current) { clearTimeout(deleteUndoTimer.current); deleteUndoTimer.current = null; }
        if (recentlyDeletedWorkflow) {
            setWorkflows(prev => [recentlyDeletedWorkflow, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setRecentlyDeletedWorkflow(null);
            showToast('Workflow restored.', 'success');
        }
    }, [recentlyDeletedWorkflow, showToast]);

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
    }, [handleUndoDeleteWorkflow, showToast]);

    const handleDrop = useCallback((contentId: string, targetStatus: ContentStatus) => {
        if (!selectedProjectId) return;
        setProjects(prev => {
            const project = prev.find(p => p.id === selectedProjectId);
            const contentPiece = project?.contentPieces.find(cp => cp.id === contentId);
            if (contentPiece) {
                return prev.map(p =>
                    p.id === selectedProjectId
                        ? { ...p, lastModified: new Date().toISOString(), contentPieces: p.contentPieces.map(cp => cp.id === contentId ? { ...cp, status: targetStatus } : cp) }
                        : p
                );
            }
            return prev;
        });
    }, [selectedProjectId]);
    
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

    const handleCreateProjectFromTemplate = (data: any) => {
        setNewProjectInitialTemplate(data.initialTemplate);
        setIsNewProjectFormOpen(true);
    };

    if (isSigningUp) {
        return <SkeletonDashboard />;
    }

    if (isLoggingIn) {
        return <DashboardNameLoader />;
    }

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} onSignUp={handleSignUp} onGoogleLogin={handleGoogleLogin} />;
    }

    const currentUserDetails = currentUser ? users[currentUser] : null;
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const resumeProject = projects.length > 0 
        ? [...projects].sort((a,b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())[0] 
        : null;

    const renderMainContent = () => {
        if (isLoading && isNewProjectFormOpen) return <div className="w-full h-full flex items-center justify-center"><GeneratingLoader /></div>;
        
        if (currentView.startsWith('coming-soon-')) {
            const feature = currentView.split('coming-soon-')[1];
            const pages: Record<string, {title: string, description: string, icon: React.ReactNode}> = {
                'performance': { title: 'Performance Analytics', description: 'Track impressions, engagement, and conversions to understand what content resonates with your audience.', icon: <AnalyticsIcon /> },
                'brand-studio': { title: 'Personal Brand Studio', description: 'A dedicated space for thought leaders to manage their unique voice, evergreen content, and key talking points.', icon: <BrandStudioIcon /> },
                'library': { title: 'Evergreen Library', description: 'A central repository for your best-performing content, making it easy to resurface and reuse timeless assets.', icon: <LibraryIcon /> },
                'voice-check': { title: 'Voice Check', description: 'AI-powered analysis to ensure your personal brand voice remains consistent across all platforms.', icon: <VoiceCheckIcon /> },
                'collaboration': { title: 'Collaboration Hub', description: 'Invite your team, leave comments, manage approvals, and streamline your content review process.', icon: <CollaborationIcon /> },
                'marketplace': { title: 'Content Ops Marketplace', description: 'Connect with verified editors, designers, and marketers to scale your content production.', icon: <MarketplaceIcon /> },
            }
            const page = pages[feature] || {title: 'Coming Soon', description: 'This feature is under construction.', icon: <SettingsIcon/>};
            return <ComingSoonPage title={page.title} description={page.description} icon={page.icon} />;
        }

        switch(currentView) {
            case 'kanban':
                if (selectedProject) return <KanbanPage project={selectedProject} onBack={() => { setCurrentView('projects'); setSelectedProjectId(null); }} onDrop={handleDrop} onCardClick={setSelectedContent} onUpdateProject={(updates) => handleUpdateProject(selectedProjectId!, updates)} />;
                return null;
            case 'chat': return <ChatPage currentUser={currentUser} />;
            case 'templates': return <TemplatesPage />;
            case 'agents': return <AgentsPage brandIntelligence={brandIntelligence} showToast={showToast} />;
            case 'workflow': return <WorkflowPage workflows={workflows} onSave={handleSaveWorkflow} onDelete={handleDeleteWorkflow} brandIntelligence={brandIntelligence} onCreateProject={handleCreateProjectFromTemplate} />;
            case 'team': return <TeamPage />;
            case 'history': return <HistoryPage />;
            case 'analytics': return <AnalyticsPage projects={projects} />;
            case 'export': return <ExportPage projects={projects} onUpdateContent={handleUpdateContentPiece} showToast={showToast} />;
            case 'planner': return <ContentPlannerPage projects={projects} onUpdateContent={handleUpdateContentPiece} onCardClick={(c) => { setSelectedContent(c); setIsNewProjectFormOpen(false); }} />;
            case 'profile': case 'settings': return <SettingsPage settings={settings} onUpdateSettings={setSettings} userName={currentUserDetails?.name} userEmail={currentUser} brandIntelligence={brandIntelligence} onUpdateBrandIntelligence={setBrandIntelligence} />;
            case 'projects': default: return (
                 <div className="p-6 md:p-10 max-w-7xl mx-auto">
                     <div className="flex justify-between items-end mb-10">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                                Welcome back, {currentUserDetails?.name || 'Content Creator'}. Here's what's happening with your content.
                            </p>
                        </div>
                        <button onClick={() => { setIsNewProjectFormOpen(true); setNewProjectInitialTemplate(null); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 flex items-center">
                            <span className="mr-2 text-xl leading-none">+</span> New Project
                        </button>
                     </div>
                     
                     <TeamValueWidget projects={projects} hourlyRate={settings.avgEditorHourlyRate} />

                     {resumeProject && <ResumeProjectCard project={resumeProject} onSelect={handleSelectProject} />}
                     
                     {projects.length > 0 ? (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">Recent Projects</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {projects.map(project => (
                                    <ProjectCard key={project.id} project={project} onSelect={handleSelectProject} onDelete={handleDeleteProject}/>
                                ))}
                            </div>
                        </div>
                     ) : ( <ProjectEmptyState /> )}
                </div>
            );
        }
    };

    return (
        <div className={`flex h-screen bg-[#FAFAFA] dark:bg-[#0B0C15] text-gray-900 dark:text-gray-100 ${settings.theme}`}>
            <Sidebar currentView={currentView} onNavigate={handleNavigate} isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} isSidebarCollapsed={isMainSidebarCollapsed} onToggleCollapse={() => setIsMainSidebarCollapsed(prev => !prev)} userRole={settings.userRole} enabledFeatures={settings.enabledFeatures} />
            
            <div className={`flex-1 flex flex-col overflow-hidden ${isMainSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'} transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]`}>
                <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} currentProjectName={selectedProject?.name} projects={projects} workflows={workflows} onNavigate={handleNavigate} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth">{renderMainContent()}</main>
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

            <EditorPanel content={selectedContent} onClose={() => setSelectedContent(null)} onUpdate={(updatedContent) => handleUpdateContentPiece(updatedContent, selectedProjectId || updatedContent.projectId!)} onDelete={handleDeleteContentPiece} showToast={showToast} groundingMetadata={selectedProject?.groundingMetadata} projects={projects} brandIntelligence={brandIntelligence} />
            
            {showOnboarding && <OnboardingQAModal onComplete={handleOnboardingComplete} />}
            
            {isCustomizing && <CustomizingLoader />}
            
            {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} onUndo={toast.onUndo} />}
        </div>
    );
};

export default App;
