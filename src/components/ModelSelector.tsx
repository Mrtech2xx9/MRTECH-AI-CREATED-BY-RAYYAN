import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles, Zap, Brain, Shield } from 'lucide-react';
import { GeminiModelId, GEMINI_CHAT_MODELS } from '../types';

interface ModelSelectorProps {
  selectedModel: GeminiModelId;
  onSelectModel: (modelId: GeminiModelId) => void;
  className?: string;
  compact?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onSelectModel,
  className = '',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption =
    GEMINI_CHAT_MODELS.find((m) => m.id === selectedModel) || GEMINI_CHAT_MODELS[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getModelIcon = (id: GeminiModelId) => {
    switch (id) {
      case 'gemini-3.1-flash-lite':
      case 'gemini-3.5-flash-lite':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'gemini-3.8-flash':
      case 'gemini-3.6-flash':
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
      case 'gemini-3.1-pro-preview':
        return <Brain className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button: [AI 1 Ultra Fast ▼] */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Select AI Engine Model"
        className="group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 transition-all duration-200 shadow-sm cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          {getModelIcon(currentOption.id)}
          <span className="text-xs font-semibold text-slate-100 tracking-tight">
            {currentOption.name}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-cyan-400' : 'group-hover:text-slate-200'
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl bg-[#0F172A] border border-slate-800/90 shadow-2xl shadow-black/80 backdrop-blur-xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{ maxHeight: '80vh', overflowY: 'auto' }}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-800/80 mb-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
              <Shield className="w-3 h-3" />
              <span>MR TECH AI Engine Provider</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">3 Available Engines</span>
          </div>

          {/* Model Options */}
          <div className="space-y-1">
            {GEMINI_CHAT_MODELS.map((option) => {
              const isSelected = option.id === selectedModel;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelectModel(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-start justify-between gap-3 border ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                      : 'bg-slate-900/40 hover:bg-slate-800/60 border-transparent hover:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
                      {getModelIcon(option.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                          {option.name}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-medium ${
                            option.id === 'gemini-3.8-flash' || option.id === 'gemini-3.6-flash'
                              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                              : option.id === 'gemini-3.1-flash-lite' || option.id === 'gemini-3.5-flash-lite'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {option.label}
                        </span>
                        {option.isDefault && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 font-mono border border-cyan-500/40 font-bold">
                            Default (Recommended)
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed mt-1 line-clamp-2">
                        {option.purpose}
                      </p>

                      <div className="text-[10px] font-mono text-slate-500 mt-1.5 flex items-center gap-1">
                        <span>Engine:</span>
                        <code className="text-cyan-300 bg-slate-950/80 px-1 py-0.2 rounded">
                          {option.id.includes('pro') ? 'AI 3' : option.id.includes('lite') ? 'AI 1 Lite' : 'AI 1'}
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="mt-1 flex items-center justify-center w-5 h-5">
                    {isSelected && (
                      <div className="p-0.5 rounded-full bg-cyan-500 text-slate-950">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 px-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Direct High-Speed Neural Execution</span>
            <span className="text-cyan-400 font-mono">AI 1 Active</span>
          </div>
        </div>
      )}
    </div>
  );
};
