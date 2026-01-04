import React, { useState, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Globe, Cpu, Lock, Check, Code, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface TerminalProps {
  onClose: () => void;
  currentUser: User;
}

type TerminalView = 'ROOT' | 'BROWSER' | 'STUDY_ROOM' | 'LAB' | 'LAPTOP';

export const Terminal: React.FC<TerminalProps> = ({ onClose, currentUser }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>(['SIGMAX SECURE TERMINAL v9.0', 'Initializing...', 'Ready.']);
  const [view, setView] = useState<TerminalView>('ROOT');
  
  // Browser State
  const [browserUrl, setBrowserUrl] = useState('');
  const [showConstitution, setShowConstitution] = useState(false);
  const [signedConstitution, setSignedConstitution] = useState(false);

  // Laptop State
  const [laptopLocked, setLaptopLocked] = useState(true);
  const [keyCardFormed, setKeyCardFormed] = useState(false);
  const [codeBlocks, setCodeBlocks] = useState([
      { id: 1, val: '{ CODE: ALPHA }', connected: false },
      { id: 2, val: '{ CODE: OMEGA }', connected: false },
      { id: 3, val: '{ CODE: SIGMA }', connected: false },
      { id: 4, val: '{ CODE: DELTA }', connected: false }
  ]);
  const [connectedChain, setConnectedChain] = useState<string[]>([]);

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const cmd = input.trim().toUpperCase();
      setOutput([...output, `> ${input}`]);
      
      if (cmd === 'EXIT') onClose();
      else if (cmd === 'CLEAR') setOutput([]);
      else if (cmd === 'HELP') setOutput([...output, 'COMMANDS: POWERLINGX, TAIQ, BEL-IQ-Z, CAPTAIN-COSMIC, EXIT']);
      else if (cmd === 'POWERLINGX') setView('BROWSER');
      else if (cmd === 'TAIQ') setView('STUDY_ROOM');
      else if (cmd === 'BEL-IQ-Z') setView('LAB');
      else if (cmd === 'CAPTAIN-COSMIC') setView('LAPTOP');
      else setOutput([...output, 'Unknown command.']);
      
      setInput('');
    }
  };

  const handleBrowserSearch = () => {
      if (browserUrl.toUpperCase() === 'POWERLIEX') {
          setShowConstitution(true);
      } else {
          alert("404 Not Found");
      }
  };

  const connectBlock = (val: string) => {
      if (connectedChain.includes(val)) return;
      const newChain = [...connectedChain, val];
      setConnectedChain(newChain);
      
      // If all 4 connected, check logic
      if (newChain.length === 4) {
          // Form the Keycard
          setTimeout(() => {
              setKeyCardFormed(true);
          }, 500);
      }
  };

  const swipeKeycard = () => {
      if (!keyCardFormed) return;
      // Unlock
      setLaptopLocked(false);
  };

  if (view === 'BROWSER') {
      return (
          <div className="fixed inset-0 z-[60] bg-slate-100 text-slate-900 flex flex-col font-sans">
              <div className="h-12 bg-slate-200 border-b border-slate-300 flex items-center px-4 gap-4">
                  <button onClick={() => setView('ROOT')} className="p-1 hover:bg-slate-300 rounded"><X/></button>
                  <div className="flex-1 bg-white border border-slate-300 rounded px-3 py-1 text-sm flex items-center gap-2">
                      <Globe size={14} className="text-slate-400"/>
                      <input 
                        className="flex-1 outline-none" 
                        value={browserUrl} 
                        onChange={e => setBrowserUrl(e.target.value)} 
                        placeholder="Enter URL (Try: POWERLIEX)"
                        onKeyDown={e => e.key === 'Enter' && handleBrowserSearch()}
                    />
                  </div>
              </div>
              <div className="flex-1 p-8 overflow-y-auto">
                  {showConstitution ? (
                      <div className="max-w-3xl mx-auto bg-[#fdfbf7] p-12 shadow-2xl border border-amber-200">
                          <h1 className="text-4xl font-serif text-amber-900 mb-6 text-center border-b-2 border-amber-900 pb-4">The Constitution of Powerlingx</h1>
                          <div className="prose prose-amber mb-8 font-serif text-justify leading-relaxed">
                              <p>We, the awakened citizens of Powerlingx, hereby establish this alliance to further the technological and magical advancement of the Sigmax territories.</p>
                              <h3 className="font-bold mt-4">Article I: Loyalty to the Alliance</h3>
                              <p>Every citizen pledges their knowledge and strength to the protection of the Sigmax Union.</p>
                              <h3 className="font-bold mt-4">Article II: The Pursuit of Innovation</h3>
                              <p>Science and Magic are one. We strive to unlock the secrets of the cosmos.</p>
                          </div>
                          {signedConstitution ? (
                              <div className="flex flex-col items-center justify-center p-6 border-4 border-green-600 rounded-lg">
                                  <ShieldCheck size={48} className="text-green-600 mb-2"/>
                                  <div className="text-green-600 font-bold text-2xl uppercase tracking-widest">
                                      CITIZENSHIP VERIFIED
                                  </div>
                                  <p className="text-green-800 mt-2 font-mono">ID: {currentUser.id.toUpperCase()}</p>
                              </div>
                          ) : (
                              <button onClick={() => setSignedConstitution(true)} className="w-full py-4 bg-amber-900 text-amber-50 font-serif text-xl hover:bg-amber-800 transition shadow-lg">
                                  SIGN AS {currentUser.name.toUpperCase()}
                              </button>
                          )}
                      </div>
                  ) : (
                      <div className="text-center mt-32 text-slate-400">
                          <Globe size={64} className="mx-auto mb-4 opacity-50"/>
                          <p className="text-2xl font-light">Powerlingx Browser</p>
                          <p className="text-sm">Secure Intranet Gateway</p>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  if (view === 'STUDY_ROOM') {
      return (
          <div className="fixed inset-0 z-[60] bg-[#2d1b15] text-amber-100 relative overflow-hidden" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")'}}>
              <button onClick={() => setView('ROOT')} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded z-20"><X/></button>
              
              <div className="absolute inset-0 flex items-center justify-center">
                  {/* Desk Surface */}
                  <div className="relative w-[90%] h-[80%] bg-[#3e2723] rounded-3xl shadow-2xl p-10 border-8 border-[#1a100c] flex flex-wrap content-center justify-center gap-12">
                      
                      {/* Scattered Papers */}
                      <div className="w-48 h-64 bg-white text-slate-800 shadow-xl rotate-[-12deg] p-4 text-[8px] font-mono absolute top-20 left-20 hover:scale-110 transition cursor-help" title="Sigmax Blueprints">
                          <h3 className="font-bold text-xs border-b border-black mb-2">PROJECT SIGMAX</h3>
                          <p>Phase 1: Uplink</p>
                          <p>Phase 2: Integration</p>
                          <div className="mt-4 border border-slate-300 h-24 bg-blue-50"></div>
                      </div>

                      <div className="w-48 h-64 bg-white text-slate-800 shadow-xl rotate-[5deg] p-4 text-[8px] font-mono absolute bottom-20 right-40 hover:scale-110 transition cursor-help">
                          <h3 className="font-bold text-xs border-b border-black mb-2">TOP SECRET</h3>
                          <p>Target: Ling-Dynomax</p>
                          <p>Status: Negotiations</p>
                      </div>

                      {/* Interactive TAIQ Constitution */}
                      <div className="w-64 h-80 bg-[#f5f5dc] shadow-[0_0_30px_rgba(0,0,0,0.5)] rotate-0 z-10 p-6 border-4 border-amber-900 cursor-pointer hover:scale-105 transition group" onClick={() => alert("TAIQ CONSTITUTION\n\n1. Knowledge is the ultimate weapon.\n2. Unity through understanding.\n3. The past guides the future.")}>
                          <div className="border-b-2 border-amber-900 pb-2 mb-4 text-center">
                              <h2 className="text-2xl font-serif text-amber-900 font-bold">TAIQ</h2>
                              <span className="text-xs text-amber-800 uppercase tracking-widest">Constitution</span>
                          </div>
                          <div className="space-y-2 text-[10px] text-amber-900 text-justify font-serif opacity-80 group-hover:opacity-100">
                              <p>We the people of Taiq, scholars of the ancient world...</p>
                              <p>Hereby declare our intent to preserve history...</p>
                              <div className="h-1 bg-amber-900/20 w-full mt-2"></div>
                              <div className="h-1 bg-amber-900/20 w-3/4"></div>
                              <div className="h-1 bg-amber-900/20 w-1/2"></div>
                          </div>
                          <div className="absolute bottom-6 w-full text-center text-red-700 font-bold opacity-0 group-hover:opacity-100 transition">
                              CLICK TO INSPECT
                          </div>
                      </div>

                  </div>
              </div>
          </div>
      );
  }

  if (view === 'LAB') {
      return (
          <div className="fixed inset-0 z-[60] bg-slate-900 text-cyan-400 font-mono">
              <div className="absolute top-0 left-0 right-0 h-16 bg-slate-800 border-b border-cyan-500/30 flex items-center px-4 justify-between">
                   <h1 className="flex items-center gap-2 text-xl tracking-tighter"><Cpu className="animate-pulse"/> BEL-IQ-Z ADVANCED RESEARCH LAB</h1>
                   <button onClick={() => setView('ROOT')}><X/></button>
              </div>
              <div className="p-8 mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Interactive Software */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                      {['IBHAN', 'RITANKAR', 'SATYAKI', 'DIAN', 'SOUMYADEEPTA'].map((name, i) => (
                          <div key={name} className="bg-slate-800/50 border border-cyan-500/30 p-6 rounded hover:bg-cyan-900/20 cursor-pointer transition group relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-2 opacity-50 text-[10px]">v{9.0 + i}</div>
                              <Code className="mb-4 text-cyan-500 group-hover:text-white transition"/>
                              <h3 className="font-bold text-lg mb-2">{name}_OS</h3>
                              <p className="text-xs text-cyan-500/60">Status: <span className="text-emerald-400">ONLINE</span></p>
                              <div className="mt-4 text-[10px] bg-black/50 p-2 rounded font-mono text-slate-400">
                                  {'>'} System.init()<br/>
                                  {'>'} Module loaded...
                              </div>
                          </div>
                      ))}
                  </div>

                  {/* Powerlingx Browser Link */}
                  <div className="bg-gradient-to-br from-emerald-900 to-slate-900 p-8 rounded-xl border border-emerald-500/50 flex flex-col justify-center items-center text-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                       <Globe size={48} className="text-emerald-400 mb-4 animate-bounce-short"/>
                       <h3 className="text-2xl font-bold text-white mb-2">POWERLINGX NET</h3>
                       <p className="text-emerald-300/70 text-sm mb-6">Secure connection to the constitution mainframe.</p>
                       <button onClick={() => setView('BROWSER')} className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-500 transition shadow-lg flex items-center gap-2">
                           LAUNCH BROWSER <ArrowRight size={16}/>
                       </button>
                  </div>
              </div>
          </div>
      );
  }

  if (view === 'LAPTOP') {
      return (
          <div className="fixed inset-0 z-[60] bg-[#111] flex items-center justify-center p-4">
              <div className="absolute top-4 right-4">
                  <button onClick={() => setView('ROOT')} className="text-red-500 font-mono hover:bg-red-900/20 p-2 rounded border border-red-900/50">[ TERMINATE SESSION ]</button>
              </div>
              
              <div className="relative w-full max-w-4xl aspect-video bg-[#222] rounded-t-xl border-[16px] border-[#333] border-b-0 shadow-2xl flex flex-col">
                  {/* Webcam Dot */}
                  <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-2 h-2 bg-black rounded-full border border-gray-600"></div>

                  {/* Screen */}
                  <div className="flex-1 bg-[#0a0a0a] relative overflow-hidden p-8 font-mono">
                      
                      {laptopLocked ? (
                          <div className="h-full flex flex-col items-center justify-center z-10 relative">
                              <Lock size={64} className="text-red-500 mb-6 animate-pulse"/>
                              <h1 className="text-4xl text-red-500 font-bold mb-2 tracking-widest">SYSTEM LOCKED</h1>
                              <p className="text-slate-500 mb-12">AUTH REQUIRED: CAPTAIN COSMIC KEYCARD</p>

                              {/* Puzzle Area */}
                              {!keyCardFormed ? (
                                  <div className="w-full max-w-xl">
                                      <p className="text-center text-cyan-500 mb-4 text-sm">CONNECT THE CODE FRAGMENTS:</p>
                                      <div className="flex justify-center gap-4 flex-wrap">
                                          {codeBlocks.map(block => (
                                              <button 
                                                key={block.id}
                                                onClick={() => connectBlock(block.val)}
                                                disabled={connectedChain.includes(block.val)}
                                                className={`px-4 py-3 border border-cyan-500/50 rounded bg-cyan-900/10 hover:bg-cyan-500/20 transition ${connectedChain.includes(block.val) ? 'opacity-20 cursor-not-allowed' : ''}`}
                                              >
                                                  {block.val}
                                              </button>
                                          ))}
                                      </div>
                                      <div className="mt-6 h-2 bg-slate-800 rounded-full overflow-hidden">
                                          <div className="h-full bg-cyan-500 transition-all duration-300" style={{width: `${(connectedChain.length / 4) * 100}%`}}></div>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="animate-fade-in flex flex-col items-center">
                                      <div className="w-64 h-40 bg-gradient-to-r from-yellow-600 to-yellow-800 rounded-lg shadow-xl border-t border-yellow-400 flex flex-col justify-between p-4 mb-8 transform hover:scale-105 transition cursor-pointer" onClick={swipeKeycard}>
                                          <div className="text-yellow-200 text-xs font-bold tracking-widest">CAPTAIN COSMIC</div>
                                          <div className="flex gap-2">
                                              {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 bg-yellow-900/50 rounded"></div>)}
                                          </div>
                                          <div className="text-right text-[10px] text-yellow-400">ACCESS LEVEL: OMEGA</div>
                                      </div>
                                      <button onClick={swipeKeycard} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow-[0_0_20px_rgba(22,163,74,0.5)] animate-pulse">
                                          SWIPE KEYCARD TO UNLOCK
                                      </button>
                                  </div>
                              )}
                          </div>
                      ) : (
                          <div className="h-full overflow-y-auto animate-fade-in text-green-400">
                              <div className="border-b border-green-800 pb-4 mb-4 flex justify-between items-end">
                                  <h2 className="text-2xl font-bold">WELCOME, CAPTAIN.</h2>
                                  <div className="text-xs opacity-70">SECURE SERVER: ONLINE</div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-8">
                                  <div className="border border-green-900/50 bg-green-900/10 p-4 rounded">
                                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Globe size={18}/> STRATEGIC ALLIES</h3>
                                      <ul className="space-y-2 text-sm">
                                          <li className="flex items-center gap-2"><Check size={12}/> POWERLINGX</li>
                                          <li className="flex items-center gap-2"><Check size={12}/> TAIQ</li>
                                          <li className="flex items-center gap-2"><Check size={12}/> BEL-IQ-Z</li>
                                          <li className="flex items-center gap-2"><Check size={12}/> LING-DYNOMAX</li>
                                          <li className="flex items-center gap-2"><Check size={12}/> SAVIROM</li>
                                      </ul>
                                  </div>

                                  <div className="border border-green-900/50 bg-green-900/10 p-4 rounded">
                                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Cpu size={18}/> INVENTIONS LOG</h3>
                                      <div className="space-y-4 text-xs font-mono opacity-80">
                                          <div>
                                              <span className="text-green-200 block">{'>>'} PROJECT: INFINITY GAUNTLET</span>
                                              <span className="opacity-50">Status: Classified. Requires 6 stones.</span>
                                          </div>
                                          <div>
                                              <span className="text-green-200 block">{'>>'} PROJECT: SIGMAX CONNECT</span>
                                              <span className="opacity-50">Status: Deployed. Encryption Stable.</span>
                                          </div>
                                          <div>
                                              <span className="text-green-200 block">{'>>'} PROJECT: TIME DILATION</span>
                                              <span className="opacity-50">Status: Theoretical Phase.</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}
                      
                      {/* Scanlines */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
                  </div>
              </div>
              
              {/* Keyboard Deck */}
              <div className="w-full max-w-4xl h-4 bg-[#2a2a2a] rounded-b-xl border border-[#333] border-t-0 mx-auto shadow-2xl"></div>
          </div>
      );
  }

  // Root Terminal
  return (
    <div className="fixed inset-0 z-[50] bg-black font-mono text-green-500 p-8 overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-red-500 hover:text-red-400">[ X ]</button>
        <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar">
                {output.map((line, i) => (
                    <div key={i} className="mb-1">{line}</div>
                ))}
            </div>
            <div className="flex items-center gap-2 border-t border-green-900 pt-4">
                <TerminalIcon size={20} />
                <span className="text-green-300">admin@sigmax:~$</span>
                <input 
                    autoFocus
                    className="flex-1 bg-transparent outline-none text-green-100"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleCommand}
                    placeholder="Enter command..."
                />
            </div>
        </div>
    </div>
  );
};