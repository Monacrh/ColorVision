// src/app/components/llmresponse/ChatInterface.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';

// Definisi tipe data pesan
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string | Date;
}

// Props yang diterima komponen
interface ChatInterfaceProps {
  deficiencyType: string;
  severity: string;
  diagnosis: string;
  resultId: string;        // ID untuk menyimpan ke database
  initialHistory: Message[]; // History chat yang sudah ada
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  deficiencyType, 
  severity, 
  diagnosis,
  resultId,
  initialHistory 
}) => {
  // Inisialisasi state pesan
  const [messages, setMessages] = useState<Message[]>(() => {
    // Pesan default jika belum ada history
    const defaultMsg: Message = { 
      role: 'assistant', 
      content: `Hello! I see you have **${deficiencyType}** (${severity}). Do you have any specific questions about how this affects your daily life or career plans?` 
    };
    
    // Jika ada history dari database, gunakan history tersebut
    // Jika kosong, gunakan pesan default
    if (initialHistory && initialHistory.length > 0) {
      return initialHistory;
    }
    
    return [defaultMsg];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref khusus untuk container pesan (agar scroll tidak mempengaruhi window utama)
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk scroll otomatis ke bawah container
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  };

  // Jalankan scroll setiap kali pesan bertambah
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handler mengirim pesan
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput(''); // Kosongkan input segera
    
    // Update UI secara optimistic (langsung muncul sebelum request selesai)
    const newMessages = [...messages, { role: 'user', content: userMessage } as Message];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Panggil API Backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages, // Kirim konteks percakapan
          context: { deficiencyType, severity, diagnosis },
          resultId: resultId // Penting: Kirim ID agar disimpan ke DB
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler tombol Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-gray-100 p-3 px-4 flex items-center shadow-sm z-10">
        <div className="bg-blue-100 p-1.5 rounded-lg mr-3">
            <Bot size={18} className="text-blue-600" />
        </div>
        <div>
            <h3 className="font-semibold text-gray-800 text-sm">Vision AI Assistant</h3>
            <div className="flex items-center text-xs text-green-600">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                <span>Online Specialist</span>
            </div>
        </div>
      </div>

      {/* --- MESSAGE AREA --- */}
      {/* Ref dipasang di sini untuk mengontrol scroll area ini saja */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
              msg.role === 'user' ? 'bg-indigo-100' : 'bg-blue-600'
            }`}>
              {msg.role === 'user' ? <User size={14} className="text-indigo-600" /> : <Bot size={16} className="text-white" />}
            </div>
            
            {/* Bubble Chat */}
            <div className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
            }`}>
              {/* Simple Markdown Parser untuk Bold (**) */}
              {msg.content.split('**').map((part, i) => 
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 animate-pulse">
             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                <Bot size={16} className="text-white" />
             </div>
             <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-gray-400" />
                <span className="text-xs text-gray-400">Typing...</span>
             </div>
          </div>
        )}
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-3 bg-white border-t border-gray-200 z-10">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about careers, daily tasks, etc..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-2 text-gray-700 placeholder-gray-400 focus:outline-none"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;