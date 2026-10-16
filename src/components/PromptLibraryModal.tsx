import React, { useState } from 'react';
import { PromptItem } from '../types';
import { Sparkles, Search, Copy, Check, ArrowRight, X, BookmarkPlus } from 'lucide-react';
import { DEFAULT_PROMPTS } from '../data/prompts';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
}

const CATEGORIES = [
  'All',
  'Coding',
  'Image',
  'Study',
  'Writing',
  'Research',
  'Business',
  'Content',
  'Productivity',
];

export const PromptLibraryModal: React.FC<PromptLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [prompts, setPrompts] = useState<PromptItem[]>(DEFAULT_PROMPTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = prompts.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.prompt.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl my-6 bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">MR TECH AI Prompt Library</h2>
              <p className="text-xs text-slate-400">Curated high-yield prompts optimized for AI 1</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts by title, keywords or topic..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                selectedCategory === cat
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Prompts list */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No matching prompts found.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 flex flex-col gap-2 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(item.id, item.prompt)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title="Copy text"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-teal-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        onSelectPrompt(item.prompt);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 flex items-center gap-1 border border-cyan-500/30"
                    >
                      <span>Insert</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">{item.prompt}</p>

                {item.tags && (
                  <div className="flex gap-1">
                    {item.tags.map((t) => (
                      <span key={t} className="text-[10px] text-slate-500 font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
