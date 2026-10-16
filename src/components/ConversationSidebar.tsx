import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  Archive,
  Star,
  ChevronRight,
  History,
  Sparkles,
  Wrench,
  FolderGit2,
  Settings,
} from 'lucide-react';
import { Conversation, Project, AppSection } from '../types';

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  projects: Project[];
  activeProjectId?: string;
  onSelectProject: (id: string | undefined) => void;
  onOpenReviewModal: () => void;
  onNavigateToHistory?: () => void;
  onNavigate?: (section: AppSection) => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onTogglePin,
  onToggleArchive,
  projects,
  activeProjectId,
  onSelectProject,
  onOpenReviewModal,
  onNavigateToHistory,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const filtered = conversations.filter((c) => {
    if (showArchived ? !c.archived : c.archived) return false;
    if (activeProjectId && c.projectId !== activeProjectId) return false;
    if (search) {
      return c.title.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const pinnedList = filtered.filter((c) => c.pinned);
  const unpinnedList = filtered.filter((c) => !c.pinned);

  const handleStartRename = (c: Conversation) => {
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#131926] border-r border-slate-800 text-slate-200">
      {/* New Chat Button */}
      <div className="p-3.5 border-b border-slate-800 flex flex-col gap-2.5">
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl bg-[#0B0F1A] border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-200 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Projects Filter Pill */}
      {projects.length > 0 && (
        <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <button
            onClick={() => onSelectProject(undefined)}
            className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors ${
              !activeProjectId
                ? 'border-blue-500/30 bg-blue-600/10 text-blue-400 font-medium'
                : 'border-slate-800 bg-[#0B0F1A] text-slate-400 hover:text-slate-300'
            }`}
          >
            All Chats
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className={`px-2.5 py-1 rounded-lg border whitespace-nowrap flex items-center gap-1 transition-colors ${
                activeProjectId === p.id
                  ? 'border-blue-500/30 bg-blue-600/10 text-blue-400 font-medium'
                  : 'border-slate-800 bg-[#0B0F1A] text-slate-400 hover:text-slate-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
        {/* Pinned Section */}
        {pinnedList.length > 0 && (
          <div>
            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest px-2 mb-1.5 flex items-center gap-1">
              <Pin className="w-3 h-3 rotate-45 text-blue-400" />
              <span>Pinned</span>
            </div>
            <div className="space-y-1">
              {pinnedList.map((c) => renderConversationItem(c))}
            </div>
          </div>
        )}

        {/* Recent Chats Section */}
        <div>
          <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest px-2 mb-1.5">
            {showArchived ? 'Archived Chats' : 'Recent Conversations'}
          </div>
          <div className="space-y-1">
            {unpinnedList.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 italic">No conversations</div>
            ) : (
              unpinnedList.map((c) => renderConversationItem(c))
            )}
          </div>
        </div>
      </div>

      {/* Side Hub Navigation: Keep extra features tucked neatly in the sidebar */}
      {onNavigate && (
        <div className="p-2 border-t border-slate-800 bg-[#0B0F1A]/70 flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2 pt-1">
            Features & Hub
          </span>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => onNavigate('image-studio')}
              className="p-1.5 rounded-lg hover:bg-slate-800/80 text-left text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">Image Studio</span>
            </button>
            <button
              onClick={() => onNavigate('tools')}
              className="p-1.5 rounded-lg hover:bg-slate-800/80 text-left text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">Tools Hub</span>
            </button>
            <button
              onClick={() => onNavigate('projects')}
              className="p-1.5 rounded-lg hover:bg-slate-800/80 text-left text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">Projects</span>
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="p-1.5 rounded-lg hover:bg-slate-800/80 text-left text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* User Session Footer (from Clean Minimalism Design) */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            R
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white leading-tight">Session</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              AI 1 Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {onNavigateToHistory && (
            <button
              onClick={onNavigateToHistory}
              className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
              title="Full Chat History"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setShowArchived(!showArchived)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title={showArchived ? 'Show Active' : 'Show Archived'}
          >
            <Archive className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenReviewModal}
            className="p-1 text-yellow-400/90 hover:text-yellow-300 transition-colors"
            title="Feedback & Review"
          >
            <Star className="w-3.5 h-3.5 fill-yellow-400" />
          </button>
        </div>
      </div>
    </div>
  );

  function renderConversationItem(c: Conversation) {
    const isActive = c.id === activeId;
    const isEditing = c.id === editingId;

    if (isEditing) {
      return (
        <div key={c.id} className="p-2 rounded-xl bg-[#0B0F1A] border border-blue-500 flex items-center gap-1">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 bg-transparent text-xs text-white focus:outline-none"
            autoFocus
          />
          <button onClick={() => handleSaveRename(c.id)} className="text-blue-400 hover:text-white p-1">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div
        key={c.id}
        onClick={() => onSelectConversation(c.id)}
        className={`group p-2.5 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-colors ${
          isActive
            ? 'bg-blue-600/10 border border-blue-500/30 text-blue-300 font-medium'
            : 'hover:bg-slate-800/60 text-slate-300 hover:text-white border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
          <span className="text-xs truncate">{c.title}</span>
        </div>

        {/* Hover action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(c.id);
            }}
            title={c.pinned ? 'Unpin' : 'Pin'}
            className={`p-1 rounded hover:text-blue-300 ${c.pinned ? 'text-blue-400' : 'text-slate-500'}`}
          >
            <Pin className="w-3 h-3" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStartRename(c);
            }}
            title="Rename"
            className="p-1 rounded text-slate-500 hover:text-slate-200"
          >
            <Edit2 className="w-3 h-3" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleArchive(c.id);
            }}
            title="Archive"
            className="p-1 rounded text-slate-500 hover:text-slate-200"
          >
            <Archive className="w-3 h-3" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteConversation(c.id);
            }}
            title="Delete"
            className="p-1 rounded text-slate-500 hover:text-red-400"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }
};
