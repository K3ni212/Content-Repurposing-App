
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
    setHistory([{ role: 'model', parts: [{ text: 'Hello! How can I help you with your content strategy today?' }] }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

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
    <div className="fixed bottom-8 right-8 w-96 h-[600px] bg-white dark:bg-gray-800 shadow-2xl rounded-xl flex flex-col z-50 animate-fade-in">
      <header className="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
        <h3 className="font-bold text-lg">AI Content Assistant</h3>
        <button onClick={onClose} className="text-2xl hover:opacity-80">&times;</button>
      </header>
      
      <main className="flex-grow p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {history.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[80%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
              {msg.role === 'model'
                ? (msg.parts[0].text ? <MarkdownRenderer content={msg.parts[0].text} /> : <span className="animate-pulse">...</span>)
                : msg.parts[0].text
              }
            </div>
          </div>
        ))}
         <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything..."
            disabled={isLoading}
            className="flex-grow px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-600 focus:border-blue-600"
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400">
            Send
          </button>
        </form>
      </footer>
    </div>
  );
};