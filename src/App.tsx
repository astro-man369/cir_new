import React, { useState, useEffect } from 'react';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { IssueMap } from './components/IssueMap';
import { IssueList } from './components/IssueList';
import { NgoDashboard } from './components/NgoDashboard';
import { AccountabilityDashboard } from './components/AccountabilityDashboard';
import { AdminPanel } from './components/AdminPanel';
import { ReportIssueModal } from './components/ReportIssueModal';
import { IssueDetailModal } from './components/IssueDetailModal';
import { TrackIssueModal } from './components/TrackIssueModal';
import { WhatsAppBotModal } from './components/WhatsAppBotModal';
import { AuthModal, AuthUser } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { MapModal } from './components/MapModal';
import { FaqModal } from './components/FaqModal';
import { Issue, NGO, NGOEvent, UserRole } from './types';
import { Zap, MessageCircle, ShieldAlert } from 'lucide-react';

function AppContent() {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('cs_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('cs_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.role || 'citizen';
      }
    } catch {}
    return 'citizen';
  });

  const [currentView, setCurrentView] = useState<'map' | 'list' | 'ngo' | 'stats' | 'admin'>(() => {
    try {
      const saved = localStorage.getItem('cs_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'admin') return 'admin';
        if (parsed.role === 'ngo_admin') return 'ngo';
      }
    } catch {}
    return 'list';
  });

  const [slaMinutes, setSlaMinutes] = useState<number>(2); // Default 2 mins for demo pitch speed

  const [issues, setIssues] = useState<Issue[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [events, setEvents] = useState<NGOEvent[]>([]);

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isWhatsappBotOpen, setIsWhatsappBotOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [whatsappTrackingCode, setWhatsappTrackingCode] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setUserRole(user.role);
    try {
      localStorage.setItem('cs_user_session', JSON.stringify(user));
    } catch (e) {
      console.warn('Could not save user session', e);
    }

    if (user.role === 'admin' || user.accountType === 'official') {
      setCurrentView('admin');
      showToast(`🏛️ Welcome Officer ${user.name}! Switched to Admin Console.`);
    } else if (user.role === 'ngo_admin' || user.accountType === 'ngo') {
      setCurrentView('ngo');
      showToast(`🤝 Welcome ${user.name}! Switched to NGO Hub.`);
    } else {
      setCurrentView('list');
      showToast(`👤 Welcome ${user.name}! Logged in as Citizen.`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole('citizen');
    try {
      localStorage.removeItem('cs_user_session');
    } catch (e) {
      console.warn('Could not remove user session', e);
    }
    if (currentView === 'admin') {
      setCurrentView('list');
    }
    showToast('Logged out of CIR.');
  };

  // Background SLA Escalation Check Loop
  useEffect(() => {
    const interval = setInterval(() => {
      runEscalationCheckSilent();
    }, 15000); // Check every 15s

    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [resIssues, resNgos, resEvents] = await Promise.all([
        fetch('/api/issues'),
        fetch('/api/ngos'),
        fetch('/api/events'),
      ]);

      const dataIssues = await resIssues.json();
      const dataNgos = await resNgos.json();
      const dataEvents = await resEvents.json();

      setIssues(dataIssues.issues || []);
      setNgos(dataNgos.ngos || []);
      setEvents(dataEvents.events || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const runEscalationCheckSilent = async () => {
    try {
      const res = await fetch('/api/escalation/check', { method: 'POST' });
      const data = await res.json();
      if (data.escalatedCount && data.escalatedCount > 0) {
        showToast(`⚡ Escalation Engine: ${data.escalatedCount} complaint(s) breached SLA and escalated!`);
        fetchAllData();
      }
    } catch (err) {
      console.warn('Silent escalation check error:', err);
    }
  };

  const handleRunEscalationManual = async () => {
    try {
      const res = await fetch('/api/escalation/check', { method: 'POST' });
      const data = await res.json();
      showToast(`⚡ Escalation Engine Executed: ${data.escalatedCount || 0} issue(s) escalated.`);
      fetchAllData();
    } catch (err) {
      console.error('Escalation error:', err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const handleIssueSubmitted = (newIssue: Issue) => {
    showToast(`✅ Civic Complaint #${newIssue.tracking_code} filed and official email dispatched to Tier 1 Municipal Officer!`);
    fetchAllData();
    setSelectedIssue(newIssue);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white pb-14 lg:pb-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 transition-all duration-300">
          <Zap className="size-4 text-amber-400 fill-amber-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Navbar Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        userRole={userRole}
        setUserRole={setUserRole}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
        onOpenWhatsappBot={() => {
          setWhatsappTrackingCode(undefined);
          setIsWhatsappBotOpen(true);
        }}
        onOpenMapModal={() => setIsMapModalOpen(true)}
        onOpenFaqModal={() => setIsFaqModalOpen(true)}
        onRunEscalation={handleRunEscalationManual}
        slaMinutes={slaMinutes}
        setSlaMinutes={setSlaMinutes}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'map' && (
          <IssueMap
            issues={issues}
            ngos={ngos}
            events={events}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
          />
        )}

        {currentView === 'list' && (
          <IssueList
            issues={issues}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenMapModal={() => setIsMapModalOpen(true)}
          />
        )}

        {currentView === 'ngo' && (
          <NgoDashboard
            ngos={ngos}
            events={events}
            issues={issues}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            onRefreshData={fetchAllData}
            userRole={userRole}
            currentUser={currentUser}
          />
        )}

        {currentView === 'stats' && <AccountabilityDashboard />}

        {currentView === 'admin' && (
          userRole === 'admin' || currentUser?.role === 'admin' || currentUser?.accountType === 'official' ? (
            <AdminPanel
              ngos={ngos}
              issues={issues}
              onRefreshData={fetchAllData}
              onRunEscalation={handleRunEscalationManual}
            />
          ) : (
            <div className="max-w-2xl mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl">
              <div className="size-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
                <ShieldAlert className="size-7 shrink-0" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Access Denied: Admin Privileges Required</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                You are currently logged in with a <strong>{(userRole || 'citizen').toUpperCase()}</strong> account. Access to the Municipal Admin Console is strictly restricted to authorized Municipal Officers and Super Admins.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer transition shadow-md flex items-center space-x-2"
                >
                  <span>Sign In as Municipal Admin</span>
                </button>
                <button
                  onClick={() => setCurrentView('list')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer transition border border-slate-700"
                >
                  Return to Complaints List
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Floating GHMC WhatsApp Assistant Launch Button */}
      <button
        onClick={() => {
          setWhatsappTrackingCode(undefined);
          setIsWhatsappBotOpen(true);
        }}
        className="fixed bottom-16 lg:bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-lg border border-emerald-400 flex items-center space-x-2 transition cursor-pointer"
        title="Open GHMC CIR WhatsApp Assistant"
      >
        <MessageCircle className="size-5 text-white fill-white shrink-0" />
        <span className="hidden sm:inline font-semibold text-xs whitespace-nowrap">
          WhatsApp Helpline
        </span>
      </button>

      {/* Citizen & NGO Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* User Profile & Certificates Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onOpenTrackModal={(code) => {
          setIsTrackModalOpen(true);
        }}
      />

      {/* Pop-up Live GIS Map Modal */}
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        issues={issues}
        ngos={ngos}
        events={events}
        onSelectIssue={(issue) => setSelectedIssue(issue)}
      />

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onIssueSubmitted={handleIssueSubmitted}
        defaultSlaMinutes={slaMinutes}
      />

      {/* Issue Detail & Audit Trail Modal */}
      <IssueDetailModal
        issue={selectedIssue}
        userRole={userRole}
        currentUser={currentUser}
        onClose={() => setSelectedIssue(null)}
        onRefreshData={fetchAllData}
        onOpenWhatsappBot={(code) => {
          setWhatsappTrackingCode(code);
          setIsWhatsappBotOpen(true);
        }}
      />

      {/* Track Anonymous Complaint Code Modal */}
      <TrackIssueModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        onSelectIssue={(issue) => setSelectedIssue(issue)}
      />

      {/* WhatsApp Bot Modal */}
      <WhatsAppBotModal
        isOpen={isWhatsappBotOpen}
        onClose={() => setIsWhatsappBotOpen(false)}
        initialTrackingCode={whatsappTrackingCode}
        onSelectIssue={(issue) => setSelectedIssue(issue)}
      />

      {/* CIR Help & FAQ Knowledge Base Modal */}
      <FaqModal
        isOpen={isFaqModalOpen}
        onClose={() => setIsFaqModalOpen(false)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
        onOpenWhatsappBot={() => {
          setWhatsappTrackingCode(undefined);
          setIsWhatsappBotOpen(true);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
