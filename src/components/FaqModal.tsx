import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Search,
  ShieldAlert,
  Camera,
  Clock,
  MessageCircle,
  HeartHandshake,
  Award,
  PhoneCall,
  ChevronDown,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Layers,
  Zap,
  MapPin
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReportModal?: () => void;
  onOpenTrackModal?: () => void;
  onOpenWhatsappBot?: () => void;
}

interface FaqItem {
  id: string;
  category: 'general' | 'camera_ai' | 'escalation' | 'whatsapp' | 'ngo_rewards' | 'contacts';
  question: string;
  answer: string;
  highlights?: string[];
  actionLabel?: string;
  actionType?: 'report' | 'track' | 'whatsapp';
}

const FAQ_ITEMS: FaqItem[] = [
  // 1. General & Overview
  {
    id: 'faq_1',
    category: 'general',
    question: 'What is the CIR (Citizen Issue Reporting) Platform?',
    answer: 'CIR is an AI-powered municipal civic accountability and rapid grievance redresal system for Hyderabad (GHMC). It enables citizens to report road hazards, garbage overflow, water supply bursts, and drainage issues with verified live geotagged photo proof and automated 3-tier government escalation.',
    highlights: [
      'Automatic ward mapping across all 150 GHMC divisions',
      'Real-time SLA timers with automated government email dispatch',
      'Community NGO verification and citizen reward certificates'
    ],
    actionLabel: 'Report a Civic Issue',
    actionType: 'report'
  },
  {
    id: 'faq_2',
    category: 'general',
    question: 'How is CIR different from traditional municipal complaint portals?',
    answer: 'Traditional grievance portals often suffer from lack of accountability, fake resolution claims, and manual delays. CIR fixes this through: (1) Mandatory live GPS & tamper-resistant photographic proof, (2) AI Gemini multimodal defect inspection, (3) Autonomous SLA escalation to higher-ranking IAS/Collector authorities, and (4) Citizen "Resolved" verification before any ticket is closed.',
    highlights: [
      'No unverified text-only spam tickets',
      'Official email notifications sent with geotagged evidence to Ward Engineers',
      'Public leaderboard ranking best and worst performing GHMC zones'
    ]
  },

  // 2. Camera, Geotagging & AI Verification
  {
    id: 'faq_3',
    category: 'camera_ai',
    question: 'Why is live camera capture and GPS location locking mandatory?',
    answer: 'To eliminate fabricated or duplicate complaints from old gallery photos, CIR strictly uses live device camera capture paired with hardware-level GPS coordinate locking. Every captured photo is watermarked on-canvas with the exact timestamp, coordinates (±5m accuracy), and GHMC ward zone.',
    highlights: [
      'Prevents spam and outdated photos from internet downloads',
      'Assures municipal engineers of the exact physical location of the defect',
      'Generates legally admissible on-site civic proof'
    ]
  },
  {
    id: 'faq_4',
    category: 'camera_ai',
    question: 'Why did the AI reject my photo evidence?',
    answer: 'CIR uses Gemini AI multimodal inspection to verify that the photo depicts an authentic public civic infrastructure defect (e.g. pothole, broken streetlight, open manhole, overflowing dumper bin, water pipe leak). Selfies, indoor rooms, personal items, food, or blurry non-civic photos are automatically blocked to keep municipal queues clean.',
    highlights: [
      'If your camera cannot connect, switch to the "Sample Photos" tab for instant testing',
      'Make sure you stand safely and point directly at the road or public hazard in good lighting'
    ]
  },
  {
    id: 'faq_5',
    category: 'camera_ai',
    question: 'Can I submit a complaint anonymously?',
    answer: 'Yes! You can toggle "Submit Anonymously" during complaint filing. Your personal name, phone number, and email will be hidden from municipal officers and public dashboards. You will receive a unique 8-character tracking code (e.g. #HYD-7A92) to track progress.',
    highlights: [
      '100% privacy protection for whistleblower citizens',
      'You can still track real-time resolution and official action'
    ],
    actionLabel: 'Track Existing Complaint',
    actionType: 'track'
  },

  // 3. 3-Tier SLA & Automated Escalation
  {
    id: 'faq_6',
    category: 'escalation',
    question: 'How does the 3-Tier Government Escalation Engine work?',
    answer: 'Every reported issue is bound by a strict Service Level Agreement (SLA). If the responsible authority fails to act within the prescribed SLA window, the CIR autonomous engine immediately escalates the complaint to the next senior administrative rank with official email dispatches.',
    highlights: [
      'Tier 1 (Filing): Dispatched to Ward Assistant Engineer (AE) & Sanitary Inspector',
      'Tier 2 (SLA Breached): Escalated to Executive Engineer & Zonal Deputy Commissioner',
      'Tier 3 (Persistent Default): Escalated to District Collector, GHMC Commissioner & Vigilance'
    ]
  },
  {
    id: 'faq_7',
    category: 'escalation',
    question: 'How do I test the escalation engine in Demo Mode?',
    answer: 'In the top navbar, you can adjust the "Demo SLA Speed" dropdown to "2 Mins (Demo Pitch)". You can also click the lightning bolt "Run Escalation Check" button at any time to simulate time progression and watch tickets breach SLA and advance through Tier 1 -> Tier 2 -> Tier 3 with simulated email dispatches.',
    highlights: [
      'Visual timeline showing timestamped officer assignments and dispatch logs',
      'Interactive demonstration of zero-human-bottleneck government escalation'
    ]
  },

  // 4. WhatsApp Helpline Assistant
  {
    id: 'faq_8',
    category: 'whatsapp',
    question: 'How do I use the GHMC CIR WhatsApp Helpline (+91 91542 04321)?',
    answer: 'Citizens can report hazards, track active complaints, find nearby NGO events, and verify resolved issues directly on WhatsApp. Click the floating green "WhatsApp Helpline" button at the bottom right corner of the screen to open the interactive AI WhatsApp Assistant simulator.',
    highlights: [
      'Type "1" to report an issue, "2" to track with a code, or "3" for emergency helplines',
      'Multilingual conversational AI understands English, Telugu, and Hindi',
      'Instant tracking updates with estimated resolution dates'
    ],
    actionLabel: 'Launch WhatsApp Assistant',
    actionType: 'whatsapp'
  },

  // 5. NGOs, Civic Karma & Certificates
  {
    id: 'faq_9',
    category: 'ngo_rewards',
    question: 'How do NGOs and Citizen Volunteer groups participate?',
    answer: 'If municipal authorities take too long or if an issue requires community action (e.g. tree plantation, neighborhood garbage clean-up, wall painting), registered NGOs can claim the issue in the "NGO Hub" and organize weekend volunteer drives.',
    highlights: [
      'NGOs can post upcoming volunteer drives with dates and meet points',
      'Citizens can register to volunteer and earn Civic Karma points',
      'Verified drives qualify for official GHMC Civic Recognition Certificates'
    ]
  },
  {
    id: 'faq_10',
    category: 'ngo_rewards',
    question: 'How do I earn Civic Karma points and download official certificates?',
    answer: 'You earn points for active civic participation: +50 points for reporting genuine verified issues, +100 points for participating in NGO volunteer drives, and +25 points for confirming municipal resolutions. When you accumulate 100+ points, you unlock and download official signed GHMC Citizen certificates from your Profile page.',
    highlights: [
      'Bronze Citizen Badge (50 pts)',
      'Silver Civic Champion Certificate (200 pts)',
      'Gold Municipal Crusader Certificate (500 pts)'
    ]
  },

  // 6. Emergency Contacts & Hotlines
  {
    id: 'faq_11',
    category: 'contacts',
    question: 'What are the official municipal emergency helplines in Hyderabad?',
    answer: 'For life-threatening emergencies or urgent utility breakdowns, citizens can reach the 24x7 control rooms directly:',
    highlights: [
      '🏛️ GHMC Central Grievance Control Room: 040-21111111 / 155304',
      '💧 HMWSSB Water Supply & Sewerage: 155313',
      '⚡ TSSPDCL Electricity Breakdown: 1912',
      '🚒 Fire & Emergency Disaster Response: 101 / 112',
      '🚦 Hyderabad Traffic Police WhatsApp: +91 90102 03626'
    ]
  }
];

