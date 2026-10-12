import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole, Language } from '../types';
import { AuthUser } from './AuthModal';
import {
  ShieldAlert,
  MapPin,
  List,
  HeartHandshake,
  BarChart3,
  Search,
  PlusCircle,
  Globe,
  Settings,
  Clock,
  LogIn,
  UserCheck,
  Sun,
  Moon,
  Award,
  Check,
  ChevronDown,
  HelpCircle
} from 'lucide-react';

interface NavbarProps {
  currentView: 'map' | 'list' | 'ngo' | 'stats' | 'admin';
  setCurrentView: (view: 'map' | 'list' | 'ngo' | 'stats' | 'admin') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentUser?: AuthUser | null;
  onOpenAuthModal?: () => void;
  onOpenProfileModal?: () => void;
  onOpenReportModal: () => void;
  onOpenTrackModal: () => void;
  onOpenWhatsappBot?: () => void;
  onOpenMapModal?: () => void;
  onOpenFaqModal?: () => void;
  onRunEscalation: () => void;
  slaMinutes: number;
  setSlaMinutes: (mins: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  userRole,
  setUserRole,
  currentUser,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenReportModal,
  onOpenTrackModal,
  onOpenWhatsappBot,
  onOpenMapModal,
  onOpenFaqModal,
  onRunEscalation,
  slaMinutes,
  setSlaMinutes,
}) => {
  const { t, language, setLanguage, languages, currentLanguageObj } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [langToast, setLangToast] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowLangDropdown(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowLangDropdown(false);
      }
    };

    if (showLangDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showLangDropdown]);

  const handleSelectLanguage = (code: Language, nativeName: string) => {
    setLanguage(code);
    setShowLangDropdown(false);
    setLangToast(`${t('language_switched') || 'Language changed to'} ${nativeName}`);
    setTimeout(() => {
      setLangToast(null);
    }, 2800);
  };

  return (
    <>
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setCurrentView('list')}>
            <div className="size-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <ShieldAlert className="size-5 shrink-0" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold tracking-tight text-white leading-none">{t('app_title')}</h1>
                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded font-mono uppercase">
                  GHMC
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block leading-tight mt-1">{t('app_subtitle')}</p>
            </div>
          </div>

          {/* View Nav Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                if (onOpenMapModal) {
                  onOpenMapModal();
                } else {
                  setCurrentView('map');
                }
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                currentView === 'map'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <MapPin className="size-3.5 text-orange-400 shrink-0" />
              <span>{t('gis_map')}</span>
            </button>

            <button
              onClick={() => setCurrentView('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                currentView === 'list'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <List className="size-3.5 shrink-0" />
              <span>{t('list_view')}</span>
            </button>

            <button
              onClick={() => setCurrentView('ngo')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                currentView === 'ngo'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <HeartHandshake className="size-3.5 text-emerald-400 shrink-0" />
              <span>{t('ngo_hub')}</span>
            </button>

            <button
              onClick={() => setCurrentView('stats')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                currentView === 'stats'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="size-3.5 text-sky-400 shrink-0" />
              <span>{t('accountability')}</span>
            </button>

            {/* Admin Panel Tab - Strictly restricted to Admin role */}
            {(userRole === 'admin' || currentUser?.role === 'admin') && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  currentView === 'admin'
                    ? 'bg-purple-900/60 text-purple-200 border-purple-500/50 shadow-sm'
                    : 'text-purple-300 border-purple-800/40 hover:bg-purple-950/50'
                }`}
              >
                <Settings className="size-3.5 text-purple-400 shrink-0" />
                <span>{t('admin_panel')}</span>
                <span className="bg-purple-500/30 text-purple-300 text-[9px] px-1 rounded uppercase tracking-wider font-mono">
                  Admin
                </span>
              </button>
            )}
          </nav>

          {/* Action Controls & Switchers */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-amber-400 hover:text-amber-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-slate-700/60 cursor-pointer"
              title={theme === 'dark' ? t('theme_light') : t('theme_dark')}
            >
              {theme === 'dark' ? <Sun className="size-4 shrink-0 text-amber-300" /> : <Moon className="size-4 shrink-0 text-slate-200" />}
            </button>

            {/* Profile & Certificates Button */}
            {onOpenProfileModal && (
              <button
                onClick={onOpenProfileModal}
                className="p-2 text-amber-400 hover:text-amber-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-slate-700/60 cursor-pointer flex items-center space-x-1"
                title={t('my_profile')}
              >
                <Award className="size-4 shrink-0" />
                <span className="hidden xl:inline text-xs font-semibold text-slate-200">{t('my_certificates')}</span>
              </button>
            )}

            {/* Demo SLA Speed Controller (Restricted to Admin / Official) */}
            {(userRole === 'admin' || currentUser?.role === 'admin' || currentUser?.accountType === 'official') && (
              <div className="hidden xl:flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs text-slate-300">
                <Clock className="size-3.5 text-amber-400 shrink-0" />
                <span className="text-slate-400 text-[11px]">{t('sla_speed')}:</span>
                <select
                  value={slaMinutes}
                  onChange={(e) => setSlaMinutes(Number(e.target.value))}
                  className="bg-transparent text-amber-300 font-semibold cursor-pointer focus:outline-none text-xs"
                >
                  <option value={2} className="bg-slate-900 text-white">{t('speed_2m')}</option>
                  <option value={1440} className="bg-slate-900 text-white">{t('speed_1d')}</option>
                  <option value={21600} className="bg-slate-900 text-white">{t('speed_15d')}</option>
                </select>
              </div>
            )}

            <button
              onClick={onOpenTrackModal}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-slate-700/60 cursor-pointer"
              title={t('track_issue')}
            >
              <Search className="size-4 shrink-0" />
            </button>

            {/* CIR Help & FAQ Button */}
            {onOpenFaqModal && (
              <button
                onClick={onOpenFaqModal}
                className="p-2 text-orange-400 hover:text-orange-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-slate-700/60 cursor-pointer flex items-center space-x-1"
                title="CIR Help & FAQs"
              >
                <HelpCircle className="size-4 shrink-0 text-orange-400" />
                <span className="hidden xl:inline text-xs font-semibold text-slate-200">FAQ</span>
              </button>
            )}

            {/* User Auth Login/Register Button */}
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                  currentUser
                    ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title={currentUser ? `Logged in as ${currentUser.name}` : t('login_btn')}
              >
                {currentUser ? (
                  <>
                    <UserCheck className="size-3.5 text-orange-400 shrink-0" />
                    <span className="max-w-[80px] sm:max-w-[100px] truncate">{currentUser.name}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="size-3.5 shrink-0 text-slate-400" />
                    <span>{t('login_btn')}</span>
                  </>
                )}
              </button>
            )}

            {/* Unified Clean Language Selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                  showLangDropdown
                    ? 'bg-orange-600 text-white border-orange-500 shadow-md ring-2 ring-orange-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title={t('select_language')}
                aria-label="Select Language"
                aria-expanded={showLangDropdown}
              >
                <Globe className="size-3.5 text-orange-400 shrink-0" />
                <span className="font-bold">{currentLanguageObj.nativeName}</span>
                <ChevronDown className={`size-3 transition-transform duration-200 text-slate-400 ${showLangDropdown ? 'rotate-180 text-white' : ''}`} />
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-800/60">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{t('select_language')}</span>
                    <span className="text-[10px] text-orange-400 font-normal">GHMC</span>
                  </div>
                  <div className="py-1">
                    {languages.map((lang) => {
                      const isSelected = language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => handleSelectLanguage(lang.code as Language, lang.nativeName)}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800/90 transition cursor-pointer ${
                            isSelected
                              ? 'text-orange-400 font-bold bg-orange-950/40 border-l-2 border-orange-500'
                              : 'text-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{lang.flag}</span>
                            <div>
                              <div className="font-medium text-xs text-white leading-tight">{lang.nativeName}</div>
                              <div className="text-[10px] text-slate-400">{lang.name}</div>
                            </div>
                          </div>
                          {isSelected && <Check className="size-4 text-orange-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action */}
            <button
              onClick={onOpenReportModal}
              className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 transition shadow-sm cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="size-4 shrink-0" />
              <span className="hidden sm:inline">{t('report_issue')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Language Switch Toast Notification */}
      {langToast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900/95 border border-orange-500/60 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <Globe className="size-4 text-orange-400 shrink-0 animate-pulse" />
          <span>{langToast}</span>
        </div>
      )}

      {/* Responsive Bottom Mobile Navigation Bar for Mobile Viewport Ratios */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-2 px-3 flex items-center justify-around text-[10px] font-semibold text-slate-400">
        <button
          onClick={() => {
            if (onOpenMapModal) onOpenMapModal();
            else setCurrentView('map');
          }}
          className={`flex flex-col items-center space-y-1 cursor-pointer ${currentView === 'map' ? 'text-orange-400' : ''}`}
        >
          <MapPin className="size-4 shrink-0" />
          <span>{t('gis_map')}</span>
        </button>

        <button
          onClick={() => setCurrentView('list')}
          className={`flex flex-col items-center space-y-1 cursor-pointer ${currentView === 'list' ? 'text-orange-400' : ''}`}
        >
          <List className="size-4 shrink-0" />
          <span>{t('list_view')}</span>
        </button>

        <button
          onClick={() => setCurrentView('ngo')}
          className={`flex flex-col items-center space-y-1 cursor-pointer ${currentView === 'ngo' ? 'text-emerald-400' : ''}`}
        >
          <HeartHandshake className="size-4 shrink-0" />
          <span>{t('ngo_hub')}</span>
        </button>

        <button
          onClick={() => setCurrentView('stats')}
          className={`flex flex-col items-center space-y-1 cursor-pointer ${currentView === 'stats' ? 'text-sky-400' : ''}`}
        >
          <BarChart3 className="size-4 shrink-0" />
          <span>{t('accountability')}</span>
        </button>

        {(userRole === 'admin' || currentUser?.role === 'admin') && (
          <button
            onClick={() => setCurrentView('admin')}
            className={`flex flex-col items-center space-y-1 cursor-pointer ${currentView === 'admin' ? 'text-purple-400 font-bold' : 'text-purple-300/80'}`}
          >
            <Settings className="size-4 shrink-0 text-purple-400" />
            <span>{t('admin_panel')}</span>
          </button>
        )}

        {onOpenFaqModal && (
          <button
            onClick={onOpenFaqModal}
            className="flex flex-col items-center space-y-1 cursor-pointer text-orange-400"
          >
            <HelpCircle className="size-4 shrink-0" />
            <span>FAQ</span>
          </button>
        )}

        {onOpenProfileModal && (
          <button
            onClick={onOpenProfileModal}
            className="flex flex-col items-center space-y-1 cursor-pointer text-amber-400"
          >
            <Award className="size-4 shrink-0" />
            <span>{t('my_profile')}</span>
          </button>
        )}
      </div>
    </>
  );
};
