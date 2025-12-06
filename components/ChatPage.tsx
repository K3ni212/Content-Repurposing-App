
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, LiveServerMessage, Modality, Blob } from "@google/genai";
import { ChatMessage, ChatSession } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon } from './icons/PlusIcon';
import { ChatIcon } from './icons/ChatIcon';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { CustomInstructionsModal } from './CustomInstructionsModal';
import { XCloseIcon } from './icons/XCloseIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CheckIcon } from './icons/CheckIcon';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ChatPageProps {
    currentUser: string;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export const ChatPage: React.FC<ChatPageProps> = ({ currentUser }) => {
  const sessionsKey = `${currentUser}_chatSessions`;
  const customInstructionsKey = `${currentUser}_customInstructions`;

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tools State
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  
  // Upload State
  const [attachment, setAttachment] = useState<{ data: string, mimeType: string, name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [customInstructions, setCustomInstructions] = useState(() => {
    const saved = localStorage.getItem(customInstructionsKey);
    return saved ? JSON.parse(saved) : { aboutUser: '', responseStyle: '' };
  });

  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const activeSession = chatSessions.find(s => s.id === activeSessionId);
  
  // Load and initialize sessions on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem(sessionsKey);
    const parsedSessions = savedSessions ? JSON.parse(savedSessions) : [];
    
    if (parsedSessions.length > 0) {
        setChatSessions(parsedSessions);
        setActiveSessionId(parsedSessions[0].id);
    } else {
        const newSession: ChatSession = { id: uuidv4(), title: 'New Chat', createdAt: new Date().toISOString(), messages: [] };
        setChatSessions([newSession]);
        setActiveSessionId(newSession.id);
    }
  }, [currentUser]);

  // Save sessions to local storage whenever they change
  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem(sessionsKey, JSON.stringify(chatSessions));
    } else {
      localStorage.removeItem(sessionsKey);
    }
  }, [chatSessions, sessionsKey]);

  useEffect(() => {
    localStorage.setItem(customInstructionsKey, JSON.stringify(customInstructions));
  }, [customInstructions, customInstructionsKey]);

  useEffect(() => {
    if (!activeSession) return;
    
    const model = isThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash-lite';
    
    let systemInstruction = isThinkingMode 
        ? 'You are "Content Copilot", a friendly and expert AI assistant for content marketers and founders, currently in advanced thinking mode...'
        : 'You are "Content Copilot", a friendly and expert AI assistant...';

    if (customInstructions.aboutUser) systemInstruction += `\n\nHere is info about me: ${customInstructions.aboutUser}`;
    if (customInstructions.responseStyle) systemInstruction += `\n\nHere is how you should respond: ${customInstructions.responseStyle}`;
    
    const config: any = { systemInstruction };
    if (isThinkingMode) config.thinkingConfig = { thinkingBudget: 32768 };
    if (useSearch) config.tools = [{ googleSearch: {} }];

    const chatInstance = ai.chats.create({
      model,
      history: activeSession.messages,
      config
    });
    setChat(chatInstance);
  }, [activeSessionId, chatSessions, isThinkingMode, useSearch, customInstructions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isLoading]);
  
  const stopRecording = () => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session?.close());
            sessionPromiseRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        setIsRecording(false);
    };

    const handleMicClick = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamRef.current = stream;
                setIsRecording(true);

                sessionPromiseRef.current = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                    callbacks: {
                        onopen: () => {
                            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                            mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
                            scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                            
                            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                const pcmBlob = createBlob(inputData);
                                sessionPromiseRef.current?.then((session) => {
                                    if (session) session.sendRealtimeInput({ media: pcmBlob });
                                });
                            };

                            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                            scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                        },
                        onmessage: (message: LiveServerMessage) => {
                            if (message.serverContent?.inputTranscription) {
                                setInput(message.serverContent.inputTranscription.text);
                            }
                        },
                        onerror: (e: ErrorEvent) => {
                            console.error('Live session error:', e);
                            stopRecording();
                        },
                        onclose: () => {},
                    },
                    config: {
                        responseModalities: [Modality.AUDIO],
                        inputAudioTranscription: {},
                    },
                });
            } catch (err) {
                console.error("Error getting microphone access:", err);
                setIsRecording(false);
            }
        }
    };

    useEffect(() => {
        return () => {
            if (isRecording) stopRecording();
        }
    }, [isRecording]);
  
  const handleNewChat = () => {
    const newSession: ChatSession = {
        id: uuidv4(),
        title: 'New Chat',
        createdAt: new Date().toISOString(),
        messages: []
    };
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsHistorySidebarOpen(false);
  };
  
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setIsHistorySidebarOpen(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat?")) {
        setChatSessions(prev => prev.filter(s => s.id !== sessionId));
        if (activeSessionId === sessionId) {
            const remainingSessions = chatSessions.filter(s => s.id !== sessionId);
            if (remainingSessions.length > 0) {
                setActiveSessionId(remainingSessions[0].id);
            } else {
                handleNewChat();
            }
        }
    }
  };

  const handleSaveInstructions = (instructions: { aboutUser: string; responseStyle: string }) => {
    setCustomInstructions(instructions);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      if (file.size > 5 * 1024 * 1024) {
          alert("File size must be less than 5MB");
          return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
          const base64 = (event.target?.result as string).split(',')[1];
          setAttachment({
              data: base64,
              mimeType: file.type,
              name: file.name
          });
      };
      reader.readAsDataURL(file);
      e.target.value = ''; 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachment) || !chat || isLoading || !activeSessionId) return;

    if (isRecording) stopRecording();

    // Construct message parts
    const parts: any[] = [];
    if (input.trim()) parts.push({ text: input });
    if (attachment) {
        parts.push({
            inlineData: {
                mimeType: attachment.mimeType,
                data: attachment.data
            }
        });
    }

    const userInput: ChatMessage = { role: 'user', parts };
    const messageToSend = input || (attachment ? `[Attached file: ${attachment.name}]` : 'Message');
    
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    setChatSessions(prev => prev.map(session => {
        if (session.id === activeSessionId) {
            const updatedMessages = [...session.messages, userInput];
            const updatedTitle = session.messages.length === 0 ? messageToSend.substring(0, 40) + (messageToSend.length > 40 ? '...' : '') : session.title;
            return { ...session, title: updatedTitle, messages: updatedMessages };
        }
        return session;
    }));

    try {
        const messageContent = attachment ? { parts } : input;
        const responseStream = await chat.sendMessageStream({ message: messageContent });
        let fullResponse = '';

        setChatSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, { role: 'model', parts: [{ text: ''}]}] } : s));
        
        for await (const chunk of responseStream) {
            fullResponse += chunk.text;
            setChatSessions(prev => prev.map(s => {
                if (s.id === activeSessionId) {
                    const newMessages = [...s.messages];
                    newMessages[newMessages.length - 1] = { role: 'model', parts: [{ text: fullResponse }] };
                    return { ...s, messages: newMessages };
                }
                return s;
            }));
        }
    } catch (error) {
        console.error("Chat error:", error);
        const errorMsg: ChatMessage = { role: 'model', parts: [{ text: 'Sorry, something went wrong. Please try again.' }]};
        setChatSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s));
    } finally {
        setIsLoading(false);
    }
  };

  // Border Gradient Colors
  let gradientColors = '#E2E8F0_0%,#E2E8F0_100%'; // Default gray
  if (isThinkingMode) {
      gradientColors = '#0000_0%,#A855F7_50%,#0000_100%'; // Purple for Thinking
  } else if (useSearch) {
      gradientColors = '#0000_0%,#EAB308_50%,#0000_100%'; // Yellow for Search
  }

  return (
    <div className="relative flex flex-col h-full animate-fade-in bg-gradient-to-br from-indigo-100/40 via-white to-purple-100/40 dark:from-indigo-900/20 dark:via-[#0B0C15] dark:to-purple-900/20 animate-gradient bg-[length:400%_400%] overflow-hidden">
        {/* History Sidebar - Glass */}
        <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${isHistorySidebarOpen ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent pointer-events-none'}`} onClick={() => setIsHistorySidebarOpen(false)}></div>
        <aside className={`absolute top-0 left-0 h-full w-72 glass-panel border-r border-gray-200 dark:border-white/10 z-50 transform transition-transform duration-300 ease-in-out ${isHistorySidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl bg-white/90 dark:bg-[#151725]/90`}>
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-white/10">
                    <h2 className="font-bold text-gray-900 dark:text-white">Chat History</h2>
                    <button onClick={() => setIsHistorySidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><XCloseIcon className="w-5 h-5"/></button>
                </div>
                <div className="p-4">
                    <button onClick={handleNewChat} className="flex items-center justify-center w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-glow transition-all text-sm animate-gradient bg-200%">
                        <PlusIcon className="w-5 h-5 mr-2"/>New Chat
                    </button>
                </div>
                <nav className="flex-grow overflow-y-auto p-3 space-y-1 custom-scrollbar">
                    {chatSessions.map(session => (
                        <button key={session.id} onClick={() => handleSelectSession(session.id)} className={`w-full text-left p-3 rounded-xl text-sm group flex justify-between items-center transition-all ${activeSessionId === session.id ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/5 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                            <span className="truncate pr-2">{session.title}</span>
                            <span onClick={(e) => handleDeleteSession(e, session.id)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1 rounded transition-colors"><TrashIcon className="w-4 h-4" /></span>
                        </button>
                    ))}
                </nav>
            </div>
        </aside>

        {/* Main Chat Area - Transparent for ambient background */}
        <div className="flex flex-col h-full z-10 relative">
            <header className={`p-4 border-b border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-md flex justify-between items-center flex-shrink-0 transition-colors duration-500 ${isThinkingMode ? 'border-purple-200 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-900/10' : ''}`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsHistorySidebarOpen(true)} aria-label="Open chat history" className="flex items-center justify-center bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 p-2.5 rounded-xl transition-colors border border-gray-200 dark:border-white/5 shadow-sm">
                        <PlusIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
                <div>
                    <button onClick={() => setIsInstructionsModalOpen(true)} className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" aria-label="Custom Instructions">
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>
            
            <main className="flex-grow p-4 overflow-y-auto scroll-smooth custom-scrollbar">
                <div className="max-w-3xl mx-auto">
                    {!activeSession || activeSession.messages.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center justify-center h-full opacity-0 animate-fade-in" style={{animationDelay: '0.2s', animationFillMode: 'forwards'}}>
                            <div className="w-20 h-20 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-3xl flex items-center justify-center mb-6 shadow-glow border border-indigo-500/20 backdrop-blur-sm">
                                <SparklesIcon className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Content Copilot</h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md">I'm ready to brainstorm, draft, and refine your content strategy.</p>
                        </div>
                    ) : (
                        activeSession.messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-6 group animate-fade-in`}>
                            <div className={`max-w-[85%] p-5 rounded-2xl shadow-lg backdrop-blur-md ${
                                msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/20' 
                                : 'bg-white dark:bg-[#151725]/80 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-black/5 dark:shadow-black/20'
                            }`}>
                                {msg.role === 'model'
                                    ? (msg.parts[0].text ? <MarkdownRenderer content={msg.parts[0].text} /> : <span className="flex gap-1.5 py-1"><span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></span><span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span></span>)
                                    : (
                                        <div>
                                            {msg.parts.map((part, i) => (
                                                <React.Fragment key={i}>
                                                    {part.text && <div className="whitespace-pre-wrap leading-relaxed">{part.text}</div>}
                                                    {part.inlineData && (
                                                        <div className="mt-2 p-2 bg-white/20 rounded-lg text-xs flex items-center border border-white/10">
                                                            <span className="opacity-90 font-mono">📎 Attached Media</span>
                                                        </div>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex justify-start mb-6 animate-fade-in">
                            <div className="bg-white dark:bg-[#151725]/80 border border-gray-200 dark:border-white/10 p-4 rounded-2xl rounded-bl-none shadow-lg flex gap-1.5 items-center backdrop-blur-md">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="p-6 flex-shrink-0">
                <div className="max-w-3xl mx-auto">
                    {/* Animated Border Container */}
                    <div className="relative group rounded-3xl p-[2px] overflow-hidden transition-all duration-300">
                        {/* Spinning Gradient Border */}
                        <div 
                            className={`absolute inset-[-100%] animate-spin ${!isThinkingMode && !useSearch ? 'opacity-0' : 'opacity-100'}`}
                            style={{
                                background: `conic-gradient(from 90deg at 50% 50%, ${gradientColors})`,
                                transition: 'opacity 0.3s ease-in-out'
                            }}
                        />
                        
                        {/* Inner Content - Background ensures opacity doesn't show gradient through text */}
                        <div className={`relative rounded-3xl bg-white dark:bg-[#151725] h-full ${!isThinkingMode && !useSearch ? 'border border-gray-200 dark:border-white/10' : ''}`}>
                            {attachment && (
                                <div className="px-4 pt-3 flex items-center animate-fade-in">
                                    <div className="relative bg-gray-100 dark:bg-white/10 rounded-lg p-2 pr-8 text-xs flex items-center gap-2 border border-gray-200 dark:border-white/10">
                                        <div className="bg-indigo-500/20 p-1 rounded text-indigo-600 dark:text-indigo-300">
                                            {attachment.mimeType.startsWith('image') ? 'IMG' : 'FILE'}
                                        </div>
                                        <span className="truncate max-w-[150px] font-medium text-gray-700 dark:text-gray-200">{attachment.name}</span>
                                        <button onClick={() => setAttachment(null)} className="absolute right-1 top-1 text-gray-400 hover:text-gray-600 dark:hover:text-white p-0.5">
                                            <XCloseIcon className="w-3 h-3"/>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e as any);
                                    }
                                }}
                                placeholder={isThinkingMode ? "Reasoning mode active..." : "Type your request..."}
                                disabled={isLoading}
                                rows={1}
                                className="w-full px-5 py-4 bg-transparent border-none rounded-3xl focus:ring-0 resize-none max-h-32 text-gray-900 dark:text-white placeholder:text-gray-400 font-medium"
                            />
                            <div className="flex justify-between items-center px-3 pb-3">
                                <div className="flex items-center space-x-1 pl-1">
                                    {/* File Upload */}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        onChange={handleFileUpload} 
                                        accept="image/png,image/jpeg,image/webp,audio/wav,audio/mp3,audio/aiff,audio/aac,audio/ogg,audio/flac"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                        title="Upload file"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                    </button>

                                    {/* AI Tools Menu */}
                                    <div className="relative">
                                        <button 
                                            type="button" 
                                            onClick={() => setIsToolsOpen(!isToolsOpen)}
                                            className={`p-2 rounded-full transition-all duration-200 ${isThinkingMode || useSearch || isToolsOpen ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                            title="AI Tools & Settings"
                                        >
                                            <SparklesIcon className="w-5 h-5" />
                                        </button>
                                        
                                        {isToolsOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setIsToolsOpen(false)}></div>
                                                <div className="absolute bottom-full left-0 mb-3 w-60 bg-white dark:bg-[#151725] rounded-xl shadow-2xl p-2 z-20 animate-scale-in border border-gray-200 dark:border-white/10">
                                                    <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 mb-1"> capabilities</div>
                                                    
                                                    <button 
                                                        onClick={() => { setIsThinkingMode(!isThinkingMode); if(useSearch) setUseSearch(false); }}
                                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 ${isThinkingMode ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${isThinkingMode ? 'bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-gray-400 dark:bg-gray-600'}`}></span>
                                                            Thinking Mode
                                                        </div>
                                                        {isThinkingMode && <CheckIcon className="w-4 h-4"/>}
                                                    </button>

                                                    <button 
                                                        onClick={() => { setUseSearch(!useSearch); if(isThinkingMode) setIsThinkingMode(false); }}
                                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${useSearch ? 'bg-yellow-50 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${useSearch ? 'bg-yellow-500 dark:bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-gray-400 dark:bg-gray-600'}`}></span>
                                                            Google Search
                                                        </div>
                                                        {useSearch && <CheckIcon className="w-4 h-4"/>}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={handleMicClick} className={`p-2.5 rounded-full transition-all ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-white'}`}>
                                        <MicrophoneIcon className="w-5 h-5" />
                                    </button>
                                    <button type="submit" disabled={isLoading || (!input.trim() && !attachment)} className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-glow hover:scale-105 active:scale-95">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
        <CustomInstructionsModal
            isOpen={isInstructionsModalOpen}
            onClose={() => setIsInstructionsModalOpen(false)}
            onSave={handleSaveInstructions}
            initialInstructions={customInstructions}
        />
    </div>
  );
};
