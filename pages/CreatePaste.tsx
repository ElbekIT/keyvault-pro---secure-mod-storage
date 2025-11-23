import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { createPaste, checkDbConnection } from '../services/firebase';
import { Lock, Globe, RefreshCw, Save, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

const CreatePaste: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [type, setType] = useState<'text' | 'key' | 'json'>('text');
  const [duration, setDuration] = useState<number>(-1); // -1 = forever
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed 0, O, 1, I to avoid confusion
    let result = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < 3) result += '-';
    }
    setContent(result);
    setType('key');
    if (!title) setTitle(`MOD-KEY-${new Date().getFullYear()}-${Math.floor(Math.random()*1000)}`);
  };

  const getDurationLabel = (mins: number) => {
    switch(mins) {
        case 60: return t.create.durations.hour1;
        case 1440: return t.create.durations.day1;
        case 10080: return t.create.durations.week1;
        case 43200: return t.create.durations.month1;
        default: return t.create.durations.forever;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setSubmitting(true);
    setStatusMsg(t.create.encrypting);

    try {
      // 1. Check Connection first
      const isOnline = await checkDbConnection();
      if (!isOnline) {
        throw new Error("No Connection to Security Database");
      }

      // 2. Submit
      const id = await createPaste({
        title: title || 'Untitled Secure Paste',
        content,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        isPrivate,
        type,
        durationInMinutes: duration,
        durationLabel: getDurationLabel(duration)
      });
      
      setStatusMsg('Success! Redirecting...');
      setTimeout(() => navigate(`/view/${id}`), 500);

    } catch (error: any) {
      console.error(error);
      let msg = error.message;
      if (msg.includes("timeout") || msg.includes("offline")) {
         msg = t.create.timeout;
      }
      alert("SYSTEM ERROR: " + msg);
      setStatusMsg('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-surface border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative">
        {submitting && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-primary font-mono text-lg animate-pulse">{statusMsg}</p>
            </div>
        )}

        <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-primary" /> {t.create.header}
            </h2>
            <button type="button" onClick={generateRandomKey} className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-md flex items-center gap-2 font-medium transition-colors">
                <RefreshCw size={14} /> {t.create.generate}
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t.create.titleLabel}</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.create.titlePlaceholder}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t.create.contentLabel}</label>
            <div className="relative">
                <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t.create.contentPlaceholder}
                rows={10}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-y"
                required
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-600 font-mono">
                    AES-256 READY
                </div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-400 flex items-center gap-1">
                        <Globe size={14}/> {t.create.visibility}
                    </label>
                    <div className="flex bg-slate-800 p-1 rounded-lg">
                        <button 
                            type="button"
                            onClick={() => setIsPrivate(false)}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-bold transition-all ${!isPrivate ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t.create.public}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setIsPrivate(true)}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-bold transition-all ${isPrivate ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t.create.private}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-400 flex items-center gap-1">
                        <Clock size={14}/> {t.create.duration}
                    </label>
                    <select 
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-primary transition-colors cursor-pointer"
                    >
                        <option value={-1}>{t.create.durations.forever}</option>
                        <option value={60}>{t.create.durations.hour1}</option>
                        <option value={1440}>{t.create.durations.day1}</option>
                        <option value={10080}>{t.create.durations.week1}</option>
                        <option value={43200}>{t.create.durations.month1}</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-400 flex items-center gap-1">
                        <ShieldCheck size={14}/> {t.create.type}
                    </label>
                    <select 
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-primary transition-colors cursor-pointer"
                    >
                        <option value="text">{t.create.text}</option>
                        <option value="json">{t.create.json}</option>
                        <option value="key">{t.create.key}</option>
                    </select>
                </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div className="text-xs text-gray-500 flex items-center gap-1">
                <AlertCircle size={12} />
                Encrypted via Google Cloud Protocol
            </div>
            <button 
                type="submit" 
                disabled={submitting}
                className="bg-primary hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
                <Save size={18} /> {t.create.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePaste;