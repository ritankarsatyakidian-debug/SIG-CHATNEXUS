import React, { useState, useRef, useEffect } from 'react';
import { MiniAppConfig } from '../types';
import { Camera, Video, Mic, StopCircle, Save, X, Type, PenTool, Layout, Plus, ChevronLeft, ChevronRight, Download, Eraser, Play } from 'lucide-react';

interface MiniAppRendererProps {
  config: MiniAppConfig;
}

export const MiniAppRenderer: React.FC<MiniAppRendererProps> = ({ config }) => {
  if (config.appType === 'CAMERA') return <CameraApp config={config} />;
  if (config.appType === 'RECORDER') return <RecorderApp config={config} />;
  if (config.appType === 'NOTEBOOK') return <NotebookApp config={config} />;
  if (config.appType === 'WHITEBOARD') return <WhiteboardApp config={config} />;
  if (config.appType === 'PRESENTATION') return <PresentationApp config={config} />;
  if (config.appType === 'FORM') return <FormApp config={config} />;
  return <div className="text-red-500">Unknown App Type</div>;
};

// --- Sub Components ---

const CameraApp: React.FC<{config: MiniAppConfig}> = ({ config }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(s);
            if (videoRef.current) videoRef.current.srcObject = s;
        } catch (e) { console.error(e); }
    };

    const stopCamera = () => {
        stream?.getTracks().forEach(t => t.stop());
    };

    const capture = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        setCapturedImage(canvas.toDataURL('image/jpeg'));
    };

    return (
        <div className="bg-black/90 rounded-lg overflow-hidden border border-slate-700 text-white min-h-[300px] flex flex-col">
            <div className="p-2 bg-slate-800 flex justify-between items-center">
                <span className="font-bold flex items-center gap-2"><Camera size={16}/> {config.title}</span>
            </div>
            <div className="flex-1 relative bg-black flex items-center justify-center">
                {capturedImage ? (
                    <img src={capturedImage} className="max-h-[300px] w-auto" />
                ) : (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover max-h-[300px]" />
                )}
            </div>
            <div className="p-4 flex justify-center gap-4 bg-slate-900">
                {capturedImage ? (
                    <button onClick={() => setCapturedImage(null)} className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600">Retake</button>
                ) : (
                    <button onClick={capture} className="w-12 h-12 bg-red-600 rounded-full border-4 border-white shadow-lg hover:bg-red-500"></button>
                )}
            </div>
        </div>
    );
};

