import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, ChatAttachment, SavedChat } from '../types';
import { createCylexChat, sendCylexMessage } from '../services/geminiService';
import type { Chat } from '@google/genai';
import { BotIcon, UserIcon, SendIcon, XIcon, MicrophoneIcon, PaperclipIcon, StopCircleIcon, FileTextIcon, SaveIcon, HistoryIcon, TrashIcon, LoadingIcon } from './icons';
import { useLanguage } from './LanguageContext';
import { SUPPORTED_LANGUAGES } from '../services/localizationService';

// FIX: Add type definitions for the Speech Recognition API to resolve TypeScript errors.
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
  lang: string;
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
    const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    
    // Case Notes State
    const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showSaveInput, setShowSaveInput] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    
    const { language, t } = useLanguage();

    useEffect(() => {
        if(initialInput) {
            setInput(initialInput);
        }
    }, [initialInput]);

    useEffect(() => {
        // Load saved chats from localStorage
        const stored = localStorage.getItem('cylex_saved_chats');
        if (stored) {
            try {
                setSavedChats(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse saved chats", e);
            }
        }

        const initChat = async () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateString = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            
            let locationInfo = `Timezone: ${timeZone}`;
            
            try {
                if (navigator.geolocation) {
                     const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
                    });
                    locationInfo += `, Coordinates: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
                }
            } catch (e) {
                // ignore geolocation errors, default to timezone info
                console.debug("Geolocation not available", e);
            }

            // Detect OS
            const getOS = () => {
                const userAgent = window.navigator.userAgent;
                if (userAgent.indexOf("Win") !== -1) return "Windows";
                if (userAgent.indexOf("Mac") !== -1) return "MacOS";
                if (userAgent.indexOf("Linux") !== -1) return "Linux";
                if (userAgent.indexOf("Android") !== -1) return "Android";
                if (userAgent.indexOf("like Mac") !== -1) return "iOS";
                return "Unknown OS";
            };

            // Detect Device Type
            const getDeviceType = () => {
                const userAgent = window.navigator.userAgent;
                if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) return "Mobile/Tablet";
                return "Desktop/Laptop";
            };

            const langName = SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || 'English';

            const newChat = createCylexChat({
                location: locationInfo,
                time: timeString,
                date: dateString,
                deviceType: getDeviceType(),
                operatingSystem: getOS(),
                language: langName // Pass detected language
            });
            setChat(newChat);

            // Personalized Greeting based on time and language
            // Note: The AI will likely ignore this hardcoded greeting in the chat history context, 
            // but we show a UI greeting immediately.
            setMessages([{ role: 'model', content: t("chat.greeting") }]);
        };
        initChat();

        // Speech Recognition setup
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = language === 'ja' ? 'ja-JP' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : language === 'pt' ? 'pt-BR' : 'en-US';
            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                   finalTranscript += event.results[i][0].transcript;
                }
                setInput(prev => prev + finalTranscript);
            };
            recognitionRef.current = recognition;
        }

    }, [language, t]); // Re-init if language changes

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    

    const handleSend = useCallback(async () => {
        // Check for empty input/attachments
        if ((!input.trim() && attachments.length === 0) || !chat || isLoading) return;

        // Command Handling
        if (input.trim().startsWith('/')) {
             const args = input.trim().split(' ');
             const command = args[0].toLowerCase();
             const params = args.slice(1).join(' ');

             if (command === '/save') {
                 if (params) {
                     const newNote: SavedChat = {
                         id: Date.now().toString(),
                         title: params,
                         date: new Date().toLocaleDateString(),
                         messages: messages
                     };
                     const updatedNotes = [newNote, ...savedChats];
                     setSavedChats(updatedNotes);
                     localStorage.setItem('cylex_saved_chats', JSON.stringify(updatedNotes));
                     setMessages(prev => [...prev, { role: 'model', content: `✓ Case note saved: "${params}"` }]);
                 } else {
                     setShowSaveInput(true);
                 }
                 setInput('');
                 return;
             } else if (command === '/history' || command === '/notes') {
                 setShowHistory(true);
                 setInput('');
                 return;
             }
             // Allow other slash commands to pass through or handle them? 
             // We'll proceed if it's not a handled command, but for now we consume known ones.
        }

        const userMessage: ChatMessage = { role: 'user', content: input, attachments: [...attachments] };
        setMessages(prev => [...prev, userMessage]);
        
        const messageToSend = input;
        const attachmentsToSend = attachments.map(a => a.data);

        setInput('');
        setAttachments([]);
        setIsLoading(true);

        try {
            const response = await sendCylexMessage(chat, messageToSend, attachmentsToSend);
            const modelMessage: ChatMessage = { role: 'model', content: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Failed to send message:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I encountered an error processing your request. The file might be too large or in an unsupported format." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, chat, isLoading, attachments, messages, savedChats]);
    
    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach((file: File) => {
                const isImage = file.type.startsWith('image/');
                const isText = file.type === 'text/plain' || file.name.endsWith('.md');
                const isPdf = file.type === 'application/pdf';

                if (isImage || isText || isPdf) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setAttachments(prev => [...prev, {
                            data: reader.result as string,
                            name: file.name,
                            type: file.type
                        }]);
                        
                        // Smart prompt update if empty
                        if (!input) {
                             if (isImage) {
                                setInput(`What do you see in this image?`);
                            } else {
                                setInput(`Please analyze and summarize this document.`);
                            }
                        }
                    };
                    reader.readAsDataURL(file);
                } else {
                   // Ignore unsupported types silently for better UX or handle as needed
                   console.warn(`Unsupported file type: ${file.type}`);
                }
            });
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
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

    // --- Case Notes Logic --- //
    const handleSaveNote = () => {
        if (!noteTitle.trim()) return;
        
        const newNote: SavedChat = {
            id: Date.now().toString(),
            title: noteTitle,
            date: new Date().toLocaleDateString(),
            messages: messages
        };

        const updatedNotes = [newNote, ...savedChats];
        setSavedChats(updatedNotes);
        localStorage.setItem('cylex_saved_chats', JSON.stringify(updatedNotes));
        
        setShowSaveInput(false);
        setNoteTitle('');
    };

    const handleDeleteNote = (id: string) => {
        const updatedNotes = savedChats.filter(note => note.id !== id);
        setSavedChats(updatedNotes);
        localStorage.setItem('cylex_saved_chats', JSON.stringify(updatedNotes));
    };

    const handleLoadNote = (note: SavedChat) => {
        setMessages(note.messages);
        setShowHistory(false);
    };

    return (
        <div className="fixed bottom-20 right-6 sm:bottom-6 w-[calc(100%-3rem)] sm:w-full max-w-md h-[70vh] max-h-[600px] flex flex-col bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-30 origin-bottom-right animate-slide-in overflow-hidden">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.txt,.md,.pdf" multiple className="hidden" />
            
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-600 bg-slate-800/80 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                    <BotIcon className="w-6 h-6 text-dynamic" />
                    <h2 className="text-lg font-semibold text-slate-100">Cylex AI</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowSaveInput(true)} 
                        className="p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-dynamic transition-colors"
                        title={t("chat.save")}
                    >
                        <SaveIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setShowHistory(!showHistory)} 
                        className={`p-1.5 rounded-full transition-colors ${showHistory ? 'bg-slate-700 text-dynamic' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                        title={t("chat.history")}
                    >
                        <HistoryIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-red-400 transition-colors" aria-label="Close chat">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Save Input Modal Overlay */}
            {showSaveInput && (
                <div className="absolute inset-0 bg-slate-900/80 z-20 flex items-center justify-center p-4">
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 w-full shadow-xl">
                        <h3 className="text-slate-200 font-semibold mb-3">{t("chat.save")}</h3>
                        <input 
                            type="text" 
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            placeholder={t("chat.save_placeholder")}
                            className="w-full bg-slate-700 text-slate-200 p-2 rounded border border-slate-600 focus:outline-none focus:border-[color:var(--primary-color)] mb-4"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => setShowSaveInput(false)}
                                className="px-3 py-1.5 text-sm text-slate-400 hover:text-white"
                            >
                                {t("chat.cancel")}
                            </button>
                            <button 
                                onClick={handleSaveNote}
                                disabled={!noteTitle.trim()}
                                className="px-3 py-1.5 text-sm bg-[color:var(--secondary-color)] hover:bg-[color:var(--primary-color)] text-white rounded disabled:opacity-50"
                            >
                                {t("chat.save_btn")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* History View Overlay */}
            {showHistory ? (
                <div className="flex-grow bg-slate-800 p-4 overflow-y-auto custom-scrollbar">
                     <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
                        <HistoryIcon className="w-5 h-5" /> {t("chat.history")}
                    </h3>
                    {savedChats.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center mt-10">{t("chat.no_notes")}</p>
                    ) : (
                        <div className="space-y-3">
                            {savedChats.map(note => (
                                <div key={note.id} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 hover:border-[color:var(--primary-color)] transition-colors group">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-medium text-slate-200 truncate pr-2">{note.title}</h4>
                                        <span className="text-[10px] text-slate-500 whitespace-nowrap">{note.date}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 truncate mb-3">
                                        {note.messages.length > 0 ? note.messages[note.messages.length - 1].content.substring(0, 50) + "..." : "No content"}
                                    </p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleLoadNote(note)}
                                            className="flex-1 bg-slate-600 hover:bg-[color:var(--secondary-color)] text-white text-xs py-1.5 rounded transition-colors"
                                        >
                                            {t("chat.load")}
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteNote(note.id)}
                                            className="px-2 bg-slate-600 hover:bg-red-500/80 text-white text-xs py-1.5 rounded transition-colors"
                                            title={t("chat.delete")}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* Chat Messages Area */
                <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                    <div className="space-y-5">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end animate-message-in-user' : 'animate-message-in-model'}`}>
                                {msg.role === 'model' && <div className="w-8 h-8 flex-shrink-0 bg-[rgba(var(--primary-rgb),0.2)] rounded-full flex items-center justify-center border border-[color:var(--primary-color)] opacity-70"><BotIcon className="w-5 h-5 text-dynamic" /></div>}
                                <div className={`max-w-xs flex flex-col gap-2`}>
                                    <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-[color:var(--secondary-color)] text-white rounded-br-lg' : 'bg-slate-700 text-slate-200 rounded-bl-lg'}`}>
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {msg.attachments.map((att, i) => (
                                                    <div key={i} className="max-w-full">
                                                        {att.type.startsWith('image/') ? (
                                                            <div className="relative">
                                                                <img src={att.data} alt={att.name} className="rounded-md max-w-full h-auto max-h-40 border border-slate-500/30" />
                                                                <div className="text-[10px] mt-1 opacity-70 truncate">{att.name}</div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-md border border-slate-500/30">
                                                                <FileTextIcon className="w-4 h-4 text-slate-300" />
                                                                <span className="text-xs text-slate-200 truncate max-w-[150px]" title={att.name}>{att.name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {msg.content && <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }}></p>}
                                    </div>
                                </div>
                                {msg.role === 'user' && <div className="w-8 h-8 flex-shrink-0 bg-slate-600 rounded-full flex items-center justify-center border border-slate-500"><UserIcon className="w-5 h-5 text-slate-200" /></div>}
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex items-start gap-3 animate-message-in-model">
                                <div className="w-8 h-8 flex-shrink-0 bg-[rgba(var(--primary-rgb),0.2)] rounded-full flex items-center justify-center border border-[color:var(--primary-color)] opacity-70"><BotIcon className="w-5 h-5 text-dynamic" /></div>
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
            )}

            {/* Input Area (Hidden when History is shown) */}
            {!showHistory && (
                <div className="p-3 border-t border-slate-600 flex-shrink-0 space-y-2 relative">
                    {isLoading && (
                         <div className="absolute -top-6 left-4 flex items-center gap-1.5 text-xs text-slate-400 animate-pulse bg-slate-800/80 px-2 py-1 rounded-t-md border border-slate-700 border-b-0 backdrop-blur-sm">
                            <div className="w-1.5 h-1.5 bg-[color:var(--primary-color)] rounded-full animate-bounce"></div>
                            <span>{t("chat.typing")}</span>
                        </div>
                    )}
                    
                    {/* Attachment Preview Area */}
                    {attachments.length > 0 && (
                         <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {attachments.map((att, index) => (
                                 <div key={index} className="relative flex-shrink-0">
                                    {att.type.startsWith('image/') ? (
                                        <div className="relative w-16 h-16">
                                            <img src={att.data} alt="preview" className="w-full h-full object-cover rounded-md border border-slate-600" />
                                        </div>
                                    ) : (
                                        <div className="relative w-16 h-16 bg-slate-700 rounded-md border border-slate-600 flex flex-col items-center justify-center p-1">
                                            <FileTextIcon className="w-6 h-6 text-slate-400 mb-1" />
                                            <p className="text-[8px] text-slate-300 w-full text-center truncate">{att.name}</p>
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => handleRemoveAttachment(index)} 
                                        className="absolute -top-1.5 -right-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded-full p-0.5 shadow-md border border-slate-500"
                                    >
                                        <XIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center bg-slate-700 rounded-lg transition-all focus-within:ring-2 focus-within:ring-[color:var(--primary-color)]">
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
                        <button onClick={handleSend} disabled={isLoading || (!input.trim() && attachments.length === 0)} className="p-3 bg-[color:var(--secondary-color)] hover:bg-[color:var(--primary-color)] disabled:bg-slate-600 disabled:text-slate-400 transition-colors rounded-lg ml-1">
                            <SendIcon className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CylexChatbot;