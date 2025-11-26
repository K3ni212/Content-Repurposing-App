
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatBotProps {
  onClose: () => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const ChatBot: React.FC<ChatBotProps> = ({ onClose }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatInstance = ai.chats.create({
      model: 'gemini-2.5-flash-lite',
    });
    setChat(chatInstance);
    setHistory([{ role: 'model', parts: [{ text: 'Hello! I\'m your Content Copilot. How can I help you with your content strategy today?' }] }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chat || isLoading) return;

    const userInput: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setHistory(prev => [...prev, userInput]);
    setInput('');
    setIsLoading(true);

    try {
        const responseStream = await chat.sendMessageStream({ message: input });
        
        let modelResponse = '';
        setHistory(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

        for await (const chunk of responseStream) {
            modelResponse += chunk.text;
            setHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: modelResponse }] };
                return newHistory;
            });
        }
    } catch (error) {
        console.error("Chat error:", error);
        setHistory(prev => [...prev, { role: 'model', parts: [{ text: 'Sorry, something went wrong. Please try again.' }] }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 w-96 h-[600px] bg-white dark:bg-gray-900 shadow-2xl rounded-2xl flex flex-col z-50 animate-fade-in border border-gray-200 dark:border-gray-800 overflow-hidden">
      <header className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 flex justify-between items-center shadow-md animate-gradient bg-200%">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm text-xl">
                🥸
            </div>
            <div>
                <h3 className="font-bold text-sm">Content Copilot</h3>
                <p className="text-[10px] text-indigo-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                </p>
            </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-1 hover:bg-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </header>
      
      <main className="flex-grow p-4 overflow-y-auto bg-gray-50 dark:bg-[#0f111a]">
        {history.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
            <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${
                msg.role === 'user' 
                ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-br-none animate-gradient bg-200%' 
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-700'
            }`}>
              {msg.role === 'model'
                ? (msg.parts[0].text ? <MarkdownRenderer content={msg.parts[0].text} /> : <span className="flex gap-1"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span></span>)
                : msg.parts[0].text
              }
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start mb-4 animate-fade-in">
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                </div>
            </div>
        )}
         <div ref={messagesEndRef} />
      </main>

      <footer className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything..."
            disabled={isLoading}
            className="flex-grow px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-0 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white placeholder:text-gray-400"
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-full shadow-md transition-transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
};