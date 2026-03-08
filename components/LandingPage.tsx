import React, { useState } from 'react';
import { Icon } from './Icon';
import { AuthModal } from './AuthModal';
import { User } from '../types';
import { useApp } from '../contexts/AppContext';
import { translations } from '../utils/translations';

interface LandingPageProps {
  onLogin: (user: User) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const { t, dir } = useApp();
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const plans = [
    {
      name: 'Starter',
      price: '0',
      period: '/mo',
      desc: 'Essential tools for casual learners.',
      features: ['10 Summaries per day', 'Basic Notes Generation', 'Standard Support', 'Mobile Access'],
      cta: t('startFree'),
      highlight: false,
      btnStyle: 'bg-surface text-text hover:bg-surface/80'
    },
    {
      name: 'Pro Scholar',
      price: billingCycle === 'monthly' ? '12' : '9',
      period: '/mo',
      desc: 'Power features for serious students.',
      features: ['Unlimited Summaries', 'Image Analysis & OCR', 'Advanced Flashcards', 'Priority Processing', 'No Watermarks'],
      highlight: true,
      btnStyle: 'bg-primary text-white hover:bg-primaryHover shadow-lg shadow-primary/25'
    },
    {
      name: 'Campus',
      price: billingCycle === 'monthly' ? '29' : '24',
      period: '/mo',
      desc: 'For study groups and research teams.',
      features: ['Everything in Pro', 'Shared Workspaces', 'Team Collaboration', 'API Access', 'Dedicated Support'],
      highlight: false,
      btnStyle: 'bg-surface text-text hover:bg-surface/80'
    }
  ];

  const whyFeatures = [
    { key: 'whyFeature1', icon: 'file-lines', color: 'text-primary', bg: 'bg-primary/10' },
    { key: 'whyFeature2', icon: 'list-check', color: 'text-accent', bg: 'bg-accent/10' },
    { key: 'whyFeature3', icon: 'layer-group', color: 'text-indigo-300', bg: 'bg-indigo-300/10' },
    { key: 'whyFeature4', icon: 'language', color: 'text-teal-300', bg: 'bg-teal-300/10' },
    { key: 'whyFeature5', icon: 'file-export', color: 'text-blue-300', bg: 'bg-blue-300/10' },
    { key: 'whyFeature6', icon: 'robot', color: 'text-purple-300', bg: 'bg-purple-300/10' }
  ] as const;

