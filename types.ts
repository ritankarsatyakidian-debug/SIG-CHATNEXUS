
export type UserRole = 'CITIZEN' | 'OFFICIAL' | 'DIPLOMAT' | 'COUNCIL' | 'INTEL_OPS' | 'ADMIN';
export type SecurityLevel = 1 | 2 | 3 | 4 | 5; // 5 is highest
export type MessagePriority = 'NORMAL' | 'HIGH' | 'CRITICAL' | 'EMERGENCY_BROADCAST';

export interface User {
  id: string;
  name: string;
  phoneNumber: string; // Real-life phone number identification
  country: 'POWERLINGX' | 'TAIQ' | 'BEL-IQ-Z' | 'SAVIROM' | 'DIAMONDAURA' | 'LING-DYNOMAX' | 'UNKNOWN';
  avatar: string;
  status: string;
  language: string;
  role: UserRole;
  securityLevel: SecurityLevel;
  trustScore: number; // 0-100
  isVerified?: boolean;
  adminChannels?: string[]; // List of channel IDs this user can access
  blockedUsers?: string[]; // List of user IDs blocked by this user
}

export interface MiniAppConfig {
  appType: 'CAMERA' | 'RECORDER' | 'NOTEBOOK' | 'WHITEBOARD' | 'PRESENTATION' | 'FORM';
  title: string;
  description: string;
  formFields?: { label: string; key: string; type: 'text' | 'number' | 'checkbox' }[];
}

export interface MiniAppData {
  type: 'POLL' | 'VOTE' | 'RESOURCE_REQ' | 'GENERATED_APP';
  title: string;
  options?: string[];
  votes?: Record<string, number>;
  status?: 'OPEN' | 'CLOSED';
  config?: MiniAppConfig;
}

export interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'system' | 'mini-app';
  priority: MessagePriority;
  translatedContent?: string;
  isAiGenerated?: boolean;
  miniAppData?: MiniAppData;
  originCountry?: string;
  destCountry?: string;
  isTimeLocked?: boolean;
  unlockTime?: number;
  isEphemeral?: boolean; // New: For Stealth Mode
  expiresAt?: number; // New: Timestamp when message self-destructs
  reactions?: Record<string, string[]>; // emoji -> [userIds]
  imageAnalysis?: {
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    analysis: string;
    details: string[];
  };
}

export interface ChatSession {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessageTimestamp: number;
  unreadCount: number;
  isGroup: boolean;
  name?: string;
  type: 'DIRECT' | 'GROUP' | 'BROADCAST_CHANNEL';
  encryptionLevel: 'STANDARD' | 'QUANTUM_SECURE' | 'MILITARY_GRADE';
  adminOnly?: boolean; // If true, restricted access
}

export interface AIAnalysisResult {
  sentiment: 'neutral' | 'hostile' | 'friendly' | 'diplomatic';
  score: number;
  suggestions: string[];
}
