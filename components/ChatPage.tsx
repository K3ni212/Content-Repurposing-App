
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
        // For simple text streaming we use message text, but if there's an attachment we need to handle it.
        // The @google/genai SDK allows sending parts.
        // We need to reconstruct the full message payload for the stream call if using advanced inputs.
        // However, ai.chats.create maintains history. We just send the new user message.
        
        const streamInput = attachment ? { parts } : { message: input };
        // Note: sendMessageStream argument depends on SDK version specifics. 
        // Assuming standard message text or parts support. If parts not directly supported in simple call,
        // we use contents structure. The SDK typically accepts a string or a content object.
        
        const responseStream = await chat.sendMessageStream(attachment ? { parts } : input);
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

  return (
    <div className="relative flex flex-col h-full animate-fade-in bg-white dark:bg-gray-900 overflow-hidden">
        {/* Ambient Background Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className={`absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] transition-opacity duration-1000 ${isThinkingMode ? 'opacity-60 bg-purple-600/20' : 'opacity-30'}`}></div>
             <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] opacity-30"></div>
        </div>

        {/* History Sidebar */}
        <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${isHistorySidebarOpen ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent pointer-events-none'}`} onClick={() => setIsHistorySidebarOpen(false)}></div>
        <aside className={`absolute top-0 left-0 h-full w-72 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${isHistorySidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="font-bold text-gray-900 dark:text-white">Chat History</h2>
                    <button onClick={() => setIsHistorySidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><XCloseIcon className="w-5 h-5"/></button>
                </div>
                <div className="p-4">
                    <button onClick={handleNewChat} className="flex items-center justify-center w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-sm animate-gradient bg-200%">
                        <PlusIcon className="w-5 h-5 mr-2"/>New Chat
                    </button>
                </div>
                <nav className="flex-grow overflow-y-auto p-3 space-y-1">
                    {chatSessions.map(session => (
                        <button key={session.id} onClick={() => handleSelectSession(session.id)} className={`w-full text-left p-3 rounded-xl text-sm group flex justify-between items-center transition-all ${activeSessionId === session.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                            <span className="truncate pr-2 font-medium">{session.title}</span>
                            <span onClick={(e) => handleDeleteSession(e, session.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><TrashIcon className="w-4 h-4" /></span>
                        </button>
                    ))}
                </nav>
            </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex flex-col h-full z-10">
            <header className={`p-4 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex justify-between items-center flex-shrink-0 transition-colors duration-500 ${isThinkingMode ? 'border-purple-500/30 bg-purple-50/50 dark:bg-purple-900/10' : ''}`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsHistorySidebarOpen(true)} aria-label="Open chat history" className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 p-2.5 rounded-xl transition-colors">
                        <PlusIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
                <div>
                    <button onClick={() => setIsInstructionsModalOpen(true)} className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Custom Instructions">
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>
            
            <main className="flex-grow p-4 overflow-y-auto scroll-smooth">
                <div className="max-w-3xl mx-auto">
                    {!activeSession || activeSession.messages.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center justify-center h-full opacity-0 animate-fade-in" style={{animationDelay: '0.2s', animationFillMode: 'forwards'}}>
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <SparklesIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">How can I help you create today?</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md">Draft a LinkedIn post, brainstorm headlines, or analyze your brand voice.</p>
                        </div>
                    ) : (
                        activeSession.messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-6 group animate-fade-in`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-br-none animate-gradient bg-200%' 
                                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                            }`}>
                                {msg.role === 'model'
                                    ? (msg.parts[0].text ? <MarkdownRenderer content={msg.parts[0].text} /> : <span className="flex gap-1 py-2"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span></span>)
                                    : (
                                        <div>
                                            {msg.parts.map((part, i) => (
                                                <React.Fragment key={i}>
                                                    {part.text && <div className="whitespace-pre-wrap leading-relaxed">{part.text}</div>}
                                                    {part.inlineData && (
                                                        <div className="mt-2 p-2 bg-white/20 rounded-lg text-xs flex items-center">
                                                            <span className="opacity-75">Attached Media ({part.inlineData.mimeType})</span>
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
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md flex-shrink-0">
                <div className="max-w-3xl mx-auto">
                    <div className={`relative rounded-2xl border transition-all duration-300 ${isThinkingMode ? 'border-purple-300 dark:border-purple-800 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-gray-300 dark:border-gray-700 shadow-sm focus-within:shadow-md focus-within:border-indigo-300 dark:focus-within:border-indigo-700'} bg-gray-50 dark:bg-gray-800`}>
                        
                        {attachment && (
                            <div className="px-4 pt-3 flex items-center animate-fade-in">
                                <div className="relative bg-white dark:bg-gray-700 rounded-lg p-2 pr-8 text-xs flex items-center gap-2 shadow-sm border border-gray-200 dark:border-gray-600">
                                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded text-indigo-600 dark:text-indigo-400">
                                        {attachment.mimeType.startsWith('image') ? 'IMG' : 'FILE'}
                                    </div>
                                    <span className="truncate max-w-[150px] font-medium">{attachment.name}</span>
                                    <button onClick={() => setAttachment(null)} className="absolute right-1 top-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5">
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
                            placeholder={isThinkingMode ? "Ask a complex question..." : "Ask anything..."}
                            disabled={isLoading}
                            rows={1}
                            className="w-full px-4 py-3 bg-transparent border-none rounded-2xl focus:ring-0 resize-none max-h-32 text-gray-900 dark:text-white placeholder:text-gray-400"
                        />
                        <div className="flex justify-between items-center px-2 pb-2">
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
                                    className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    title="Upload file"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                </button>

                                {/* AI Tools Menu */}
                                <div className="relative">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsToolsOpen(!isToolsOpen)}
                                        className={`p-2 rounded-full transition-all duration-200 ${isThinkingMode || useSearch || isToolsOpen ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                        title="AI Tools & Settings"
                                    >
                                        <SparklesIcon className="w-5 h-5" />
                                    </button>
                                    
                                    {isToolsOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsToolsOpen(false)}></div>
                                            <div className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-20 animate-scale-in">
                                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Model Capabilities</div>
                                                
                                                <button 
                                                    onClick={() => setIsThinkingMode(!isThinkingMode)}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${isThinkingMode ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${isThinkingMode ? 'bg-indigo-500' : 'bg-gray-300'}`}></span>
                                                        Thinking Mode
                                                    </div>
                                                    {isThinkingMode && <CheckIcon className="w-4 h-4"/>}
                                                </button>

                                                <button 
                                                    onClick={() => setUseSearch(!useSearch)}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${useSearch ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${useSearch ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
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
                                <button type="button" onClick={handleMicClick} className={`p-2 rounded-full transition-all ${isRecording ? 'bg-red-100 text-red-600 dark:bg-red-900/30 animate-pulse' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500'}`}>
                                    <MicrophoneIcon className="w-5 h-5" />
                                </button>
                                <button type="submit" disabled={isLoading || (!input.trim() && !attachment)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                    </svg>
                                </button>
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