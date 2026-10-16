import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, X, Check, ExternalLink } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onInterimChange?: (interim: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onInterimChange,
  onListeningChange,
  className = '',
  size = 'md',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        onListeningChange?.(true);
        setErrorMessage(null);
        isManuallyStoppedRef.current = false;
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const part = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += part;
          } else {
            interimText += part;
          }
        }

        if (interimText) {
          onInterimChange?.(interimText);
        }

        if (finalText) {
          onTranscript(finalText);
          onInterimChange?.('');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Microphone access blocked. Please allow mic permissions in browser.');
          setIsListening(false);
          onListeningChange?.(false);
        } else if (event.error === 'no-speech') {
          // Gracefully ignore silent pauses
        } else if (event.error !== 'aborted') {
          setErrorMessage(`Voice error: ${event.error}`);
          setIsListening(false);
          onListeningChange?.(false);
        }
      };

      recognition.onend = () => {
        // If recognition stopped on its own (e.g. timeout) but user didn't hit stop, restart
        if (!isManuallyStoppedRef.current && isListening) {
          try {
            recognition.start();
            return;
          } catch (e) {
            // Fall through to stop
          }
        }
        setIsListening(false);
        onListeningChange?.(false);
        onInterimChange?.('');
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition init error:', err);
      setIsSupported(false);
    }

    return () => {
      isManuallyStoppedRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [onTranscript, onInterimChange, onListeningChange]);

  const toggleListen = () => {
    if (!isSupported) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      isManuallyStoppedRef.current = true;
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        // Ignore
      }
      setIsListening(false);
      onListeningChange?.(false);
      onInterimChange?.('');
    } else {
      setErrorMessage(null);
      isManuallyStoppedRef.current = false;
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Error starting speech recognition:', e);
      }
    }
  };

  const btnPadding = size === 'sm' ? 'p-1.5' : 'p-2';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={toggleListen}
        title={
          !isSupported
            ? 'Web Speech API not supported in this browser'
            : isListening
            ? 'Stop voice dictation (Listening...)'
            : 'Dictate message with microphone (Web Speech API)'
        }
        className={`${btnPadding} rounded-xl transition-all flex items-center justify-center relative cursor-pointer ${
          isListening
            ? 'bg-red-500/20 text-red-400 border border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse'
            : !isSupported
            ? 'text-slate-600 hover:text-slate-500 cursor-not-allowed'
            : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
        }`}
      >
        {isListening ? (
          <div className="flex items-center gap-1">
            <MicOff className={`${iconSize} text-red-400`} />
            {/* Real-time wave animation bars */}
            <div className="flex items-end gap-0.5 h-3 px-0.5">
              <span className="w-0.5 bg-red-400 rounded-full animate-[bounce_1s_infinite_100ms] h-2" />
              <span className="w-0.5 bg-red-400 rounded-full animate-[bounce_1s_infinite_300ms] h-3" />
              <span className="w-0.5 bg-red-400 rounded-full animate-[bounce_1s_infinite_200ms] h-2.5" />
            </div>
          </div>
        ) : (
          <Mic className={iconSize} />
        )}
      </button>

      {/* Floating error notification badge if mic error occurs */}
      {errorMessage && (
        <div className="absolute bottom-full mb-2 left-0 z-50 p-2.5 bg-slate-900 border border-red-500/50 text-red-200 text-xs rounded-xl shadow-2xl flex flex-col gap-1.5 min-w-[260px] max-w-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="flex-1 text-[11px] leading-tight font-medium">{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
            <span className="text-slate-400">Allow mic or open direct:</span>
            <a
              href={window.location.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 hover:underline"
            >
              <ExternalLink className="w-2.5 h-2.5" />
              <span>New Tab</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

import { TTSAudioPlayer } from './TTSAudioPlayer';

export { TTSAudioPlayer };
export const SpeechButton = TTSAudioPlayer;
