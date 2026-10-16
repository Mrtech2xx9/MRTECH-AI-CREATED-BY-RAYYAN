import React, { useState, useMemo } from 'react';
import {
  History,
  MessageSquare,
  Search,
  Plus,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  Archive,
  Download,
  Copy,
  Calendar,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Conversation, Project } from '../types';

interface ChatHistoryViewProps {
  conversations: Conversation[];
  activeConvId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onClearAllHistory: () => void;
  projects: Project[];
  onNavigateToChat: () => void;
}

export const ChatHistoryView: React.FC<ChatHistoryViewProps> = ({
  conversations,
  activeConvId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onTogglePin,
  onToggleArchive,
  onClearAllHistory,
  projects,
  onNavigateToChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pinned' | 'archived'>('all');
  const [selectedProject, setSelectedProject] = useState<string | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Statistics
  const totalConversations = conversations.length;
  const totalMessages = conversations.reduce((acc, c) => acc + c.messages.length, 0);
  const pinnedCount = conversations.filter((c) => c.pinned).length;
  const archivedCount = conversations.filter((c) => c.archived).length;

  // Filtered list based on search and selected tabs
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // Filter tab
      if (selectedFilter === 'pinned' && !conv.pinned) return false;
      if (selectedFilter === 'archived' && !conv.archived) return false;
      if (selectedFilter === 'all' && conv.archived) return false;

      // Project filter
      if (selectedProject !== 'all' && conv.projectId !== selectedProject) return false;

      // Search query (matches title or message content)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = conv.title.toLowerCase().includes(q);
        const matchesContent = conv.messages.some((m) => m.content.toLowerCase().includes(q));
        return matchesTitle || matchesContent;
      }

      return true;
    });
  }, [conversations, selectedFilter, selectedProject, searchQuery]);

  // Group conversations by relative time: Today, Yesterday, Previous 7 Days, Older
  const groupedConversations = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const weekAgo = today - 86400000 * 7;

    const groups: { [key: string]: Conversation[] } = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: [],
    };

    filteredConversations.forEach((conv) => {
      const convTime = new Date(conv.updatedAt || conv.createdAt).getTime();
      if (convTime >= today) {
        groups['Today'].push(conv);
      } else if (convTime >= yesterday) {
        groups['Yesterday'].push(conv);
      } else if (convTime >= weekAgo) {
        groups['Previous 7 Days'].push(conv);
      } else {
        groups['Older'].push(conv);
      }
    });

    return groups;
  }, [filteredConversations]);

  const handleOpenConversation = (id: string) => {
    onSelectConversation(id);
    onNavigateToChat();
  };

  const handleStartRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleExportMarkdown = (conv: Conversation) => {
    const lines = [
      `# ${conv.title}`,
      `*Exported from MR TECH AI • Created by RAYYAN*`,
      `*Date: ${new Date(conv.createdAt).toLocaleString()}*`,
      '',
      '---',
      '',
    ];

    conv.messages.forEach((m) => {
      const sender = m.role === 'user' ? '### 👤 User' : '### 🤖 MR TECH AI (AI 1)';
      lines.push(sender);
      lines.push(`*${new Date(m.timestamp).toLocaleTimeString()}*`);
      lines.push('');
      lines.push(m.content);
      lines.push('');
      lines.push('---');
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${conv.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_MR_TECH_AI.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyTranscript = (conv: Conversation) => {
    const transcript = conv.messages
      .map((m) => `${m.role === 'user' ? 'User' : 'MR TECH AI'}: ${m.content}`)
      .join('\n\n');
    navigator.clipboard.writeText(transcript);
    setCopiedId(conv.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Chat History
              </h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                {totalConversations} {totalConversations === 1 ? 'Session' : 'Sessions'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Review, search, pin, export, and resume your AI 1 conversation sessions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              onNewChat();
              onNavigateToChat();
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {conversations.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Clear all conversation history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#131926] border border-slate-800">
          <span className="text-xs text-slate-400">Total Conversations</span>
          <div className="text-xl font-bold font-mono text-white mt-1">{totalConversations}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#131926] border border-slate-800">
          <span className="text-xs text-slate-400">Messages Exchanged</span>
          <div className="text-xl font-bold font-mono text-blue-400 mt-1">{totalMessages}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#131926] border border-slate-800">
          <span className="text-xs text-slate-400">Pinned Bookmarks</span>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{pinnedCount}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#131926] border border-slate-800">
          <span className="text-xs text-slate-400">Local Persistence</span>
          <div className="text-xs font-mono text-emerald-400 mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active & Saved
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#131926] border border-slate-800">
        {/* Search box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversation titles or message text..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-[#0B0F1A] border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-100 placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
              selectedFilter === 'all'
                ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300 font-semibold'
                : 'bg-[#0B0F1A] border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Active ({conversations.filter((c) => !c.archived).length})
          </button>
          <button
            onClick={() => setSelectedFilter('pinned')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors whitespace-nowrap ${
              selectedFilter === 'pinned'
                ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300 font-semibold'
                : 'bg-[#0B0F1A] border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Pin className="w-3 h-3 text-blue-400 rotate-45" />
            <span>Pinned ({pinnedCount})</span>
          </button>
          <button
            onClick={() => setSelectedFilter('archived')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors whitespace-nowrap ${
              selectedFilter === 'archived'
                ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300 font-semibold'
                : 'bg-[#0B0F1A] border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Archive className="w-3 h-3 text-slate-400" />
            <span>Archived ({archivedCount})</span>
          </button>
        </div>

        {/* Project filter dropdown if projects exist */}
        {projects.length > 0 && (
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-[#0B0F1A] border border-slate-800 text-slate-300 focus:outline-none"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#131926]/50 border border-slate-800 space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No conversations found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No chats matched "${searchQuery}". Try a different keyword or clear search.`
              : 'You have no conversations in this category yet. Start a new chat with AI 1.'}
          </p>
          <button
            onClick={() => {
              onNewChat();
              onNavigateToChat();
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start New Chat</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.entries(groupedConversations) as [string, Conversation[]][]).map(([groupName, convs]) => {
            if (convs.length === 0) return null;
            return (
              <div key={groupName} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    {groupName}
                  </h3>
                  <div className="h-[1px] flex-1 bg-slate-800" />
                  <span className="text-[11px] font-mono text-slate-500">{convs.length}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {convs.map((conv) => {
                    const isActive = conv.id === activeConvId;
                    const isEditing = conv.id === editingId;
                    const lastMessage =
                      conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
                    const project = projects.find((p) => p.id === conv.projectId);

                    return (
                      <div
                        key={conv.id}
                        className={`group p-4 rounded-2xl bg-[#131926] border transition-all duration-200 flex flex-col justify-between gap-3 relative ${
                          isActive
                            ? 'border-blue-500/50 shadow-md shadow-blue-500/5 bg-[#172033]'
                            : 'border-slate-800 hover:border-slate-700 hover:bg-[#161D2D]'
                        }`}
                      >
                        {/* Top row: Title + Pin badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="flex-1 px-2 py-1 rounded bg-[#0B0F1A] border border-blue-500 text-xs text-white focus:outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveRename(conv.id);
                                    if (e.key === 'Escape') setEditingId(null);
                                  }}
                                />
                                <button
                                  onClick={() => handleSaveRename(conv.id)}
                                  className="p-1 rounded bg-blue-600 text-white hover:bg-blue-500"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <MessageSquare
                                  className={`w-4 h-4 shrink-0 ${
                                    isActive ? 'text-blue-400' : 'text-slate-400'
                                  }`}
                                />
                                <h4 className="text-sm font-semibold text-white truncate">
                                  {conv.title}
                                </h4>
                                {conv.pinned && (
                                  <Pin className="w-3 h-3 text-blue-400 rotate-45 shrink-0" />
                                )}
                              </div>
                            )}

                            {/* Project tag if associated */}
                            {project && (
                              <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: project.color }}
                                />
                                <span className="font-medium text-slate-300">{project.name}</span>
                              </div>
                            )}
                          </div>

                          {/* Quick Pin Toggle */}
                          <button
                            onClick={() => onTogglePin(conv.id)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              conv.pinned
                                ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                            }`}
                            title={conv.pinned ? 'Unpin chat' : 'Pin chat to top'}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Last Message Snippet */}
                        <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed bg-[#0B0F1A]/60 p-2.5 rounded-xl border border-slate-800/60 font-sans">
                          {lastMessage ? (
                            <span>
                              <strong className="text-slate-300 font-semibold">
                                {lastMessage.role === 'user' ? 'You: ' : 'AI 1: '}
                              </strong>
                              {lastMessage.content.slice(0, 140) || 'Attachment or empty prompt'}
                            </span>
                          ) : (
                            <span className="italic text-slate-600">No messages in this chat</span>
                          )}
                        </div>

                        {/* Card Footer: Metadata & Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                          <div className="flex items-center gap-2 font-mono">
                            <span>{conv.messages.length} msgs</span>
                            <span>•</span>
                            <span>{new Date(conv.updatedAt || conv.createdAt).toLocaleDateString()}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Copy transcript */}
                            <button
                              onClick={() => handleCopyTranscript(conv)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                              title="Copy full conversation transcript"
                            >
                              {copiedId === conv.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Export Markdown */}
                            <button
                              onClick={() => handleExportMarkdown(conv)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                              title="Export conversation as Markdown"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {/* Rename */}
                            <button
                              onClick={() => handleStartRename(conv)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                              title="Rename chat"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Archive toggle */}
                            <button
                              onClick={() => onToggleArchive(conv.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                              title={conv.archived ? 'Restore from archive' : 'Archive chat'}
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => onDeleteConversation(conv.id)}
                              className="p-1.5 rounded-lg hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition-colors"
                              title="Delete conversation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Open / Resume Chat Button */}
                            <button
                              onClick={() => handleOpenConversation(conv.id)}
                              className="ml-1 px-3 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-500 text-blue-400 hover:text-white font-medium text-xs flex items-center gap-1 transition-all"
                            >
                              <span>Open</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#131926] border border-red-500/40 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 rounded-xl bg-red-950/50 border border-red-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Clear All Chat History?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete all {totalConversations} conversation sessions and their
              associated message histories?
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAllHistory();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/20"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
