import React, { useState } from 'react';
import {
  Wrench,
  Code2,
  ScanEye,
  FileText,
  Languages,
  Mail,
  Share2,
  CheckCheck,
  GraduationCap,
  Lightbulb,
  SearchCode,
  BarChart3,
  Sparkles,
  Send,
  Upload,
  Copy,
  Check,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { ChatMessageRenderer } from './ChatMessageRenderer';

const TOOLS = [
  {
    id: 'coding',
    name: 'Coding Assistant',
    desc: 'Generate, refactor, or convert code across 16+ programming languages.',
    icon: Code2,
    badge: '16+ Languages',
    category: 'Engineering',
  },
  {
    id: 'debugger',
    name: 'Code Debugger',
    desc: 'Detect bugs, logic flaws, and cyber vulnerabilities with corrected patches.',
    icon: SearchCode,
    badge: 'Security & Fixes',
    category: 'Engineering',
  },
  {
    id: 'explainer',
    name: 'Code Explainer',
    desc: 'In-depth architectural, algorithmic, and Big-O breakdown.',
    icon: FileCode,
    badge: 'Algorithms',
    category: 'Engineering',
  },
  {
    id: 'image_analyzer',
    name: 'Image Analyzer & OCR',
    desc: 'Extract visible text, parse diagrams, and analyze screenshots with AI 1.',
    icon: ScanEye,
    badge: 'Multimodal OCR',
    category: 'Analysis',
  },
  {
    id: 'document_ai',
    name: 'Document AI',
    desc: 'Summarize, interrogate, and extract structured metrics from PDFs & files.',
    icon: FileText,
    badge: 'PDF / Text',
    category: 'Analysis',
  },
  {
    id: 'translator',
    name: 'Translator',
    desc: 'Translate text to Malayalam, English, and more with contextual fidelity.',
    icon: Languages,
    badge: 'English & Malayalam',
    category: 'Writing',
  },
  {
    id: 'email',
    name: 'Email Writer',
    desc: 'Draft executive, client, or technical emails with custom tone.',
    icon: Mail,
    badge: 'Executive',
    category: 'Writing',
  },
  {
    id: 'social',
    name: 'Social Media Writer',
    desc: 'High-impact LinkedIn, Twitter/X, and tech threads with hooks.',
    icon: Share2,
    badge: 'Engagement',
    category: 'Writing',
  },
  {
    id: 'grammar',
    name: 'Grammar & Clarity',
    desc: 'Fix grammar, improve prose rhythm, and refine vocabulary.',
    icon: CheckCheck,
    badge: 'Clarity',
    category: 'Writing',
  },
  {
    id: 'study',
    name: 'Study Assistant',
    desc: 'Generate concise revision notes, analogies, and practice quizzes.',
    icon: GraduationCap,
    badge: 'Learning',
    category: 'Productivity',
  },
  {
    id: 'brainstorm',
    name: 'Brainstorming',
    desc: '10 innovative ideas and execution paths for any challenge.',
    icon: Lightbulb,
    badge: 'Ideation',
    category: 'Productivity',
  },
  {
    id: 'data',
    name: 'Data Analysis',
    desc: 'Find statistical insights, patterns, and anomalies in raw datasets.',
    icon: BarChart3,
    badge: 'Analytics',
    category: 'Analysis',
  },
  {
    id: 'prompt_generator',
    name: 'Prompt Generator',
    desc: 'Synthesize optimal, high-yield system and image generation prompts.',
    icon: Sparkles,
    badge: 'Optimization',
    category: 'Productivity',
  },
];

const CODING_LANGUAGES = [
  'TypeScript',
  'JavaScript',
  'Python',
  'Java',
  'C',
  'C++',
  'C#',
  'HTML & CSS',
  'PHP',
  'SQL',
  'Kotlin',
  'Swift',
  'Dart',
  'Go',
  'Rust',
];

interface ToolsHubProps {
  onOpenEmbedWidgetModal?: () => void;
}

export const ToolsHub: React.FC<ToolsHubProps> = ({ onOpenEmbedWidgetModal }) => {
  const [selectedToolId, setSelectedToolId] = useState<string>('coding');
  const [input, setInput] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('TypeScript');
  const [targetLanguage, setTargetLanguage] = useState<string>('Malayalam');
  const [tone, setTone] = useState<string>('Professional');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; data: string; mimeType: string } | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const currentTool = TOOLS.find((t) => t.id === selectedToolId) || TOOLS[0];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedFile({
        name: file.name,
        data: reader.result as string,
        mimeType: file.type || 'text/plain',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setOutput(null);

    try {
      if (selectedToolId === 'image_analyzer') {
        if (!uploadedImage) {
          throw new Error('Please upload an image to analyze.');
        }
        const res = await fetch('/api/image/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: uploadedImage,
            prompt: input.trim() || 'Analyze this image in detail and extract all visible text and key insights.',
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Image analysis failed (${res.status})`);
        setOutput(data.analysis);
      } else if (selectedToolId === 'document_ai') {
        if (!uploadedFile) {
          throw new Error('Please upload a document (PDF, TXT, CSV) to analyze.');
        }
        const res = await fetch('/api/document/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: uploadedFile.data,
            fileName: uploadedFile.name,
            mimeType: uploadedFile.mimeType,
            instruction: input.trim() || 'Summarize this document and extract key takeaways.',
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Document processing failed (${res.status})`);
        setOutput(data.result);
      } else {
        if (!input.trim()) {
          throw new Error('Please provide input details.');
        }
        const res = await fetch('/api/tools/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolId: selectedToolId,
            input: input.trim(),
            options: {
              language: selectedLanguage,
              targetLanguage,
              tone,
            },
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Tool execution failed (${res.status})`);
        setOutput(data.output);
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('failed to fetch')) {
        setErrorMessage('Unable to reach the server. Please check your connection and try again.');
      } else {
        setErrorMessage(msg || 'Operation failed. Check AI Engine status.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-full flex flex-col p-4 sm:p-6 lg:p-8 bg-[#090d16] text-slate-100">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                AI Tools Hub
              </h1>
              <span className="text-xs font-mono text-cyan-400">
                18 Specialized Capabilities Powered by AI 1 Engine
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Widget Integration Banner */}
      {onOpenEmbedWidgetModal && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-cyan-950/50 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Website Floating Widget</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">New</span>
              </div>
              <p className="text-xs text-slate-400">
                മറ്റൊരു വെബ്സൈറ്റിൽ MR TECH AI ഒരു ഫ്ലോട്ടിംഗ് ചാറ്റ് ബട്ടൺ ആയി ഉൾപ്പെടുത്താനുള്ള കോഡ്
              </p>
            </div>
          </div>
          <button
            onClick={onOpenEmbedWidgetModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/25 shrink-0 self-start sm:self-auto"
          >
            <span>Get Embed Code</span>
            <Code2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Tool Select Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-2 max-h-[700px] overflow-y-auto pr-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Select Tool</span>
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const active = selectedToolId === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setSelectedToolId(tool.id);
                  setOutput(null);
                  setErrorMessage(null);
                }}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  active
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200 shadow-md shadow-cyan-950/40'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    active ? 'bg-cyan-500/30 text-cyan-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs sm:text-sm font-bold truncate text-white">{tool.name}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 shrink-0">
                      {tool.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{tool.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tool Interaction Workspace */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <currentTool.icon className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">{currentTool.name}</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">AI 1 Neural Engine</span>
            </div>

            <form onSubmit={handleExecute} className="flex flex-col gap-4">
              {/* Specialized Options based on tool */}
              {selectedToolId === 'coding' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Target Language</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CODING_LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          selectedLanguage === lang
                            ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedToolId === 'translator' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Target Language</label>
                  <div className="flex gap-2">
                    {['Malayalam (മലയാളം)', 'English', 'Arabic', 'Hindi', 'Spanish', 'French'].map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setTargetLanguage(l)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          targetLanguage === l
                            ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedToolId === 'email' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Tone</label>
                  <div className="flex gap-2">
                    {['Professional', 'Executive', 'Friendly', 'Formal', 'Urgent'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTone(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          tone === t
                            ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Multimodal Upload for Image Analyzer */}
              {selectedToolId === 'image_analyzer' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Upload Image / Screenshot</label>
                  {uploadedImage ? (
                    <div className="relative w-full max-h-48 rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-950 flex items-center justify-center p-2">
                      <img src={uploadedImage} alt="Uploaded" className="max-h-44 object-contain rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setUploadedImage(null)}
                        className="absolute top-2 right-2 px-2 py-1 rounded bg-black/70 text-red-400 text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 hover:border-cyan-500/50 cursor-pointer text-xs text-slate-400 transition-colors">
                      <Upload className="w-6 h-6 text-cyan-400 mb-2" />
                      <span className="font-semibold text-slate-200">Click or drag an image here</span>
                      <span className="text-[11px] text-slate-500 mt-1">Supports PNG, JPG, WEBP, screenshots</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              )}

              {/* Multimodal Upload for Document AI */}
              {selectedToolId === 'document_ai' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Upload Document</label>
                  {uploadedFile ? (
                    <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <span className="text-xs font-bold text-white">{uploadedFile.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 hover:border-cyan-500/50 cursor-pointer text-xs text-slate-400 transition-colors">
                      <Upload className="w-6 h-6 text-cyan-400 mb-2" />
                      <span className="font-semibold text-slate-200">Upload PDF, TXT, CSV, or DOCX</span>
                      <span className="text-[11px] text-slate-500 mt-1">AI 1 will parse and synthesize data</span>
                      <input
                        type="file"
                        accept=".pdf,.txt,.csv,.docx,text/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Text Input area */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {selectedToolId === 'image_analyzer'
                    ? 'Questions or instructions for image (Optional)'
                    : selectedToolId === 'document_ai'
                    ? 'Specific instructions or questions for document'
                    : 'Input Details / Code / Prompt'}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={4}
                  placeholder="Enter details here..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100 placeholder:text-slate-600 resize-none font-sans"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-slate-950 hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Processing with AI 1...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Run {currentTool.name}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Display */}
          {output && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Result</span>
                </span>
                <button
                  onClick={handleCopyOutput}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                <ChatMessageRenderer content={output} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
