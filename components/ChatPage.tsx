
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, LiveServerMessage, Modality, Blob } from "@google/genai";
import { ChatMessage, ChatSession, ContentFormat } from '../types';
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
import { FeatherIcon } from './icons/FeatherIcon';
import { ImageIcon } from './icons/ImageIcon';
import { UserIcon } from './icons/UserIcon';
import { UploadIcon } from './icons/UploadIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { DotsVerticalIcon } from './icons/DotsVerticalIcon';
import { CopyIcon } from './icons/CopyIcon';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { ShareIcon } from './icons/ShareIcon';

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
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(true); 
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tools State
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  
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
  
  useEffect(() => {
    const savedSessions = localStorage.getItem(sessionsKey);
    const parsedSessions = savedSessions ? JSON.parse(savedSessions) : [];
    
    if (parsedSessions.length > 0) {
        setChatSessions(parsedSessions);
        setActiveSessionId(parsedSessions[0].id);
    } else {
        const newSession: ChatSession = { id: uuidv4(), title: 'New Project', createdAt: new Date().toISOString(), messages: [] };
        setChatSessions([newSession]);
        setActiveSessionId(newSession.id);
    }
  }, [currentUser]);

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
      // Pass only standard fields to SDK to avoid type errors, but maintain our extended structure in state
      history: activeSession.messages.map(m => ({ role: m.role, parts: m.parts })),
      config
    });
    setChat(chatInstance);
  }, [activeSessionId, chatSessions.length, isThinkingMode, useSearch, customInstructions]);

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
        title: 'New Project',
        createdAt: new Date().toISOString(),
        messages: []
    };
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    if (window.innerWidth < 1024) setIsHistorySidebarOpen(false);
  };
  
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    if (window.innerWidth < 1024) setIsHistorySidebarOpen(false);
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
            const updatedTitle = session.messages.length === 0 ? messageToSend.substring(0, 30) : session.title;
            return { ...session, title: updatedTitle, messages: updatedMessages };
        }
        return session;
    }));

    try {
        const messageContent = attachment ? { parts } : input;
        const responseStream = await chat.sendMessageStream({ message: messageContent });
        let fullResponse = '';

        setChatSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, { role: 'model', parts: [{ text: ''}], versions: [], currentVersionIndex: 0 }] } : s));
        
        for await (const chunk of responseStream) {
            fullResponse += chunk.text;
            setChatSessions(prev => prev.map(s => {
                if (s.id === activeSessionId) {
                    const newMessages = [...s.messages];
                    newMessages[newMessages.length - 1] = { 
                        role: 'model', 
                        parts: [{ text: fullResponse }],
                        versions: [fullResponse], // Init version history
                        currentVersionIndex: 0 
                    };
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

  const handleRegenerate = async (msgIndex: number) => {
      if (!activeSessionId || !chat || isLoading) return;
      
      const session = chatSessions.find(s => s.id === activeSessionId);
      if (!session || msgIndex <= 0) return;

      const userMsg = session.messages[msgIndex - 1];
      if (userMsg.role !== 'user') return;

      setIsLoading(true);
      
      // We need to re-create a temporary chat history up to the user message
      const historyUpToUser = session.messages.slice(0, msgIndex - 1).map(m => ({ role: m.role, parts: m.parts }));
      
      try {
          // Re-instantiate chat with history context for regeneration
          const tempChat = ai.chats.create({
              model: isThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash-lite',
              history: historyUpToUser,
              config: chat.params // Reuse config
          });

          // Re-send user message
          const userContent = userMsg.parts.length === 1 && userMsg.parts[0].text ? userMsg.parts[0].text : { parts: userMsg.parts };
          const responseStream = await tempChat.sendMessageStream({ message: userContent as any });
          
          let newVersionText = '';
          
          for await (const chunk of responseStream) {
              newVersionText += chunk.text;
              setChatSessions(prev => prev.map(s => {
                  if (s.id === activeSessionId) {
                      const newMessages = [...s.messages];
                      const currentMsg = newMessages[msgIndex];
                      const versions = currentMsg.versions ? [...currentMsg.versions] : [currentMsg.parts[0].text];
                      
                      // If we haven't added the new version placeholder yet
                      if (versions.length <= (currentMsg.currentVersionIndex || 0) + 1) {
                          versions.push(newVersionText);
                      } else {
                          // Update last version
                          versions[versions.length - 1] = newVersionText;
                      }

                      newMessages[msgIndex] = {
                          ...currentMsg,
                          parts: [{ text: newVersionText }],
                          versions: versions,
                          currentVersionIndex: versions.length - 1
                      };
                      return { ...s, messages: newMessages };
                  }
                  return s;
              }));
          }
      } catch (error) {
          console.error("Regeneration failed", error);
      } finally {
          setIsLoading(false);
      }
  };

  const handleVersionChange = (msgIndex: number, direction: 'prev' | 'next') => {
      setChatSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
              const newMessages = [...s.messages];
              const msg = newMessages[msgIndex];
              if (!msg.versions || msg.versions.length <= 1) return s;

              const currentIndex = msg.currentVersionIndex || 0;
              let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
              
              if (newIndex < 0) newIndex = 0;
              if (newIndex >= msg.versions.length) newIndex = msg.versions.length - 1;

              newMessages[msgIndex] = {
                  ...msg,
                  parts: [{ text: msg.versions[newIndex] }],
                  currentVersionIndex: newIndex
              };
              return { ...s, messages: newMessages };
          }
          return s;
      }));
  };

  const handleStarterClick = (prompt: string) => {
      setInput(prompt);
      const textarea = document.querySelector('textarea');
      if(textarea) textarea.focus();
  }

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      // Optional: show small tooltip or icon change
  }

  return (
    <div className="flex h-full animate-fade-in bg-[#F3F4F6] dark:bg-[#05050A] overflow-hidden font-sans">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full relative z-10 transition-all duration-300">
            <header className="px-6 py-4 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsHistorySidebarOpen(!isHistorySidebarOpen)} 
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
                    >
                        <DotsVerticalIcon className="w-5 h-5 transform rotate-90" />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Chat</h2>
                </div>
            </header>
            
            <main className="flex-grow px-6 overflow-y-auto scroll-smooth custom-scrollbar flex flex-col">
                <div className="max-w-3xl mx-auto w-full flex-grow flex flex-col pb-6">
                    {!activeSession || activeSession.messages.length === 0 ? (
                        <div className="flex-grow flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Welcome to RepurposeAI</h1>
                            <p className="text-base text-gray-500 dark:text-gray-400 mb-12 max-w-lg">
                                Get started by selecting a task and Chat can do the rest. Not sure where to start?
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                                <button onClick={() => handleStarterClick("Help me write copy for a LinkedIn post about AI.")} className="group p-4 bg-white dark:bg-[#1E202E] border border-gray-200 dark:border-white/5 rounded-xl flex items-center justify-between hover:shadow-md transition-all text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                            <FeatherIcon className="w-5 h-5" />
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm">Write copy</span>
                                    </div>
                                    <PlusIcon className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors"/>
                                </button>
                                
                                <button onClick={() => handleStarterClick("Generate an image of a futuristic workspace.")} className="group p-4 bg-white dark:bg-[#1E202E] border border-gray-200 dark:border-white/5 rounded-xl flex items-center justify-between hover:shadow-md transition-all text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                            <ImageIcon className="w-5 h-5" />
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm">Image generation</span>
                                    </div>
                                    <PlusIcon className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors"/>
                                </button>
                                
                                <button onClick={() => handleStarterClick("Create a persona for a tech startup founder.")} className="group p-4 bg-white dark:bg-[#1E202E] border border-gray-200 dark:border-white/5 rounded-xl flex items-center justify-between hover:shadow-md transition-all text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                                            <UserIcon className="w-5 h-5" />
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm">Create persona</span>
                                    </div>
                                    <PlusIcon className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors"/>
                                </button>
                                
                                <button onClick={() => handleStarterClick("Write code for a React component that...")} className="group p-4 bg-white dark:bg-[#1E202E] border border-gray-200 dark:border-white/5 rounded-xl flex items-center justify-between hover:shadow-md transition-all text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                                            <SparklesIcon className="w-5 h-5" />
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm">Write code</span>
                                    </div>
                                    <PlusIcon className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors"/>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col justify-end space-y-6 py-4">
                            {activeSession.messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group animate-fade-in`}>
                                <div className={`max-w-full md:max-w-[85%] ${msg.role === 'user' ? 'bg-[#F3F4F6] dark:bg-[#1A1C29] p-4 rounded-2xl text-gray-900 dark:text-white' : 'w-full'}`}>
                                    {msg.role === 'model' ? (
                                        <div className="flex gap-4 items-start">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-lg">
                                                AI
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-2">
                                                {msg.parts[0].text ? (
                                                    <div className="text-gray-900 dark:text-gray-100 leading-relaxed text-sm">
                                                        <MarkdownRenderer content={msg.parts[0].text} />
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-1 py-2">
                                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                                    </div>
                                                )}
                                                
                                                {/* Action Bar */}
                                                {!isLoading && msg.parts[0].text && (
                                                    <div className="flex items-center gap-2 mt-2 pt-2">
                                                        <button onClick={() => handleCopy(msg.parts[0].text)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-white/5" title="Copy">
                                                            <CopyIcon className="w-4 h-4"/>
                                                        </button>
                                                        <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-white/5" title="Good response">
                                                            <ThumbsUpIcon className="w-4 h-4"/>
                                                        </button>
                                                        <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-white/5" title="Bad response">
                                                            <ThumbsDownIcon className="w-4 h-4"/>
                                                        </button>
                                                        <button onClick={() => handleRegenerate(index)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-white/5" title="Regenerate">
                                                            <RefreshIcon className="w-4 h-4"/>
                                                        </button>
                                                        <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-white/5" title="Share">
                                                            <ShareIcon className="w-4 h-4"/>
                                                        </button>
                                                        
                                                        {msg.versions && msg.versions.length > 1 && (
                                                            <div className="flex items-center gap-1 ml-2 text-xs text-gray-400 font-medium select-none">
                                                                <button 
                                                                    onClick={() => handleVersionChange(index, 'prev')}
                                                                    disabled={(msg.currentVersionIndex || 0) === 0}
                                                                    className="p-1 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30"
                                                                >
                                                                    <ChevronLeftIcon className="w-3 h-3"/>
                                                                </button>
                                                                <span>{(msg.currentVersionIndex || 0) + 1} / {msg.versions.length}</span>
                                                                <button 
                                                                    onClick={() => handleVersionChange(index, 'next')}
                                                                    disabled={(msg.currentVersionIndex || 0) === msg.versions.length - 1}
                                                                    className="p-1 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30"
                                                                >
                                                                    <ChevronRightIcon className="w-3 h-3"/>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            {msg.parts.map((part, i) => (
                                                <div key={i} className="whitespace-pre-wrap text-sm">
                                                    {part.text}
                                                    {part.inlineData && (
                                                        <div className="mt-2 p-2 bg-white/50 dark:bg-white/10 rounded-lg text-xs flex items-center border border-gray-200 dark:border-white/10">
                                                            <span className="opacity-90 font-mono">📎 Attached Media</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            ))}
                            {isLoading && activeSession.messages[activeSession.messages.length - 1]?.role === 'user' && (
                                <div className="flex gap-4 items-start animate-fade-in">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-lg">
                                        AI
                                    </div>
                                    <div className="flex items-center gap-1.5 py-3">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </main>

            <footer className="p-4 md:p-6 flex-shrink-0">
                <div className="max-w-3xl mx-auto w-full">
                    {/* New Input Design */}
                    <div className={`relative bg-white dark:bg-[#1E202E] rounded-2xl shadow-lg border border-gray-200 dark:border-white/5 transition-all duration-300 p-2 ${isThinkingMode ? 'ring-2 ring-indigo-500/20' : ''}`}>
                        
                        {isThinkingMode && (
                            <div className="absolute -top-3 left-4 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider rounded-full border border-indigo-200 dark:border-indigo-800 animate-fade-in">
                                Reasoning Mode
                            </div>
                        )}

                        {attachment && (
                            <div className="px-4 pt-3 flex items-center animate-fade-in">
                                <div className="relative bg-gray-50 dark:bg-black/20 rounded-lg p-2 pr-8 text-xs flex items-center gap-2 border border-gray-100 dark:border-white/5">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-1 rounded text-indigo-600 dark:text-indigo-400">
                                        {attachment.mimeType.startsWith('image') ? 'IMG' : 'FILE'}
                                    </div>
                                    <span className="truncate max-w-[150px] font-medium text-gray-700 dark:text-gray-200">{attachment.name}</span>
                                    <button onClick={() => setAttachment(null)} className="absolute right-1 top-1 text-gray-400 hover:text-gray-600 dark:hover:text-white p-0.5">
                                        <XCloseIcon className="w-3 h-3"/>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col">
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e as any);
                                    }
                                }}
                                placeholder={isRecording ? "Listening..." : "Summarize the latest..."}
                                disabled={isLoading}
                                rows={1}
                                className="w-full px-4 pt-3 pb-2 bg-transparent border-none focus:ring-0 resize-none text-gray-900 dark:text-white placeholder:text-gray-400 text-base min-h-[60px]"
                            />
                            
                            <div className="flex justify-between items-center px-3 pb-2 mt-2">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        onChange={handleFileUpload} 
                                        accept="image/*,audio/*,.pdf,.txt"
                                    />
                                    
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <UploadIcon className="w-4 h-4" />
                                        <span className="hidden sm:inline">Attach</span>
                                    </button>

                                    <button 
                                        type="button" 
                                        onClick={handleMicClick}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                            isRecording 
                                            ? 'text-red-500 bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/50 border' 
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <MicrophoneIcon className="w-4 h-4" />
                                        <span className="hidden sm:inline">{isRecording ? 'Stop' : 'Voice Message'}</span>
                                    </button>

                                    <button 
                                        type="button" 
                                        onClick={() => setIsThinkingMode(!isThinkingMode)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                            isThinkingMode 
                                            ? 'text-indigo-600 bg-indigo-50 border border-indigo-200 dark:text-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-800' 
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <SparklesIcon className="w-4 h-4" />
                                        <span className="hidden sm:inline">Browse Prompts</span>
                                    </button>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-mono text-gray-400 hidden sm:block">
                                        {input.length}/3,000
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={(e) => handleSubmit(e as any)} 
                                        disabled={isLoading || (!input.trim() && !attachment)} 
                                        className="p-2 bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-[10px] text-center text-gray-400 mt-3">
                        Script may generate inaccurate information about people, places, or facts. Model: Script AI v1.3
                    </p>
                </div>
            </footer>
        </div>

        {/* Right Sidebar (History) */}
        <aside 
            className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-[#0B0C15] border-l border-gray-200 dark:border-white/5 z-40 transform transition-transform duration-300 ease-in-out ${isHistorySidebarOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col shadow-2xl lg:shadow-none lg:relative lg:translate-x-0 lg:w-72 ${!isHistorySidebarOpen && 'lg:hidden'}`}
        >
            <div className="flex justify-between items-center p-6 pb-2">
                <div className="flex items-center justify-between w-full">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Projects ({chatSessions.length})</h3>
                    <button onClick={() => { setIsInstructionsModalOpen(true) }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <DotsVerticalIcon className="w-4 h-4"/>
                    </button>
                </div>
            </div>

            <div className="p-4 pt-0">
                <div 
                    onClick={handleNewChat}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-700 dark:text-gray-300 mb-2"
                >
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                        <PlusIcon className="w-4 h-4"/>
                    </div>
                    <span className="font-semibold text-sm">New Project</span>
                </div>
                
                <div className="w-full h-px bg-gray-100 dark:bg-white/5 my-2"></div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-1">
                {chatSessions.map(session => (
                    <div 
                        key={session.id} 
                        onClick={() => handleSelectSession(session.id)}
                        className={`group relative flex flex-col p-3 rounded-xl cursor-pointer transition-all ${
                            activeSessionId === session.id 
                            ? 'bg-gray-50 dark:bg-[#1E202E]' 
                            : 'hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                    >
                        <h4 className={`text-sm font-medium truncate pr-6 ${activeSessionId === session.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            {session.title || "New Project"}
                        </h4>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                            {session.messages.length > 0 
                                ? (session.messages[session.messages.length - 1].parts[0].text || "Attachment") 
                                : "Start a new conversation..."}
                        </p>
                        
                        {/* Context Menu Trigger (Hidden by default, shown on hover/active) */}
                        <button 
                            onClick={(e) => handleDeleteSession(e, session.id)} 
                            className={`absolute right-2 top-3 text-gray-400 hover:text-red-500 p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-all ${activeSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                            <TrashIcon className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        </aside>

        <CustomInstructionsModal
            isOpen={isInstructionsModalOpen}
            onClose={() => setIsInstructionsModalOpen(false)}
            onSave={handleSaveInstructions}
            initialInstructions={customInstructions}
        />
    </div>
  );
};
