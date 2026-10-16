import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Keyboard, Command, Sparkles } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const shortcutGroups = [
    {
      title: 'Global Shortcuts',
      shortcuts: [
        { keys: ['Ctrl', 'K'], label: 'Open Command Palette' },
        { keys: ['Ctrl', '/'], label: 'View Keyboard Shortcuts' },
        { keys: ['Esc'], label: 'Close Active Modal / Command Palette' },
      ],
    },
    {
      title: 'Quick Actions & Creation',
      shortcuts: [
        { keys: ['Ctrl', 'Shift', 'N'], label: 'New Chat (Fresh Conversation)' },
        { keys: ['Ctrl', 'Shift', 'P'], label: 'New Project (Custom Directive)' },
        { keys: ['Ctrl', 'Shift', 'I'], label: 'New Image Gen (AI Studio)' },
        { keys: ['Ctrl', 'M'], label: 'Toggle Voice-to-Text Dictation' },
        { keys: ['Ctrl', 'Enter'], label: 'Send Chat Message' },
        { keys: ['Shift', 'Enter'], label: 'Insert New Line in Prompt' },
      ],
    },
    {
      title: 'Quick Section Switching',
      shortcuts: [
        { keys: ['Ctrl', '1'], label: 'Go to Chat' },
        { keys: ['Ctrl', '2'], label: 'Go to History' },
        { keys: ['Ctrl', '3'], label: 'Go to Image Studio' },
        { keys: ['Ctrl', '4'], label: 'Go to AI Tools' },
        { keys: ['Ctrl', '5'], label: 'Go to Projects' },
        { keys: ['Ctrl', '6'], label: 'Go to Compare Mode' },
        { keys: ['Ctrl', '7'], label: 'Go to Settings' },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.16 }}
            className="relative w-full max-w-lg bg-slate-950/95 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                    <span>Keyboard Shortcuts</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      Desktop
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Productivity keybindings for high-speed navigation
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shortcuts Content */}
            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {shortcutGroups.map((group) => (
                <div key={group.title} className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    {group.title}
                  </h4>
                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 divide-y divide-slate-800/60 overflow-hidden">
                    {group.shortcuts.map((sc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3.5 py-2.5 text-xs text-slate-300"
                      >
                        <span>{sc.label}</span>
                        <div className="flex items-center gap-1">
                          {sc.keys.map((k, kIdx) => (
                            <React.Fragment key={kIdx}>
                              <kbd className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700/80 font-mono text-[11px] text-cyan-300 shadow-sm">
                                {k}
                              </kbd>
                              {kIdx < sc.keys.length - 1 && (
                                <span className="text-slate-500 text-[10px]">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-900/40 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tip: Mac users can substitute <kbd className="font-mono text-cyan-300">Ctrl</kbd> with <kbd className="font-mono text-cyan-300">⌘ Cmd</kbd></span>
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
