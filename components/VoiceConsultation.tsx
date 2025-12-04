
import { Blob, LiveServerMessage, LiveSession } from '@google/genai';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { connectCylexVoice } from '../services/geminiService';
import { BotIcon, LoadingIcon, PodcastIcon, UserIcon, XIcon } from './icons';
import { useLanguage } from './LanguageContext';

// --- Audio Utility Functions --- //
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
type TranscriptEntry = { speaker: 'user' | 'model'; text: string };

interface VoiceConsultationProps {
    onBack: () => void;
}

const VoiceConsultation: React.FC<VoiceConsultationProps> = ({ onBack }) => {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const { t } = useLanguage();

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);
    
    const stopConsultation = useCallback(() => {
        setStatus('disconnected');
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if(outputAudioContextRef.current){
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        if(scriptProcessorRef.current){
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
    }, []);
    
    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            stopConsultation();
        };
    }, [stopConsultation]);

    const handleStartConsultation = async () => {
        setStatus('connecting');
        setTranscript([]);
        let currentInput = "";
        let currentOutput = "";

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            sessionPromiseRef.current = connectCylexVoice({
                onopen: () => {
                    setStatus('connected');
                    setTranscript([{ speaker: 'model', text: t("voice.listening") }]);

                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                    const source = audioContextRef.current.createMediaStreamSource(stream);
                    scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessorRef.current.onaudioprocess = (event) => {
                        const inputData = event.inputBuffer.getChannelData(0);
                        const l = inputData.length;
                        const int16 = new Int16Array(l);
                        for (let i = 0; i < l; i++) {
                            int16[i] = inputData[i] * 32768;
                        }
                        const pcmBlob: Blob = {
                            data: encode(new Uint8Array(int16.buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                    };
                    
                    source.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(audioContextRef.current.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if(message.serverContent?.inputTranscription) {
                        currentInput += message.serverContent.inputTranscription.text;
                    }
                     if(message.serverContent?.outputTranscription) {
                        currentOutput += message.serverContent.outputTranscription.text;
                    }

                    if(message.serverContent?.turnComplete) {
                        setTranscript(prev => [...prev, {speaker: 'user', text: currentInput}, {speaker: 'model', text: currentOutput}]);
                        currentInput = "";
                        currentOutput = "";
                    }

                    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (audioData) {
                        if (!outputAudioContextRef.current) {
                            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                        }
                        const outputCtx = outputAudioContextRef.current;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputCtx.destination);
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                    }
                },
                onclose: () => {
                    setStatus('disconnected');
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Session error:', e);
                    setStatus('error');
                    stopConsultation();
                },
            });
        } catch (error) {
            console.error('Failed to start consultation:', error);
            setStatus('error');
        }
    };

    const getStatusIndicator = () => {
        switch (status) {
            case 'connected': return <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div><span className="text-green-400">{t("voice.status.connected")}</span></div>;
            case 'connecting': return <div className="flex items-center gap-2"><LoadingIcon className="w-4 h-4 text-yellow-400" /> <span className="text-yellow-400">{t("voice.status.connecting")}</span></div>;
            case 'error': return <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div><span className="text-red-400">{t("voice.status.error")}</span></div>;
            case 'disconnected':
            default: return <div className="flex items-center gap-2"><div className="w-2 h-2 bg-slate-500 rounded-full"></div><span className="text-slate-400">{t("voice.status.disconnected")}</span></div>;
        }
    };

    return (
        <div className="max-w-4xl w-full mx-auto">
             <div className="flex justify-between items-center mb-6">
                <div className="text-left">
                    <PodcastIcon className="h-12 w-12 text-cyan-400" />
                    <h2 className="mt-2 text-2xl font-semibold text-slate-100">{t("voice.title")}</h2>
                    <p className="mt-1 text-sm text-slate-400">{t("voice.subtitle")}</p>
                </div>
                <button onClick={onBack} className="text-sm font-semibold text-cyan-400 hover:text-cyan-300">
                    &larr; {t("voice.back")}
                </button>
            </div>
            
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-700">
                    {getStatusIndicator()}
                    {status === 'disconnected' || status === 'error' ? (
                        <button onClick={handleStartConsultation} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg">{t("voice.btn.start")}</button>
                    ) : (
                        <button onClick={stopConsultation} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg">{t("voice.btn.end")}</button>
                    )}
                </div>

                <div className="h-80 bg-slate-800 rounded-md p-3 overflow-y-auto custom-scrollbar space-y-4">
                    {transcript.map((entry, index) => (
                        <div key={index} className={`flex items-start gap-3 ${entry.speaker === 'user' ? 'justify-end' : ''}`}>
                            {entry.speaker === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30"><BotIcon className="w-5 h-5 text-cyan-400" /></div>}
                            <div className={`max-w-md p-3 rounded-lg text-sm ${entry.speaker === 'user' ? 'bg-slate-700 text-slate-200' : 'bg-slate-700/50 text-slate-300'}`}>
                                {entry.text}
                            </div>
                            {entry.speaker === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center border border-slate-500"><UserIcon className="w-5 h-5 text-slate-200" /></div>}
                        </div>
                    ))}
                    <div ref={transcriptEndRef} />
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">{t("voice.live.disclaimer")}</p>
            </div>
        </div>
    );
};

export default VoiceConsultation;
