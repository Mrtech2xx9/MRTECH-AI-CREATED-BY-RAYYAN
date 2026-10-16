import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MessageSquare,
  History,
  Sparkles,
  Wrench,
  FolderGit2,
  Columns,
  Settings,
  Plus,
  Palette,
  Keyboard,
  Moon,
  Sun,
  Compass,
  Monitor,
  ArrowRight,
  CornerDownLeft,
  Download,
} from 'lucide-react';
import { AppSection, ThemeMode } from '../types';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  category: 'Navigation' | 'Actions' | 'Themes';
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: AppSection) => void;
  onNewChat: () => void;
  onNewProject?: () => void;
  onNewImageGen?: () => void;
  currentTheme: ThemeMode;
  onSetTheme: (theme: ThemeMode) => void;
  onOpenShortcuts: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onNewChat,
  onNewProject,
  onNewImageGen,
  currentTheme,
  onSetTheme,
  onOpenShortcuts,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = [
    // Actions
    {
      id: 'action-new-chat',
      title: 'New Conversation',
      description: 'Start a fresh conversation with AI 1',
      category: 'Actions',
      icon: Plus,
      shortcut: 'Ctrl+Shift+N',
      action: () => {
        onNewChat();
        onClose();
      },
    },
    ...(onNewProject
      ? [
          {
            id: 'action-new-project',
            title: 'New Project',
            description: 'Create a project with custom AI directives',
            category: 'Actions' as const,
            icon: FolderGit2,
            shortcut: 'Ctrl+Shift+P',
            action: () => {
              onNewProject();
              onClose();
            },
          },
        ]
      : []),
    ...(onNewImageGen
      ? [
          {
            id: 'action-new-image',
            title: 'New Image Generation',
            description: 'Jump to AI Image Studio prompt creator',
            category: 'Actions' as const,
            icon: Sparkles,
            shortcut: 'Ctrl+Shift+I',
            action: () => {
              onNewImageGen();
              onClose();
            },
          },
        ]
      : []),
    {
      id: 'action-export-backup',
      title: 'Export Workspace Backup',
      description: 'Export all conversations and memories as JSON or Markdown',
      category: 'Actions',
      icon: Download,
      action: () => {
        onNavigate('settings');
        onClose();
      },
    },
    {
      id: 'action-shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'View all desktop keybindings and shortcuts',
      category: 'Actions',
      icon: Keyboard,
      shortcut: 'Ctrl+/',
      action: () => {
        onClose();
        onOpenShortcuts();
      },
    },

    // Navigation
    {
      id: 'nav-chat',
      title: 'Go to Chat',
      description: 'Main AI conversation interface',
      category: 'Navigation',
      icon: MessageSquare,
      shortcut: 'Ctrl+1',
      action: () => {
        onNavigate('chat');
        onClose();
      },
    },
    {
      id: 'nav-history',
      title: 'Go to History',
      description: 'Search and inspect previous conversations',
      category: 'Navigation',
      icon: History,
      shortcut: 'Ctrl+2',
      action: () => {
        onNavigate('history');
        onClose();
      },
    },
    {
      id: 'nav-image-studio',
      title: 'Go to Image Studio',
      description: 'Generate and edit high-resolution images',
      category: 'Navigation',
      icon: Sparkles,
      shortcut: 'Ctrl+3',
      action: () => {
        onNavigate('image-studio');
        onClose();
      },
    },
    {
      id: 'nav-tools',
      title: 'Go to AI Tools',
      description: 'Explore pre-built reasoning & developer tools',
      category: 'Navigation',
      icon: Wrench,
      shortcut: 'Ctrl+4',
      action: () => {
        onNavigate('tools');
        onClose();
      },
    },
    {
      id: 'nav-projects',
      title: 'Go to Projects',
      description: 'Manage specialized system projects',
      category: 'Navigation',
      icon: FolderGit2,
      shortcut: 'Ctrl+5',
      action: () => {
        onNavigate('projects');
        onClose();
      },
    },
    {
      id: 'nav-compare',
      title: 'Go to Compare Mode',
      description: 'Dual-engine prompt comparison benchmark',
      category: 'Navigation',
      icon: Columns,
      shortcut: 'Ctrl+6',
      action: () => {
        onNavigate('compare');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      title: 'Go to Settings',
      description: 'Theme, profile preferences, and custom instructions',
      category: 'Navigation',
      icon: Settings,
      shortcut: 'Ctrl+7',
      action: () => {
        onNavigate('settings');
        onClose();
      },
    },

    // Themes
    {
      id: 'theme-dark',
      title: 'Theme: Dark Cyber',
      description: 'Deep obsidian backdrop with glowing cyan accents',
      category: 'Themes',
      icon: Moon,
      action: () => {
        onSetTheme('dark');
        onClose();
      },
    },
    {
      id: 'theme-cyber-light',
      title: 'Theme: Cyber Light',
      description: 'High-contrast luminescent daylight aesthetic with sky blue',
      category: 'Themes',
      icon: Sun,
      action: () => {
        onSetTheme('cyber-light');
        onClose();
      },
    },
    {
      id: 'theme-midnight-blue',
      title: 'Theme: Midnight Blue',
      description: 'Deep oceanic navy with radiant azure cyber highlights',
      category: 'Themes',
      icon: Compass,
      action: () => {
        onSetTheme('midnight-blue');
        onClose();
      },
    },
    {
      id: 'theme-amethyst',
      title: 'Theme: Amethyst',
      description: 'Royal synthwave violet & obsidian with glowing purple accents',
      category: 'Themes',
      icon: Sparkles,
      action: () => {
        onSetTheme('amethyst');
        onClose();
      },
    },
    {
      id: 'theme-system',
      title: 'Theme: System Auto',
      description: 'Synchronize theme with operating system light/dark mode',
      category: 'Themes',
      icon: Monitor,
      action: () => {
        onSetTheme('system');
        onClose();
      },
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.description && cmd.description.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q) ||
      (cmd.shortcut && cmd.shortcut.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle arrow key navigation inside command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? filteredCommands.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.16 }}
            className="relative w-full max-w-xl bg-slate-950/95 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden z-10 flex flex-col"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800/80 bg-slate-900/40">
              <Search className="w-5 h-5 text-cyan-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command, search section, or choose theme..."
                className="w-full bg-transparent border-none text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60">
                ESC to close
              </span>
            </div>

            {/* Commands List */}
            <div
              ref={listRef}
              className="max-h-[380px] overflow-y-auto p-2 space-y-1"
            >
              {filteredCommands.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No matching commands found for "{query}"
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  const isSelected = idx === selectedIndex;
                  const isCurrentTheme =
                    cmd.id === `theme-${currentTheme}` ||
                    (cmd.id === 'theme-cyber-light' && currentTheme === 'light');

                  return (
                    <div
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-950/50 border border-cyan-500/40 text-white shadow-sm'
                          : 'border border-transparent text-slate-300 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold truncate">
                              {cmd.title}
                            </span>
                            {isCurrentTheme && (
                              <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-500/30">
                                Current
                              </span>
                            )}
                          </div>
                          {cmd.description && (
                            <span className="text-[11px] text-slate-400 truncate">
                              {cmd.description}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pl-2">
                        {cmd.shortcut && (
                          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {cmd.shortcut}
                          </kbd>
                        )}
                        {isSelected && (
                          <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800/80 bg-slate-950/80 text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9.5px]">
                    ↑↓
                  </kbd>{' '}
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9.5px]">
                    ↵
                  </kbd>{' '}
                  to select
                </span>
              </div>
              <span className="text-cyan-400 font-mono text-[10px]">
                MR TECH AI Desktop
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
