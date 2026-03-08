import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ChatAdvisor } from './components/ChatAdvisor';
import { Settings } from './components/Settings';
import { SavedWork } from './components/SavedWork';
import { AppView, User } from './types';
import { Icon } from './components/Icon';
import { storageService } from './services/storageService';
import { AppProvider, useApp } from './contexts/AppContext';

// Inner App Component using hooks
const InnerApp = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const { dir } = useApp();

  // Check for existing session on mount
  useEffect(() => {
    const session = storageService.getSession();
    if (session) {
      setUser(session);
    }
    setInitializing(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    storageService.logout();
    setUser(null);
    setCurrentView(AppView.LANDING);
  };

  if (initializing) {
    return <div className="h-screen w-full bg-background flex items-center justify-center text-primary"><Icon name="spinner" className="fa-spin text-3xl" /></div>;
  }

  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard user={user} />;
      case AppView.CHAT:
        return <ChatAdvisor />;
      case AppView.SETTINGS:
        return <Settings user={user} onSave={(s) => console.log(s)} onUserUpdate={setUser} />;
      case AppView.SAVED:
        return <SavedWork user={user} />;
      case AppView.ABOUT:
         return (
          <div className="flex items-center justify-center h-full text-muted animate-fade-in z-10 relative">
             <div className="text-center p-8 glass rounded-3xl max-w-md w-full border border-border shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-tr from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mx-auto mb-6 transform rotate-3 hover:rotate-6 transition-transform">
                    <Icon name="bolt" className="text-white text-4xl" />
                </div>
                <h2 className="text-3xl font-bold text-text mb-2">MindSpark</h2>
                <p className="text-muted mb-8 font-medium">Version 2.2.0 (Pro)</p>
                
                <div className="space-y-4">
                    <button className="w-full py-4 bg-surface/50 text-text rounded-xl hover:bg-surface transition-all flex items-center justify-center gap-3 backdrop-blur-md border border-border">
                        <Icon name="envelope" /> Contact Support
                    </button>
                    <button onClick={handleLogout} className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-3 backdrop-blur-md">
                        <Icon name="right-from-bracket" /> Sign Out
                    </button>
                </div>
                <div className="mt-8 text-xs text-muted font-mono">
                    Engineered for high performance learning.
                </div>
             </div>
          </div>
        );
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className={`flex h-screen w-full bg-background text-text overflow-hidden relative ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
      
      {/* --- Global Background Aesthetics (Matches Landing Page) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] animate-[pulse_12s_ease-in-out_infinite]"></div>
      </div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay z-0"></div>

      {/* Sidebar Navigation */}
      <Sidebar 
        view={currentView}
        onNavigate={setCurrentView}
        user={user}
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <main 
        className={`flex-1 flex flex-col h-full transition-all duration-300 relative z-10
          ${isSidebarOpen ? (dir === 'rtl' ? 'md:mr-72' : 'md:ml-72') : (dir === 'rtl' ? 'md:mr-20' : 'md:ml-20')}
        `}
      >
        {/* Top Mobile Header */}
        <header className="h-16 flex md:hidden items-center justify-between px-4 border-b border-border bg-surface/50 backdrop-blur-md z-20 sticky top-0">
           <button onClick={() => setSidebarOpen(true)} className="text-muted p-2 hover:text-text transition-colors">
              <Icon name="bars" />
           </button>
           <span className="font-bold text-text flex items-center gap-2">
             <div className="w-6 h-6 rounded bg-gradient-to-tr from-primary to-accent flex items-center justify-center"><Icon name="bolt" className="text-[10px] text-white"/></div>
             MindSpark
           </span>
           <div className="w-8"></div> {/* Spacer */}
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 scroll-smooth">
           {renderView()}
        </div>

      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <InnerApp />
    </AppProvider>
  );
}