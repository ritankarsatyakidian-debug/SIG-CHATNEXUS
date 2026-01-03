import React, { useState } from 'react';
import { ChatSession, User } from '../types';
import { MessageSquare, Settings, Phone, Radio, Lock, UserPlus, Menu, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  chats: ChatSession[];
  currentUser: User;
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: (phone: string, isGroup: boolean) => void;
  onLaunchMeeting: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ chats, currentUser, activeChatId, onSelectChat, onCreateChat, onLaunchMeeting }) => {
  const [activeTab, setActiveTab] = useState<'CHATS' | 'STATUS' | 'CALLS'>('CHATS');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getChatName = (chat: ChatSession) => {
    if (chat.isGroup) return chat.name;
    const partner = chat.participants.find(p => p.id !== currentUser.id) || chat.participants[0];
    return partner?.name;
  };

  const getChatAvatar = (chat: ChatSession) => {
    if (chat.isGroup) return `https://picsum.photos/seed/${chat.id}/200/200`;
    const partner = chat.participants.find(p => p.id !== currentUser.id) || chat.participants[0];
    return partner?.avatar;
  };

  const getLastMessage = (chat: ChatSession) => {
    if (chat.messages.length === 0) return "No messages yet";
    const last = chat.messages[chat.messages.length - 1];
    if (last.type === 'image') return '📷 Photo';
    return last.content;
  };

  const handleCreate = () => {
    if (newChatPhone) {
        onCreateChat(newChatPhone, false);
        setNewChatPhone('');
        setShowNewChatModal(false);
    }
  };

  const handleSearch = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          if (searchTerm.toUpperCase() === 'LING-DYNOMAX') {
              onLaunchMeeting();
              setSearchTerm('');
          }
      }
  };

  return (
    <div className={`flex flex-col border-r border-slate-700 bg-slate-900 h-full relative transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-full md:w-[400px]'}`}>
      
      {/* Collapse Toggle (Desktop) */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="hidden md:flex absolute -right-3 top-20 bg-slate-800 rounded-full p-1 border border-slate-600 text-slate-400 z-50 hover:text-white"
      >
        {isCollapsed ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
      </button>

      {/* Header */}
      <div className={`h-16 bg-slate-800 flex items-center shrink-0 border-b border-slate-700 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative shrink-0">
                <img src={currentUser.avatar} alt="Me" className="w-10 h-10 rounded-full border border-slate-600" />
            </div>
            {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-200 truncate max-w-[150px] text-sm">{currentUser.name}</span>
                    <span className="text-[10px] text-cyan-500 font-mono tracking-wider truncate">{currentUser.role}</span>
                </div>
            )}
        </div>
        {!isCollapsed && (
            <div className="flex gap-4 text-slate-400">
                <button onClick={() => setShowNewChatModal(true)} className="hover:text-emerald-400 transition" title="New Chat"><UserPlus size={20} /></button>
                <button className="hover:text-cyan-400 transition"><Settings size={20} /></button>
            </div>
        )}
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="px-3 py-2 bg-slate-900">
            <div className="bg-slate-800 rounded-lg flex items-center px-3 py-1.5 gap-2 border border-slate-700 focus-within:border-emerald-500 transition">
                <Search size={16} className="text-slate-500"/>
                <input 
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-slate-500" 
                    placeholder="Search or 'LING-DYNOMAX'"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearch}
                />
            </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-slate-900 border-b border-slate-800">
        <button 
            onClick={() => setActiveTab('CHATS')}
            className={`flex-1 py-3 text-sm font-medium transition flex justify-center items-center gap-2 ${activeTab === 'CHATS' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
            title="Chats"
        >
            <MessageSquare size={16} /> {!isCollapsed && "Chats"}
        </button>
        <button 
            onClick={() => setActiveTab('STATUS')}
            className={`flex-1 py-3 text-sm font-medium transition flex justify-center items-center gap-2 ${activeTab === 'STATUS' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
             title="Broadcasts"
        >
            <Radio size={16} /> {!isCollapsed && "Broadcasts"}
        </button>
        <button 
            onClick={() => setActiveTab('CALLS')}
            className={`flex-1 py-3 text-sm font-medium transition flex justify-center items-center gap-2 ${activeTab === 'CALLS' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
             title="Calls"
        >
            <Phone size={16} /> {!isCollapsed && "Calls"}
        </button>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'CHATS' && chats.map(chat => {
          const isActive = activeChatId === chat.id;
          const isCritical = chat.messages[chat.messages.length - 1]?.priority === 'CRITICAL';
          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`flex items-center gap-3 p-3 cursor-pointer transition border-b border-slate-800 relative group ${
                  isActive ? 'bg-slate-800' : 'hover:bg-slate-800/50'
              } ${isCritical ? 'bg-red-900/10' : ''} ${isCollapsed ? 'justify-center' : ''}`}
            >
              <div className="relative shrink-0">
                <img src={getChatAvatar(chat)} alt="Avatar" className={`w-12 h-12 rounded-full object-cover ${chat.adminOnly ? 'border-2 border-red-500' : ''}`} />
                {chat.adminOnly && <div className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5"><Lock size={10} className="text-white"/></div>}
                {chat.unreadCount > 0 && isCollapsed && (
                     <div className="absolute -top-1 -left-1 bg-emerald-500 text-slate-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {chat.unreadCount}
                     </div>
                )}
              </div>
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                        <h3 className={`font-medium truncate ${isCritical ? 'text-red-400' : 'text-slate-200'}`}>{getChatName(chat)}</h3>
                        <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(chat.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className={`text-sm truncate pr-2 ${isCritical ? 'text-red-300/80 font-bold' : 'text-slate-400'}`}>
                            {getLastMessage(chat)}
                        </p>
                        {chat.unreadCount > 0 && (
                            <div className="bg-emerald-500 text-slate-900 text-xs font-bold min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full">
                                {chat.unreadCount}
                            </div>
                        )}
                    </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="absolute inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-6 rounded-lg w-full shadow-2xl border border-slate-700 animate-fade-in">
                <h3 className="text-lg text-white mb-4">Start New Communication</h3>
                <input 
                    type="text" 
                    placeholder="Enter Secure Phone Number" 
                    value={newChatPhone}
                    onChange={e => setNewChatPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 p-3 rounded text-white mb-4 outline-none focus:border-emerald-500"
                />
                <div className="flex gap-2">
                    <button onClick={() => setShowNewChatModal(false)} className="flex-1 py-2 text-slate-400 hover:text-white">Cancel</button>
                    <button onClick={handleCreate} className="flex-1 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500">Connect</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
