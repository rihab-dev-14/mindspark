import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { User, Task } from '../types';
import { processTask } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { useApp } from '../contexts/AppContext';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { t, dir, showToast } = useApp();
  const [inputText, setInputText] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [language, setLanguage] = useState('English');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load tasks on mount
  useEffect(() => {
    const loadedTasks = storageService.getTasks(user.id);
    setTasks(loadedTasks.slice(0, 3)); // Show only recent 3
  }, [user.id, loadingAction]); // Reload when action completes

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Speech recognition is not supported in this browser.", 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    const langMap: Record<string, string> = {
        'English': 'en-US',
        'Spanish': 'es-ES',
        'French': 'fr-FR',
        'German': 'de-DE',
        'Arabic': 'ar-SA'
    };
    recognition.lang = langMap[language] || 'en-US';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            }
        }
        if (finalTranscript) {
             setInputText(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
    };

    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
    };

    recognition.onend = () => {
        setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleAction = async (type: string) => {
    if (!inputText.trim() && !selectedImage) {
      showToast("Please enter text or upload an image.", 'info');
      return;
    }
    
    setLoadingAction(type);
    setResult(null);
    
    try {
      const output = await processTask(inputText, type, language, selectedImage || undefined);
      setResult(output);
      
      const newTask: Task = {
        id: Date.now().toString(),
        title: `${type} - ${new Date().toLocaleTimeString()}`,
        type: type.toLowerCase() as any,
        date: Date.now(),
        preview: output.substring(0, 100) + (output.length > 100 ? '...' : ''),
        status: 'completed'
      };

      // Save to storage
      await storageService.saveTask(user.id, newTask);
      
      // Update local state (Optimistic update)
      setTasks(prev => [newTask, ...prev].slice(0, 3));

    } catch (error) {
      console.error(error);
      showToast("Failed to process request. Please try again.", 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleShare = (platform: string, text: string) => {
    const textToShare = encodeURIComponent(text.substring(0, 280) + '... Created with MindSpark');
    const urlToShare = encodeURIComponent(window.location.origin);
    let url = '';

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${textToShare}&url=${urlToShare}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${textToShare}%20${urlToShare}`;
        break;
    }
    
    if (url) window.open(url, '_blank', 'width=600,height=400');
  };

  const ToolButton = ({ icon, label, onClick, colorClass, shadowClass }: any) => (
      <button 
        onClick={onClick}
        disabled={!!loadingAction}
        className={`${colorClass} ${shadowClass} text-white px-3 md:px-5 py-3 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:scale-105 active:scale-95 w-full`}
      >
        {loadingAction === label ? <Icon name="spinner" className="fa-spin"/> : <Icon name={icon} />}
        <span className="truncate">{label === 'Simplify' ? 'Simplify (ELI5)' : label === 'Quiz' ? 'Generate Quiz' : t(label as any)}</span>
      </button>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 md:space-y-8 animate-fade-in pb-4">
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageSelect} 
        className="hidden" 
        accept="image/*"
      />

      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-10 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-5xl font-black text-text tracking-tighter leading-tight">
              {t('welcome')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{user.name.split(' ')[0]}</span>
            </h1>
            {user.plan !== 'Free' && (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-orange-500/20 animate-pulse">
                {user.plan}
              </span>
            )}
          </div>
          <p className="text-muted text-lg md:text-xl font-medium">{t('readyMessage')}</p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
           <div className="bg-surface/40 backdrop-blur-md border border-border p-4 rounded-2xl flex items-center gap-4 min-w-[140px]">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shadow-inner shadow-primary/20"><Icon name="bolt" /></div>
              <div>
                 <div className="text-xl font-black text-text">24</div>
                 <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Tasks</div>
              </div>
           </div>
           <div className="bg-surface/40 backdrop-blur-md border border-border p-4 rounded-2xl flex items-center gap-4 min-w-[140px]">
              <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center shadow-inner shadow-accent/20"><Icon name="clock" /></div>
              <div>
                 <div className="text-xl font-black text-text">12h</div>
                 <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Saved</div>
              </div>
           </div>
        </div>
      </div>

      {/* Input Card - Premium Glass Look */}
      <div className="glass rounded-3xl p-5 md:p-8 space-y-6 shadow-2xl relative overflow-hidden group border border-border bg-surface/40 backdrop-blur-xl">
        {/* Glow effect */}
        <div className={`absolute top-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50 group-hover:opacity-100 transition-opacity`}></div>
        
        <div className="flex justify-between items-center">
          <h2 className="text-lg md:text-xl font-bold text-text flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center"><Icon name="wand-magic-sparkles" /></div>
            <span>{t('startTask')}</span>
          </h2>
          {selectedImage && (
             <button 
               onClick={() => setSelectedImage(null)}
               className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-bold bg-red-500/10 px-3 py-1.5 rounded-full hover:bg-red-500/20 transition-colors"
             >
               <Icon name="trash" /> <span className="hidden sm:inline">{t('removeImage')}</span>
             </button>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 relative">
           <div className="flex-1 relative">
             <textarea
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               placeholder={selectedImage ? "Add context about the image..." : "Paste your text here or use the microphone..."}
               className="w-full h-48 bg-background/50 border border-border rounded-2xl p-6 text-base text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none placeholder-muted leading-relaxed hover:border-border/50 pb-12"
             ></textarea>
             
             {/* Microphone Button */}
             <button 
                onClick={toggleListening}
                className={`absolute bottom-4 right-4 p-3 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm font-bold
                  ${isListening 
                    ? 'bg-red-500 text-white animate-pulse shadow-red-500/20' 
                    : 'bg-surface text-muted hover:bg-primary hover:text-white hover:shadow-primary/20'
                  }`}
             >
                <Icon name={isListening ? 'microphone-slash' : 'microphone'} />
                {isListening ? 'Listening...' : 'Voice Input'}
             </button>
           </div>
           
           {selectedImage && (
              <div className="w-full md:w-48 h-48 bg-background/50 border border-border rounded-2xl overflow-hidden relative group/img shadow-xl flex-shrink-0">
                 <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all backdrop-blur-sm">
                    <button onClick={() => setSelectedImage(null)} className="p-3 bg-red-500 rounded-xl text-white shadow-lg hover:scale-110 transition-transform"><Icon name="xmark" /></button>
                 </div>
              </div>
           )}
        </div>

        <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-muted text-xs font-bold uppercase tracking-wider mb-2">
                <Icon name="toolbox" /> Top 7 Student Tools
            </div>
            
           {/* Tools Grid - Optimized for Mobile */}
           <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 md:gap-3">
              <ToolButton 
                label="Summarize" 
                icon="file-lines" 
                onClick={() => handleAction('Summarize')} 
                colorClass="bg-primary hover:bg-primaryHover"
                shadowClass="shadow-primary/25"
              />
              <ToolButton 
                label="genNotes" 
                icon="pen-to-square" 
                onClick={() => handleAction('Generate Notes')} 
                colorClass="bg-pink-600 hover:bg-pink-500"
                shadowClass="shadow-pink-600/25"
              />
              <ToolButton 
                label="Simplify" 
                icon="child-reaching" 
                onClick={() => handleAction('Simplify')} 
                colorClass="bg-orange-500 hover:bg-orange-400"
                shadowClass="shadow-orange-500/25"
              />
              <ToolButton 
                label="Quiz" 
                icon="circle-question" 
                onClick={() => handleAction('Quiz')} 
                colorClass="bg-indigo-600 hover:bg-indigo-500"
                shadowClass="shadow-indigo-600/25"
              />
              <ToolButton 
                label="flashcards" 
                icon="layer-group" 
                onClick={() => handleAction('Flashcards')} 
                colorClass="bg-violet-600 hover:bg-violet-500"
                shadowClass="shadow-violet-600/25"
              />
               <ToolButton 
                label="essayOutline" 
                icon="list-ol" 
                onClick={() => handleAction('Essay Outline')} 
                colorClass="bg-cyan-600 hover:bg-cyan-500"
                shadowClass="shadow-cyan-600/25"
              />
              <ToolButton 
                label="proofread" 
                icon="check-double" 
                onClick={() => handleAction('Proofread')} 
                colorClass="bg-emerald-600 hover:bg-emerald-500"
                shadowClass="shadow-emerald-600/25"
              />
           </div>

           <div className="flex flex-col sm:flex-row gap-3 items-center w-full justify-between border-t border-border pt-4">
              <div className="w-full sm:w-auto">
                 {!selectedImage ? (
                    <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto bg-surface hover:bg-surface/80 text-text border border-border px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                    <Icon name="image" />
                    {t('uploadImage')}
                    </button>
                ) : (
                    <div className="w-full sm:w-auto">
                        <ToolButton 
                        label="analyzeImg" 
                        icon="wand-magic-sparkles" 
                        onClick={() => handleAction('Analyze Image')} 
                        colorClass="bg-teal-600 hover:bg-teal-500"
                        shadowClass="shadow-teal-600/25"
                        />
                    </div>
                )}
              </div>
              
              <div className="flex gap-3 items-center w-full sm:w-auto">
                <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="flex-1 sm:flex-none bg-background border border-border text-text text-sm font-medium rounded-xl focus:ring-primary focus:border-primary block p-3 outline-none hover:border-border/50 transition-colors cursor-pointer"
                >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Arabic">Arabic</option>
                </select>

                <div className="flex-1 sm:flex-none">
                    <ToolButton 
                        label="translate" 
                        icon="globe" 
                        onClick={() => handleAction('Translate')} 
                        colorClass="bg-blue-600 hover:bg-blue-500"
                        shadowClass="shadow-blue-600/25"
                    />
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Result Area */}
      {result && (
        <div className={`glass rounded-3xl p-6 md:p-8 shadow-2xl ${dir === 'rtl' ? 'border-r-4' : 'border-l-4'} border-primary animate-fade-in scroll-mt-24 border-t border-b border-border bg-surface/60 backdrop-blur-xl`} id="result-area">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-xl font-bold text-text flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20"><Icon name="wand-sparkles" className="text-white text-sm" /></div>
                {t('generatedResult')}
              </h3>
              <div className="flex gap-2 items-center self-end">
                 <div className="flex gap-2 mr-2 border-r border-border pr-4">
                    <button 
                      onClick={() => handleShare('twitter', result)}
                      className="text-muted hover:text-text p-2.5 transition-colors rounded-xl hover:bg-surface bg-background/30 border border-border"
                      title={t('shareOnTwitter')}
                    >
                        <Icon name="twitter" type="brands" />
                    </button>
                    <button 
                      onClick={() => handleShare('whatsapp', result)}
                      className="text-muted hover:text-text p-2.5 transition-colors rounded-xl hover:bg-surface bg-background/30 border border-border"
                      title={t('shareOnWhatsApp')}
                    >
                        <Icon name="whatsapp" type="brands" />
                    </button>
                 </div>

                 <button 
                   onClick={() => navigator.clipboard.writeText(result)}
                   className="text-muted hover:text-text p-2.5 transition-colors rounded-xl hover:bg-surface bg-background/30 border border-border"
                   title="Copy"
                 >
                    <Icon name="copy"/>
                 </button>
                 <button onClick={() => setResult(null)} className="text-muted hover:text-text p-2.5 transition-colors rounded-xl hover:bg-surface bg-background/30 border border-border"><Icon name="xmark"/></button>
              </div>
           </div>
           <div className="prose prose-invert max-w-none text-text bg-background/50 p-6 md:p-8 rounded-2xl border border-border shadow-inner leading-8">
             <div className="whitespace-pre-wrap font-sans break-words">{result}</div>
           </div>
        </div>
      )}

      {/* Recent Work */}
      <div>
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xl font-bold text-text flex items-center gap-2">
              <Icon name="clock-rotate-left" className="text-muted"/> {t('recentWork')}
          </h2>
          <button className="text-sm font-bold text-primary hover:text-primaryHover transition-colors flex items-center gap-1">
             View All <Icon name="arrow-right" />
          </button>
        </div>
        
        {tasks.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-3xl bg-surface/20">
             <div className="w-20 h-20 bg-surface/50 rounded-full flex items-center justify-center mx-auto mb-6 text-muted">
                <Icon name="layer-group" className="text-3xl" />
             </div>
             <p className="text-muted font-medium text-lg">{t('noTasks')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
               <div key={task.id} className="glass-card rounded-2xl p-6 flex flex-col gap-4 group cursor-pointer h-full border border-border hover:border-primary/30 bg-surface/40 hover:bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="flex items-start justify-between">
                     <div className={`p-3 rounded-xl shadow-lg ${
                        task.type === 'summary' ? 'bg-primary/20 text-primary shadow-primary/10' : 
                        task.type === 'notes' ? 'bg-pink-500/20 text-pink-400 shadow-pink-500/10' :
                        task.type === 'simplify' ? 'bg-orange-500/20 text-orange-400 shadow-orange-500/10' :
                        task.type === 'quiz' ? 'bg-indigo-500/20 text-indigo-400 shadow-indigo-500/10' :
                        task.type === 'proofread' ? 'bg-emerald-500/20 text-emerald-400 shadow-emerald-500/10' :
                        task.type === 'analyze image' ? 'bg-teal-500/20 text-teal-400 shadow-teal-500/10' :
                        task.type === 'flashcards' ? 'bg-violet-500/20 text-violet-400 shadow-violet-500/10' :
                        task.type === 'essay outline' ? 'bg-cyan-500/20 text-cyan-400 shadow-cyan-500/10' :
                        'bg-blue-500/20 text-blue-400 shadow-blue-500/10'
                     }`}>
                        <Icon name={
                          task.type === 'summary' ? 'file-lines' : 
                          task.type === 'notes' ? 'list-ul' : 
                          task.type === 'simplify' ? 'child-reaching' :
                          task.type === 'quiz' ? 'circle-question' :
                          task.type === 'proofread' ? 'check-double' : 
                          task.type === 'analyze image' ? 'image' : 
                          task.type === 'flashcards' ? 'layer-group' : 
                          task.type === 'essay outline' ? 'list-ol' : 'globe'
                        } />
                     </div>
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-surface rounded-lg text-muted hover:text-text transition-colors"><Icon name="pen" /></button>
                     </div>
                  </div>
                  
                  <div>
                     <h3 className="font-bold text-lg text-text truncate pr-4 group-hover:text-primary transition-colors">{task.title}</h3>
                     <p className="text-xs text-muted mt-1 flex items-center gap-1 font-medium">
                        <Icon name="clock" className="text-[10px]" />
                        {new Date(task.date).toLocaleDateString()}
                     </p>
                  </div>
                  
                  <div className="relative">
                    <p className="text-sm text-muted line-clamp-3 leading-relaxed">
                        {task.preview}
                    </p>
                    <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-background/10 to-transparent"></div>
                  </div>
               </div>
            ))}
          </div>
        )}
      </div>

      {/* Social Footer in Dashboard */}
      <div className="mt-12 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
         <span className="text-xs text-muted">© 2024 MindSpark AI</span>
         <div className="flex gap-4">
            <a href="#" className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-muted hover:text-white hover:bg-primary transition-all"><Icon name="twitter" type="brands" /></a>
            <a href="#" className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-muted hover:text-white hover:bg-primary transition-all"><Icon name="instagram" type="brands" /></a>
            <a href="#" className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-muted hover:text-white hover:bg-primary transition-all"><Icon name="linkedin" type="brands" /></a>
            <a href="#" className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-muted hover:text-white hover:bg-primary transition-all"><Icon name="github" type="brands" /></a>
         </div>
      </div>
    </div>
  );
};