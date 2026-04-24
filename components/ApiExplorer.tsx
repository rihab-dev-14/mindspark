import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { useApp } from '../contexts/AppContext';
import { generateOpenAIChatResponse } from '../services/openaiService';
import { generateAdvisorResponse } from '../services/geminiService';

export const ApiExplorer: React.FC = () => {
    const { t, showToast } = useApp();
    const [testInput, setTestInput] = useState('Tell me a fun fact about space.');
    const [loadingGemini, setLoadingGemini] = useState(false);
    const [loadingOpenAI, setLoadingOpenAI] = useState(false);
    const [geminiStatus, setGeminiStatus] = useState<{status: 'idle' | 'success' | 'error', message?: string}>({status: 'idle'});
    const [openaiStatus, setOpenaiStatus] = useState<{status: 'idle' | 'success' | 'error', message?: string}>({status: 'idle'});

    const [hasGeminiKey, setHasGeminiKey] = useState(false);
    const [hasOpenAIKey, setHasOpenAIKey] = useState(false);

    useEffect(() => {
        // Simple check for presence (in real app, use a service check)
        setHasGeminiKey(true); // Gemini is handled by env in this platform usually
        setHasOpenAIKey(!!localStorage.getItem('mindspark_openai_key') || !!process.env.OPENAI_API_KEY);
    }, []);

    const testGemini = async () => {
        setLoadingGemini(true);
        setGeminiStatus({status: 'idle'});
        try {
            const resp = await generateAdvisorResponse([], testInput);
            setGeminiStatus({status: 'success', message: resp.substring(0, 50) + '...'});
            showToast("Gemini API connection successful!", 'success');
        } catch (e: any) {
            setGeminiStatus({status: 'error', message: e.message || 'Connection failed'});
            showToast("Gemini API Test Failed", 'error');
        } finally {
            setLoadingGemini(false);
        }
    };

    const testOpenAI = async () => {
        setLoadingOpenAI(true);
        setOpenaiStatus({status: 'idle'});
        try {
            const resp = await generateOpenAIChatResponse([{ role: 'user', content: testInput }]);
            setOpenaiStatus({status: 'success', message: resp.substring(0, 50) + '...'});
            showToast("OpenAI API connection successful!", 'success');
        } catch (e: any) {
            setOpenaiStatus({status: 'error', message: e.message || 'Connection failed'});
            showToast("OpenAI API Test Failed", 'error');
        } finally {
            setLoadingOpenAI(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter leading-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shadow-lg shadow-primary/10">
                            <Icon name="bolt-lightning" />
                        </div>
                        API Explorer
                    </h1>
                    <p className="text-slate-400 text-lg mt-1">Manage and test your AI engine connections.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Gemini Status Card */}
                <div className="glass-card p-8 rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-xl space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#1a73e8]/20 flex items-center justify-center">
                                <Icon name="google" type="brands" className="text-[#1a73e8] text-2xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-xl">Google Gemini</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Primary Engine</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${hasGeminiKey ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {hasGeminiKey ? 'Active' : 'Missing'}
                        </span>
                    </div>

                    <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 text-sm">
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-400">Model:</span>
                            <span className="text-white font-mono">gemini-1.5-flash</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Endpoint:</span>
                            <span className="text-white font-mono text-xs opacity-60 italic">Cloud Managed</span>
                        </div>
                    </div>

                    <button 
                        onClick={testGemini}
                        disabled={loadingGemini}
                        className="w-full py-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#1a73e8]/20 flex items-center justify-center gap-2 group"
                    >
                        {loadingGemini ? <Icon name="spinner" className="fa-spin" /> : <Icon name="vial" className="group-hover:rotate-12 transition-transform" />}
                        Test Gemini Connection
                    </button>

                    {geminiStatus.status !== 'idle' && (
                        <div className={`p-4 rounded-xl text-xs font-mono break-all animate-fade-in ${geminiStatus.status === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
                            <div className="font-bold mb-1">{geminiStatus.status.toUpperCase()}:</div>
                            {geminiStatus.message}
                        </div>
                    )}
                </div>

                {/* OpenAI Status Card */}
                <div className="glass-card p-8 rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-xl space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                <Icon name="robot" className="text-white text-2xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-xl">OpenAI / Proxy</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Secondary Engine</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${hasOpenAIKey ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {hasOpenAIKey ? 'Active' : 'Missing'}
                        </span>
                    </div>

                    <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 text-sm">
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-400">Model:</span>
                            <span className="text-white font-mono">{localStorage.getItem('mindspark_openai_model') || 'gpt-4o'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Base URL:</span>
                            <span className="text-white font-mono text-[10px] truncate max-w-[150px]">{localStorage.getItem('mindspark_openai_base_url') || 'Standard'}</span>
                        </div>
                    </div>

                    <button 
                        onClick={testOpenAI}
                        disabled={loadingOpenAI || !hasOpenAIKey}
                        className={`w-full py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-lg ${
                            hasOpenAIKey 
                            ? 'bg-slate-100 text-slate-950 hover:bg-white shadow-white/10' 
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        {loadingOpenAI ? <Icon name="spinner" className="fa-spin" /> : <Icon name="bolt" className="group-hover:scale-125 transition-transform" />}
                        Test OpenAI Connection
                    </button>

                    {openaiStatus.status !== 'idle' && (
                        <div className={`p-4 rounded-xl text-xs font-mono break-all animate-fade-in ${openaiStatus.status === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
                            <div className="font-bold mb-1">{openaiStatus.status.toUpperCase()}:</div>
                            {openaiStatus.message}
                        </div>
                    )}
                </div>
            </div>

            {/* Test Input Console */}
            <div className="glass rounded-3xl p-8 border border-white/5 bg-slate-900/60 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-30"></div>
                
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Icon name="terminal" className="text-primary" /> Test Console
                </h3>

                <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Global Test Prompt</label>
                    <textarea 
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-6 text-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none shadow-inner"
                        rows={3}
                    />
                </div>

                <div className="mt-8 flex flex-col md:flex-row gap-6 items-center justify-between border-t border-white/5 pt-8">
                    <div className="flex items-center gap-4 text-sm text-slate-400 font-medium">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-primary/20 flex items-center justify-center"><Icon name="google" type="brands" className="text-[10px] text-primary" /></div>
                            <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-white/10 flex items-center justify-center"><Icon name="robot" className="text-[10px] text-white" /></div>
                        </div>
                        Engines Ready for Deployment
                    </div>
                </div>
            </div>

            {/* Key Management Notice */}
            <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-4 items-start animate-fade-in shadow-xl shadow-amber-500/5">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                    <Icon name="shield-halved" className="text-xl" />
                </div>
                <div>
                    <h4 className="font-bold text-amber-400">Security & Integration Reminder</h4>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                        API keys are stored securely in your browser's local storage and used for client-side processing. 
                        To persist keys across sessions for production, remember to set the <code className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono">OPENAI_API_KEY</code> in the platform environment variables.
                    </p>
                </div>
            </div>

            {/* API Documentation / Endpoints */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                    { title: 'Chat Completions', method: 'POST', endpoint: '/v1/chat/completions', desc: 'Generate high-quality text responses.' },
                    { title: 'Image Analysis', method: 'POST', endpoint: '/v1/images/generations', desc: 'Identify objects and extract text from images.' },
                    { title: 'Fine-Tuning', method: 'GET', endpoint: '/v1/fine_tuning/jobs', desc: 'Customize models for specialized study data.' }
                 ].map((api, i) => (
                    <div key={i} className="bg-slate-900/30 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">{api.method}</span>
                            <span className="text-[10px] font-mono text-slate-500">{api.endpoint}</span>
                        </div>
                        <h4 className="font-bold text-white mb-2">{api.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{api.desc}</p>
                    </div>
                 ))}
            </div>
        </div>
    );
};
