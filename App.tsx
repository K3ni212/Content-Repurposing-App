
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProjectCard } from './components/ProjectCard';
import { KanbanPage } from './components/KanbanPage';
import { EditorPanel } from './components/EditorPanel';
import { NewProjectForm } from './components/NewProjectForm';
import { SettingsPage } from './components/SettingsPage';
import { OnboardingQAModal } from './components/OnboardingQAModal';
import { Toast } from './components/Toast';
import { Project, ContentPiece, ContentStatus, Settings, ContentFormat, BrandVoice } from './types';
import { GeneratingLoader } from './components/GeneratingLoader';
import { ProjectEmptyState } from './components/ProjectEmptyState';
import { ChatPage } from './components/ChatPage';
import { TemplatesPage } from './components/TemplatesPage';
import { TeamPage } from './components/TeamPage';
import { HistoryPage } from './components/HistoryPage';
import { ExportPage } from './components/ExportPage';
import { LoginPage } from './components/LoginPage';

const defaultSettings: Settings = {
    theme: 'light',
    hasCompletedOnboarding: false,
    userRole: '',
    companySize: '',
    goals: [],
}

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
    const [currentView, setCurrentView] = useState<string>('projects');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Modals
    const [isNewProjectFormOpen, setIsNewProjectFormOpen] = useState<boolean>(false);

    // Data State
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [projects, setProjects] = useState<Project[]>([]);
    const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedContent, setSelectedContent] = useState<ContentPiece | null>(null);

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

            try {
                const savedProjectsJSON = localStorage.getItem(projectsKey);
                 if (savedProjectsJSON) {
                    const parsedProjects = JSON.parse(savedProjectsJSON);
                    // Sanitize data to prevent crashes from old/malformed data structures.
                    const sanitizedProjects = Array.isArray(parsedProjects) ? parsedProjects.map((p: any) => {
                        if (typeof p !== 'object' || p === null || !p.id) {
                            return null; // Filter out malformed project entries
                        }
                        const createdAtIsValid = p.createdAt && !isNaN(new Date(p.createdAt).getTime());

                        // Deep sanitize content pieces within the project
                        const sanitizedContentPieces = (Array.isArray(p.contentPieces) ? p.contentPieces : []).map((cp: any) => {
                            if (typeof cp !== 'object' || cp === null || !cp.id) {
                                return null; // Filter out malformed content pieces
                            }
                            const cpCreatedAtIsValid = cp.createdAt && !isNaN(new Date(cp.createdAt).getTime());
                            const isValidStatus = Object.values(ContentStatus).includes(cp.status);

                            return {
                                id: cp.id,
                                format: cp.format || ContentFormat.LinkedIn, // Provide a default format
                                title: cp.title || 'Untitled Content',
                                content: cp.content || '',
                                status: isValidStatus ? cp.status : ContentStatus.Draft, // Ensure status is a valid enum value
                                createdAt: cpCreatedAtIsValid ? cp.createdAt : new Date().toISOString(),
                            };
                        }).filter((cp): cp is ContentPiece => cp !== null);

                        return {
                            ...p,
                            name: p.name || 'Untitled Project',
                            createdAt: createdAtIsValid ? p.createdAt : new Date().toISOString(),
                            contentPieces: sanitizedContentPieces,
                            summary: p.summary || undefined,
                            groundingMetadata: p.groundingMetadata || undefined,
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
                if (savedSettingsJSON) {
                    const parsedSettings = JSON.parse(savedSettingsJSON);
                    // Merge with defaults to ensure all keys are present
                    setSettings({ ...defaultSettings, ...parsedSettings });
                } else {
                    setSettings(defaultSettings);
                }
            } catch (e) {
                console.error("Failed to parse settings from localStorage", e);
                setSettings(defaultSettings);
            }
            
            try {
                const savedBrandVoicesJSON = localStorage.getItem(brandVoicesKey);
                setBrandVoices(savedBrandVoicesJSON ? JSON.parse(savedBrandVoicesJSON) : []);
            } catch (e) {
                console.error("Failed to parse brand voices from localStorage", e);
                setBrandVoices([]);
            }
        }
    }, [currentUser]);


    // Save settings when they change
    useEffect(() => {
        if (currentUser) {
            const settingsKey = `${currentUser}_settings`;
            localStorage.setItem(settingsKey, JSON.stringify(settings));
        }
    }, [settings, currentUser]);

    // Save projects when they change
    useEffect(() => {
        if (currentUser) {
            const projectsKey = `${currentUser}_projects`;
            localStorage.setItem(projectsKey, JSON.stringify(projects));
        }
    }, [projects, currentUser]);
    
    // Save brand voices when they change
    useEffect(() => {
        if (currentUser) {
            const brandVoicesKey = `${currentUser}_brandVoices`;
            localStorage.setItem(brandVoicesKey, JSON.stringify(brandVoices));
        }
    }, [brandVoices, currentUser]);


    // Theme effect
    useEffect(() => {
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [settings.theme]);

    // Onboarding effect
    useEffect(() => {
        if (currentUser && !settings.hasCompletedOnboarding) {
            setShowOnboarding(true);
        }
    }, [currentUser, settings.hasCompletedOnboarding]);

    // Handlers
    const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

    const createInitialUserData = (email: string) => {
        const projectsKey = `${email}_projects`;
        const settingsKey = `${email}_settings`;
        const brandVoicesKey = `${email}_brandVoices`;
        // Create fresh, default data structures for a new user.
        // This ensures they always start with the latest schema defined in the app.
        localStorage.setItem(projectsKey, JSON.stringify([]));
        localStorage.setItem(settingsKey, JSON.stringify(defaultSettings));
        localStorage.setItem(brandVoicesKey, JSON.stringify([]));
    };
    
    const ensureUserDataExists = (email: string) => {
        const projectsKey = `${email}_projects`;
        const settingsKey = `${email}_settings`;
        const brandVoicesKey = `${email}_brandVoices`;
    
        // If a user's data files are missing (e.g., from an older version),
        // create them with default values to prevent crashes.
        if (!localStorage.getItem(projectsKey)) {
            localStorage.setItem(projectsKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(settingsKey)) {
            localStorage.setItem(settingsKey, JSON.stringify(defaultSettings));
        }
        if (!localStorage.getItem(brandVoicesKey)) {
            localStorage.setItem(brandVoicesKey, JSON.stringify([]));
        }
    };
    
    const handleSignUp = async (name: string, email: string, password: string) => {
        if (users[email]) {
            showToast('An account with this email already exists. Please sign in.', 'error');
            throw new Error('User already exists');
        }
        
        setUsers(prevUsers => ({
            ...prevUsers,
            [email]: { password, name }
        }));
        
        createInitialUserData(email);

        localStorage.setItem('currentUser', email);
        setCurrentUser(email);
        showToast(`Welcome, ${name}! Your account has been created.`, 'success');
    };

    const handleLogin = async (email: string, password: string) => {
        const user = users[email];
    
        if (!user) {
            showToast('Account not found. Please sign up first.', 'error');
            throw new Error('Account not found');
        }
        
        if (user.password !== password) {
            showToast('Incorrect password. Please try again.', 'error');
            throw new Error('Incorrect password');
        }

        ensureUserDataExists(email);
    
        localStorage.setItem('currentUser', email);
        setCurrentUser(email);
        showToast(`Welcome back!`, 'success');
    };

    const handleLogout = () => {
        // Clear the current user from memory and storage
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        
        // Explicitly reset all user-specific state to defaults
        setProjects([]);
        setSettings(defaultSettings);
        setBrandVoices([]);
        setCurrentView('projects');
        setSelectedProjectId(null);
        setSelectedContent(null);
        
        showToast('You have been logged out.', 'success');
    };
    
    const handleOnboardingComplete = (data: { userRole: string; companySize: string; goals: string[] }) => {
        setSettings(prev => ({...prev, ...data, hasCompletedOnboarding: true }));
        setShowOnboarding(false);
        showToast("Your profile is set up!", 'success');
    };

    const handleCreateProject = (newProject: Project) => {
        setIsLoading(true);
        // Short delay to allow loader to show and feel responsive
        setTimeout(() => {
            setProjects(prev => [newProject, ...prev]);
            setSelectedProjectId(newProject.id);
            setCurrentView('kanban'); // Go directly to the new project's board
            setIsNewProjectFormOpen(false);
            setIsLoading(false);
            showToast('Project created successfully!', 'success');
        }, 500);
    };
    
    const handleSelectProject = (projectId: string) => {
        setSelectedProjectId(projectId);
        setCurrentView('kanban');
    };

    const handleDeleteProject = (projectId: string) => {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (selectedProjectId === projectId) {
            setSelectedProjectId(null);
            setCurrentView('projects');
        }
        showToast('Project deleted.', 'success');
    };

    const handleUpdateProject = (projectId: string, updates: Partial<Project>) => {
        setProjects(prevProjects =>
            prevProjects.map(p =>
                p.id === projectId ? { ...p, ...updates } : p
            )
        );
    };

    const handleUpdateContentPiece = (updatedContent: ContentPiece, projectId: string) => {
        setProjects(prevProjects =>
            prevProjects.map(p =>
                p.id === projectId
                    ? { ...p, contentPieces: p.contentPieces.map(cp => cp.id === updatedContent.id ? updatedContent : cp) }
                    : p
            )
        );
    };
    
    const handleDeleteContentPiece = () => {
        if (!selectedContent || !selectedProjectId) return;

        setProjects(prevProjects =>
            prevProjects.map(p =>
                p.id === selectedProjectId
                    ? { ...p, contentPieces: p.contentPieces.filter(cp => cp.id !== selectedContent.id) }
                    : p
            )
        );
        setSelectedContent(null); // This will close the panel
        showToast('Content piece deleted.', 'success');
    };

    const handleSaveBrandVoice = (newBrandVoice: { name: string, description: string }) => {
        const voice: BrandVoice = {
            ...newBrandVoice,
            id: `bv_${Date.now()}`
        };
        setBrandVoices(prev => [...prev, voice]);
        showToast(`Brand voice "${newBrandVoice.name}" saved!`, 'success');
    };


    const handleDrop = (contentId: string, targetStatus: ContentStatus) => {
        if (!selectedProjectId) return;
        const project = projects.find(p => p.id === selectedProjectId);
        const contentPiece = project?.contentPieces.find(cp => cp.id === contentId);
        if (contentPiece) {
            handleUpdateContentPiece({ ...contentPiece, status: targetStatus }, selectedProjectId);
        }
    };
    
    const toggleTheme = () => setSettings(prev => ({...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
    
    const handleNavigate = (view: string) => {
        if (view === 'new-project') {
            setIsNewProjectFormOpen(true);
        } else if (view.startsWith('coming-soon')) {
            showToast('This feature is coming soon!', 'success');
        } else {
            setCurrentView(view);
            if (view === 'projects') {
                setSelectedProjectId(null);
            }
        }
        setIsSidebarOpen(false); // Close sidebar on navigation
    };

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} onSignUp={handleSignUp} />;
    }

    const currentUserDetails = currentUser ? users[currentUser] : null;
    const selectedProject = projects.find(p => p.id === selectedProjectId);

    const renderMainContent = () => {
        if (isLoading && isNewProjectFormOpen) return <div className="w-full h-full flex items-center justify-center"><GeneratingLoader /></div>;

        switch(currentView) {
            case 'kanban':
                if (selectedProject) {
                     return <KanbanPage 
                                project={selectedProject} 
                                onBack={() => { setCurrentView('projects'); setSelectedProjectId(null); }}
                                onDrop={handleDrop}
                                onCardClick={setSelectedContent}
                                onUpdateProject={(updates) => handleUpdateProject(selectedProjectId!, updates)}
                            />;
                }
                setCurrentView('projects'); // Fallback if no project selected
                return null;
            case 'chat':
                return <ChatPage currentUser={currentUser} />;
            case 'templates':
                return <TemplatesPage />;
            case 'team':
                return <TeamPage />;
            case 'history':
                return <HistoryPage />;
            case 'export':
                return <ExportPage 
                            projects={projects} 
                            onUpdateContent={handleUpdateContentPiece} 
                            showToast={showToast} 
                        />;
            case 'profile':
            case 'settings':
                return <SettingsPage 
                            settings={settings} 
                            onUpdateSettings={setSettings} 
                            userName={currentUserDetails?.name}
                            userEmail={currentUser}
                        />;
            case 'projects':
            default:
                 return (
                     <div className="p-4 md:p-8">
                         <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Projects</h1>
                            <button
                                onClick={() => setIsNewProjectFormOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition-transform hover:scale-105"
                            >
                                + New Project
                            </button>
                         </div>
                         {projects.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {projects.map(project => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        onSelect={handleSelectProject}
                                        onDelete={handleDeleteProject}
                                    />
                                ))}
                            </div>
                         ) : (
                            <ProjectEmptyState />
                         )}
                    </div>
                );
        }
    };

    return (
        <div className={`flex h-screen bg-gray-100 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 ${settings.theme}`}>
            <Sidebar currentView={currentView} onNavigate={handleNavigate} isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} />
            
            <div className={`flex-1 flex flex-col overflow-hidden lg:pl-64 transition-all duration-300`}>
                <Header 
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    currentProjectName={selectedProject?.name}
                    isDarkMode={settings.theme === 'dark'}
                    toggleTheme={toggleTheme}
                />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {renderMainContent()}
                </main>
            </div>
            
            {/* Modals and Overlays */}
            {isNewProjectFormOpen && !isLoading && (
                <NewProjectForm 
                    onClose={() => setIsNewProjectFormOpen(false)}
                    onProjectCreated={handleCreateProject}
                    showToast={showToast}
                    brandVoices={brandVoices}
                    onSaveBrandVoice={handleSaveBrandVoice}
                />
            )}

            <EditorPanel
                content={selectedContent}
                onClose={() => setSelectedContent(null)}
                onUpdate={(updatedContent) => handleUpdateContentPiece(updatedContent, selectedProjectId!)}
                onDelete={handleDeleteContentPiece}
                showToast={showToast}
                groundingMetadata={selectedProject?.groundingMetadata}
            />
            
            {showOnboarding && <OnboardingQAModal onComplete={handleOnboardingComplete} />}
            
            {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
        </div>
    );
};

export default App;
