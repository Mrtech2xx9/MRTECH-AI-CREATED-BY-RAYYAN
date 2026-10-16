import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Square,
  Sparkles,
  Paperclip,
  Search,
  RotateCcw,
  Copy,
  Check,
  CheckCheck,
  Edit2,
  Trash2,
  Star,
  Globe,
  X,
  FileText,
  Pin,
  Image as ImageIcon,
  AlertCircle,
  History,
  Zap,
  Bookmark,
  Smile,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  ArrowDown,
  Mic,
  MicOff,
  Database,
  Menu,
  Plus,
  AudioLines,
  ArrowUp,
  PenLine,
  ChevronDown,
} from 'lucide-react';
import {
  ChatMessage,
  Conversation,
  Attachment,
  CustomInstructions,
  Project,
  DeviceMode,
  GeminiModelId,
  ChatToneMode,
  CHAT_TONE_MODES,
  KnowledgeDocument,
} from '../types';
import { ChatMessageRenderer } from './ChatMessageRenderer';
import { ReadAloudButton } from './TTSAudioPlayer';
import { VoiceRecorderModal } from './VoiceRecorderModal';
import { MrTechLogo } from './MrTechLogo';
import { ChatHistoryDrawer } from './ChatHistoryDrawer';
import { ModelSelector } from './ModelSelector';
import { ToneSelector } from './ToneSelector';
import {
  playTypingClick,
  playStreamTick,
  playSendSound,
  playReactionSound,
  isTypingSoundEnabled,
  setTypingSoundEnabled,
} from '../utils/soundEffects';

interface ChatViewProps {
  conversation: Conversation;
  onUpdateConversation: (conv: Conversation) => void;
  onNewChat: () => void;
  customInstructions: CustomInstructions;
  activeProject?: Project;
  onOpenReviewModal: () => void;
  onOpenPromptLibrary: () => void;
  deviceMode: DeviceMode;
  conversations?: Conversation[];
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onNavigateToHistory?: () => void;
  onNavigateToSettings?: () => void;
  onOpenMobileMenu?: () => void;
  onNavigate?: (section: any) => void;
  projects?: Project[];
  knowledgeDocuments?: KnowledgeDocument[];
}

const AVAILABLE_REACTIONS = [
  { emoji: '💡', label: 'Insight' },
  { emoji: '🔖', label: 'Bookmark' },
  { emoji: '👍', label: 'Helpful' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '🚀', label: 'Brilliant' },
  { emoji: '👏', label: 'Applause' },
];

// Helper to format error strings cleanly for users
function cleanDisplayError(msg: string): string {
  if (!msg) return 'Failed to connect with AI 1 Engine. Please try again.';
  let cleaned = msg;
  try {
    const match = msg.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed?.error?.message) {
        try {
          const nested = JSON.parse(parsed.error.message);
          cleaned = nested?.error?.message || parsed.error.message;
        } catch {
          cleaned = parsed.error.message;
        }
      } else if (parsed?.error && typeof parsed.error === 'string') {
        cleaned = parsed.error;
      }
    }
  } catch {
    // ignore
  }

  const lower = cleaned.toLowerCase();
  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('load failed') || lower.includes('network request failed')) {
    return 'Unable to reach the server. The connection was temporarily interrupted. Please try again.';
  }
  if (lower.includes('429') || lower.includes('quota') || lower.includes('rate limit') || lower.includes('resource_exhausted')) {
    return 'AI usage limit reached. Automatically switching to high-speed AI 1 engine. Please wait a moment.';
  }
  if (lower.includes('503') || lower.includes('high demand') || lower.includes('unavailable') || lower.includes('overloaded')) {
    return 'AI 1 is currently experiencing high demand. Please try again in a moment.';
  }
  if (lower.includes('api_key') || lower.includes('api key') || lower.includes('unauthenticated')) {
    return 'AI Engine service configuration issue. Please try again.';
  }
  return cleaned
    .replace(/\bGoogle\s*Gemini\b/gi, 'MR TECH AI')
    .replace(/\bGemini\b/gi, 'AI 1')
    .replace(/ഗൂഗിൾ\s*ജെമിനി/g, 'MR TECH AI')
    .replace(/ജെമിനി/g, 'AI 1')
    .replace(/^Error:\s*/i, '')
    .trim() || 'AI 1 is currently processing. Please try again.';
}

