import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { createPaste } from '../services/firebase';
import { Lock, Globe, RefreshCw, Save, Clock } from 'lucide-react';

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

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < 3) result += '-';
    }
    setContent(result);
    setType('key');
    if (!title) setTitle('Generated Key ' + new Date().toLocaleTimeString());
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
    try {
      const id = await createPaste({
        title: title || 'Untitled Paste',
        content,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        isPrivate,
        type,
        durationInMinutes: duration,
        durationLabel: getDurationLabel(duration)
      });
      navigate(`/view/${id}`);
    } catch (error: any) {
      console.error(error);
      const msg = error.message && (error.message.includes("timeout") || error.message.includes("offline"))
         ? t.create.timeout
         : t.create.error;
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-surface border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">{t.create.header}</h2>
            <button type="button" onClick={generateRandomKey} className="text-sm text-primary hover:text-emerald-400 flex items-center gap-1 font-medium">
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
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.create.contentPlaceholder}
              rows={12}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-y"
              required
            />
          </div>

          <div className="flex flex-col gap-6 pt-4 border-t border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">{t.create.visibility}</label>
                    <div className="flex gap-2">
                        <button 
                            type="button"
                            onClick={() => setIsPrivate(false)}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors border ${!isPrivate ? 'bg-primary/20 text-primary border-primary/50' : 'bg-slate-800 text-gray-400 border-slate-700'}`}
                        >
                            <Globe size={14} /> {t.create.public}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setIsPrivate(true)}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors border ${isPrivate ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-slate-800 text-gray-400 border-slate-700'}`}
                        >
                            <Lock size={14} /> {t.create.private}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">{t.create.duration}</label>
                    <div className="relative">
                        <Clock size={16} className="absolute left-3 top-2.5 text-gray-500" />
                        <select 
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-md pl-10 pr-3 py-2 outline-none focus:border-primary appearance-none"
                        >
                            <option value={-1}>{t.create.durations.forever}</option>
                            <option value={60}>{t.create.durations.hour1}</option>
                            <option value={1440}>{t.create.durations.day1}</option>
                            <option value={10080}>{t.create.durations.week1}</option>
                            <option value={43200}>{t.create.durations.month1}</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">{t.create.type}</label>
                    <select 
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-primary"
                    >
                        <option value="text">{t.create.text}</option>
                        <option value="json">{t.create.json}</option>
                        <option value="key">{t.create.key}</option>
                    </select>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-primary hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {submitting ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t.create.encrypting}
                    </>
                ) : (
                    <><Save size={18} /> {t.create.save}</>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePaste;