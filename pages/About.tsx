import React from 'react';
import { Shield, Lock, Server, Cpu, Globe, CheckCircle, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';

const About: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-white pb-20">
      {/* Header */}
      <div className="bg-surface border-b border-slate-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 mb-6 animate-pulse">
            <Terminal size={14} />
            <span className="text-xs font-mono font-bold uppercase tracking-widest">{t.about.tag}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t.about.titleStart} <span className="text-primary">{t.about.titleEnd}</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t.about.desc}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats / Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
            <StatusCard label={t.about.status} value={t.about.operational} color="text-green-500" />
            <StatusCard label={t.about.encryption} value="AES-256 STANDARD" color="text-blue-500" />
            <StatusCard label={t.about.latency} value="24ms" color="text-primary" />
            <StatusCard label={t.about.totalKeys} value="14,205+" color="text-amber-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Main Content */}
          <div className="space-y-8">
            <Section 
              icon={<Shield className="text-primary" size={24} />}
              title={t.about.whyTitle}
              content={t.about.whyDesc}
            />
            
            <Section 
              icon={<Lock className="text-secondary" size={24} />}
              title={t.about.authTitle}
              content={t.about.authDesc}
            />

            <Section 
              icon={<Server className="text-accent" size={24} />}
              title={t.about.infraTitle}
              content={t.about.infraDesc}
            />

            <div className="bg-surface border border-slate-700 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Cpu size={20} className="text-gray-400" /> {t.about.supported}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {['JSON', 'XML', 'LUA', 'C++', 'Python', 'Plain Text', 'License Keys', 'Base64'].map(tag => (
                        <span key={tag} className="bg-slate-800 text-gray-300 px-3 py-1 rounded text-sm font-mono border border-slate-600">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
          </div>

          {/* Side Panel / Visual */}
          <div className="bg-surface border border-slate-700 rounded-2xl p-8 sticky top-24">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Globe className="text-primary" /> {t.about.securityNet}
            </h3>
            
            <ul className="space-y-4">
                {t.about.features.map((feature: string, idx: number) => (
                   <FeatureItem key={idx} text={feature} />
                ))}
            </ul>

            <div className="mt-8 pt-8 border-t border-slate-700">
                <h4 className="font-bold text-white mb-2">{t.about.ready}</h4>
                <p className="text-gray-400 text-sm mb-4">{t.about.join}</p>
                <Link to="/create" className="block w-full bg-primary hover:bg-emerald-600 text-white text-center font-bold py-3 rounded-lg transition-colors shadow-lg shadow-emerald-500/20">
                    {t.about.createBtn}
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusCard: React.FC<{label: string, value: string, color: string}> = ({ label, value, color }) => (
    <div className="bg-surface border border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center text-center">
        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</span>
        <span className={`text-xl font-mono font-bold ${color}`}>{value}</span>
    </div>
);

const Section: React.FC<{icon: React.ReactNode, title: string, content: string}> = ({ icon, title, content }) => (
    <div className="flex gap-4">
        <div className="flex-shrink-0 mt-1 bg-slate-800 p-2 rounded-lg h-fit border border-slate-700">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{content}</p>
        </div>
    </div>
);

const FeatureItem: React.FC<{text: string}> = ({ text }) => (
    <li className="flex items-center gap-3 text-gray-300">
        <CheckCircle size={16} className="text-primary flex-shrink-0" />
        <span>{text}</span>
    </li>
);

export default About;