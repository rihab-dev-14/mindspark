import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { ChatMessage } from '../types';
import { unifiedChatStream } from '../services/unifiedAIService';

export const ChatAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Hello! I'm Sparky, your AI study advisor. How can I help you prepare for success today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const fullMessages: any[] = [...history, { role: 'user', content: currentInput }];
    
    try {
      const aiMsgId = (Date.now() + 1).toString();
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false); // Stop generic typing anim as we start streaming

      const stream = unifiedChatStream(fullMessages, 'You are an AI assistant who knows everything. You are Sparky, a study advisor for MindSpark. Keep responses helpful and encouraging.');
      
      let fullContent = "";
      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: fullContent } : m));
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const errorId = (Date.now() + 2).toString();
      setMessages(prev => [...prev, {
        id: errorId,
        role: 'assistant',
        content: "I'm sorry, I encountered an error connecting to my brain. Please check your API settings.",
        timestamp: Date.now()
      }]);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col animate-fade-in pb-4">
       {/* Header */}
       <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">AI Study Advisor</h1>
          <p className="text-slate-400 font-medium">Chat with Sparky for tips, motivation, and complex explanations!</p>
       </div>

       {/* Chat Box - Glassmorphism */}
       <div className="flex-1 glass rounded-3xl border border-white/5 flex flex-col overflow-hidden shadow-2xl bg-slate-900/60 backdrop-blur-xl relative">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth" ref={scrollRef}>
             {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                   
                   {msg.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center mr-4 mt-1 shadow-lg shadow-primary/30 flex-shrink-0">
                         <Icon name="bolt" className="text-white text-sm" />
                      </div>
                   )}

                   <div 
                      className={`max-w-[80%] p-5 rounded-3xl text-sm leading-relaxed shadow-lg backdrop-blur-md border border-white/5
                      ${msg.role === 'user' 
                         ? 'bg-gradient-to-br from-primary to-indigo-600 text-white rounded-br-sm' 
                         : 'bg-slate-800/80 text-slate-200 rounded-bl-sm'
                      }`}
                   >
                      <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                   </div>

                </div>
             ))}

             {isTyping && (
                <div className="flex justify-start animate-fade-in">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center mr-4 mt-1 shadow-lg shadow-primary/30">
                      <Icon name="bolt" className="text-white text-sm" />
                   </div>
                   <div className="bg-slate-800/80 p-5 rounded-3xl rounded-bl-sm border border-white/5 flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                   </div>
                </div>
             )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-slate-900/80 border-t border-white/5 backdrop-blur-md">
             {messages.length < 3 && (
                <div className="flex gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                   {['Help me focus', 'Create a study schedule', 'Explain Quantum Physics', 'Quiz me on Biology'].map(suggestion => (
                      <button 
                         key={suggestion}
                         onClick={() => { setInput(suggestion); }}
                         className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs font-bold text-slate-300 hover:border-primary hover:bg-primary/10 hover:text-white transition-all shadow-sm"
                      >
                         {suggestion}
                      </button>
                   ))}
                </div>
             )}

             <div className="relative group">
                <input
                   type="text"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder="Ask for study advice..."
                   className="w-full bg-slate-950/80 border border-slate-700/50 text-white rounded-2xl pl-6 pr-14 py-5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-slate-500 transition-all shadow-inner group-hover:border-slate-600"
                />
                <button 
                   onClick={handleSend}
                   disabled={!input.trim() || isTyping}
                   className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-primary text-white rounded-xl hover:bg-primaryHover disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95"
                >
                   <Icon name="paper-plane" />
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};