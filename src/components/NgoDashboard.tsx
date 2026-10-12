import React, { useState, useEffect } from 'react';
import { NGO, NGOEvent, EventRegistration, Issue } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { generateVolunteerCertificate } from '../lib/pdf';
import {
  HeartHandshake,
  Award,
  Calendar,
  Users,
  Plus,
  CheckCircle2,
  Building2,
  Download,
  Mail,
  Sparkles,
  ShieldCheck,
  Clock,
  UserPlus,
  ArrowRight,
  ShieldAlert,
  X,
  Phone,
  MapPin,
  Check,
  AlertTriangle,
  Info,
  UserCheck
} from 'lucide-react';

import { UserRole } from '../types';
import { AuthUser } from './AuthModal';

interface NgoDashboardProps {
  ngos: NGO[];
  events: NGOEvent[];
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onRefreshData: () => void;
  userRole?: UserRole;
  currentUser?: AuthUser | null;
}

export const NgoDashboard: React.FC<NgoDashboardProps> = ({
  ngos,
  events,
  issues,
  onSelectIssue,
  onRefreshData,
  userRole,
  currentUser,
}) => {
  const { t } = useTranslation();
  const [selectedNgo, setSelectedNgo] = useState<NGO | null>(ngos[0] || null);
  const [activeTab, setActiveTab] = useState<'issues' | 'events' | 'staff'>('issues');

  const isNgoOrAdmin =
    userRole === 'ngo_admin' ||
    userRole === 'admin' ||
    currentUser?.role === 'ngo_admin' ||
    currentUser?.role === 'admin' ||
    currentUser?.accountType === 'ngo' ||
    currentUser?.accountType === 'official';

  // Self-serve NGO Register state (Real-life NGO onboarding)
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newNgoName, setNewNgoName] = useState('');
  const [newNgoAcronym, setNewNgoAcronym] = useState('');
  const [newNgoDesc, setNewNgoDesc] = useState('');
  const [newNgoStructure, setNewNgoStructure] = useState<'Society' | 'Trust' | 'Section 8 Company'>('Society');
  const [newNgoDarpanId, setNewNgoDarpanId] = useState('TS/2024/0488192');
  const [newNgoRegNum, setNewNgoRegNum] = useState('REG-HYD-8821/2024');
  const [newNgoEmail, setNewNgoEmail] = useState('');
  const [newNgoPhone, setNewNgoPhone] = useState('+91 40 2334 9900');
  const [newNgoOfficeAddr, setNewNgoOfficeAddr] = useState('Plot 88, Road No. 36, Jubilee Hills, Hyderabad - 500033');
  const [newNgoChiefName, setNewNgoChiefName] = useState('Dr. S. K. Rao');
  const [newNgoChiefRole, setNewNgoChiefRole] = useState('General Secretary');
  const [newNgo80G, setNewNgo80G] = useState(true);
  const [newNgoFcra, setNewNgoFcra] = useState(false);
  const [newNgoVolCount, setNewNgoVolCount] = useState(50);
  const [newNgoAreas, setNewNgoAreas] = useState('Jubilee Hills, Cyberabad, Khairatabad');

  // Create Event state (with Organizer details)
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('2026-08-28T09:00');
  const [volunteersNeeded, setVolunteersNeeded] = useState(15);
  const [organizerName, setOrganizerName] = useState('Vikram Sharma');
  const [organizerPhone, setOrganizerPhone] = useState('+91 98490 88776');
  const [organizerEmail, setOrganizerEmail] = useState('drives@hydswachhata.org');
  const [assemblyPoint, setAssemblyPoint] = useState('Jubilee Hills Check Post Metro Station Gate 2');
  const [gearInstructions, setGearInstructions] = useState('Wear closed-toe shoes and comfortable cotton clothing. High-vis vests, gloves, and water bottles will be provided by NGO.');

  // Real-life NGO Volunteer Application state
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [selectedEventForReg, setSelectedEventForReg] = useState<NGOEvent | null>(null);
  const [volName, setVolName] = useState('Ananya Reddy');
  const [volEmail, setVolEmail] = useState('ananya.reddy@example.com');
  const [volPhone, setVolPhone] = useState('+91 98490 12345');
  const [volAge, setVolAge] = useState(24);
  const [volOccupation, setVolOccupation] = useState('Software Engineer / Student');
  const [emergencyName, setEmergencyName] = useState('Suresh Reddy (Parent)');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98490 99887');
  const [tShirtSize, setTShirtSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('M');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['First Aid', 'Crowd Control']);
  const [prevExp, setPrevExp] = useState('Participated in 2 lake cleanups in Cyberabad in 2025.');
  const [healthNotes, setHealthNotes] = useState('No allergies. Fit for outdoor activities.');
  const [shiftCommitment, setShiftCommitment] = useState(true);
  const [codeOfConductWaiver, setCodeOfConductWaiver] = useState(true);

  // View application details modal
  const [viewingReg, setViewingReg] = useState<EventRegistration | null>(null);

  // Success Notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Registrations state
  const [activeEventId, setActiveEventId] = useState<string | null>(events[0]?.id || null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);

  useEffect(() => {
    if (activeEventId) {
      fetchRegistrations(activeEventId);
    }
  }, [activeEventId]);

  const fetchRegistrations = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/registrations`);
      const data = await res.json();
      setRegistrations(data.registrations || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    }
  };

  // Claim Open Issue for NGO
  const handleClaimIssue = async (issueId: string) => {
    if (!isNgoOrAdmin) {
      setToastMessage('🔒 Access Restricted: Please sign in with an NGO Partner or Admin account to claim government issues.');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    try {
      await fetch(`/api/issues/${issueId}/ngo-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ngo_name: selectedNgo?.name || 'HydSwachhata Collective' }),
      });
      setToastMessage('Issue claimed successfully for NGO action!');
      setTimeout(() => setToastMessage(null), 3500);
      onRefreshData();
    } catch (err) {
      console.error('Error claiming issue:', err);
    }
  };

  // Register New NGO Self-Serve (Real-Life NGO Onboarding)
  const handleRegisterNgo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/ngos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newNgoName,
          acronym: newNgoAcronym || newNgoName.slice(0, 4).toUpperCase(),
          description: newNgoDesc,
          legal_structure: newNgoStructure,
          darpan_id: newNgoDarpanId,
          registration_number: newNgoRegNum,
          contact_email: newNgoEmail,
          contact_phone: newNgoPhone,
          office_address: newNgoOfficeAddr,
          chief_functionary_name: newNgoChiefName,
          chief_functionary_role: newNgoChiefRole,
          tax_exemption_80g: newNgo80G,
          fcra_registered: newNgoFcra,
          active_volunteers_count: newNgoVolCount,
          areas_served: newNgoAreas.split(',').map((a) => a.trim()),
          focus_domains: ['Civic Action', 'Pothole Safety', 'Cleanups'],
          annual_audit_verified: true,
        }),
      });
      setShowRegisterForm(false);
      setToastMessage('NGO Collective registered successfully with NITI Aayog Darpan & 80G verification details!');
      setTimeout(() => setToastMessage(null), 3500);
      onRefreshData();
    } catch (err) {
      console.error('Error registering NGO:', err);
    }
  };

  // Post New Event with full organizer details
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNgo) return;
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngo_id: selectedNgo.id,
          ngo_name: selectedNgo.name,
          title: eventTitle,
          description: eventDesc,
          lat: 17.4325,
          lng: 78.4070,
          event_date: new Date(eventDate).toISOString(),
          volunteers_needed: volunteersNeeded,
          organizer_name: organizerName,
          organizer_phone: organizerPhone,
          organizer_email: organizerEmail,
          assembly_point: assemblyPoint,
          gear_instructions: gearInstructions,
        }),
      });
      setShowEventForm(false);
      setToastMessage('New Volunteer Drive posted successfully with contact details!');
      setTimeout(() => setToastMessage(null), 3500);
      onRefreshData();
    } catch (err) {
      console.error('Error creating event:', err);
    }
  };

  // Real Volunteer Application Submit
  const handleRegisterVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNgoOrAdmin) {
      setToastMessage('🔒 Access Restricted: NGO Partners manage volunteer drives and staff. Individual volunteer registration is for Citizen accounts.');
      setTimeout(() => setToastMessage(null), 4000);
      setShowVolunteerModal(false);
      return;
    }

    const targetEventId = selectedEventForReg?.id || activeEventId || events[0]?.id;
    if (!targetEventId) return;

    try {
      await fetch(`/api/events/${targetEventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: volName,
          user_email: volEmail,
          phone: volPhone,
          age: volAge,
          occupation: volOccupation,
          emergency_contact_name: emergencyName,
          emergency_contact_phone: emergencyPhone,
          t_shirt_size: tShirtSize,
          skills: selectedSkills,
          previous_experience: prevExp,
          health_notes: healthNotes,
        }),
      });

      fetchRegistrations(targetEventId);
      setShowVolunteerModal(false);
      setToastMessage('🎉 Volunteer application submitted successfully! Check "My Profile & Certificates" tab anytime.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Error submitting volunteer application:', err);
    }
  };

  // Mark Attendance & Issue PDF Certificate
  const handleMarkAttendanceAndIssueCert = async (reg: EventRegistration, event: NGOEvent) => {
    try {
      generateVolunteerCertificate(
        reg.user_name,
        event.title,
        event.ngo_name || 'Hyderabad NGO Collective',
        event.event_date
      );

      await fetch('/api/events/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reg_id: reg.id,
          attended: true,
          certificate_issued: true,
        }),
      });

      if (activeEventId) {
        fetchRegistrations(activeEventId);
      }
    } catch (err) {
      console.error('Error issuing certificate:', err);
    }
  };

  const openNgoIssues = issues.filter((i) => i.status === 'open_for_ngo' || i.status === 'ngo_claimed');
  const totalVolunteersCount = registrations.length + 32;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100 space-y-8">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white font-medium px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs sm:text-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <Check className="size-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white cursor-pointer">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Citizen Read-Only Notice if logged in as Citizen */}
      {!isNgoOrAdmin && (
        <div className="bg-purple-950/40 border border-purple-800/80 p-3.5 rounded-xl text-purple-200 text-xs flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <HeartHandshake className="size-4 text-purple-400 shrink-0" />
            <span>
              <strong>Citizen View (Read-Only Mode):</strong> You are exploring community volunteer drives and NGO complaints. To claim issues, post volunteer drives, or register an NGO collective, please log in with an <strong>NGO Partner</strong> or <strong>Admin</strong> account.
            </span>
          </div>
        </div>
      )}

      {/* Top Banner & Overview */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
              <HeartHandshake className="size-5 shrink-0" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{t('ngo_hub')}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Community Action Engine: Claim government-escalated complaints, coordinate volunteer staff drives, and issue verified service certificates.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isNgoOrAdmin ? (
              <button
                onClick={() => setShowEventForm(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-2 transition cursor-pointer shadow-sm"
              >
                <Plus className="size-4 shrink-0" />
                <span>Post New Drive</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedEventForReg(events[0] || null);
                  setShowVolunteerModal(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-2 transition cursor-pointer shadow-sm"
              >
                <UserPlus className="size-4 shrink-0" />
                <span>{t('join_event')}</span>
              </button>
            )}

            <button
              onClick={() => {
                if (!isNgoOrAdmin) {
                  setToastMessage('🔒 Access Restricted: Please sign in with an NGO Partner or Admin account to register an NGO collective.');
                  setTimeout(() => setToastMessage(null), 4000);
                  return;
                }
                setShowRegisterForm(true);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-2 transition cursor-pointer"
            >
              <Building2 className="size-4 text-emerald-400 shrink-0" />
              <span>Register NGO Collective</span>
            </button>
          </div>
        </div>

        {/* Overview Metric Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium">Verified NGO Collectives</span>
            <div className="text-2xl font-bold text-white mt-1">{ngos.length}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4">
            <span className="text-xs text-purple-400 font-medium">Escalated NGO Claims</span>
            <div className="text-2xl font-bold text-purple-300 mt-1">{openNgoIssues.length}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4">
            <span className="text-xs text-emerald-400 font-medium">Active Community Drives</span>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{events.length}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4">
            <span className="text-xs text-amber-400 font-medium">Registered Volunteer Staff</span>
            <div className="text-2xl font-bold text-amber-300 mt-1">{totalVolunteersCount}</div>
          </div>
        </div>

        {/* Section Sub-Navigation Tabs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex items-center space-x-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('issues')}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === 'issues'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="size-4 text-purple-400 shrink-0" />
            <span>1. NGO Claims & Collectives ({openNgoIssues.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === 'events'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="size-4 text-emerald-400 shrink-0" />
            <span>2. Volunteer Drives & Missions ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === 'staff'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="size-4 text-amber-400 shrink-0" />
            <span>3. Volunteer Staff & Certificates ({registrations.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: NGO Claims & Collectives */}
      {activeTab === 'issues' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-semibold text-white text-base flex items-center space-x-2">
                  <Clock className="size-5 text-purple-400 shrink-0" />
                  <span>Government-Escalated Complaints Open for NGO Action</span>
                </h3>
                <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono">
                  {openNgoIssues.length} Available
                </span>
              </div>

              <div className="space-y-4">
                {openNgoIssues.length === 0 ? (
                  <div className="text-center py-12 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <ShieldCheck className="size-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs">No overdue government issues currently escalated to NGO level.</p>
                  </div>
                ) : (
                  openNgoIssues.map((issue) => (
                    <div key={issue.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start space-x-3">
                        <img src={issue?.photo_url || ''} alt={issue?.category || ''} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                        <div>
                          <div className="text-[10px] font-semibold text-purple-400 font-mono">#{issue.tracking_code} • {issue.category}</div>
                          <div className="font-semibold text-sm text-white">{issue.address}</div>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-1 leading-relaxed">{issue.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
                        <button
                          onClick={() => onSelectIssue(issue)}
                          className="flex-1 sm:flex-none border border-slate-700 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition"
                        >
                          Details
                        </button>

                        {issue.status === 'open_for_ngo' ? (
                          <button
                            onClick={() => handleClaimIssue(issue.id)}
                            className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition"
                          >
                            Claim Issue
                          </button>
                        ) : (
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-lg text-xs font-semibold">
                            Claimed by {selectedNgo?.name || 'NGO'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Volunteer On-Ground Physical Verification Queue */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-semibold text-white text-base flex items-center space-x-2">
                  <UserCheck className="size-5 text-amber-400 shrink-0" />
                  <span>On-Ground Physical Verification Audit Queue for Volunteers</span>
                </h3>
                <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono">
                  {issues.filter(i => i.physical_verification_status !== 'physically_verified_true').length} Pending Inspection
                </span>
              </div>

              <div className="space-y-3">
                {issues.filter(i => i.physical_verification_status !== 'physically_verified_true').slice(0, 4).map((issue) => (
                  <div key={issue.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <img src={issue?.photo_url || ''} alt={issue?.category || ''} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                      <div>
                        <div className="text-[10px] font-semibold text-amber-400 font-mono flex items-center space-x-1">
                          <span>#{issue.tracking_code}</span>
                          <span>•</span>
                          <span>{issue.category}</span>
                        </div>
                        <div className="font-bold text-xs text-white line-clamp-1">{issue.address}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Status: <span className="text-slate-300 font-semibold">{issue.status}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectIssue(issue)}
                      className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shrink-0"
                    >
                      <UserCheck className="size-3.5 shrink-0" />
                      <span>Physically Verify On-Ground</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: NGO Directory */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-white text-base flex items-center space-x-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="size-5 text-emerald-400 shrink-0" />
                <span>Active Hyderabad NGO Collectives</span>
              </h3>

              <div className="space-y-3">
                {ngos.map((ngo) => (
                  <div
                    key={ngo.id}
                    onClick={() => setSelectedNgo(ngo)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      selectedNgo?.id === ngo.id
                        ? 'bg-slate-800 border-emerald-500/60 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-white">{ngo.name}</h4>
                      {ngo.verified ? (
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                          Verified
                        </span>
                      ) : (
                        <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                          Pending Review
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{ngo.description}</p>
                    <div className="text-[11px] text-slate-400 font-mono mt-2">Areas: {ngo.areas_served.join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Volunteer Drives & Cleanups */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="size-5 text-emerald-400 shrink-0" />
                <h3 className="font-semibold text-white text-base">{t('upcoming_events')}</h3>
              </div>

              <button
                onClick={() => {
                  if (!isNgoOrAdmin) {
                    setToastMessage('🔒 Access Restricted: Please sign in with an NGO Partner or Admin account to post a volunteer drive.');
                    setTimeout(() => setToastMessage(null), 4000);
                    return;
                  }
                  setShowEventForm(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition"
              >
                <Plus className="size-4 shrink-0" />
                <span>Post New Drive</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setActiveEventId(ev.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                    activeEventId === ev.id
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">{ev.ngo_name}</span>
                    <h4 className="font-bold text-sm text-white">{ev.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{ev.description}</p>

                    {/* Organizer & Location Contact Details */}
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1 text-[11px] text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="size-3 text-orange-400 shrink-0" />
                        <span className="truncate"><strong>Meeting Point:</strong> {ev.assembly_point || 'Road No. 36 Metro Gate 2'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Phone className="size-3 text-emerald-400 shrink-0" />
                        <span><strong>Contact:</strong> {ev.organizer_name || 'Vikram Sharma'} ({ev.organizer_phone || '+91 98490 88776'})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                    <span className="font-medium text-slate-300">📅 {new Date(ev.event_date).toLocaleDateString('en-IN')}</span>
                    {isNgoOrAdmin ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEventId(ev.id);
                          setActiveTab('staff');
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer shadow-sm flex items-center space-x-1"
                      >
                        <Users className="size-3.5 text-emerald-400 shrink-0" />
                        <span>Manage Applicants</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventForReg(ev);
                          setShowVolunteerModal(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer shadow-sm"
                      >
                        {t('join_event')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Volunteer Staff & Certificates */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
              <div>
                <h3 className="font-semibold text-white text-base flex items-center space-x-2">
                  <Award className="size-5 text-amber-400 shrink-0" />
                  <span>Volunteer Staff Directory & PDF Service Certificate Manager</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage registered community staff, verify shift attendance, and issue official PDF certificates.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedEventForReg(events[0] || null);
                  setShowVolunteerModal(true);
                }}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shrink-0 transition"
              >
                <UserPlus className="size-4 shrink-0" />
                <span>Register New Volunteer Staff</span>
              </button>
            </div>

            {/* Attendance & Certificate Table */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Volunteer Staff Name</th>
                    <th className="p-3.5">Email / Phone</th>
                    <th className="p-3.5">Vest Size</th>
                    <th className="p-3.5">Skills & Emergency</th>
                    <th className="p-3.5">Attendance Status</th>
                    <th className="p-3.5 text-right">PDF Certificate Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">
                        No volunteer staff registered for the selected event. Click "Register New Volunteer Staff" above!
                      </td>
                    </tr>
                  ) : (
                    registrations.map((reg) => {
                      const event = events.find((e) => e.id === activeEventId) || events[0];
                      return (
                        <tr key={reg.id} className="hover:bg-slate-900/50 transition">
                          <td className="p-3.5 font-semibold text-white">
                            <div>{reg.user_name}</div>
                            <button
                              onClick={() => setViewingReg(reg)}
                              className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                            >
                              View Full Application
                            </button>
                          </td>
                          <td className="p-3.5 text-slate-400 font-mono">
                            <div>{reg.user_email}</div>
                            <div className="text-[10px] text-slate-500">{reg.phone || '+91 98490 12345'}</div>
                          </td>
                          <td className="p-3.5 font-bold text-amber-400">{reg.t_shirt_size || 'M'}</td>
                          <td className="p-3.5 text-slate-400">
                            <div>{reg.skills?.join(', ') || 'First Aid'}</div>
                            <div className="text-[10px] text-slate-500">ICE: {reg.emergency_contact_name || 'Spouse'}</div>
                          </td>
                          <td className="p-3.5">
                            {reg.attended ? (
                              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                                Attended
                              </span>
                            ) : (
                              <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[11px]">
                                Registered
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleMarkAttendanceAndIssueCert(reg, event)}
                              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs inline-flex items-center space-x-1.5 transition cursor-pointer"
                            >
                              <Download className="size-3.5 shrink-0" />
                              <span>{reg.certificate_issued ? 'Re-Download PDF' : 'Issue PDF Cert'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Comprehensive Real-Life NGO Volunteer Application */}
      {showVolunteerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="size-5 text-emerald-400 shrink-0" />
                <h3 className="font-bold text-white text-base">{t('volunteer_application_title')}</h3>
              </div>
              <button onClick={() => setShowVolunteerModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            {selectedEventForReg && (
              <div className="bg-emerald-950/60 border border-emerald-800 p-3 rounded-2xl text-xs text-emerald-200 space-y-1">
                <div className="font-bold text-white flex items-center space-x-1.5">
                  <Calendar className="size-3.5 text-emerald-400 shrink-0" />
                  <span>Target Drive: {selectedEventForReg.title}</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Meeting Point: {selectedEventForReg.assembly_point || 'Road No. 36 Jubilee Hills Check Post Metro Gate 2'} • Organizer: {selectedEventForReg.organizer_name || 'Vikram Sharma'} ({selectedEventForReg.organizer_phone || '+91 98490 88776'})
                </p>
              </div>
            )}

            <form onSubmit={handleRegisterVolunteerSubmit} className="space-y-4 text-xs">
              {/* Row 1: Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('volunteer_name')} *</label>
                  <input
                    required
                    value={volName}
                    onChange={(e) => setVolName(e.target.value)}
                    placeholder="e.g. Ananya Reddy"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('volunteer_email')} *</label>
                  <input
                    required
                    type="email"
                    value={volEmail}
                    onChange={(e) => setVolEmail(e.target.value)}
                    placeholder="ananya.reddy@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Phone & Age & Occupation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('volunteer_phone')} *</label>
                  <input
                    required
                    value={volPhone}
                    onChange={(e) => setVolPhone(e.target.value)}
                    placeholder="+91 98490 12345"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('age_dob')} *</label>
                  <input
                    required
                    type="number"
                    min={16}
                    max={80}
                    value={volAge}
                    onChange={(e) => setVolAge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('t_shirt_size')} *</label>
                  <select
                    value={tShirtSize}
                    onChange={(e) => setTShirtSize(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium cursor-pointer"
                  >
                    <option value="S">S (Small)</option>
                    <option value="M">M (Medium)</option>
                    <option value="L">L (Large)</option>
                    <option value="XL">XL (Extra Large)</option>
                    <option value="XXL">XXL (2X Large)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Emergency Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('emergency_contact_name')} *</label>
                  <input
                    required
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="e.g. Suresh Reddy (Spouse/Parent)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('emergency_contact_phone')} *</label>
                  <input
                    required
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+91 98490 99887"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                  />
                </div>
              </div>

              {/* Row 4: Special Skills Checkbox Grid */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">{t('special_skills')}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'First Aid Certified',
                    'Crowd Control',
                    'Technical Audit',
                    'Social Media / Photography',
                    'Civil Engineering',
                    'Logistics & Transport',
                    'Local Languages Fluent',
                  ].map((skill) => {
                    const active = selectedSkills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition text-left cursor-pointer flex items-center justify-between ${
                          active
                            ? 'bg-emerald-950 text-emerald-200 border-emerald-600'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span>{skill}</span>
                        {active && <Check className="size-3 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: Experience & Health Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('previous_exp')}</label>
                <textarea
                  rows={2}
                  value={prevExp}
                  onChange={(e) => setPrevExp(e.target.value)}
                  placeholder="Details of previous community volunteer drives or social service..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('health_notes')}</label>
                <input
                  value={healthNotes}
                  onChange={(e) => setHealthNotes(e.target.value)}
                  placeholder="Any dietary preferences, physical restrictions, or allergies..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>

              {/* Checkboxes for Commitments */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-start space-x-2 text-slate-300 cursor-pointer text-[11px]">
                  <input
                    type="checkbox"
                    checked={shiftCommitment}
                    onChange={(e) => setShiftCommitment(e.target.checked)}
                    required
                    className="mt-0.5 rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                  <span>{t('shift_commitment')}</span>
                </label>

                <label className="flex items-start space-x-2 text-slate-300 cursor-pointer text-[11px]">
                  <input
                    type="checkbox"
                    checked={codeOfConductWaiver}
                    onChange={(e) => setCodeOfConductWaiver(e.target.checked)}
                    required
                    className="mt-0.5 rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                  <span>{t('code_of_conduct_waiver')}</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVolunteerModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer transition shadow-sm"
                >
                  {t('register_now')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Real-Life Indian NGO Registration Form */}
      {showRegisterForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="size-5 text-emerald-400 shrink-0" />
                <h3 className="font-bold text-white text-base">Register Official NGO / Civic Collective</h3>
              </div>
              <button onClick={() => setShowRegisterForm(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Standard compliance onboarding form for non-profit organizations operating in Greater Hyderabad. Requires legal registration structure, NITI Aayog NGO Darpan ID, and chief functionary details.
            </p>

            <form onSubmit={handleRegisterNgo} className="space-y-4 text-xs">
              {/* Row 1: Name & Acronym */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Official Organization Name *</label>
                  <input
                    required
                    value={newNgoName}
                    onChange={(e) => setNewNgoName(e.target.value)}
                    placeholder="e.g. Hyderabad Green Civic Brigade Foundation"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Acronym / Abbr.</label>
                  <input
                    value={newNgoAcronym}
                    onChange={(e) => setNewNgoAcronym(e.target.value)}
                    placeholder="HGCB"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium uppercase font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Legal Structure & Darpan ID */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Legal Entity Type *</label>
                  <select
                    value={newNgoStructure}
                    onChange={(e) => setNewNgoStructure(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                  >
                    <option value="Society">Society (TS Reg. Act)</option>
                    <option value="Trust">Public Charitable Trust</option>
                    <option value="Section 8 Company">Section 8 Company (MCA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">NGO Darpan ID (NITI Aayog)</label>
                  <input
                    value={newNgoDarpanId}
                    onChange={(e) => setNewNgoDarpanId(e.target.value)}
                    placeholder="TS/2024/0488192"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Registration Reg/CIN No. *</label>
                  <input
                    required
                    value={newNgoRegNum}
                    onChange={(e) => setNewNgoRegNum(e.target.value)}
                    placeholder="REG-HYD-8821/2024"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Row 3: Chief Functionary Details */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-slate-200 font-bold text-xs flex items-center space-x-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
                  <span>Authorized Chief Functionary / Signatory</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">Full Name *</label>
                    <input
                      required
                      value={newNgoChiefName}
                      onChange={(e) => setNewNgoChiefName(e.target.value)}
                      placeholder="Dr. S. K. Rao"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">Designation / Role *</label>
                    <input
                      required
                      value={newNgoChiefRole}
                      onChange={(e) => setNewNgoChiefRole(e.target.value)}
                      placeholder="General Secretary / Managing Trustee"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Contact & Registered Office */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Official Email Address *</label>
                  <input
                    required
                    type="email"
                    value={newNgoEmail}
                    onChange={(e) => setNewNgoEmail(e.target.value)}
                    placeholder="contact@ngohyderabad.org"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Official Phone Helpline *</label>
                  <input
                    required
                    value={newNgoPhone}
                    onChange={(e) => setNewNgoPhone(e.target.value)}
                    placeholder="+91 40 2334 9900"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Registered Office Address in Hyderabad *</label>
                <input
                  required
                  value={newNgoOfficeAddr}
                  onChange={(e) => setNewNgoOfficeAddr(e.target.value)}
                  placeholder="Plot 88, Road No. 36, Jubilee Hills, Hyderabad - 500033"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>

              {/* Description & Focus Areas */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mission Statement & Operational Overview *</label>
                <textarea
                  required
                  rows={2}
                  value={newNgoDesc}
                  onChange={(e) => setNewNgoDesc(e.target.value)}
                  placeholder="Summarize volunteer drives, civic monitoring activities, and public community initiatives..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">GHMC Wards / Areas Served</label>
                  <input
                    value={newNgoAreas}
                    onChange={(e) => setNewNgoAreas(e.target.value)}
                    placeholder="Jubilee Hills, HITEC City, Khairatabad"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Active Roster Volunteer Count</label>
                  <input
                    type="number"
                    min={1}
                    value={newNgoVolCount}
                    onChange={(e) => setNewNgoVolCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                  />
                </div>
              </div>

              {/* Tax Exemption & FCRA Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={newNgo80G}
                    onChange={(e) => setNewNgo80G(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                  <span>80G Income Tax Exempted</span>
                </label>

                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={newNgoFcra}
                    onChange={(e) => setNewNgoFcra(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                  <span>FCRA Foreign Contribution Registered</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer transition shadow-sm"
                >
                  Submit Official Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Post Event Form with Full Contact Details */}
      {showEventForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Post New Volunteer Drive</h3>
              <button onClick={() => setShowEventForm(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Drive Title *</label>
                <input required value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="e.g. Road No. 36 Jubilee Hills Pothole Warning Drive" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium" />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description *</label>
                <textarea required rows={2} value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} placeholder="Mission scope and objectives for volunteers..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date & Time *</label>
                  <input required type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Volunteers Needed *</label>
                  <input required type="number" min={1} value={volunteersNeeded} onChange={(e) => setVolunteersNeeded(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium" />
                </div>
              </div>

              {/* Organizer Contact Info */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <div className="font-bold text-slate-200 text-xs flex items-center space-x-1.5">
                  <Phone className="size-3.5 text-emerald-400 shrink-0" />
                  <span>{t('organizer_contact')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">Organizer Full Name *</label>
                    <input required value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} placeholder="Vikram Sharma" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-medium" />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">Phone / WhatsApp *</label>
                    <input required value={organizerPhone} onChange={(e) => setOrganizerPhone(e.target.value)} placeholder="+91 98490 88776" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-medium" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] font-semibold mb-1">Organizer Official Email *</label>
                  <input required type="email" value={organizerEmail} onChange={(e) => setOrganizerEmail(e.target.value)} placeholder="drives@hydswachhata.org" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('assembly_landmark')} *</label>
                <input required value={assemblyPoint} onChange={(e) => setAssemblyPoint(e.target.value)} placeholder="Jubilee Hills Check Post Metro Gate 2" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium" />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('gear_instructions')}</label>
                <textarea rows={2} value={gearInstructions} onChange={(e) => setGearInstructions(e.target.value)} placeholder="Required gear, clothing, and safety guidelines..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium" />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setShowEventForm(false)} className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 text-xs">{t('cancel')}</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer transition">Post Drive</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: View Application Details Modal */}
      {viewingReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Volunteer Application Details</h3>
              <button onClick={() => setViewingReg(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div><strong className="text-slate-400">Name:</strong> {viewingReg.user_name}</div>
              <div><strong className="text-slate-400">Email:</strong> {viewingReg.user_email}</div>
              <div><strong className="text-slate-400">Phone:</strong> {viewingReg.phone || 'N/A'}</div>
              <div><strong className="text-slate-400">Age:</strong> {viewingReg.age || 24}</div>
              <div><strong className="text-slate-400">Vest Size:</strong> {viewingReg.t_shirt_size || 'M'}</div>
              <div><strong className="text-slate-400">Emergency Contact:</strong> {viewingReg.emergency_contact_name} ({viewingReg.emergency_contact_phone})</div>
              <div><strong className="text-slate-400">Skills:</strong> {viewingReg.skills?.join(', ') || 'First Aid'}</div>
              <div><strong className="text-slate-400">Health Notes:</strong> {viewingReg.health_notes || 'None'}</div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button onClick={() => setViewingReg(null)} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
