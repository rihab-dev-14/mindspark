import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { ChatMessage } from '../types';
import { generateAdvisorResponse } from '../services/geminiService';
import { generateOpenAIChatResponse } from '../services/openaiService';

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
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    
    let responseText = "";
    const openaiKey = localStorage.getItem('mindspark_openai_key');
    
    try {
      if (openaiKey) {
        const baseURL = localStorage.getItem('mindspark_openai_base_url') || undefined;
        const model = localStorage.getItem('mindspark_openai_model') || undefined;
        
        const openaiMessages = [
          { role: 'system' as const, content: 'You are an AI assistant who knows everything. You are Sparky, a study advisor for MindSpark.' },
          ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content }))
        ];
        
        responseText = await generateOpenAIChatResponse(openaiMessages, { baseURL, model, apiKey: openaiKey });
      } else {
        responseText = await generateAdvisorResponse(history, userMsg.content);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      responseText = "I'm sorry, I encountered an error connecting to my brain. Please check your API settings.";
    }

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
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
          <h1 className="text-4xl font-black text-text mb-2">AI Study Advisor</h1>
          <p className="text-muted font-medium">Chat with Sparky for tips, motivation, and complex explanations!</p>
       </div>

       {/* Chat Box - Glassmorphism */}
       <div className="flex-1 glass-card rounded-3xl border border-border flex flex-col overflow-hidden shadow-2xl bg-surface/60 backdrop-blur-xl relative">
          
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
                      className={`max-w-[80%] p-5 rounded-3xl text-sm leading-relaxed shadow-lg backdrop-blur-md border border-border
                      ${msg.role === 'user' 
                         ? 'bg-gradient-to-br from-primary to-indigo-600 text-white rounded-br-sm' 
                         : 'bg-surface/80 text-text rounded-bl-sm'
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
                   <div className="bg-surface/80 p-5 rounded-3xl rounded-bl-sm border border-border flex items-center gap-2">
                      <div className="w-2 h-2 bg-muted rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-muted rounded-full animate-bounce delay-150"></div>
                   </div>
                </div>
             )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-surface/80 border-t border-border backdrop-blur-md">
             {messages.length < 3 && (
                <div className="flex gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                   {['Help me focus', 'Create a study schedule', 'Explain Quantum Physics', 'Quiz me on Biology'].map(suggestion => (
                      <button 
                         key={suggestion}
                         onClick={() => { setInput(suggestion); }}
                         className="whitespace-nowrap px-4 py-2 rounded-full bg-surface/50 border border-border text-xs font-bold text-muted hover:border-primary hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
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
                   className="w-full bg-background/80 border border-border text-text rounded-2xl pl-6 pr-14 py-5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-muted transition-all shadow-inner group-hover:border-border/80"
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