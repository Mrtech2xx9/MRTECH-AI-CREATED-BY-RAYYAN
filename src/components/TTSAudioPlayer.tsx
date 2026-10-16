import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Square } from 'lucide-react';

interface TTSAudioPlayerProps {
  text: string;
  messageId?: string;
  className?: string;
  variant?: 'icon' | 'pill';
}

const GLOBAL_TTS_EVENT = 'mrtech_tts_playback_event';

export const TTSAudioPlayer: React.FC<TTSAudioPlayerProps> = ({
  text,
  messageId,
  className = '',
  variant = 'icon',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('mrtech_preferred_speech_rate');
      return saved ? parseFloat(saved) || 1.0 : 1.0;
    } catch {
      return 1.0;
    }
  });
  const [isSupported, setIsSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // References for sequencing chunks and keepalive
  const chunksRef = useRef<string[]>([]);
  const chunkIndexRef = useRef<number>(0);
  const keepAliveTimerRef = useRef<any>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize SpeechSynthesis and voice listeners
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      try {
        const available = window.speechSynthesis.getVoices();
        if (available && available.length > 0) {
          setVoices(available);
        }
      } catch {
        // ignore
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      stopSpeech();
    };
  }, []);

  // Global event listener so only one message plays audio at a time
  useEffect(() => {
    const handleGlobalTTS = (e: any) => {
      const activeId = e?.detail?.id;
      const myIdentifier = messageId || text;
      if (activeId && activeId !== myIdentifier) {
        // Another message started playing; silently reset our local state
        stopKeepAlive();
        activeUtteranceRef.current = null;
        chunkIndexRef.current = 0;
        setIsPlaying(false);
        setIsPaused(false);
      }
    };

    window.addEventListener(GLOBAL_TTS_EVENT, handleGlobalTTS);
    return () => {
      window.removeEventListener(GLOBAL_TTS_EVENT, handleGlobalTTS);
    };
  }, [messageId, text]);

  // Clean raw markdown text for smooth reading
  const cleanSpeechText = (rawText: string): string => {
    if (!rawText) return '';
    return rawText
      // Remove code blocks entirely (they shouldn't be read out verbatim)
      .replace(/```[\s\S]*?```/g, ' [Code snippet omitted] ')
      // Remove inline code ticks
      .replace(/`([^`]+)`/g, '$1')
      // Remove images and markdown links
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      // Remove markdown headings, bold, italic, strikethrough, blockquotes
      .replace(/#{1,6}\s+/g, '')
      .replace(/[*_~]{1,3}/g, '')
      .replace(/^>\s+/gm, '')
      .replace(/^[-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      // Remove table separator lines
      .replace(/\|[-:\s|]+\|/g, '')
      .replace(/\|/g, ', ')
      // Collapse repeated whitespace
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Split text into manageable chunks so the Web Speech API never hits Chrome's 15s silence bug
  const splitIntoChunks = (cleaned: string): string[] => {
    const regex = /([^.!?\n]+[.!?\n]+)/g;
    const matches = cleaned.match(regex);
    if (!matches || matches.length === 0) {
      return [cleaned];
    }

    const chunks: string[] = [];
    let current = '';

    for (const piece of matches) {
      if ((current + piece).length > 180 && current.length > 0) {
        chunks.push(current.trim());
        current = piece;
      } else {
        current += ' ' + piece;
      }
    }
    if (current.trim()) {
      chunks.push(current.trim());
    }

    return chunks.length > 0 ? chunks : [cleaned];
  };

  const startKeepAlive = () => {
    stopKeepAlive();
    // Chrome bug workaround: speechSynthesis stops firing events if silent for ~15s
    keepAliveTimerRef.current = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  };

  const stopKeepAlive = () => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
  };

  const stopSpeech = () => {
    stopKeepAlive();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    activeUtteranceRef.current = null;
    chunkIndexRef.current = 0;
    setIsPlaying(false);
    setIsPaused(false);
  };

  const playChunk = (index: number) => {
    if (index >= chunksRef.current.length) {
      stopSpeech();
      return;
    }

    chunkIndexRef.current = index;
    const chunkText = chunksRef.current[index];
    if (!chunkText || !chunkText.trim()) {
      playChunk(index + 1);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(chunkText);
      activeUtteranceRef.current = utterance;

      // Check user preferred pitch and rate from Settings
      try {
        const savedRate = localStorage.getItem('mrtech_preferred_speech_rate');
        if (savedRate) {
          utterance.rate = parseFloat(savedRate) || currentSpeed;
        } else {
          utterance.rate = currentSpeed;
        }
      } catch {
        utterance.rate = currentSpeed;
      }

      try {
        const savedPitch = localStorage.getItem('mrtech_preferred_speech_pitch');
        if (savedPitch) {
          utterance.pitch = parseFloat(savedPitch) || 1.0;
        }
      } catch {}

      // Language detection
      let lang = 'en-US';
      if (/[\u0D00-\u0D7F]/.test(chunkText)) {
        lang = 'ml-IN'; // Malayalam
      } else if (/[\u0900-\u097F]/.test(chunkText)) {
        lang = 'hi-IN'; // Hindi
      } else if (/[\u0600-\u06FF]/.test(chunkText)) {
        lang = 'ar-SA'; // Arabic
      } else if (/[\u0B80-\u0BFF]/.test(chunkText)) {
        lang = 'ta-IN'; // Tamil
      }
      utterance.lang = lang;

      // Voice selection: Check for user's preferred voice from SettingsView first
      const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
      if (currentVoices && currentVoices.length > 0) {
        let preferredVoice: SpeechSynthesisVoice | undefined;
        try {
          const prefUri = localStorage.getItem('mrtech_preferred_voice_uri');
          const prefName = localStorage.getItem('mrtech_preferred_voice_name');
          if (prefUri || prefName) {
            preferredVoice = currentVoices.find(
              (v) => (prefUri && v.voiceURI === prefUri) || (prefName && v.name === prefName)
            );
          }
        } catch {}

        // If the user picked a voice, respect it (unless text is specifically Malayalam and chosen voice cannot pronounce Indic scripts)
        if (preferredVoice && (lang !== 'ml-IN' || preferredVoice.lang.toLowerCase().includes('ml'))) {
          utterance.voice = preferredVoice;
        } else if (lang === 'ml-IN') {
          const mlVoice = currentVoices.find(
            (v) => v.lang.toLowerCase().includes('ml') || v.name.toLowerCase().includes('malayalam')
          );
          if (mlVoice) utterance.voice = mlVoice;
          else if (preferredVoice) utterance.voice = preferredVoice;
        } else if (preferredVoice) {
          utterance.voice = preferredVoice;
        } else if (lang === 'hi-IN') {
          const hiVoice = currentVoices.find((v) => v.lang.toLowerCase().startsWith('hi'));
          if (hiVoice) utterance.voice = hiVoice;
        } else {
          // English natural voices
          const enVoice =
            currentVoices.find(
              (v) =>
                v.lang.startsWith('en') &&
                (v.name.includes('Google') ||
                  v.name.includes('Natural') ||
                  v.name.includes('Samantha') ||
                  v.name.includes('Daniel') ||
                  v.name.includes('Karen'))
            ) || currentVoices.find((v) => v.lang.startsWith('en'));
          if (enVoice) utterance.voice = enVoice;
        }
      }

      utterance.onend = () => {
        playChunk(index + 1);
      };

      utterance.onerror = (e) => {
        if (e.error === 'canceled' || e.error === 'interrupted') return;
        console.warn('SpeechSynthesis chunk error:', e);
        playChunk(index + 1);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Error invoking SpeechSynthesis.speak:', err);
      stopSpeech();
    }
  };

  const handleTogglePlay = () => {
    if (!isSupported) return;

    if (isPlaying && !isPaused) {
      // Pause current speech
      try {
        window.speechSynthesis.pause();
      } catch {}
      setIsPaused(true);
      return;
    }

    if (isPlaying && isPaused) {
      // Resume current speech
      try {
        window.speechSynthesis.resume();
      } catch {}
      setIsPaused(false);
      return;
    }

    // Broadcast that this message is now speaking so any other message stops
    window.dispatchEvent(
      new CustomEvent(GLOBAL_TTS_EVENT, { detail: { id: messageId || text } })
    );

    // Start fresh playback
    try {
      window.speechSynthesis.cancel();
    } catch {}

    const cleaned = cleanSpeechText(text);
    if (!cleaned) return;

    const chunks = splitIntoChunks(cleaned);
    chunksRef.current = chunks;
    chunkIndexRef.current = 0;

    setIsPlaying(true);
    setIsPaused(false);
    startKeepAlive();
    playChunk(0);
  };

  const handleCycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 0.85];
    const currentIndex = speeds.indexOf(currentSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setCurrentSpeed(nextSpeed);
    try {
      localStorage.setItem('mrtech_preferred_speech_rate', nextSpeed.toString());
    } catch {}

    if (isPlaying && !isPaused) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      playChunk(chunkIndexRef.current);
    }
  };

  if (!isSupported) return null;

  // Variant 1: Compact Small Speaker Icon Button (for message headers / actions strip)
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center gap-0.5 ${className}`}>
        <button
          type="button"
          onClick={handleTogglePlay}
          title={
            isPlaying
              ? isPaused
                ? 'Resume reading aloud'
                : 'Pause reading aloud'
              : 'Read aloud'
          }
          aria-label={isPlaying ? (isPaused ? 'Resume reading aloud' : 'Pause reading aloud') : 'Read aloud'}
          className={`p-1 rounded transition-colors cursor-pointer flex items-center justify-center ${
            isPlaying
              ? isPaused
                ? 'text-amber-400 bg-amber-500/15'
                : 'text-cyan-400 bg-cyan-500/20 shadow-sm shadow-cyan-500/25 ring-1 ring-cyan-500/40'
              : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
          }`}
        >
          {isPlaying ? (
            isPaused ? (
              <Play className="w-3.5 h-3.5 fill-amber-400" />
            ) : (
              <div className="flex items-center gap-0.5 px-0.5 h-3.5">
                <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="w-0.5 h-3.5 bg-cyan-300 rounded-full animate-pulse delay-75" />
                <span className="w-0.5 h-2.5 bg-cyan-400 rounded-full animate-pulse delay-150" />
              </div>
            )
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Small stop button when playing */}
        {isPlaying && (
          <button
            type="button"
            onClick={stopSpeech}
            title="Stop reading aloud"
            aria-label="Stop reading aloud"
            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Square className="w-3 h-3 fill-current" />
          </button>
        )}
      </div>
    );
  }

  // Variant 2: Full Pill Button (for message footer bar next to Copy button)
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={handleTogglePlay}
        title={
          isPlaying
            ? isPaused
              ? 'Resume reading aloud'
              : 'Pause reading aloud'
            : 'Read aloud (Web Speech API)'
        }
        aria-label="Read aloud"
        className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer select-none ${
          isPlaying
            ? isPaused
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
              : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/20'
            : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white'
        }`}
      >
        {isPlaying ? (
          isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-[10px] text-amber-300 font-semibold">Paused</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-2.5 bg-cyan-400 rounded-full animate-pulse" />
                <span className="w-0.5 h-3.5 bg-cyan-300 rounded-full animate-pulse delay-75" />
                <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-pulse delay-150" />
              </div>
              <Pause className="w-3 h-3 text-cyan-300" />
              <span className="text-[10px] text-cyan-300 font-semibold">Reading...</span>
            </>
          )
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 text-[10px]">Read Aloud</span>
          </>
        )}
      </button>

      {/* Stop & Speed controls when playing */}
      {isPlaying && (
        <div className="flex items-center gap-1 animate-fade-in">
          <button
            type="button"
            onClick={stopSpeech}
            title="Stop reading aloud"
            aria-label="Stop reading aloud"
            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Square className="w-3 h-3 fill-current" />
          </button>

          <button
            type="button"
            onClick={handleCycleSpeed}
            title={`Speed: ${currentSpeed}x (Click to change)`}
            className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-cyan-300 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 cursor-pointer"
          >
            {currentSpeed}x
          </button>
        </div>
      )}
    </div>
  );
};

export const ReadAloudButton = TTSAudioPlayer;
