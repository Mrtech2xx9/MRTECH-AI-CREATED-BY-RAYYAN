import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  ChevronDown,
  MessageSquarePlus,
  FolderPlus,
  Sparkles,
} from 'lucide-react';

export interface HeaderNewDropdownProps {
  onNewChat: () => void;
  onNewProject: () => void;
  onNewImageGen: () => void;
  className?: string;
  buttonClassName?: string;
}

interface MenuItem {
  id: 'chat' | 'project' | 'image';
  label: string;
  description: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  iconBorder: string;
  action: () => void;
}

export const HeaderNewDropdown: React.FC<HeaderNewDropdownProps> = ({
  onNewChat,
  onNewProject,
  onNewImageGen,
  className = '',
  buttonClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const menuItems: MenuItem[] = [
    {
      id: 'chat',
      label: 'New Chat',
      description: 'Start fresh conversation with AI 1',
      badge: 'Ctrl+Shift+N',
      icon: MessageSquarePlus,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/15',
      iconBorder: 'border-blue-500/30',
      action: onNewChat,
    },
    {
      id: 'project',
      label: 'New Project',
      description: 'Dedicated context & custom directives',
      badge: 'Workspace',
      icon: FolderPlus,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/15',
      iconBorder: 'border-cyan-500/30',
      action: onNewProject,
    },
    {
      id: 'image',
      label: 'New Image Gen',
      description: 'Generate visuals in Image Studio',
      badge: 'Studio',
      icon: Sparkles,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/15',
      iconBorder: 'border-purple-500/30',
      action: onNewImageGen,
    },
  ];

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setFocusedIndex(0);
      }
      return next;
    });
  };

  const handleItemSelect = (action: () => void) => {
    handleClose();
    action();
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, handleClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        buttonRef.current?.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % menuItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (focusedIndex >= 0 && focusedIndex < menuItems.length) {
          e.preventDefault();
          handleItemSelect(menuItems[focusedIndex].action);
        }
      } else if (e.key === 'Tab') {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, focusedIndex, menuItems, handleClose]);

  // Focus effect for keyboard navigation
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* New Button with Dropdown Trigger */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Create new item: New Chat, New Project, or New Image Gen"
        className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 border border-blue-400/30 transition-all active:scale-95 cursor-pointer select-none ${buttonClassName}`}
      >
        <Plus className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-90" />
        <span>New</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-blue-200/80 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-68 sm:w-72 rounded-2xl bg-[#0d1322]/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl shadow-black/80 p-1.5 z-50 overflow-hidden"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="new-menu-button"
          >
            {/* Header label */}
            <div className="px-2.5 py-1.5 border-b border-slate-800/80 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                Quick Create
              </span>
              <span className="text-[9px] font-mono text-cyan-400/90 font-medium">
                MR TECH AI
              </span>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col gap-0.5">
              {menuItems.map((item, idx) => {
                const Icon = item.icon;
                const isFocused = focusedIndex === idx;

                return (
                  <button
                    key={item.id}
                    ref={(el) => {
                      itemRefs.current[idx] = el;
                    }}
                    type="button"
                    role="menuitem"
                    tabIndex={isOpen ? 0 : -1}
                    onClick={() => handleItemSelect(item.action)}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    className={`w-full text-left p-2 rounded-xl flex items-center gap-3 transition-colors cursor-pointer outline-none ${
                      isFocused
                        ? 'bg-slate-800/90 text-white border border-slate-700/80'
                        : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl ${item.iconBg} ${item.iconBorder} border flex items-center justify-center shrink-0 transition-transform ${
                        isFocused ? 'scale-105' : ''
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-semibold text-white tracking-tight truncate">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border shrink-0 ${
                              item.id === 'chat'
                                ? 'bg-slate-900 border-slate-700 text-slate-400'
                                : item.id === 'project'
                                ? 'bg-cyan-950/70 border-cyan-800/60 text-cyan-300'
                                : 'bg-purple-950/70 border-purple-800/60 text-purple-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
