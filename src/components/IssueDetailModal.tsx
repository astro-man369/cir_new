import React, { useState, useEffect, useRef } from 'react';
import { Issue, IssueStatusHistory, ComplaintEmail, ResolutionProof, Department, UserRole } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { AuthUser } from './AuthModal';
import {
  X,
  Clock,
  Send,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Camera,
  UserCheck,
  AlertCircle,
  Building2,
  Lock,
  ArrowRight,
  FileCheck,
  Upload,
  Image as ImageIcon,
  Check,
  CheckCheck,
  RefreshCw,
  MapPin
} from 'lucide-react';

interface IssueDetailModalProps {
  issue: Issue | null;
  userRole: UserRole;
  currentUser?: AuthUser | null;
  onClose: () => void;
  onRefreshData: () => void;
  onOpenWhatsappBot?: (trackingCode?: string) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  userRole,
  currentUser,
  onClose,
  onRefreshData,
  onOpenWhatsappBot,
}) => {
  const { t, translateCategory, translateStatus, translateTier } = useTranslation();
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(issue);
  const [history, setHistory] = useState<IssueStatusHistory[]>([]);
  const [emails, setEmails] = useState<ComplaintEmail[]>([]);
  const [proofs, setProofs] = useState<ResolutionProof[]>([]);
  const [department, setDepartment] = useState<Department | null>(null);

  const [afterPhotoUrl, setAfterPhotoUrl] = useState('https://images.unsplash.com/photo-1517649763962-0c623266010b?w=600&auto=format&fit=crop&q=80');
  const [submittedBy, setSubmittedBy] = useState('Hyderabad Swachhata Volunteer');
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isSimulatingInbound, setIsSimulatingInbound] = useState(false);
  const [simulatedReplyBody, setSimulatedReplyBody] = useState('Our GHMC emergency road work crew filled and asphalted the pothole on Road No. 36 Jubilee Hills today at 2:00 PM.');

  // Subscription local states
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [reporterEmail, setReporterEmail] = useState('citizen@hyderabad.gov.in');
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [reporterPhone, setReporterPhone] = useState('+91 98490 12345');
  const [isSavingSub, setIsSavingSub] = useState(false);
  const [subSavedMessage, setSubSavedMessage] = useState(false);

  // Volunteer Physical Verification states
  const [showPhysicalVerifyForm, setShowPhysicalVerifyForm] = useState(false);
  const [verificationAction, setVerificationAction] = useState<'confirm_problem' | 'confirm_resolved' | 'mark_fake'>('confirm_problem');
  const [volunteerInspectorName, setVolunteerInspectorName] = useState(currentUser?.name || 'HydSwachhata Volunteer Inspector');
  const [physicalNotes, setPhysicalNotes] = useState('On-ground physical inspection conducted at GPS site coordinates.');
  const [physicalPhotoUrl, setPhysicalPhotoUrl] = useState('');
  const [isSubmittingPhysicalVerify, setIsSubmittingPhysicalVerify] = useState(false);
  const [physicalVerifySuccessMsg, setPhysicalVerifySuccessMsg] = useState<string | null>(null);

  const [approvalErrorMsg, setApprovalErrorMsg] = useState<string | null>(null);
  const [isClosingIssue, setIsClosingIssue] = useState(false);

  const isNgoOrAdmin =
    userRole === 'ngo_admin' ||
    userRole === 'admin' ||
    currentUser?.role === 'ngo_admin' ||
    currentUser?.role === 'admin' ||
    currentUser?.accountType === 'ngo' ||
    currentUser?.accountType === 'official';

  const activeIssue = currentIssue || issue;

  useEffect(() => {
    if (!issue) {
      setCurrentIssue(null);
      return;
    }
    setCurrentIssue(issue);
    setNotifyEmail(issue.notify_email !== false);
    setReporterEmail(issue.reporter_email || 'citizen@hyderabad.gov.in');
    setNotifyWhatsapp(issue.notify_whatsapp !== false);
    setReporterPhone(issue.reporter_phone || '+91 98490 12345');
    setPhysicalPhotoUrl(issue.physical_verification_photo || issue.photo_url || '');
    setPhysicalNotes(
      issue.physical_verification_notes || 'On-ground physical verification conducted at GPS site coordinates. Complaint details verified.'
    );
    setVolunteerInspectorName(currentUser?.name || issue.verified_by_volunteer_name || 'HydSwachhata Volunteer Inspector');
    setApprovalErrorMsg(null);
    setPhysicalVerifySuccessMsg(null);
    fetchIssueDetailsFor(issue.id);
  }, [issue, currentUser]);

  const fetchIssueDetailsFor = async (issueId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}`);
      const data = await res.json();
      if (data.issue) {
        setCurrentIssue(data.issue);
      }
      setHistory(data.history || []);
      setEmails(data.emails || []);
      setProofs(data.proofs || []);
      setDepartment(data.department || null);
    } catch (err) {
      console.error('Error fetching issue details:', err);
    }
  };

  const fetchIssueDetails = async () => {
    if (!activeIssue) return;
    await fetchIssueDetailsFor(activeIssue.id);
  };

  const handleVolunteerPhysicalVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIssue) return;
    setIsSubmittingPhysicalVerify(true);
    setApprovalErrorMsg(null);
    setPhysicalVerifySuccessMsg(null);

    const isTrue = verificationAction !== 'mark_fake';

    try {
      const res = await fetch(`/api/issues/${activeIssue.id}/volunteer-physical-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_true: isTrue,
          action_type: verificationAction,
          notes: physicalNotes,
          volunteer_name: volunteerInspectorName || currentUser?.name || 'Citizen Volunteer Auditor',
          photo_url: physicalPhotoUrl || activeIssue.photo_url,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setApprovalErrorMsg(data.error || 'Failed to submit on-ground physical inspection.');
        return;
      }

      setPhysicalVerifySuccessMsg('On-ground physical inspection recorded and verified successfully!');
      setShowPhysicalVerifyForm(false);
      await fetchIssueDetails();
      onRefreshData();

      setTimeout(() => {
        setPhysicalVerifySuccessMsg(null);
      }, 5000);
    } catch (err: any) {
      console.error('Error submitting volunteer physical verification:', err);
      setApprovalErrorMsg(err?.message || 'Network error submitting physical verification.');
    } finally {
      setIsSubmittingPhysicalVerify(false);
    }
  };

  const handleSaveSubscription = async () => {
    if (!activeIssue) return;
    setIsSavingSub(true);
    try {
      await fetch(`/api/issues/${activeIssue.id}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notify_email: notifyEmail,
          reporter_email: reporterEmail,
          notify_whatsapp: notifyWhatsapp,
          reporter_phone: reporterPhone,
        }),
      });
      setSubSavedMessage(true);
      setTimeout(() => setSubSavedMessage(false), 3000);
      onRefreshData();
    } catch (err) {
      console.error('Subscription save error:', err);
    } finally {
      setIsSavingSub(false);
    }
  };

  if (!activeIssue) return null;

  const getStatusLabel = (status: string | null) => {
    if (!status) return 'SUBMITTED';
    switch (status) {
      case 'submitted': return 'SUBMITTED';
      case 'filed': return 'TIER 1 FILED';
      case 'escalated_tier2': return 'TIER 2 ESCALATED';
      case 'escalated_tier3': return 'TIER 3 ESCALATED';
      case 'open_for_ngo': return 'NGO OPEN';
      case 'ngo_claimed': return 'NGO CLAIMED';
      case 'claimed_resolved_by_official': return 'CLAIMED RESOLVED';
      case 'resolved': return 'PHYSICALLY RESOLVED';
      default: return status.toUpperCase();
    }
  };

  // Submit Before/After Resolution Proof (Official or NGO)
  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingProof(true);
    try {
      const res = await fetch(`/api/issues/${activeIssue.id}/proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          before_photo_url: activeIssue.photo_url,
          after_photo_url: afterPhotoUrl,
          submitted_by: submittedBy,
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
      }

      await fetchIssueDetails();
      onRefreshData();
    } catch (err) {
      console.error('Error submitting proof:', err);
    } finally {
      setIsUploadingProof(false);
    }
  };

  // Citizen or Admin approves resolution proof (AI Vision section)
  const handleApproveResolution = async (proofId: string) => {
    setApprovalErrorMsg(null);
    try {
      const res = await fetch(`/api/issues/${activeIssue.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof_id: proofId, approved_by: 'NGO Admin / Inspector' }),
      });

      const data = await res.json();
      if (!res.ok) {
        setApprovalErrorMsg(data.error || 'Physical on-ground verification is required before closing this issue.');
        return;
      }

      if (data.requires_physical_verification) {
        setApprovalErrorMsg('AI Resolution Proof approved! On-ground physical verification is required below to officially close this complaint.');
      } else {
        setApprovalErrorMsg(null);
      }

      await fetchIssueDetails();
      onRefreshData();
    } catch (err: any) {
      console.error('Error approving resolution:', err);
      setApprovalErrorMsg('Failed to approve resolution. Ensure physical verification is completed.');
    }
  };

  // Officially Close and Resolve Issue (Only allowed after physical verification)
  const handleCloseIssue = async () => {
    setApprovalErrorMsg(null);
    setIsClosingIssue(true);
    try {
      const res = await fetch(`/api/issues/${activeIssue.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closed_by: volunteerInspectorName || 'Volunteer Inspector' }),
      });

      const data = await res.json();
      if (!res.ok) {
        setApprovalErrorMsg(data.error || 'Failed to close complaint. On-ground physical verification is required.');
        return;
      }

      await fetchIssueDetails();
      onRefreshData();
    } catch (err) {
      console.error('Error closing issue:', err);
      setApprovalErrorMsg('Failed to close complaint.');
    } finally {
      setIsClosingIssue(false);
    }
  };

  // Simulate Inbound Officer Email Reply
  const handleSimulateInboundReply = async () => {
    setIsSimulatingInbound(true);
    try {
      await fetch('/api/inbound-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_email: department?.tier1_email || 'officer@hyderabad.gov.in',
          subject: `Re: [CIR #${activeIssue.tracking_code}] Work Completed Notice`,
          body: simulatedReplyBody,
          tracking_code: activeIssue.tracking_code,
        }),
      });

      await fetchIssueDetails();
      onRefreshData();
    } catch (err) {
      console.error('Error simulating inbound email:', err);
    } finally {
      setIsSimulatingInbound(false);
    }
  };

  const getStatusBadge = () => {
    if (activeIssue.status === 'resolved') {
      return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold">🟢 {t('status_resolved')}</span>;
    }
    if (activeIssue.status === 'claimed_resolved_by_official') {
      return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-bold">🟡 {t('status_claimed_resolved_by_official')}</span>;
    }
    if (activeIssue.status === 'open_for_ngo') {
      return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full text-xs font-bold">🟣 {t('status_open_for_ngo')}</span>;
    }
    return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1 rounded-full text-xs font-bold">🔴 {t('badge_open')} ({translateTier(activeIssue.current_tier)})</span>;
  };

  if (!issue || !activeIssue) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col my-auto"
      >
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-lg font-mono font-bold text-xs">
              #{activeIssue.tracking_code}
            </span>
            {getStatusBadge()}
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Close Complaint Details"
          >
            <X className="size-5 shrink-0" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Main Top Grid: Photo, Description, Department Routing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Photo & Details */}
            <div className="space-y-4">
              <div className="h-56 rounded-xl overflow-hidden border border-slate-800 relative bg-slate-950">
                <img src={activeIssue.photo_url || ''} alt={activeIssue.category || ''} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-800">
                  Lat: {activeIssue.lat}, Lng: {activeIssue.lng}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400">{translateCategory(activeIssue.category)}</div>
                <h2 className="text-base font-bold text-white mt-0.5">{activeIssue.address}</h2>
                <p className="text-slate-300 text-xs mt-2 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  {activeIssue.description}
                </p>
              </div>

              {/* Subscriptions Settings Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center space-x-1.5">
                    <Sparkles className="size-3.5 text-emerald-400 shrink-0" />
                    <span>Automated Complaint Alerts</span>
                  </span>
                  {subSavedMessage && <span className="text-[10px] text-emerald-400 font-bold">Saved!</span>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                      <span>Email Alerts</span>
                    </label>
                    <input
                      type="email"
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] w-48 text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifyWhatsapp}
                        onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                      <span>WhatsApp Bot</span>
                    </label>
                    <input
                      type="text"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] w-48 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {onOpenWhatsappBot && (
                    <button
                      type="button"
                      onClick={() => onOpenWhatsappBot(activeIssue.tracking_code)}
                      className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition"
                    >
                      Open WhatsApp Bot Chat
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveSubscription}
                    disabled={isSavingSub}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg text-[11px] font-semibold cursor-pointer"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Automated Municipal SLA & Hierarchy Chain */}
            <div className="space-y-4">
              {/* Department Routing Info */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-white text-xs flex items-center space-x-2">
                  <Building2 className="size-4 text-orange-400 shrink-0" />
                  <span>Assigned GHMC Municipal Department</span>
                </h3>

                {department && (
                  <div className="space-y-2 text-[11px]">
                    <div className="font-bold text-orange-300">{department.name}</div>
                    <div className="space-y-1 text-slate-400">
                      <div>Tier 1 Ward Officer: <span className="text-slate-200 font-mono">{department.tier1_email}</span></div>
                      <div>Tier 2 Executive Engineer: <span className="text-slate-200 font-mono">{department.tier2_email}</span></div>
                      <div>Tier 3 Municipal Commissioner: <span className="text-slate-200 font-mono">{department.tier3_email}</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Automated Escalation Timeline */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-white text-xs flex items-center space-x-2">
                  <Clock className="size-4 text-amber-400 shrink-0" />
                  <span>Audit Log & Tier Escalation History</span>
                </h3>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {history.length === 0 ? (
                    <div className="text-slate-500 text-xs py-2 text-center font-mono">No audit logs recorded yet.</div>
                  ) : (
                    history.map((h) => (
                      <div key={h.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center space-x-1.5 font-bold">
                            <span className="text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                              {getStatusLabel(h.from_status)}
                            </span>
                            <span className="text-slate-500">→</span>
                            <span className="text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/60">
                              {getStatusLabel(h.to_status)}
                            </span>
                          </div>
                          <span className="text-slate-500 font-mono text-[10px]">
                            {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed mt-1">{h.note}</p>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/50">
                          <span>Changed by: <strong className="text-slate-300">{h.changed_by}</strong></span>
                          <span>{new Date(h.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Inbound Email Simulator for Demo (Restricted to NGO & Official Admins) */}
              {isNgoOrAdmin && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center space-x-1.5">
                      <Mail className="size-3.5 text-sky-400 shrink-0" />
                      <span>Inbound Email Parsing Test</span>
                    </span>
                    <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded font-mono">Demo Auto-Parse</span>
                  </div>
                  <input
                    type="text"
                    value={simulatedReplyBody}
                    onChange={(e) => setSimulatedReplyBody(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-[11px] text-white"
                  />
                  <button
                    onClick={handleSimulateInboundReply}
                    disabled={isSimulatingInbound}
                    className="w-full bg-sky-700 hover:bg-sky-600 active:scale-[0.99] text-white font-semibold py-2 px-3 rounded-lg text-[11px] transition cursor-pointer flex items-center justify-center space-x-2 shadow-sm"
                  >
                    {isSimulatingInbound ? (
                      <Clock className="size-4 animate-spin text-sky-200 shrink-0" />
                    ) : (
                      <Mail className="size-4 text-sky-200 shrink-0" />
                    )}
                    <span>{isSimulatingInbound ? 'Simulating Inbound Email...' : 'Simulate Officer Email Reply Inbound'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: AI Resolution Verification Engine (Before vs After) */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <FileCheck className="size-5 text-emerald-400 shrink-0" />
                <span>AI Resolution Verification Engine (Before vs. After Photo Audit)</span>
              </h3>
              {proofs.length > 0 && proofs[0].verified_by_ai && (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-lg text-xs font-bold">
                  AI Verified Repair Match ({proofs[0].ai_confidence_score}% Score)
                </span>
              )}
            </div>

            {/* Mandatory Physical Verification Rule Banner */}
            {activeIssue.status !== 'resolved' && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-300 text-xs flex items-start space-x-2.5">
                <AlertCircle className="size-4 shrink-0 text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block text-amber-200">Physical Verification Required To Resolve Case</span>
                  <p className="text-amber-300/90 leading-relaxed text-[11px]">
                    AI resolution verification alone does <strong>NOT</strong> solely decide whether to clear a complaint.
                    A mandatory on-ground physical inspection by a volunteer (below) is required to officially mark the issue as <strong>RESOLVED</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message if Approval Fails Physical Check */}
            {approvalErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start space-x-2">
                <ShieldAlert className="size-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{approvalErrorMsg}</span>
              </div>
            )}

            {/* Proof Submission or Comparison View */}
            {proofs.length === 0 ? (
              <div className="space-y-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white text-xs flex items-center space-x-2">
                    <Camera className="size-4 text-emerald-400" />
                    <span>Upload Repair Resolution Proof (Official or NGO Volunteer)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Requires Before vs After AI Compare</span>
                </div>

                <form onSubmit={handleSubmitProof} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Submitted By Entity</label>
                      <input
                        type="text"
                        value={submittedBy}
                        onChange={(e) => setSubmittedBy(e.target.value)}
                        placeholder="e.g. GHMC Circle Engineer / Volunteer"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">After Repair Photo Evidence</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={afterPhotoUrl}
                          onChange={(e) => setAfterPhotoUrl(e.target.value)}
                          placeholder="Image URL or upload below..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                        <label className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center shrink-0">
                          <Upload className="size-3.5 mr-1" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    setAfterPhotoUrl(reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Sample Presets */}
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => setAfterPhotoUrl('https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80')}
                      className="text-xs text-emerald-400 hover:underline cursor-pointer"
                    >
                      Repaired Asphalt Road
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setAfterPhotoUrl('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80')}
                      className="text-xs text-emerald-400 hover:underline cursor-pointer"
                    >
                      Cleared Garbage Site
                    </button>
                  </div>

                  {afterPhotoUrl && (
                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center space-x-3">
                      <img src={afterPhotoUrl} alt="Preview" className="size-12 rounded object-cover border border-slate-700" />
                      <div className="text-[11px] text-slate-300 truncate">After Photo Selected</div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUploadingProof || !afterPhotoUrl}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md flex items-center justify-center space-x-2"
                  >
                    {isUploadingProof ? (
                      <>
                        <Clock className="size-4 animate-spin" />
                        <span>Analyzing Before vs After with Gemini Vision AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4 text-emerald-200" />
                        <span>Submit Resolution Proof & Run AI Vision Audit</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before Photo */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-rose-400 uppercase flex items-center space-x-1">
                      <Camera className="size-3.5" />
                      <span>Original Complaint Photo (Before)</span>
                    </span>
                    <div className="h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                      <img src={proofs[0].before_photo_url || activeIssue.photo_url} alt="Before" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* After Photo */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase flex items-center space-x-1">
                      <CheckCircle2 className="size-3.5" />
                      <span>Submitted Resolution Photo (After)</span>
                    </span>
                    <div className="h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                      <img src={proofs[0].after_photo_url || proofs[0].photo_url} alt="After" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* AI Comparison Report */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span className="flex items-center space-x-1.5">
                      <Sparkles className="size-4 shrink-0" />
                      <span>Gemini Vision AI Analysis: {proofs[0].ai_notes || proofs[0].ai_match_notes}</span>
                    </span>
                    <span className="font-mono text-emerald-300">{proofs[0].ai_confidence_score || 95}% Match Score</span>
                  </div>

                  {activeIssue.status !== 'resolved' && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleApproveResolution(proofs[0].id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-md transition flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Acknowledge AI Proof Approval</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Volunteer On-Ground Physical Verification Audit */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <UserCheck className="size-5 text-amber-400 shrink-0" />
                <span>Volunteer On-Ground Physical Verification Audit</span>
              </h3>

              {activeIssue.physical_verification_status === 'physically_verified_true' ? (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  <span>Physically Verified by Volunteer Inspector</span>
                </span>
              ) : activeIssue.physical_verification_status === 'physically_verified_false' ? (
                <span className="bg-rose-950 text-rose-300 border border-rose-800 px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5">
                  <ShieldAlert className="size-3.5 shrink-0" />
                  <span>Physically Verified FALSE / Fake Claim</span>
                </span>
              ) : (
                <span className="bg-amber-950 text-amber-300 border border-amber-800 px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5">
                  <Clock className="size-3.5 shrink-0" />
                  <span>Awaiting Volunteer On-Ground Physical Audit</span>
                </span>
              )}
            </div>

            {/* Success Notification */}
            {physicalVerifySuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center space-x-2.5 animate-fadeIn">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
                <span className="font-medium">{physicalVerifySuccessMsg}</span>
              </div>
            )}

            {/* Existing Physical Verification Result Box */}
            {activeIssue.physical_verification_status && activeIssue.physical_verification_status !== 'unverified' && (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white flex items-center space-x-1.5">
                    <UserCheck className="size-4 text-emerald-400 shrink-0" />
                    <span>Auditor: {activeIssue.verified_by_volunteer_name || 'Volunteer Inspector'}</span>
                  </span>
                  {activeIssue.physical_verified_at && (
                    <span className="text-slate-500 text-[10px] font-mono">
                      {new Date(activeIssue.physical_verified_at).toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Audit Notes & Site Findings</div>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                      {activeIssue.physical_verification_notes}
                    </p>
                  </div>
                  {activeIssue.physical_verification_photo && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">On-Ground Inspection Photo</div>
                      <div className="h-24 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                        <img
                          src={activeIssue.physical_verification_photo}
                          alt="Physical Audit Evidence"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {activeIssue.status !== 'resolved' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleCloseIssue}
                      disabled={isClosingIssue}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-md transition flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>{isClosingIssue ? 'Closing Complaint...' : 'Officially Close & Resolve Complaint'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Toggle Form / Action Button */}
            {!showPhysicalVerifyForm ? (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
                <p className="text-slate-400 text-xs">
                  Volunteers and citizens physically visit the GPS site coordinates to inspect whether the civic issue is active, repaired, or fake.
                </p>
                <button
                  type="button"
                  onClick={() => setShowPhysicalVerifyForm(true)}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shrink-0 shadow-sm flex items-center space-x-1.5"
                >
                  <UserCheck className="size-4" />
                  <span>{activeIssue.physical_verification_status && activeIssue.physical_verification_status !== 'unverified' ? 'Re-Audit On-Ground Inspection' : 'Perform On-Ground Physical Verification'}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleVolunteerPhysicalVerify} className="space-y-4 bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
                <div className="font-bold text-white text-xs flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="flex items-center space-x-2">
                    <UserCheck className="size-4 text-amber-400" />
                    <span>Record On-Ground Physical Verification Audit</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPhysicalVerifyForm(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Select Physical Inspection Finding *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setVerificationAction('confirm_problem');
                          setPhysicalNotes('On-ground inspection confirmed the civic problem is genuine and active at the reported site coordinates.');
                        }}
                        className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center text-center space-y-1 transition cursor-pointer ${
                          verificationAction === 'confirm_problem'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-500 shadow-md'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <MapPin className="size-4 text-amber-400" />
                        <span>Problem Active on Site</span>
                        <span className="text-[10px] font-normal opacity-80">Confirmed genuine issue</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setVerificationAction('confirm_resolved');
                          setPhysicalNotes('On-ground inspection confirmed the civic issue is fully repaired and restored at the site.');
                        }}
                        className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center text-center space-y-1 transition cursor-pointer ${
                          verificationAction === 'confirm_resolved'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-md'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="size-4 text-emerald-400" />
                        <span>Repaired & Restored</span>
                        <span className="text-[10px] font-normal opacity-80">Close case on site</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setVerificationAction('mark_fake');
                          setPhysicalNotes('On-ground inspection found no evidence of the reported civic hazard. Flagged as fake or invalid report.');
                        }}
                        className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center text-center space-y-1 transition cursor-pointer ${
                          verificationAction === 'mark_fake'
                            ? 'bg-rose-950/80 text-rose-300 border-rose-500 shadow-md'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <ShieldAlert className="size-4 text-rose-400" />
                        <span>Fake / Not Found</span>
                        <span className="text-[10px] font-normal opacity-80">Reject fraudulent report</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Volunteer Auditor Name *</label>
                      <input
                        type="text"
                        required
                        value={volunteerInspectorName}
                        onChange={(e) => setVolunteerInspectorName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Site Inspection Photo</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={physicalPhotoUrl}
                          onChange={(e) => setPhysicalPhotoUrl(e.target.value)}
                          placeholder="Image URL or upload..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                        <label className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center shrink-0">
                          <Upload className="size-3.5 mr-1" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    setPhysicalPhotoUrl(reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Physical Inspection Audit Notes & Findings *</label>
                    <textarea
                      required
                      rows={3}
                      value={physicalNotes}
                      onChange={(e) => setPhysicalNotes(e.target.value)}
                      placeholder="Enter details of physical on-ground site inspection..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowPhysicalVerifyForm(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPhysicalVerify}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer flex items-center space-x-2 shadow-md"
                  >
                    {isSubmittingPhysicalVerify ? (
                      <>
                        <Clock className="size-3.5 animate-spin" />
                        <span>Submitting Physical Audit...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-3.5" />
                        <span>Submit Physical Verification Audit</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
