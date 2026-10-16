import React, { useState, useId, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  FileText,
  Globe,
  Code2,
  Check,
  Search,
  Copy,
  Sparkles,
  UploadCloud,
  Layers,
  Info,
  Eye,
  RefreshCw,
  AlertCircle,
  X,
  Database,
  Tag,
  Cpu,
  Hash,
  Wand2,
} from 'lucide-react';
import { KnowledgeDocument, KnowledgeSourceType } from '../types';
import { analyzeDocumentForTags, normalizeTag, TagSuggestion } from '../utils/tagSuggestion';
import { ALL_UNIVERSAL_KNOWLEDGE_DOCUMENTS } from '../data/allKnowledgePresets';

interface KnowledgeBaseManagerProps {
  documents: KnowledgeDocument[];
  onAddDocument: (doc: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateDocument: (id: string, updates: Partial<KnowledgeDocument>) => void;
  onDeleteDocument: (id: string) => void;
  onToggleDocument: (id: string) => void;
  onClearAllDocuments: () => void;
}

const CATEGORIES = [
  'Artificial Intelligence & ML',
  'Software & Full-Stack Development',
  'Cloud, DevOps & Infrastructure',
  'Cybersecurity & Networking',
  'Databases & Storage',
  'Programming & Systems',
  'Hardware & Silicon',
  'Computer Science & Algorithms',
  'World History & Civilizations',
  'Geography & World Nations',
  'World Nations & Geopolitics',
  'Physics & Cosmology',
  'Space & Astronomy',
  'Chemistry & Materials',
  'Biology & Life Sciences',
  'Medicine & Human Health',
  'Earth & Atmospheric Sciences',
  'Mathematics',
  'Economics & Global Finance',
  'Philosophy & Arts',
  'World Religions & Linguistics',
  'Kerala Studies & Geography',
  'Kerala Studies & History',
  'Malayalam Literature & Arts',
  'Kerala PSC & Education',
  'Kerala Economy & Tech',
  'Kerala Biodiversity & Nature',
  'Current Trends (2026)',
  'Custom Research',
];

const PRESET_KNOWLEDGE_ITEMS = ALL_UNIVERSAL_KNOWLEDGE_DOCUMENTS;

export const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({
  documents,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
  onToggleDocument,
  onClearAllDocuments,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | KnowledgeSourceType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<KnowledgeDocument | null>(null);
  const [editingDoc, setEditingDoc] = useState<KnowledgeDocument | null>(null);

  // Add Modal State
  const [addMode, setAddMode] = useState<KnowledgeSourceType>('text');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formContent, setFormContent] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formTagsList, setFormTagsList] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [editTagInput, setEditTagInput] = useState('');
  const [autoTaggedId, setAutoTaggedId] = useState<string | null>(null);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [urlFetchError, setUrlFetchError] = useState<string | null>(null);
  const [fileUploadName, setFileUploadName] = useState('');
  const [fileUploadSize, setFileUploadSize] = useState<number | undefined>(undefined);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputId = useId();

  // Metrics
  const totalCount = documents.length;
  const activeCount = documents.filter((d) => d.enabled).length;
  const totalChars = documents.reduce((sum, d) => sum + (d.content?.length || 0), 0);
  const estimatedTokens = Math.round(totalChars / 4);

