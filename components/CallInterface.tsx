import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User } from 'lucide-react';
import { User as UserType } from '../types';

interface CallInterfaceProps {
  partner: UserType;
  onEndCall: () => void;
  isVideo: boolean;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({ partner, onEndCall, isVideo }) => {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(isVideo);
  const [connectionState, setConnectionState] = useState('Connecting...');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCall = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: cameraOn, 
            audio: true 
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Simulate connection delay
        setTimeout(() => {
            setConnectionState('Connected');
            // In a real app, this is where we'd attach the remote stream from WebRTC
        }, 1500);

      } catch (err) {
        console.error("Error accessing media devices:", err);
        setConnectionState('Device Access Failed');
      }
    };

    startCall();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [cameraOn]); // Restart stream if camera toggled

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
        {/* Remote View (Simulated) */}
        <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
            {connectionState === 'Connected' ? (
                <div className="text-center animate-pulse">
                    <div className="w-32 h-32 rounded-full bg-slate-700 mx-auto mb-4 overflow-hidden border-4 border-emerald-500">
                        <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover"/>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{partner.name}</h2>
                    <p className="text-emerald-400">00:12</p>
                </div>
            ) : (
                <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-slate-800 mx-auto mb-4 animate-ping opacity-75"></div>
                    <p className="text-slate-400">{connectionState}</p>
                </div>
            )}

            {/* Local View (Picture in Picture) */}
            <div className="absolute top-4 right-4 w-32 h-48 bg-black rounded-lg border border-slate-700 overflow-hidden shadow-2xl">
                {cameraOn ? (
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                        <VideoOff size={24}/>
                    </div>
                )}
            </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
            <button 
                onClick={() => setMicOn(!micOn)} 
                className={`p-4 rounded-full shadow-lg transition transform hover:scale-110 ${micOn ? 'bg-slate-700 text-white' : 'bg-white text-slate-900'}`}
            >
                {micOn ? <Mic /> : <MicOff />}
            </button>
            <button 
                onClick={() => setCameraOn(!cameraOn)} 
                className={`p-4 rounded-full shadow-lg transition transform hover:scale-110 ${cameraOn ? 'bg-slate-700 text-white' : 'bg-white text-slate-900'}`}
            >
                {cameraOn ? <Video /> : <VideoOff />}
            </button>
            <button 
                onClick={onEndCall} 
                className="p-4 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-500 transition transform hover:scale-110"
            >
                <PhoneOff />
            </button>
        </div>
    </div>
  );
};