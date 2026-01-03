import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { RightPanel } from './components/RightPanel';
import { Auth } from './components/Auth';
import { Terminal } from './components/Terminal';
import { MeetingRoom } from './components/MeetingRoom';
import { CallInterface } from './components/CallInterface';
import { ChatSession, Message, MessagePriority, User } from './types';
import { INITIAL_CHATS, NEW_USER_TEMPLATE } from './services/mockData';
import { StorageService } from './services/storage';
import { GeminiService } from './services/gemini';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Feature States
  const [showTerminal, setShowTerminal] = useState(false);
  const [showMeetingRoom, setShowMeetingRoom] = useState(false);
  
  // Call State
  const [activeCall, setActiveCall] = useState<{partner: User, isVideo: boolean} | null>(null);

  // Helper to securely filter chats based on user role and permissions
  const filterChats = useCallback((allChats: ChatSession[], user: User | null) => {
    if (!user) return [];
    return allChats.filter(chat => {
      // Public/Direct chats are visible to participants (or everyone in this demo context if public)
      if (!chat.adminOnly) return true;
      if (chat.id === 'c_broadcasts') return true; // Everyone sees broadcasts
      
      // Admin channels require explicit permission in the user's adminChannels list
      return user.adminChannels?.includes(chat.id);
    });
  }, []);

  // 1. Initial Load
  useEffect(() => {
    const savedUser = StorageService.getUser();
    if (savedUser) {
      setCurrentUser(savedUser);
      const allChats = StorageService.getChats();
      // IMMEDIATE SECURITY CHECK: Filter right on load
      setChats(filterChats(allChats, savedUser));
    }

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [filterChats]);

  // 2. Real-Time Sync (Cross-Tab Communication)
  // We depend on currentUser to ensure we filter incoming storage events correctly for THIS user
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'sigmax_chats_v1' && e.newValue) {
            const newChats = JSON.parse(e.newValue);
            if (currentUser) {
                // Apply security filter to incoming updates
                setChats(filterChats(newChats, currentUser));
            }
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser, filterChats]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    StorageService.saveUser(user);
    
    // Load chats and filter immediately
    const allChats = StorageService.getChats();
    setChats(filterChats(allChats, user));
  };

  const handleSendMessage = (chatId: string, content: string, type: 'text' | 'image' | 'mini-app' = 'text', priority: MessagePriority = 'NORMAL', miniAppData?: any) => {
    if (!currentUser) return;

    const currentChats = StorageService.getChats(); // Get latest from storage to avoid conflicts
    const activeChat = currentChats.find(c => c.id === chatId);
    const dest = activeChat?.isGroup ? 'MULTI' : activeChat?.participants.find(p => p.id !== currentUser.id)?.country || 'UNKNOWN';
    
    const newMessage: Message = {
      id: `m${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: currentUser.id,
      content,
      timestamp: Date.now(),
      type,
      priority,
      originCountry: currentUser.country,
      destCountry: dest,
      miniAppData
    };

    const updatedChats = currentChats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessageTimestamp: newMessage.timestamp,
          unreadCount: 0 // We read our own message
        };
      }
      return chat;
    }).sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);

    StorageService.saveChats(updatedChats);
    // Local state update (filtered)
    setChats(filterChats(updatedChats, currentUser));
  };

  const handleUpdateMessage = (chatId: string, messageId: string, updates: Partial<Message>) => {
      if (!currentUser) return;
      const currentChats = StorageService.getChats();
      const updatedChats = currentChats.map(chat => {
          if (chat.id === chatId) {
              const updatedMessages = chat.messages.map(m => m.id === messageId ? { ...m, ...updates } : m);
              return { ...chat, messages: updatedMessages };
          }
          return chat;
      });
      StorageService.saveChats(updatedChats);
      setChats(filterChats(updatedChats, currentUser));
  };

  const handleReaction = (chatId: string, messageId: string, emoji: string) => {
    if (!currentUser) return;
    
    const currentChats = StorageService.getChats();
    const updatedChats = currentChats.map(chat => {
        if (chat.id === chatId) {
            const updatedMessages = chat.messages.map(msg => {
                if (msg.id === messageId) {
                    const reactions = msg.reactions || {};
                    const users = reactions[emoji] || [];
                    let newUsers = users.includes(currentUser.id) 
                        ? users.filter(id => id !== currentUser.id)
                        : [...users, currentUser.id];

                    const newReactions = { ...reactions, [emoji]: newUsers };
                    if (newUsers.length === 0) delete newReactions[emoji];

                    return { ...msg, reactions: newReactions };
                }
                return msg;
            });
            return { ...chat, messages: updatedMessages };
        }
        return chat;
    });
    
    StorageService.saveChats(updatedChats);
    setChats(filterChats(updatedChats, currentUser));
  };

  const handleCreateChat = (phone: string, isGroup: boolean) => {
      if (!currentUser) return;
      const currentChats = StorageService.getChats();
      
      const participant = { 
          ...NEW_USER_TEMPLATE, 
          id: `u_${phone.replace(/\D/g, '')}`, 
          name: phone, 
          phoneNumber: phone, 
          status: 'Available' 
      };

      const newChat: ChatSession = {
          id: `c_${Date.now()}`,
          participants: [participant],
          messages: [],
          lastMessageTimestamp: Date.now(),
          unreadCount: 0,
          isGroup: isGroup,
          name: isGroup ? "New Group" : undefined,
          type: isGroup ? 'GROUP' : 'DIRECT',
          encryptionLevel: 'STANDARD'
      };

      const newChats = [newChat, ...currentChats];
      StorageService.saveChats(newChats);
      setChats(filterChats(newChats, currentUser));
      setActiveChatId(newChat.id);
  };

  const handleMeetingEnd = async (transcript?: string) => {
      setShowMeetingRoom(false);
      if (transcript && currentUser) {
          const summary = await GeminiService.summarizeMeeting(transcript);
          
          // Find or create a "Meeting Logs" chat
          const currentChats = StorageService.getChats();
          let logChat = currentChats.find(c => c.name === 'Meeting Logs');
          
          if (!logChat) {
              logChat = {
                  id: 'c_meetings',
                  participants: [currentUser],
                  messages: [],
                  lastMessageTimestamp: Date.now(),
                  unreadCount: 0,
                  isGroup: true,
                  name: 'Meeting Logs',
                  type: 'GROUP',
                  encryptionLevel: 'MILITARY_GRADE',
                  adminOnly: false
              };
              currentChats.unshift(logChat);
          }
          
          // Add summary message
          const newMessage: Message = {
            id: `m_summary_${Date.now()}`,
            senderId: 'system_admin',
            content: `**CONFERENCE SUMMARY**\n\n${summary}`,
            timestamp: Date.now(),
            type: 'text',
            priority: 'NORMAL'
          };
          
          const updatedChats = currentChats.map(c => {
              if (c.id === logChat!.id) {
                  return { ...c, messages: [...c.messages, newMessage], lastMessageTimestamp: Date.now() };
              }
              return c;
          });
          
          StorageService.saveChats(updatedChats);
          setChats(filterChats(updatedChats, currentUser));
          setActiveChatId(logChat.id); // Navigate to logs
      }
  };

  const handleStartCall = (userId: string, isVideo: boolean) => {
      // Find the user object from existing chats
      const currentChats = StorageService.getChats();
      let partner: User | undefined;
      
      for(const chat of currentChats) {
          const found = chat.participants.find(p => p.id === userId);
          if(found) {
              partner = found;
              break;
          }
      }

      if(partner) {
          setActiveCall({ partner, isVideo });
      } else {
          alert("Contact not found.");
      }
  };

  const handleBroadcast = (content: string) => {
      if(!currentUser) return;
      handleSendMessage('c_broadcasts', content, 'text', 'NORMAL');
  };

  // --- Admin & Blocking Features ---

  const handleBlockUser = (userId: string) => {
      if (!currentUser) return;
      const blocked = currentUser.blockedUsers || [];
      const updatedUser = { ...currentUser, blockedUsers: [...blocked, userId] };
      setCurrentUser(updatedUser);
      StorageService.saveUser(updatedUser);
      alert("User blocked. You will no longer see their messages.");
  };

  const handleAddUserToGroup = (chatId: string, phone: string) => {
      const currentChats = StorageService.getChats();
      const updatedChats = currentChats.map(chat => {
          if (chat.id === chatId) {
               const newUser = { 
                   ...NEW_USER_TEMPLATE, 
                   id: `u_${phone.replace(/\D/g, '')}`, 
                   name: phone, 
                   phoneNumber: phone 
               };
               return { ...chat, participants: [...chat.participants, newUser] };
          }
          return chat;
      });
      StorageService.saveChats(updatedChats);
      setChats(filterChats(updatedChats, currentUser));
  };

  const handleRemoveUserFromGroup = (chatId: string, userId: string) => {
      const currentChats = StorageService.getChats();
      const updatedChats = currentChats.map(chat => {
          if (chat.id === chatId) {
               return { ...chat, participants: chat.participants.filter(p => p.id !== userId) };
          }
          return chat;
      });
      StorageService.saveChats(updatedChats);
      setChats(filterChats(updatedChats, currentUser));
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  // --- View Rendering ---

  if (activeCall) {
      return (
          <CallInterface 
            partner={activeCall.partner} 
            isVideo={activeCall.isVideo} 
            onEndCall={() => setActiveCall(null)}
          />
      );
  }

  if (showTerminal) {
      return <Terminal onClose={() => setShowTerminal(false)} currentUser={currentUser} />;
  }

  if (showMeetingRoom) {
      return <MeetingRoom onLeave={handleMeetingEnd} currentUser={currentUser} />;
  }

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  return (
    <div className="flex h-screen w-screen bg-[#0c1317] text-slate-200 overflow-hidden font-sans">
      <div className={`${isMobile && activeChatId ? 'hidden' : 'block'} w-full md:w-auto h-full flex shrink-0`}>
        <Sidebar 
            chats={chats} 
            currentUser={currentUser} 
            activeChatId={activeChatId}
            onSelectChat={(id) => { setActiveChatId(id); setShowRightPanel(false); }}
            onCreateChat={handleCreateChat}
            onLaunchMeeting={() => setShowMeetingRoom(true)}
            onStartCall={handleStartCall}
            onBroadcast={handleBroadcast}
        />
      </div>

      <div className={`${isMobile && !activeChatId ? 'hidden' : 'block'} flex-1 h-full relative flex`}>
        {activeChat ? (
            <>
                <div className="flex-1 flex flex-col min-w-0">
                    <ChatWindow 
                        chat={activeChat} 
                        currentUser={currentUser}
                        onSendMessage={handleSendMessage}
                        onReactToMessage={handleReaction}
                        onUpdateMessage={handleUpdateMessage}
                        onBack={() => setActiveChatId(null)}
                        toggleInfoPanel={() => setShowRightPanel(!showRightPanel)}
                        onOpenTerminal={() => setShowTerminal(true)}
                        onBlockUser={handleBlockUser}
                        onAddUser={handleAddUserToGroup}
                        onRemoveUser={handleRemoveUserFromGroup}
                        onLaunchMeeting={() => setShowMeetingRoom(true)}
                    />
                </div>
                {showRightPanel && !isMobile && (
                    <RightPanel 
                        chat={activeChat}
                        currentUser={currentUser}
                        onClose={() => setShowRightPanel(false)}
                        onBlockUser={handleBlockUser}
                        onAddUser={handleAddUserToGroup}
                        onRemoveUser={handleRemoveUserFromGroup}
                    />
                )}
          </>
        ) : (
          <div className="hidden md:flex flex-1 h-full flex-col items-center justify-center bg-[#222e35] border-b-[6px] border-emerald-500">
            <div className="w-[300px] text-center animate-fade-in">
                <img src="https://picsum.photos/seed/sigmax_logo/200/200" className="w-48 h-48 mx-auto rounded-full opacity-80 mb-8 grayscale hover:grayscale-0 transition duration-500 shadow-2xl" alt="Sigmax Logo" />
                <h1 className="text-3xl font-light text-slate-200 mb-4 tracking-widest">SIGMAX<span className="font-bold text-emerald-500">CONNECT</span></h1>
                <p className="text-slate-400 text-sm mb-6">Welcome, {currentUser.name}.<br/>Secure Uplink Established.</p>
                <div className="inline-block px-3 py-1 bg-emerald-900/50 rounded-full border border-emerald-700 text-xs text-emerald-400 animate-pulse">
                    LIVE NETWORK ACTIVE
                </div>
            </div>
          </div>
        )}
      </div>
      
      {showRightPanel && isMobile && activeChat && (
        <div className="absolute inset-0 z-50 bg-slate-900">
             <RightPanel 
                chat={activeChat} 
                currentUser={currentUser} 
                onClose={() => setShowRightPanel(false)}
                onBlockUser={handleBlockUser}
                onAddUser={handleAddUserToGroup}
                onRemoveUser={handleRemoveUserFromGroup}
            />
        </div>
      )}
    </div>
  );
};

export default App;