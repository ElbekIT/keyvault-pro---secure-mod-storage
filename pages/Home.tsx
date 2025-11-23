import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Zap, Code, ShieldCheck, Database } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { loginWithGoogle } from '../services/firebase';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    if (user) {
      navigate('/dashboard');
    } else {
      try {
        await loginWithGoogle();
        navigate('/dashboard');
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 mb-8 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-sm text-gray-300 font-medium">{t.home.status}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            {t.home.titleStart} <span className="text-primary">{t.home.titleEnd}</span> {t.home.titleSuffix}
          </h1>
          
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10">
            {t.home.desc}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={handleGetStarted} className="px-8 py-4 bg-primary hover:bg-emerald-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2">
              {user ? t.home.dashboardBtn : t.home.startBtn} <Zap size={20} />
            </button>
            <Link to="/about" className="px-8 py-4 bg-surface hover:bg-slate-700 border border-slate-600 text-gray-300 font-bold rounded-lg transition-all flex items-center justify-center gap-2">
              {t.home.learnMore}
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<ShieldCheck className="text-primary" size={32} />}
            title={t.home.feat1Title}
            desc={t.home.feat1Desc}
          />
          <FeatureCard 
            icon={<Code className="text-secondary" size={32} />}
            title={t.home.feat2Title}
            desc={t.home.feat2Desc}
          />
          <FeatureCard 
            icon={<Database className="text-accent" size={32} />}
            title={t.home.feat3Title}
            desc={t.home.feat3Desc}
          />
        </div>
      </div>
      
      {/* Trust Badge Section */}
      <div className="border-t border-slate-800 bg-slate-900/50 py-12">
        <div className="max-w-4xl mx-auto text-center">
            <p className="text-slate-500 text-sm uppercase tracking-widest mb-4">{t.home.poweredBy}</p>
            <div className="flex justify-center items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Simple Text Logos for demo */}
                <span className="text-2xl font-bold text-white">Firebase</span>
                <span className="text-2xl font-bold text-white">Google Cloud</span>
                <span className="text-2xl font-bold text-white">React</span>
            </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{icon: React.ReactNode, title: string, desc: string}> = ({ icon, title, desc }) => (
  <div className="bg-surface p-8 rounded-2xl border border-slate-700 hover:border-primary/50 transition-colors group">
    <div className="bg-slate-900 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ring-1 ring-slate-700 group-hover:ring-primary">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

export default Home;