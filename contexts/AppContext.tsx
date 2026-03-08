import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../utils/translations';

type Theme = 'light' | 'dark' | 'system';

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
  dir: 'ltr' | 'rtl';
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial settings from localStorage or default
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('mindspark_theme') as Theme) || 'system';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('mindspark_lang') as Language) || 'en';
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('mindspark_theme', newTheme);
  };

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('mindspark_lang', newLang);
  };

  // Apply Theme Side Effects
  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyDark = () => root.classList.add('dark');
    const removeDark = () => root.classList.remove('dark');

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemChange = (e: MediaQueryListEvent) => {
        if (e.matches) applyDark(); else removeDark();
      };
      
      if (mediaQuery.matches) applyDark(); else removeDark();
      
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    } else if (theme === 'dark') {
      applyDark();
    } else {
      removeDark();
    }
  }, [theme]);

  // Apply Language Side Effects (RTL)
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('lang', language);
    root.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <AppContext.Provider value={{ theme, setTheme, language, setLanguage, t, dir, showToast }}>
      {children}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl animate-fade-in flex items-center gap-3
          ${toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 
            toast.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 
            'bg-primary/20 border-primary/50 text-primary'}
        `}>
          <div className={`w-2 h-2 rounded-full ${
            toast.type === 'success' ? 'bg-emerald-400' : 
            toast.type === 'error' ? 'bg-red-400' : 
            'bg-primary'
          } animate-pulse`}></div>
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};