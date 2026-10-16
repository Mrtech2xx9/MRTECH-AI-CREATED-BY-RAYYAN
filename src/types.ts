export type DeviceMode = 'auto' | 'phone' | 'iphone' | 'tablet' | 'laptop' | 'desktop' | 'compact';

export type AppSection =
  | 'landing'
  | 'chat'
  | 'compare'
  | 'tools'
  | 'search'
  | 'image-studio'
  | 'documents'
  | 'projects'
  | 'history'
  | 'settings'
  | 'admin-reviews'
  | 'admin-users';

export type ThemeMode =
  | 'dark'
  | 'light'
  | 'cyber-light'
  | 'midnight-blue'
  | 'amethyst'
  | 'system';
export type AppLanguage = 'English' | 'Malayalam';

export type UserType = 'Student' | 'Job / Working' | 'Other';

export interface UserProfile {
  id: string;
  uid?: string;
  name: string; // Full Name
  email: string; // Gmail / Email
  phone?: string; // Phone number
  avatar: string;
  photoURL?: string;
  providerId?: string; // Login Provider
  createdAt?: string; // Account Creation Date
  lastLoginAt?: string; // Last Login Date
  onboarded: boolean;
  role?: 'user' | 'admin';
  age?: number;
  userType?: UserType;
  profileCompleted?: boolean;
  occupation?: string;
  goals?: string[];
  responseStyle?: string;
  educationLevel?: string;
}

export interface AdminNotification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string; // Gmail
  age?: number;
  phone?: string;
  userType?: string;
  message: string; // "1 person is login your ai"
  timestamp: string;
  read?: boolean;
  device?: string;
}

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  data: string; // base64
  size?: number;
}

export type GeminiModelId =
  | 'gemini-3.5-flash-lite'
  | 'gemini-3.8-flash'
  | 'gemini-3.1-pro-preview'
  | 'gemini-3.1-flash-lite'
  | 'gemini-flash-lite-latest'
  | 'gemini-3.6-flash'
  | 'ai-1-fast'
  | 'ai-2-pro'
  | 'ai-3-max';

export type ChatToneMode = 'balanced' | 'funny' | 'emotional' | 'explainer' | 'advance-tools';

export interface ToneModeOption {
  id: ChatToneMode;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  gradient: string;
  borderClass: string;
}

export const CHAT_TONE_MODES: ToneModeOption[] = [
  {
    id: 'balanced',
    name: 'Smart & Direct',
    emoji: '⚡',
    tagline: 'Fast, accurate, comfortable detail',
    description: 'Instant direct answer with comfortable context and accurate explanations.',
    gradient: 'from-cyan-500 to-blue-600',
    borderClass: 'border-cyan-500/30 text-cyan-300',
  },
  {
    id: 'funny',
    name: 'Comedy & Funny',
    emoji: '😂',
    tagline: 'Hilarious jokes, witty punchlines & banter',
    description: 'Brings laugh-out-loud humor, witty analogies, and comedic Malayalam/English flair to tech & life.',
    gradient: 'from-amber-400 to-orange-500',
    borderClass: 'border-amber-500/30 text-amber-300',
  },
  {
    id: 'emotional',
    name: 'Emotional & Caring',
    emoji: '❤️',
    tagline: 'Empathetic, heartwarming, uplifting',
    description: 'Warm, supportive, and emotionally resonant guidance with deep empathy and care.',
    gradient: 'from-pink-500 to-rose-600',
    borderClass: 'border-pink-500/30 text-pink-300',
  },
  {
    id: 'explainer',
    name: 'Master Explainer',
    emoji: '🧠',
    tagline: 'In-depth, step-by-step masterclass',
    description: 'Comfortably detailed, crystal-clear breakdown with intuitive metaphors and real-world examples.',
    gradient: 'from-emerald-400 to-teal-600',
    borderClass: 'border-emerald-500/30 text-emerald-300',
  },
  {
    id: 'advance-tools',
    name: 'Advance Tools',
    emoji: '🛠️',
    tagline: 'Deep search, code verification & logic',
    description: 'Uses web search grounding, code sandbox logic, structured tables, and power analysis.',
    gradient: 'from-purple-500 to-indigo-600',
    borderClass: 'border-purple-500/30 text-purple-300',
  },
];

export interface GeminiModelOption {
  id: GeminiModelId;
  name: string;
  label: string;
  purpose: string;
  isDefault?: boolean;
}

export const GEMINI_CHAT_MODELS: GeminiModelOption[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'AI 1 (Gemini 3.8 Flash Direct)',
    label: 'Flagship Direct Engine • Exact & Accurate',
    purpose:
      'Official Gemini 3.8 Flash direct engine. Provides authentic, highly accurate Malayalam & English answers directly without external delay.',
    isDefault: true,
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'AI 1 Lite (Sub-Second Ultra Fast)',
    label: 'Lightning-fast sub-second answering (<0.8s)',
    purpose:
      'Fastest answering engine with sub-second latency, zero waiting, high accuracy, and instant streaming.',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'AI 3 (Max Logic & Reasoning)',
    label: 'Deep logical synthesis & math',
    purpose:
      'Comprehensive multi-step problem solving, advanced mathematics, STEM research, and systemic architecture.',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'AI 1 Lite (Legacy)',
    label: 'Extended reasoning flash lite',
    purpose:
      'Extended reasoning flash lite engine.',
  },
];

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  groundingSources?: GroundingSource[];
  isStreaming?: boolean;
  error?: boolean;
  modelUsed?: string;
  fastMode?: boolean;
  toneMode?: ChatToneMode;
  reactions?: Record<string, number>;
  userReactions?: string[];
  isBookmarked?: boolean;
  routePath?: 'FAST_PATH' | 'LIVE_PATH' | 'DEEP_PATH';
  isCached?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  isRead?: boolean;
  readAt?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  archived?: boolean;
  projectId?: string;
  selectedModel?: GeminiModelId;
  toneMode?: ChatToneMode;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  aspectRatio: string;
  style: string;
  createdAt: string;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  instructions: string;
  context: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomInstructions {
  aboutUser: string;
  howToRespond: string;
  responseStyle: 'Direct' | 'Short' | 'Detailed' | 'Professional' | 'Friendly' | 'Technical' | 'Simple';
  language: AppLanguage;
  formatPreference: string;
}

export interface PromptItem {
  id: string;
  title: string;
  prompt: string;
  category: 'Study' | 'Coding' | 'Image' | 'Writing' | 'Research' | 'Business' | 'Content' | 'Productivity';
  tags?: string[];
}

export interface UserReview {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  rating: number;
  review: string;
  category: string;
  quickFeedback?: string[];
  additionalComments?: string;
  deviceMode?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  timestamp?: string; // backwards compatibility
}

export type KnowledgeSourceType = 'text' | 'file' | 'url' | 'structured';

export interface KnowledgeDocument {
  id: string;
  title: string;
  type: KnowledgeSourceType;
  content: string;
  summary?: string;
  sourceUrl?: string;
  fileName?: string;
  fileSize?: number;
  category: string;
  tags?: string[];
  enabled: boolean;
  tokenEstimate?: number;
  createdAt: string;
  updatedAt: string;
}

