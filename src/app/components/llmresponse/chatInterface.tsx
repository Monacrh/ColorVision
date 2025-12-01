// src/app/components/llmresponse/ChatInterface.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  deficiencyType: string;
  severity: string;
  diagnosis: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ deficiencyType, severity, diagnosis }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hello! I see you have **${deficiencyType}** (${severity}). Do you have any specific questions about how this affects your daily life or career plans?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // GANTI: Gunakan ref untuk container, bukan elemen dummy di bawah
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // LOGIKA BARU: Scroll container secara spesifik
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  };

  // Panggil scroll setiap kali pesan berubah
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          context: { deficiencyType, severity, diagnosis }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header Kecil */}
      <div className="bg-white border-b border-gray-100 p-3 px-4 flex items-center shadow-sm">
        <div className="bg-blue-100 p-1.5 rounded-lg mr-3">
            <Bot size={18} className="text-blue-600" />
        </div>
        <div>
            <h3 className="font-semibold text-gray-800 text-sm">Vision AI Assistant</h3>
            <p className="text-xs text-green-600 flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span> Online
            </p>
        </div>
      </div>

      {/* Messages Area */}
      {/* TAMBAHKAN REF DI SINI */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-indigo-100' : 'bg-blue-600'
            }`}>
              {msg.role === 'user' ? <User size={14} className="text-indigo-600" /> : <Bot size={16} className="text-white" />}
            </div>
            
            <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
            }`}>
              {msg.content.split('**').map((part, i) => 
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot size={16} className="text-white" />
             </div>
             <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                <Loader2 size={16} className="animate-spin text-gray-400" />
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about careers, daily tasks, etc..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-2 text-gray-700 placeholder-gray-400"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;