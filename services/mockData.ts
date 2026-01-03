import { User, ChatSession, Message } from "../types";

// This is the template for a new user
export const NEW_USER_TEMPLATE: User = {
  id: '',
  name: '',
  phoneNumber: '',
  country: 'UNKNOWN',
  avatar: 'https://picsum.photos/200/200',
  status: 'Unverified',
  language: 'English',
  role: 'CITIZEN',
  securityLevel: 1,
  trustScore: 50,
  isVerified: false,
  adminChannels: []
};

// System Admin User (Hidden)
export const SYSTEM_ADMIN: User = {
    id: 'system_admin',
    name: 'SIGMAX CENTRAL',
    phoneNumber: '000-000',
    country: 'UNKNOWN',
    avatar: 'https://ui-avatars.com/api/?name=S+C&background=0D8ABC&color=fff',
    status: 'System',
    language: 'English',
    role: 'ADMIN',
    securityLevel: 5,
    trustScore: 100
};

// Only Real Users now. Removed fake contacts.
export const CONTACTS: User[] = []; 

export const ADMIN_CHANNELS: ChatSession[] = [
  {
    id: 'c_broadcasts',
    participants: [],
    messages: [{ id: 'm_br_1', senderId: 'system_admin', content: 'GLOBAL SIGMAX ALLIANCE BROADCAST SYSTEM ONLINE.', timestamp: Date.now(), type: 'system', priority: 'NORMAL' }],
    lastMessageTimestamp: Date.now(),
    unreadCount: 0,
    isGroup: true,
    name: "ALLIANCE BROADCASTS",
    type: 'BROADCAST_CHANNEL',
    encryptionLevel: 'STANDARD',
    adminOnly: false // Visible to all, write-only for admins
  },
  {
    id: 'admin_sir',
    participants: [],
    messages: [{ id: 'm_sys_1', senderId: 'system_admin', content: 'WELCOME TO ADMINS.S.I.R CHANNEL. AUTHORIZED PERSONNEL ONLY.', timestamp: Date.now(), type: 'system', priority: 'CRITICAL' }],
    lastMessageTimestamp: Date.now(),
    unreadCount: 0,
    isGroup: true,
    name: "ADMINS.S.I.R CHANNEL",
    type: 'GROUP',
    encryptionLevel: 'MILITARY_GRADE',
    adminOnly: true
  },
  {
    id: 'admin_sigmax',
    participants: [],
    messages: [{ id: 'm_sys_2', senderId: 'system_admin', content: 'WELCOME TO ADMINS.SIGMAX CHANNEL. HIGH COMMAND UPLINK ACTIVE.', timestamp: Date.now(), type: 'system', priority: 'CRITICAL' }],
    lastMessageTimestamp: Date.now(),
    unreadCount: 0,
    isGroup: true,
    name: "ADMINS.SIGMAX CHANNEL",
    type: 'GROUP',
    encryptionLevel: 'QUANTUM_SECURE',
    adminOnly: true
  },
  {
    id: 'admin_rsd',
    participants: [],
    messages: [{ id: 'm_sys_3', senderId: 'system_admin', content: 'WELCOME TO ADMINS.R.S.D CHANNEL. RESEARCH & SECURITY DIVISION.', timestamp: Date.now(), type: 'system', priority: 'CRITICAL' }],
    lastMessageTimestamp: Date.now(),
    unreadCount: 0,
    isGroup: true,
    name: "ADMINS.R.S.D CHANNEL",
    type: 'GROUP',
    encryptionLevel: 'MILITARY_GRADE',
    adminOnly: true
  },
  {
    id: 'infinity_force',
    participants: [],
    messages: [{ id: 'm_sys_4', senderId: 'system_admin', content: 'INFINITY FORCE CHANNEL INITIALIZED. OMEGA LEVEL THREATS ONLY.', timestamp: Date.now(), type: 'system', priority: 'EMERGENCY_BROADCAST' }],
    lastMessageTimestamp: Date.now(),
    unreadCount: 0,
    isGroup: true,
    name: "INFINITY FORCE CHANNEL",
    type: 'GROUP',
    encryptionLevel: 'QUANTUM_SECURE',
    adminOnly: true
  }
];

// Placeholder, will be replaced by Storage
export const INITIAL_CHATS: ChatSession[] = [
  ...ADMIN_CHANNELS
];

// Placeholder
export const CURRENT_USER = NEW_USER_TEMPLATE;