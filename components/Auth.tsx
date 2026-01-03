import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { GeminiService } from '../services/gemini';
import { Camera, Shield, CheckCircle, Smartphone, Globe, ScanFace } from 'lucide-react';
import { NEW_USER_TEMPLATE } from '../services/mockData';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'LOGIN' | 'VERIFY_FORM' | 'FACE_SCAN'>('LOGIN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formData, setFormData] = useState({ name: '', country: 'POWERLINGX' });
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length > 5) {
      setStep('VERIFY_FORM');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('FACE_SCAN');
    startCamera();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setScanStatus("Camera access denied. Please enable camera permissions.");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
  };

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsScanning(true);
    setScanStatus("Scanning biometric data...");

    const context = canvasRef.current.getContext('2d');
    context?.drawImage(videoRef.current, 0, 0, 640, 480);
    const base64Image = canvasRef.current.toDataURL('image/jpeg').split(',')[1];

    const verification = await GeminiService.verifyIdentity(base64Image);

    stopCamera();

    const newUser: User = {
      ...NEW_USER_TEMPLATE,
      id: `u_${Date.now()}`,
      phoneNumber,
      name: formData.name,
      country: formData.country as any,
      isVerified: true
    };

    if (verification.verified && verification.identityName) {
      setScanStatus(`IDENTITY CONFIRMED: ${verification.identityName}`);
      
      newUser.name = verification.identityName; // Override name with Verified ID
      newUser.role = 'ADMIN';
      newUser.securityLevel = 5;
      newUser.adminChannels = verification.adminChannels;
      newUser.trustScore = 100;
      
      // Dramatic pause for effect
      setTimeout(() => {
        onLogin(newUser);
      }, 2000);
    } else {
      setScanStatus("Identity not recognized as High Command. Standard Citizen Access granted.");
      newUser.role = 'CITIZEN';
      newUser.securityLevel = 1;
      setTimeout(() => {
        onLogin(newUser);
      }, 2000);
    }
    
    setIsScanning(false);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0c1317] text-slate-200">
      <div className="w-full max-w-md p-8 bg-[#1f2c34] rounded-xl shadow-2xl border border-slate-700">
        
        {/* Header */}
        <div className="text-center mb-8">
            <h1 className="text-3xl font-light tracking-widest text-emerald-500 mb-2">SIGMAX<span className="font-bold text-white">CONNECT</span></h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Secure Quantum Uplink Node</p>
        </div>

        {step === 'LOGIN' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <label className="text-sm text-slate-400 flex items-center gap-2"><Smartphone size={16}/> Mobile Number</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="w-20 bg-[#2a3942] rounded p-3 text-slate-200 outline-none border border-slate-600 text-center"
                  placeholder="+000"
                  defaultValue="+1"
                />
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="flex-1 bg-[#2a3942] rounded p-3 text-slate-200 outline-none border border-slate-600"
                  placeholder="Enter number"
                  required
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded transition shadow-lg shadow-emerald-900/50">
              Establish Connection
            </button>
          </form>
        )}

        {step === 'VERIFY_FORM' && (
           <form onSubmit={handleFormSubmit} className="space-y-4 animate-fade-in">
             <h2 className="text-xl text-slate-200 mb-4 flex items-center gap-2"><Globe size={20} /> Citizen Verification</h2>
             <div>
               <label className="text-xs text-slate-400">Full Name</label>
               <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#2a3942] rounded p-3 mt-1 text-slate-200 outline-none border border-slate-600"
                  required
                />
             </div>
             <div>
               <label className="text-xs text-slate-400">Country of Origin</label>
               <select 
                  value={formData.country}
                  onChange={e => setFormData({...formData, country: e.target.value})}
                  className="w-full bg-[#2a3942] rounded p-3 mt-1 text-slate-200 outline-none border border-slate-600"
                >
                  <option value="POWERLINGX">POWERLINGX</option>
                  <option value="TAIQ">TAIQ</option>
                  <option value="BEL-IQ-Z">BEL-IQ-Z</option>
                  <option value="SAVIROM">SAVIROM</option>
                  <option value="DIAMONDAURA">DIAMONDAURA</option>
                  <option value="LING-DYNOMAX">LING-DYNOMAX</option>
               </select>
             </div>
             <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded transition mt-4">
               Proceed to Biometrics
             </button>
           </form>
        )}

        {step === 'FACE_SCAN' && (
          <div className="flex flex-col items-center animate-fade-in">
             <div className="relative w-64 h-64 bg-black rounded-full overflow-hidden border-4 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)] mb-6">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-full animate-pulse"></div>
                {isScanning && (
                    <div className="absolute inset-0 bg-cyan-500/20 grid grid-cols-4 gap-1">
                        {Array.from({length: 16}).map((_, i) => <div key={i} className="border border-cyan-500/10"></div>)}
                    </div>
                )}
             </div>
             <canvas ref={canvasRef} width="640" height="480" className="hidden" />
             
             <p className={`text-center mb-6 font-mono text-sm ${scanStatus.includes('CONFIRMED') ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {scanStatus || "Position face within the grid for AI Analysis"}
             </p>
             
             {!isScanning && !scanStatus.includes('CONFIRMED') && (
                 <button onClick={captureAndVerify} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full transition">
                    <ScanFace size={24} /> Verify Identity
                 </button>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
