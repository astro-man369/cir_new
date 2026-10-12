import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { AuthUser } from './AuthModal';
import { generateVolunteerCertificate } from '../lib/pdf';
import {
  User,
  Award,
  Download,
  Calendar,
  FileText,
  X,
  CheckCircle2,
  Clock,
  HeartHandshake,
  ShieldCheck,
  Mail,
  UserCheck
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onOpenTrackModal?: (trackingCode?: string) => void;
}

interface UserReg {
  id: string;
  event_id: string;
  user_name: string;
  user_email: string;
  eventTitle: string;
  ngoName: string;
  eventDate: string;
  attended: boolean;
  certificate_issued: boolean;
  certificate_id?: string;
  registered_at?: string;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenTrackModal,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'certs' | 'drives' | 'complaints'>('certs');
  const [registrations, setRegistrations] = useState<UserReg[]>([]);
  const [loading, setLoading] = useState(false);
  const [myComplaints, setMyComplaints] = useState<any[]>([]);

  const userEmail = currentUser?.email || 'ananya.reddy@example.com';
  const userName = currentUser?.name || 'Ananya Reddy';

  useEffect(() => {
    if (isOpen && userEmail) {
      fetchUserData();
    }
  }, [isOpen, userEmail]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch registrations
      const res = await fetch(`/api/users/registrations?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      setRegistrations(data.registrations || []);

      // Fetch user complaints
      const issuesRes = await fetch('/api/issues');
      const issuesData = await issuesRes.json();
      const userIssues = (issuesData.issues || []).filter(
        (i: any) => i.reporter_email?.toLowerCase() === userEmail.toLowerCase()
      );
      setMyComplaints(userIssues);
    } catch (err) {
      console.error('Error fetching user profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const earnedCerts = registrations.filter((r) => r.certificate_issued || r.attended);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{userName}</h2>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center space-x-1">
                  <ShieldCheck className="size-3 shrink-0" />
                  <span>Verified Citizen</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1">
                <Mail className="size-3.5 text-slate-500 shrink-0" />
                <span>{userEmail}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 space-x-1">
          <button
            onClick={() => setActiveTab('certs')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'certs'
                ? 'bg-slate-800 text-amber-300 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="size-4 text-amber-400 shrink-0" />
            <span>{t('my_certificates')} ({earnedCerts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('drives')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'drives'
                ? 'bg-slate-800 text-emerald-300 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartHandshake className="size-4 text-emerald-400 shrink-0" />
            <span>Volunteer Drives ({registrations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'complaints'
                ? 'bg-slate-800 text-orange-300 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="size-4 text-orange-400 shrink-0" />
            <span>{t('my_complaints')} ({myComplaints.length})</span>
          </button>
        </div>

        {/* Tab 1: Earned PDF Certificates */}
        {activeTab === 'certs' && (
          <div className="space-y-4">
            {earnedCerts.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                <Award className="size-10 text-slate-600 mx-auto" />
                <p className="text-slate-300 text-sm font-semibold">{t('no_certificates_yet')}</p>
                <p className="text-slate-500 text-xs max-w-md mx-auto">
                  Register for an NGO community drive under the "NGOs & Volunteers" section, participate, and download your official PDF certificates!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {earnedCerts.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-500/60 transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="bg-amber-950 text-amber-300 border border-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono">
                          {cert.certificate_id || 'CERT-HYD-2026-VERIFIED'}
                        </span>
                        <span className="text-slate-400 text-xs">• {cert.ngoName || 'Civic NGO'}</span>
                      </div>
                      <h3 className="font-bold text-base text-white">{cert.eventTitle}</h3>
                      <p className="text-xs text-slate-400 flex items-center space-x-1.5">
                        <Calendar className="size-3.5 text-amber-400 shrink-0" />
                        <span>Date: {new Date(cert.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        generateVolunteerCertificate(
                          userName,
                          cert.eventTitle,
                          cert.ngoName || 'Hyderabad Swachhata Collective',
                          cert.eventDate
                        )
                      }
                      className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition cursor-pointer shrink-0"
                    >
                      <Download className="size-4 shrink-0" />
                      <span>{t('download_cert')}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Volunteer Drives */}
        {activeTab === 'drives' && (
          <div className="space-y-3">
            {registrations.length === 0 ? (
              <div className="text-center py-10 bg-slate-950 border border-slate-800 rounded-2xl">
                <HeartHandshake className="size-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-xs">No registered volunteer drives yet.</p>
              </div>
            ) : (
              registrations.map((reg) => (
                <div key={reg.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">{reg.eventTitle}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{reg.ngoName} • {new Date(reg.eventDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    reg.attended ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {reg.attended ? 'Attended & Certified' : 'Registered'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Filed Complaints */}
        {activeTab === 'complaints' && (
          <div className="space-y-3">
            {myComplaints.length === 0 ? (
              <div className="text-center py-10 bg-slate-950 border border-slate-800 rounded-2xl">
                <FileText className="size-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-xs">No filed complaints linked to {userEmail}.</p>
              </div>
            ) : (
              myComplaints.map((issue) => (
                <div key={issue.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="text-[10px] font-mono text-orange-400 font-bold">#{issue.tracking_code} • {issue.category}</div>
                    <div className="font-bold text-xs text-white mt-0.5">{issue.address}</div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{issue.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenTrackModal) onOpenTrackModal(issue.tracking_code);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                  >
                    Track Status
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
