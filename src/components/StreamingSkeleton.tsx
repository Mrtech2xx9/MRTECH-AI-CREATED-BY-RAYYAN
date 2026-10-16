import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, Zap, Activity, Bot } from 'lucide-react';

interface StreamingSkeletonProps {
  isInitial?: boolean; // When content is empty and AI is beginning to synthesize
  wordCount?: number;
  onStop?: () => void;
}

const REASONING_STAGES = [
  {
    malayalam: 'ചോദ്യം വിശകലനം ചെയ്യുന്നു...',
    english: 'Analyzing your question...',
    icon: Sparkles,
  },
  {
    malayalam: 'അറിവ് അതിവേഗം കണ്ടെത്തുന്നു...',
    english: 'Retrieving instant verified knowledge...',
    icon: Zap,
  },
  {
    malayalam: 'കൃത്യമായ മറുപടി രൂപപ്പെടുത്തുന്നു...',
    english: 'Synthesizing accurate response...',
    icon: Cpu,
  },
  {
    malayalam: 'വേഗത്തിൽ അയക്കുന്നു...',
    english: 'Streaming instant answer...',
    icon: Activity,
  },
];

export const StreamingSkeleton: React.FC<StreamingSkeletonProps> = ({
  isInitial = true,
  wordCount = 0,
  onStop,
}) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    if (!isInitial) return;

    // Fast, fluid transitions through reasoning stages
    const stepInterval = setInterval(() => {
      setStageIndex((prev) => (prev < REASONING_STAGES.length - 1 ? prev + 1 : prev));
    }, 850);

    // Fast-advancing progress bar for high perceived velocity
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const jump = Math.floor(Math.random() * 12) + 6;
        return Math.min(prev + jump, 92);
      });
    }, 220);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isInitial]);

  if (!isInitial) {
    // Active streaming progress banner attached to the bottom of the streamed response
    return (
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs text-slate-400 select-none">
        <div className="flex items-center gap-2">
          {/* Animated pulsing wave bars */}
          <div className="flex items-end gap-0.5 h-3.5 px-1">
            <span className="w-1 bg-cyan-400 rounded-full animate-[bounce_0.6s_infinite_ease-in-out]" style={{ height: '70%', animationDelay: '0ms' }} />
            <span className="w-1 bg-blue-500 rounded-full animate-[bounce_0.6s_infinite_ease-in-out]" style={{ height: '100%', animationDelay: '150ms' }} />
            <span className="w-1 bg-indigo-400 rounded-full animate-[bounce_0.6s_infinite_ease-in-out]" style={{ height: '85%', animationDelay: '300ms' }} />
            <span className="w-1 bg-cyan-300 rounded-full animate-[bounce_0.6s_infinite_ease-in-out]" style={{ height: '60%', animationDelay: '450ms' }} />
          </div>
          <span className="text-[11px] font-mono text-cyan-400 font-medium">
            MR TECH AI is generating response
          </span>
          {wordCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              ~{wordCount} words
            </span>
          )}
        </div>

        {onStop && (
          <button
            onClick={onStop}
            className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 transition-colors cursor-pointer"
          >
            Stop
          </button>
        )}
      </div>
    );
  }

  const currentStage = REASONING_STAGES[stageIndex];
  const StageIcon = currentStage.icon;

  return (
    <div className="w-full py-1 space-y-4 animate-fade-in">
      {/* Engaging Futuristic Holographic AI Processing Card */}
      <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-slate-950/90 via-[#0E1526]/90 to-slate-950/90 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.1)] backdrop-blur-md">
        {/* Ambient background glow orb */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-600/15 rounded-full blur-2xl pointer-events-none animate-pulse delay-300" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          {/* AI Core with pulsating rings & animated icon */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              {/* Outer rotating ring */}
              <div className="w-10 h-10 rounded-xl border border-cyan-400/40 border-dashed animate-spin flex items-center justify-center" style={{ animationDuration: '6s' }} />
              {/* Center glowing badge */}
              <div className="absolute inset-1 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                <StageIcon className="w-4 h-4 animate-pulse text-cyan-300" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">MR TECH AI 1</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-sm">
                  ⚡ ULTRA-FAST
                </span>
              </div>
              <div className="mt-0.5 space-y-0.5">
                <p className="text-xs font-medium text-cyan-200 transition-all duration-300">
                  {currentStage.malayalam}
                </p>
                <p className="text-[10px] font-mono text-slate-400 transition-all duration-300">
                  {currentStage.english}
                </p>
              </div>
            </div>
          </div>

          {/* Neural Equalizer + Progress Percent */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Live Audio/Neural Frequency Equalizer Bars */}
            <div className="flex items-end gap-1 h-5 px-2 py-0.5 rounded-lg bg-slate-900/80 border border-slate-800 shadow-inner">
              <span className="w-1 bg-cyan-400 rounded-full animate-[pulse_0.4s_infinite]" style={{ height: '40%' }} />
              <span className="w-1 bg-blue-400 rounded-full animate-[pulse_0.6s_infinite_100ms]" style={{ height: '90%' }} />
              <span className="w-1 bg-indigo-400 rounded-full animate-[pulse_0.5s_infinite_200ms]" style={{ height: '65%' }} />
              <span className="w-1 bg-cyan-300 rounded-full animate-[pulse_0.4s_infinite_300ms]" style={{ height: '100%' }} />
              <span className="w-1 bg-blue-300 rounded-full animate-[pulse_0.7s_infinite_150ms]" style={{ height: '50%' }} />
            </div>

            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30 shadow-sm">
              {progress}%
            </span>
          </div>
        </div>

        {/* Shimmering High-Velocity Progress Track */}
        <div className="w-full h-1.5 rounded-full bg-slate-900 border border-slate-800/80 overflow-hidden relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-200 shadow-[0_0_12px_rgba(6,182,212,0.8)] relative"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer shine */}
            <div className="absolute inset-0 bg-white/30 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Rhythmic Content Skeletons with Subtle Wave Glow */}
      <div className="space-y-2.5 pt-1 px-1">
        {/* Paragraph 1: Headline + Body */}
        <div className="space-y-2">
          <div className="h-4 w-2/5 rounded-lg bg-gradient-to-r from-slate-800 via-slate-700/60 to-slate-800 animate-pulse" />
          <div className="h-3.5 w-full rounded-md bg-gradient-to-r from-slate-800 via-slate-700/50 to-slate-800 animate-pulse" />
          <div className="h-3.5 w-[92%] rounded-md bg-gradient-to-r from-slate-800 via-slate-700/50 to-slate-800 animate-pulse" />
          <div className="h-3.5 w-[78%] rounded-md bg-gradient-to-r from-slate-800 via-slate-700/50 to-slate-800 animate-pulse" />
        </div>

        {/* Synthesized Code / Card Skeleton */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2 my-2 shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="h-3 w-24 rounded bg-slate-800 animate-pulse" />
            <div className="h-3 w-14 rounded bg-slate-800 animate-pulse" />
          </div>
          <div className="h-3 w-[88%] rounded bg-slate-800/90 animate-pulse" />
          <div className="h-3 w-[72%] rounded bg-slate-800/90 animate-pulse" />
          <div className="h-3 w-[54%] rounded bg-slate-800/90 animate-pulse" />
        </div>

        {/* Paragraph 2: Concluding sentences */}
        <div className="space-y-2">
          <div className="h-3.5 w-[85%] rounded-md bg-gradient-to-r from-slate-800 via-slate-700/50 to-slate-800 animate-pulse" />
          <div className="h-3.5 w-[60%] rounded-md bg-gradient-to-r from-slate-800 via-slate-700/50 to-slate-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

