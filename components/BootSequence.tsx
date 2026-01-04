import React, { useState, useEffect } from 'react';
import { ShieldCheck, Satellite, Radio, Lock } from 'lucide-react';

export const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    const LOGS = [
        "INITIALIZING SIGMAX KERNEL v9.4...",
        "ESTABLISHING SATELLITE UPLINK (NODE: TAIQ-7)...",
        "HANDSHAKE ACCEPTED. ENCRYPTION: QUANTUM-256...",
        "BIOMETRIC PROTOCOLS LOADED.",
        "ACCESS GRANTED."
    ];

    useEffect(() => {
        const timers = [
            setTimeout(() => setStep(1), 1000),
            setTimeout(() => setStep(2), 2500),
            setTimeout(() => setStep(3), 4000),
            setTimeout(() => setStep(4), 5000),
            setTimeout(() => {
                setStep(5);
                setTimeout(onComplete, 800); 
            }, 6000)
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-black text-emerald-500 font-mono flex flex-col items-center justify-center p-8">
            <div className="max-w-md w-full">
                <div className="flex justify-between items-end border-b border-emerald-900 pb-2 mb-4">
                    <h1 className="text-2xl font-bold tracking-widest">SIGMAX<span className="animate-pulse">_OS</span></h1>
                    <span className="text-xs">SECURE BOOT</span>
                </div>
                
                <div className="space-y-2 mb-8 h-32">
                    {LOGS.map((log, i) => (
                        <div key={i} className={`text-xs ${i > step ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
                            <span className="text-emerald-800 mr-2">{`[${String(i).padStart(2, '0')}]`}</span>
                            {log}
                        </div>
                    ))}
                </div>

                <div className="flex justify-center gap-8 text-emerald-800">
                    <Satellite size={32} className={`transition duration-1000 ${step >= 1 ? 'text-emerald-400 animate-pulse' : ''}`} />
                    <Radio size={32} className={`transition duration-1000 ${step >= 2 ? 'text-emerald-400 animate-pulse' : ''}`} />
                    <Lock size={32} className={`transition duration-1000 ${step >= 3 ? 'text-emerald-400' : ''}`} />
                    <ShieldCheck size={32} className={`transition duration-1000 ${step >= 4 ? 'text-emerald-400' : ''}`} />
                </div>

                <div className="mt-8 h-1 bg-emerald-900 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981] transition-all duration-[6000ms] ease-linear"
                        style={{ width: step === 5 ? '100%' : '0%' }}
                    ></div>
                </div>
            </div>
        </div>
    );
};