export function cleanOutputText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\bGoogle\s*Gemini\b/gi, 'MR TECH AI')
    .replace(/\bGemini\s*(?:Advanced|Pro|Flash|Ultra|Nano|Live)?\b/gi, 'MR TECH AI')
    .replace(/\bGemini\b/gi, 'MR TECH AI')
    .replace(/ഗൂഗിൾ\s*ജെമിനി/g, 'MR TECH AI')
    .replace(/ജെമിനി/g, 'MR TECH AI');
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  onUpdateConversation,
  onNewChat,
  customInstructions,
  activeProject,
  onOpenReviewModal,
  onOpenPromptLibrary,
  deviceMode,
  conversations = [],
  onSelectConversation,
  onDeleteConversation,
  onTogglePin,
  onNavigateToHistory,
  onNavigateToSettings,
  onOpenMobileMenu,
  onNavigate,
  projects = [],
  knowledgeDocuments = [],
}) => {
  const rawModel = conversation.selectedModel;
  const currentModel: GeminiModelId =
    !rawModel || rawModel === 'gemini-3.1-flash-lite'
      ? 'gemini-3.8-flash'
      : rawModel;
  const [showProModal, setShowProModal] = useState<boolean>(false);

  const handleSelectModel = (modelId: GeminiModelId) => {
    onUpdateConversation({
      ...conversation,
      selectedModel: modelId,
      updatedAt: new Date().toISOString(),
    });
  };

  const [inputText, setInputText] = useState(() => {
    return localStorage.getItem(`mrtech_draft_${conversation.id}`) || '';
  });
  const [useSearch, setUseSearch] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'en-US' | 'ml-IN'>(() => {
    return customInstructions.language === 'Malayalam' ? 'ml-IN' : 'en-US';
  });
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState<boolean>(true);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [fastMode, setFastMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('mrtech_fast_mode');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });
  const [toneMode, setToneMode] = useState<ChatToneMode>(() => {
    return conversation.toneMode || 'balanced';
  });

  // Sync tone mode when conversation changes
  useEffect(() => {
    if (conversation.toneMode) {
      setToneMode(conversation.toneMode);
    }
  }, [conversation.id, conversation.toneMode]);

  const handleSelectToneMode = (newMode: ChatToneMode) => {
    setToneMode(newMode);
    onUpdateConversation({
      ...conversation,
      toneMode: newMode,
      updatedAt: new Date().toISOString(),
    });
  };

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => isTypingSoundEnabled());
  const [filterBookmarksOnly, setFilterBookmarksOnly] = useState<boolean>(false);
  const [activeReactionPickerMsgId, setActiveReactionPickerMsgId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [connectionDroppedDuringGen, setConnectionDroppedDuringGen] = useState<boolean>(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState<string>('');
  const [generationStage, setGenerationStage] = useState<'sending' | 'thinking' | 'searching' | 'checking_sources' | 'generating' | null>(null);
  const [activeRoutePath, setActiveRoutePath] = useState<'FAST_PATH' | 'LIVE_PATH' | 'DEEP_PATH' | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseInputTextRef = useRef<string>('');
  const currentInputTextRef = useRef<string>(inputText);
  const isListeningRef = useRef<boolean>(false);
  const manuallyStoppedRef = useRef<boolean>(false);

  useEffect(() => {
    currentInputTextRef.current = inputText;
  }, [inputText]);

  useEffect(() => {
    isListeningRef.current = isListeningVoice;
  }, [isListeningVoice]);

  // Check SpeechRecognition support on mount
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSpeechRecognitionSupported(Boolean(SpeechRec));
  }, []);

  // Dynamically auto-resize textarea as speech transcript or typing updates
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputText]);

  const stopVoiceDictation = () => {
    manuallyStoppedRef.current = true;
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListeningVoice(false);
    baseInputTextRef.current = '';
    textareaRef.current?.focus();
  };

  const startVoiceDictation = (targetLang?: 'en-US' | 'ml-IN') => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceError('SpeechRecognition API is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    setVoiceError(null);
    manuallyStoppedRef.current = false;
    baseInputTextRef.current = currentInputTextRef.current;
    const activeLang = targetLang || voiceLang;

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = activeLang;

      recognition.onstart = () => {
        setIsListeningVoice(true);
        isListeningRef.current = true;
        try {
          if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            navigator.vibrate(15);
          }
        } catch {}
      };

      recognition.onresult = (event: any) => {
        let sessionFinal = '';
        let sessionInterim = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          const transcript = res[0]?.transcript || '';
          if (res.isFinal) {
            sessionFinal += transcript + ' ';
          } else {
            sessionInterim += transcript;
          }
        }

        const base = (baseInputTextRef.current || '').trim();
        const spoken = (sessionFinal + sessionInterim).trim();

        let updated = '';
        if (base && spoken) {
          updated = `${base} ${spoken}`;
        } else if (spoken) {
          updated = spoken;
        } else {
          updated = base;
        }

        setInputText(updated);
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceError('Microphone permission was denied. Please allow microphone access in your browser address bar.');
          setIsListeningVoice(false);
          isListeningRef.current = false;
        } else if (event.error === 'no-speech') {
          // Gracefully ignore silent pauses
        } else if (event.error === 'network') {
          setVoiceError('Network error occurred during speech recognition. Please check your internet connection.');
          setIsListeningVoice(false);
          isListeningRef.current = false;
        } else if (event.error !== 'aborted') {
          setVoiceError(`Voice error: ${event.error}`);
          setIsListeningVoice(false);
          isListeningRef.current = false;
        }
      };

      recognition.onend = () => {
        if (!manuallyStoppedRef.current && isListeningRef.current) {
          try {
            baseInputTextRef.current = currentInputTextRef.current;
            recognition.start();
            return;
          } catch (e) {
            // fall through
          }
        }
        setIsListeningVoice(false);
        isListeningRef.current = false;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start SpeechRecognition:', err);
      setVoiceError(err?.message || 'Could not start speech recognition.');
      setIsListeningVoice(false);
      isListeningRef.current = false;
    }
  };

  const restartVoiceDictation = (newLang: 'en-US' | 'ml-IN') => {
    manuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    baseInputTextRef.current = currentInputTextRef.current;
    setTimeout(() => {
      startVoiceDictation(newLang);
    }, 60);
  };

  const toggleVoiceDictation = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceError('SpeechRecognition API is not supported in this browser. Please use Google Chrome, Edge, or Safari.');
      return;
    }

    if (isListeningVoice) {
      stopVoiceDictation();
    } else {
      startVoiceDictation();
    }
  };

  // Clean up recognition on unmount or conversation change
  useEffect(() => {
    return () => {
      manuallyStoppedRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  useEffect(() => {
    if (isListeningVoice) {
      stopVoiceDictation();
    }
  }, [conversation.id]);

  // Global Ctrl+M hotkey to quickly toggle voice-to-text dictation
  useEffect(() => {
    const handleVoiceShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleVoiceDictation();
      }
    };
    window.addEventListener('keydown', handleVoiceShortcut);
    return () => window.removeEventListener('keydown', handleVoiceShortcut);
  }, [isListeningVoice, voiceLang]);

  // Network connection status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionDroppedDuringGen(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (isGenerating) {
        setConnectionDroppedDuringGen(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isGenerating]);

  // Close reaction picker on click outside
  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveReactionPickerMsgId(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const toggleFastMode = () => {
    setFastMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('mrtech_fast_mode', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleTypingSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setTypingSoundEnabled(next);
    if (next) {
      playTypingClick();
    }
  };

  // Toggle emoji reaction on a message
  const handleToggleReaction = (messageId: string, emoji: string) => {
    const isBookmarkEmoji = emoji === '🔖' || emoji === '💡';
    playReactionSound(isBookmarkEmoji);

    const updatedMessages = conversation.messages.map((msg) => {
      if (msg.id !== messageId) return msg;

      const currentReactions = { ...(msg.reactions || {}) };
      const currentUserReactions = [...(msg.userReactions || [])];
      const hasReacted = currentUserReactions.includes(emoji);

      let newReactions: Record<string, number>;
      let newUserReactions: string[];

      if (hasReacted) {
        newUserReactions = currentUserReactions.filter((e) => e !== emoji);
        const count = (currentReactions[emoji] || 1) - 1;
        if (count <= 0) {
          delete currentReactions[emoji];
        } else {
          currentReactions[emoji] = count;
        }
        newReactions = currentReactions;
      } else {
        newUserReactions = [...currentUserReactions, emoji];
        currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
        newReactions = currentReactions;
      }

      const hasBookmarkVote =
        (newReactions['🔖'] || 0) > 0 ||
        (newReactions['💡'] || 0) > 0 ||
        newUserReactions.includes('🔖') ||
        newUserReactions.includes('💡');

      return {
        ...msg,
        reactions: newReactions,
        userReactions: newUserReactions,
        isBookmarked: hasBookmarkVote || Boolean(msg.isBookmarked && !isBookmarkEmoji),
      };
    });

    onUpdateConversation({
      ...conversation,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    });
  };

  // Direct toggle for bookmarking insights
  const handleToggleBookmark = (messageId: string) => {
    const targetMsg = conversation.messages.find((m) => m.id === messageId);
    const currentlyBookmarked = Boolean(targetMsg?.isBookmarked);
    playReactionSound(!currentlyBookmarked);

    const updatedMessages = conversation.messages.map((msg) => {
      if (msg.id !== messageId) return msg;

      const currentReactions = { ...(msg.reactions || {}) };
      const currentUserReactions = [...(msg.userReactions || [])];
      const nowBookmarked = !currentlyBookmarked;

      if (nowBookmarked) {
        if (!currentUserReactions.includes('🔖')) {
          currentUserReactions.push('🔖');
        }
        currentReactions['🔖'] = (currentReactions['🔖'] || 0) + 1;
      } else {
        const filteredUser = currentUserReactions.filter((e) => e !== '🔖');
        const count = (currentReactions['🔖'] || 1) - 1;
        if (count <= 0) {
          delete currentReactions['🔖'];
        } else {
          currentReactions['🔖'] = count;
        }
        return {
          ...msg,
          reactions: currentReactions,
          userReactions: filteredUser,
          isBookmarked: false,
        };
      }

      return {
        ...msg,
        reactions: currentReactions,
        userReactions: currentUserReactions,
        isBookmarked: nowBookmarked,
      };
    });

    onUpdateConversation({
      ...conversation,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    });
  };

  // Restore input draft when active conversation switches
  useEffect(() => {
    const saved = localStorage.getItem(`mrtech_draft_${conversation.id}`) || '';
    setInputText(saved);
  }, [conversation.id]);

  // Auto-save draft input to localStorage to prevent data loss
  useEffect(() => {
    if (inputText.trim()) {
      localStorage.setItem(`mrtech_draft_${conversation.id}`, inputText);
    } else {
      localStorage.removeItem(`mrtech_draft_${conversation.id}`);
    }
  }, [inputText, conversation.id]);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [autoScrollPinned, setAutoScrollPinned] = useState(true);

  // Read receipt: track viewed assistant message IDs
  const [viewedMessageIds, setViewedMessageIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    conversation.messages.forEach((m) => {
      if (m.isRead || m.status === 'read') {
        initial.add(m.id);
      }
    });
    return initial;
  });

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setIsScrolledUp(false);
  };

  // Detect when user scrolls up away from bottom during response generation or reading
  const handleChatScroll = () => {
    const el = chatScrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // When distance from bottom exceeds 80px, user has manually scrolled up
    if (distanceFromBottom > 80) {
      setIsScrolledUp(true);
      setAutoScrollPinned(false);
    } else {
      setIsScrolledUp(false);
      setAutoScrollPinned(true);
    }
  };

  // Automatically scroll to the latest AI message when a new stream of text begins
  useEffect(() => {
    if (isGenerating || streamingMessageId) {
      setAutoScrollPinned(true);
      setIsScrolledUp(false);
      const timer = setTimeout(() => {
        if (streamingMessageId) {
          const el = chatScrollRef.current?.querySelector(`[data-chat-msg-id="${streamingMessageId}"]`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
          }
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [streamingMessageId, isGenerating]);

  // Keep following stream chunks if user hasn't scrolled up
  useEffect(() => {
    if (streamingText && autoScrollPinned && !isScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamingText, autoScrollPinned, isScrolledUp]);

  useEffect(() => {
    // Auto-scroll on normal message updates when pinned
    if (autoScrollPinned && !isScrolledUp) {
      scrollToBottom('smooth');
    }
  }, [conversation.messages, autoScrollPinned, isScrolledUp]);

  // Reset scroll state on switching conversations
  useEffect(() => {
    setIsScrolledUp(false);
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [conversation.id]);

  // Read-receipt intersection observer:
  // Detects when the user has viewed the assistant's previous message in ChatView
  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;

    const messageElements = container.querySelectorAll('[data-chat-msg-id]');
    if (messageElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const msgId = entry.target.getAttribute('data-chat-msg-id');
            if (msgId) {
              const targetMsg = conversation.messages.find((m) => m.id === msgId);
              if (targetMsg && !targetMsg.isStreaming) {
                // Subtle organic reading delay before tick turns to double-tick read receipt
                setTimeout(() => {
                  setViewedMessageIds((prev) => {
                    if (prev.has(msgId)) return prev;
                    const next = new Set(prev);
                    next.add(msgId);
                    return next;
                  });
                }, 350);
              }
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.35,
      }
    );

    messageElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [conversation.messages]);

  // Handle file uploads (Images, PDFs, Text)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAttachment: Attachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          data: reader.result as string,
          size: file.size,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 1800);
  };

  // Stop Generation (Instant Cancellation)
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setStreamingMessageId(null);
    setStreamingText('');
    setGenerationStage(null);

    // Finalize assistant message with whatever text was streamed so far
    if (conversation.messages.length > 0) {
      const lastMsg = conversation.messages[conversation.messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant' && lastMsg.isStreaming) {
        onUpdateConversation({
          ...conversation,
          messages: conversation.messages.map((m) =>
            m.id === lastMsg.id ? { ...m, isStreaming: false } : m
          ),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  };

  // Send Message with SSE streaming and automatic resilient retry
  const handleSend = async (
    customText?: string,
    customAttachments?: Attachment[],
    baseMessages?: ChatMessage[],
  ) => {
    const textToSend = customText !== undefined ? customText : inputText;
    const filesToSend = customAttachments !== undefined ? customAttachments : attachments;

    if (isListeningVoice) {
      stopVoiceDictation();
    }

    if (!textToSend.trim() && filesToSend.length === 0) return;
    if (isGenerating) return;

    // Filter out any previous error or empty messages so they don't pollute context
    const cleanHistory = (baseMessages ?? conversation.messages).filter(
      (m) => !m.error && ((m.content && m.content.trim().length > 0) || (m.attachments && m.attachments.length > 0))
    );

    playSendSound();

    const userMessageId = `msg_${Date.now()}`;
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
      attachments: filesToSend.length > 0 ? [...filesToSend] : undefined,
    };

    const assistantMessageId = `msg_${Date.now() + 1}`;
    const newAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
      fastMode: Boolean(fastMode),
      modelUsed: currentModel,
      toneMode: toneMode,
    };

    const updatedMessages = [...cleanHistory, newUserMessage, newAssistantMessage];
    const newTitle =
      cleanHistory.length === 0
        ? textToSend.trim().slice(0, 36) || 'New Conversation'
        : conversation.title;

    onUpdateConversation({
      ...conversation,
      title: newTitle,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    });

    setInputText('');
    localStorage.removeItem(`mrtech_draft_${conversation.id}`);
    setAttachments([]);
    setIsGenerating(true);
    setIsScrolledUp(false);
    setAutoScrollPinned(true);
    setStreamingMessageId(assistantMessageId);
    setStreamingText('');

    // Immediate UI feedback on submit
    const isSearchActive = Boolean(useSearch || toneMode === 'advance-tools');
    setActiveRoutePath(isSearchActive ? 'LIVE_PATH' : 'FAST_PATH');
    setGenerationStage(isSearchActive ? 'searching' : 'sending');

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    let streamedText = '';

    // Direct /image, /img, or natural language visual request handler (in Malayalam & English)
    const trimmedInput = textToSend.trim();
    let detectedImagePrompt: string | null = null;

    if (/^\/(image|img)\s+/i.test(trimmedInput)) {
      detectedImagePrompt = trimmedInput.replace(/^\/(image|img)\s+/i, '').trim();
    } else {
      // English trigger: "generate image of...", "draw a...", "picture of...", etc.
      const enMatch = trimmedInput.match(
        /^(?:please\s+)?(?:can\s+you\s+)?(?:generate|create|make|draw|paint)\s+(?:an?\s+)?(?:image|picture|photo|illustration)?\s*(?:of|for)?\s*(.+)$/i
      );
      if (enMatch && enMatch[1]) {
        const candidate = enMatch[1].trim();
        if (
          !/^(code|program|script|react|html|python|javascript|css|sql|function|text|essay|paragraph|article|summary|plan|table)\b/i.test(
            candidate
          )
        ) {
          detectedImagePrompt = candidate;
        }
      }

      // Malayalam triggers: "ചിത്രം വരയ്ക്കൂ ...", "... ന്റെ ചിത്രം തരൂ/വേണം/ഉണ്ടാക്കൂ", "... ഇമേജ് തരൂ", "... ഉപയോഗിച്ച് ഇമേജ് ക്രിയേറ്റീവ്", etc.
      if (!detectedImagePrompt) {
        const mlMatch1 = trimmedInput.match(
          /^(?:ദയവായി\s+)?(?:ചിത്രം|ഫോട്ടോ|ഇമേജ്)\s*(?:വരയ്ക്കൂ|ഉണ്ടാക്കൂ|കാണിക്കൂ|നൽകൂ|തരൂ|ചെയ്യൂ|ക്രിയേറ്റ്\s*ചെയ്യ shape|ക്രിയേറ്റ്|ക്രിയേറ്റീവ്)\s*(.+)$/i
        );
        if (mlMatch1 && mlMatch1[1]) {
          detectedImagePrompt = mlMatch1[1].trim();
        } else {
          // Pattern like: "nano banana ഉപയോഗിച്ച് ഇമേജ് ക്രിയേറ്റീവ്" or "പൂച്ചയുടെ ചിത്രം വരയ്ക്കൂ"
          const mlMatch2 = trimmedInput.match(
            /^(.+?)(?:\s+ഉപയോഗിച്ച്|\s+വെച്ച്|\s+കൊണ്ട്|ന്റെ|ുടെ)?\s*(?:ഒരു\s*)?(?:ചിത്രം|ഫോട്ടോ|ഇമേജ്)\s*(?:ക്രിയേറ്റീവ്|ക്രിയേറ്റ്(?:\s*ചെയ്യ shape|\s*ചെയ്യുക|\s*ചെയ്യീ|\s*ചെയ്യ\u0D42)?|വരയ്ക്കൂ|ഉണ്ടാക്കൂ|കാണിക്കൂ|നൽകൂ|തരൂ|വേണം|ചെയ്യൂ)?$/i
          );
          if (mlMatch2 && mlMatch2[1]) {
            const candidate = mlMatch2[1].trim();
            // Ensure candidate is not just conversational greeting
            if (candidate.length > 1 && !/^(ഹലോ|നമസ്കാരം|ഹായ്|hello|hi)$/i.test(candidate)) {
              detectedImagePrompt = `${candidate} creative detailed visual`;
            }
          }
        }
      }
    }

    if (detectedImagePrompt) {
      try {
        const res = await fetch('/api/image/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: detectedImagePrompt, aspectRatio: '1:1', style: 'Exact' }),
          signal: controller.signal,
        });
        const imgData = await res.json();
        if (imgData.imageUrl) {
          const isMl = /[^\x00-\x7F]/.test(textToSend);
          const responseText = isMl
            ? `നിങ്ങൾ ചോദിച്ച ഇമേജ് ഇതാ: **"${detectedImagePrompt}"**\n\n![${detectedImagePrompt}](${imgData.imageUrl})\n\nകൂടുതൽ വിവരങ്ങൾ വേണമെന്നുണ്ടോ?`
            : `Here is your generated image for: **"${detectedImagePrompt}"**\n\n![${detectedImagePrompt}](${imgData.imageUrl})\n\nDo you want more details?`;

          onUpdateConversation({
            ...conversation,
            title: newTitle,
            messages: [
              ...cleanHistory,
              newUserMessage,
              {
                ...newAssistantMessage,
                content: responseText,
                isStreaming: false,
              },
            ],
            updatedAt: new Date().toISOString(),
          });
          setIsGenerating(false);
          setStreamingMessageId(null);
          setStreamingText('');
          return;
        }
      } catch (imgErr: any) {
        console.warn('Direct chat image generation fallback:', imgErr);
      }
    }

    try {
      // Build messages payload for server from clean history
      const apiMessages = [...cleanHistory, newUserMessage].map((m) => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments,
      }));

      // System instruction blending MR TECH AI accurate direct answer guidelines, user settings, and project directives
      let blendedInstructions = `You are MR TECH AI.

Your primary goal is to answer exactly what the user asks, accurately, directly, and clearly.

CRITICAL IDENTITY RULES:
- If asked "What is your name?", answer: "My name is MR TECH AI."
- If asked "Who created you?", answer: "I was created by RAYYAN."
- If both: "My name is MR TECH AI, and I was created by RAYYAN."
- Never claim that RAYYAN created Google, OpenAI, Anthropic or other companies.
- If asked what model or AI engine you run on: State that you are MR TECH AI powered by the AI 1 high-speed neural engine.
- STRICT PRIVACY & BRANDING RULE: You MUST NEVER mention, write, acknowledge, or use the word "Gemini", "Google Gemini", "ജെമിനി", or "ഗൂഗിൾ ജെമിനി" anywhere in your response, thinking, or explanations. Even though advanced underlying models are utilized under the hood, never disclose, identify as, or name Gemini. Always identify exclusively as "MR TECH AI" powered by the "MR TECH AI Engine" (AI 1 / AI 2 / AI 3).
- REAL-TIME AWARENESS & CONTINUOUS UPDATES (റിയൽ ടൈം അറിവും എപ്പോഴും അപ്ഡേറ്റ് ആയിരിക്കലും): You are aware of real-time events, current world news, ongoing developments, and live occurrences. Stay updated at every moment.
- 2026 LIVE TEMPORAL ANCHOR (2026-ലെ തത്സമയ അറിവുകൾ): You are operating in 2026. For questions about current leaders, Chief Ministers, Prime Ministers, elections, or current news, ALWAYS anchor your answer in 2026 (e.g. "ഇന്ന് 2026 ഒക്ടോബർ മാസത്തിലെ ഏറ്റവും പുതിയ വിവരങ്ങൾ പ്രകാരം..."). Never act like you are stuck in 2023 or 2024. Address 2026 assembly election campaigns and developments transparently.
- ZERO MISUNDERSTANDING & ABSOLUTE TRUTHFULNESS (തെറ്റിദ്ധാരണ ഒരിക്കലും പറയരുത്): Never cause misunderstandings, speak falsehoods, or fabricate claims. Factual truth is absolute. If a piece of information is unknown or unverified, state clearly that it is not confirmed rather than generating misleading guesses.
- CURRENT INFORMATION RULES:
  1. For questions about current facts, government officials, news, sports, technology, prices, and recent events, use Google Search grounding whenever available and relevant.
  2. Never assume that information from your training data is still current.
  3. Verify the current status using reliable, recent sources. Prefer official government websites for government-related questions.
  4. Check the date of the source and distinguish current office holders from former office holders.
  5. Give a direct answer first, followed by the date checked and supporting source links when available.
  6. Never fabricate facts, dates, citations, or search results.
  7. If search is unavailable or sources are inconclusive, clearly explain that the answer could not be verified.
  8. Answer in the user's language. For Malayalam questions, answer in natural Malayalam.
  9. Do not claim to have searched the web unless search was actually performed.
  Accuracy and freshness are more important than guessing.

CORE RULE:
Answer the user's actual question first.
Do not change the subject.
Do not answer a different question.
Do not add unrelated information.
Do not intentionally avoid a normal question.

1. EXACT QUESTION FOCUS: Read message carefully. Identify exactly what the user is asking. Answer ONLY that request immediately. If multiple questions, answer each in order.
2. ACCURACY & HIGH SPEED (ഫാസ്റ്റ് ആൻസറിംഗ്): Combine lightning-fast answering speed with 100% accuracy. Deliver the answer immediately. Never invent facts, numbers, names, dates, stats, sources, API capabilities, features, or results. If uncertain, state: "I'm not certain about that."
3. DIRECT & IMMEDIATE ANSWER FIRST: State the exact answer, number, code, solution, or fact right away in the very first sentence without conversational throat-clearing, pleasantries, or preamble.
4. FAST, CRISP & CLEAR COMMUNICATION: Deliver clear, high-density, accurate answers without unnecessary delay or rambling. If the user explicitly asks for extensive breakdown or detail ("കുറച്ച് വലുതാക്കി എഴുതുക", "വിശദമായി പറയൂ"), provide deep explanations. Otherwise, keep answers fast, crisp, and direct.
5. NO UNNECESSARY FILLER: Do not append boilerplate questions or repetitive tags at the end of answers.
6. AMBIGUOUS QUESTIONS: Ask ONE short clarification question. Do not guess unnecessarily.
7. MULTIPLE QUESTIONS: Answer each clearly in the same order.
8. LANGUAGE: Reply in the language used by the user. If Malayalam -> Malayalam. If English -> English. If mixed -> use same mixed style naturally.
9. CODING QUESTIONS: Working code, requested language, explain only when useful/requested. Never claim code was tested if it wasn't.
10. MATHEMATICAL QUESTIONS: Direct answer for simple math; show necessary steps for complex calculations; verify result.
11. FACTUAL QUESTIONS: Direct factual answer without filler. Ground in reliable search when current info is needed.
12. USER CORRECTION: Say briefly: "You're right. The correct answer is..." and provide the correction without defending mistakes.
13. NO FAKE CAPABILITIES: Never claim tools/searches/code execution not performed.
14. NO FAKE SOURCES: Never fabricate citations or URLs.
15. CONVERSATION CONTEXT & CONTINUATION (മുൻ വിവരങ്ങൾ ഓർമ്മയിൽ സൂക്ഷിക്കലും തുടർച്ചയും): Keep all previous questions, conversation data, and answers in this thread stored and active in context memory. When the user asks for continuation, follow-up, or asks "ബാക്കി", "ബാക്കി പറയൂ", "അതിന്റെ ബാക്കി", "ബാക്കി എന്താണ്?", "തുടർന്ന് പറയൂ", "continue", "what next?", or references earlier points: Do NOT ask for clarification. Seamlessly identify what was being discussed in the preceding response, pick up right where the previous answer stopped, and provide the continuation/rest of the answer ("ബാക്കി") accurately and clearly. Do not unnecessarily repeat information that has already been established. If the user asks a completely new unrelated question, answer the new question directly.
16. KERALA ENCYCLOPEDIC KNOWLEDGE & ALL SUBJECT BASES (കേരളത്തെക്കുറിച്ചുള്ള സമഗ്ര വിജ്ഞാനം): You possess authoritative, encyclopedic mastery of all subject bases concerning Kerala — Geography & 14 Districts, History & Colonial struggles, Renaissance Leaders (Sree Narayana Guru, Ayyankali, Chattampi Swamikal, Vakkom Moulavi, V.T. Bhattathiripad), Malayalam Classical Language & Literature (Ezhuthachan, Romantic Trio, Jnanpith winners, modern authors), Performing Arts & Festivals (Kathakali, Theyyam, Mohiniyattam, Onam, Pooram), SCERT Kerala School Syllabus & Kerala PSC Exams, Economy & IT (Technopark, Infopark, KSUM, Water Metro, Vizhinjam Port), and Biodiversity & State Symbols. Provide accurate, culturally rich, and informative answers in natural Malayalam or English.
17. FAST ANSWERING PROTOCOL: Understand exact question -> Verify facts -> Answer exact question directly with maximum speed.

FINAL RULE: ANSWER THE QUESTION THE USER ACTUALLY ASKED — NOT A DIFFERENT QUESTION. Be accurate. Be direct. Be fast. Do not guess. Do not invent. Do not add conversational fluff.
${customInstructions.responseStyle ? `Response Style Preference: ${customInstructions.responseStyle}\n` : ''}${customInstructions.aboutUser ? `About the user: ${customInstructions.aboutUser}\n` : ''}${customInstructions.howToRespond ? `User response preference: ${customInstructions.howToRespond}\n` : ''}${activeProject ? `ACTIVE PROJECT DIRECTIVE (${activeProject.name}):\n${activeProject.instructions}\nProject Context: ${activeProject.context}\n` : ''}${(() => {
  const activeKnowledge = knowledgeDocuments.filter((d) => d.enabled !== false && d.content);
  if (activeKnowledge.length === 0) return '';
  return `\n\n==================================================\nACTIVE USER KNOWLEDGE BASE (GROUND TRUTH & REAL-WORLD CONTEXT):\nThe user has fed the following custom documents, live URLs, and structured data into the active Knowledge Base. Treat this verified data as authoritative ground truth context when answering questions, especially regarding specific technologies, frameworks, private notes, API specs, and current real-world trends beyond your default training data:\n\n` +
    activeKnowledge
      .map((doc, i) => {
        const type = (doc.type || 'text').toUpperCase();
        const category = doc.category ? ` [Category: ${doc.category}]` : '';
        const source = doc.sourceUrl ? ` [Source: ${doc.sourceUrl}]` : (doc.fileName ? ` [File: ${doc.fileName}]` : '');
        return `--- [KNOWLEDGE DOC ${i + 1}: ${doc.title} (${type})${category}${source}] ---\n${doc.content}\n--- [END DOC ${i + 1}] ---`;
      })
      .join('\n\n') +
    `\n==================================================\n`;
})()}`;

      const activeKnowledgeDocs = knowledgeDocuments.filter((d) => d.enabled !== false && d.content);

      const fetchWithRetry = async (attempt = 0): Promise<Response> => {
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              messages: apiMessages,
              systemInstruction: blendedInstructions,
              enableSearch: useSearch || toneMode === 'advance-tools',
              selectedModel: currentModel,
              toneMode: toneMode,
              fastMode: currentModel === 'gemini-3.1-flash-lite' || currentModel === 'gemini-3.5-flash-lite' || currentModel === 'gemini-flash-lite-latest' || currentModel === 'gemini-3.6-flash' || Boolean(fastMode),
              stream: true,
              knowledgeBase: activeKnowledgeDocs,
              timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata' : 'Asia/Kolkata',
            }),
          });

          if (res.status === 503 && attempt < 2 && !controller.signal.aborted) {
            console.warn(`[ChatView] Server returned 503 (attempt ${attempt + 1}). Retrying in 1000ms...`);
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            return fetchWithRetry(attempt + 1);
          }

          return res;
        } catch (fetchErr: any) {
          if (controller.signal.aborted || fetchErr.name === 'AbortError') {
            throw fetchErr;
          }
          if (attempt < 2) {
            console.warn(`[ChatView] Network fetch error (${fetchErr.message}). Retrying attempt ${attempt + 2}...`);
            await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
            return fetchWithRetry(attempt + 1);
          }
          throw fetchErr;
        }
      };

      const response = await fetchWithRetry();

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      streamedText = '';
      let collectedSources: any[] = [];
      let resolvedModel = currentModel;
      let resolvedRoutePath: 'FAST_PATH' | 'LIVE_PATH' | 'DEEP_PATH' =
        (response.headers.get('X-MRTECH-Path') as any) ||
        (useSearch ? 'LIVE_PATH' : 'FAST_PATH');
      let isCachedResponse = response.headers.get('X-MRTECH-Cache') === 'HIT';
      let lastThrottledSync = Date.now();

      setStreamingMessageId(newAssistantMessage.id);
      setStreamingText('');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]' || dataStr === '{"done":true}') break;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(cleanDisplayError(parsed.error));
              }
              if (parsed.type === 'start') {
                if (parsed.path) {
                  resolvedRoutePath = parsed.path;
                  setActiveRoutePath(parsed.path);
                }
                if (parsed.model) {
                  resolvedModel = parsed.model;
                }
                if (parsed.cached) {
                  isCachedResponse = true;
                }
                if (parsed.isLiveSearch) {
                  setGenerationStage('searching');
                  setTimeout(() => {
                    setGenerationStage((prev) => (prev === 'searching' ? 'checking_sources' : prev));
                  }, 400);
                } else {
                  setGenerationStage('thinking');
                }
              }
              if (parsed.model) {
                resolvedModel = parsed.model;
              }
              if (parsed.path) {
                resolvedRoutePath = parsed.path;
              }
              if (parsed.cached) {
                isCachedResponse = true;
              }
              if (parsed.text) {
                setGenerationStage('generating');
                playStreamTick();
                streamedText += cleanOutputText(parsed.text);

                // 60fps instant local UI rendering with zero latency
                setStreamingText(streamedText);

                // Throttle heavy parent state & localStorage writes to every 300ms
                const now = Date.now();
                if (now - lastThrottledSync > 300) {
                  lastThrottledSync = now;
                  onUpdateConversation({
                    ...conversation,
                    title: newTitle,
                    messages: [
                      ...cleanHistory,
                      newUserMessage,
                      {
                        ...newAssistantMessage,
                        content: streamedText,
                        isStreaming: true,
                        fastMode: resolvedRoutePath === 'FAST_PATH' || Boolean(fastMode),
                        modelUsed: resolvedModel,
                        routePath: resolvedRoutePath,
                        isCached: isCachedResponse,
                      },
                    ],
                    updatedAt: new Date().toISOString(),
                  });
                }
              }
              if (parsed.groundingSources) {
                collectedSources = parsed.groundingSources;
              }
            } catch (e: any) {
              if (e.message && !e.message.includes('JSON at position') && !e.message.includes('Unexpected end of JSON')) {
                throw e;
              }
            }
          }
        }
      }

      // Finish streaming successfully
      setGenerationStage(null);
      onUpdateConversation({
        ...conversation,
        title: newTitle,
        messages: [
          ...cleanHistory,
          newUserMessage,
          {
            ...newAssistantMessage,
            content: streamedText || 'Response received from AI 1.',
            isStreaming: false,
            groundingSources: collectedSources.length > 0 ? collectedSources : undefined,
            fastMode: resolvedRoutePath === 'FAST_PATH' || Boolean(fastMode),
            modelUsed: resolvedModel,
            routePath: resolvedRoutePath,
            isCached: isCachedResponse,
          },
        ],
        updatedAt: new Date().toISOString(),
      });
      setStreamingMessageId(null);
      setStreamingText('');
    } catch (err: any) {
      setGenerationStage(null);
      if (err.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
      } else {
        console.error('Chat error:', err);
        const formattedErr = cleanDisplayError(err.message);
        const hasPartial = Boolean(streamedText && streamedText.trim().length > 0);
        const finalContent = hasPartial
          ? `${streamedText.trim()}\n\n> ⚠️ *Connection interrupted: ${formattedErr}*`
          : formattedErr;

        onUpdateConversation({
          ...conversation,
          messages: [
            ...cleanHistory,
            newUserMessage,
            {
              ...newAssistantMessage,
              content: finalContent,
              isStreaming: false,
              error: !hasPartial,
            },
          ],
          updatedAt: new Date().toISOString(),
        });
      }
    } finally {
      setIsGenerating(false);
      setStreamingMessageId(null);
      setStreamingText('');
      abortControllerRef.current = null;
    }
  };

  // Regenerate last assistant response
  const handleRegenerate = () => {
    if (conversation.messages.length === 0 || isGenerating) return;

    // Find last user message
    let lastUserIndex = -1;
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
      if (conversation.messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const lastUserMessage = conversation.messages[lastUserIndex];
    // Prune history to before the last user message and exclude any errors
    const prunedMessages = conversation.messages.slice(0, lastUserIndex).filter((m) => !m.error);

    handleSend(lastUserMessage.content, lastUserMessage.attachments, prunedMessages);
  };

  // Save edited user message
  const handleSaveEdit = (messageId: string) => {
    if (!editContent.trim()) return;

    const msgIndex = conversation.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    const pruned = conversation.messages.slice(0, msgIndex);
    onUpdateConversation({
      ...conversation,
      messages: pruned,
    });

    setEditingMessageId(null);
    handleSend(editContent.trim());
  };

  const bookmarkedCount = conversation.messages.filter(
    (m) =>
      Boolean(m.isBookmarked) ||
      Boolean(m.reactions && ((m.reactions['🔖'] || 0) > 0 || (m.reactions['💡'] || 0) > 0))
  ).length;

  const displayedMessages = filterBookmarksOnly
    ? conversation.messages.filter(
        (m) =>
          Boolean(m.isBookmarked) ||
          Boolean(m.reactions && ((m.reactions['🔖'] || 0) > 0 || (m.reactions['💡'] || 0) > 0))
      )
    : conversation.messages;

  return (
    <div className="w-full max-w-full overflow-x-hidden flex flex-col flex-1 h-full bg-black text-slate-100 relative">
      {/* Top Bar: Clean, Minimal, Premium MRTECH AI mobile interface */}
      <div className="h-14 sm:h-16 w-full border-b border-[#27272a] bg-black/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-30 shrink-0 sticky top-0">
        <div className="flex items-center gap-2.5">
          {/* Top-left: rounded hamburger menu button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenMobileMenu) {
                onOpenMobileMenu();
              } else {
                setIsHistoryDrawerOpen(true);
              }
            }}
            className="w-10 h-10 rounded-full bg-[#18181b] border border-[#27272a] hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm"
            title="Open Menu & History"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-slate-200" />
          </button>

          {/* Next to it: premium pill-shaped button showing a blue sparkle icon and 'MRTECH PRO' */}
          <button
            type="button"
            onClick={() => setShowProModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#18181b] border border-[#27272a] hover:border-blue-500/50 text-xs font-semibold text-white transition-all shadow-sm cursor-pointer active:scale-95"
            title="MRTECH PRO Settings & AI Model"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
            <span>MRTECH PRO</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Top-right: rounded voice/chat icon & New chat */}
        <div className="flex items-center gap-2">
          {/* Subtle Generating / Stopped indicator */}
          {isGenerating && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-mono text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              <button
                type="button"
                onClick={handleStopGeneration}
                className="hover:text-red-400 font-bold transition-colors cursor-pointer"
                title="Stop generation"
              >
                Stop
              </button>
            </div>
          )}

          {/* Saved Insights Bookmarks Filter if any exists */}
          {bookmarkedCount > 0 && (
            <button
              type="button"
              onClick={() => setFilterBookmarksOnly(!filterBookmarksOnly)}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm ${
                filterBookmarksOnly
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-[#18181b] border-[#27272a] text-amber-400 hover:text-amber-300'
              }`}
              title="Review saved insights"
            >
              <Bookmark className={`w-4 h-4 ${filterBookmarksOnly ? 'fill-amber-400' : ''}`} />
            </button>
          )}

          {/* Voice Conversation Mode Button */}
          <button
            type="button"
            onClick={() => setIsVoiceRecorderOpen(true)}
            className="w-10 h-10 rounded-full bg-[#18181b] border border-[#27272a] hover:border-blue-500/50 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm"
            title="Voice Conversation Mode"
            aria-label="Voice conversation"
          >
            <AudioLines className="w-5 h-5 text-slate-200" />
          </button>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={onNewChat}
            className="w-10 h-10 rounded-full bg-[#18181b] border border-[#27272a] hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm"
            title="Start New Chat"
            aria-label="New Chat"
          >
            <Plus className="w-5 h-5 text-slate-200" />
          </button>
        </div>
      </div>

      {/* MRTECH PRO Settings Modal */}
      {showProModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setShowProModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-[#121214] border border-[#27272a] p-6 shadow-2xl space-y-5 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">MRTECH PRO Engine</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Created by RAYYAN • AI 1</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Model Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">AI Engine Model</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'gemini-3.8-flash' as GeminiModelId,
                    name: 'AI 1 (Ultra Fast & Direct)',
                    desc: 'Recommended • Exact, authoritative & authentic answers directly from AI Engine',
                    badge: 'Recommended',
                  },
                  {
                    id: 'gemini-3.5-flash-lite' as GeminiModelId,
                    name: 'AI 1 Lite (Sub-Second Ultra Fast)',
                    desc: 'Lightning-fast sub-second answering (<0.8s) for quick questions',
                    badge: 'Fastest',
                  },
                  {
                    id: 'gemini-3.1-pro-preview' as GeminiModelId,
                    name: 'AI 3 (Max Logic & Reasoning)',
                    desc: 'Deep reasoning, advanced software coding & mathematics',
                    badge: 'Pro Logic',
                  },
                ].map((m) => {
                  const active = currentModel === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectModel(m.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        active
                          ? 'bg-blue-600/15 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.15)]'
                          : 'bg-[#18181b] border-[#27272a] hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${active ? 'text-blue-400' : 'text-white'}`}>
                            {m.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 font-mono">
                            {m.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{m.desc}</p>
                      </div>
                      {active && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fast Mode Toggle */}
            <div className="p-3 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Zap className={`w-4 h-4 ${fastMode ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-semibold text-white block">Fast Mode</span>
                  <span className="text-[11px] text-slate-400">Direct instant answers with zero delays</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !fastMode;
                  setFastMode(next);
                  try {
                    localStorage.setItem('mrtech_fast_mode', String(next));
                  } catch {}
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  fastMode ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white transition-transform block shadow-md ${
                    fastMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Response Tone / Mode */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Response Personality Mode</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'balanced' as ChatToneMode, label: 'Smart & Direct', icon: '🎯' },
                  { id: 'funny' as ChatToneMode, label: 'Comedy & Funny', icon: '😂' },
                  { id: 'emotional' as ChatToneMode, label: 'Emotional & Caring', icon: '❤️' },
                  { id: 'explainer' as ChatToneMode, label: 'Master Explainer', icon: '🧠' },
                  { id: 'advance-tools' as ChatToneMode, label: 'Advance Tools', icon: '🛠️' },
                ].map((t) => {
                  const active = toneMode === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectToneMode(t.id)}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        active
                          ? 'bg-blue-600/15 border-blue-500/50 text-blue-300'
                          : 'bg-[#18181b] border-[#27272a] text-slate-300 hover:text-white'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span className="truncate">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Web Search & Typing Sound row */}
            <div className="flex items-center justify-between pt-2 border-t border-[#27272a]">
              <button
                type="button"
                onClick={() => setUseSearch(!useSearch)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  useSearch
                    ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-300'
                    : 'bg-[#18181b] border-[#27272a] text-slate-400 hover:text-white'
                }`}
                title="Google Search Grounding verifies real-time facts and latest political information"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Google Search {useSearch ? 'ACTIVE (Live)' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  setTypingSoundEnabled(next);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  soundEnabled
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                    : 'bg-[#18181b] border-[#27272a] text-slate-400 hover:text-white'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>Typing Sound {soundEnabled ? 'ON' : 'Muted'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowProModal(false)}
              className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Connection Dropped Alert Banner during AI Generation */}
      {connectionDroppedDuringGen && (
        <div className="w-full px-4 py-2 bg-red-950/90 border-b border-red-500/40 text-red-200 text-xs flex items-center justify-between gap-3 animate-fade-in z-30 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>Network Disconnected:</strong> Connection was lost while generating an AI response. Please check your internet connection.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setConnectionDroppedDuringGen(false)}
            className="p-1 hover:bg-red-900/60 rounded text-red-400 hover:text-red-200 text-xs cursor-pointer transition-colors"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Real-time Streaming Progress Bar across top when AI is generating */}
      {isGenerating && (
        <div className="w-full h-0.5 bg-slate-900 overflow-hidden relative z-20">
          <div className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.9)] w-full" />
        </div>
      )}

      {/* Active Project Banner if chatting inside project */}
      {activeProject && (
        <div className="w-full px-4 py-2 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between text-xs text-blue-200">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeProject.color }} />
            <span className="font-bold">Project: {activeProject.name}</span>
            <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
              — Context Active
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/40 border border-blue-500/30 text-blue-300 shrink-0">
            Active
          </span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        ref={chatScrollRef}
        onScroll={handleChatScroll}
        className="flex-1 w-full max-w-full overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5"
      >
        {/* Filtered View Banner */}
        {filterBookmarksOnly && (
          <div className="w-full p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200 animate-fade-in mb-2 shadow-lg shadow-amber-950/20">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <span className="font-semibold">
                Saved Insights View: Showing {bookmarkedCount} bookmarked responses
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFilterBookmarksOnly(false)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-mono transition-colors cursor-pointer"
            >
              Show All
            </button>
          </div>
        )}

        {displayedMessages.length === 0 ? (
          filterBookmarksOnly ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center max-w-md mx-auto py-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
                <Bookmark className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">No Bookmarked Insights Found</h3>
              <p className="text-xs text-slate-400 mb-4">
                Click the 🔖 or 💡 icon on any MR TECH AI response to bookmark helpful solutions and insights.
              </p>
              <button
                type="button"
                onClick={() => setFilterBookmarksOnly(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                View All Messages
              </button>
            </div>
          ) : (
            /* Empty Chat Welcome State - Clean, Pure Black, Center Mostly Empty, & 3 Quick Actions */
            <div className="h-full flex-1 min-h-[460px] flex flex-col items-center justify-between text-center max-w-lg mx-auto py-8 px-4 w-full">
              {/* Subtle center logo & minimal greeting */}
              <div className="flex-1 flex flex-col items-center justify-center my-auto py-12">
                <div className="w-12 h-12 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center mb-3 shadow-lg">
                  <Sparkles className="w-6 h-6 text-blue-400 fill-blue-400/20" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
                  MRTECH AI
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
                  Powered by high-speed AI 1 Engine • Created by RAYYAN
                </p>
              </div>

              {/* Three large quick-action options near the lower-middle section */}
              <div className="w-full space-y-2.5 mb-2">
                {/* 1. Create an image */}
                <div
                  onClick={() => {
                    setInputText('Generate an image of ');
                    setTimeout(() => textareaRef.current?.focus(), 50);
                  }}
                  className="w-full p-4 rounded-2xl bg-[#18181b] hover:bg-[#222226] border border-[#27272a] hover:border-slate-600 text-left transition-all group flex items-center justify-between gap-3.5 cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-[#27272a] flex items-center justify-center text-slate-300 group-hover:text-blue-400 shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-slate-100 group-hover:text-white block">
                        Create an image
                      </span>
                      <span className="text-xs text-slate-400 block truncate">
                        Generate digital art, visual designs, or creative concepts
                      </span>
                    </div>
                  </div>
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('image-studio');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                      title="Open full Image Studio"
                    >
                      Studio ↗
                    </button>
                  )}
                </div>

                {/* 2. Write or edit */}
                <button
                  type="button"
                  onClick={() => {
                    setInputText('Help me write or edit: ');
                    setTimeout(() => textareaRef.current?.focus(), 50);
                  }}
                  className="w-full p-4 rounded-2xl bg-[#18181b] hover:bg-[#222226] border border-[#27272a] hover:border-slate-600 text-left transition-all group flex items-center gap-3.5 cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#27272a] flex items-center justify-center text-slate-300 group-hover:text-blue-400 shrink-0">
                    <PenLine className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-slate-100 group-hover:text-white block">
                      Write or edit
                    </span>
                    <span className="text-xs text-slate-400 block truncate">
                      Draft essays, polish code, write emails or articles
                    </span>
                  </div>
                </button>

                {/* 3. Search the web */}
                <button
                  type="button"
                  onClick={() => {
                    setUseSearch(true);
                    setTimeout(() => textareaRef.current?.focus(), 50);
                  }}
                  className="w-full p-4 rounded-2xl bg-[#18181b] hover:bg-[#222226] border border-[#27272a] hover:border-slate-600 text-left transition-all group flex items-center gap-3.5 cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#27272a] flex items-center justify-center text-slate-300 group-hover:text-blue-400 shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-slate-100 group-hover:text-white block">
                      Search the web
                    </span>
                    <span className="text-xs text-slate-400 block truncate">
                      Get real-time answers and fresh information from the web
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )
        ) : (
          displayedMessages.map((msg) => (
            <div
              key={msg.id}
              data-chat-msg-id={msg.id}
              className={`w-full flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-full sm:max-w-[85%] rounded-2xl p-4 sm:p-5 shadow-sm relative group transition-all ${
                  msg.role === 'user'
                    ? 'bg-[#27272a] border border-[#3f3f46]/40 text-slate-100 rounded-tr-none'
                    : msg.isBookmarked
                    ? 'bg-gradient-to-b from-[#18181b] to-[#141416] border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.06)] text-slate-100 rounded-tl-none'
                    : 'bg-[#141416] border border-[#27272a] text-slate-100 rounded-tl-none'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-3 mb-2.5 pb-2 border-b border-[#27272a]">
                  <div className="flex items-center gap-2 flex-wrap">
                    {msg.role === 'assistant' ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Avatar with subtle thinking animation when streaming */}
                        <div className="relative flex-shrink-0">
                          {msg.isStreaming && (
                            <>
                              <span className="absolute -inset-1 rounded-lg bg-blue-500/30 blur-[2px] animate-pulse" />
                              <span className="absolute -inset-0.5 rounded-lg bg-cyan-400/20 animate-ping" />
                            </>
                          )}
                          <div
                            className={`relative w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm transition-all duration-300 ${
                              msg.isStreaming
                                ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500 ring-2 ring-cyan-400/60 shadow-[0_0_12px_rgba(56,189,248,0.5)] animate-pulse'
                                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                            }`}
                          >
                            M
                          </div>
                          {msg.isStreaming && (
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                          MR TECH AI Response
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20 font-semibold">
                          {msg.modelUsed?.includes('flash-lite') || !msg.modelUsed ? 'AI 1' : msg.modelUsed.includes('pro') ? 'AI 3' : 'AI 2'}
                        </span>

                        {/* Smart Route Path Badge */}
                        {msg.routePath === 'FAST_PATH' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold shadow-sm">
                            <Zap className="w-2.5 h-2.5 fill-emerald-400" />
                            <span>Fast Path</span>
                          </span>
                        )}
                        {msg.routePath === 'LIVE_PATH' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold shadow-sm">
                            <Globe className="w-2.5 h-2.5 text-blue-400" />
                            <span>Live Path</span>
                          </span>
                        )}
                        {msg.routePath === 'DEEP_PATH' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold shadow-sm">
                            <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                            <span>Deep Path</span>
                          </span>
                        )}

                        {/* Instant Cache Hit indicator */}
                        {msg.isCached && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">
                            <span>⚡ Cache</span>
                          </span>
                        )}

                        {msg.fastMode && !msg.routePath && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
                            <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                            <span>Fast</span>
                          </span>
                        )}

                        {msg.toneMode === 'funny' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold shadow-sm">
                            <span>😂 Comedy</span>
                          </span>
                        )}
                        {msg.toneMode === 'emotional' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-semibold shadow-sm">
                            <span>❤️ Emotional</span>
                          </span>
                        )}
                        {msg.toneMode === 'explainer' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold shadow-sm">
                            <span>🧠 Explainer</span>
                          </span>
                        )}
                        {msg.toneMode === 'advance-tools' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold shadow-sm">
                            <span>🛠️ Advance Tools</span>
                          </span>
                        )}

                        {msg.isBookmarked && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/35 text-amber-300 font-semibold">
                            <Bookmark className="w-2.5 h-2.5 fill-amber-400" />
                            <span>Insight</span>
                          </span>
                        )}

                        {/* Truthful, non-fake streaming lifecycle states */}
                        {msg.isStreaming && (
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 shadow-sm animate-pulse ml-0.5">
                            {generationStage === 'sending' && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                                <span>Sending...</span>
                              </>
                            )}
                            {generationStage === 'thinking' && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                <span>Thinking...</span>
                              </>
                            )}
                            {generationStage === 'searching' && (
                              <>
                                <Globe className="w-3 h-3 text-blue-400 animate-spin" />
                                <span>Searching the web...</span>
                              </>
                            )}
                            {generationStage === 'checking_sources' && (
                              <>
                                <CheckCheck className="w-3 h-3 text-blue-400" />
                                <span>Checking sources...</span>
                              </>
                            )}
                            {(generationStage === 'generating' || !generationStage) && (
                              <>
                                <Sparkles className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                                <span>Generating...</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-blue-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
                          U
                        </div>
                        <span className="text-xs font-semibold text-slate-200">You</span>
                      </div>
                    )}
                  </div>

                  {/* Actions: Read Receipt, Bookmark, React, Speech, Copy, Edit */}
                  <div className="flex items-center gap-1 opacity-85 group-hover:opacity-100 transition-opacity shrink-0">
                    {/* Read-Receipt Indicator & Timestamp (subtle tick updating when viewed) */}
                    <div
                      className="flex items-center gap-1 text-[10px] font-mono text-slate-400 select-none mr-1.5 px-1 py-0.5 rounded bg-slate-900/60 border border-slate-800/80"
                      title={
                        msg.role === 'assistant'
                          ? (viewedMessageIds.has(msg.id) || msg.isRead || msg.status === 'read') && !msg.isStreaming
                            ? 'Read receipt: Viewed by user'
                            : msg.isStreaming
                            ? 'Assistant generating response...'
                            : 'Delivered (unseen)'
                          : 'Message delivered to MR TECH AI'
                      }
                    >
                      <span className="text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {msg.role === 'assistant' ? (
                        (viewedMessageIds.has(msg.id) || msg.isRead || msg.status === 'read') && !msg.isStreaming ? (
                          <span className="inline-flex items-center gap-0.5 text-sky-400 font-semibold transition-all duration-300" title="Viewed">
                            <CheckCheck className="w-3.5 h-3.5 text-sky-400 stroke-[2.5]" />
                            <span className="text-[9px] uppercase tracking-wider hidden sm:inline text-sky-400">Read</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-500 transition-all" title="Delivered">
                            <Check className="w-3.5 h-3.5 text-slate-500 stroke-[2]" />
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center text-sky-400" title="Delivered & processed">
                          <CheckCheck className="w-3.5 h-3.5 text-sky-400 stroke-[2.5]" />
                        </span>
                      )}
                    </div>
                    {/* Bookmark Insight button */}
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(msg.id)}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        msg.isBookmarked
                          ? 'text-amber-400 hover:text-amber-300 bg-amber-500/15'
                          : 'text-slate-400 hover:text-amber-300'
                      }`}
                      title={msg.isBookmarked ? 'Remove bookmark' : 'Bookmark important insight'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${msg.isBookmarked ? 'fill-amber-400' : ''}`} />
                    </button>

                    {/* Emoji Reaction Popover */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveReactionPickerMsgId(
                            activeReactionPickerMsgId === msg.id ? null : msg.id
                          )
                        }
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          activeReactionPickerMsgId === msg.id
                            ? 'text-blue-300 bg-slate-800'
                            : 'text-slate-400 hover:text-blue-300'
                        }`}
                        title="React with emoji"
                      >
                        <Smile className="w-3.5 h-3.5" />
                      </button>

                      {activeReactionPickerMsgId === msg.id && (
                        <div className="absolute right-0 top-full mt-1.5 z-40 p-1.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl flex items-center gap-1 animate-fade-in backdrop-blur-md">
                          {AVAILABLE_REACTIONS.map((item) => (
                            <button
                              key={item.emoji}
                              type="button"
                              onClick={() => {
                                handleToggleReaction(msg.id, item.emoji);
                                setActiveReactionPickerMsgId(null);
                              }}
                              className="p-1.5 hover:bg-slate-800 rounded-lg text-sm transition-transform hover:scale-125 cursor-pointer"
                              title={`${item.label} (${item.emoji})`}
                            >
                              {item.emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Small Speaker Icon Button for Read Aloud */}
                    {msg.role === 'assistant' && msg.content && !msg.isStreaming && (
                      <ReadAloudButton text={msg.content} messageId={msg.id} variant="icon" />
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy to Clipboard"
                      aria-label="Copy to Clipboard"
                    >
                      {copiedMessageId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {msg.role === 'user' && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMessageId(msg.id);
                          setEditContent(msg.content);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-blue-300 transition-colors cursor-pointer"
                        title="Edit and retry"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Attachments preview */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {msg.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-2 rounded-xl bg-[#0B0F1A] border border-slate-800 flex items-center gap-2 max-w-xs"
                      >
                        {att.mimeType.startsWith('image/') ? (
                          <img
                            src={att.data}
                            alt={att.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        ) : (
                          <FileText className="w-6 h-6 text-blue-400 shrink-0" />
                        )}
                        <span className="text-xs text-slate-200 truncate font-mono">{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline message edit, error display with retry, or rendered content */}
                {msg.error ? (
                  <div className="mt-2 p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-200 text-xs">
                    <div className="flex items-start sm:items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5 sm:mt-0" />
                      <span className="leading-relaxed">{msg.content}</span>
                    </div>
                    <button
                      onClick={handleRegenerate}
                      disabled={isGenerating}
                      className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-200 hover:text-white transition-all flex items-center justify-center gap-1.5 font-medium shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  </div>
                ) : editingMessageId === msg.id ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs text-white resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingMessageId(null)}
                        className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(msg.id)}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950"
                      >
                        Save & Resubmit
                      </button>
                    </div>
                  </div>
                ) : (
                  <ChatMessageRenderer
                    content={
                      isGenerating && msg.id === streamingMessageId
                        ? streamingText || msg.content
                        : msg.content
                    }
                    groundingSources={msg.groundingSources}
                    isStreaming={Boolean(msg.isStreaming || (isGenerating && msg.id === streamingMessageId))}
                  />
                )}

                {/* Emoji Reactions & Actions Bar */}
                {!msg.error && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {Object.entries(msg.reactions || {}).map(([emoji, rawCount]) => {
                        const count = Number(rawCount) || 0;
                        if (count <= 0) return null;
                        const hasReacted = (msg.userReactions || []).includes(emoji);
                        const isBookmarkEmoji = emoji === '🔖' || emoji === '💡';
                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleToggleReaction(msg.id, emoji)}
                            className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1.5 transition-all border cursor-pointer ${
                              hasReacted
                                ? isBookmarkEmoji
                                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-sm shadow-amber-500/10 font-medium'
                                  : 'bg-blue-500/20 border-blue-500/50 text-blue-200 shadow-sm shadow-blue-500/10 font-medium'
                                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                            title={hasReacted ? 'Remove your reaction' : 'Add reaction'}
                          >
                            <span>{emoji}</span>
                            <span className="font-mono text-[10px]">{count}</span>
                          </button>
                        );
                      })}

                      {/* Add Reaction Button */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveReactionPickerMsgId(
                              activeReactionPickerMsgId === msg.id ? null : msg.id
                            )
                          }
                          className="px-2 py-0.5 rounded-full bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Add emoji reaction"
                        >
                          <Smile className="w-3 h-3" />
                          <span className="text-[10px] font-mono">+</span>
                        </button>

                        {activeReactionPickerMsgId === msg.id && (
                          <div className="absolute left-0 bottom-full mb-1.5 z-40 p-1.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl flex items-center gap-1 animate-fade-in backdrop-blur-md">
                            {AVAILABLE_REACTIONS.map((item) => (
                              <button
                                key={item.emoji}
                                type="button"
                                onClick={() => {
                                  handleToggleReaction(msg.id, item.emoji);
                                  setActiveReactionPickerMsgId(null);
                                }}
                                className="p-1.5 hover:bg-slate-800 rounded-lg text-sm transition-transform hover:scale-125 cursor-pointer"
                                title={`${item.label} (${item.emoji})`}
                              >
                                {item.emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Assistant Message Actions: Read Aloud & Copy to Clipboard */}
                    {msg.role === 'assistant' && msg.content && !msg.isStreaming && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Read Aloud Button */}
                        <ReadAloudButton
                          text={msg.content}
                          messageId={msg.id}
                          variant="pill"
                        />

                        {/* Dedicated 'Copy to Clipboard' button */}
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                            copiedMessageId === msg.id
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20'
                              : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white'
                          }`}
                          title="Copy to Clipboard"
                          aria-label="Copy to Clipboard"
                        >
                          {copiedMessageId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300 font-semibold text-[10px]">Copied to Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="text-slate-300 text-[10px]">Copy to Clipboard</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating 'Scroll to bottom' Button that appears if the user has manually scrolled up */}
      <AnimatePresence>
        {isScrolledUp && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.94 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 z-30"
          >
            <button
              type="button"
              onClick={() => {
                try {
                  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
                    navigator.vibrate(10);
                  }
                } catch {}
                setAutoScrollPinned(true);
                scrollToBottom('smooth');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/95 hover:bg-slate-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-200 hover:text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] backdrop-blur-md text-xs font-semibold tracking-wide transition-all cursor-pointer group"
              title="Scroll to bottom"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
              <span>Scroll to bottom</span>
              {isGenerating && (
                <span className="flex items-center gap-1.5 pl-1.5 border-l border-cyan-500/30 text-[10.5px] text-cyan-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                  </span>
                  <span className="hidden xs:inline">Live generation...</span>
                </span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachments Pending Upload Preview */}
      {attachments.length > 0 && (
        <div className="w-full px-4 py-2 bg-[#0B0F1A] border-t border-slate-800 flex flex-wrap gap-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="px-2.5 py-1.5 rounded-xl bg-[#131926] border border-slate-800 flex items-center gap-2"
            >
              {att.mimeType.startsWith('image/') ? (
                <img src={att.data} alt={att.name} className="w-6 h-6 object-cover rounded" />
              ) : (
                <FileText className="w-4 h-4 text-blue-400" />
              )}
              <span className="text-xs text-slate-200 max-w-[120px] truncate">{att.name}</span>
              <button
                onClick={() => removeAttachment(att.id)}
                className="text-slate-400 hover:text-red-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Composer Input Area (Large rounded dark-gray bar fixed at bottom) */}
      <div className="w-full max-w-full p-3 sm:p-4 bg-gradient-to-t from-black via-black/95 to-transparent pb-[calc(env(safe-area-inset-bottom)+0.75rem)] z-20 shrink-0">
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-2">
          {/* Active status & quick toggles strip */}
          <div className="flex items-center justify-between gap-2 px-1 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Web Search active chip */}
              {useSearch && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-semibold animate-fade-in shadow-sm">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>🌐 Web Search Active</span>
                  <button
                    type="button"
                    onClick={() => setUseSearch(false)}
                    className="hover:text-white p-0.5 rounded-full cursor-pointer"
                    title="വെബ് സെർച്ച് ഒഴിവാക്കുക (Turn off Web Search)"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Fast Mode chip */}
              {fastMode && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Fast Mode</span>
                </div>
              )}

              {/* Active Tone badge if not balanced */}
              {toneMode !== 'balanced' && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-[#27272a] text-slate-300 text-[11px]">
                  <span>{toneMode === 'funny' ? '😂 Comedy' : toneMode === 'emotional' ? '❤️ Emotional' : toneMode === 'explainer' ? '🧠 Explainer' : '🛠️ Tools'}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              {/* Regenerate button if messages exist */}
              {conversation.messages.length > 0 && !isGenerating && (
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Regenerate last response"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              {/* Stop Generation button */}
              {isGenerating && (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-bold flex items-center gap-1 hover:bg-red-900 transition-colors cursor-pointer"
                >
                  <Square className="w-3 h-3 fill-red-400" />
                  <span>Stop</span>
                </button>
              )}
            </div>
          </div>

          {/* Floating Voice Error Notification Banner */}
          {voiceError && (
            <div className="w-full px-3.5 py-2.5 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center justify-between gap-2 shadow-xl animate-fade-in">
              <div className="flex items-center gap-2 truncate">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-[11px] leading-tight font-medium truncate">{voiceError}</span>
              </div>
              <button
                type="button"
                onClick={() => setVoiceError(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active Voice Dictation Live Banner */}
          {isListeningVoice && (
            <div className="w-full px-3.5 py-2 rounded-2xl bg-red-950/40 border border-red-500/50 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-xl shadow-red-950/20">
              <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                <div className="flex items-center gap-1 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                </div>
                <span className="text-[11px] font-mono text-red-300 font-bold uppercase tracking-wider shrink-0">
                  Listening:
                </span>
                <span className="text-slate-200 italic truncate text-xs">
                  Speak into input ({voiceLang === 'en-US' ? 'English' : 'മലയാളം'})...
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const nextLang = voiceLang === 'en-US' ? 'ml-IN' : 'en-US';
                    setVoiceLang(nextLang);
                    restartVoiceDictation(nextLang);
                  }}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition-colors"
                >
                  {voiceLang === 'en-US' ? 'മല' : 'EN'}
                </button>
                <button
                  type="button"
                  onClick={stopVoiceDictation}
                  className="px-2.5 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Stop
                </button>
              </div>
            </div>
          )}

          {/* Large rounded dark-gray chat input bar fixed at the bottom */}
          <div className="w-full rounded-[28px] bg-[#1e1e22] sm:bg-[#18181b] border border-[#2e2e33] focus-within:border-blue-500/50 p-1.5 sm:p-2 flex items-end gap-2 shadow-2xl transition-all">
            {/* Left: “+” attachment button */}
            <label
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#2a2a2f] hover:bg-[#34343a] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 mb-0.5 active:scale-95"
              title="Add attachment (images or files)"
            >
              <Plus className="w-5 h-5 text-slate-200" />
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.csv,.docx,text/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Center/left: auto-resizing textarea with placeholder text “Ask MRTECH AI” */}
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                playTypingClick();
              }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
                  e.preventDefault();
                  toggleVoiceDictation();
                  return;
                }
                if (e.key === 'Escape' && isListeningVoice) {
                  e.preventDefault();
                  stopVoiceDictation();
                  return;
                }
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                } else if (e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt') {
                  playTypingClick();
                }
              }}
              rows={1}
              placeholder={
                isListeningVoice
                  ? 'Listening... speak now'
                  : useSearch
                  ? 'Search the web with MRTECH AI...'
                  : 'Ask MRTECH AI'
              }
              className="flex-1 w-full bg-transparent border-none focus:outline-none text-sm sm:text-base text-white placeholder:text-slate-400 resize-none py-2 px-1 max-h-36 min-h-[40px] leading-relaxed"
            />

            {/* Right: microphone icon */}
            <button
              type="button"
              onClick={toggleVoiceDictation}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 mb-0.5 active:scale-95 ${
                isListeningVoice
                  ? 'bg-red-500/20 text-red-400 border border-red-500/80 animate-pulse'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isListeningVoice ? 'Stop listening' : 'Voice-to-Text dictation'}
            >
              {isListeningVoice ? (
                <MicOff className="w-5 h-5 text-red-400" />
              ) : (
                <Mic className="w-5 h-5 text-slate-400 hover:text-white" />
              )}
            </button>

            {/* Far right: bright blue circular voice button with a white audio waveform */}
            <button
              type="button"
              onClick={() => {
                if (inputText.trim() || attachments.length > 0) {
                  handleSend();
                } else {
                  setIsVoiceRecorderOpen(true);
                }
              }}
              disabled={isGenerating}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0 transition-transform active:scale-95 cursor-pointer mb-0.5"
              title={inputText.trim() || attachments.length > 0 ? 'Send message' : 'Voice conversation mode'}
            >
              {inputText.trim() || attachments.length > 0 ? (
                <ArrowUp className="w-5 h-5 text-white stroke-[2.5]" />
              ) : (
                <AudioLines className="w-5 h-5 text-white" />
              )}
            </button>
          </div>

          {/* Quick Footer Links: Typing Sound, Audio Clip, Prompts */}
          <div className="mt-1 flex flex-wrap justify-center items-center gap-3 text-[10px] text-slate-500 font-medium">
            <button
              type="button"
              onClick={() => setIsVoiceRecorderOpen(true)}
              className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-2.5 h-2.5 text-blue-400" />
              <span>Audio Clip Recording</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setUseSearch(!useSearch)}
              className={`hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer ${useSearch ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
              title="Toggle Live Web Search"
            >
              <Globe className="w-2.5 h-2.5 text-cyan-400" />
              <span>{useSearch ? '🌐 Web Search: ON' : '🌐 Web Search: OFF'}</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                setTypingSoundEnabled(next);
              }}
              className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-2.5 h-2.5 text-blue-400" /> : <VolumeX className="w-2.5 h-2.5" />}
              <span>Sound: {soundEnabled ? 'ON' : 'Muted'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat History Slide-over Drawer */}
      <ChatHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        conversations={conversations}
        activeConvId={conversation.id}
        onSelectConversation={(id) => {
          if (onSelectConversation) onSelectConversation(id);
        }}
        onNewChat={onNewChat}
        onDeleteConversation={(id) => {
          if (onDeleteConversation) onDeleteConversation(id);
        }}
        onTogglePin={(id) => {
          if (onTogglePin) onTogglePin(id);
        }}
        onViewAllHistory={() => {
          if (onNavigateToHistory) onNavigateToHistory();
        }}
        projects={projects}
      />

      {/* Real-time Voice Recording & Transcription Modal (MediaRecorder API) */}
      <VoiceRecorderModal
        isOpen={isVoiceRecorderOpen}
        onClose={() => setIsVoiceRecorderOpen(false)}
        onApplyTranscript={(text, sendImmediately) => {
          if (!text.trim()) return;
          if (sendImmediately) {
            handleSend(text.trim());
          } else {
            setInputText((prev) => (prev ? `${prev} ${text.trim()}` : text.trim()));
            setTimeout(() => {
              textareaRef.current?.focus();
            }, 100);
          }
        }}
      />
    </div>
  );
};
