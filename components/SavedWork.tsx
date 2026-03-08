import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { User, Task } from '../types';
import { storageService } from '../services/storageService';
import { useApp } from '../contexts/AppContext';

interface SavedWorkProps {
  user: User;
}

export const SavedWork: React.FC<SavedWorkProps> = ({ user }) => {
  const { t } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const loadedTasks = storageService.getTasks(user.id);
    setTasks(loadedTasks);
  }, [user.id]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || task.type === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'summary': return 'file-lines';
      case 'notes': return 'list-ul';
      case 'simplify': return 'child-reaching';
      case 'quiz': return 'circle-question';
      case 'proofread': return 'check-double';
      case 'analyze image': return 'image';
      case 'translate': return 'globe';
      case 'flashcards': return 'layer-group';
      case 'essay outline': return 'list-ol';
      default: return 'file';
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'summary': return 'bg-primary/20 text-primary';
      case 'notes': return 'bg-pink-500/20 text-pink-400';
      case 'simplify': return 'bg-orange-500/20 text-orange-400';
      case 'quiz': return 'bg-indigo-500/20 text-indigo-400';
      case 'proofread': return 'bg-emerald-500/20 text-emerald-400';
      case 'analyze image': return 'bg-teal-500/20 text-teal-400';
      case 'flashcards': return 'bg-violet-500/20 text-violet-400';
      case 'essay outline': return 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-blue-500/20 text-blue-400';
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

  return (
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col animate-fade-in pb-4">
       
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-text mb-2">Saved Work</h1>
            <p className="text-muted font-medium">Access your study history and generated content.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-72 group">
                <Icon name="magnifying-glass" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full bg-surface/50 border border-border rounded-xl py-3 pl-12 pr-4 text-text focus:ring-1 focus:ring-primary focus:border-primary outline-none backdrop-blur-sm transition-all shadow-sm"
                />
             </div>
             <div className="relative">
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-text focus:ring-1 focus:ring-primary outline-none appearance-none pr-10 backdrop-blur-sm transition-all cursor-pointer shadow-sm hover:bg-surface/80"
                >
                    <option value="all">All Types</option>
                    <option value="summary">Summary</option>
                    <option value="notes">Notes</option>
                    <option value="simplify">Simplify</option>
                    <option value="quiz">Quiz</option>
                    <option value="flashcards">Flashcards</option>
                    <option value="essay outline">Essay Outline</option>
                    <option value="proofread">Proofread</option>
                    <option value="translate">Translate</option>
                </select>
                <Icon name="chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-xs pointer-events-none" />
             </div>
          </div>
       </div>

       {filteredTasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl min-h-[400px] bg-slate-900/20">
             <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                 <Icon name="box-open" className="text-5xl opacity-40" />
             </div>
             <p className="text-xl font-medium">No tasks found matching your criteria.</p>
          </div>
       ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => setSelectedTask(task)}
                  className="glass-card rounded-2xl p-6 cursor-pointer border border-white/5 hover:border-primary/40 group flex flex-col h-72 bg-slate-900/40 backdrop-blur-md hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl hover:bg-slate-800/60"
                >
                   <div className="flex justify-between items-start mb-5">
                      <div className={`p-3 rounded-xl shadow-lg ${getColorForType(task.type)}`}>
                         <Icon name={getIconForType(task.type)} />
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-slate-950/50 px-3 py-1.5 rounded-full border border-white/5">
                         {new Date(task.date).toLocaleDateString()}
                      </span>
                   </div>
                   
                   <h3 className="font-bold text-xl text-slate-200 mb-3 truncate group-hover:text-white transition-colors">{task.title}</h3>
                   
                   <div className="flex-1 overflow-hidden relative">
                      <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap line-clamp-4">
                         {task.preview}
                      </p>
                      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
                   </div>

                   <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-primary font-bold uppercase tracking-wider">View Details</span>
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon name="arrow-right" className="text-xs" />
                      </div>
                   </div>
                </div>
             ))}
          </div>
       )}

       {/* Task Detail Modal - Premium Dark Theme */}
       {selectedTask && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
               onClick={() => setSelectedTask(null)}
            ></div>
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0B1120] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
               <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0B1120] sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-xl ${getColorForType(selectedTask.type)}`}>
                        <Icon name={getIconForType(selectedTask.type)} className="text-xl" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{selectedTask.title}</h2>
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                            <Icon name="clock" /> {new Date(selectedTask.date).toLocaleString()}
                        </p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-white p-3 rounded-xl hover:bg-slate-800 transition-colors">
                     <Icon name="xmark" className="text-xl" />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 md:p-10 bg-[#0f1623] relative">
                  <div className="prose prose-invert max-w-none text-slate-300 leading-8">
                     <div className="whitespace-pre-wrap">{selectedTask.preview}</div>
                  </div>
               </div>

               <div className="p-6 border-t border-white/5 bg-[#0B1120] flex flex-wrap justify-end gap-4">
                  <button 
                     onClick={() => handleShare('twitter', selectedTask.preview)}
                     className="px-4 py-3 bg-slate-800 hover:bg-[#1DA1F2] hover:text-white text-slate-300 rounded-xl text-sm font-bold transition-colors border border-slate-700 shadow-lg flex items-center gap-2 group"
                     title={t('shareOnTwitter')}
                  >
                     <Icon name="twitter" type="brands" /> <span className="hidden sm:inline">Twitter</span>
                  </button>
                  <button 
                     onClick={() => handleShare('whatsapp', selectedTask.preview)}
                     className="px-4 py-3 bg-slate-800 hover:bg-[#25D366] hover:text-white text-slate-300 rounded-xl text-sm font-bold transition-colors border border-slate-700 shadow-lg flex items-center gap-2"
                     title={t('shareOnWhatsApp')}
                  >
                     <Icon name="whatsapp" type="brands" /> <span className="hidden sm:inline">WhatsApp</span>
                  </button>

                  <button 
                     onClick={() => navigator.clipboard.writeText(selectedTask.preview)}
                     className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors border border-slate-700 shadow-lg flex items-center gap-2"
                  >
                     <Icon name="copy" /> Copy
                  </button>
                  <button 
                     onClick={() => setSelectedTask(null)}
                     className="px-6 py-3 bg-primary hover:bg-primaryHover text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-primary/20"
                  >
                     Close
                  </button>
               </div>
            </div>
         </div>
       )}

    </div>
  );
};