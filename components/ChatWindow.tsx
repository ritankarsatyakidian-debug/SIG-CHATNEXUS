import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, User, Message, MessagePriority } from '../types';
import { Send, Smile, Paperclip, MoreVertical, Search, ShieldCheck, Languages, BrainCircuit, Globe, Mic, AlertTriangle, Clock, Grid, Lock, UserX, UserMinus, UserPlus, Trash2 } from 'lucide-react';
import { GeminiService } from '../services/gemini';

interface ChatWindowProps {
  chat: ChatSession;
  currentUser: User;
  onSendMessage: (chatId: string, content: string, type: 'text' | 'image' | 'mini-app', priority: MessagePriority, miniAppData?: any) => void;
  onReactToMessage: (chatId: string, messageId: string, emoji: string) => void;
  onBack: () => void;
  toggleInfoPanel: () => void;
  onOpenTerminal?: () => void;
  onBlockUser?: (userId: string) => void;
  onAddUser?: (chatId: string, phone: string) => void;
  onRemoveUser?: (chatId: string, userId: string) => void;
  onLaunchMeeting?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chat, currentUser, onSendMessage, onReactToMessage, onBack, toggleInfoPanel, onOpenTerminal, onBlockUser, onAddUser, onRemoveUser, onLaunchMeeting }) => {
  const [inputValue, setInputValue] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [priorityMode, setPriorityMode] = useState<MessagePriority>('NORMAL');
  const [isTimeLocked, setIsTimeLocked] = useState(false);
  const [showMiniAppMenu, setShowMiniAppMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isGroup = chat.isGroup;
  const partner = !isGroup ? chat.participants.find(p => p.id !== currentUser.id) : null;
  const chatName = isGroup ? chat.name : partner?.name;
  const chatAvatar = isGroup ? `https://picsum.photos/seed/${chat.id}/200/200` : partner?.avatar;
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.adminChannels?.includes(chat.id);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat.messages]);

  useEffect(() => {
    if (chat.messages.length > 0) {
        const lastMsg = chat.messages[chat.messages.length - 1];
        if (lastMsg.senderId !== currentUser.id) {
            GeminiService.getSmartReplies(chat.messages).then(setSmartReplies);
        }
    }
  }, [chat.messages, currentUser.id]);

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;
    
    // Check for Terminal Command
    if (trimmedInput === '/terminal' && chat.id === 'admin_sigmax' && onOpenTerminal) {
        onOpenTerminal();
        setInputValue('');
        return;
    }

    // Check for Meeting Room Trigger
    if (trimmedInput.toUpperCase() === 'LING-DYNOMAX' && onLaunchMeeting) {
        onLaunchMeeting();
        setInputValue('');
        return;
    }

    if (priorityMode === 'CRITICAL') {
        const securityCheck = await GeminiService.analyzeSecurityRisk(trimmedInput);
        if (!securityCheck.authorized) {
            alert(`SECURITY BLOCK: ${securityCheck.reason}`);
            return;
        }
    }
    onSendMessage(chat.id, trimmedInput, 'text', priorityMode);
    setInputValue('');
    setPriorityMode('NORMAL');
    setIsTimeLocked(false);
  };

  const handleSendMiniApp = (type: 'POLL' | 'VOTE') => {
      onSendMessage(chat.id, "Interactive Widget", 'mini-app', 'NORMAL', {
          type,
          title: type === 'VOTE' ? 'Strategic Council Vote' : 'Quick Poll',
          options: ['Option A', 'Option B'],
          votes: {}
      });
      setShowMiniAppMenu(false);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleTranslation = async () => {
    if (Object.keys(translatedMessages).length > 0) {
        setTranslatedMessages({});
        return;
    }
    setIsTranslating(true);
    const newTranslations: Record<string, string> = {};
    const recentMessages = chat.messages.slice(-10);
    for (const msg of recentMessages) {
        if (msg.type === 'text' && msg.senderId !== currentUser.id) {
            const translation = await GeminiService.translateText(msg.content, currentUser.language);
            newTranslations[msg.id] = translation;
        }
    }
    setTranslatedMessages(newTranslations);
    setIsTranslating(false);
  };

  const REACTIONS = ['👍', '❤️', '😂', '😮', '🙏', '⚠️'];

  return (
    <div className="flex flex-col h-full bg-[#0b141a] relative w-full">
        {/* Chat Header */}
        <div className="h-16 bg-slate-800 px-4 py-2 flex items-center justify-between shadow-md shrink-0 z-10 border-b border-slate-700">
            <div className="flex items-center gap-4 cursor-pointer" onClick={toggleInfoPanel}>
                <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="md:hidden text-slate-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>
                <img src={chatAvatar} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                <div>
                    <h2 className="text-slate-200 font-semibold flex items-center gap-2">
                        {chatName}
                        {chat.encryptionLevel === 'QUANTUM_SECURE' && <Lock size={12} className="text-emerald-400" />}
                        {chat.adminOnly && <ShieldCheck size={14} className="text-red-500" />}
                    </h2>
                    <p className="text-slate-400 text-xs">
                        {isGroup 
                            ? `${chat.participants.length} participants` 
                            : `${partner?.country} • ${partner?.role}`
                        }
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
                <button 
                    onClick={toggleTranslation} 
                    className={`hover:text-cyan-400 transition ${Object.keys(translatedMessages).length > 0 ? 'text-cyan-400' : ''}`}
                    title="Toggle Auto-Translation"
                >
                    <Languages size={20} />
                </button>
                <div className="relative">
                    <button onClick={() => setShowAdminMenu(!showAdminMenu)} className="hover:text-cyan-400 transition"><MoreVertical size={20} /></button>
                    {showAdminMenu && (
                        <div className="absolute right-0 top-10 bg-slate-800 rounded shadow-xl border border-slate-700 w-48 z-50 overflow-hidden">
                            <button onClick={toggleInfoPanel} className="w-full text-left p-3 hover:bg-slate-700 text-sm flex gap-2"><ShieldCheck size={16}/> Info</button>
                            {isAdmin && isGroup && (
                                <button 
                                    onClick={() => {
                                        const phone = prompt("Enter User Phone to Add:");
                                        if (phone && onAddUser) onAddUser(chat.id, phone);
                                        setShowAdminMenu(false);
                                    }} 
                                    className="w-full text-left p-3 hover:bg-slate-700 text-sm flex gap-2"
                                >
                                    <UserPlus size={16}/> Add Member
                                </button>
                            )}
                            {!isGroup && partner && onBlockUser && (
                                <button 
                                    onClick={() => {
                                        if(confirm("Block this user?")) onBlockUser(partner.id);
                                        setShowAdminMenu(false);
                                    }}
                                    className="w-full text-left p-3 hover:bg-red-900/50 text-red-400 text-sm flex gap-2"
                                >
                                    <UserX size={16}/> Block User
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Chat Area */}
        <div 
            className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8"
            style={{ 
                backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                backgroundRepeat: 'repeat',
                backgroundSize: '400px',
                backgroundBlendMode: 'soft-light',
                backgroundColor: '#0b141a'
            }}
        >
            {chat.messages.filter(m => !currentUser.blockedUsers?.includes(m.senderId)).map((msg, index) => {
                const isMe = msg.senderId === currentUser.id;
                const sender = chat.participants.find(p => p.id === msg.senderId) || currentUser;
                const showHeader = isGroup && !isMe && (index === 0 || chat.messages[index - 1].senderId !== msg.senderId);
                const isCritical = msg.priority === 'CRITICAL' || msg.priority === 'EMERGENCY_BROADCAST';

                return (
                    <div key={msg.id} className={`flex mb-3 ${isMe ? 'justify-end' : 'justify-start'} group relative`}>
                        <div className={`max-w-[85%] md:max-w-[65%] rounded-lg p-2 px-3 shadow-sm relative text-sm 
                            ${isMe ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-[#202c33] text-slate-200 rounded-tl-none'}
                            ${isCritical ? 'border-2 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}
                        `}>
                            {isCritical && (
                                <div className="bg-red-500/20 -mx-3 -mt-2 mb-2 px-3 py-1 rounded-t text-red-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                    <AlertTriangle size={10} /> {msg.priority} MESSAGE
                                </div>
                            )}

                            {showHeader && (
                                <div className={`text-xs font-bold mb-1 ${
                                    sender?.country === 'TAIQ' ? 'text-purple-400' : 
                                    sender?.country === 'POWERLINGX' ? 'text-orange-400' : 'text-blue-400'
                                }`}>
                                    {sender?.name} <span className="text-[10px] opacity-60 font-mono ml-1">[{sender?.country}]</span>
                                </div>
                            )}
                            
                            <div className="whitespace-pre-wrap leading-relaxed">
                                {msg.type === 'mini-app' && msg.miniAppData ? (
                                    <div className="bg-slate-800/50 rounded p-3 border border-slate-700 my-1">
                                        <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold">
                                            <Grid size={16} /> {msg.miniAppData.title}
                                        </div>
                                        <div className="space-y-2">
                                            {msg.miniAppData.options?.map(opt => (
                                                <button key={opt} className="w-full text-left bg-slate-700/50 hover:bg-slate-700 p-2 rounded text-xs transition">
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : translatedMessages[msg.id] ? (
                                    <div className="animate-fade-in">
                                        <div className="flex items-center gap-1 text-xs text-cyan-400 mb-1 border-b border-white/10 pb-1">
                                            <Globe size={10} /> Translated from {sender?.language}
                                        </div>
                                        {translatedMessages[msg.id]}
                                    </div>
                                ) : (
                                    msg.content
                                )}
                            </div>

                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                <div className="flex gap-1 mt-1 -mb-2 z-10 relative">
                                    {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                                        <span key={emoji} className="bg-slate-700 rounded-full px-1.5 py-0.5 text-xs shadow border border-slate-600">
                                            {emoji} <span className="text-[10px] text-slate-400">{userIds.length}</span>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className={`text-[10px] text-right mt-1 flex justify-end items-center gap-1 ${isMe ? 'text-slate-300' : 'text-slate-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {isMe && <span>✓✓</span>}
                            </div>

                            <button 
                                onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                                className="absolute -right-8 top-0 text-slate-500 hover:text-yellow-400 opacity-0 group-hover:opacity-100 transition p-1"
                            >
                                <Smile size={18} />
                            </button>

                            {showEmojiPicker === msg.id && (
                                <div className="absolute right-0 -top-12 bg-slate-800 rounded-full shadow-lg border border-slate-700 p-1 flex gap-1 z-50 animate-fade-in">
                                    {REACTIONS.map(emoji => (
                                        <button 
                                            key={emoji}
                                            onClick={() => { onReactToMessage(chat.id, msg.id, emoji); setShowEmojiPicker(null); }}
                                            className="hover:bg-slate-700 p-1.5 rounded-full text-lg transition hover:scale-125"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`bg-[#202c33] px-4 py-3 flex items-end gap-2 shrink-0 ${priorityMode === 'CRITICAL' ? 'border-t-2 border-red-500' : ''}`}>
             <div className="flex flex-col gap-1">
                 <button 
                    onClick={() => setShowMiniAppMenu(!showMiniAppMenu)} 
                    className="text-slate-400 p-2 hover:bg-slate-700 rounded-full transition relative"
                >
                    <Grid size={24} />
                    {showMiniAppMenu && (
                        <div className="absolute bottom-12 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-48 overflow-hidden z-50">
                            <div className="p-2 text-xs text-slate-500 uppercase font-bold">Mini Apps</div>
                            <div onClick={() => handleSendMiniApp('VOTE')} className="p-3 hover:bg-slate-700 text-left text-sm text-slate-200 cursor-pointer flex items-center gap-2">
                                <ShieldCheck size={14} /> Official Vote
                            </div>
                            <div onClick={() => handleSendMiniApp('POLL')} className="p-3 hover:bg-slate-700 text-left text-sm text-slate-200 cursor-pointer flex items-center gap-2">
                                <MoreVertical size={14} /> Quick Poll
                            </div>
                        </div>
                    )}
                 </button>
             </div>
             
             <div className="flex-1 bg-[#2a3942] rounded-lg flex flex-col relative">
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={priorityMode === 'CRITICAL' ? "Type EMERGENCY message..." : "Type a message..."}
                    className="w-full bg-transparent text-slate-200 p-3 min-h-[44px] max-h-[120px] outline-none resize-none custom-scrollbar"
                    rows={1}
                />
            </div>

            <div className="flex items-center gap-1">
                 <button 
                    onClick={() => setPriorityMode(prev => prev === 'NORMAL' ? 'CRITICAL' : 'NORMAL')}
                    className={`p-2 rounded-full transition ${priorityMode === 'CRITICAL' ? 'text-red-500 bg-red-900/20' : 'text-slate-400 hover:bg-slate-700'}`}
                >
                    <AlertTriangle size={20} />
                </button>
                {inputValue ? (
                     <button onClick={handleSend} className="text-emerald-500 p-2 hover:bg-slate-700 rounded-full transition">
                        <Send size={24} />
                    </button>
                ) : (
                    <button className="text-slate-400 p-2 hover:bg-slate-700 rounded-full transition">
                        <Mic size={24} />
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};
