
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
import { supabase } from './supabaseClient';

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

const App: React.FC = () => {
    // Auth State
    const [session, setSession] = useState<any>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

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

    // Data State
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [projects, setProjects] = useState<Project[]>([]);
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);
    const [brandIntelligence, setBrandIntelligence] = useState<BrandIntelligence>(defaultBrandIntelligence);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedContent, setSelectedContent] = useState<ContentPiece | null>(null);

    // State for loading transitions
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isCustomizing, setIsCustomizing] = useState(false);

    // --- Supabase Logic ---

    // 1. Init Session & Auth Listener
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user?.email) setCurrentUserEmail(session.user.email);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user?.email) setCurrentUserEmail(session.user.email);
            else setCurrentUserEmail(null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // 2. Fetch Data when Session is active
    useEffect(() => {
        if (session?.user?.id) {
            fetchUserData();
        } else {
            // Reset local state on logout
            setProjects([]);
            setWorkflows([]);
            setSettings(defaultSettings);
            setBrandIntelligence(defaultBrandIntelligence);
        }
    }, [session]);

    const fetchUserData = async () => {
        if (!session?.user?.id) return;
        setIsLoading(true);

        try {
            // A. Fetch Settings
            const { data: settingsData } = await supabase.from('user_settings').select('data').eq('user_id', session.user.id).single();
            if (settingsData) {
                setSettings({ ...defaultSettings, ...settingsData.data });
                if (!settingsData.data.hasCompletedOnboarding) setShowOnboarding(true);
            } else {
                // No settings yet, likely new user. Onboarding will handle creation.
                setShowOnboarding(true); 
            }

            // B. Fetch Brand Intelligence
            const { data: brandData } = await supabase.from('brand_intelligence').select('data').eq('user_id', session.user.id).single();
            if (brandData) setBrandIntelligence({ ...defaultBrandIntelligence, ...brandData.data });

            // C. Fetch Workflows
            const { data: workflowData } = await supabase.from('workflows').select('*').eq('user_id', session.user.id);
            if (workflowData) {
                setWorkflows(workflowData.map((w: any) => ({
                    id: w.id,
                    name: w.name,
                    createdAt: w.created_at,
                    nodes: w.nodes || [],
                    edges: w.edges || []
                })));
            }

            // D. Fetch Projects & Content Pieces
            const { data: projectsData, error: projError } = await supabase
                .from('projects')
                .select(`*, content_pieces(*)`)
                .eq('user_id', session.user.id)
                .order('last_modified', { ascending: false });

            if (projError) {
                console.error('Error fetching projects:', projError);
            } else if (projectsData) {
                const formattedProjects: Project[] = projectsData.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    sourceText: p.source_text,
                    brandVoice: p.brand_voice,
                    goal: p.goal,
                    summary: p.summary,
                    groundingMetadata: p.grounding_metadata,
                    createdAt: p.created_at,
                    lastModified: p.last_modified,
                    contentPieces: (p.content_pieces || []).map((cp: any) => ({
                        id: cp.id,
                        projectId: cp.project_id, // Augment for easier updating
                        format: cp.format,
                        title: cp.title,
                        content: cp.content,
                        status: cp.status,
                        smartScore: cp.smart_score,
                        scheduledDate: cp.scheduled_date,
                        imageUrl: cp.image_url,
                        isOutline: cp.is_outline,
                        outlineData: cp.outline_data,
                        comments: cp.comments,
                        createdAt: cp.created_at
                    }))
                }));
                setProjects(formattedProjects);
            }

        } catch (error) {
            console.error("Error loading user data:", error);
            showToast("Failed to load your data.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Event Handlers ---

    const showToast = useCallback((message: string, type: 'success' | 'error', onUndo?: () => void) => setToast({ message, type, onUndo }), []);

    const handleSignUp = useCallback(async (name: string, email: string, password: string) => {
        setIsSigningUp(true);
        const { error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: { data: { full_name: name } }
        });
        
        setIsSigningUp(false);
        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast('Account created! Please check your email to confirm.', 'success');
        }
    }, [showToast]);

    const handleLogin = useCallback(async (email: string, password: string) => {
        setIsLoggingIn(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setIsLoggingIn(false);
        
        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast('Welcome back!', 'success');
        }
    }, [showToast]);

    const handleGoogleLogin = useCallback(async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) showToast(error.message, 'error');
    }, [showToast]);

    const handleLogout = useCallback(async () => {
        await supabase.auth.signOut();
        showToast('You have been logged out.', 'success');
    }, [showToast]);
    
    // --- Data Mutation Handlers ---

    const handleCreateProject = useCallback(async (newProject: Project) => {
        if (!session?.user) return;
        setIsLoading(true);

        try {
            // 1. Insert Project
            const { data: projData, error: projError } = await supabase
                .from('projects')
                .insert([{
                    user_id: session.user.id,
                    name: newProject.name,
                    source_text: newProject.sourceText,
                    brand_voice: newProject.brandVoice,
                    goal: newProject.goal,
                    grounding_metadata: newProject.groundingMetadata,
                    last_modified: new Date().toISOString()
                }])
                .select()
                .single();

            if (projError) throw projError;

            // 2. Insert Content Pieces
            const piecesPayload = newProject.contentPieces.map(cp => ({
                project_id: projData.id,
                format: cp.format,
                title: cp.title,
                content: cp.content,
                status: cp.status,
                is_outline: cp.isOutline,
                outline_data: cp.outlineData
            }));

            const { data: piecesData, error: piecesError } = await supabase
                .from('content_pieces')
                .insert(piecesPayload)
                .select();

            if (piecesError) throw piecesError;

            // 3. Update Local State (Optimistic or Re-fetch)
            // Re-fetching is safer for consistency
            fetchUserData(); 
            
            setSelectedProjectId(projData.id);
            setCurrentView('kanban');
            setIsNewProjectFormOpen(false);
            showToast('Project created successfully!', 'success');

        } catch (error: any) {
            console.error("Create Project Error:", error);
            showToast(error.message || "Failed to create project", "error");
        } finally {
            setIsLoading(false);
        }
    }, [session, showToast]);

    const handleDeleteProject = useCallback(async (projectId: string) => {
        // Optimistic update
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (selectedProjectId === projectId) { 
            setSelectedProjectId(null); 
            setCurrentView('projects'); 
        }

        const { error } = await supabase.from('projects').delete().eq('id', projectId);
        if (error) {
            showToast("Failed to delete project from server.", "error");
            fetchUserData(); // Revert
        } else {
            showToast('Project deleted.', 'success');
        }
    }, [selectedProjectId, showToast, session]);

    const handleUpdateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
        // Optimistic update
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates, lastModified: new Date().toISOString() } : p));

        // Map camelCase to snake_case for DB
        const dbUpdates: any = { last_modified: new Date().toISOString() };
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.sourceText) dbUpdates.source_text = updates.sourceText;
        if (updates.summary) dbUpdates.summary = updates.summary;
        
        const { error } = await supabase.from('projects').update(dbUpdates).eq('id', projectId);
        if (error) console.error("Failed to update project", error);

    }, [session]);

    const handleUpdateContentPiece = useCallback(async (updatedContent: ContentPiece, projectId: string) => {
        // Optimistic Update
        setProjects(prev => prev.map(p => 
            p.id === projectId 
            ? { ...p, lastModified: new Date().toISOString(), contentPieces: p.contentPieces.map(cp => cp.id === updatedContent.id ? updatedContent : cp) }
            : p
        ));

        // DB Update
        const dbUpdates = {
            content: updatedContent.content,
            status: updatedContent.status,
            smart_score: updatedContent.smartScore,
            scheduled_date: updatedContent.scheduledDate,
            image_url: updatedContent.imageUrl,
            comments: updatedContent.comments,
            is_outline: updatedContent.isOutline,
            outline_data: updatedContent.outlineData
        };

        const { error } = await supabase.from('content_pieces').update(dbUpdates).eq('id', updatedContent.id);
        if (error) console.error("Failed to update content piece", error);

    }, [session]);

    const handleDeleteContentPiece = useCallback(async () => {
        if (!selectedContent || !selectedProjectId) return;
        
        // Optimistic
        setProjects(prev => prev.map(p => 
            p.id === selectedProjectId 
            ? { ...p, contentPieces: p.contentPieces.filter(cp => cp.id !== selectedContent.id) }
            : p
        ));
        setSelectedContent(null);

        // DB
        const { error } = await supabase.from('content_pieces').delete().eq('id', selectedContent.id);
        if (error) showToast("Failed to delete content piece", "error");
        else showToast('Content piece deleted.', 'success');

    }, [selectedContent, selectedProjectId, showToast]);

    const handleSaveWorkflow = useCallback(async (updatedWorkflow: Workflow) => {
        if (!session?.user) return;

        // Check if it's a new workflow (ID starting with 'wf_' is our client-side temporary ID)
        // Actually, UUIDs from Supabase don't start with 'wf_'.
        // But to simplify, we can try to upsert based on ID if it's a valid UUID, or insert if not.
        // A simple strategy: If it exists in our state and has a valid UUID, update. Else insert.
        
        // For simplicity in this refactor, let's assume we always UPSERT based on ID if it matches UUID format,
        // OR if it's a temporary ID, we Insert and replace ID.
        
        const isTempId = updatedWorkflow.id.startsWith('wf_');
        
        if (isTempId) {
            const { data, error } = await supabase.from('workflows').insert([{
                user_id: session.user.id,
                name: updatedWorkflow.name,
                nodes: updatedWorkflow.nodes,
                edges: updatedWorkflow.edges
            }]).select().single();
            
            if (data) {
                setWorkflows(prev => [...prev.filter(w => w.id !== updatedWorkflow.id), { ...updatedWorkflow, id: data.id }]);
                showToast('Workflow saved!', 'success');
            }
        } else {
            const { error } = await supabase.from('workflows').update({
                name: updatedWorkflow.name,
                nodes: updatedWorkflow.nodes,
                edges: updatedWorkflow.edges
            }).eq('id', updatedWorkflow.id);
            
            if (!error) {
                setWorkflows(prev => prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
                showToast('Workflow updated!', 'success');
            }
        }
    }, [session, showToast]);

    const handleDeleteWorkflow = useCallback(async (workflowId: string) => {
        setWorkflows(prev => prev.filter(w => w.id !== workflowId));
        const { error } = await supabase.from('workflows').delete().eq('id', workflowId);
        if (error) showToast("Failed to delete workflow", "error");
        else showToast('Workflow deleted.', 'success');
    }, [showToast]);

    const handleOnboardingComplete = useCallback(async (data: Partial<Settings>, brandData: { sample: string, descriptors: string[] }) => {
        if (!session?.user) return;
        setIsCustomizing(true);

        const newSettings = { ...settings, ...data, hasCompletedOnboarding: true };
        const newBrandIntel = { 
            ...brandIntelligence, 
            toneSamples: brandData.sample ? [brandData.sample] : brandIntelligence.toneSamples,
            voiceDescriptors: brandData.descriptors.length > 0 ? brandData.descriptors : brandIntelligence.voiceDescriptors
        };

        // Save to DB
        await supabase.from('user_settings').upsert({ user_id: session.user.id, data: newSettings });
        await supabase.from('brand_intelligence').upsert({ user_id: session.user.id, data: newBrandIntel });

        setTimeout(() => {
            setSettings(newSettings);
            setBrandIntelligence(newBrandIntel);
            setShowOnboarding(false);
            setIsCustomizing(false);
            showToast("Your profile is set up!", 'success');
        }, 1500);
    }, [session, settings, brandIntelligence, showToast]);

    const handleUpdateSettings = async (newSettings: Settings | ((prev: Settings) => Settings)) => {
        // Logic to handle both function update and direct object update
        let updated: Settings;
        if (typeof newSettings === 'function') {
            updated = newSettings(settings);
        } else {
            updated = newSettings;
        }
        setSettings(updated);
        if (session?.user) {
            await supabase.from('user_settings').upsert({ user_id: session.user.id, data: updated });
        }
    };

    const handleUpdateBrandIntelligence = async (newBI: BrandIntelligence | ((prev: BrandIntelligence) => BrandIntelligence)) => {
        let updated: BrandIntelligence;
        if (typeof newBI === 'function') {
            updated = newBI(brandIntelligence);
        } else {
            updated = newBI;
        }
        setBrandIntelligence(updated);
        if (session?.user) {
            await supabase.from('brand_intelligence').upsert({ user_id: session.user.id, data: updated });
        }
    };

    const handleSelectProject = useCallback((projectId: string) => {
        setSelectedProjectId(projectId);
        setCurrentView('kanban');
    }, []);

    const handleSaveBrandVoice = useCallback((newVoice: { name: string, description: string }) => {
        const voice: BrandVoice = {
            id: `bv_${Date.now()}`,
            ...newVoice
        };
        setBrandVoices(prev => [...prev, voice]);
        showToast(`Brand voice "${newVoice.name}" saved!`, 'success');
    }, [showToast]);

    // Handle Drag & Drop (Optimistic only for now, relying on handleUpdateContentPiece)
    const handleDrop = useCallback((contentId: string, targetStatus: ContentStatus) => {
        if (!selectedProjectId) return;
        const project = projects.find(p => p.id === selectedProjectId);
        const content = project?.contentPieces.find(cp => cp.id === contentId);
        if (content) {
            handleUpdateContentPiece({ ...content, status: targetStatus }, selectedProjectId);
        }
    }, [selectedProjectId, projects, handleUpdateContentPiece]);
    
    const handleNavigate = useCallback((view: string, id?: string) => {
        if (view === 'new-project') setIsNewProjectFormOpen(true);
        else if (view === 'kanban' && id) {
            setSelectedProjectId(id);
            setCurrentView('kanban');
        } else {
            setCurrentView(view);
            if (view === 'projects') setSelectedProjectId(null);
        }
        setIsSidebarOpen(false);
    }, []);

    // --- Render ---

    if (isSigningUp) {
        return <SkeletonDashboard />;
    }

    if (isLoggingIn) {
        return <DashboardNameLoader />;
    }

    if (!session) {
        return <LoginPage onLogin={handleLogin} onSignUp={handleSignUp} onGoogleLogin={handleGoogleLogin} />;
    }

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
            case 'chat': return <ChatPage currentUser={currentUserEmail || 'user'} />;
            case 'templates': return <TemplatesPage />;
            case 'agents': return <AgentsPage brandIntelligence={brandIntelligence} showToast={showToast} />;
            case 'workflow': return <WorkflowPage workflows={workflows} onSave={handleSaveWorkflow} onDelete={handleDeleteWorkflow} brandIntelligence={brandIntelligence} onCreateProject={handleCreateProject} />;
            case 'team': return <TeamPage />;
            case 'history': return <HistoryPage />;
            case 'export': return <ExportPage projects={projects} onUpdateContent={handleUpdateContentPiece} showToast={showToast} />;
            case 'planner': return <ContentPlannerPage projects={projects} onUpdateContent={handleUpdateContentPiece} onCardClick={(c) => { setSelectedContent(c); setIsNewProjectFormOpen(false); }} />;
            case 'profile': case 'settings': return <SettingsPage settings={settings} onUpdateSettings={handleUpdateSettings} userName={session.user.user_metadata?.full_name || 'User'} userEmail={session.user.email} brandIntelligence={brandIntelligence} onUpdateBrandIntelligence={handleUpdateBrandIntelligence} />;
            case 'projects': default: return (
                 <div className="p-6 md:p-10 max-w-7xl mx-auto">
                     <div className="flex justify-between items-end mb-10">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                                Welcome back, {session.user.user_metadata?.full_name || 'Creator'}. Here's what's happening with your content.
                            </p>
                        </div>
                        <button onClick={() => setIsNewProjectFormOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 flex items-center">
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
                <NewProjectForm onClose={() => setIsNewProjectFormOpen(false)} onProjectCreated={handleCreateProject} showToast={showToast} brandVoices={brandVoices} onSaveBrandVoice={handleSaveBrandVoice} brandIntelligence={brandIntelligence} />
            )}

            <EditorPanel content={selectedContent} onClose={() => setSelectedContent(null)} onUpdate={(updatedContent) => handleUpdateContentPiece(updatedContent, selectedProjectId || updatedContent.projectId!)} onDelete={handleDeleteContentPiece} showToast={showToast} groundingMetadata={selectedProject?.groundingMetadata} projects={projects} brandIntelligence={brandIntelligence} />
            
            {showOnboarding && <OnboardingQAModal onComplete={handleOnboardingComplete} />}
            
            {isCustomizing && <CustomizingLoader />}
            
            {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} onUndo={toast.onUndo} />}
        </div>
    );
};

export default App;
