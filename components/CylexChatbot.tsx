import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { createCylexChat, sendCylexMessage, analyzeDocument } from '../services/geminiService';
import type { Chat } from '@google/genai';
import { BotIcon, UserIcon, SendIcon, XIcon, MicrophoneIcon, PaperclipIcon, StopCircleIcon } from './icons';

// FIX: Add type definitions for the Speech Recognition API to resolve TypeScript errors.
// These interfaces describe the shape of the API for browsers that support it.
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  readonly [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionStatic;
    webkitSpeechRecognition?: SpeechRecognitionStatic;
  }
}

interface CylexChatbotProps {
    onClose: () => void;
    initialInput?: string;
}

const CylexChatbot: React.FC<CylexChatbotProps> = ({ onClose, initialInput }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attachedImage, setAttachedImage] = useState<string | null>(null);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if(initialInput) {
            setInput(initialInput);
        }
    }, [initialInput]);

    useEffect(() => {
        const initChat = () => {
            const newChat = createCylexChat();
            setChat(newChat);
            setMessages([{ role: 'model', content: "Hello! I am Cylex, your AI legal assistant. How can I help you today with matters of cyber law? You can also upload an image, a document, or use your voice." }]);
        };
        initChat();

        // Speech Recognition setup
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                   finalTranscript += event.results[i][0].transcript;
                }
                setInput(prev => prev + finalTranscript);
            };
            recognitionRef.current = recognition;
        }

    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleFileAnalysis = useCallback(async (fileToAnalyze: File) => {
        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            if (text) {
                try {
                    const result = await analyzeDocument(text);
                    const analysisMessage: ChatMessage = { role: 'model', content: `Here is the analysis of the document "${fileToAnalyze.name}":\n\n${result}` };
                    setMessages(prev => [...prev, analysisMessage]);
                } catch (err) {
                     const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I encountered an error analyzing that document." };
                     setMessages(prev => [...prev, errorMessage]);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        reader.readAsText(fileToAnalyze);
    }, []);


    const handleSend = useCallback(async () => {
        if ((!input.trim() && !attachedImage && !attachedFile) || !chat || isLoading) return;

        let userMessage: ChatMessage;

        if (attachedFile) {
            userMessage = { role: 'user', content: `Please analyze this document: ${attachedFile.name}` };
             setMessages(prev => [...prev, userMessage]);
             // FIX: The user message should be added before clearing the file state.
             const fileToAnalyze = attachedFile;
             setInput('');
             setAttachedFile(null);
             handleFileAnalysis(fileToAnalyze);
             return;
        } else {
             userMessage = { role: 'user', content: input, image: attachedImage || undefined };
        }

        setMessages(prev => [...prev, userMessage]);
        
        const messageToSend = input;
        const imageToSend = attachedImage;

        setInput('');
        setAttachedImage(null);
        setAttachedFile(null);
        setIsLoading(true);

        try {
            const response = await sendCylexMessage(chat, messageToSend, imageToSend);
            const modelMessage: ChatMessage = { role: 'model', content: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Failed to send message:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, chat, isLoading, attachedImage, attachedFile, handleFileAnalysis]);
    
    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setAttachedImage(reader.result as string);
                    setAttachedFile(null);
                };
                reader.readAsDataURL(file);
            } else if (file.type === 'text/plain' || file.name.endsWith('.md')) {
                 setAttachedFile(file);
                 setAttachedImage(null);
                 setInput(`Analyze: ${file.name}`); // Pre-fill input
            } else {
                alert('Unsupported file type. Please upload an image or a .txt/.md file.');
            }
        }
        // Reset file input value to allow re-uploading the same file
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleToggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };

    return (
        <div className="fixed bottom-20 right-6 sm:bottom-6 w-[calc(100%-3rem)] sm:w-full max-w-md h-[70vh] max-h-[600px] flex flex-col bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-30 origin-bottom-right animate-slide-in">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.txt,.md" className="hidden" />
            <div className="flex items-center justify-between p-3 border-b border-slate-600 bg-slate-800/80 backdrop-blur-sm rounded-t-lg flex-shrink-0">
                <div className="flex items-center gap-3">
                    <BotIcon className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-lg font-semibold text-slate-100">Cylex AI Assistant</h2>
                </div>
                <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors" aria-label="Close chat">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-5">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end animate-message-in-user' : 'animate-message-in-model'}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 flex-shrink-0 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30"><BotIcon className="w-5 h-5 text-cyan-400" /></div>}
                            <div className={`max-w-xs flex flex-col gap-2`}>
                                <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-br-lg' : 'bg-slate-700 text-slate-200 rounded-bl-lg'}`}>
                                    {msg.image && <img src={msg.image} alt="user upload" className="rounded-md max-w-full h-auto mb-2" />}
                                    {msg.content && <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }}></p>}
                                </div>
                            </div>
                            {msg.role === 'user' && <div className="w-8 h-8 flex-shrink-0 bg-slate-600 rounded-full flex items-center justify-center border border-slate-500"><UserIcon className="w-5 h-5 text-slate-200" /></div>}
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3 animate-message-in-model">
                            <div className="w-8 h-8 flex-shrink-0 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30"><BotIcon className="w-5 h-5 text-cyan-400" /></div>
                            <div className="px-4 py-3 rounded-2xl rounded-bl-lg bg-slate-700 flex items-center space-x-1.5">
                                <div className="w-2 h-2 bg-slate-400 rounded-full dot-pulse"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full dot-pulse dot-pulse-delay-1"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full dot-pulse dot-pulse-delay-2"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-3 border-t border-slate-600 flex-shrink-0 space-y-2">
                {attachedImage && (
                    <div className="relative w-20 h-20">
                        <img src={attachedImage} alt="preview" className="w-full h-full object-cover rounded-md border border-slate-600" />
                        <button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-slate-600 hover:bg-slate-500 text-white rounded-full p-1 shadow-md">
                           <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
                 {attachedFile && (
                    <div className="relative p-2 bg-slate-700 rounded-md flex items-center gap-2">
                        <p className="text-sm text-slate-300 truncate">{attachedFile.name}</p>
                        <button onClick={() => {setAttachedFile(null); setInput('');}} className="text-slate-400 hover:text-white">
                           <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <div className="flex items-center bg-slate-700 rounded-lg transition-all focus-within:ring-2 focus-within:ring-cyan-500">
                    <button onClick={handleAttachClick} disabled={isLoading} className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-600 disabled:text-slate-500 disabled:hover:bg-transparent transition-colors">
                        <PaperclipIcon className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isRecording ? "Listening..." : "Ask about cyber law..."}
                        className="flex-grow bg-transparent px-2 py-3 text-slate-200 placeholder-slate-400 focus:outline-none"
                        disabled={isLoading}
                    />
                     <button onClick={handleToggleRecording} disabled={isLoading} className={`p-2 rounded-full hover:bg-slate-600 transition-colors ${isRecording ? 'text-red-500' : 'text-slate-300 hover:text-white'}`}>
                        {isRecording ? <StopCircleIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
                    </button>
                    <button onClick={handleSend} disabled={isLoading || (!input.trim() && !attachedImage && !attachedFile)} className="p-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:text-slate-400 transition-colors rounded-lg ml-1">
                        <SendIcon className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CylexChatbot;