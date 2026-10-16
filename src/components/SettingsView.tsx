import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Smartphone,
  Sun,
  Moon,
  Monitor,
  Brain,
  Sliders,
  Sparkles,
  Trash2,
  Plus,
  Check,
  Languages,
  ShieldCheck,
  Star,
  LogOut,
  User,
  Users,
  Palette,
  Compass,
  Database,
  Download,
  FileText,
  FileCode,
  Copy,
  HardDriveDownload,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Search,
  RefreshCw,
  Code2,
  Bot,
  Globe,
  ExternalLink,
} from 'lucide-react';
import {
  DeviceMode,
  ThemeMode,
  AppLanguage,
  CustomInstructions,
  UserProfile,
  KnowledgeDocument,
  Conversation,
} from '../types';
import { KnowledgeBaseManager } from './KnowledgeBaseManager';

interface SettingsViewProps {
  deviceMode: DeviceMode;
  onSetDeviceMode: (mode: DeviceMode) => void;
  theme: ThemeMode;
  onSetTheme: (theme: ThemeMode) => void;
  customInstructions: CustomInstructions;
  onUpdateInstructions: (instructions: Partial<CustomInstructions>) => void;
  memories: string[];
  onAddMemory: (mem: string) => void;
  onDeleteMemory: (index: number) => void;
  onClearMemories: () => void;
  conversations?: Conversation[];
  knowledgeDocuments: KnowledgeDocument[];
  onAddKnowledgeDocument: (doc: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateKnowledgeDocument: (id: string, updates: Partial<KnowledgeDocument>) => void;
  onDeleteKnowledgeDocument: (id: string) => void;
  onToggleKnowledgeDocument: (id: string) => void;
  onClearKnowledgeDocuments: () => void;
  user: UserProfile | null;
  onOpenReviewModal: () => void;
  onNavigateToAdmin: () => void;
  onNavigateToUserDirectory?: () => void;
  onLogout?: () => void;
}

const DEVICE_MODES: Array<{ mode: DeviceMode; label: string; desc: string }> = [
  { mode: 'auto', label: 'Auto (Recommended)', desc: 'Automatically matches viewport size' },
  { mode: 'phone', label: 'Phone', desc: 'True single-column mobile layout' },
  { mode: 'iphone', label: 'iPhone', desc: 'iPhone notch & safe-area optimized' },
  { mode: 'tablet', label: 'Tablet', desc: 'Two-pane split & drawer layout' },
  { mode: 'laptop', label: 'Laptop', desc: 'Sidebar with wide conversation view' },
  { mode: 'desktop', label: 'Desktop', desc: 'Full cyber multi-panel layout' },
  { mode: 'compact', label: 'Compact', desc: 'Ultra-dense workspace layout' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  deviceMode,
  onSetDeviceMode,
  theme,
  onSetTheme,
  customInstructions,
  onUpdateInstructions,
  memories,
  onAddMemory,
  onDeleteMemory,
  onClearMemories,
  conversations = [],
  knowledgeDocuments = [],
  onAddKnowledgeDocument,
  onUpdateKnowledgeDocument,
  onDeleteKnowledgeDocument,
  onToggleKnowledgeDocument,
  onClearKnowledgeDocuments,
  user,
  onOpenReviewModal,
  onNavigateToAdmin,
  onNavigateToUserDirectory,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    'appearance' | 'voice' | 'read-aloud' | 'instructions' | 'knowledge' | 'memory' | 'export' | 'widget' | 'about'
  >('appearance');
  const [newMemoryText, setNewMemoryText] = useState('');
  const [aboutUser, setAboutUser] = useState(customInstructions.aboutUser);
  const [howToRespond, setHowToRespond] = useState(customInstructions.howToRespond);
  const [responseStyle, setResponseStyle] = useState(customInstructions.responseStyle);
  const [language, setLanguage] = useState<AppLanguage>(customInstructions.language);
  const [formatPreference, setFormatPreference] = useState(customInstructions.formatPreference);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Floating Widget Generator State
  const [widgetPosition, setWidgetPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const [widgetTheme, setWidgetTheme] = useState<'dark' | 'light' | 'midnight-blue'>('dark');
  const [widgetGreeting, setWidgetGreeting] = useState('ഹലോ! ഞാൻ MR TECH AI. എന്താണ് സഹായിക്കേണ്ടത്?');
  const [widgetCopiedType, setWidgetCopiedType] = useState<string | null>(null);

  // Read Aloud & Voice Settings State
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>(() => {
    try {
      return localStorage.getItem('mrtech_preferred_voice_uri') || '';
    } catch {
      return '';
    }
  });
  const [speechRate, setSpeechRate] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('mrtech_preferred_speech_rate');
      return saved ? parseFloat(saved) : 1.0;
    } catch {
      return 1.0;
    }
  });
  const [speechPitch, setSpeechPitch] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('mrtech_preferred_speech_pitch');
      return saved ? parseFloat(saved) : 1.0;
    } catch {
      return 1.0;
    }
  });
  const [voiceSearchQuery, setVoiceSearchQuery] = useState('');
  const [voiceLangFilter, setVoiceLangFilter] = useState<'all' | 'en' | 'ml' | 'indic' | 'other'>('all');
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [testSpeechText, setTestSpeechText] = useState(
    'Hello! This is MR TECH AI reading aloud with your selected voice.'
  );
  const [voiceSaveSuccess, setVoiceSaveSuccess] = useState(false);

  // Data Export & Backup State
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown'>('json');
  const [exportScope, setExportScope] = useState<'all' | 'conversations' | 'memories'>('all');
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);
  const [copiedExport, setCopiedExport] = useState<boolean>(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [showExportPreview, setShowExportPreview] = useState<boolean>(false);

  // Total messages counter
  const totalMessagesCount = conversations.reduce(
    (acc, c) => acc + (c.messages?.length || 0),
    0
  );

  // Generate backup content string and metadata
  const generateExportContent = (
    targetFormat: 'json' | 'markdown' = exportFormat,
    targetScope: 'all' | 'conversations' | 'memories' = exportScope
  ): { content: string; filename: string; mimeType: string } => {
    const timestamp = new Date().toISOString();
    const dateSlug = new Date().toISOString().slice(0, 10);
    const convList = conversations || [];
    const memList = memories || [];

    if (targetFormat === 'json') {
      const exportObject: any = {
        app: 'MR TECH AI',
        creator: 'RAYYAN',
        engine: 'AI 1 Engine',
        version: '1.0',
        exportedAt: timestamp,
        user: user
          ? {
              name: user.name,
              email: user.email,
              role: user.role,
            }
          : null,
      };

      if (includeMetadata) {
        exportObject.summary = {
          scope: targetScope,
          totalConversations: targetScope !== 'memories' ? convList.length : 0,
          totalMessages: targetScope !== 'memories' ? totalMessagesCount : 0,
          totalMemories: targetScope !== 'conversations' ? memList.length : 0,
        };
      }

      if (targetScope === 'all' || targetScope === 'memories') {
        exportObject.memories = memList;
      }

      if (targetScope === 'all' || targetScope === 'conversations') {
        exportObject.conversations = convList;
      }

      const filename = `mr-tech-ai-${targetScope}-backup-${dateSlug}.json`;
      return {
        content: JSON.stringify(exportObject, null, 2),
        filename,
        mimeType: 'application/json;charset=utf-8',
      };
    } else {
      // Markdown Format
      const humanDate = new Date().toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
      });

      let md = `# MR TECH AI — Workspace Backup\n\n`;
      if (includeMetadata) {
        md += `> **Export Date:** ${humanDate}  \n`;
        md += `> **Engine:** AI 1 Engine  \n`;
        md += `> **Created by:** RAYYAN  \n`;
        if (user) {
          md += `> **User Account:** ${user.name} (${user.email})  \n`;
        }
        md += `> **Backup Scope:** ${targetScope.toUpperCase()}  \n`;
        if (targetScope !== 'memories') {
          md += `> **Total Conversations:** ${convList.length} (${totalMessagesCount} messages)  \n`;
        }
        if (targetScope !== 'conversations') {
          md += `> **Total AI Memories:** ${memList.length} items  \n`;
        }
        md += `\n---\n\n`;
      }

      // Memories Section
      if (targetScope === 'all' || targetScope === 'memories') {
        md += `## 🧠 AI Memory Bank (${memList.length} items)\n\n`;
        if (memList.length === 0) {
          md += `*No memories saved in AI Memory Bank.*\n\n`;
        } else {
          memList.forEach((mem, idx) => {
            md += `${idx + 1}. ${mem}\n`;
          });
          md += `\n`;
        }
        if (targetScope === 'all') {
          md += `---\n\n`;
        }
      }

      // Conversations Section
      if (targetScope === 'all' || targetScope === 'conversations') {
        md += `## 💬 Conversations History (${convList.length} threads)\n\n`;
        if (convList.length === 0) {
          md += `*No conversations to export.*\n\n`;
        } else {
          convList.forEach((conv, cIdx) => {
            const dateStr = conv.createdAt
              ? new Date(conv.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Unknown date';
            const formatModelExportName = (raw?: string) => {
              if (!raw) return 'AI 1 (Ultra Fast & Instant)';
              if (raw.includes('3.8') || raw === 'ai-2-pro') return 'AI 2 (Advanced Analysis)';
              if (raw.includes('pro') || raw === 'ai-3-max') return 'AI 3 (Max Logic & Reasoning)';
              return 'AI 1 (Ultra Fast & Instant)';
            };
            const modelName = formatModelExportName(conv.selectedModel);
            md += `### ${cIdx + 1}. ${conv.title || 'Untitled Conversation'}\n\n`;
            md += `*Date: ${dateStr} · Model: \`${modelName}\` · Messages: ${conv.messages?.length || 0}*\n\n`;

            if (!conv.messages || conv.messages.length === 0) {
              md += `*No messages in this conversation thread.*\n\n`;
            } else {
              conv.messages.forEach((msg) => {
                const roleIcon = msg.role === 'user' ? '👤 User' : '🤖 MR TECH AI';
                const timeStr = msg.timestamp
                  ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';
                md += `#### ${roleIcon} ${timeStr ? `*(${timeStr})*` : ''}\n\n`;
                if (msg.attachments && msg.attachments.length > 0) {
                  md += `📎 *Attachments:* ${msg.attachments.map((a) => a.name).join(', ')}\n\n`;
                }
                md += `${msg.content || ''}\n\n`;
              });
            }
            md += `---\n\n`;
          });
        }
      }

      const filename = `mr-tech-ai-${targetScope}-backup-${dateSlug}.md`;
      return {
        content: md,
        filename,
        mimeType: 'text/markdown;charset=utf-8',
      };
    }
  };

  const handleDownloadBackup = (
    customFormat?: 'json' | 'markdown',
    customScope?: 'all' | 'conversations' | 'memories'
  ) => {
    const { content, filename, mimeType } = generateExportContent(
      customFormat || exportFormat,
      customScope || exportScope
    );

    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadNotice(`Downloaded "${filename}" successfully!`);
      setTimeout(() => setDownloadNotice(null), 4000);
    } catch (err) {
      console.error('Failed to download backup:', err);
    }
  };

  const handleCopyExport = (
    customFormat?: 'json' | 'markdown',
    customScope?: 'all' | 'conversations' | 'memories'
  ) => {
    const { content } = generateExportContent(
      customFormat || exportFormat,
      customScope || exportScope
    );

    try {
      navigator.clipboard.writeText(content);
      setCopiedExport(true);
      setTimeout(() => setCopiedExport(false), 2000);
    } catch (err) {
      console.error('Failed to copy export:', err);
    }
  };

  const handleSaveInstructions = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateInstructions({
      aboutUser,
      howToRespond,
      responseStyle,
      language,
      formatPreference,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;
    onAddMemory(newMemoryText.trim());
    setNewMemoryText('');
  };

  // Load available system voices from window.speechSynthesis
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const loadVoices = () => {
      try {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) {
          // Sort voices: Malayalam first, then English, then alphabetically
          const sorted = [...v].sort((a, b) => {
            const aLang = a.lang.toLowerCase();
            const bLang = b.lang.toLowerCase();
            const aIsMl = aLang.includes('ml');
            const bIsMl = bLang.includes('ml');
            const aIsEn = aLang.startsWith('en');
            const bIsEn = bLang.startsWith('en');

            if (aIsMl && !bIsMl) return -1;
            if (!aIsMl && bIsMl) return 1;
            if (aIsEn && !bIsEn) return -1;
            if (!aIsEn && bIsEn) return 1;
            return a.name.localeCompare(b.name);
          });
          setAvailableVoices(sorted);
        }
      } catch {}
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTestVoice = (customVoiceUri?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    if (isTestingVoice && !customVoiceUri) {
      setIsTestingVoice(false);
      return;
    }

    const targetUri = customVoiceUri !== undefined ? customVoiceUri : selectedVoiceUri;
    const utterance = new SpeechSynthesisUtterance(testSpeechText.trim() || 'Testing MR TECH AI voice synthesis.');
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    if (targetUri) {
      const found = availableVoices.find((v) => v.voiceURI === targetUri || v.name === targetUri);
      if (found) {
        utterance.voice = found;
        utterance.lang = found.lang;
      }
    }

    utterance.onend = () => {
      setIsTestingVoice(false);
    };
    utterance.onerror = () => {
      setIsTestingVoice(false);
    };

    setIsTestingVoice(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopTestVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsTestingVoice(false);
  };

  const handleSelectVoice = (voiceUri: string, voiceName: string) => {
    setSelectedVoiceUri(voiceUri);
    try {
      if (voiceUri) {
        localStorage.setItem('mrtech_preferred_voice_uri', voiceUri);
        localStorage.setItem('mrtech_preferred_voice_name', voiceName);
      } else {
        localStorage.removeItem('mrtech_preferred_voice_uri');
        localStorage.removeItem('mrtech_preferred_voice_name');
      }
      setVoiceSaveSuccess(true);
      setTimeout(() => setVoiceSaveSuccess(false), 2500);
    } catch {}
  };

  const handleSaveVoiceSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      if (selectedVoiceUri) {
        localStorage.setItem('mrtech_preferred_voice_uri', selectedVoiceUri);
        const chosenVoice = availableVoices.find((v) => v.voiceURI === selectedVoiceUri);
        if (chosenVoice) {
          localStorage.setItem('mrtech_preferred_voice_name', chosenVoice.name);
        }
      } else {
        localStorage.removeItem('mrtech_preferred_voice_uri');
        localStorage.removeItem('mrtech_preferred_voice_name');
      }
      localStorage.setItem('mrtech_preferred_speech_rate', speechRate.toString());
      localStorage.setItem('mrtech_preferred_speech_pitch', speechPitch.toString());
      setVoiceSaveSuccess(true);
      setTimeout(() => setVoiceSaveSuccess(false), 3000);
    } catch {}
  };

  const handleResetVoiceDefaults = () => {
    setSelectedVoiceUri('');
    setSpeechRate(1.0);
    setSpeechPitch(1.0);
    try {
      localStorage.removeItem('mrtech_preferred_voice_uri');
      localStorage.removeItem('mrtech_preferred_voice_name');
      localStorage.removeItem('mrtech_preferred_speech_rate');
      localStorage.removeItem('mrtech_preferred_speech_pitch');
      setVoiceSaveSuccess(true);
      setTimeout(() => setVoiceSaveSuccess(false), 2500);
    } catch {}
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsTestingVoice(false);
  };

  const handleRateChange = (newRate: number) => {
    setSpeechRate(newRate);
    try {
      localStorage.setItem('mrtech_preferred_speech_rate', newRate.toString());
    } catch {}
  };

  const handlePitchChange = (newPitch: number) => {
    setSpeechPitch(newPitch);
    try {
      localStorage.setItem('mrtech_preferred_speech_pitch', newPitch.toString());
    } catch {}
  };

  // Filter available voices based on active tab & search query
  const filteredVoices = availableVoices.filter((v) => {
    const q = voiceSearchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      v.name.toLowerCase().includes(q) ||
      v.lang.toLowerCase().includes(q);

    if (!matchesQuery) return false;

    const langLower = v.lang.toLowerCase();
    if (voiceLangFilter === 'en') {
      return langLower.startsWith('en');
    }
    if (voiceLangFilter === 'ml') {
      return langLower.includes('ml');
    }
    if (voiceLangFilter === 'indic') {
      return (
        langLower.includes('ml') ||
        langLower.startsWith('hi') ||
        langLower.startsWith('ta') ||
        langLower.startsWith('te') ||
        langLower.startsWith('bn') ||
        langLower.startsWith('kn') ||
        langLower.startsWith('mr')
      );
    }
    if (voiceLangFilter === 'other') {
      return !langLower.startsWith('en') && !langLower.includes('ml');
    }
    return true;
  });

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-full flex flex-col p-4 sm:p-6 lg:p-8 bg-[#090d16] text-slate-100">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
              Workspace Settings
            </h1>
            <span className="text-xs font-mono text-cyan-400">
              Personalize Device Modes, Appearance, Memory & Custom AI Rules
            </span>
          </div>
        </div>

        <button
          onClick={onOpenReviewModal}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 hover:border-yellow-500/50 text-yellow-400 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Star className="w-3.5 h-3.5 fill-yellow-400" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mt-6 pb-2 border-b border-slate-800">
        {[
          { id: 'appearance', label: 'Device Mode & Theme', icon: Smartphone },
          { id: 'voice', label: 'Read Aloud', icon: Volume2 },
          { id: 'instructions', label: 'Custom Instructions', icon: Sliders },
          {
            id: 'knowledge',
            label: 'Knowledge Base',
            icon: Database,
            badge: knowledgeDocuments.filter((d) => d.enabled !== false).length,
          },
          { id: 'memory', label: 'AI Memory Bank', icon: Brain },
          { id: 'export', label: 'Export & Backup', icon: HardDriveDownload },
          { id: 'widget', label: 'Floating Widget', icon: Code2, badge: 'Embed' },
          { id: 'about', label: 'Identity & About', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                active
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Appearance & Device Mode */}
      {activeTab === 'appearance' && (
        <div className="flex flex-col gap-6 mt-6 max-w-3xl">
          {/* Device Mode System */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Device Mode System</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Override automatic layout detection to preview or enforce specific screen architectures.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
              {DEVICE_MODES.map((dm) => (
                <button
                  key={dm.mode}
                  type="button"
                  onClick={() => onSetDeviceMode(dm.mode)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    deviceMode === dm.mode
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200 shadow-md shadow-cyan-950/40'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs sm:text-sm">
                    <span>{dm.label}</span>
                    {deviceMode === dm.mode && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{dm.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Mode */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" />
                <span>Theme Mode</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Select your visual contrast profile and aesthetic color theme.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {[
                {
                  id: 'dark',
                  label: 'Dark Cyber',
                  icon: Moon,
                  desc: 'Obsidian & neon cyan accents',
                  accentColor: 'border-cyan-500 text-cyan-400',
                  pillBg: 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30',
                  dot: 'bg-cyan-400',
                },
                {
                  id: 'cyber-light',
                  label: 'Cyber Light',
                  icon: Sun,
                  desc: 'Crisp high-contrast daylight with sky blue',
                  accentColor: 'border-sky-500 text-sky-400',
                  pillBg: 'bg-sky-950/40 text-sky-300 border-sky-500/30',
                  dot: 'bg-sky-400',
                },
                {
                  id: 'midnight-blue',
                  label: 'Midnight Blue',
                  icon: Compass,
                  desc: 'Deep oceanic navy & azure glow',
                  accentColor: 'border-blue-500 text-blue-400',
                  pillBg: 'bg-blue-950/40 text-blue-300 border-blue-500/30',
                  dot: 'bg-blue-400',
                },
                {
                  id: 'amethyst',
                  label: 'Amethyst',
                  icon: Sparkles,
                  desc: 'Royal synthwave violet & purple',
                  accentColor: 'border-purple-500 text-purple-400',
                  pillBg: 'bg-purple-950/40 text-purple-300 border-purple-500/30',
                  dot: 'bg-purple-400',
                },
                {
                  id: 'system',
                  label: 'System Auto',
                  icon: Monitor,
                  desc: 'Dynamically syncs with OS appearance',
                  accentColor: 'border-slate-400 text-slate-300',
                  pillBg: 'bg-slate-800/60 text-slate-300 border-slate-700/50',
                  dot: 'bg-slate-300',
                },
              ].map((t) => {
                const Icon = t.icon;
                const active = theme === t.id || (t.id === 'cyber-light' && theme === 'light');
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSetTheme(t.id as any)}
                    className={`p-3.5 rounded-xl border flex flex-col items-start gap-2 transition-all cursor-pointer text-left relative overflow-hidden group ${
                      active
                        ? `${t.accentColor} bg-slate-950/90 shadow-lg ring-1 ring-cyan-500/30`
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            active ? t.pillBg : 'bg-slate-800/80 text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-xs font-semibold ${active ? 'text-white' : 'text-slate-200'}`}>
                          {t.label}
                        </span>
                      </div>
                      {active ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className={`w-2 h-2 rounded-full ${t.dot} opacity-60 group-hover:opacity-100 transition-opacity`} />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Read Aloud Section with Speech Rate Range Slider in Appearance / General view */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>Read Aloud</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Control the speech rate (speed) of the assistant's voice for the Read Aloud feature.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-sm self-start sm:self-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>{speechRate.toFixed(2)}x Speed</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <label htmlFor="general-speech-rate" className="font-semibold text-slate-200 cursor-pointer">
                  Speech Rate (Speed)
                </label>
                <span className="text-cyan-400 font-bold">{speechRate.toFixed(2)}x</span>
              </div>

              <div className="relative py-1">
                <input
                  id="general-speech-rate"
                  name="speechRate"
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                  aria-label="Speech rate"
                  aria-valuemin={0.5}
                  aria-valuemax={2.0}
                  aria-valuenow={speechRate}
                  data-testid="general-speech-rate-slider"
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>0.5x (Slowest)</span>
                <span className="text-cyan-400">1.0x (Default)</span>
                <span>2.0x (Fastest)</span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleRateChange(rate)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                        Math.abs(speechRate - rate) < 0.02
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {rate === 1.0 ? '1.0x (Normal)' : `${rate}x`}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleTestVoice()}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Test Speed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Read Aloud Settings */}
      {(activeTab === 'voice' || activeTab === 'read-aloud') && (
        <div className="flex flex-col gap-6 mt-6 max-w-4xl">
          {/* Section Header Banner */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>Read Aloud</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customize speech rate (speed), vocal pitch, and voice engine for the assistant's Read Aloud feature.
                </p>
              </div>

              {availableVoices.length > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{availableVoices.length} System Voices Detected</span>
                </div>
              )}
            </div>

            {/* Currently Active Voice Display */}
            <div className="mt-2 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Active Speech Voice</div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2 flex-wrap">
                    {selectedVoiceUri ? (
                      <>
                        <span>{availableVoices.find((v) => v.voiceURI === selectedVoiceUri)?.name || selectedVoiceUri}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {availableVoices.find((v) => v.voiceURI === selectedVoiceUri)?.lang || 'Custom'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>Auto-Detect by Response Language</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Recommended
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isTestingVoice ? (
                  <button
                    type="button"
                    onClick={handleStopTestVoice}
                    className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Stop Preview</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleTestVoice()}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-cyan-500/10"
                  >
                    <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                    <span>Test Active Voice</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Range Slider for Speech Rate (Speed) under Read Aloud */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4 shadow-lg shadow-black/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Speech Rate (Speed) Range Slider</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Drag the range slider to adjust how fast or slow the assistant speaks when reading aloud.
                </p>
              </div>

              {/* Dynamic Speed Badge */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>{speechRate.toFixed(2)}x Speed</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {speechRate === 1.0
                      ? '(Normal Default)'
                      : speechRate < 1.0
                      ? '(Slower)'
                      : '(Faster)'}
                  </span>
                </span>
              </div>
            </div>

            {/* The Range Slider Control */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <label htmlFor="read-aloud-speech-rate" className="font-semibold text-slate-200 cursor-pointer">
                  Speech Rate (Speed)
                </label>
                <span className="text-cyan-400 font-bold">{speechRate.toFixed(2)}x</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="font-bold text-slate-300">0.5x</span>
                  <span className="text-[10px] text-slate-500">(Slowest)</span>
                </span>
                <span className="text-cyan-400 font-semibold flex items-center gap-1">
                  <span>1.0x</span>
                  <span className="text-[10px] text-cyan-500/80">(Normal)</span>
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="font-bold text-slate-300">2.0x</span>
                  <span className="text-[10px] text-slate-500">(Fastest)</span>
                </span>
              </div>

              {/* Range Input Slider */}
              <div className="relative py-1">
                <input
                  id="read-aloud-speech-rate"
                  name="speechRate"
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  aria-label="Speech rate"
                  aria-valuemin={0.5}
                  aria-valuemax={2.0}
                  aria-valuenow={speechRate}
                  data-testid="speech-rate-slider"
                />
              </div>

              {/* Preset Buttons & Quick Test */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-mono text-slate-500 mr-1">Presets:</span>
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleRateChange(rate)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                        Math.abs(speechRate - rate) < 0.02
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
                          : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {rate === 1.0 ? '1.0x (Normal)' : `${rate}x`}
                    </button>
                  ))}
                </div>

                {/* Instant Speed Test Button */}
                <button
                  type="button"
                  onClick={() => {
                    handleTestVoice();
                  }}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Test this speed</span>
                </button>
              </div>
            </div>

            {/* Vocal Pitch Tuning Slider */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Vocal Pitch Adjustment</span>
                <span className="font-mono text-cyan-400 font-bold">{speechPitch.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={speechPitch}
                onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                aria-label="Vocal pitch slider"
              />
              <div className="flex items-center justify-between gap-1 mt-0.5">
                {[
                  { val: 0.75, label: 'Deep (0.75)' },
                  { val: 1.0, label: 'Normal (1.0)' },
                  { val: 1.25, label: 'High (1.25)' },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => handlePitchChange(p.val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      Math.abs(speechPitch - p.val) < 0.01
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Sample Text Input */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-200">Interactive Voice Preview Text</label>
                <span className="text-[10px] font-mono text-slate-400">Type or select a sample phrase</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testSpeechText}
                  onChange={(e) => setTestSpeechText(e.target.value)}
                  placeholder="Enter sentence to test voice..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                />
                {isTestingVoice ? (
                  <button
                    type="button"
                    onClick={handleStopTestVoice}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleTestVoice()}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Speak</span>
                  </button>
                )}
              </div>

              {/* Sample Phrases Chips */}
              <div className="flex flex-wrap gap-1.5 mt-1">
                {[
                  {
                    label: 'English Greeting',
                    text: 'Hello! I am MR TECH AI, created by RAYYAN. How can I assist you today?',
                  },
                  {
                    label: 'മലയാളം (Malayalam)',
                    text: 'നമസ്കാരം! ഞാൻ RAYYAN വികസിപ്പിച്ച MR TECH AI ആണ്. സുഖമാണോ?',
                  },
                  {
                    label: 'Technical Sample',
                    text: 'MR TECH AI operates with advanced models and native Web Speech API synthesis.',
                  },
                ].map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => {
                      setTestSpeechText(sample.text);
                      handleTestVoice();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Available Voices List / Selection Catalog */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Languages className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Select Preferred System Voice</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pick a voice from your browser/OS. The assistant will read aloud using this voice.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={voiceSearchQuery}
                  onChange={(e) => setVoiceSearchQuery(e.target.value)}
                  placeholder="Filter voices..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
                {voiceSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setVoiceSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Language Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-800/80 pb-2">
              {[
                { id: 'all', label: `All (${availableVoices.length})` },
                {
                  id: 'en',
                  label: `English (${availableVoices.filter((v) => v.lang.toLowerCase().startsWith('en')).length})`,
                },
                {
                  id: 'ml',
                  label: `Malayalam (${availableVoices.filter((v) => v.lang.toLowerCase().includes('ml')).length})`,
                },
                {
                  id: 'indic',
                  label: 'Indic Languages',
                },
                {
                  id: 'other',
                  label: 'Other Languages',
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setVoiceLangFilter(tab.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    voiceLangFilter === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-950'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Default Auto Option */}
            <div
              onClick={() => handleSelectVoice('', '')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                !selectedVoiceUri
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-md ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    !selectedVoiceUri ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Auto-Detect by Response Language (Recommended)</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Smart
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Automatically selects Malayalam voice for Malayalam text, and natural English voices for English.
                  </div>
                </div>
              </div>

              {!selectedVoiceUri && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 font-semibold shrink-0">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Selected</span>
                </span>
              )}
            </div>

            {/* Voices List */}
            {availableVoices.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                <VolumeX className="w-8 h-8 text-slate-600 animate-pulse" />
                <div className="text-sm font-semibold text-slate-300">Loading System Voices...</div>
                <div className="text-xs text-slate-500 max-w-sm">
                  Fetching available voice engines from your operating system and browser Web Speech API.
                </div>
              </div>
            ) : filteredVoices.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-slate-400 text-xs">
                No voices found matching "{voiceSearchQuery}". Try clearing your search filter.
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto pr-1 space-y-2">
                {filteredVoices.map((voice) => {
                  const isSelected = selectedVoiceUri === voice.voiceURI || (!selectedVoiceUri && voice.default);
                  const isMalayalam = voice.lang.toLowerCase().includes('ml');
                  const isNatural =
                    voice.name.includes('Natural') ||
                    voice.name.includes('Google') ||
                    voice.name.includes('Samantha') ||
                    voice.name.includes('Premium');

                  return (
                    <div
                      key={voice.voiceURI}
                      onClick={() => handleSelectVoice(voice.voiceURI, voice.name)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        selectedVoiceUri === voice.voiceURI
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-md ring-1 ring-cyan-500/30'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            selectedVoiceUri === voice.voiceURI
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white flex items-center gap-1.5 flex-wrap truncate">
                            <span className="truncate">{voice.name}</span>
                            {isMalayalam && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                മലയാളം
                              </span>
                            )}
                            {isNatural && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                Natural
                              </span>
                            )}
                            {voice.default && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                                OS Default
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>Lang: {voice.lang}</span>
                            <span>•</span>
                            <span>{voice.localService ? 'Local Engine' : 'Online Engine'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {/* Inline Test Button */}
                        <button
                          type="button"
                          onClick={() => handleTestVoice(voice.voiceURI)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                          title={`Listen to sample using ${voice.name}`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span className="hidden sm:inline">Sample</span>
                        </button>

                        {selectedVoiceUri === voice.voiceURI && (
                          <span className="p-1 rounded-full bg-cyan-500 text-slate-950" title="Selected Voice">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetVoiceDefaults}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to System Defaults</span>
              </button>

              <div className="flex items-center gap-3">
                {voiceSaveSuccess && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-fade-in">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Voice settings saved!</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleSaveVoiceSettings()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Save Voice Preferences</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'instructions' && (
        <form onSubmit={handleSaveInstructions} className="flex flex-col gap-5 mt-6 max-w-3xl">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Custom AI 1 Instructions</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Steer how AI 1 tailors responses for your workflow across all conversations.
              </p>
            </div>

            {/* What should AI 1 know about you */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                What should AI 1 know about you?
              </label>
              <textarea
                value={aboutUser}
                onChange={(e) => setAboutUser(e.target.value)}
                rows={3}
                placeholder="e.g. Full-stack TypeScript engineer working on high-security web systems; prefer concise answers."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100 resize-none"
              />
            </div>

            {/* How should AI 1 respond */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                How should AI 1 respond?
              </label>
              <textarea
                value={howToRespond}
                onChange={(e) => setHowToRespond(e.target.value)}
                rows={3}
                placeholder="e.g. Provide production-ready code with types, avoid unneeded filler, always explain security implications."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100 resize-none"
              />
            </div>

            {/* Tone & Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Response Style</label>
                <select
                  value={responseStyle}
                  onChange={(e) => setResponseStyle(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="Direct">Direct (Accurate & Direct Focus)</option>
                  <option value="Technical">Technical</option>
                  <option value="Professional">Professional</option>
                  <option value="Detailed">Detailed</option>
                  <option value="Simple">Simple</option>
                  <option value="Short">Short</option>
                  <option value="Friendly">Friendly</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Preferred Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="English">English</option>
                  <option value="Malayalam">Malayalam (മലയാളം)</option>
                </select>
              </div>
            </div>

            {savedSuccess && (
              <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/40 text-teal-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400" />
                <span>Custom instructions updated successfully!</span>
              </div>
            )}

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 self-start mt-1"
            >
              Save Instructions
            </button>
          </div>
        </form>
      )}

      {/* Tab: Knowledge Base Manager */}
      {activeTab === 'knowledge' && (
        <KnowledgeBaseManager
          documents={knowledgeDocuments}
          onAddDocument={onAddKnowledgeDocument}
          onUpdateDocument={onUpdateKnowledgeDocument}
          onDeleteDocument={onDeleteKnowledgeDocument}
          onToggleDocument={onToggleKnowledgeDocument}
          onClearAllDocuments={onClearKnowledgeDocuments}
        />
      )}

      {/* Tab 3: Memory */}
      {activeTab === 'memory' && (
        <div className="flex flex-col gap-5 mt-6 max-w-3xl">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>AI Memory Bank</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  MR TECH AI retains these key preferences to maintain cross-session context.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {memories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleDownloadBackup('json', 'memories')}
                    className="px-2.5 py-1 rounded-lg text-xs text-purple-400 hover:bg-purple-950/40 border border-purple-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Export memories as JSON backup"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                )}
                {memories.length > 0 && (
                  <button
                    onClick={onClearMemories}
                    className="px-2.5 py-1 rounded-lg text-xs text-red-400 hover:bg-red-950/40 border border-red-500/30 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleCreateMemory} className="flex gap-2">
              <input
                type="text"
                value={newMemoryText}
                onChange={(e) => setNewMemoryText(e.target.value)}
                placeholder="Add a new custom memory item..."
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>

            <div className="flex flex-col gap-2 mt-2">
              {memories.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No memories saved. Add items above or teach MR TECH AI during chats.
                </div>
              ) : (
                memories.map((mem, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-200"
                  >
                    <span>{mem}</span>
                    <button
                      onClick={() => onDeleteMemory(idx)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Data Export & Backup */}
      {activeTab === 'export' && (
        <div className="flex flex-col gap-6 mt-6 max-w-3xl">
          {/* Status Alert Banner */}
          {downloadNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-2 shadow-lg animate-fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{downloadNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setDownloadNotice(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-0.5"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Intro Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HardDriveDownload className="w-4 h-4 text-cyan-400" />
                <span>Export & Workspace Backup</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Safeguard all your conversations, chat messages, and AI memory preferences. Export in standard machine-readable JSON or cleanly structured Markdown notes.
              </p>
            </div>

            {/* Quick 1-Click Backup Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Quick JSON Backup */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-colors flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      <span>Full JSON Backup</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/50 text-cyan-300 border border-cyan-800/40">
                      .json
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    Complete machine-readable archive with conversation trees, message roles, models, and memories.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadBackup('json', 'all')}
                  className="w-full py-2 px-3 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Complete JSON</span>
                </button>
              </div>

              {/* Quick Markdown Document */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/40 transition-colors flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>Readable Markdown</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/50 text-blue-300 border border-blue-800/40">
                      .md
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    Formatted text document with headers, speaker blocks, and timestamps for Obsidian, Notion, or reading.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadBackup('markdown', 'all')}
                  className="w-full py-2 px-3 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 hover:text-blue-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Full Markdown</span>
                </button>
              </div>
            </div>
          </div>

          {/* Customized Export Configuration */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Custom Backup Configuration</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize format, target scope, and preview the generated data before downloading.
              </p>
            </div>

            {/* Target Format Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Export File Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExportFormat('json')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    exportFormat === 'json'
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span className="flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      <span>JSON (.json)</span>
                    </span>
                    {exportFormat === 'json' && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Structured data schema with raw message arrays</p>
                </button>

                <button
                  type="button"
                  onClick={() => setExportFormat('markdown')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    exportFormat === 'markdown'
                      ? 'bg-blue-500/15 border-blue-500/50 text-blue-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>Markdown (.md)</span>
                    </span>
                    {exportFormat === 'markdown' && <Check className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Formatted prose document with markdown headers</p>
                </button>
              </div>
            </div>

            {/* Target Data Scope */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Data Scope to Include
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: 'all' as const,
                    label: 'All Data',
                    desc: `${conversations.length} threads + ${memories.length} memories`,
                  },
                  {
                    id: 'conversations' as const,
                    label: 'Conversations Only',
                    desc: `${conversations.length} threads (${totalMessagesCount} msgs)`,
                  },
                  {
                    id: 'memories' as const,
                    label: 'Memories Only',
                    desc: `${memories.length} memory entries`,
                  },
                ].map((scope) => (
                  <button
                    key={scope.id}
                    type="button"
                    onClick={() => setExportScope(scope.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      exportScope === scope.id
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span>{scope.label}</span>
                      {exportScope === scope.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{scope.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Options Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="includeMetadataCheck"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer"
              />
              <label htmlFor="includeMetadataCheck" className="text-xs text-slate-300 cursor-pointer select-none">
                Include summary statistics, export timestamps, and user profile metadata
              </label>
            </div>

            {/* Live Data Summary Counter */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-around text-center text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Conversations</span>
                <span className="text-sm font-bold text-white font-mono">
                  {exportScope !== 'memories' ? conversations.length : '—'}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Total Messages</span>
                <span className="text-sm font-bold text-cyan-300 font-mono">
                  {exportScope !== 'memories' ? totalMessagesCount : '—'}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block">AI Memories</span>
                <span className="text-sm font-bold text-purple-300 font-mono">
                  {exportScope !== 'conversations' ? memories.length : '—'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleDownloadBackup()}
                className="py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:brightness-110 flex items-center gap-2 shadow-md shadow-cyan-500/20 cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>
                  Download {exportFormat.toUpperCase()} ({exportScope === 'all' ? 'All Data' : exportScope})
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyExport()}
                className={`py-2.5 px-3.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  copiedExport
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
                title="Copy export content directly to clipboard"
              >
                {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedExport ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExportPreview((prev) => !prev)}
                className="py-2.5 px-3.5 rounded-xl text-xs font-semibold bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {showExportPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showExportPreview ? 'Hide Preview' : 'Preview Output'}</span>
              </button>
            </div>

            {/* Collapsible Preview Box */}
            {showExportPreview && (
              <div className="mt-2 rounded-xl bg-slate-950 border border-slate-800 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1 border-b border-slate-800/80">
                  <span>Preview ({exportFormat.toUpperCase()})</span>
                  <span>{generateExportContent().filename}</span>
                </div>
                <pre className="text-[11px] font-mono text-slate-300 max-h-64 overflow-y-auto whitespace-pre-wrap select-all leading-relaxed p-1 bg-slate-900/60 rounded">
                  {generateExportContent().content.slice(0, 3000)}
                  {generateExportContent().content.length > 3000 ? '\n\n... [content truncated for preview]' : ''}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: About & Admin */}
      {activeTab === 'about' && (
        <div className="flex flex-col gap-5 mt-6 max-w-3xl">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-14 h-14 rounded-xl border border-cyan-500/50" />
              <div>
                <h2 className="text-lg font-black text-white">MR TECH AI</h2>
                <p className="text-xs font-mono text-cyan-400">CYBER • TECH • SECURITY</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Created by <strong className="text-cyan-300">RAYYAN</strong>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                <strong>Official Identity Specification:</strong> MR TECH AI is an independent, futuristic cyber-tech
                AI workspace created by <strong>RAYYAN</strong> and powered by high-speed neural AI 1 architecture.
              </p>
              <p>
                All intelligence and image synthesis is proxied securely through modern dedicated server endpoints without
                exposing client keys.
              </p>
            </div>

            {/* Authenticated User Session & Logout */}
            {user && (
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border border-blue-500/50 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                      <span>{user.name}</span>
                      {user.role === 'admin' && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Admin
                        </span>
                      )}
                      {user.userType && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {user.userType}
                        </span>
                      )}
                      {user.age && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          Age: {user.age}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">{user.email}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Authenticated via {user.providerId === 'google.com' ? 'Google OAuth' : 'Email/Password'}
                    </div>
                  </div>
                </div>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            )}

            {/* Admin Portal Links if Admin role */}
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-3">
              {user?.role === 'admin' && onNavigateToUserDirectory && (
                <button
                  onClick={onNavigateToUserDirectory}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600/15 text-blue-300 border border-blue-500/40 hover:bg-blue-600/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>User Information Dashboard</span>
                </button>
              )}

              <button
                onClick={onNavigateToAdmin}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Open Reviews Admin Portal</span>
              </button>

              <button
                onClick={onOpenReviewModal}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Star className="w-4 h-4 text-yellow-400" />
                <span>Submit Feedback & Review</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Website Floating Widget */}
      {activeTab === 'widget' && (
        <div className="flex flex-col gap-6 mt-6 max-w-4xl">
          {/* Overview Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-cyan-950/60 border border-blue-500/30 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    Website Floating Widget (ഫ്ലോട്ടിംഗ് ചാറ്റ് വിഡ്ജറ്റ്)
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                    Ready to Embed
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  നിങ്ങളുടെ മറ്റൊരു വെബ്സൈറ്റിൽ (WordPress, HTML, React, Blogger) MR TECH AI ഒരു ഫ്ലോട്ടിംഗ് ബട്ടൺ ആയി എളുപ്പത്തിൽ ചേർക്കാം!
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-cyan-300">നിങ്ങൾ ചെയ്യേണ്ടത്: </span>
              താഴെ നൽകിയിരിക്കുന്ന 1-ലൈൻ സ്ക്രിപ്റ്റ് കോഡ് കോപ്പി ചെയ്ത് നിങ്ങളുടെ വെബ്സൈറ്റിന്റെ HTML കോഡിലെ{' '}
              <code className="px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-200 font-mono text-xs">
                &lt;/body&gt;
              </code>{' '}
              ടാഗിന് തൊട്ടുമുകളിൽ പേസ്റ്റ് ചെയ്യുക. ബട്ടൺ ക്ലിക്ക് ചെയ്യുമ്പോൾ സന്ദർശകർക്ക് ഇൻസ്റ്റന്റ് ആയി ചാറ്റ് ചെയ്യാം.
            </div>
          </div>

          {/* Configuration Options */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                <span>സ്ഥാനം (Position)</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setWidgetPosition('bottom-right')}
                  className={`py-1.5 px-2 rounded-md font-medium transition-all cursor-pointer ${
                    widgetPosition === 'bottom-right'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Bottom Right
                </button>
                <button
                  type="button"
                  onClick={() => setWidgetPosition('bottom-left')}
                  className={`py-1.5 px-2 rounded-md font-medium transition-all cursor-pointer ${
                    widgetPosition === 'bottom-left'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Bottom Left
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                <span>തീം (Theme)</span>
              </label>
              <select
                value={widgetTheme}
                onChange={(e) => setWidgetTheme(e.target.value as any)}
                className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="dark">Dark Theme (ഡാർക്ക്)</option>
                <option value="midnight-blue">Midnight Blue (മിഡ്നൈറ്റ് ബ്ലൂ)</option>
                <option value="light">Light Theme (ലൈറ്റ്)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>ഗ്രീറ്റിംഗ് സന്ദേശം (Greeting)</span>
              </label>
              <input
                type="text"
                value={widgetGreeting}
                onChange={(e) => setWidgetGreeting(e.target.value)}
                placeholder="ഹലോ! ചോദിക്കൂ..."
                className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* 1-Line Embed Code */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>1. സിംപിൾ 1-ലൈൻ സ്ക്രിപ്റ്റ് കോഡ് (ഏറ്റവും എളുപ്പം):</span>
              </span>
              <button
                onClick={() => {
                  const url = `${typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://ais-pre-fwlcrm5obzksnypge4ge3m-923948869532.asia-southeast1.run.app'}/widget.js`;
                  navigator.clipboard.writeText(`<script src="${url}" defer></script>`);
                  setWidgetCopiedType('simple');
                  setTimeout(() => setWidgetCopiedType(null), 2500);
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-600/30"
              >
                {widgetCopiedType === 'simple' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
              <code>
                {`<script src="${typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://ais-pre-fwlcrm5obzksnypge4ge3m-923948869532.asia-southeast1.run.app'}/widget.js" defer></script>`}
              </code>
            </div>
          </div>

          {/* Customized Code */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>2. കസ്റ്റമൈസ് ചെയ്ത സ്ക്രിപ്റ്റ് കോഡ്:</span>
              </span>
              <button
                onClick={() => {
                  const url = `${typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://ais-pre-fwlcrm5obzksnypge4ge3m-923948869532.asia-southeast1.run.app'}/widget.js`;
                  const code = `<!-- MR TECH AI Floating Chat Widget -->
<script 
  src="${url}" 
  data-position="${widgetPosition}" 
  data-theme="${widgetTheme}" 
  data-greeting="${widgetGreeting}"
  defer>
</script>`;
                  navigator.clipboard.writeText(code);
                  setWidgetCopiedType('custom');
                  setTimeout(() => setWidgetCopiedType(null), 2500);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {widgetCopiedType === 'custom' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Custom Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-purple-300 overflow-x-auto whitespace-pre">
{`<!-- MR TECH AI Floating Chat Widget -->
<script 
  src="${typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://ais-pre-fwlcrm5obzksnypge4ge3m-923948869532.asia-southeast1.run.app'}/widget.js" 
  data-position="${widgetPosition}" 
  data-theme="${widgetTheme}" 
  data-greeting="${widgetGreeting}"
  defer>
</script>`}
            </pre>
          </div>

          {/* iFrame Code */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>3. വെബ്സൈറ്റ് പേജിൽ ഡയറക്റ്റ് iFrame ആയി ഉൾപ്പെടുത്താൻ:</span>
              </span>
              <button
                onClick={() => {
                  const url = `${typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://ais-pre-fwlcrm5obzksnypge4ge3m-923948869532.asia-southeast1.run.app'}/?embed=true&mode=widget&theme=${widgetTheme}`;
                  const code = `<iframe 
  src="${url}" 
  width="100%" 
  height="650" 
  style="border: none; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);"
  allow="clipboard-write; microphone;">
</iframe>`;
                  navigator.clipboard.writeText(code);
                  setWidgetCopiedType('iframe');
                  setTimeout(() => setWidgetCopiedType(null), 2500);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {widgetCopiedType === 'iframe' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy iFrame Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre">
{`<iframe 
  src="${typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://ais-pre-fwlcrm5obzksnypge4ge3m-923948869532.asia-southeast1.run.app'}/?embed=true&mode=widget&theme=${widgetTheme}" 
  width="100%" 
  height="650" 
  style="border: none; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);"
  allow="clipboard-write; microphone;">
</iframe>`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
