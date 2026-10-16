import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  AppSection,
  Conversation,
  GeneratedImage,
  Project,
  CustomInstructions,
  UserProfile,
  DeviceMode,
  ThemeMode,
  KnowledgeDocument,
} from './types';
import { MrTechLogo } from './components/MrTechLogo';
import { GoogleAuth } from './components/GoogleAuth';
import { LandingPage } from './components/LandingPage';
import { ChatView } from './components/ChatView';
import { ImageStudio } from './components/ImageStudio';
import { ToolsHub } from './components/ToolsHub';
import { ProjectsView } from './components/ProjectsView';
import { CompareView } from './components/CompareView';
import { SettingsView } from './components/SettingsView';
import { AdminReviewsView } from './components/AdminReviewsView';
import { AdminUserDashboard } from './components/AdminUserDashboard';
import { CompleteProfileModal } from './components/CompleteProfileModal';
import { ConversationSidebar } from './components/ConversationSidebar';
import { ChatHistoryView } from './components/ChatHistoryView';
import { OnboardingModal } from './components/OnboardingModal';
import { ReviewModal } from './components/ReviewModal';
import { PromptLibraryModal } from './components/PromptLibraryModal';
import { LoginPage } from './components/LoginPage';
import {
  auth,
  onAuthStateChanged,
  syncUserProfile,
  logoutUser,
  saveConversationToFirestore,
  fetchUserConversationsFromFirestore,
  deleteConversationFromFirestore,
  isUserAdmin,
  checkRedirectAuthResult,
} from './services/firebase';
import { useResolvedDeviceMode } from './utils/deviceMode';
import { useAutoSave } from './utils/useAutoSave';
import { AutoSaveBadge } from './components/AutoSaveBadge';
import { CommandPalette } from './components/CommandPalette';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { HeaderNewDropdown } from './components/HeaderNewDropdown';
import { applyTheme } from './utils/themeManager';
import { ALL_UNIVERSAL_KNOWLEDGE_DOCUMENTS } from './data/allKnowledgePresets';

import {
  MessageSquare,
  MessageSquarePlus,
  Sparkles,
  Wrench,
  FolderGit2,
  FolderPlus,
  Columns,
  Settings,
  ShieldCheck,
  Users,
  Menu,
  X,
  Plus,
  Home,
  History,
  Star,
  LogOut,
  Search,
  Keyboard,
  Code2,
} from 'lucide-react';
import { EmbedWidgetModal } from './components/EmbedWidgetModal';

const DEFAULT_INSTRUCTIONS: CustomInstructions = {
  aboutUser: '',
  howToRespond: 'Answer accurately with clear, well-explained, and comfortably detailed responses (കുറച്ച് വലുതാക്കി വിശദമായി എഴുതുക). Explain key points and context.',
  responseStyle: 'Detailed',
  language: 'English',
  formatPreference: 'Clear, well-explained responses with markdown formatting when helpful',
};

const DEFAULT_KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = ALL_UNIVERSAL_KNOWLEDGE_DOCUMENTS;