  return (
    <div className={`min-h-screen bg-background flex flex-col relative overflow-hidden font-sans scroll-smooth ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setAuthOpen(false)} 
        onLogin={onLogin}
        initialMode={authMode}
      />

      {/* Background Gradients & Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-[pulse_12s_ease-in-out_infinite]"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 max-w-7xl mx-auto w-full flex justify-between items-center backdrop-blur-sm">
        <div className="flex items-center gap-2 group cursor-pointer">
           <div className="w-10 h-10 bg-gradient-to-tr from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
             <Icon name="bolt" className="text-white text-lg" />
           </div>
           <span className="font-bold text-2xl text-text tracking-tight ml-1">MindSpark</span>
        </div>
        
        <nav className="hidden md:flex gap-8 text-sm font-medium text-muted">
           <a href="#features" className="hover:text-primary transition-colors">{t('features')}</a>
           <a href="#how-it-works" className="hover:text-primary transition-colors">{t('howItWorks')}</a>
           <a href="#pricing" className="hover:text-primary transition-colors">{t('pricing')}</a>
        </nav>

        <div className="flex items-center gap-4">
           <button onClick={() => openAuth('login')} className="text-text hover:text-primary font-medium text-sm transition-colors">{t('login')}</button>
           <button onClick={() => openAuth('signup')} className="px-5 py-2.5 bg-text text-background text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-text/10 hover:shadow-text/20 transform hover:-translate-y-0.5">
             {t('getStarted')}
           </button>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 mt-16 md:mt-24 mb-20">
         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-slate-700/50 text-xs font-semibold text-primary mb-8 animate-fade-in backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Now with Image Analysis v2.0
         </div>

         <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-text leading-tight mb-6 tracking-tighter animate-fade-in" style={{animationDelay: '0.1s'}}>
           {t('heroTitle1')}
           <br />
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-accent drop-shadow-sm">{t('heroTitle2')}</span>
         </h1>
         
         <p className="max-w-3xl text-xl md:text-2xl text-muted mb-12 leading-relaxed animate-fade-in px-4 font-medium" style={{animationDelay: '0.2s'}}>
           {t('heroSubtitle')}
         </p>
         
         <div className="flex flex-col sm:flex-row gap-5 animate-fade-in w-full sm:w-auto px-4" style={{animationDelay: '0.3s'}}>
            <button onClick={() => openAuth('signup')} className="px-8 py-4 bg-primary text-white text-lg font-bold rounded-2xl hover:bg-primaryHover hover:scale-105 transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-2 group">
               {t('startFree')}
               <Icon name={dir === 'rtl' ? 'arrow-left' : 'arrow-right'} className={`transition-transform ${dir === 'rtl' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
            </button>
            <button onClick={() => openAuth('login')} className="px-8 py-4 bg-surface text-text text-lg font-bold rounded-2xl hover:bg-surface/80 hover:scale-105 transition-all border border-border backdrop-blur-md flex items-center justify-center gap-2">
               <Icon name="play" className="text-xs" />
               {t('watchDemo')}
            </button>
         </div>

         {/* Stats/Social Proof (Original) */}
         <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 border-t border-slate-800/50 pt-10 animate-fade-in" style={{animationDelay: '0.5s'}}>
             {[
               { val: '1M+', label: 'Students' },
               { val: '10M+', label: 'Pages Summarized' },
               { val: '4.9/5', label: 'App Store Rating' }
             ].map((stat, i) => (
               <div key={i} className="text-center">
                 <div className="text-3xl font-bold text-text mb-1">{stat.val}</div>
                 <div className="text-sm text-muted font-medium uppercase tracking-wide">{stat.label}</div>
               </div>
             ))}
         </div>

         {/* Features Bento Grid */}
         <div id="features" className="mt-32 w-full max-w-7xl mx-auto pb-20 px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black text-text mb-6">{t('featureTitle')}</h2>
                <p className="text-lg text-muted max-w-2xl mx-auto">{t('featureSubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Summaries (Wide) */}
                <div className="md:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-primary/50 transition-colors">
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-6">
                                <Icon name="wand-magic-sparkles" className="text-2xl"/>
                            </div>
                            <h3 className="text-2xl font-bold text-text mb-3">{t('featSummariesTitle')}</h3>
                            <p className="text-muted text-lg max-w-md">{t('featSummariesDesc')}</p>
                        </div>
                        <div className="mt-8 flex gap-2">
                             <div className="h-2 w-24 bg-primary/20 rounded-full"></div>
                             <div className="h-2 w-16 bg-primary/10 rounded-full"></div>
                        </div>
                    </div>
                    {/* Decor */}
                    <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent skew-x-12 translate-x-10"></div>
                    <Icon name="file-lines" className="absolute -right-6 -bottom-6 text-9xl text-primary/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                </div>

                {/* 2. Chat Advisor (Tall) */}
                <div className="lg:row-span-2 glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-indigo-400/50 transition-colors bg-gradient-to-b from-surface to-indigo-900/10">
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                             <Icon name="comments" className="text-2xl"/>
                        </div>
                        <h3 className="text-2xl font-bold text-text mb-3">{t('featTutorTitle')}</h3>
                        <p className="text-muted text-lg mb-8">{t('featTutorDesc')}</p>
                        
                        {/* Mock Chat UI */}
                        <div className="flex-1 bg-background/50 rounded-xl p-4 border border-border space-y-3">
                             <div className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-surface flex-shrink-0"></div>
                                <div className="bg-surface rounded-lg rounded-tl-none p-2 text-xs text-muted w-3/4">Can you explain Photosynthesis?</div>
                             </div>
                             <div className="flex items-start gap-2 flex-row-reverse">
                                <div className="w-6 h-6 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center"><Icon name="bolt" className="text-[10px] text-white"/></div>
                                <div className="bg-indigo-600/20 text-indigo-100 rounded-lg rounded-tr-none p-2 text-xs w-3/4">Sure! It's how plants convert light into energy...</div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* 3. Notes */}
                <div className="glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-accent/50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center mb-6">
                        <Icon name="list-check" className="text-2xl"/>
                    </div>
                    <h3 className="text-xl font-bold text-text mb-2">{t('featNotesTitle')}</h3>
                    <p className="text-muted">{t('featNotesDesc')}</p>
                </div>

                {/* 4. Flashcards */}
                <div className="glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-pink-500/50 transition-colors">
                     <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-6">
                        <Icon name="layer-group" className="text-2xl"/>
                    </div>
                    <h3 className="text-xl font-bold text-text mb-2">{t('featFlashcardsTitle')}</h3>
                    <p className="text-muted">{t('featFlashcardsDesc')}</p>
                </div>

                 {/* 5. Visual (Wide) */}
                 <div className="md:col-span-2 lg:col-span-3 glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-teal-400/50 transition-colors flex flex-col md:flex-row items-center gap-8">
                     <div className="flex-1 text-left">
                        <div className="w-12 h-12 rounded-xl bg-teal-400/20 text-teal-400 flex items-center justify-center mb-6">
                            <Icon name="image" className="text-2xl"/>
                        </div>
                        <h3 className="text-2xl font-bold text-text mb-3">{t('featVisualTitle')} & {t('featExportTitle')}</h3>
                        <p className="text-muted text-lg">{t('featVisualDesc')} {t('featExportDesc')}</p>
                     </div>
                     <div className="flex gap-4 opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                         <div className="p-4 rounded-xl bg-slate-900 border border-slate-800"><Icon name="file-pdf" className="text-3xl text-red-400"/></div>
                         <div className="p-4 rounded-xl bg-slate-900 border border-slate-800"><Icon name="markdown" type="brands" className="text-3xl text-white"/></div>
                         <div className="p-4 rounded-xl bg-slate-900 border border-slate-800"><Icon name="star" className="text-3xl text-blue-400"/></div>
                     </div>
                </div>

            </div>
         </div>

         {/* Why MindSpark Section (Benefits) */}
         <div id="why-mindspark" className="mt-20 w-full max-w-7xl mx-auto pb-20 px-4">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                 
                 {/* Left Column: Text & Features */}
                 <div className={`${dir === 'rtl' ? 'lg:order-2 text-right' : 'text-left'}`}>
                      <h2 className="text-4xl md:text-5xl font-black text-text mb-6 leading-tight">
                          {t('whyMindSpark')}
                      </h2>
                      <p className={`text-muted text-lg mb-10 leading-relaxed ${dir === 'rtl' ? 'border-r-4 pr-6' : 'border-l-4 pl-6'} border-primary`}>
                          {t('whySubtitle')}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                          {whyFeatures.map((feature, i) => (
                              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-surface border border-slate-700/50 hover:border-slate-600 transition-colors group">
                                  <div className={`w-10 h-10 rounded-lg ${feature.bg} ${feature.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                      <Icon name={feature.icon} />
                                  </div>
                                  <span className="text-sm text-text font-medium leading-snug self-center">{t(feature.key as keyof typeof translations['en'])}</span>
                              </div>
                          ))}
                      </div>
                      
                      <div className={dir === 'rtl' ? 'flex justify-end' : 'flex justify-start'}>
                        <button 
                            onClick={() => openAuth('signup')}
                            className="px-8 py-4 bg-text text-background font-bold rounded-xl hover:bg-white transition-all shadow-lg shadow-white/5 hover:shadow-white/20 flex items-center gap-2"
                        >
                            {t('startFreeToday')}
                            <Icon name={dir === 'rtl' ? 'arrow-left' : 'arrow-right'} />
                        </button>
                      </div>
                 </div>
                 
                 {/* Right Column: Visuals & Stats */}
                 <div className={`relative ${dir === 'rtl' ? 'lg:order-1' : ''}`}>
                      {/* Abstract Background Element */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-[120px] pointer-events-none"></div>
                      
                      <div className="relative z-10 grid grid-cols-2 gap-6">
                          {/* Card 1: Students */}
                          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 bg-surface/60 backdrop-blur-xl flex flex-col items-center justify-center text-center aspect-square transform hover:-translate-y-2 transition-transform duration-500">
                              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-4 text-3xl shadow-inner shadow-primary/20">
                                  <Icon name="users" />
                              </div>
                              <div className="text-3xl md:text-4xl font-black text-text mb-2">50K+</div>
                              <div className="text-[10px] md:text-xs font-bold text-muted uppercase tracking-widest">{t('statStudents')}</div>
                          </div>

                          {/* Card 2: Rating (Offset down) */}
                          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 bg-surface/60 backdrop-blur-xl flex flex-col items-center justify-center text-center aspect-square transform translate-y-8 md:translate-y-12 hover:translate-y-6 md:hover:translate-y-10 transition-transform duration-500">
                              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 text-3xl shadow-inner shadow-amber-500/20">
                                  <Icon name="star" />
                              </div>
                              <div className="text-3xl md:text-4xl font-black text-text mb-2">4.9</div>
                              <div className="text-[10px] md:text-xs font-bold text-muted uppercase tracking-widest">{t('statRating')}</div>
                              <div className="flex gap-1 text-amber-400 text-xs mt-3">
                                 {[1,2,3,4,5].map(s => <Icon key={s} name="star" type="solid" />)}
                              </div>
                          </div>

                          {/* Card 3: Time Saved */}
                          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 bg-surface/60 backdrop-blur-xl flex flex-col items-center justify-center text-center aspect-square transform hover:-translate-y-2 transition-transform duration-500">
                              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-accent/20 text-accent flex items-center justify-center mb-4 text-3xl shadow-inner shadow-accent/20">
                                  <Icon name="clock" />
                              </div>
                              <div className="text-3xl md:text-4xl font-black text-text mb-2">3hrs</div>
                              <div className="text-[10px] md:text-xs font-bold text-muted uppercase tracking-widest">{t('statSaved')}</div>
                          </div>

                          {/* Card 4: Decor/Icon */}
                          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl flex flex-col items-center justify-center text-center aspect-square transform translate-y-8 md:translate-y-12 hover:translate-y-6 md:hover:translate-y-10 transition-transform duration-500">
                              <Icon name="bolt" className="text-5xl md:text-6xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                              <div className="mt-4 text-sm font-medium text-white/80">Power Your Study</div>
                          </div>
                      </div>
                 </div>
             </div>
         </div>

         {/* Pricing Section */}
         <div id="pricing" className="mt-20 w-full max-w-7xl mx-auto pb-20 px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">Simple, transparent pricing</h2>
              <p className="text-muted text-lg">Choose the plan that fits your study needs.</p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
               <div className="bg-surface p-1 rounded-xl border border-slate-700/50 flex items-center relative cursor-pointer" onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}>
                  <div className={`px-6 py-2 rounded-lg text-sm font-medium transition-all relative z-10 ${billingCycle === 'monthly' ? 'text-white' : 'text-muted'}`}>
                     {t('monthly')}
                  </div>
                  <div className={`px-6 py-2 rounded-lg text-sm font-medium transition-all relative z-10 ${billingCycle === 'yearly' ? 'text-white' : 'text-muted'}`}>
                     {t('yearly')} <span className="text-xs text-accent font-bold ml-1">-20%</span>
                  </div>
                  <div 
                     className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-slate-700 rounded-lg transition-all duration-300 shadow-sm ${billingCycle === 'monthly' ? (dir === 'rtl' ? 'right-1' : 'left-1') : (dir === 'rtl' ? 'right-[calc(50%+4px)]' : 'left-[calc(50%+4px)]')}`}
                  ></div>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
               {plans.map((plan, i) => (
                  <div 
                    key={i} 
                    className={`relative p-8 rounded-3xl border flex flex-col transition-all duration-300 hover:-translate-y-2
                      ${plan.highlight 
                        ? 'bg-surface/80 border-primary shadow-2xl shadow-primary/10 z-10 scale-105' 
                        : 'bg-surface/40 border-border hover:border-border/50'
                      }`}
                  >
                     {plan.highlight && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg whitespace-nowrap">
                           {t('mostPopular')}
                        </div>
                     )}
                     
                     <div className="mb-8">
                        <h3 className="text-xl font-bold text-text mb-2">{plan.name}</h3>
                        <p className="text-muted text-sm mb-6 h-10">{plan.desc}</p>
                        <div className="flex items-baseline justify-center">
                           <span className="text-4xl font-bold text-text">$</span>
                           <span className="text-5xl font-bold text-text tracking-tight">{plan.price}</span>
                           <span className="text-muted ml-1">{plan.period}</span>
                        </div>
                        {billingCycle === 'yearly' && plan.price !== '0' && (
                           <div className="text-xs text-accent font-medium text-center mt-2">
                              Billed yearly (save ${(parseInt(plan.price === '9' ? '36' : '60'))})
                           </div>
                        )}
                     </div>

                     <ul className={`space-y-4 mb-8 flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                        {plan.features.map((feat, idx) => (
                           <li key={idx} className="flex items-center gap-3 text-text text-sm">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? 'bg-primary/20 text-primary' : 'bg-surface border border-border text-muted'}`}>
                                 <Icon name="check" className="text-xs" />
                              </div>
                              {feat}
                           </li>
                        ))}
                     </ul>

                     <button 
                       onClick={() => openAuth('signup')}
                       className={`w-full py-4 rounded-xl font-bold transition-all ${plan.btnStyle}`}
                     >
                        {plan.cta}
                     </button>
                  </div>
               ))}
            </div>
         </div>

         {/* Final CTA Section */}
         <div className="w-full max-w-5xl mx-auto px-4 pb-20">
             <div className="relative rounded-3xl overflow-hidden p-8 md:p-16 text-center">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-surface to-background backdrop-blur-sm border border-border"></div>
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                 
                 <div className="relative z-10">
                     <h2 className="text-3xl md:text-5xl font-black text-text mb-6 tracking-tight">
                         {t('ctaTitle')}
                     </h2>
                     <p className="text-lg text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
                         {t('ctaSubtitle')}
                     </p>
                     
                     <div className="flex flex-col sm:flex-row justify-center gap-5">
                         <button 
                             onClick={() => openAuth('signup')}
                             className="px-10 py-4 bg-text text-background font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-text/10 hover:shadow-text/20 transform hover:-translate-y-1"
                         >
                             {t('getStarted')}
                         </button>
                         <button 
                             onClick={() => openAuth('login')}
                             className="px-10 py-4 bg-transparent border border-border text-text font-bold rounded-2xl hover:bg-surface/50 transition-all flex items-center justify-center gap-2"
                         >
                             <Icon name="play" className="text-xs" />
                             {t('watchDemo')}
                         </button>
                     </div>
                 </div>
             </div>
         </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 bg-background py-12 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center">
                 <Icon name="bolt" className="text-muted text-sm" />
               </div>
               <span className="font-bold text-text text-lg">MindSpark</span>
            </div>
            
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted hover:bg-primary hover:text-white transition-all"><Icon name="twitter" type="brands"/></a>
              <a href="#" className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted hover:bg-primary hover:text-white transition-all"><Icon name="instagram" type="brands"/></a>
              <a href="#" className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted hover:bg-primary hover:text-white transition-all"><Icon name="linkedin" type="brands"/></a>
              <a href="#" className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted hover:bg-primary hover:text-white transition-all"><Icon name="github" type="brands"/></a>
            </div>

            <div className="text-xs text-muted">
               © 2024 MindSpark AI. All rights reserved.
            </div>
         </div>
      </footer>
    </div>
  );
};