const RecorderApp: React.FC<{config: MiniAppConfig}> = ({ config }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream);
            chunksRef.current = [];
            
            mr.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            
            mr.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                stream.getTracks().forEach(t => t.stop());
            };
            
            mr.start();
            mediaRecorderRef.current = mr;
            setIsRecording(true);
        }
    };

    return (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-600 text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Mic size={16}/> {config.title}</h3>
            <div className="flex flex-col items-center justify-center gap-6 py-6">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500/20 animate-pulse' : 'bg-slate-700'}`}>
                    <Mic size={48} className={isRecording ? 'text-red-500' : 'text-slate-400'} />
                </div>
                {audioUrl && (
                    <audio controls src={audioUrl} className="w-full h-10" />
                )}
                <button 
                    onClick={toggleRecording}
                    className={`px-8 py-3 rounded-full font-bold shadow-lg transition ${isRecording ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
            </div>
        </div>
    );
};

const NotebookApp: React.FC<{config: MiniAppConfig}> = ({ config }) => {
    const [text, setText] = useState('');
    
    return (
        <div className="bg-[#fff9c4] text-slate-900 rounded-lg overflow-hidden border border-yellow-500/50 shadow-lg flex flex-col h-[300px]">
             <div className="bg-yellow-200 p-2 flex justify-between items-center border-b border-yellow-300">
                 <span className="font-bold text-yellow-900 flex items-center gap-2"><Type size={14}/> {config.title}</span>
                 <button className="text-yellow-800 hover:text-black"><Save size={16}/></button>
             </div>
             <textarea 
                className="flex-1 bg-transparent p-4 outline-none resize-none font-mono text-sm leading-relaxed" 
                placeholder="Start typing..."
                value={text}
                onChange={e => setText(e.target.value)}
             />
        </div>
    );
};

const WhiteboardApp: React.FC<{config: MiniAppConfig}> = ({ config }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ffffff');

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
            ctx.fillStyle = '#1e293b'; // slate-800
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }, []);

    const startDraw = (e: React.MouseEvent) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
    };

    return (
        <div className="bg-slate-800 rounded-lg border border-slate-600 overflow-hidden">
             <div className="p-2 bg-slate-700 flex justify-between items-center">
                 <span className="font-bold text-slate-200 flex items-center gap-2"><PenTool size={14}/> {config.title}</span>
                 <div className="flex gap-2">
                     {['#ffffff', '#ef4444', '#3b82f6', '#22c55e', '#eab308'].map(c => (
                         <button 
                            key={c} 
                            onClick={() => setColor(c)}
                            className={`w-4 h-4 rounded-full border border-slate-500 ${color === c ? 'ring-2 ring-white' : ''}`}
                            style={{backgroundColor: c}}
                         />
                     ))}
                     <button onClick={() => {
                         const ctx = canvasRef.current?.getContext('2d');
                         if(ctx && canvasRef.current) ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                     }} className="ml-2 text-slate-400 hover:text-white"><Eraser size={14}/></button>
                 </div>
             </div>
             <canvas 
                ref={canvasRef}
                width={300}
                height={250}
                className="w-full cursor-crosshair touch-none"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={() => setIsDrawing(false)}
                onMouseLeave={() => setIsDrawing(false)}
             />
        </div>
    );
};

const PresentationApp: React.FC<{config: MiniAppConfig}> = ({ config }) => {
    const [slides, setSlides] = useState([{title: 'Slide 1', content: ''}]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const addSlide = () => {
        setSlides([...slides, {title: `Slide ${slides.length + 1}`, content: ''}]);
        setCurrentSlide(slides.length);
    };

    return (
        <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden text-white h-[350px] flex flex-col">
            <div className="p-2 bg-slate-800 flex justify-between items-center border-b border-slate-700">
                <span className="font-bold flex items-center gap-2"><Layout size={14}/> {config.title}</span>
                <span className="text-xs text-slate-400">Slide {currentSlide + 1} / {slides.length}</span>
            </div>
            
            <div className="flex-1 p-6 flex flex-col bg-white text-black overflow-y-auto">
                <input 
                    className="text-2xl font-bold border-b border-gray-300 outline-none pb-2 mb-4 bg-transparent"
                    value={slides[currentSlide].title}
                    onChange={(e) => {
                        const newSlides = [...slides];
                        newSlides[currentSlide].title = e.target.value;
                        setSlides(newSlides);
                    }}
                    placeholder="Slide Title"
                />
                <textarea 
                    className="flex-1 resize-none outline-none text-lg text-gray-700 bg-transparent"
                    placeholder="Click to add text..."
                    value={slides[currentSlide].content}
                    onChange={(e) => {
                         const newSlides = [...slides];
                         newSlides[currentSlide].content = e.target.value;
                         setSlides(newSlides);
                    }}
                />
            </div>

            <div className="p-3 bg-slate-800 flex justify-between items-center">
                <button 
                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                    disabled={currentSlide === 0}
                    className="p-2 hover:bg-slate-700 rounded disabled:opacity-30"
                >
                    <ChevronLeft size={20}/>
                </button>
                <button onClick={addSlide} className="flex items-center gap-1 text-xs bg-emerald-600 px-3 py-1 rounded hover:bg-emerald-500">
                    <Plus size={12}/> New Slide
                </button>
                <button 
                    onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                    disabled={currentSlide === slides.length - 1}
                    className="p-2 hover:bg-slate-700 rounded disabled:opacity-30"
                >
                    <ChevronRight size={20}/>
                </button>
            </div>
        </div>
    );
};

const FormApp: React.FC<{config: MiniAppConfig}> = ({ config }) => {
    return (
        <div className="bg-white text-slate-900 rounded-lg p-4 shadow-lg border-t-4 border-cyan-600">
            <h3 className="font-bold text-lg mb-1">{config.title}</h3>
            <p className="text-slate-500 text-sm mb-4">{config.description}</p>
            <div className="space-y-3">
                {config.formFields?.map((field, i) => (
                    <div key={i}>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">{field.label}</label>
                        {field.type === 'checkbox' ? (
                            <input type="checkbox" className="w-4 h-4"/>
                        ) : (
                            <input 
                                type={field.type} 
                                className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-cyan-500"
                                placeholder={`Enter ${field.label.toLowerCase()}...`}
                            />
                        )}
                    </div>
                ))}
            </div>
            <button className="w-full mt-4 bg-cyan-600 text-white py-2 rounded hover:bg-cyan-700 font-bold text-sm">Submit Data</button>
        </div>
    );
};
