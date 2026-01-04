import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, User, Message, MessagePriority } from '../types';
import { Send, Smile, Paperclip, MoreVertical, Search, ShieldCheck, Languages, BrainCircuit, Globe, Mic, AlertTriangle, Clock, Grid, Lock, UserX, UserMinus, UserPlus, Trash2, Wand2, ScanEye, X, Sparkles, Loader, Ghost, EyeOff } from 'lucide-react';
import { GeminiService } from '../services/gemini';
import { MiniAppRenderer } from './MiniAppRenderer';
import { QuantumText } from './QuantumText';

interface ChatWindowProps {
  chat: ChatSession;
  currentUser: User;
  onSendMessage: (chatId: string, content: string, type: 'text' | 'image' | 'mini-app', priority: MessagePriority, miniAppData?: any, isEphemeral?: boolean) => void;
  onReactToMessage: (chatId: string, messageId: string, emoji: string) => void;
  onUpdateMessage?: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  onBack: () => void;
  toggleInfoPanel: () => void;
  onOpenTerminal?: () => void;
  onBlockUser?: (userId: string) => void;
  onAddUser?: (chatId: string, phone: string) => void;
  onRemoveUser?: (chatId: string, userId: string) => void;
  onLaunchMeeting?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chat, currentUser, onSendMessage, onReactToMessage, onUpdateMessage, onBack, toggleInfoPanel, onOpenTerminal, onBlockUser, onAddUser, onRemoveUser, onLaunchMeeting }) => {
  const [inputValue, setInputValue] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [priorityMode, setPriorityMode] = useState<MessagePriority>('NORMAL');
  const [isStealthMode, setIsStealthMode] = useState(false); // Ghost Mode State
  const [showMiniAppMenu, setShowMiniAppMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [analyzingImageId, setAnalyzingImageId] = useState<string | null>(null);
  const [isGeneratingApp, setIsGeneratingApp] = useState(false);
  const [now, setNow] = useState(Date.now()); // For ephemeral timers

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGroup = chat.isGroup;
  const partner = !isGroup ? chat.participants.find(p => p.id !== currentUser.id) : null;
  const chatName = isGroup ? chat.name : partner?.name;
  const chatAvatar = isGroup ? `https://picsum.photos/seed/${chat.id}/200/200` : partner?.avatar;
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.adminChannels?.includes(chat.id);
  const isQuantum = chat.encryptionLevel === 'QUANTUM_SECURE';

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat.messages, now]);

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

    // Check for App Generation Command
    if (trimmedInput.startsWith('/genapp ') || trimmedInput.startsWith('/tool ')) {
        const description = trimmedInput.replace(/^\/(genapp|tool)\s+/, '');
        if (description.length > 0) {
            setInputValue(''); // Clear input
            setIsGeneratingApp(true);
            try {
                const config = await GeminiService.generateMiniAppConfig(description);
                if (config) {
                    onSendMessage(chat.id, "Generated Tool", 'mini-app', 'NORMAL', {
                        type: 'GENERATED_APP',
                        title: config.title,
                        config: config
                    });
                } else {
                    alert("AI could not generate a valid tool from that description.");
                }
            } catch (e) {
                console.error("Generation failed", e);
                alert("Tool generation failed.");
            } finally {
                setIsGeneratingApp(false);
            }
            return;
        }
    }

    if (priorityMode === 'CRITICAL') {
        const securityCheck = await GeminiService.analyzeSecurityRisk(trimmedInput);
        if (!securityCheck.authorized) {
            alert(`SECURITY BLOCK: ${securityCheck.reason}`);
            return;
        }
    }
    
    // Send Message
    onSendMessage(chat.id, trimmedInput, 'text', priorityMode, undefined, isStealthMode);
    setInputValue('');
    setPriorityMode('NORMAL');
    // Don't disable stealth mode automatically, keep it sticky
  };

  const handleRewrite = async (tone: 'DIPLOMATIC' | 'URGENT' | 'ENCRYPTED') => {
      if (!inputValue.trim()) return;
      setIsRewriting(true);
      const refined = await GeminiService.refineDraft(inputValue, tone);
      setInputValue(refined);
      setIsRewriting(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
          const base64 = reader.result as string;
          onSendMessage(chat.id, base64, 'image', priorityMode, undefined, isStealthMode);
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyzeImage = async (msg: Message) => {
      if (!onUpdateMessage) return;
      setAnalyzingImageId(msg.id);
      const base64Data = msg.content.split(',')[1] || msg.content;
      const result = await GeminiService.analyzeImageIntel(base64Data);
      
      onUpdateMessage(chat.id, msg.id, { 
          imageAnalysis: {
              threatLevel: result.threatLevel,
              analysis: result.analysis,
              details: result.details
          }
      });
      setAnalyzingImageId(null);
  };

  const handleSendMiniApp = (type: 'POLL' | 'VOTE') => {
      onSendMessage(chat.id, "Interactive Widget", 'mini-app', 'NORMAL', {
          type,
          title: type === 'VOTE' ? 'Strategic Council Vote' : 'Quick Poll',
          options: ['Option A', 'Option B'],
          votes: {}
      }, isStealthMode);
      setShowMiniAppMenu(false);
  }

  const handleCreateAIApp = async () => {
      const prompt = window.prompt("Describe the temporary tool you need (e.g., 'A voice recorder', 'A photo evidence cam', 'A presentation maker'):");
      if (!prompt) return;

      setIsGeneratingApp(true);
      const config = await GeminiService.generateMiniAppConfig(prompt);
      setIsGeneratingApp(false);

      if (config) {
          onSendMessage(chat.id, "Generated Tool", 'mini-app', 'NORMAL', {
              type: 'GENERATED_APP',
              title: config.title,
              config: config
          }, isStealthMode);
          setShowMiniAppMenu(false);
      } else {
          alert("Failed to generate app. Please try a different description.");
      }
  };

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
                    <X size={24} />
                </button>
                <img src={chatAvatar} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                <div>
                    <h2 className="text-slate-200 font-semibold flex items-center gap-2">
                        {chatName}
                        {isQuantum && <Lock size={12} className="text-emerald-400" />}
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
            className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 relative"
            style={{ 
                backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                backgroundRepeat: 'repeat',
                backgroundSize: '400px',
                backgroundBlendMode: 'soft-light',
                backgroundColor: '#0b141a'
            }}
        >
            {/* Stealth Mode Overlay Effect */}
            {isStealthMode && (
                <div className="absolute inset-0 bg-slate-900/10 pointer-events-none z-0 border-[4px] border-slate-700/50"></div>
            )}

            {chat.messages.filter(m => !currentUser.blockedUsers?.includes(m.senderId)).map((msg, index) => {
                const isMe = msg.senderId === currentUser.id;
                const sender = chat.participants.find(p => p.id === msg.senderId) || currentUser;
                const showHeader = isGroup && !isMe && (index === 0 || chat.messages[index - 1].senderId !== msg.senderId);
                const isCritical = msg.priority === 'CRITICAL' || msg.priority === 'EMERGENCY_BROADCAST';
                const hasAnalysis = !!msg.imageAnalysis;

                // Ephemeral Logic
                let timeLeft = 0;
                if (msg.isEphemeral && msg.expiresAt) {
                    timeLeft = Math.max(0, Math.ceil((msg.expiresAt - now) / 1000));
                    if (timeLeft === 0) return null; // Don't render expired messages
                }

                return (
                    <div key={msg.id} className={`flex mb-3 ${isMe ? 'justify-end' : 'justify-start'} group relative z-10`}>
                        <div className={`max-w-[85%] md:max-w-[65%] rounded-lg p-2 px-3 shadow-sm relative text-sm 
                            ${isMe ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-[#202c33] text-slate-200 rounded-tl-none'}
                            ${isCritical ? 'border-2 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}
                            ${msg.isEphemeral ? 'border border-slate-500/50 opacity-90' : ''}
                        `}>
                            {msg.isEphemeral && (
                                <div className="absolute -top-3 right-0 bg-slate-700 text-slate-300 text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                    <Clock size={8}/> {timeLeft}s
                                </div>
                            )}

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
                            
                            <div className="whitespace-pre-wrap leading-relaxed w-full">
                                {msg.type === 'image' ? (
                                    <div className="relative group/image">
                                        <img src={msg.content} alt="Upload" className={`rounded-lg max-w-full max-h-80 object-cover border border-slate-700 ${msg.isEphemeral ? 'blur-sm hover:blur-none transition' : ''}`} />
                                        
                                        {!hasAnalysis && !analyzingImageId && (
                                            <button 
                                                onClick={() => handleAnalyzeImage(msg)}
                                                className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-emerald-600 text-white p-2 rounded-full backdrop-blur transition border border-white/20"
                                                title="Run Intel Scan"
                                            >
                                                <ScanEye size={16} />
                                            </button>
                                        )}
                                        {analyzingImageId === msg.id && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                        {hasAnalysis && (
                                            <div className="absolute inset-0 bg-slate-900/90 rounded-lg p-3 text-xs overflow-y-auto animate-fade-in border border-emerald-500/50">
                                                <div className="flex justify-between items-start mb-2 border-b border-emerald-500/30 pb-2">
                                                    <span className="font-bold text-emerald-400 flex items-center gap-1"><ShieldCheck size={12}/> INTEL REPORT</span>
                                                    <button onClick={() => onUpdateMessage && onUpdateMessage(chat.id, msg.id, { imageAnalysis: undefined })}><X size={12}/></button>
                                                </div>
                                                <div className="space-y-1 font-mono">
                                                    <div className={`font-bold ${
                                                        msg.imageAnalysis!.threatLevel === 'CRITICAL' ? 'text-red-500 animate-pulse' : 
                                                        msg.imageAnalysis!.threatLevel === 'HIGH' ? 'text-orange-500' : 'text-green-400'
                                                    }`}>
                                                        THREAT: {msg.imageAnalysis!.threatLevel}
                                                    </div>
                                                    <p className="text-slate-300 italic">{msg.imageAnalysis!.analysis}</p>
                                                    <div className="mt-2 text-cyan-400">
                                                        {msg.imageAnalysis!.details.map((d, i) => <div key={i}>• {d}</div>)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : msg.type === 'mini-app' && msg.miniAppData ? (
                                    <>
                                        {msg.miniAppData.type === 'GENERATED_APP' && msg.miniAppData.config ? (
                                            <div className="w-full min-w-[300px]">
                                                <MiniAppRenderer config={msg.miniAppData.config} />
                                            </div>
                                        ) : (
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
                                        )}
                                    </>
                                ) : translatedMessages[msg.id] ? (
                                    <div className="animate-fade-in">
                                        <div className="flex items-center gap-1 text-xs text-cyan-400 mb-1 border-b border-white/10 pb-1">
                                            <Globe size={10} /> Translated from {sender?.language}
                                        </div>
                                        {translatedMessages[msg.id]}
                                    </div>
                                ) : (
                                    isQuantum ? <QuantumText text={msg.content} /> : msg.content
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
        <div className={`bg-[#202c33] px-4 py-3 flex items-end gap-2 shrink-0 ${priorityMode === 'CRITICAL' ? 'border-t-2 border-red-500' : ''} ${isStealthMode ? 'border-t-2 border-slate-600' : ''}`}>
             <div className="flex flex-col gap-1">
                 <button 
                    onClick={() => setShowMiniAppMenu(!showMiniAppMenu)} 
                    className="text-slate-400 p-2 hover:bg-slate-700 rounded-full transition relative"
                    title="Apps & Tools"
                >
                    <Grid size={24} />
                    {showMiniAppMenu && (
                        <div className="absolute bottom-12 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-56 overflow-hidden z-50 animate-fade-in">
                            <div className="p-2 text-xs text-slate-500 uppercase font-bold bg-slate-900/50">Mini Apps</div>
                            
                            <div onClick={() => handleCreateAIApp()} className="p-3 hover:bg-emerald-900/20 hover:text-emerald-400 text-left text-sm text-slate-200 cursor-pointer flex items-center gap-2 border-b border-slate-700">
                                {isGeneratingApp ? <Loader size={14} className="animate-spin"/> : <Sparkles size={14} className="text-emerald-400" />} 
                                {isGeneratingApp ? "Generating..." : "Create AI Tool"}
                            </div>

                            <div onClick={() => handleSendMiniApp('VOTE')} className="p-3 hover:bg-slate-700 text-left text-sm text-slate-200 cursor-pointer flex items-center gap-2">
                                <ShieldCheck size={14} /> Official Vote
                            </div>
                            <div onClick={() => handleSendMiniApp('POLL')} className="p-3 hover:bg-slate-700 text-left text-sm text-slate-200 cursor-pointer flex items-center gap-2">
                                <MoreVertical size={14} /> Quick Poll
                            </div>
                        </div>
                    )}
                 </button>
                 <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload}
                 />
                 <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="text-slate-400 p-2 hover:bg-slate-700 rounded-full transition"
                    title="Upload Intel Image"
                 >
                     <Paperclip size={24} />
                 </button>
             </div>
             
             <div className="flex-1 bg-[#2a3942] rounded-lg flex flex-col relative group/input">
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={priorityMode === 'CRITICAL' ? "Type EMERGENCY message..." : isStealthMode ? "Type GHOST message (destruct 10s)..." : isRewriting ? "AI Rewriting..." : "Type a message or /genapp..."}
                    className={`w-full bg-transparent text-slate-200 p-3 min-h-[44px] max-h-[120px] outline-none resize-none custom-scrollbar ${isRewriting ? 'opacity-50' : ''}`}
                    rows={1}
                    disabled={isRewriting}
                />
                
                {/* AI Rewrite Tools */}
                {inputValue.length > 3 && (
                    <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 group-hover/input:opacity-100 transition-opacity">
                         <button 
                            onClick={() => handleRewrite('DIPLOMATIC')}
                            className="p-1.5 bg-slate-700 rounded-full text-emerald-400 hover:bg-emerald-900/50 hover:text-white transition"
                            title="Rewrite: Diplomatic"
                         >
                             <Wand2 size={14}/>
                         </button>
                         <button 
                            onClick={() => handleRewrite('URGENT')}
                            className="p-1.5 bg-slate-700 rounded-full text-red-400 hover:bg-red-900/50 hover:text-white transition"
                            title="Rewrite: Urgent Command"
                         >
                             <AlertTriangle size={14}/>
                         </button>
                         <button 
                            onClick={() => handleRewrite('ENCRYPTED')}
                            className="p-1.5 bg-slate-700 rounded-full text-cyan-400 hover:bg-cyan-900/50 hover:text-white transition"
                            title="Rewrite: Encrypted Jargon"
                         >
                             <Lock size={14}/>
                         </button>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1">
                 {/* Stealth Toggle */}
                 <button 
                    onClick={() => setIsStealthMode(!isStealthMode)}
                    className={`p-2 rounded-full transition ${isStealthMode ? 'text-slate-300 bg-slate-600' : 'text-slate-400 hover:bg-slate-700'}`}
                    title="Ghost Mode (10s Self-Destruct)"
                >
                    {isStealthMode ? <Ghost size={20} /> : <EyeOff size={20} />}
                </button>

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