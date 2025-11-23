import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage, Language } from './LanguageContext';
import { logoutUser, loginWithGoogle } from '../services/firebase';
import { Shield, Menu, X, LogOut, Plus, User as UserIcon, LayoutDashboard, Globe } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (e) {
      alert("Login failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  const toggleLanguage = () => {
    if (language === 'en') setLanguage('ru');
    else if (language === 'ru') setLanguage('uz');
    else setLanguage('en');
  };

  const getLangLabel = (lang: Language) => {
    switch(lang) {
      case 'en': return '🇺🇸 EN';
      case 'ru': return '🇷🇺 RU';
      case 'uz': return '🇺🇿 UZ';
      default: return 'EN';
    }
  };

  return (
    <nav className="bg-surface border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold tracking-tighter text-white">
              Key<span className="text-primary">Vault</span>
            </span>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">{t.nav.home}</Link>
              <Link to="/about" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">{t.nav.about}</Link>
              
              {/* Language Switcher Desktop */}
              <button 
                onClick={toggleLanguage}
                className="bg-slate-800 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 border border-slate-700"
              >
                <Globe size={16} />
                {getLangLabel(language)}
              </button>

              {user ? (
                <>
                  <Link to="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                    <LayoutDashboard size={16} /> {t.nav.dashboard}
                  </Link>
                  <Link to="/create" className="bg-primary hover:bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                    <Plus size={16} /> {t.nav.newKey}
                  </Link>
                  <button onClick={handleLogout} className="text-gray-300 hover:text-accent px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                    <LogOut size={16} /> {t.nav.logout}
                  </button>
                  <div className="ml-4 flex items-center gap-2 border-l border-slate-600 pl-4">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt="User" className="h-8 w-8 rounded-full ring-2 ring-primary" />
                    ) : (
                        <UserIcon className="h-8 w-8 p-1 bg-slate-700 rounded-full" />
                    )}
                  </div>
                </>
              ) : (
                <button onClick={handleLogin} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
                  {t.nav.login}
                </button>
              )}
            </div>
          </div>

          <div className="-mr-2 flex md:hidden gap-4">
            <button 
                onClick={toggleLanguage}
                className="bg-slate-800 text-gray-300 hover:text-white px-2 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 border border-slate-700"
              >
                {getLangLabel(language)}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="bg-slate-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-700 focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-surface border-b border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">{t.nav.home}</Link>
            <Link to="/about" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">{t.nav.about}</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">{t.nav.dashboard}</Link>
                <Link to="/create" className="text-primary hover:text-emerald-400 block px-3 py-2 rounded-md text-base font-medium">{t.nav.createKey}</Link>
                <button onClick={handleLogout} className="text-accent hover:text-red-400 block w-full text-left px-3 py-2 rounded-md text-base font-medium">{t.nav.logout}</button>
              </>
            ) : (
              <button onClick={handleLogin} className="text-indigo-400 hover:text-indigo-300 block w-full text-left px-3 py-2 rounded-md text-base font-medium">{t.nav.login}</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;