export const FaqModal: React.FC<FaqModalProps> = ({
  isOpen,
  onClose,
  onOpenReportModal,
  onOpenTrackModal,
  onOpenWhatsappBot,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq_1');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Topics', icon: HelpCircle },
    { id: 'general', label: 'Platform & Overview', icon: ShieldAlert },
    { id: 'camera_ai', label: 'Camera & AI Proof', icon: Camera },
    { id: 'escalation', label: '3-Tier SLA Escalation', icon: Clock },
    { id: 'whatsapp', label: 'WhatsApp Helpline', icon: MessageCircle },
    { id: 'ngo_rewards', label: 'NGOs & Karma Rewards', icon: Award },
    { id: 'contacts', label: 'Emergency Hotlines', icon: PhoneCall },
  ];

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesText =
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query) ||
      item.highlights?.some((h) => h.toLowerCase().includes(query));

    return matchesCategory && matchesText;
  });

  const toggleExpand = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const handleActionClick = (type?: string) => {
    onClose();
    if (type === 'report' && onOpenReportModal) onOpenReportModal();
    if (type === 'track' && onOpenTrackModal) onOpenTrackModal();
    if (type === 'whatsapp' && onOpenWhatsappBot) onOpenWhatsappBot();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-5 sm:px-8 py-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="size-10 rounded-2xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
              <HelpCircle className="size-5 shrink-0" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  CIR Help Center & Knowledge Base
                </h2>
                <span className="bg-orange-500/20 border border-orange-500/40 text-orange-300 text-[10px] font-mono px-2 py-0.5 rounded-full uppercase">
                  GHMC FAQ
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Everything you need to know about filing, AI photo inspection, 3-tier escalation, and volunteer drives.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer shrink-0"
            aria-label="Close FAQ Modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-4 sm:p-6 pb-2 border-b border-slate-800 bg-slate-900/60 space-y-4 shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search frequently asked questions (e.g. AI verification, escalation SLA, anonymous, WhatsApp)..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Pills (Horizontal Scrolling on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                    isSelected
                      ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-950/40'
                      : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`size-3.5 ${isSelected ? 'text-white' : 'text-orange-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6">
              <div className="size-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Search className="size-5" />
              </div>
              <h3 className="text-sm font-bold text-white">No matching questions found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching for something else like "photo", "escalation", "points", or clear your search query.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? 'bg-slate-950/90 border-orange-500/50 ring-1 ring-orange-500/20 shadow-lg'
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/70'
                  }`}
                >
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full px-5 py-4 text-left flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`size-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isExpanded
                            ? 'bg-orange-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Q
                      </div>
                      <span
                        className={`text-sm font-bold leading-snug ${
                          isExpanded ? 'text-orange-300' : 'text-slate-200 hover:text-white'
                        }`}
                      >
                        {faq.question}
                      </span>
                    </div>

                    <div
                      className={`size-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isExpanded ? 'bg-orange-600/20 text-orange-400 rotate-180' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <ChevronDown className="size-4" />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-800/60 animate-in fade-in slide-in-from-top-1 duration-150">
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                        {faq.answer}
                      </p>

                      {faq.highlights && faq.highlights.length > 0 && (
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                          <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">
                            Key Highlights:
                          </span>
                          <ul className="space-y-1.5">
                            {faq.highlights.map((h, i) => (
                              <li key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {faq.actionLabel && (
                        <div className="pt-1 flex items-center justify-end">
                          <button
                            onClick={() => handleActionClick(faq.actionType)}
                            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-md shadow-orange-950/50 transition cursor-pointer"
                          >
                            <span>{faq.actionLabel}</span>
                            <ExternalLink className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Hotlinks */}
        <div className="px-5 sm:px-8 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center space-x-2">
            <Zap className="size-4 text-amber-400" />
            <span>Still need help? Connect on our 24x7 WhatsApp Helpline.</span>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenWhatsappBot && (
              <button
                onClick={() => {
                  onClose();
                  onOpenWhatsappBot();
                }}
                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 cursor-pointer transition"
              >
                <MessageCircle className="size-3.5 text-emerald-400" />
                <span>WhatsApp Assistant</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
