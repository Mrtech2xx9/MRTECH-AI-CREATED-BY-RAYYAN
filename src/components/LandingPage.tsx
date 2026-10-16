import React from 'react';
import { motion } from 'motion/react';
import { getAssetUrl } from '../utils/assetUrl';
import { MrTechLogo } from './MrTechLogo';
import {
  MessageSquare,
  Sparkles,
  FileText,
  Search,
  Code2,
  Wrench,
  ScanEye,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Zap,
} from 'lucide-react';
import { AppSection, UserProfile } from '../types';
import { GoogleAuth } from './GoogleAuth';

interface LandingPageProps {
  onStartChat: () => void;
  onNavigate: (section: AppSection) => void;
  user?: UserProfile | null;
  onLogin?: (u: UserProfile) => void;
  onLogout?: () => void;
}

const CAPABILITIES = [
  {
    icon: MessageSquare,
    title: 'AI Chat',
    desc: 'Lightning-fast AI 1 streaming chat with multimodal attachments and web search grounding.',
    section: 'chat' as AppSection,
    badge: 'AI 1 Fast',
    color: 'bg-blue-600/10 border-blue-500/20 text-blue-400',
  },
  {
    icon: Sparkles,
    title: 'Image Studio',
    desc: 'Native AI visual generation & variations with 12 aesthetic styles and aspect ratios.',
    section: 'image-studio' as AppSection,
    badge: 'AI Studio',
    color: 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400',
  },
  {
    icon: ScanEye,
    title: 'Image Analyzer',
    desc: 'Deep OCR, diagram explanation, screenshot debugging, and context-aware visual intelligence.',
    section: 'tools' as AppSection,
    badge: 'Multimodal OCR',
    color: 'bg-slate-800 border-slate-700 text-blue-300',
  },
  {
    icon: FileText,
    title: 'Document AI',
    desc: 'PDF, CSV, and code document analysis, executive summaries, data extraction, and comparative Q&A.',
    section: 'documents' as AppSection,
    badge: 'Multi-Format',
    color: 'bg-blue-600/10 border-blue-500/20 text-blue-400',
  },
  {
    icon: Search,
    title: 'Web Search',
    desc: 'Grounded Google Search integration providing real verified sources and citations.',
    section: 'search' as AppSection,
    badge: 'Google Grounded',
    color: 'bg-sky-600/10 border-sky-500/20 text-sky-400',
  },
  {
    icon: Code2,
    title: 'Coding Assistant',
    desc: 'Expert code generation, debugging, refactoring, and security audits across 16+ languages.',
    section: 'tools' as AppSection,
    badge: '16+ Languages',
    color: 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400',
  },
  {
    icon: Wrench,
    title: 'AI Tools Hub',
    desc: 'Dedicated translators, email writers, data analyzers, and research tools in one unified workspace.',
    section: 'tools' as AppSection,
    badge: '18 Dedicated Tools',
    color: 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStartChat, onNavigate, user, onLogin, onLogout }) => {
  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-screen flex flex-col bg-[#0B0F1A] text-slate-100">
      {/* Top Bar / Header */}
      <header className="w-full border-b border-slate-800 bg-[#0B0F1A]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <MrTechLogo size="sm" showSubtitle={true} showCreator={false} />
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>AI 1 Neural Engine</span>
          </div>

          {onLogin && onLogout && (
            <GoogleAuth
              user={user || null}
              onLogin={onLogin}
              onLogout={onLogout}
              compact={false}
            />
          )}

          <button
            onClick={onStartChat}
            className="px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>Start Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 mb-6 shadow-sm"
        >
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>OFFICIAL WORKSPACE • CREATED BY RAYYAN</span>
        </motion.div>

        {/* Big Brand Logo & Titles */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-3 max-w-3xl"
        >
          <div className="relative mb-2">
            <div className="absolute inset-0 rounded-3xl bg-blue-500/10 blur-xl" />
            <img
              src={getAssetUrl('/logo.png')}
              alt="MR TECH AI"
              className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border border-slate-800 shadow-2xl object-cover"
            />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase">
            MR TECH{' '}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              AI
            </span>
          </h1>

          <p className="text-xs sm:text-sm font-mono tracking-widest text-blue-400 font-semibold uppercase">
            CYBER • TECH • SECURITY
          </p>

          <p className="text-sm sm:text-base text-slate-400 font-medium">
            Created by <strong className="text-white font-bold">RAYYAN</strong>
          </p>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl leading-relaxed mt-2">
            An elite, unified AI workspace powered by high-speed AI 1 technology. Seamlessly converse,
            generate high-fidelity images, analyze documents, debug complex code, and search real-time grounded knowledge.
          </p>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-6 w-full sm:w-auto">
            <button
              onClick={onStartChat}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base sm:text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2.5"
            >
              <Zap className="w-5 h-5 fill-white" />
              <span>START CHAT</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavigate('image-studio')}
              className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm sm:text-base font-semibold bg-[#131926] border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Explore Image Studio</span>
            </button>
          </div>
        </motion.div>

        {/* Major Capabilities Grid */}
        <div className="w-full mt-14 sm:mt-20">
          <div className="flex flex-col items-center gap-1.5 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <span>Major Capabilities</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              One account. One unified workspace. Exclusively AI 1 Engine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 text-left">
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  onClick={() => onNavigate(cap.section)}
                  className="group p-5 rounded-2xl bg-[#131926] border border-slate-800 hover:border-blue-500/40 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:bg-slate-850 hover:shadow-lg shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl border ${cap.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                        {cap.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1.5">{cap.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
                    <span>Open {cap.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust & Identity Guarantee Footer Box */}
        <div className="w-full max-w-2xl mt-12 p-5 rounded-2xl bg-[#131926] border border-slate-800 text-xs sm:text-sm text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">MR TECH AI Guarantee</p>
              <p className="text-[11px] text-slate-400">Created by RAYYAN • Powered by AI 1 Engine</p>
            </div>
          </div>
          <button
            onClick={onStartChat}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600/15 text-blue-300 border border-blue-500/30 hover:bg-blue-600/25 transition-colors"
          >
            Launch Chat Workspace
          </button>
        </div>
      </main>
    </div>
  );
};