  // Filtered docs
  const filteredDocs = documents.filter((doc) => {
    if (activeFilter !== 'all' && doc.type !== activeFilter) return false;
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchContent = doc.content.toLowerCase().includes(q);
      const matchCat = doc.category?.toLowerCase().includes(q);
      const matchTags = doc.tags?.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchContent || matchCat || matchTags;
    }
    return true;
  });

  const resetForm = () => {
    setFormTitle('');
    setFormCategory(CATEGORIES[0]);
    setFormContent('');
    setFormUrl('');
    setFormTagsList([]);
    setCustomTagInput('');
    setFileUploadName('');
    setFileUploadSize(undefined);
    setUrlFetchError(null);
    setIsFetchingUrl(false);
  };

  const handleOpenAddModal = (mode: KnowledgeSourceType = 'text') => {
    resetForm();
    setAddMode(mode);
    setShowAddModal(true);
  };

  // Real-time suggestions for Add Modal
  const addModalSuggestions = useMemo(() => {
    return analyzeDocumentForTags({
      title: formTitle,
      content: formContent,
      category: formCategory,
      existingTags: formTagsList,
      maxSuggestions: 10,
    });
  }, [formTitle, formContent, formCategory, formTagsList]);

  // Real-time suggestions for Edit Modal
  const editModalSuggestions = useMemo(() => {
    if (!editingDoc) return [];
    return analyzeDocumentForTags({
      title: editingDoc.title,
      content: editingDoc.content,
      category: editingDoc.category,
      existingTags: editingDoc.tags || [],
      maxSuggestions: 10,
    });
  }, [editingDoc?.title, editingDoc?.content, editingDoc?.category, editingDoc?.tags]);

  // Tag actions for Add Modal
  const handleAddCustomTag = () => {
    if (!customTagInput.trim()) return;
    const normalized = normalizeTag(customTagInput);
    if (normalized && !formTagsList.some((t) => t.toLowerCase() === normalized.toLowerCase())) {
      setFormTagsList((prev) => [...prev, normalized]);
    }
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTagsList((prev) => prev.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase()));
  };

  const handleAddSuggestedTag = (tag: string) => {
    if (!formTagsList.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setFormTagsList((prev) => [...prev, tag]);
    }
  };

  const handleAddAllSuggestions = () => {
    const newTags = [...formTagsList];
    addModalSuggestions.forEach((s) => {
      if (!newTags.some((t) => t.toLowerCase() === s.tag.toLowerCase())) {
        newTags.push(s.tag);
      }
    });
    setFormTagsList(newTags);
  };

  // Tag actions for Edit Modal
  const handleAddEditCustomTag = () => {
    if (!editingDoc || !editTagInput.trim()) return;
    const normalized = normalizeTag(editTagInput);
    if (normalized) {
      const existing = editingDoc.tags || [];
      if (!existing.some((t) => t.toLowerCase() === normalized.toLowerCase())) {
        setEditingDoc({
          ...editingDoc,
          tags: [...existing, normalized],
        });
      }
    }
    setEditTagInput('');
  };

  const handleRemoveEditTag = (tagToRemove: string) => {
    if (!editingDoc) return;
    setEditingDoc({
      ...editingDoc,
      tags: (editingDoc.tags || []).filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase()),
    });
  };

  const handleAddEditSuggestedTag = (tag: string) => {
    if (!editingDoc) return;
    const existing = editingDoc.tags || [];
    if (!existing.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setEditingDoc({
        ...editingDoc,
        tags: [...existing, tag],
      });
    }
  };

  const handleAddAllEditSuggestions = () => {
    if (!editingDoc) return;
    const existing = [...(editingDoc.tags || [])];
    editModalSuggestions.forEach((s) => {
      if (!existing.some((t) => t.toLowerCase() === s.tag.toLowerCase())) {
        existing.push(s.tag);
      }
    });
    setEditingDoc({
      ...editingDoc,
      tags: existing,
    });
  };

  // Quick 1-click Auto-tag directly from cards
  const handleQuickAutoTag = (doc: KnowledgeDocument) => {
    const suggestions = analyzeDocumentForTags({
      title: doc.title,
      content: doc.content,
      category: doc.category,
      existingTags: doc.tags || [],
      maxSuggestions: 5,
    });

    if (suggestions.length === 0) return;

    const newTags = Array.from(new Set([...(doc.tags || []), ...suggestions.map((s) => s.tag)]));
    onUpdateDocument(doc.id, { tags: newTags });
    setAutoTaggedId(doc.id);
    setTimeout(() => setAutoTaggedId(null), 2500);
  };

  const handleFetchUrl = async () => {
    if (!formUrl.trim() || (!formUrl.startsWith('http://') && !formUrl.startsWith('https://'))) {
      setUrlFetchError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setIsFetchingUrl(true);
    setUrlFetchError(null);

    try {
      const res = await fetch('/api/knowledge/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch content from URL');
      }

      if (!formTitle.trim() && data.title) {
        setFormTitle(data.title);
      }
      setFormContent(data.content || '');
    } catch (err: any) {
      setUrlFetchError(err.message || 'Error fetching URL. Please paste content manually.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setFileUploadName(file.name);
    setFileUploadSize(file.size);

    if (!formTitle.trim()) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setFormTitle(nameWithoutExt);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setFormContent(text);
      }
    };
    reader.onerror = () => {
      setUrlFetchError('Failed to read file. Please try again or paste text manually.');
    };
    reader.readAsText(file);
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    if (!formContent.trim()) return;

    const combinedTags = [...formTagsList];
    if (customTagInput.trim()) {
      const normalized = normalizeTag(customTagInput);
      if (normalized && !combinedTags.some((t) => t.toLowerCase() === normalized.toLowerCase())) {
        combinedTags.push(normalized);
      }
    }

    const summary = formContent.slice(0, 260).replace(/\n/g, ' ') + (formContent.length > 260 ? '...' : '');

    onAddDocument({
      title: formTitle.trim(),
      type: addMode,
      category: formCategory,
      content: formContent.trim(),
      summary,
      sourceUrl: addMode === 'url' ? formUrl.trim() : undefined,
      fileName: addMode === 'file' ? fileUploadName : undefined,
      fileSize: addMode === 'file' ? fileUploadSize : undefined,
      tags: combinedTags.length > 0 ? combinedTags : undefined,
      enabled: true,
      tokenEstimate: Math.round(formContent.trim().length / 4),
    });

    setShowAddModal(false);
    resetForm();
  };

  const handleUpdateExisting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    const currentTags = [...(editingDoc.tags || [])];
    if (editTagInput.trim()) {
      const normalized = normalizeTag(editTagInput);
      if (normalized && !currentTags.some((t) => t.toLowerCase() === normalized.toLowerCase())) {
        currentTags.push(normalized);
      }
    }

    onUpdateDocument(editingDoc.id, {
      title: editingDoc.title.trim(),
      category: editingDoc.category,
      content: editingDoc.content.trim(),
      summary: editingDoc.content.slice(0, 260).replace(/\n/g, ' ') + '...',
      tokenEstimate: Math.round(editingDoc.content.trim().length / 4),
      tags: currentTags.length > 0 ? currentTags : undefined,
      enabled: editingDoc.enabled,
    });
    setEditingDoc(null);
    setEditTagInput('');
  };

  const handleLoadPresets = () => {
    const existingTitles = new Set(documents.map((d) => d.title.toLowerCase()));
    let addedCount = 0;

    for (const preset of ALL_UNIVERSAL_KNOWLEDGE_DOCUMENTS) {
      if (!existingTitles.has(preset.title.toLowerCase())) {
        onAddDocument({
          title: preset.title,
          type: preset.type,
          category: preset.category,
          summary: preset.summary,
          content: preset.content,
          tags: preset.tags,
          enabled: preset.enabled,
        });
        addedCount++;
      }
    }

    if (addedCount === 0) {
      alert('All universal knowledge modules across technology, sciences, world history, and Kerala subjects are already in your Knowledge Base.');
    }
  };

  const handleCopyContent = (doc: KnowledgeDocument) => {
    navigator.clipboard.writeText(doc.content);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 mt-4 w-full">
      {/* Top Banner / Knowledge Bank Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 shrink-0 mt-0.5">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Knowledge Base Manager
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                  RAG & Ground Truth
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Feed custom technical documents, live documentation URLs, and structured data into MR TECH AI. Active
                items are injected as verified ground truth into the AI prompt across all chat sessions, allowing it to learn
                new technologies, private notes, world subjects, Kerala encyclopedia bases, and trends beyond its training cut-off.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={handleLoadPresets}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-cyan-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Load all universal knowledge across modern technology, world sciences, and Kerala subjects"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Add All Knowledge</span>
            </button>

            <button
              onClick={() => handleOpenAddModal('text')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Knowledge</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-col">
            <span className="text-[11px] text-slate-400">Total Documents</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black text-white font-mono">{totalCount}</span>
              <span className="text-[10px] text-slate-500">items</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-col">
            <span className="text-[11px] text-slate-400">Active in AI Context</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black text-emerald-400 font-mono">{activeCount}</span>
              <span className="text-[10px] text-emerald-500/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-col">
            <span className="text-[11px] text-slate-400">Context Size</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black text-cyan-300 font-mono">
                {totalChars > 1024 ? `${(totalChars / 1024).toFixed(1)} KB` : `${totalChars} B`}
              </span>
              <span className="text-[10px] text-slate-500">chars</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-col">
            <span className="text-[11px] text-slate-400">Estimated Tokens</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black text-purple-300 font-mono">~{estimatedTokens.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500">tokens</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge by title, topic, or keyword..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100 placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Type Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Sources', icon: Layers },
            { id: 'text', label: 'Text/Notes', icon: FileText },
            { id: 'file', label: 'Files', icon: UploadCloud },
            { id: 'url', label: 'URLs', icon: Globe },
            { id: 'structured', label: 'Structured/JSON', icon: Code2 },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveFilter(item.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800/70 border border-slate-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mr-1">
          <Tag className="w-3 h-3" />
          Category:
        </span>
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Document Grid / List */}
      {filteredDocs.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-slate-800 text-slate-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="max-w-md">
            <h4 className="text-sm font-bold text-white">No knowledge documents found</h4>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery || activeFilter !== 'all' || selectedCategory !== 'all'
                ? 'No documents match your active filters or search query.'
                : 'Your Knowledge Base is currently empty. Add documents, documentation URLs, or load tech presets to begin.'}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleLoadPresets}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              Load Curated Tech Presets
            </button>
            <button
              onClick={() => handleOpenAddModal('text')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400"
            >
              Add Document
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => {
            const isEnabled = doc.enabled !== false;
            return (
              <div
                key={doc.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative group ${
                  isEnabled
                    ? 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/50 opacity-65 hover:opacity-100'
                }`}
              >
                <div>
                  {/* Top Bar: Type, Category, and Enable Toggle */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800/60">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          doc.type === 'url'
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-500/30'
                            : doc.type === 'file'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                            : doc.type === 'structured'
                            ? 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {doc.type === 'url' && <Globe className="w-3 h-3" />}
                        {doc.type === 'file' && <FileText className="w-3 h-3" />}
                        {doc.type === 'structured' && <Code2 className="w-3 h-3" />}
                        {doc.type === 'text' && <FileText className="w-3 h-3" />}
                        <span>{doc.type}</span>
                      </span>

                      {doc.category && (
                        <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800">
                          {doc.category}
                        </span>
                      )}
                    </div>

                    {/* Active In AI Toggle */}
                    <button
                      onClick={() => onToggleDocument(doc.id)}
                      className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        isEnabled
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400'
                      }`}
                      title={isEnabled ? 'Active in AI prompt context (click to mute)' : 'Muted (click to activate)'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      <span>{isEnabled ? 'In Context' : 'Muted'}</span>
                    </button>
                  </div>

                  {/* Title & Preview */}
                  <div className="mt-3">
                    <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                      {doc.title}
                    </h4>
                    {doc.sourceUrl && (
                      <a
                        href={doc.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 mt-1 truncate"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{doc.sourceUrl}</span>
                      </a>
                    )}
                    {doc.fileName && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                        <UploadCloud className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{doc.fileName}</span>
                        {doc.fileSize && (
                          <span className="text-[10px] text-slate-500">
                            ({(doc.fileSize / 1024).toFixed(1)} KB)
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {doc.summary || doc.content}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-slate-800/40">
                    {doc.tags && doc.tags.length > 0 ? (
                      doc.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-0.5"
                        >
                          <span className="text-cyan-400/70">#</span>
                          <span>{t}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500 italic flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-slate-600" /> No tags assigned
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleQuickAutoTag(doc)}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 flex items-center gap-1 transition-all cursor-pointer ml-auto"
                      title="Analyze document content in real-time and auto-assign recommended tags"
                    >
                      {autoTaggedId === doc.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300">Tags Applied!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                          <span>Suggest Tags</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer bar with meta & actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                  <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                    <span>{doc.content.length.toLocaleString()} chars</span>
                    <span>•</span>
                    <span>~{Math.round(doc.content.length / 4)} tokens</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyContent(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Copy content"
                    >
                      {copiedId === doc.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="View full content"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingDoc({ ...doc })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                      title="Edit document"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${doc.title}" from Knowledge Base?`)) {
                          onDeleteDocument(doc.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear All Option if docs exist */}
      {documents.length > 0 && (
        <div className="flex justify-end pt-2">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete all documents from your Knowledge Base?')) {
                onClearAllDocuments();
              }
            }}
            className="px-3 py-1.5 rounded-xl text-xs text-red-400 hover:bg-red-950/30 border border-red-500/20 hover:border-red-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Entire Knowledge Base</span>
          </button>
        </div>
      )}

      {/* MODAL 1: ADD KNOWLEDGE SOURCE */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#0d121f] border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add Knowledge Source</h3>
                  <p className="text-xs text-slate-400">
                    Teach MR TECH AI new documentation, technical articles, or custom data.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Type Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'text', label: 'Paste Text / MD', icon: FileText },
                { id: 'file', label: 'Upload File', icon: UploadCloud },
                { id: 'url', label: 'Fetch from URL', icon: Globe },
                { id: 'structured', label: 'Structured JSON', icon: Code2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = addMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setAddMode(tab.id as any);
                      setUrlFetchError(null);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300 shadow-sm'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitNew} className="flex flex-col gap-4 mt-1">
              {/* Special Mode 1: URL Fetcher */}
              {addMode === 'url' && (
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Source Web URL</span>
                    <span className="text-[10px] text-cyan-400 font-mono">Auto-extracts article & tech docs</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      placeholder="https://example.com/docs/quantum-architecture"
                      className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={handleFetchUrl}
                      disabled={isFetchingUrl || !formUrl}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {isFetchingUrl ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Fetching...</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3.5 h-3.5" />
                          <span>Fetch Content</span>
                        </>
                      )}
                    </button>
                  </div>
                  {urlFetchError && (
                    <div className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{urlFetchError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Special Mode 2: File Upload */}
              {addMode === 'file' && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
                    isDragOver
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                  onClick={() => document.getElementById(fileInputId)?.click()}
                >
                  <input
                    id={fileInputId}
                    type="file"
                    accept=".txt,.md,.json,.csv,.js,.ts,.py,.html,.log"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <UploadCloud className="w-8 h-8 text-cyan-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {fileUploadName ? fileUploadName : 'Click to select or drag & drop a file'}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Supports .txt, .md, .json, .csv, and code documents
                    </span>
                  </div>
                  {fileUploadSize && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300">
                      {(fileUploadSize / 1024).toFixed(1)} KB extracted
                    </span>
                  )}
                </div>
              )}

              {/* Title & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Next-Gen 2nm Transistor Architectures"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content / Markdown / JSON Editor */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {addMode === 'structured' ? 'JSON / Structured Spec Content *' : 'Knowledge Content (Markdown / Text) *'}
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    {formContent.length.toLocaleString()} characters (~{Math.round(formContent.length / 4)} tokens)
                  </span>
                </div>
                <textarea
                  required
                  rows={8}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder={
                    addMode === 'structured'
                      ? '{\n  "spec": "PCIe 6.0",\n  "bandwidth": "64 GT/s",\n  "encoding": "PAM4 with FEC",\n  "keyInnovations": [\n    "Flit Mode",\n    "Low Latency"\n  ]\n}'
                      : '# Overview\nPaste technical documentation, research papers, system specifications, or notes here...'
                  }
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100 resize-y"
                />
              </div>

              {/* Tags & Real-Time Content Analysis Suggestions */}
              <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Document Tags</span>
                    <span className="text-[10px] font-normal text-slate-500">
                      ({formTagsList.length} assigned)
                    </span>
                  </label>
                  {formTagsList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormTagsList([])}
                      className="text-[10px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      Clear all tags
                    </button>
                  )}
                </div>

                {/* Active Tags Chips */}
                {formTagsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {formTagsList.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 flex items-center gap-1.5 shadow-sm group"
                      >
                        <span className="text-cyan-400/80">#</span>
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-cyan-400/60 hover:text-red-400 transition-colors ml-0.5"
                          title="Remove tag"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Custom Tag Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          handleAddCustomTag();
                        }
                      }}
                      placeholder="Type custom tag and press Enter or comma..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-200"
                    />
                    <Hash className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    disabled={!customTagInput.trim()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Real-Time Content Analysis Suggestions */}
                <div className="pt-2 border-t border-slate-800/80 mt-0.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span className="text-[11px] font-semibold text-slate-200">
                        Real-Time Content Suggestions
                      </span>
                      {addModalSuggestions.length > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          {addModalSuggestions.length}
                        </span>
                      )}
                    </div>

                    {addModalSuggestions.length > 0 && (
                      <button
                        type="button"
                        onClick={handleAddAllSuggestions}
                        className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add All ({addModalSuggestions.length})</span>
                      </button>
                    )}
                  </div>

                  {addModalSuggestions.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {addModalSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddSuggestedTag(item.tag)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-200 transition-all flex items-center gap-1.5 group cursor-pointer"
                          title={`${item.reasonLabel} • ${item.score}% confidence`}
                        >
                          <Plus className="w-3 h-3 text-cyan-400 group-hover:scale-125 transition-transform" />
                          <span>#{item.tag}</span>
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-cyan-300">
                            {item.score}%
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic py-0.5">
                      {formTitle.trim() || formContent.trim()
                        ? 'All detected concepts are already tagged.'
                        : 'Type in title or content to analyze text and generate real-time tag suggestions.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formTitle.trim() || !formContent.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  Save to Knowledge Base
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW FULL DOCUMENT */}
      {viewingDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setViewingDoc(null)}
        >
          <div
            className="w-full max-w-3xl bg-[#0d121f] border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                    {viewingDoc.type}
                  </span>
                  {viewingDoc.category && (
                    <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {viewingDoc.category}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      viewingDoc.enabled
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {viewingDoc.enabled ? 'Included in AI Context' : 'Muted'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5">{viewingDoc.title}</h3>
                {viewingDoc.sourceUrl && (
                  <a
                    href={viewingDoc.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{viewingDoc.sourceUrl}</span>
                  </a>
                )}
                {viewingDoc.tags && viewingDoc.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-cyan-400" />
                      <span>Tags:</span>
                    </span>
                    {viewingDoc.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-cyan-300 border border-slate-800"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content View */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 overflow-x-auto max-h-[60vh] overflow-y-auto font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {viewingDoc.content}
            </div>

            {/* Meta & Actions */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs text-slate-400">
              <span className="font-mono">
                {viewingDoc.content.length.toLocaleString()} characters • ~{Math.round(viewingDoc.content.length / 4)} tokens
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyContent(viewingDoc)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  {copiedId === viewingDoc.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === viewingDoc.id ? 'Copied' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={() => {
                    const d = viewingDoc;
                    setViewingDoc(null);
                    setEditingDoc({ ...d });
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors"
                >
                  Edit Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT DOCUMENT */}
      {editingDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setEditingDoc(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#0d121f] border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Knowledge Document</h3>
                  <p className="text-xs text-slate-400">Update title, category, or context text.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingDoc(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateExisting} className="flex flex-col gap-4 mt-1">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={editingDoc.title}
                  onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={editingDoc.category}
                    onChange={(e) => setEditingDoc({ ...editingDoc, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Status in AI Prompt</label>
                  <button
                    type="button"
                    onClick={() => setEditingDoc({ ...editingDoc, enabled: !editingDoc.enabled })}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                      editingDoc.enabled
                        ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${editingDoc.enabled ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    <span>{editingDoc.enabled ? 'Enabled in AI Context' : 'Disabled / Muted'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Document Content</label>
                <textarea
                  required
                  rows={10}
                  value={editingDoc.content}
                  onChange={(e) => setEditingDoc({ ...editingDoc, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100 resize-y"
                />
              </div>

              {/* Tags & Real-Time Content Analysis Suggestions for Edit Modal */}
              <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Document Tags</span>
                    <span className="text-[10px] font-normal text-slate-500">
                      ({editingDoc.tags?.length || 0} assigned)
                    </span>
                  </label>
                  {editingDoc.tags && editingDoc.tags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setEditingDoc({ ...editingDoc, tags: [] })}
                      className="text-[10px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      Clear all tags
                    </button>
                  )}
                </div>

                {/* Active Tags Chips */}
                {editingDoc.tags && editingDoc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {editingDoc.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 flex items-center gap-1.5 shadow-sm group"
                      >
                        <span className="text-cyan-400/80">#</span>
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEditTag(tag)}
                          className="text-cyan-400/60 hover:text-red-400 transition-colors ml-0.5"
                          title="Remove tag"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Custom Tag Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={editTagInput}
                      onChange={(e) => setEditTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          handleAddEditCustomTag();
                        }
                      }}
                      placeholder="Type custom tag and press Enter or comma..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-200"
                    />
                    <Hash className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEditCustomTag}
                    disabled={!editTagInput.trim()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Real-Time Content Analysis Suggestions */}
                <div className="pt-2 border-t border-slate-800/80 mt-0.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span className="text-[11px] font-semibold text-slate-200">
                        Real-Time Content Suggestions
                      </span>
                      {editModalSuggestions.length > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          {editModalSuggestions.length}
                        </span>
                      )}
                    </div>

                    {editModalSuggestions.length > 0 && (
                      <button
                        type="button"
                        onClick={handleAddAllEditSuggestions}
                        className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add All ({editModalSuggestions.length})</span>
                      </button>
                    )}
                  </div>

                  {editModalSuggestions.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {editModalSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddEditSuggestedTag(item.tag)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-200 transition-all flex items-center gap-1.5 group cursor-pointer"
                          title={`${item.reasonLabel} • ${item.score}% confidence`}
                        >
                          <Plus className="w-3 h-3 text-cyan-400 group-hover:scale-125 transition-transform" />
                          <span>#{item.tag}</span>
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-cyan-300">
                            {item.score}%
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic py-0.5">
                      {editingDoc.title.trim() || editingDoc.content.trim()
                        ? 'All detected concepts are already tagged.'
                        : 'Type in title or content to analyze text and generate real-time tag suggestions.'}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
