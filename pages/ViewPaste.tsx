import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { getPaste } from '../services/firebase';
import { PasteData } from '../types';
import { Copy, Check, Shield, User, Calendar, Clock, AlertTriangle, FileCode, Lock, Terminal } from 'lucide-react';

const ViewPaste: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [paste, setPaste] = useState<PasteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (id) {
      getPaste(id)
        .then(data => {
            if (data) {
                // Check expiration
                if (data.expiresAt) {
                    const now = new Date();
                    const expiry = new Date(data.expiresAt.seconds * 1000);
                    if (now > expiry) {
                        setIsExpired(true);
                        setLoading(false);
                        return;
                    }
                }
                setPaste(data);
            } else {
                setError(t.view.notFoundDesc);
            }
        })
        .catch(err => setError('System error: ' + err.message))
        .finally(() => setLoading(false));
    }
  }, [id, t]);

  // Live countdown timer
  useEffect(() => {
    if (!paste?.expiresAt || isExpired) return;

    const interval = setInterval(() => {
        const now = new Date();
        const expiry = new Date(paste.expiresAt.seconds * 1000);
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) {
            setIsExpired(true);
            clearInterval(interval);
        } else {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [paste, isExpired]);

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
            <p className="mt-6 text-primary font-mono animate-pulse uppercase tracking-widest">{t.view.loading}</p>
        </div>
    );
  }

  if (isExpired) {
    return (
        <div className="max-w-2xl mx-auto mt-20 p-10 bg-slate-900 border-2 border-red-600 rounded-xl text-center shadow-2xl shadow-red-900/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-600 animate-pulse"></div>
            <div className="bg-red-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-red-500/20">
                <Lock className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">{t.view.expiredTitle}</h2>
            <p className="text-gray-400 mb-8 text-lg font-mono">{t.view.expiredDesc}</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-lg font-bold transition-all border border-slate-600 hover:border-white">
                {t.view.returnHome}
            </Link>
        </div>
    );
  }

  if (error || !paste) {
    return (
        <div className="max-w-2xl mx-auto mt-20 p-8 bg-surface border border-dashed border-red-500 rounded-2xl text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">{t.view.notFoundTitle}</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <Link to="/" className="text-primary hover:underline">{t.view.returnHome}</Link>
        </div>
    );
  }

  const isKey = paste.type === 'key';

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      
      {/* Security Badge */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-full px-4 py-1 text-xs font-mono text-gray-400">
            <Shield size={12} className="text-primary" />
            SECURE CONNECTION ESTABLISHED
        </div>
      </div>

      <div className="bg-surface border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-slate-800/80 p-6 md:p-8 border-b border-slate-700 flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    {isKey ? <div className="bg-amber-500/20 text-amber-500 p-2 rounded"><Lock size={20}/></div> 
                           : <div className="bg-blue-500/20 text-blue-500 p-2 rounded"><FileCode size={20}/></div>}
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{paste.title}</h1>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400 font-medium">
                    <span className="flex items-center gap-2">
                        <User size={14} className="text-primary" /> {paste.authorName}
                    </span>
                    <span className="flex items-center gap-2">
                        <Calendar size={14} className="text-secondary" /> 
                        {paste.createdAt ? new Date(paste.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                    </span>
                    {paste.expiresAt && (
                        <span className={`flex items-center gap-2 px-2 py-0.5 rounded ${Number(timeLeft.split('d')[0]) < 1 ? 'bg-red-500/10 text-red-400 animate-pulse' : 'bg-slate-700 text-amber-400'}`}>
                             <Clock size={14} /> 
                             <span className="font-mono">{timeLeft || 'Calculating...'}</span>
                        </span>
                    )}
                </div>
            </div>

            <button 
                onClick={handleCopy}
                className={`flex-shrink-0 px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 ${
                    copied 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                    : 'bg-primary text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600'
                }`}
            >
                {copied ? <><Check size={20} /> {t.view.copied}</> : <><Copy size={20} /> {t.view.copyRaw}</>}
            </button>
        </div>

        {/* Content Body */}
        <div className="bg-[#0d1117] relative group min-h-[200px]">
            {isKey ? (
                <div className="p-10 flex items-center justify-center flex-col">
                    <p className="text-gray-500 mb-4 text-sm font-mono uppercase tracking-widest">Decrypted License Key</p>
                    <div className="bg-slate-900 border-2 border-primary/30 p-6 rounded-lg shadow-2xl shadow-primary/10 relative overflow-hidden group-hover:border-primary transition-colors w-full max-w-2xl text-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary/50"></div>
                        <code className="text-2xl md:text-4xl font-mono text-primary font-bold tracking-wider break-all selection:bg-primary selection:text-white">
                            {paste.content}
                        </code>
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <div className="absolute top-0 left-0 w-8 h-full bg-slate-900/50 border-r border-slate-800 flex flex-col items-center pt-4 text-xs text-slate-600 font-mono select-none">
                        <span>1</span><span>2</span><span>3</span>
                    </div>
                    <pre className="p-6 pl-12 overflow-x-auto text-sm md:text-base font-mono text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                        {paste.content}
                    </pre>
                </div>
            )}
        </div>
        
        {/* Footer */}
        <div className="bg-slate-800/50 p-4 border-t border-slate-700 flex justify-between items-center text-xs text-slate-500 font-mono">
            <div className="flex items-center gap-2">
                <Terminal size={12} />
                <span>EOH (End of Header)</span>
            </div>
            <div>
                ID: {paste.id?.substring(0,8)}...
            </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/create" className="text-primary hover:text-emerald-400 font-medium hover:underline inline-flex items-center gap-2">
            {t.view.createOwn} <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
};

export default ViewPaste;