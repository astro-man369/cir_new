import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { UserRole } from '../types';
import {
  X,
  User,
  HeartHandshake,
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  Building2,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LogOut
} from 'lucide-react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  accountType: 'citizen' | 'ngo' | 'official';
  ngoName?: string;
  ngoAreas?: string[];
  wardName?: string;
  departmentName?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onLoginSuccess: (user: AuthUser) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const { t } = useTranslation();
  const [accountType, setAccountType] = useState<'citizen' | 'ngo' | 'official'>('citizen');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [wardName, setWardName] = useState('Shivajinagar (Ward 1)');
  const [deptName, setDeptName] = useState('Roads & Sanitation Dept');

  // NGO specific states
  const [ngoName, setNgoName] = useState('');
  const [darpanRegNo, setDarpanRegNo] = useState('');
  const [ngoFocus, setNgoFocus] = useState('Roads, Potholes & Waste Management');

  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (accountType === 'citizen') {
      const user: AuthUser = {
        id: `usr_cit_${Date.now()}`,
        name: isRegisterMode ? (fullName || 'Hyderabad Citizen') : (email.split('@')[0] || 'Citizen'),
        email: email || 'citizen@ghmc.gov.in',
        phone: phone || '+91 98490 12345',
        role: 'citizen',
        accountType: 'citizen',
        wardName: wardName,
      };
      onLoginSuccess(user);
      setMessage(isRegisterMode ? '🎉 Citizen account registered successfully!' : '✅ Citizen logged in!');
      setTimeout(() => onClose(), 800);
    } else if (accountType === 'ngo') {
      const user: AuthUser = {
        id: `usr_ngo_${Date.now()}`,
        name: isRegisterMode ? (fullName || 'NGO Admin') : 'NGO Representative',
        email: email || 'contact@swachhhyderabad.org',
        phone: phone || '+91 98490 23456',
        role: 'ngo_admin',
        accountType: 'ngo',
        ngoName: isRegisterMode ? (ngoName || 'Swachh Hyderabad Foundation') : 'Swachh Hyderabad Foundation',
        ngoAreas: ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Madhapur', 'Charminar'],
      };
      onLoginSuccess(user);
      setMessage(isRegisterMode ? '🎉 NGO Organization account registered & verified!' : '✅ NGO Admin logged in!');
      setTimeout(() => onClose(), 800);
    } else {
      const user: AuthUser = {
        id: `usr_adm_${Date.now()}`,
        name: isRegisterMode ? (fullName || 'Municipal Officer K. V. Rao') : (fullName || email.split('@')[0] || 'Municipal Admin Officer'),
        email: email || 'officer.rao@ghmc.gov.in',
        phone: phone || '+91 040 21111111',
        role: 'admin',
        accountType: 'official',
        wardName: 'GHMC Head Office, Tank Bund',
        departmentName: deptName || 'Municipal SLA Oversight',
      };
      onLoginSuccess(user);
      setMessage(isRegisterMode ? '🎉 Municipal Admin Officer account authorized!' : '🏛️ Admin Officer Logged In!');
      setTimeout(() => onClose(), 800);
    }
  };

  const handleQuickDemoLogin = (type: 'citizen' | 'ngo' | 'official') => {
    if (type === 'citizen') {
      const user: AuthUser = {
        id: 'user_cit_demo',
        name: 'Ananya Reddy',
        email: 'ananya.reddy@ghmc.gov.in',
        phone: '+91 98490 12345',
        role: 'citizen',
        accountType: 'citizen',
        wardName: 'Banjara Hills (Ward 93)',
      };
      onLoginSuccess(user);
    } else if (type === 'ngo') {
      const user: AuthUser = {
        id: 'user_ngo_demo',
        name: 'Siddharth Rao (Lead)',
        email: 'contact@swachhhyderabad.org',
        phone: '+91 98490 23456',
        role: 'ngo_admin',
        accountType: 'ngo',
        ngoName: 'Swachh Hyderabad Foundation',
        ngoAreas: ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Madhapur'],
      };
      onLoginSuccess(user);
    } else {
      const user: AuthUser = {
        id: 'user_admin_demo',
        name: 'Municipal Officer K. V. Rao',
        email: 'officer.rao@ghmc.gov.in',
        phone: '+91 040 21111111',
        role: 'admin',
        accountType: 'official',
        wardName: 'GHMC Head Office, Tank Bund',
      };
      onLoginSuccess(user);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="bg-slate-950 border-b border-slate-800 p-5 relative text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg transition cursor-pointer"
          >
            <X className="size-4 shrink-0" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
              {accountType === 'citizen' ? <User className="size-5 shrink-0 text-orange-400" /> : <HeartHandshake className="size-5 shrink-0 text-emerald-400" />}
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">
                {currentUser ? 'User Account Profile' : (isRegisterMode ? 'Create New Account' : 'CIR Login')}
              </h2>
              <p className="text-xs text-slate-400">
                {currentUser ? `Logged in as ${currentUser.name}` : 'Hyderabad Citizen & GHMC Registered NGO Portal'}
              </p>
            </div>
          </div>
        </div>

        {/* If user is already logged in */}
        {currentUser ? (
          <div className="p-6 space-y-5">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Account Type</span>
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase">
                  {currentUser.accountType} Account
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-white">{currentUser.name}</h3>
                <p className="text-xs text-slate-300 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-orange-400" />
                  <span>{currentUser.email}</span>
                </p>
                {currentUser.phone && (
                  <p className="text-xs text-slate-300 flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{currentUser.phone}</span>
                  </p>
                )}
                {currentUser.ngoName && (
                  <p className="text-xs text-amber-300 font-semibold flex items-center space-x-1.5 pt-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>NGO: {currentUser.ngoName}</span>
                  </p>
                )}
                {currentUser.wardName && (
                  <p className="text-xs text-indigo-300 font-semibold flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Area: {currentUser.wardName}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={onLogout}
                className="w-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of CIR</span>
              </button>

              <button
                onClick={onClose}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-xl text-xs font-semibold"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          /* Login & Registration Form */
          <div className="p-6 space-y-5">
            {/* Account Selector Tabs (Citizen vs NGO vs Official Admin) */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAccountType('citizen');
                  setMessage(null);
                }}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  accountType === 'citizen'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Citizen</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccountType('ngo');
                  setMessage(null);
                }}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  accountType === 'ngo'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>NGO Hub</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccountType('official');
                  setMessage(null);
                }}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  accountType === 'official'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Success Message Banner */}
            {message && (
              <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Quick Demo Login Preset Buttons */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <span>⚡ 1-Click Role Logins</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('citizen')}
                  className="bg-slate-900 hover:bg-slate-800 text-orange-300 border border-orange-500/30 p-2 rounded-xl text-[10px] font-bold text-left transition cursor-pointer"
                >
                  👤 Citizen
                  <span className="block text-[9px] text-slate-400 font-normal truncate">Ananya R.</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('ngo')}
                  className="bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 p-2 rounded-xl text-[10px] font-bold text-left transition cursor-pointer"
                >
                  🤝 NGO Lead
                  <span className="block text-[9px] text-slate-400 font-normal truncate">Swachh Hyd.</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('official')}
                  className="bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 p-2 rounded-xl text-[10px] font-bold text-left transition cursor-pointer"
                >
                  🏛️ Admin
                  <span className="block text-[9px] text-slate-400 font-normal truncate">Officer Rao</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Extra Register Fields */}
              {isRegisterMode && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {accountType === 'citizen' ? 'Full Name' : 'Contact Representative Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={accountType === 'citizen' ? 'Ananya Reddy' : 'Siddharth Rao'}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {accountType === 'ngo' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">NGO Organization Name</label>
                        <input
                          type="text"
                          required
                          value={ngoName}
                          onChange={(e) => setNgoName(e.target.value)}
                          placeholder="e.g. Swachh Hyderabad Foundation NGO"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Darpan NGO Registration ID (Optional)</label>
                        <input
                          type="text"
                          value={darpanRegNo}
                          onChange={(e) => setDarpanRegNo(e.target.value)}
                          placeholder="e.g. TS/2022/039412"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number (WhatsApp Alerts)</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98490 12345"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {accountType === 'citizen' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">GHMC Ward / Division</label>
                      <select
                        value={wardName}
                        onChange={(e) => setWardName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="Banjara Hills (Ward 93)">Banjara Hills (Ward 93)</option>
                        <option value="Jubilee Hills (Ward 94)">Jubilee Hills (Ward 94)</option>
                        <option value="Gachibowli - Hitec City (Ward 105)">Gachibowli - Hitec City (Ward 105)</option>
                        <option value="Madhapur (Ward 106)">Madhapur (Ward 106)</option>
                        <option value="Charminar (Ward 75)">Charminar (Ward 75)</option>
                        <option value="Kukatpally (Ward 114)">Kukatpally (Ward 114)</option>
                        <option value="Secunderabad (Ward 147)">Secunderabad (Ward 147)</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Standard Email & Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {accountType === 'citizen'
                    ? 'Citizen Email Address'
                    : accountType === 'ngo'
                    ? 'NGO Official Email'
                    : 'Municipal Officer / Admin Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      accountType === 'citizen'
                        ? 'citizen@ghmc.gov.in'
                        : accountType === 'ngo'
                        ? 'contact@swachhhyderabad.org'
                        : 'officer.rao@ghmc.gov.in'
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Password / Passcode</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg cursor-pointer ${
                  accountType === 'citizen'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
                    : accountType === 'ngo'
                    ? 'bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                }`}
              >
                <span>
                  {isRegisterMode
                    ? `Register ${accountType === 'citizen' ? 'Citizen' : accountType === 'ngo' ? 'NGO' : 'Admin'} Account`
                    : `Sign In as ${accountType === 'citizen' ? 'Citizen' : accountType === 'ngo' ? 'NGO Lead' : 'Municipal Admin'}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setMessage(null);
                }}
                className="text-xs text-orange-400 hover:text-orange-300 font-semibold underline cursor-pointer"
              >
                {isRegisterMode
                  ? 'Already have an account? Sign in here'
                  : `Don't have an account? Register as ${accountType === 'citizen' ? 'Citizen' : accountType === 'ngo' ? 'NGO' : 'Municipal Admin'}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
