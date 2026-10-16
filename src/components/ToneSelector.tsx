import React from 'react';
import { motion } from 'motion/react';
import { Zap, Laugh, Heart, BookOpen, Wrench } from 'lucide-react';
import { ChatToneMode, CHAT_TONE_MODES } from '../types';

interface ToneSelectorProps {
  selectedTone: ChatToneMode;
  onSelectTone: (tone: ChatToneMode) => void;
  variant?: 'compact' | 'cards';
  className?: string;
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  selectedTone,
  onSelectTone,
  variant = 'compact',
  className = '',
}) => {
  const getToneIcon = (id: ChatToneMode, classNameStr = 'w-3.5 h-3.5') => {
    switch (id) {
      case 'balanced':
        return <Zap className={classNameStr} />;
      case 'funny':
        return <Laugh className={classNameStr} />;
      case 'emotional':
        return <Heart className={classNameStr} />;
      case 'explainer':
        return <BookOpen className={classNameStr} />;
      case 'advance-tools':
        return <Wrench className={classNameStr} />;
      default:
        return <Zap className={classNameStr} />;
    }
  };

  const getActiveBadgeStyle = (id: ChatToneMode) => {
    switch (id) {
      case 'funny':
        return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]';
      case 'emotional':
        return 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 border-rose-500/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.25)]';
      case 'explainer':
        return 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]';
      case 'advance-tools':
        return 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]';
      case 'balanced':
      default:
        return 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-500/60 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.25)]';
    }
  };

  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 w-full ${className}`}>
        {CHAT_TONE_MODES.map((mode) => {
          const isSelected = selectedTone === mode.id;
          return (
            <motion.button
              key={mode.id}
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectTone(mode.id)}
              className={`text-left p-3 rounded-2xl border transition-all duration-200 relative overflow-hidden group cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? `${getActiveBadgeStyle(mode.id)} ring-1 ring-white/10`
                  : 'bg-[#131926]/90 hover:bg-[#1C2538] border-slate-800/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              {/* Subtle back ambient glow */}
              {isSelected && (
                <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-current opacity-10 blur-xl pointer-events-none" />
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{mode.emoji}</span>
                  <div
                    className={`p-1.5 rounded-lg border text-xs ${
                      isSelected
                        ? 'bg-black/30 border-current/30'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {getToneIcon(mode.id, 'w-3.5 h-3.5')}
                  </div>
                </div>

                <div className="font-bold text-xs sm:text-sm tracking-tight text-white group-hover:text-white flex items-center gap-1.5">
                  <span>{mode.name}</span>
                </div>

                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {mode.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className={isSelected ? 'text-current font-bold' : 'text-slate-500'}>
                  {isSelected ? '● ACTIVE MODE' : 'Select Mode'}
                </span>
                <span className="text-slate-500 line-clamp-1 max-w-[120px] text-right">{mode.tagline}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  }

  // Compact horizontal pill toolbar
  return (
    <div
      className={`flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 no-scrollbar scroll-smooth ${className}`}
      role="tablist"
      aria-label="AI Tone and Personality Modes"
    >
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1 hidden md:inline">
          Tone:
        </span>

        {CHAT_TONE_MODES.map((mode) => {
          const isSelected = selectedTone === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectTone(mode.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 select-none ${
                isSelected
                  ? `${getActiveBadgeStyle(mode.id)} font-bold`
                  : 'bg-[#131926]/80 hover:bg-[#1C2538] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
              title={`${mode.name}: ${mode.description}`}
            >
              <span>{mode.emoji}</span>
              <span>{mode.name}</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse ml-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
