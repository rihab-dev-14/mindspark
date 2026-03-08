import React, { useState, KeyboardEvent } from 'react';
import { Icon } from './Icon';
import { AppState } from '../types';

interface ChatInputProps {
  onSend: (message: string) => void;
  state: AppState;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, state }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && state !== AppState.GENERATING) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto relative z-30">
      <div className="relative group">
         {/* Glow Effect */}
         <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 blur"></div>
         
         <div className="relative flex items-end gap-2 bg-surface/90 backdrop-blur-xl border border-border p-2 rounded-xl shadow-2xl">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the UI you want to build... (e.g. 'A login card with email, password and a sign in button')"
              className="w-full bg-transparent text-text placeholder-muted text-sm p-3 resize-none focus:outline-none max-h-32 min-h-[50px]"
              disabled={state === AppState.GENERATING}
              rows={1}
            />
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || state === AppState.GENERATING}
              className={`mb-1 p-2.5 rounded-lg transition-all duration-200 flex-shrink-0
                ${input.trim() && state !== AppState.GENERATING 
                  ? 'bg-primary hover:bg-primaryHover text-white shadow-lg shadow-primary/20' 
                  : 'bg-surface border border-border text-muted cursor-not-allowed'}
              `}
            >
              <Icon name={state === AppState.GENERATING ? 'spinner' : 'paper-plane'} className={state === AppState.GENERATING ? 'fa-spin' : ''} />
            </button>
         </div>
      </div>
      
      {/* Suggestions / Footer Text */}
      <div className="mt-3 text-center">
        <p className="text-xs text-muted">
           AI generated code can be unpredictable. Use with caution.
        </p>
      </div>
    </div>
  );
};
