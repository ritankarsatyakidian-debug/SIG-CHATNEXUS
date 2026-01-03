import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Users } from 'lucide-react';
import { User } from '../types';

interface MeetingRoomProps {
  onLeave: () => void;
  currentUser: User;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({ onLeave, currentUser }) => {
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [transcripts, setTranscripts] = useState<{user: string, text: string}[]>([]);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Basic Speech Recognition Setup (Web Speech API)
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const text = event.results[event.results.length - 1][0].transcript;
        setTranscripts(prev => [...prev, { user: currentUser.name, text }]);
      };

      setRecognition(recognition);
    }
  }, [currentUser]);

  const toggleMic = () => {
    if (micOn) {
        recognition?.stop();
    } else {
        recognition?.start();
    }
    setMicOn(!micOn);
  };

  return (
    <div className="fixed inset-0 z-[50] bg-[#121212] text-white flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 bg-[#1f1f1f]">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-bold tracking-wider">LING-DYNOMAX SECURE CONFERENCE</span>
            </div>
            <div className="text-sm text-slate-400">00:12:45</div>
        </div>

        {/* Main Grid */}
        <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto">
            {/* Self */}
            <div className="bg-[#2a2a2a] rounded-lg overflow-hidden relative flex items-center justify-center group border-2 border-emerald-500/50">
                {cameraOn ? (
                    <img src={currentUser.avatar} className="w-full h-full object-cover opacity-50" />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-emerald-700 flex items-center justify-center text-2xl font-bold">
                        {currentUser.name.charAt(0)}
                    </div>
                )}
                <div className="absolute bottom-4 left-4 font-bold text-shadow">{currentUser.name} (You)</div>
                <div className="absolute top-4 right-4">
                    {micOn ? <Mic className="text-emerald-500" size={20}/> : <MicOff className="text-red-500" size={20}/>}
                </div>
            </div>

            {/* Simulated Peers */}
            {['TAIQ Representative', 'BEL-IQ-Z Lead', 'SAVIROM Intel', 'DIAMONDAURA Envoy'].map((peer, idx) => (
                <div key={idx} className="bg-[#2a2a2a] rounded-lg overflow-hidden relative flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-400">
                        {peer.charAt(0)}
                    </div>
                    <div className="absolute bottom-4 left-4 font-bold">{peer}</div>
                </div>
            ))}
        </div>

        {/* Transcripts / Chat Overlay */}
        <div className="h-48 bg-[#1f1f1f] border-t border-slate-700 p-4 flex flex-col">
            <h3 className="text-xs uppercase text-slate-500 font-bold mb-2 flex items-center gap-2"><MessageSquare size={12}/> Live Transcript</h3>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                {transcripts.length === 0 && <p className="text-slate-600 italic text-sm">Waiting for speech...</p>}
                {transcripts.map((t, i) => (
                    <div key={i} className="text-sm">
                        <span className="font-bold text-emerald-400">{t.user}:</span> {t.text}
                    </div>
                ))}
            </div>
        </div>

        {/* Controls */}
        <div className="h-20 bg-[#1f1f1f] flex items-center justify-center gap-6">
            <button onClick={toggleMic} className={`p-4 rounded-full transition ${micOn ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'}`}>
                {micOn ? <Mic/> : <MicOff/>}
            </button>
            <button onClick={() => setCameraOn(!cameraOn)} className={`p-4 rounded-full transition ${cameraOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-900 hover:bg-red-800'}`}>
                {cameraOn ? <Video/> : <VideoOff/>}
            </button>
            <button onClick={onLeave} className="p-4 rounded-full bg-red-600 hover:bg-red-500 px-8">
                <PhoneOff/>
            </button>
        </div>
    </div>
  );
};
