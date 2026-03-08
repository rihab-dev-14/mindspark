import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { User, Settings as SettingsType } from '../types';
import { storageService } from '../services/storageService';
import { useApp } from '../contexts/AppContext';
import { Language } from '../utils/translations';
import { getOpenAIModelLimits } from '../services/openaiService';

interface SettingsProps {
  user: User;
  onSave: (settings: SettingsType) => void;
  onUserUpdate?: (user: User) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onSave, onUserUpdate }) => {
  const { theme, setTheme, language, setLanguage, t, dir, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutPlan, setCheckoutPlan] = useState<{name: string, price: string} | null>(null);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  
  // OpenAI State
  const [apiLimits, setApiLimits] = useState<any>(null);
  const [loadingLimits, setLoadingLimits] = useState(false);
  const [limitsError, setLimitsError] = useState<string | null>(null);
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiBaseURL, setOpenaiBaseURL] = useState('https://api.ai.cc/v1');
  const [openaiModel, setOpenaiModel] = useState('openai/gpt-5-2');
  const [showKey, setShowKey] = useState(false);

  const paypalRef = useRef<HTMLDivElement>(null);

  // Identity State
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username || user.email.split('@')[0]);

  const [settings, setSettings] = useState<SettingsType>({
    bio: 'Avid learner and tech enthusiast.',
    phone: '123-456-7890',
    theme: 'system',
    language: 'English',
    notifications: true,
    privacy: true,
    marketing: false,
    summaryLength: 'Medium',
    noteStyle: 'Bullet Points'
  });

  // Load OpenAI key from storage on mount
  useEffect(() => {
      const storedKey = localStorage.getItem('mindspark_openai_key');
      const storedBaseURL = localStorage.getItem('mindspark_openai_base_url');
      const storedModel = localStorage.getItem('mindspark_openai_model');
      
      if (storedKey) setOpenaiKey(storedKey);
      if (storedBaseURL) setOpenaiBaseURL(storedBaseURL);
      if (storedModel) setOpenaiModel(storedModel);
  }, []);

  // Save OpenAI key when changed
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newKey = e.target.value;
      setOpenaiKey(newKey);
      localStorage.setItem('mindspark_openai_key', newKey);
  };

  const handleBaseURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value;
      setOpenaiBaseURL(newVal);
      localStorage.setItem('mindspark_openai_base_url', newVal);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value;
      setOpenaiModel(newVal);
      localStorage.setItem('mindspark_openai_model', newVal);
  };

  // Reset checkout state when modal closes
  useEffect(() => {
    if (!showUpgradeModal) {
      setCheckoutPlan(null);
      setPaypalError(null);
    }
  }, [showUpgradeModal]);

  // Render PayPal Buttons when checkoutPlan is set - Fixed for Error handling and race conditions
  useEffect(() => {
    let isMounted = true;
    let paypalButtonInstance: any = null;
    
    const renderPayPal = async () => {
        if (!checkoutPlan || !paypalRef.current) return;
        
        // Ensure container is empty cleanly
        if (paypalRef.current.innerHTML !== "") {
            paypalRef.current.innerHTML = "";
        }
        setPaypalError(null);
        
        const win = window as any;
        
        // Check if PayPal object exists globally
        if (!win.paypal) {
             if (isMounted) setPaypalError("Payment system is loading. Please wait or refresh.");
             return;
        }

        try {
            const buttons = win.paypal.Buttons({
                style: {
                    layout: 'vertical',
                    color:  'blue',
                    shape:  'rect',
                    label:  'paypal'
                },
                createOrder: (data: any, actions: any) => {
                    // Safety check inside callback
                    if (!isMounted) return Promise.reject(new Error("Component unmounted"));
                    
                    return actions.order.create({
                        purchase_units: [{
                            description: `MindSpark ${checkoutPlan.name} Plan (${billingCycle})`,
                            amount: {
                                currency_code: "USD",
                                value: checkoutPlan.price
                            }
                        }]
                    }).catch((e: any) => {
                        console.error("Order creation failed", e);
                        throw e;
                    });
                },
                onApprove: async (data: any, actions: any) => {
                    if (!isMounted) return;
                    try {
                        const order = await actions.order.capture();
                        console.log('Capture result', order);
                        
                        const planName = checkoutPlan.name === 'Pro Scholar' ? 'Pro' : 'Premium';
                        const updatedUser = await storageService.updateUserPlan(user.id, planName);
                        
                        if (onUserUpdate) onUserUpdate(updatedUser);
                        
                        if (isMounted) {
                            setShowUpgradeModal(false);
                            setSuccessMsg(`Upgraded to ${checkoutPlan.name} successfully!`);
                            showToast(`Payment successful! Welcome to ${checkoutPlan.name}.`, 'success');
                        }
                    } catch (err) {
                        console.error("Plan update failed", err);
                        showToast("Payment processed, but account update failed. Contact support.", 'error');
                    }
                },
                onError: (err: any) => {
                    if (!isMounted) return;
                    // Filter out common safe errors including unhandled exception
                    const errStr = err?.toString() || '';
                    if (errStr.includes("window host") || 
                        errStr.includes("postMessage") || 
                        errStr.includes("unhandled_exception") ||
                        errStr.includes("object Object")) {
                        console.warn("PayPal safe error suppressed:", err);
                        return;
                    }
                    console.error("PayPal Checkout Error", err);
                    if (isMounted) setPaypalError("The payment system encountered an error.");
                }
            });

            if (!isMounted) return;

            // Render
            if (paypalRef.current) {
                // Double check it's not already rendered
                if (paypalRef.current.children.length === 0) {
                     await buttons.render(paypalRef.current);
                     paypalButtonInstance = buttons;
                }
            }
        } catch (err: any) {
            // Suppress specific render errors that happen during strict mode re-renders
            if (!err?.toString().includes("window host")) {
                 console.error("PayPal Render Error", err);
            }
        }
    };

    // Small delay to ensure DOM is ready and reduce strict mode double-render conflicts
    const timeout = setTimeout(renderPayPal, 300);

    return () => {
        isMounted = false;
        clearTimeout(timeout);
        
        // Try to close instance if available
        if (paypalButtonInstance && typeof paypalButtonInstance.close === 'function') {
            try {
               paypalButtonInstance.close().catch(() => {});
            } catch(e) {}
        }

        // Cleanup DOM safely
        if (paypalRef.current) {
            paypalRef.current.innerHTML = "";
        }
    };
  }, [checkoutPlan, billingCycle, user.id]);

  const handleChange = (key: keyof SettingsType, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
        // Save user profile data
        const updatedUser = await storageService.updateUserProfile(user.id, { name, username });
        if (onUserUpdate) onUserUpdate(updatedUser);
        
        // Save other settings (mock)
        onSave(settings);
        
        setSuccessMsg("Profile & Settings saved successfully!");
        setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) {
        console.error(e);
        showToast("Failed to save changes. Please try again.", 'error');
    } finally {
        setLoading(false);
    }
  };

  const checkLimits = async () => {
      setLoadingLimits(true);
      setLimitsError(null);
      setApiLimits(null);
      try {
          const data = await getOpenAIModelLimits(openaiKey);
          setApiLimits(data);
      } catch (err: any) {
          setLimitsError(err.message || "Failed to fetch limits");
      } finally {
          setLoadingLimits(false);
      }
  };

  const initiateCheckout = (planName: string, price: string) => {
      if (price === '0') return; 
      setCheckoutPlan({ name: planName, price });
  };

  const simulatePayment = async () => {
    if (!checkoutPlan) return;
    const planName = checkoutPlan.name === 'Pro Scholar' ? 'Pro' : 'Premium';
    try {
        const updatedUser = await storageService.updateUserPlan(user.id, planName);
        if (onUserUpdate) onUserUpdate(updatedUser);
        setShowUpgradeModal(false);
        setSuccessMsg(`Upgraded to ${checkoutPlan.name} successfully! (Simulated)`);
    } catch (err) {
        showToast("Simulation failed.", 'error');
    }
  };

  const plans = [
    {
      name: 'Starter',
      price: '0',
      period: '/mo',
      desc: 'Essential tools for casual learners.',
      features: ['10 Summaries per day', 'Basic Notes Generation', 'Standard Support'],
      highlight: false,
      btnStyle: 'bg-surface text-text hover:bg-surface/80'
    },
    {
      name: 'Pro Scholar',
      price: billingCycle === 'monthly' ? '12' : '9',
      period: '/mo',
      desc: 'Power features for serious students.',
      features: ['Unlimited Summaries', 'Image Analysis & OCR', 'Advanced Flashcards', 'No Watermarks'],
      highlight: true,
      btnStyle: 'bg-primary text-white hover:bg-primaryHover shadow-lg shadow-primary/25'
    },
    {
      name: 'Campus',
      price: billingCycle === 'monthly' ? '29' : '24',
      period: '/mo',
      desc: 'For study groups and research teams.',
      features: ['Everything in Pro', 'Shared Workspaces', 'Team Collaboration', 'API Access'],
      highlight: false,
      btnStyle: 'bg-surface text-text hover:bg-surface/80'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-8 animate-fade-in">
             <div className="flex items-center gap-6 pb-6 border-b border-border">
                <div className="relative group cursor-pointer">
                   <img src={user.avatar || "https://i.pravatar.cc/150?u=a042581f4e29026024d"} alt="Profile" className="w-24 h-24 rounded-2xl border-4 border-surface object-cover shadow-xl" />
                   <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                      <Icon name="camera" className="text-white" />
                   </div>
                </div>
                <div>
                   <h3 className="text-3xl font-bold text-text mb-1">{name || user.name}</h3>
                   <p className="text-muted">@{username || user.email.split('@')[0]}</p>
                   <span className="inline-block mt-2 px-3 py-1 bg-surface rounded-full text-xs text-muted border border-border">{user.email}</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    {/* Identity Section */}
                    <div className="bg-surface/30 p-6 rounded-2xl border border-border">
                        <h4 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                            <Icon name="id-card" className="text-primary" /> Identity
                        </h4>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wide">{t('name')}</label>
                                <div className="relative">
                                    <Icon name="user" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                    <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-background/80 border border-border rounded-xl py-3 pl-11 pr-4 text-text focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all focus:bg-background"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wide">{t('username')}</label>
                                <div className="relative">
                                    <Icon name="at" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                    <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-background/80 border border-border rounded-xl py-3 pl-11 pr-4 text-text focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all focus:bg-background"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-muted mb-2 uppercase tracking-wide">{t('bio')}</label>
                        <textarea 
                          value={settings.bio}
                          onChange={(e) => handleChange('bio', e.target.value)}
                          className="w-full bg-background/50 border border-border rounded-xl p-4 text-text focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all focus:bg-background"
                          rows={4}
                        />
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-muted mb-2 uppercase tracking-wide">{t('phoneNumber')}</label>
                      <input 
                        type="text" 
                        value={settings.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full bg-background/50 border border-border rounded-xl p-4 text-text focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all focus:bg-background"
                      />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-muted mb-2 uppercase tracking-wide">{t('connectedAccounts')}</label>
                        <div className="space-y-3">
                             <button className="w-full flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border hover:border-border/50 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Icon name="google" type="brands" className="text-text" />
                                    <span className="text-sm text-text font-medium">Google</span>
                                </div>
                                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded font-bold border border-emerald-400/20">Connected</span>
                             </button>
                             <button className="w-full flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border hover:border-border/50 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Icon name="github" type="brands" className="text-text" />
                                    <span className="text-sm text-text font-medium">GitHub</span>
                                </div>
                                <span className="text-xs text-muted font-bold group-hover:text-text transition-colors">Connect</span>
                             </button>
                        </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-surface to-background rounded-2xl border border-border shadow-lg">
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-sm font-medium text-muted">{t('currentPlan')}</span>
                         <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg shadow-lg shadow-primary/20">{user.plan}</span>
                      </div>
                      <button 
                        onClick={() => setShowUpgradeModal(true)}
                        className="w-full py-3 border border-primary text-primary rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all shadow-lg hover:shadow-primary/25"
                      >
                         {t('upgradePlan')}
                      </button>
                   </div>
                 </div>
             </div>
          </div>
        );

      case 'preferences':
        return (
           <div className="space-y-8 animate-fade-in max-w-2xl">
              <div>
                 <h3 className="text-2xl font-bold text-text mb-2">{t('studyPrefs')}</h3>
                 <p className="text-muted">Customize how MindSpark generates your content.</p>
              </div>

              <div className="space-y-6">
                 <div className="p-6 bg-surface/30 border border-border rounded-2xl">
                    <label className="block text-sm font-bold text-text mb-4 uppercase tracking-wide">Summary Length</label>
                    <div className="grid grid-cols-3 gap-3">
                       {['Short', 'Medium', 'Long'].map(opt => (
                          <button 
                            key={opt}
                            onClick={() => handleChange('summaryLength', opt)}
                            className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                              settings.summaryLength === opt 
                              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                              : 'bg-background/50 border-border text-muted hover:text-text hover:border-border/50'
                            }`}
                          >
                             {opt}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="p-6 bg-surface/30 border border-border rounded-2xl">
                    <label className="block text-sm font-bold text-text mb-4 uppercase tracking-wide">Note Taking Style</label>
                    <div className="space-y-3">
                       {['Bullet Points', 'Outline', 'Cornell'].map(style => (
                          <div 
                             key={style}
                             onClick={() => handleChange('noteStyle', style)}
                             className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                               settings.noteStyle === style 
                               ? 'bg-surface border-primary shadow-md' 
                               : 'bg-background/50 border-border hover:border-border/50'
                             }`}
                          >
                             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${dir === 'rtl' ? 'ml-4' : 'mr-4'} ${
                                settings.noteStyle === style ? 'border-primary' : 'border-muted'
                             }`}>
                                {settings.noteStyle === style && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                             </div>
                             <span className={`font-medium ${settings.noteStyle === style ? 'text-text' : 'text-muted'}`}>{style}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        );

      case 'appearance':
        return (
           <div className="space-y-8 animate-fade-in max-w-2xl">
              <div>
                 <h3 className="text-2xl font-bold text-text mb-2">{t('appearance')}</h3>
                 <p className="text-muted">Manage the look and feel.</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                 {[
                   { id: 'light', label: t('light'), icon: 'sun' },
                   { id: 'dark', label: t('dark'), icon: 'moon' },
                   { id: 'system', label: t('system'), icon: 'desktop' }
                 ].map((tItem) => (
                    <button
                       key={tItem.id}
                       onClick={() => setTheme(tItem.id as any)}
                       className={`p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all ${
                          theme === tItem.id 
                          ? 'bg-surface border-primary text-text shadow-lg shadow-primary/10' 
                          : 'bg-background/30 border-border text-muted hover:bg-surface/50 hover:text-text'
                       }`}
                    >
                       <Icon name={tItem.icon} className="text-3xl" />
                       <span className="font-bold">{tItem.label}</span>
                    </button>
                 ))}
              </div>
           </div>
        );

        case 'advanced':
            return (
               <div className="space-y-8 animate-fade-in max-w-3xl">
                  <div>
                     <h3 className="text-2xl font-bold text-text mb-2">Advanced Settings</h3>
                     <p className="text-muted">Developer tools and external integrations.</p>
                  </div>
    
                  <div className="space-y-6">
                     <div className="p-6 bg-surface/30 border border-border rounded-2xl">
                        
                        {/* API Key Input Section */}
                        <div className="mb-8 p-6 bg-background border border-border rounded-2xl space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-muted mb-2">OpenAI API Key</label>
                                <p className="text-xs text-muted mb-4">Enter your personal OpenAI API Key to use advanced features.</p>
                                <div className="relative flex items-center">
                                    <Icon name="key" className="absolute left-4 text-muted" />
                                    <input 
                                        type={showKey ? "text" : "password"}
                                        value={openaiKey}
                                        onChange={handleKeyChange}
                                        placeholder="sk-..."
                                        className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-12 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    />
                                    <button 
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-4 text-muted hover:text-text"
                                    >
                                        <Icon name={showKey ? "eye-slash" : "eye"} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-muted mb-2">Base URL</label>
                                    <input 
                                        type="text"
                                        value={openaiBaseURL}
                                        onChange={handleBaseURLChange}
                                        placeholder="https://api.openai.com/v1"
                                        className="w-full bg-background border border-border rounded-xl py-3 px-4 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-muted mb-2">Model</label>
                                    <input 
                                        type="text"
                                        value={openaiModel}
                                        onChange={handleModelChange}
                                        placeholder="gpt-4"
                                        className="w-full bg-background border border-border rounded-xl py-3 px-4 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-start mb-6">
                           <div>
                                <h4 className="text-lg font-bold text-text flex items-center gap-2">
                                    <Icon name="code-branch" className="text-accent" /> OpenAI Integration
                                </h4>
                                <p className="text-sm text-muted mt-1">Check fine-tuning model limits directly from OpenAI.</p>
                           </div>
                           <button 
                             onClick={checkLimits}
                             disabled={loadingLimits || !openaiKey}
                             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border flex items-center gap-2
                                ${!openaiKey 
                                    ? 'bg-surface text-muted border-border cursor-not-allowed' 
                                    : 'bg-surface hover:bg-surface/80 text-text border-border'
                                }`}
                           >
                             {loadingLimits ? <Icon name="spinner" className="fa-spin" /> : <Icon name="rotate" />}
                             Check Limits
                           </button>
                        </div>
    
                        {limitsError && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4 font-mono">
                                Error: {limitsError}
                            </div>
                        )}
    
                        {apiLimits && (
                            <div className="bg-background border border-border rounded-xl overflow-hidden">
                                <div className="px-4 py-2 bg-surface border-b border-border flex justify-between items-center">
                                    <span className="text-xs font-bold text-muted uppercase">Response Data</span>
                                    <span className="text-xs text-emerald-400 font-mono">200 OK</span>
                                </div>
                                <pre className="p-4 text-xs font-mono text-text overflow-x-auto">
                                    {JSON.stringify(apiLimits, null, 2)}
                                </pre>
                            </div>
                        )}
                        
                        {!apiLimits && !limitsError && (
                            <div className="flex items-center justify-center h-24 border-2 border-dashed border-border rounded-xl text-muted text-sm">
                                {openaiKey ? "Click 'Check Limits' to fetch data." : "Please enter an OpenAI API Key above."}
                            </div>
                        )}
                     </div>
                  </div>
               </div>
            );

      default:
        return (
             <div className="flex flex-col items-center justify-center h-full text-muted">
                <Icon name="gear" className="text-4xl mb-4 opacity-20" />
                <p>Select a setting from the menu</p>
             </div>
        );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col md:flex-row gap-8 animate-fade-in pb-10 relative">
      
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowUpgradeModal(false)}></div>
            <div className="relative w-full max-w-5xl bg-background border border-border rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] animate-fade-in">
                <div className="p-8 md:p-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                           <h2 className="text-3xl md:text-4xl font-black text-text">{t('upgradePlan')}</h2>
                           <p className="text-muted text-lg mt-2">Unlock the full potential of MindSpark.</p>
                        </div>
                        <button onClick={() => setShowUpgradeModal(false)} className="p-3 hover:bg-surface rounded-xl transition-colors text-muted hover:text-text"><Icon name="xmark" className="text-xl"/></button>
                    </div>

                    {!checkoutPlan ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            {plans.map((plan, i) => (
                                <div key={i} className={`relative p-8 rounded-3xl border flex flex-col transition-transform hover:-translate-y-1 ${plan.highlight ? 'bg-surface/80 border-primary shadow-xl shadow-primary/10' : 'bg-surface/40 border-border'}`}>
                                    {plan.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-bold uppercase rounded-full shadow-lg">Most Popular</div>}
                                    <h3 className="text-xl font-bold text-text">{plan.name}</h3>
                                    <div className="my-6">
                                    <span className="text-4xl font-black text-text">${plan.price}</span>
                                    <span className="text-muted font-medium">{plan.period}</span>
                                    </div>
                                    <p className="text-sm text-muted mb-8 leading-relaxed">{plan.desc}</p>
                                    <ul className="space-y-4 mb-8 flex-1">
                                        {plan.features.map((f, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-text">
                                                <Icon name="check" className={`mt-0.5 ${plan.highlight ? 'text-primary' : 'text-muted'}`} /> 
                                                <span className="font-medium">{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button onClick={() => initiateCheckout(plan.name, plan.price)} className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg ${plan.btnStyle}`}>
                                        {user.plan === (plan.name === 'Starter' ? 'Free' : plan.name.split(' ')[0]) ? 'Current Plan' : `Upgrade to ${plan.name}`}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="max-w-md mx-auto animate-fade-in py-10">
                             <button onClick={() => setCheckoutPlan(null)} className="text-muted hover:text-text mb-8 flex items-center gap-2 text-sm font-medium">
                                <Icon name="arrow-left" /> Back to Plans
                            </button>
                            <div className="bg-surface p-6 rounded-2xl border border-border mb-6 text-center">
                                <p className="text-muted text-sm mb-1">Total to pay</p>
                                <div className="text-4xl font-black text-text">${checkoutPlan.price}</div>
                                <div className="text-primary font-bold text-sm mt-1">{checkoutPlan.name} Plan</div>
                            </div>

                            <div id="paypal-button-container" ref={paypalRef} className="w-full min-h-[150px]"></div>
                            
                            {paypalError && (
                                <div className="mt-6 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center backdrop-blur-sm">
                                    <p className="text-red-400 text-sm mb-4 font-medium">{paypalError}</p>
                                    <button onClick={simulatePayment} className="px-6 py-3 bg-white text-slate-900 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg">
                                        Simulate Successful Payment
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Sidebar Menu */}
      <div className="w-full md:w-64 flex-shrink-0">
        <h2 className="text-xl font-bold text-text mb-6 px-2">{t('settings')}</h2>
        <nav className="space-y-2">
          {[
            { id: 'account', label: t('account'), icon: 'user' },
            { id: 'preferences', label: t('studyPrefs'), icon: 'sliders' },
            { id: 'appearance', label: t('appearance'), icon: 'palette' },
            { id: 'notifications', label: t('notifications'), icon: 'bell' },
            { id: 'privacy', label: t('privacy'), icon: 'shield-halved' },
            { id: 'advanced', label: 'Advanced', icon: 'code' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSuccessMsg(null); }}
              className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300
                ${activeTab === item.id 
                  ? `bg-primary text-white shadow-lg shadow-primary/25 translate-x-1`
                  : 'text-muted hover:bg-surface/50 hover:text-text'}
              `}
            >
              <Icon name={item.icon} className={`w-5 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 glass-card rounded-3xl border border-border p-8 md:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl bg-surface/40">
         {renderContent()}

         {/* Sticky Footer for Save */}
         <div className={`absolute bottom-6 ${dir === 'rtl' ? 'left-8' : 'right-8'} flex items-center gap-4`}>
            {successMsg && (
               <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-bold animate-fade-in flex items-center gap-2 backdrop-blur-md">
                  <Icon name="check" /> {successMsg}
               </span>
            )}
            <button 
               onClick={handleSave}
               disabled={loading}
               className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primaryHover hover:shadow-primary/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center gap-2"
            >
               {loading && <Icon name="spinner" className="fa-spin" />}
               {t('saveChanges')}
            </button>
         </div>
      </div>
    </div>
  );
};