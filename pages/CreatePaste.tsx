import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { createPaste } from '../services/firebase';
import { Lock, Globe, RefreshCw, Save } from 'lucide-react';

const CreatePaste: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [type, setType] = useState<'text' | 'key' | 'json'>('text');
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
        type
      });
      navigate(`/view/${id}`);
    } catch (error) {
      alert(t.create.error);
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

          <div className="flex flex-col md:flex-row gap-6 justify-between items-center pt-4 border-t border-slate-700">
            <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">{t.create.visibility}</label>
                    <button 
                        type="button"
                        onClick={() => setIsPrivate(!isPrivate)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isPrivate ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-700 text-gray-300'}`}
                    >
                        {isPrivate ? <><Lock size={14} /> {t.create.private}</> : <><Globe size={14} /> {t.create.public}</>}
                    </button>
                </div>
                
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">{t.create.type}</label>
                    <select 
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="bg-slate-900 border border-slate-700 text-white text-sm rounded-md px-2 py-1.5 outline-none focus:border-primary"
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
                className="w-full md:w-auto bg-primary hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
                {submitting ? t.create.encrypting : <><Save size={18} /> {t.create.save}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePaste;