import React, { useEffect, useState } from 'react';
import { ChatSession, User } from '../types';
import { ShieldCheck, Fingerprint, Lock, FileText, X, UserX, UserPlus, Trash2 } from 'lucide-react';
import { GeminiService } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

interface RightPanelProps {
  chat: ChatSession;
  currentUser: User;
  onClose: () => void;
  onBlockUser?: (userId: string) => void;
  onAddUser?: (chatId: string, phone: string) => void;
  onRemoveUser?: (chatId: string, userId: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ chat, currentUser, onClose, onBlockUser, onAddUser, onRemoveUser }) => {
  const [intelBrief, setIntelBrief] = useState<string>("Generating intelligence report...");
  const isGroup = chat.isGroup;
  const partner = !isGroup ? chat.participants.find(p => p.id !== currentUser.id) : null;
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.adminChannels?.includes(chat.id);
  
  useEffect(() => {
    GeminiService.generateIntelBrief(chat.messages, currentUser).then(setIntelBrief);
  }, [chat.id, chat.messages.length]);

  return (
    <div className="w-[350px] bg-slate-900 border-l border-slate-700 h-full flex flex-col overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800">
            <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
            <h2 className="text-slate-200 font-semibold">Contact Info</h2>
        </div>

        {/* Security Overview */}
        <div className="p-6 text-center border-b border-slate-800">
            <div className="w-24 h-24 mx-auto mb-4 relative">
                {isGroup ? (
                    <img src={`https://picsum.photos/seed/${chat.id}/200/200`} className="rounded-full w-full h-full object-cover" />
                ) : (
                    <img src={partner?.avatar || 'https://picsum.photos/200/200'} className="rounded-full w-full h-full object-cover" />
                )}
                <div className="absolute bottom-0 right-0 bg-emerald-900 text-emerald-400 rounded-full p-1 border-2 border-slate-900">
                    <ShieldCheck size={20} />
                </div>
            </div>
            <h3 className="text-xl text-slate-100 font-medium mb-1">
                {isGroup ? chat.name : partner?.name}
            </h3>
            <p className="text-slate-400 text-sm mb-4">
                {isGroup ? `${chat.participants.length} Participants` : partner?.role}
            </p>

            <div className="grid grid-cols-2 gap-2 text-left">
                <div className="bg-slate-800 p-2 rounded border border-slate-700">
                    <div className="text-[10px] text-slate-500 uppercase">Trust Score</div>
                    <div className="text-emerald-400 font-mono text-lg font-bold flex items-center gap-2">
                        98% <Fingerprint size={16} />
                    </div>
                </div>
                <div className="bg-slate-800 p-2 rounded border border-slate-700">
                    <div className="text-[10px] text-slate-500 uppercase">Encryption</div>
                    <div className="text-cyan-400 font-mono text-lg font-bold flex items-center gap-2">
                        AES-256 <Lock size={16} />
                    </div>
                </div>
            </div>
            
            {!isGroup && partner && onBlockUser && (
                <button 
                    onClick={() => {
                         if(confirm(`Block ${partner.name}?`)) onBlockUser(partner.id);
                    }}
                    className="mt-4 w-full py-2 bg-red-900/30 text-red-400 border border-red-900/50 rounded flex items-center justify-center gap-2 hover:bg-red-900/50 transition"
                >
                    <UserX size={16}/> Block Contact
                </button>
            )}
            
            {isGroup && isAdmin && onAddUser && (
                <button
                    onClick={() => {
                        const phone = prompt("Enter User Phone to Add:");
                        if (phone) onAddUser(chat.id, phone);
                    }}
                    className="mt-4 w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-900/50 rounded flex items-center justify-center gap-2 hover:bg-cyan-900/50 transition"
                >
                    <UserPlus size={16}/> Add Member
                </button>
            )}
        </div>

        {/* AI Intel Brief */}
        <div className="p-4 flex-1">
            <div className="flex items-center gap-2 text-cyan-400 mb-3 font-semibold text-sm">
                <FileText size={16} />
                AI SITUATION REPORT
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg text-sm text-slate-300 border border-slate-700/50 prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{intelBrief}</ReactMarkdown>
            </div>
        </div>

        {/* Participants (if group) */}
        {isGroup && (
            <div className="p-4 border-t border-slate-800">
                <h4 className="text-slate-400 text-xs font-bold uppercase mb-3">Participants</h4>
                {chat.participants.map(p => (
                    <div key={p.id} className="flex items-center gap-3 mb-3 group">
                        <img src={p.avatar} className="w-8 h-8 rounded-full" />
                        <div className="flex-1">
                            <div className="text-slate-200 text-sm">{p.name}</div>
                            <div className="text-slate-500 text-xs">{p.country} • {p.role}</div>
                        </div>
                        {p.securityLevel >= 4 && <ShieldCheck size={14} className="text-emerald-500" />}
                        {isAdmin && onRemoveUser && p.id !== currentUser.id && (
                            <button 
                                onClick={() => onRemoveUser(chat.id, p.id)}
                                className="text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                                title="Remove User"
                            >
                                <Trash2 size={14}/>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};
