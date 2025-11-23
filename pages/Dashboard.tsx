import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { getUserPastes } from '../services/firebase';
import { PasteData } from '../types';
import { FileText, Eye, Clock, Key, Copy, Plus, Hourglass, Calendar, Search } from 'lucide-react';

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
          // Ensure sorting happens here as well just in case
          const sorted = data.sort((a, b) => {
             const tA = a.createdAt?.seconds || 0;
             const tB = b.createdAt?.seconds || 0;
             return tB - tA;
          });
          setPastes(sorted);
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
    // Could add toast here
  };

  const getExpiryDisplay = (paste: PasteData) => {
    if (!paste.expiresAt) return <span className="text-emerald-500 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded">{t.dashboard.never}</span>;
    
    const now = new Date();
    const expiry = new Date(paste.expiresAt.seconds * 1000);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffTime < 0) return <span className="text-red-500 font-bold text-xs bg-red-500/10 px-2 py-0.5 rounded">{t.dashboard.expired}</span>;
    
    const label = diffDays <= 1 ? "Closing Soon" : `${diffDays} days left`;
    return <span className={`text-xs font-bold px-2 py-0.5 rounded ${diffDays <= 1 ? 'text-orange-500 bg-orange-500/10' : 'text-blue-400 bg-blue-500/10'}`}>{label}</span>;
  };

  if (!user) return <div className="p-10 text-center text-white">Access Denied.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{t.dashboard.title}</h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
                <Calendar size={14}/> {new Date().toLocaleDateString()}
            </p>
        </div>
        <Link to="/create" className="bg-primary hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5">
            <Plus size={20} /> {t.dashboard.create}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
            {[1,2,3].map(i => (
                <div key={i} className="h-24 bg-surface rounded-xl animate-pulse border border-slate-700"></div>
            ))}
        </div>
      ) : pastes.length === 0 ? (
        <div className="text-center py-24 bg-surface rounded-2xl border border-dashed border-slate-700 flex flex-col items-center">
            <div className="bg-slate-800 p-4 rounded-full mb-4">
                <Search className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-medium text-white">{t.dashboard.noKeysTitle}</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">{t.dashboard.noKeysDesc}</p>
            <Link to="/create" className="text-primary hover:text-white font-medium mt-6 border border-primary px-4 py-2 rounded-lg hover:bg-primary transition-colors">{t.dashboard.createNow}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pastes.map((paste) => (
            <div key={paste.id} className="bg-surface rounded-xl border border-slate-700 p-5 flex flex-col md:flex-row items-start md:items-center gap-4 hover:border-primary/50 transition-all group">
              
              <div className={`p-3 rounded-lg flex-shrink-0 ${paste.type === 'key' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                {paste.type === 'key' ? <Key size={24} /> : <FileText size={24} />}
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white truncate">{paste.title}</h3>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${paste.isPrivate ? 'border-red-900 text-red-500' : 'border-green-900 text-green-500'}`}>
                        {paste.isPrivate ? 'PVT' : 'PUB'}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(paste.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Eye size={12} /> {paste.views}</span>
                    <span className="flex items-center gap-1"><Hourglass size={12} /> {getExpiryDisplay(paste)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                <Link to={`/view/${paste.id}`} className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700 text-center">
                    {t.dashboard.view}
                </Link>
                <button onClick={() => copyToClipboard(paste.id!)} className="p-2 bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white rounded-lg border border-slate-700 transition-colors" title="Copy Link">
                    <Copy size={18} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;