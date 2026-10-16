import React, { useState } from 'react';
import {
  History,
  MessageSquare,
  Search,
  Plus,
  Pin,
  Trash2,
  X,
  ExternalLink,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Conversation, Project } from '../types';

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConvId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onTogglePin: (id: string) => void;
  onViewAllHistory: () => void;
  projects: Project[];
}

export const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConvId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onTogglePin,
  onViewAllHistory,
  projects,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = conversations.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pinned = filtered.filter((c) => c.pinned);
  const unpinned = filtered.filter((c) => !c.pinned);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-sm h-full bg-[#111624] border-l border-slate-800 flex flex-col justify-between shadow-2xl animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Chat History</h3>
                <span className="text-[10px] font-mono text-slate-400">
                  {conversations.length} total sessions
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start New Chat</span>
          </button>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chat history..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#0B0F1A] border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-200 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {pinned.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider px-1 flex items-center gap-1">
                <Pin className="w-3 h-3 text-blue-400 rotate-45" />
                <span>Pinned</span>
              </div>
              {pinned.map((c) => renderItem(c))}
            </div>
          )}

          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider px-1">
              Recent Sessions
            </div>
            {unpinned.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 italic">
                No conversations found
              </div>
            ) : (
              unpinned.map((c) => renderItem(c))
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#0B0F1A] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onViewAllHistory();
            }}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-blue-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View Full History Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  function renderItem(c: Conversation) {
    const isActive = c.id === activeConvId;
    const project = projects.find((p) => p.id === c.projectId);
    const lastMsg = c.messages.length > 0 ? c.messages[c.messages.length - 1].content : '';

    return (
      <div
        key={c.id}
        onClick={() => {
          onSelectConversation(c.id);
          onClose();
        }}
        className={`group p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
          isActive
            ? 'bg-blue-600/15 border-blue-500/40 text-blue-200'
            : 'bg-[#131926] border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50 text-slate-300'
        }`}
      >
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 truncate flex-1">
            <MessageSquare
              className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`}
            />
            <span className="text-xs font-semibold truncate">{c.title}</span>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(c.id);
              }}
              className={`p-1 rounded hover:text-blue-400 ${
                c.pinned ? 'text-blue-400' : 'text-slate-500'
              }`}
            >
              <Pin className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(c.id);
              }}
              className="p-1 rounded text-slate-500 hover:text-red-400"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {lastMsg && (
          <p className="text-[11px] text-slate-500 truncate pl-5">{lastMsg}</p>
        )}

        <div className="flex items-center justify-between text-[10px] text-slate-500 pl-5 font-mono">
          <span>{c.messages.length} msgs</span>
          <span>{new Date(c.updatedAt || c.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    );
  }
};
