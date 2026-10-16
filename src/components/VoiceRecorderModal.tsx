import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Check,
  X,
  Volume2,
  AlertCircle,
  Loader2,
  Send,
  Languages,
  ExternalLink,
  RefreshCw,
  Info,
  Upload,
} from 'lucide-react';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTranscript: (text: string, sendImmediately?: boolean) => void;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  onApplyTranscript,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioTotalDuration, setAudioTotalDuration] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<'auto' | 'ml' | 'en'>('auto');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [permissionDeniedType, setPermissionDeniedType] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Canvas visualizer refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Speech Recognition fallback live transcript while recording
  const liveRecognitionRef = useRef<any>(null);
  const liveTranscriptRef = useRef<string>('');

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    } else {
      checkMicPermission();
    }
  }, [isOpen]);

  const checkMicPermission = async () => {
    try {
      if (navigator.permissions && (navigator.permissions as any).query) {
        const status = await navigator.permissions.query({ name: 'microphone' as any });
        setPermissionState(status.state as any);
        if (status.state === 'denied') {
          setPermissionDeniedType(true);
          setPermissionError('Microphone permission has been blocked. Please enable it in browser site settings.');
        } else if (status.state === 'granted') {
          setPermissionDeniedType(false);
          setPermissionError(null);
        }
        status.onchange = () => {
          setPermissionState(status.state as any);
          if (status.state === 'granted') {
            setPermissionDeniedType(false);
            setPermissionError(null);
          } else if (status.state === 'denied') {
            setPermissionDeniedType(true);
            setPermissionError('Microphone permission has been blocked. Please enable it in browser site settings.');
          }
        };
      }
    } catch (e) {
      // Ignore permissions API failures (not all browsers support query for mic)
    }
  };

  const cleanup = () => {
    // Stop recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    // Stop live recognition
    if (liveRecognitionRef.current) {
      try {
        liveRecognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    // Stop streams
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // ignore
      }
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setIsRecording(false);
    setRecordingDuration(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setPlaybackTime(0);
    setTranscription('');
    setIsTranscribing(false);
    setTranscribeError(null);
    setPermissionError(null);
    setPermissionDeniedType(false);
  };

  // Start real-time audio recording with browser MediaRecorder API
  const startRecording = async () => {
    setPermissionError(null);
    setTranscribeError(null);
    setTranscription('');
    liveTranscriptRef.current = '';
    audioChunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionDeniedType(false);
      setPermissionError('Your current browser does not support audio recording (navigator.mediaDevices.getUserMedia is unavailable).');
      return;
    }

    try {
      let stream: MediaStream;
      try {
        // Try optimal audio constraints with noise cancellation
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (constraintErr: any) {
        // Fallback to basic audio stream if specific constraints fail
        console.warn('Advanced audio constraints failed, trying basic audio:', constraintErr);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      audioStreamRef.current = stream;

      // Setup audio analyzer for real-time waveform visualization
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          audioContextRef.current = audioCtx;
          analyserRef.current = analyser;
          drawWaveform();
        }
      } catch (e) {
        console.warn('AudioContext visualizer setup issue:', e);
      }

      // Determine supported mimeType
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/wav',
      ];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      const recorder = new MediaRecorder(stream, selectedMime ? { mimeType: selectedMime } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Auto transcribe when recording completes
        transcribeAudioBlob(blob, mime);
      };

      recorder.start(250); // Collect data chunks every 250ms
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Concurrently run Web Speech API live recognition to provide instant draft
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const liveRec = new SpeechRecognition();
          liveRec.continuous = true;
          liveRec.interimResults = true;
          liveRec.lang = targetLanguage === 'ml' ? 'ml-IN' : targetLanguage === 'en' ? 'en-US' : 'en-US';
          liveRec.onresult = (event: any) => {
            let combined = '';
            for (let i = 0; i < event.results.length; ++i) {
              combined += event.results[i][0].transcript + ' ';
            }
            if (combined.trim()) {
              liveTranscriptRef.current = combined.trim();
              setTranscription(combined.trim());
            }
          };
          liveRec.start();
          liveRecognitionRef.current = liveRec;
        } catch (e) {
          // ignore web speech fallback error
        }
      }
    } catch (err: any) {
      console.error('Error starting voice recording:', err);
      const isDenied =
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError' ||
        err.message?.toLowerCase().includes('permission denied') ||
        err.message?.toLowerCase().includes('not allowed');

      if (isDenied) {
        setPermissionDeniedType(true);
        setPermissionState('denied');
        setPermissionError(
          'Microphone permission was denied by your browser or system. Click the lock/tune icon next to the address bar or open the app in a new tab to grant microphone permission.'
        );
      } else {
        setPermissionDeniedType(false);
        setPermissionError(`Microphone access error: ${err.message || 'Could not access audio device'}`);
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (liveRecognitionRef.current) {
      try {
        liveRecognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping mediaRecorder:', e);
      }
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    setIsRecording(false);
  };

  // Handle direct audio file upload as an alternative to live mic recording
  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset current states
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setPermissionError(null);
    setTranscribeError(null);
    setTranscription('');

    const url = URL.createObjectURL(file);
    setAudioBlob(file);
    setAudioUrl(url);
    setIsRecording(false);

    // Trigger AI transcription on uploaded audio
    transcribeAudioBlob(file, file.type || 'audio/mp3');

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Draw real-time animated waveform canvas
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

        // Gradient glow
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, '#06b6d4');
        gradient.addColorStop(1, '#ec4899');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight - 4, Math.max(3, barWidth - 2), barHeight + 4, 3);
        ctx.fill();

        x += barWidth + 2;
      }
    };

    render();
  };

  // Transcribe recorded audio with server-side AI Engine
  const transcribeAudioBlob = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setTranscribeError(null);

    try {
      // Convert audio blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        try {
          const res = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioData: base64Data,
              mimeType: mimeType || blob.type || 'audio/webm',
              language: targetLanguage,
            }),
          });

          if (!res.ok) {
            throw new Error(`Server returned ${res.status}`);
          }

          const data = await res.json();
          if (data.transcription && data.transcription.trim()) {
            setTranscription(data.transcription.trim());
          } else if (!transcription && liveTranscriptRef.current) {
            // Keep the live Web Speech transcript if server returned empty
            setTranscription(liveTranscriptRef.current);
          }
        } catch (err: any) {
          console.warn('Backend audio transcription failed, relying on live Web Speech API:', err);
          // If server failed, preserve live recognition result
          if (!transcription && liveTranscriptRef.current) {
            setTranscription(liveTranscriptRef.current);
          } else if (!transcription) {
            setTranscribeError('AI transcription service was unavailable. You can type or re-record.');
          }
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch (err: any) {
      console.error('Blob reading error:', err);
      setIsTranscribing(false);
      setTranscribeError(err.message || 'Failed to process audio');
    }
  };

  // Audio preview playback toggle
  const togglePlayAudio = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.warn('Audio play error:', e));
    }
  };

  const formatSeconds = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div
      id="voice-recorder-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0d131f] border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/30">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Voice Input & Transcription
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  MediaRecorder API
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Record your voice in real-time, inspect transcription, and insert to chat
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4">
          {/* Permission error banner */}
          {permissionError && (
            <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/60 text-red-200 text-xs flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-red-100 flex items-center justify-between">
                    <span>Microphone Permission Required</span>
                    <span className="text-[10px] font-mono text-red-300 px-2 py-0.5 rounded bg-red-900/60">
                      Denied
                    </span>
                  </p>
                  <p className="text-[11px] text-red-200 mt-1 leading-relaxed">
                    {permissionError}
                  </p>
                </div>
              </div>

              <div className="bg-red-950/90 rounded-lg p-2.5 border border-red-500/30 text-[11px] text-red-200 space-y-1">
                <p className="font-semibold text-red-100">How to fix in your browser:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-red-200/90">
                  <li>Click the <strong>Site Settings</strong> or <strong>Tune/Padlock</strong> icon on the left side of the address bar.</li>
                  <li>Find <strong>Microphone</strong> and switch it from <em>Block</em> to <strong>Allow</strong>.</li>
                  <li>If running inside an embedded iframe preview, click <strong>"Open in New Tab"</strong> below to grant microphone access directly.</li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPermissionError(null);
                    startRecording();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Try Again</span>
                </button>

                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open in New Tab</span>
                </a>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Upload an audio file directly instead of recording from microphone"
                >
                  <Upload className="w-3 h-3 text-cyan-400" />
                  <span>Upload Audio File</span>
                </button>
              </div>
            </div>
          )}

          {/* Target Language Preference */}
          <div className="flex items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Languages className="w-3.5 h-3.5 text-cyan-400" />
              <span>Speech Language:</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setTargetLanguage('auto')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  targetLanguage === 'auto'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Auto Detect
              </button>
              <button
                type="button"
                onClick={() => setTargetLanguage('ml')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  targetLanguage === 'ml'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                മലയാളം (ML)
              </button>
              <button
                type="button"
                onClick={() => setTargetLanguage('en')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  targetLanguage === 'en'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                English (EN)
              </button>
            </div>
          </div>

          {/* Recording & Waveform Zone */}
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900/90 border border-slate-800/90 p-5 flex flex-col items-center justify-center gap-4 text-center">
            {/* Live Waveform Canvas */}
            <div className="w-full h-16 relative flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={380}
                height={64}
                className={`w-full h-full ${isRecording ? 'opacity-100' : 'opacity-20'} transition-opacity`}
              />
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xs text-slate-500 font-mono">
                    {audioBlob ? 'Audio captured • Ready for review' : 'Click microphone below to begin'}
                  </span>
                </div>
              )}
            </div>

            {/* Timer Counter */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isRecording ? 'bg-red-500 animate-ping' : audioBlob ? 'bg-emerald-400' : 'bg-slate-600'
                }`}
              />
              <span className="font-mono text-lg font-bold text-white tracking-widest">
                {isRecording ? formatSeconds(recordingDuration) : formatSeconds(audioTotalDuration || recordingDuration)}
              </span>
            </div>

            {/* Big Mic / Stop Button */}
            <div className="flex items-center gap-4">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-transform active:scale-95 cursor-pointer group"
                  title="Start Recording with MediaRecorder API"
                >
                  <Mic className="w-7 h-7 group-hover:scale-110 transition-transform" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.7)] animate-pulse transition-transform active:scale-95 cursor-pointer"
                  title="Stop recording"
                >
                  <Square className="w-6 h-6 fill-white" />
                </button>
              )}

              {/* Audio Playback preview if recorded */}
              {audioUrl && !isRecording && (
                <button
                  type="button"
                  onClick={togglePlayAudio}
                  className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                  title={isPlaying ? 'Pause playback' : 'Play recorded audio'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-cyan-400" /> : <Play className="w-5 h-5 fill-cyan-400 ml-0.5" />}
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400">
              {isRecording
                ? 'Recording live audio with MediaRecorder API... Speak clearly into your mic.'
                : audioBlob
                ? 'Recording complete. Edit or inspect transcription below before sending.'
                : 'Press the microphone button to start recording.'}
            </p>

            {/* Audio File Upload Alternative */}
            {!isRecording && (
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-700/60 transition-colors cursor-pointer"
                  title="Upload an audio file (MP3, WAV, M4A, WEBM, OGG) to transcribe"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Upload Audio File</span>
                </button>
              </div>
            )}

            {/* Hidden audio element for playback */}
            {audioUrl && (
              <audio
                ref={audioPlayerRef}
                src={audioUrl}
                onLoadedMetadata={(e) => setAudioTotalDuration((e.target as any).duration || 0)}
                onTimeUpdate={(e) => setPlaybackTime((e.target as any).currentTime || 0)}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            )}
          </div>

          {/* Transcription Zone */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Transcribed Message:</span>
                {isTranscribing && (
                  <span className="flex items-center gap-1 text-[11px] text-cyan-300 font-normal lowercase">
                    <Loader2 className="w-3 h-3 animate-spin" /> transcribing...
                  </span>
                )}
              </label>

              {audioBlob && !isRecording && !isTranscribing && (
                <button
                  type="button"
                  onClick={() => transcribeAudioBlob(audioBlob, audioBlob.type)}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Re-transcribe</span>
                </button>
              )}
            </div>

            <textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder={
                isRecording
                  ? 'Transcribing speech in real-time...'
                  : isTranscribing
                  ? 'Processing audio with AI Engine...'
                  : 'Transcription will appear here. You can also edit it before sending.'
              }
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 resize-none"
            />

            {transcribeError && (
              <p className="text-[11px] text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {transcribeError}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={cleanup}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear / Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!transcription.trim()}
              onClick={() => {
                onApplyTranscript(transcription.trim(), false);
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Insert into Input</span>
            </button>

            <button
              type="button"
              disabled={!transcription.trim()}
              onClick={() => {
                onApplyTranscript(transcription.trim(), true);
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
