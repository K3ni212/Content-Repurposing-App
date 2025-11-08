
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, LiveServerMessage, Modality, Blob } from "@google/genai";
import { ChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon } from './icons/PlusIcon';
import { ChatIcon } from './icons/ChatIcon';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { DotsVerticalIcon } from './icons/DotsVerticalIcon';
import { CustomInstructionsModal } from './CustomInstructionsModal';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ChatSession {
    id: string;
    title: string;
    history: ChatMessage[];
}

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
  
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const savedSessions = localStorage.getItem(sessionsKey);
    return savedSessions ? JSON.parse(savedSessions) : [];
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // New states for AI features
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [menuOpenForSessionId, setMenuOpenForSessionId] = useState<string | null>(null);
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

  // For resizable sidebar
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const isResizingRef = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    localStorage.setItem(sessionsKey, JSON.stringify(sessions));
  }, [sessions, sessionsKey]);

  useEffect(() => {
    localStorage.setItem(customInstructionsKey, JSON.stringify(customInstructions));
  }, [customInstructions, customInstructionsKey]);

  useEffect(() => {
    if (sessions.length > 0 && (!activeSessionId || !sessions.find(s => s.id === activeSessionId))) {
        setActiveSessionId(sessions[0].id);
    } else if (sessions.length === 0) {
        handleNewChat();
    }
  }, [sessions]);

  useEffect(() => {
    if (activeSessionId) {
      const activeSession = sessions.find(s => s.id === activeSessionId);
      if (activeSession) {
        const model = isThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash-lite';
        
        let systemInstruction = isThinkingMode 
            ? 'You are a friendly and expert AI assistant for content marketers and founders, currently in advanced thinking mode. You can handle complex queries and provide deep insights. Provide creative ideas, help brainstorm, and refine content strategies.'
            : 'You are a friendly and expert AI assistant for content marketers and founders. Provide creative ideas, help brainstorm, and refine content strategies.';

        if (customInstructions.aboutUser) {
            systemInstruction += `\n\nHere is some information about me: ${customInstructions.aboutUser}`;
        }
        if (customInstructions.responseStyle) {
            systemInstruction += `\n\nHere is how you should respond: ${customInstructions.responseStyle}`;
        }
        
        const config: any = { systemInstruction };
        if (isThinkingMode) {
            config.thinkingConfig = { thinkingBudget: 32768 };
        }

        const chatInstance = ai.chats.create({
          model,
          history: activeSession.history,
          config
        });
        setChat(chatInstance);
      }
    }
  }, [activeSessionId, isThinkingMode, sessions, customInstructions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setMenuOpenForSessionId(null);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current || !chatContainerRef.current) return;
    const containerX = chatContainerRef.current.getBoundingClientRect().left;
    let newWidth = e.clientX - containerX;
    const minWidth = 240;
    const maxWidth = 500;
    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;
    setSidebarWidth(newWidth);
  }, []);
  
  const handleMouseUp = useCallback(() => {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleMouseMove]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

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
      history: []
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
        setSessions(prev => {
            const newSessions = prev.filter(s => s.id !== sessionId);
            if (activeSessionId === sessionId) {
                if (newSessions.length > 0) {
                    setActiveSessionId(newSessions[0].id);
                } else {
                    setActiveSessionId(null);
                }
            }
            return newSessions;
        });
        setMenuOpenForSessionId(null);
    }
  };

  const handleArchiveSession = () => {
    alert("Archive feature coming soon!");
    setMenuOpenForSessionId(null);
  };
  
  const handleSaveInstructions = (instructions: { aboutUser: string; responseStyle: string }) => {
    setCustomInstructions(instructions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chat || isLoading || !activeSessionId) return;

    if (isRecording) stopRecording();

    const userInput: ChatMessage = { role: 'user', parts: [{ text: input }] };
    
    setSessions(prev => prev.map(s => 
        s.id === activeSessionId ? { ...s, history: [...s.history, userInput], title: s.title === 'New Chat' && s.history.length < 2 ? input.substring(0, 30) : s.title } : s
    ));

    setInput('');
    setIsLoading(true);

    try {
        const responseStream = await chat.sendMessageStream({ message: input });
        
        let fullResponse = '';

        setSessions(prev => prev.map(s => 
            s.id === activeSessionId ? { ...s, history: [...s.history, { role: 'model', parts: [{ text: ''}] }] } : s
        ));
        
        for await (const chunk of responseStream) {
            fullResponse += chunk.text;
            setSessions(prev => {
                return prev.map(s => {
                    if (s.id === activeSessionId) {
                        const newHistory = [...s.history];
                        newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: fullResponse }]};
                        return { ...s, history: newHistory };
                    }
                    return s;
                });
            });
        }
    } catch (error) {
        console.error("Chat error:", error);
        const errorMsg: ChatMessage = { role: 'model', parts: [{ text: 'Sorry, something went wrong. Please try again.' }]};
        setSessions(prev => prev.map(s => 
            s.id === activeSessionId ? { ...s, history: [...s.history, errorMsg] } : s
        ));
    } finally {
        setIsLoading(false);
    }
  };
  
  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div ref={chatContainerRef} className="flex h-full animate-fade-in bg-white dark:bg-gray-800">
        <aside style={{ width: `${sidebarWidth}px` }} className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <button onClick={handleNewChat} className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
                    <PlusIcon className="w-5 h-5 mr-2" /> New Chat
                </button>
            </div>
            <nav className="flex-grow overflow-y-auto p-2">
                <ul>
                    {sessions.map(session => (
                        <li key={session.id} className="relative group">
                             <button onClick={() => setActiveSessionId(session.id)}
                                className={`w-full text-left p-2 rounded-md truncate text-sm flex items-center
                                    ${activeSessionId === session.id ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                               <ChatIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                               <span className="flex-1 truncate">{session.title}</span>
                            </button>
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuOpenForSessionId(menuOpenForSessionId === session.id ? null : session.id);
                                    }}
                                    className="p-1 rounded-full text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    <DotsVerticalIcon className="w-4 h-4" />
                                </button>
                                {menuOpenForSessionId === session.id && (
                                    <div ref={menuRef} className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-600">
                                        <ul className="py-1">
                                            <li><button onClick={handleArchiveSession} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Archive</button></li>
                                            <li><button onClick={() => handleDeleteSession(session.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50">Delete</button></li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
        <div 
          className="w-1.5 flex-shrink-0 cursor-col-resize bg-gray-200 dark:bg-gray-700 hover:bg-blue-600 transition-colors duration-200"
          onMouseDown={handleMouseDown}
          aria-label="Resize sidebar"
          role="separator"
        />
        <div className="flex-1 flex flex-col min-w-0">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant Chat</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your creative partner, powered by Gemini.</p>
                </div>
                <div>
                    <button onClick={() => setIsInstructionsModalOpen(true)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Custom Instructions">
                        <PlusIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>
            
            <main className="flex-grow p-4 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    {activeSession?.history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                        <div className={`max-w-[80%] p-3 rounded-xl shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                            {msg.role === 'model'
                                ? (msg.parts[0].text ? <MarkdownRenderer content={msg.parts[0].text} /> : <span className="animate-pulse">...</span>)
                                : msg.parts[0].text
                            }
                        </div>
                    </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e as any);
                                }
                            }}
                            placeholder="Ask for content ideas, headlines, or use the mic..."
                            disabled={isLoading}
                            rows={1}
                            className="flex-grow px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-600 focus:border-blue-600 resize-none"
                            style={{maxHeight: '150px'}}
                        />
                        <button type="button" onClick={handleMicClick} className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 dark:text-gray-400'}`}>
                            <MicrophoneIcon className="w-6 h-6" />
                        </button>
                        <button type="submit" disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400">
                            Send
                        </button>
                    </form>
                    <div className="mt-2 flex justify-end">
                        <div className="flex items-center space-x-2">
                            <label htmlFor="thinking-mode-toggle" className="text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer">Thinking Mode</label>
                            <button id="thinking-mode-toggle" role="switch" aria-checked={isThinkingMode} onClick={() => setIsThinkingMode(!isThinkingMode)} className={`relative inline-flex items-center h-5 rounded-full w-9 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 ${isThinkingMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                <span className={`inline-block w-3 h-3 transform bg-white rounded-full transition-transform ${isThinkingMode ? 'translate-x-5' : 'translate-x-1'}`}/>
                            </button>
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