export const App: React.FC = () => {
  // Navigation State - Default to 'chat' for direct chatting screen
  const [activeSection, setActiveSection] = useState<AppSection>('chat');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('auto');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('mrtech_theme');
      if (
        saved &&
        ['dark', 'light', 'cyber-light', 'midnight-blue', 'amethyst', 'system'].includes(saved)
      ) {
        return saved as ThemeMode;
      }
    } catch {}
    return 'dark';
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [startProjectCreate, setStartProjectCreate] = useState(false);
  const [autoFocusImagePrompt, setAutoFocusImagePrompt] = useState(false);

  // Floating Widget Embed Mode Detection
  const isEmbedMode =
    typeof window !== 'undefined' &&
    (window.location.search.includes('embed=true') || window.location.search.includes('mode=widget'));
  const [showEmbedModal, setShowEmbedModal] = useState(false);

  // Authentication Gate State
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('mrtech_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.email || parsed.uid)) {
          return parsed;
        }
      } catch (e) {}
    }
    // Guest auto-initialization for embedded widget visitors
    if (isEmbedMode) {
      return {
        id: 'guest_embed_user',
        uid: 'guest_embed_user',
        email: 'guest@mrtechai.local',
        displayName: 'Guest Visitor',
        photoURL: '',
        onboarded: true,
        createdAt: new Date().toISOString(),
      };
    }
    return null;
  });
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Synchronize Firebase Auth state on initialization and changes
  useEffect(() => {
    checkRedirectAuthResult().catch((e) => console.warn('Redirect check notice:', e));

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await syncUserProfile(firebaseUser);
          setUser(profile);
          localStorage.setItem('mrtech_user', JSON.stringify(profile));

          // Sync saved conversations from Firestore
          try {
            const remoteConvs = await fetchUserConversationsFromFirestore(profile.uid);
            if (remoteConvs && remoteConvs.length > 0) {
              setConversations((prev) => {
                const convMap = new Map<string, Conversation>();
                remoteConvs.forEach((c) => convMap.set(c.id, c));
                prev.forEach((c) => {
                  const existing = convMap.get(c.id);
                  if (!existing || new Date(c.updatedAt || 0).getTime() > new Date(existing.updatedAt || 0).getTime()) {
                    convMap.set(c.id, c);
                  }
                });
                return Array.from(convMap.values()).sort(
                  (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
                );
              });
            }
          } catch (syncErr) {
            console.warn('Could not sync user conversations from Firestore:', syncErr);
          }
        } catch (err) {
          console.error('Failed to sync profile on auth state change:', err);
        }
      } else {
        // If an authenticated session exists in localStorage (e.g. direct Google login), preserve it!
        const saved = localStorage.getItem('mrtech_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && (parsed.email || parsed.uid)) {
              setUser(parsed);
              setAuthLoading(false);
              return;
            }
          } catch {}
        }
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Error logging out:', err);
    }
    setUser(null);
    localStorage.removeItem('mrtech_user');
    setActiveSection('chat');
  };

  // Modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);

  // Data: Conversations
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('mrtech_conversations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'conv_welcome',
        title: 'Welcome to MR TECH AI',
        messages: [
          {
            id: 'msg_w1',
            role: 'assistant',
            content:
              'Welcome to **MR TECH AI**! I am your AI workspace created by **RAYYAN** and powered by the high-speed **AI 1 Engine**.\n\nHere is what you can do:\n- **AI Chat**: Multimodal conversation, ultra-fast 1-2s answers & search grounding\n- **AI Image Studio**: Unlimited free visual generation & variations\n- **Tools Hub**: 18 specialized capabilities (Image Analyzer, Document AI, Translators)\n- **Projects**: Dedicated instructions & persistent context\n\nHow can I help you today?',
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  });
  const [activeConvId, setActiveConvId] = useState<string>(() => {
    return localStorage.getItem('mrtech_active_conv_id') || 'conv_welcome';
  });

  // Data: Projects
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('mrtech_projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>(() => {
    return localStorage.getItem('mrtech_active_project_id') || undefined;
  });

  // Data: Generated Images
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>(() => {
    const saved = localStorage.getItem('mrtech_images');
    return saved ? JSON.parse(saved) : [];
  });

  // Data: Memory Bank
  const [memories, setMemories] = useState<string[]>(() => {
    const saved = localStorage.getItem('mrtech_memories');
    return saved
      ? JSON.parse(saved)
      : ['Prefers production-ready TypeScript code', 'Creator is RAYYAN', 'Focus on Cyber Security'];
  });

  // Data: Custom Instructions
  const [customInstructions, setCustomInstructions] = useState<CustomInstructions>(() => {
    const saved = localStorage.getItem('mrtech_instructions');
    return saved ? JSON.parse(saved) : DEFAULT_INSTRUCTIONS;
  });

  // Data: Knowledge Base Documents
  const [knowledgeDocuments, setKnowledgeDocuments] = useState<KnowledgeDocument[]>(() => {
    const saved = localStorage.getItem('mrtech_knowledge_base');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((d: KnowledgeDocument) => d.id));
          const existingTitles = new Set(parsed.map((d: KnowledgeDocument) => d.title?.toLowerCase()));
          const missing = ALL_UNIVERSAL_KNOWLEDGE_DOCUMENTS.filter(
            (d) => !existingIds.has(d.id) && !existingTitles.has(d.title.toLowerCase())
          );
          if (missing.length > 0) {
            return [...parsed, ...missing];
          }
          return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_KNOWLEDGE_DOCUMENTS;
  });

  // Auto-Save Mechanism: Periodically saves chat state and project changes to local storage every 30 seconds
  const { lastSaved, isSaving, performSave } = useAutoSave({
    intervalMs: 30000,
    getData: () => ({
      conversations,
      projects,
      activeConvId,
      activeProjectId,
      customInstructions,
      memories,
      knowledgeDocuments,
    }),
  });

  // Resolved layout mode based on settings or screen size
  const resolvedDevice = useResolvedDeviceMode(deviceMode);
  const isMobileLayout = resolvedDevice === 'phone' || resolvedDevice === 'iphone';

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('mrtech_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('mrtech_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('mrtech_images', JSON.stringify(imageHistory));
  }, [imageHistory]);

  useEffect(() => {
    localStorage.setItem('mrtech_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('mrtech_instructions', JSON.stringify(customInstructions));
  }, [customInstructions]);

  useEffect(() => {
    localStorage.setItem('mrtech_knowledge_base', JSON.stringify(knowledgeDocuments));
  }, [knowledgeDocuments]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('mrtech_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mrtech_user');
    }
  }, [user]);

  // Synchronize and apply theme mode & CSS variables
  useEffect(() => {
    try {
      localStorage.setItem('mrtech_theme', theme);
    } catch {}
    applyTheme(theme);
  }, [theme]);

  // Global Desktop Keyboard Shortcuts:
  // - Ctrl+K / Cmd+K: Open Command Palette
  // - Ctrl+/ / Cmd+/: Open Keyboard Shortcuts help
  // - Escape: Close active modals
  // - Ctrl+Shift+N: New Conversation
  // - Ctrl+1..7: Quick section switching (Chat, History, Image Studio, Tools, Projects, Compare, Settings)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // 1. Ctrl+K or Cmd+K: Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // 2. Ctrl+/ or Cmd+/: Keyboard Shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // 3. Escape: Close modals
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
      }

      // 4. Ctrl+Shift+N: New Chat Conversation
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleDropdownNewChat();
        return;
      }

      // Ctrl+Shift+P: New Project
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleDropdownNewProject();
        return;
      }

      // Ctrl+Shift+I: New Image Gen
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        handleDropdownNewImageGen();
        return;
      }

      // 5. Ctrl+1 through Ctrl+7: Section Switcher (when not typing in an input)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && !isInputFocused) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setActiveSection('chat');
            break;
          case '2':
            e.preventDefault();
            setActiveSection('history');
            break;
          case '3':
            e.preventDefault();
            setActiveSection('image-studio');
            break;
          case '4':
            e.preventDefault();
            setActiveSection('tools');
            break;
          case '5':
            e.preventDefault();
            setActiveSection('projects');
            break;
          case '6':
            e.preventDefault();
            setActiveSection('compare');
            break;
          case '7':
            e.preventDefault();
            setActiveSection('settings');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isCommandPaletteOpen, isShortcutsModalOpen]);

  // Active conversation helper
  const currentConversation =
    conversations.find((c) => c.id === activeConvId) || conversations[0] || {
      id: 'conv_fallback',
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

  const currentProject = projects.find((p) => p.id === activeProjectId);

  // Conversation actions
  const handleNewChat = () => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      title: 'New Conversation',
      messages: [],
      selectedModel: 'gemini-3.5-flash-lite',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: activeProjectId,
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setActiveSection('chat');
    setIsMobileMenuOpen(false);
  };

  // Quick workflow creation actions from header dropdown
  const handleDropdownNewChat = () => {
    handleNewChat();
  };

  const handleDropdownNewProject = () => {
    setStartProjectCreate(true);
    setActiveSection('projects');
    setIsMobileMenuOpen(false);
    setTimeout(() => setStartProjectCreate(false), 300);
  };

  const handleDropdownNewImageGen = () => {
    setAutoFocusImagePrompt(true);
    setActiveSection('image-studio');
    setIsMobileMenuOpen(false);
    setTimeout(() => setAutoFocusImagePrompt(false), 300);
  };

  const handleUpdateConversation = (updated: Conversation) => {
    setConversations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    if (user?.id) {
      saveConversationToFirestore(user.id, updated);
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) => {
      const updatedList = prev.map((c) =>
        c.id === id ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c
      );
      const target = updatedList.find((c) => c.id === id);
      if (target && user?.id) {
        saveConversationToFirestore(user.id, target);
      }
      return updatedList;
    });
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (id === activeConvId && remaining.length > 0) {
        setActiveConvId(remaining[0].id);
      }
      return remaining;
    });
    if (user?.id) {
      deleteConversationFromFirestore(id);
    }
  };

  const handleTogglePin = (id: string) => {
    setConversations((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c));
      const target = updated.find((c) => c.id === id);
      if (target && user?.id) {
        saveConversationToFirestore(user.id, target);
      }
      return updated;
    });
  };

  const handleToggleArchive = (id: string) => {
    setConversations((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c));
      const target = updated.find((c) => c.id === id);
      if (target && user?.id) {
        saveConversationToFirestore(user.id, target);
      }
      return updated;
    });
  };

  const handleClearAllHistory = () => {
    const freshConv: Conversation = {
      id: `conv_${Date.now()}`,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations([freshConv]);
    setActiveConvId(freshConv.id);
  };

  // Projects actions
  const handleCreateProject = (projData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProj: Project = {
      ...projData,
      id: `proj_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, newProj]);
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    );
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(undefined);
    }
  };

  // Image actions
  const handleSaveImage = (img: GeneratedImage) => {
    setImageHistory((prev) => [img, ...prev]);
  };

  const handleDeleteImage = (id: string) => {
    setImageHistory((prev) => prev.filter((img) => img.id !== id));
  };

  // Memory actions
  const handleAddMemory = (mem: string) => {
    setMemories((prev) => [...prev, mem]);
  };

  const handleDeleteMemory = (index: number) => {
    setMemories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearMemories = () => {
    setMemories([]);
  };

  // Knowledge Base Actions
  const handleAddKnowledgeDocument = (
    docData: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newDoc: KnowledgeDocument = {
      ...docData,
      id: 'kb-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setKnowledgeDocuments((prev) => [newDoc, ...prev]);
  };

  const handleUpdateKnowledgeDocument = (id: string, updates: Partial<KnowledgeDocument>) => {
    setKnowledgeDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d))
    );
  };

  const handleDeleteKnowledgeDocument = (id: string) => {
    setKnowledgeDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleToggleKnowledgeDocument = (id: string) => {
    setKnowledgeDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, enabled: d.enabled === false ? true : false, updatedAt: new Date().toISOString() } : d))
    );
  };

  const handleClearKnowledgeDocuments = () => {
    setKnowledgeDocuments([]);
  };

  // Onboarding Complete
  const handleCompleteOnboarding = (
    profileData: Partial<UserProfile>,
    instructionData: Partial<CustomInstructions>
  ) => {
    if (user) {
      setUser({ ...user, ...profileData, onboarded: true });
    }
    setCustomInstructions((prev) => ({ ...prev, ...instructionData }));
    setShowOnboarding(false);
  };

  // Nav Links
  const navItems = [
    { id: 'chat' as AppSection, label: 'Chat', icon: MessageSquare },
    { id: 'history' as AppSection, label: 'History', icon: History },
    { id: 'image-studio' as AppSection, label: 'Image Studio', icon: Sparkles },
    { id: 'tools' as AppSection, label: 'AI Tools', icon: Wrench },
    { id: 'projects' as AppSection, label: 'Projects', icon: FolderGit2 },
    { id: 'compare' as AppSection, label: 'Compare', icon: Columns },
    { id: 'settings' as AppSection, label: 'Settings', icon: Settings },
    ...(isUserAdmin(user)
      ? [
          { id: 'admin-users' as AppSection, label: 'User Directory', icon: Users },
          { id: 'admin-reviews' as AppSection, label: 'Admin Hub', icon: ShieldCheck },
        ]
      : []),
  ];

  // Subtle tactile haptic feedback for mobile navigation
  const triggerHapticFeedback = (durationMs = 15) => {
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
        navigator.vibrate(durationMs);
      }
    } catch {
      // Gracefully ignore if vibrations are disallowed or unsupported
    }
  };

  // 1. Loading Splash while checking Firebase Authentication (bypassed in embed mode)
  if (authLoading && !isEmbedMode) {
    return (
      <div className="min-h-screen w-full bg-[#070A12] flex flex-col items-center justify-center text-slate-100 relative overflow-hidden selection:bg-blue-600/30">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/10 animate-pulse">
          <Sparkles className="w-7 h-7 text-blue-400" />
        </div>
        <div className="text-lg font-bold tracking-tight text-white mb-2">MR TECH AI</div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying secure authentication...</span>
        </div>
      </div>
    );
  }

  // 2. Strict Authentication Gate:
  // If the visitor is NOT logged in and not in embed mode, show ONLY the Login / Sign Up page!
  // Protected content (homepage, products, chat, reviews, dashboard) is completely blocked before login.
  if (!user && !isEmbedMode) {
    return (
      <LoginPage
        onSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          localStorage.setItem('mrtech_user', JSON.stringify(authenticatedUser));
          setActiveSection('chat');
          if (!authenticatedUser.onboarded) {
            setShowOnboarding(true);
          }
        }}
      />
    );
  }

  // 3. Embedded Floating Widget Mode:
  // If the page is requested inside an external iframe widget (?embed=true),
  // render the dedicated, focused, full-height chat window with zero outer clutter!
  if (isEmbedMode) {
    return (
      <div className="w-full h-screen bg-black text-slate-100 flex flex-col overflow-hidden font-sans">
        <main className="flex-1 w-full h-full overflow-hidden">
          <ChatView
            conversation={currentConversation}
            onUpdateConversation={handleUpdateConversation}
            onNewChat={handleNewChat}
            customInstructions={customInstructions}
            onOpenReviewModal={() => setShowReviewModal(true)}
            onOpenPromptLibrary={() => setShowPromptLibrary(true)}
            deviceMode={deviceMode}
            conversations={conversations}
            onSelectConversation={(id) => setActiveConvId(id)}
            onDeleteConversation={handleDeleteConversation}
            onTogglePin={handleTogglePin}
            projects={projects}
            knowledgeDocuments={knowledgeDocuments}
          />
        </main>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-full overflow-x-hidden min-h-screen flex flex-col font-sans bg-black text-slate-100 antialiased ${
        resolvedDevice === 'iphone' ? 'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]' : ''
      }`}
    >
      {/* Top Header Navigation (Shown for all sections except full-screen chat assistant) */}
      {activeSection !== 'chat' && (
        <header className="w-full h-14 sm:h-16 border-b border-[#27272a] bg-black/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger button */}
            {activeSection !== 'landing' && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
                title="Open menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <MrTechLogo
              size="sm"
              showSubtitle={!isMobileLayout}
              showCreator={false}
              onClick={() => setActiveSection('landing')}
            />
          </div>

          {/* Desktop Navigation Links (Clean Minimalism) */}
          {activeSection !== 'landing' && (
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                      active
                        ? 'bg-blue-600/10 text-blue-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Header: Reviews, AutoSave Badge, Google Auth & Actions */}
          <div className="flex items-center gap-2">
            {activeSection !== 'landing' && (
              <>
                {/* Desktop Command Palette Quick Trigger (Ctrl+K) */}
                <button
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#18181b] hover:bg-slate-800 text-xs text-slate-400 hover:text-slate-200 border border-[#27272a] transition-all cursor-pointer shadow-sm group"
                  title="Open Command Palette (Ctrl+K)"
                >
                  <Search className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden lg:inline text-[11px]">Command Palette</span>
                  <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black text-slate-400 border border-slate-700/60">
                    Ctrl K
                  </kbd>
                </button>

                {/* Desktop Keyboard Shortcuts Help Icon (Ctrl+/) */}
                <button
                  onClick={() => setIsShortcutsModalOpen(true)}
                  className="hidden md:flex p-2 rounded-xl text-slate-400 hover:text-blue-300 hover:bg-slate-800/80 transition-all cursor-pointer border border-transparent hover:border-[#27272a]"
                  title="Keyboard Shortcuts (Ctrl+/)"
                  aria-label="Keyboard Shortcuts"
                >
                  <Keyboard className="w-4 h-4" />
                </button>

                <AutoSaveBadge
                  lastSaved={lastSaved}
                  isSaving={isSaving}
                  onSaveNow={performSave}
                  compact={isMobileLayout}
                />

                <button
                  onClick={() => setShowReviewModal(true)}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-yellow-400 hover:text-yellow-300 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/20 transition-all cursor-pointer"
                  title="Community Reviews"
                >
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  <span>Reviews</span>
                </button>

                <button
                  onClick={() => setShowEmbedModal(true)}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/25 transition-all cursor-pointer"
                  title="Website Floating Widget Code (ഫ്ലോട്ടിംഗ് കോഡ്)"
                >
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Embed Widget</span>
                </button>

                <HeaderNewDropdown
                  onNewChat={handleDropdownNewChat}
                  onNewProject={handleDropdownNewProject}
                  onNewImageGen={handleDropdownNewImageGen}
                />
              </>
            )}

            <GoogleAuth
              user={user}
              onLogin={(newUser) => {
                setUser(newUser);
                if (!newUser.onboarded) {
                  setShowOnboarding(true);
                }
              }}
              onLogout={handleLogout}
              compact={isMobileLayout}
              onOpenReview={() => setShowReviewModal(true)}
            />
          </div>
        </header>
      )}

      {/* Main Workspace View */}
      {activeSection === 'landing' ? (
        <LandingPage
          onStartChat={() => {
            setActiveSection('chat');
          }}
          onNavigate={(sec) => setActiveSection(sec)}
          user={user}
          onLogin={(newUser) => {
            setUser(newUser);
            if (!newUser.onboarded) {
              setShowOnboarding(true);
            }
          }}
          onLogout={handleLogout}
        />
      ) : (
        <div className="flex-1 w-full max-w-full flex overflow-hidden relative">
          {/* Desktop Left Sidebar for Chat Section */}
          {activeSection === 'chat' && !isMobileLayout && (
            <aside
              className={`h-[calc(100vh-3.5rem)] shrink-0 transition-all duration-200 ${
                isSidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64 lg:w-72'
              }`}
            >
              <ConversationSidebar
                conversations={conversations}
                activeId={activeConvId}
                onSelectConversation={(id) => setActiveConvId(id)}
                onNewChat={handleNewChat}
                onRenameConversation={handleRenameConversation}
                onDeleteConversation={handleDeleteConversation}
                onTogglePin={handleTogglePin}
                onToggleArchive={handleToggleArchive}
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={(id) => setActiveProjectId(id)}
                onOpenReviewModal={() => setShowReviewModal(true)}
                onNavigateToHistory={() => setActiveSection('history')}
                onNavigate={(sec) => setActiveSection(sec)}
              />
            </aside>
          )}

          {/* Mobile Drawer (When hamburger clicked) */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden flex"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div
                className="w-72 max-w-[85vw] h-full bg-[#131926] border-r border-slate-800 p-4 flex flex-col justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <MrTechLogo size="sm" showSubtitle={true} showCreator={true} />
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Mobile Quick Create Grid */}
                  <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold px-1">
                      Quick Create
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => {
                          handleDropdownNewChat();
                          setIsMobileMenuOpen(false);
                        }}
                        className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 flex flex-col items-center gap-1 text-center cursor-pointer transition-colors"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[10px] font-semibold text-blue-300">New Chat</span>
                      </button>
                      <button
                        onClick={() => {
                          handleDropdownNewProject();
                          setIsMobileMenuOpen(false);
                        }}
                        className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 flex flex-col items-center gap-1 text-center cursor-pointer transition-colors"
                      >
                        <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[10px] font-semibold text-cyan-300">New Project</span>
                      </button>
                      <button
                        onClick={() => {
                          handleDropdownNewImageGen();
                          setIsMobileMenuOpen(false);
                        }}
                        className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 flex flex-col items-center gap-1 text-center cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-[10px] font-semibold text-purple-300">Image Gen</span>
                      </button>
                    </div>
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => {
                        setActiveSection('landing');
                        setIsMobileMenuOpen(false);
                      }}
                      className="p-2.5 rounded-xl text-left text-xs font-semibold text-slate-300 hover:bg-slate-800/80 flex items-center gap-2"
                    >
                      <Home className="w-4 h-4 text-blue-400" />
                      <span>First Page / Overview</span>
                    </button>
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveSection(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 ${
                            active
                              ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30'
                              : 'text-slate-300 hover:bg-slate-800/80'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Drawer Footer with Reviews & Sign Out */}
                <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setShowReviewModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-yellow-400 text-xs font-bold text-center cursor-pointer"
                  >
                    ★ Write a Review
                  </button>
                  <button
                    onClick={() => {
                      setShowEmbedModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Website Floating Widget</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-500 font-mono">
                    MR TECH AI • Created by RAYYAN
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Active View Container */}
          <main className={`flex-1 w-full max-w-full ${activeSection === 'chat' ? 'h-screen overflow-hidden pb-0' : 'h-[calc(100vh-3.5rem)] overflow-y-auto pb-16 md:pb-0'}`}>
            {activeSection === 'chat' && (
              <ChatView
                conversation={currentConversation}
                onUpdateConversation={handleUpdateConversation}
                onNewChat={handleNewChat}
                customInstructions={customInstructions}
                activeProject={currentProject}
                onOpenReviewModal={() => setShowReviewModal(true)}
                onOpenPromptLibrary={() => setShowPromptLibrary(true)}
                deviceMode={deviceMode}
                conversations={conversations}
                onSelectConversation={(id) => setActiveConvId(id)}
                onDeleteConversation={handleDeleteConversation}
                onTogglePin={handleTogglePin}
                onNavigateToHistory={() => setActiveSection('history')}
                onNavigateToSettings={() => setActiveSection('settings')}
                onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
                onNavigate={(sec) => setActiveSection(sec)}
                projects={projects}
                knowledgeDocuments={knowledgeDocuments}
              />
            )}

            {activeSection === 'history' && (
              <ChatHistoryView
                conversations={conversations}
                activeConvId={activeConvId}
                onSelectConversation={(id) => {
                  setActiveConvId(id);
                  setActiveSection('chat');
                }}
                onNewChat={handleNewChat}
                onRenameConversation={handleRenameConversation}
                onDeleteConversation={handleDeleteConversation}
                onTogglePin={handleTogglePin}
                onToggleArchive={handleToggleArchive}
                onClearAllHistory={handleClearAllHistory}
                projects={projects}
                onNavigateToChat={() => setActiveSection('chat')}
              />
            )}

            {activeSection === 'image-studio' && (
              <ImageStudio
                history={imageHistory}
                onSaveImage={handleSaveImage}
                onDeleteImage={handleDeleteImage}
                autoFocusPrompt={autoFocusImagePrompt}
              />
            )}

            {activeSection === 'tools' && (
              <ToolsHub onOpenEmbedWidgetModal={() => setShowEmbedModal(true)} />
            )}

            {activeSection === 'projects' && (
              <ProjectsView
                projects={projects}
                conversations={conversations}
                onSelectProject={(projId) => {
                  setActiveProjectId(projId);
                  setActiveSection('chat');
                }}
                onCreateProject={handleCreateProject}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
                initialCreateMode={startProjectCreate}
              />
            )}

            {activeSection === 'compare' && <CompareView />}

            {activeSection === 'settings' && (
              <SettingsView
                deviceMode={deviceMode}
                onSetDeviceMode={(dm) => setDeviceMode(dm)}
                theme={theme}
                onSetTheme={(t) => setTheme(t)}
                customInstructions={customInstructions}
                onUpdateInstructions={(inst) => setCustomInstructions((prev) => ({ ...prev, ...inst }))}
                memories={memories}
                onAddMemory={handleAddMemory}
                onDeleteMemory={handleDeleteMemory}
                onClearMemories={handleClearMemories}
                conversations={conversations}
                knowledgeDocuments={knowledgeDocuments}
                onAddKnowledgeDocument={handleAddKnowledgeDocument}
                onUpdateKnowledgeDocument={handleUpdateKnowledgeDocument}
                onDeleteKnowledgeDocument={handleDeleteKnowledgeDocument}
                onToggleKnowledgeDocument={handleToggleKnowledgeDocument}
                onClearKnowledgeDocuments={handleClearKnowledgeDocuments}
                user={user}
                onOpenReviewModal={() => setShowReviewModal(true)}
                onNavigateToAdmin={() => setActiveSection('admin-reviews')}
                onNavigateToUserDirectory={() => setActiveSection('admin-users')}
                onLogout={handleLogout}
              />
            )}

            {activeSection === 'admin-users' && (
              <AdminUserDashboard
                currentUser={user}
                onNavigateToChat={() => setActiveSection('chat')}
                onUserRoleChange={(u) => {
                  if (u.id === user?.id || u.uid === user?.uid) {
                    setUser(u);
                    localStorage.setItem('mrtech_user', JSON.stringify(u));
                  }
                }}
              />
            )}

            {activeSection === 'admin-reviews' && (
              <AdminReviewsView
                currentUser={user}
                onUserLogin={(u) => setUser(u)}
                onNavigateToUsers={() => setActiveSection('admin-users')}
              />
            )}
          </main>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Phone & iPhone mode - hidden in chat assistant) */}
      {activeSection !== 'landing' && activeSection !== 'chat' && isMobileLayout && (
        <nav className="fixed bottom-0 left-0 right-0 h-14 bg-black/95 border-t border-[#27272a] backdrop-blur-lg flex items-center justify-around z-30 px-2 pb-[env(safe-area-inset-bottom)]">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            const isChat = item.id === 'chat';

            if (isChat) {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    triggerHapticFeedback(12);
                    setActiveSection(item.id);
                  }}
                  aria-label="Chat"
                  className={`relative flex flex-col items-center justify-center py-0.5 px-2 min-w-[46px] rounded-lg transition-all duration-200 cursor-pointer ${
                    active
                      ? 'text-cyan-400 bg-cyan-950/30 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/40 border border-transparent'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="active-bottom-nav-indicator"
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-3.5 h-[2px] rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.95)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      active ? 'scale-105 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]' : ''
                    }`}
                  />
                  <span className="text-[8.5px] font-semibold tracking-tight mt-[1px] leading-tight">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  triggerHapticFeedback(12);
                  setActiveSection(item.id);
                }}
                className={`relative flex flex-col items-center justify-center p-1 min-w-[50px] transition-colors cursor-pointer ${
                  active ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="active-bottom-nav-indicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.95)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* 3. Blocking Profile Completion Modal (User Profile Form):
          Required after login if profile has not been completed.
          User must complete Full Name, Gmail/Email, Age, Phone Number, and User Type before continuing to main website. */}
      {Boolean(user && !user.profileCompleted && (!user.age || !user.phone || !user.userType || !user.name?.trim())) && (
        <CompleteProfileModal
          user={user}
          onComplete={(updatedUser) => {
            setUser(updatedUser);
            localStorage.setItem('mrtech_user', JSON.stringify(updatedUser));
          }}
          onLogout={handleLogout}
        />
      )}

      {/* First-Time Onboarding Modal */}
      <OnboardingModal isOpen={showOnboarding} onComplete={handleCompleteOnboarding} />

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        user={user}
        deviceMode={deviceMode}
        onUserLogin={(u) => setUser(u)}
      />

      {/* Prompt Library Modal */}
      <PromptLibraryModal
        isOpen={showPromptLibrary}
        onClose={() => setShowPromptLibrary(false)}
        onSelectPrompt={(promptText) => {
          // Send or insert prompt into active conversation
          if (activeSection !== 'chat') {
            setActiveSection('chat');
          }
        }}
      />

      {/* Desktop Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(section) => setActiveSection(section)}
        onNewChat={handleNewChat}
        onNewProject={handleDropdownNewProject}
        onNewImageGen={handleDropdownNewImageGen}
        currentTheme={theme}
        onSetTheme={(t) => setTheme(t)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
      />

      {/* Desktop Keyboard Shortcuts Modal (Ctrl+/) */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Website Floating Widget Embed Generator Modal */}
      <EmbedWidgetModal
        isOpen={showEmbedModal}
        onClose={() => setShowEmbedModal(false)}
      />
    </div>
  );
};
export default App;
