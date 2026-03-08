import React from 'react';
import { Icon } from './Icon';
import { AppView, User } from '../types';
import { useApp } from '../contexts/AppContext';

interface SidebarProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  user: User;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ view, onNavigate, user, isOpen, onToggle }) => {
  const { t, dir } = useApp();
  
  const navItems = [
    { id: AppView.DASHBOARD, label: t('dashboard'), icon: 'house' },
    { id: AppView.CHAT, label: t('chatAdvisor'), icon: 'comments' },
    { id: AppView.SAVED, label: t('savedWork'), icon: 'bookmark' },
    { id: AppView.SETTINGS, label: t('settings'), icon: 'gear' },
    { id: AppView.ABOUT, label: t('about'), icon: 'circle-question' },
  ];

  const transformClass = isOpen ? 'translate-x-0 w-72' : (dir === 'rtl' ? 'translate-x-full md:translate-x-0 md:w-20' : '-translate-x-full md:translate-x-0 md:w-20');
  const sidebarPos = dir === 'rtl' ? 'right-0 border-l' : 'left-0 border-r';

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onToggle}
      ></div>

      <aside 
        className={`fixed ${sidebarPos} top-0 h-full border-border bg-sidebar/60 backdrop-blur-2xl transition-all duration-300 z-30 flex flex-col shadow-2xl
        ${transformClass}
        `}
      >
        {/* Logo */}
        <div className="h-24 flex items-center px-6 border-b border-border">
           <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
              <Icon name="bolt" className="text-white text-lg" />
           </div>
           <span className={`mx-3 font-bold text-2xl tracking-tight text-text transition-all duration-300 ${!isOpen && 'md:opacity-0 md:hidden md:w-0'}`}>
             MindSpark
           </span>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-8 space-y-2 px-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                 onNavigate(item.id);
                 if (window.innerWidth < 768) onToggle(); // Close on mobile
              }}
              className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group relative
                ${view === item.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                  : 'text-muted hover:bg-surface/10 hover:text-text'}
              `}
            >
              {view === item.id && isOpen && (
                 <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"></div>
              )}
              
              <Icon name={item.icon} className={`text-xl transition-colors ${view === item.id ? 'text-white' : 'text-muted group-hover:text-text'}`} />
              
              <span className={`mx-4 font-bold text-sm transition-all duration-300 ${!isOpen && 'md:opacity-0 md:hidden'}`}>
                {item.label}
              </span>
              
              {/* Tooltip for collapsed state */}
              {!isOpen && (
                <div className={`hidden md:block absolute ${dir === 'rtl' ? 'right-full mr-4' : 'left-full ml-4'} px-3 py-2 bg-surface text-xs font-bold text-text rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-border`}>
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Create New Button */}
        <div className="px-4 mb-6">
           <button 
             onClick={() => onNavigate(AppView.DASHBOARD)}
             className={`w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primaryHover hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group transform hover:-translate-y-0.5
             ${!isOpen && 'md:px-0 md:w-12 md:h-12 md:rounded-xl'}
             `}
           >
             <Icon name="plus" className="text-lg" />
             <span className={`${!isOpen && 'md:hidden'}`}>{t('createNew')}</span>
           </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-border bg-surface/30">
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer group">
               <img src={user.avatar || "https://i.pravatar.cc/150?u=a042581f4e29026024d"} alt="Profile" className="w-10 h-10 rounded-full border-2 border-border group-hover:border-primary transition-colors" />
               <div className={`absolute bottom-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-3 h-3 bg-emerald-500 rounded-full border-2 border-background`}></div>
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${!isOpen && 'md:opacity-0 md:hidden'}`}>
               <div className="text-sm font-bold text-text truncate">{user.name}</div>
               <div className="text-xs text-muted truncate font-medium">{user.email}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};