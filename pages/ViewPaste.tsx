import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { getPaste } from '../services/firebase';
import { PasteData } from '../types';
import { Copy, Check, Shield, User, Calendar } from 'lucide-react';

const ViewPaste: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [paste, setPaste] = useState<PasteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      getPaste(id)
        .then(data => {
            if (data) setPaste(data);
            else setError(t.view.notFoundDesc);
        })
        .catch(err => setError('System error fetching data.'))
        .finally(() => setLoading(false));
    }
  }, [id, t]);

  const handleCopy = () => {
    if (paste) {
        navigator.clipboard.writeText(paste.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400 animate-pulse">{t.view.loading}</p>
        </div>
    );
  }

  if (error || !paste) {
    return (
        <div className="max-w-2xl mx-auto mt-20 p-8 bg-surface border border-red-900/50 rounded-2xl text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">{t.view.notFoundTitle}</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <Link to="/" className="text-primary hover:underline">{t.view.returnHome}</Link>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header Info */}
      <div className="bg-surface border border-slate-700 rounded-t-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{paste.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded">
                        <User size={14} className="text-primary" /> {paste.authorName}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded">
                        <Calendar size={14} className="text-secondary" /> 
                        {paste.createdAt ? new Date(paste.createdAt.seconds * 1000).toLocaleDateString() : t.view.justNow}
                    </span>
                    {paste.type === 'key' && (
                        <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                            {t.view.keyType}
                        </span>
                    )}
                </div>
            </div>
            
            <button 
                onClick={handleCopy}
                className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
                    copied 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
            >
                {copied ? <><Check size={18} /> {t.view.copied}</> : <><Copy size={18} /> {t.view.copyRaw}</>}
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-[#0d1117] border-x border-b border-slate-700 rounded-b-2xl p-0 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <span className="text-xs text-slate-500 font-mono">{t.view.readOnly}</span>
        </div>
        <pre className="p-6 md:p-8 overflow-x-auto text-sm md:text-base font-mono text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
            {paste.content}
        </pre>
      </div>

      <div className="mt-8 text-center">
        <Link to="/create" className="text-primary hover:text-emerald-400 text-sm font-medium hover:underline">
            {t.view.createOwn}
        </Link>
      </div>
    </div>
  );
};

export default ViewPaste;