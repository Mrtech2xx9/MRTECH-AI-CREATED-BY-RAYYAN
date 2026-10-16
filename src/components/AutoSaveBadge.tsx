import React, { useState, useEffect } from 'react';
import { Save, Check, RefreshCw, HardDrive } from 'lucide-react';

interface AutoSaveBadgeProps {
  lastSaved: Date | null;
  isSaving: boolean;
  onSaveNow?: () => void;
  className?: string;
  compact?: boolean;
}

export const AutoSaveBadge: React.FC<AutoSaveBadgeProps> = ({
  lastSaved,
  isSaving,
  onSaveNow,
  className = '',
  compact = false,
}) => {
  const [secondsAgo, setSecondsAgo] = useState<number | null>(null);

  useEffect(() => {
    if (!lastSaved) return;

    const updateTime = () => {
      const diff = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
      setSecondsAgo(diff);
    };

    updateTime();
    const interval = setInterval(updateTime, 5000);
    return () => clearInterval(interval);
  }, [lastSaved]);

  const formatRelativeTime = () => {
    if (secondsAgo === null) return 'Ready';
    if (secondsAgo < 5) return 'Just now';
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    const mins = Math.floor(secondsAgo / 60);
    return `${mins}m ago`;
  };

  return (
    <button
      type="button"
      onClick={onSaveNow}
      title={`Auto-saves chat state and projects to local storage every 30s. Click to save manually now.${
        lastSaved ? ` Last saved at ${lastSaved.toLocaleTimeString()}` : ''
      }`}
      className={`group inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono transition-all border cursor-pointer ${
        isSaving
          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)] animate-pulse'
          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
      } ${className}`}
    >
      {isSaving ? (
        <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
      ) : (
        <Check className="w-3 h-3 text-emerald-400 group-hover:text-cyan-400 transition-colors" />
      )}

      {!compact && (
        <span className="flex items-center gap-1">
          <span className="text-slate-500">Auto-save:</span>
          <span className={isSaving ? 'text-cyan-300 font-bold' : 'text-slate-300 font-medium'}>
            {isSaving ? 'Saving...' : formatRelativeTime()}
          </span>
        </span>
      )}

      {compact && (
        <span className={isSaving ? 'text-cyan-300' : 'text-slate-400'}>
          {isSaving ? 'Saving' : formatRelativeTime()}
        </span>
      )}
    </button>
  );
};
