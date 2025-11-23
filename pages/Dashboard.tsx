import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { getUserPastes } from '../services/firebase';
import { PasteData } from '../types';
import { FileText, Eye, Clock, Key, Copy, Plus, Hourglass } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [pastes, setPastes] = useState<PasteData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPastes = async () => {
      if (user) {
        try {
          const data = await getUserPastes(user.uid);
          setPastes(data);
        } catch (error) {
          console.error("Failed to load pastes");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPastes();
  }, [user]);

  const copyToClipboard = (id: string) => {
    const url = `${window.location.origin}/#/view/${id}`;
    navigator.clipboard.writeText(url);
    alert(t.dashboard.copied);
  };

  const getExpiryDisplay = (paste: PasteData) => {
    if (!paste.expiresAt) return <span className="text-green-400">{t.dashboard.never}</span>;
    
    const now = new Date();
    const expiry = new Date(paste.expiresAt.seconds * 1000);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffTime < 0) return <span className="text-red-500 font-bold">{t.dashboard.expired}</span>;
    return <span className="text-amber-400">{diffDays} days</span>;
  };

  if (!user) return <div className="p-10 text-center text-white">Access Denied. Redirecting...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white">{t.dashboard.title}</h1>
            <p className="text-gray-400 mt-1">{t.dashboard.subtitle}</p>
        </div>
        <Link to="/create" className="bg-primary hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all">
            <Plus size={18} /> {t.dashboard.create}
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="col-span-full text-center text-gray-500 animate-pulse">{t.dashboard.loading}</div>
            {[1,2,3].map(i => (
                <div key={i} className="h-40 bg-surface rounded-xl animate-pulse"></div>
            ))}
        </div>
      ) : pastes.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-dashed border-slate-700">
            <Key className="mx-auto h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white">{t.dashboard.noKeysTitle}</h3>
            <p className="text-gray-500 mt-2">{t.dashboard.noKeysDesc}</p>
            <Link to="/create" className="text-primary hover:underline mt-4 inline-block">{t.dashboard.createNow}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastes.map((paste) => (
            <div key={paste.id} className="bg-surface rounded-xl border border-slate-700 overflow-hidden hover:border-primary/50 transition-all group relative">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${paste.type === 'key' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {paste.type === 'key' ? <Key size={20} /> : <FileText size={20} />}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${paste.isPrivate ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-green-500/30 text-green-400 bg-green-500/10'}`}>
                        {paste.isPrivate ? t.dashboard.private : t.dashboard.public}
                    </span>
                </div>
                
                <h3 className="text-lg font-bold text-white truncate mb-2">{paste.title}</h3>
                <div className="flex flex-col gap-2 text-gray-400 text-sm mb-6">
                    <div className="flex justify-between">
                        <span className="flex items-center gap-1"><Eye size={14} /> {paste.views} views</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(paste.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                        <Hourglass size={14} /> 
                        <span className="text-xs uppercase tracking-wide text-gray-500">{t.dashboard.expires}</span>
                        <span className="text-xs font-mono">{getExpiryDisplay(paste)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-auto">
                    <Link to={`/view/${paste.id}`} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded text-sm font-medium text-center transition-colors">
                        {t.dashboard.view}
                    </Link>
                    <button onClick={() => copyToClipboard(paste.id!)} className="p-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded transition-colors" title="Copy Link">
                        <Copy size={18} />
                    </button>
                </div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;