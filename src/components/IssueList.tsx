import React, { useState } from 'react';
import { Issue, IssueStatus } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import {
  Search,
  Filter,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Lock,
  UserCheck,
  MapPin,
  PlusCircle,
  Sparkles,
  X
} from 'lucide-react';

interface IssueListProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onOpenReportModal: () => void;
  onOpenMapModal?: () => void;
}

// Levenshtein distance for fuzzy typo handling
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  if (Math.abs(a.length - b.length) > 3) return 99;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Expand status codes into searchable human terms
function getStatusSearchText(status: IssueStatus, tier: number): string {
  let terms = status.toLowerCase() + ' ';
  if (['submitted', 'filed', 'escalated_tier2', 'escalated_tier3'].includes(status)) {
    terms += ' open active pending escalated in progress filed ';
  }
  if (status === 'claimed_resolved_by_official') {
    terms += ' claimed official claimed under review under investigation ';
  }
  if (status === 'resolved') {
    terms += ' resolved verified resolved fixed done completed closed ';
  }
  if (status === 'open_for_ngo') {
    terms += ' ngo open for ngo escalation volunteer community ';
  }
  if (tier === 1) terms += ' tier 1 ward officer ';
  if (tier === 2) terms += ' tier 2 engineer assistant executive ';
  if (tier === 3) terms += ' tier 3 municipal commissioner collector ';
  return terms;
}

// Robust search matcher matching issue details against search query terms
function matchIssueSearch(issue: Issue, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  if (!q) return true;

  const queryTerms = q.split(/\s+/).filter(Boolean);
  if (queryTerms.length === 0) return true;

  // Search target string comprising all relevant fields
  const statusTerms = getStatusSearchText(issue.status, issue.current_tier);
  const targetText = [
    issue.tracking_code,
    issue.address,
    issue.category,
    issue.description,
    issue.reporter_name,
    statusTerms
  ].join(' ').toLowerCase();

  const targetTokens = targetText.replace(/[^a-z0-9\s]/gi, ' ').split(/\s+/).filter(Boolean);

  // ALL query terms must match somewhere in the issue
  return queryTerms.every((qTerm) => {
    // Direct substring check in target text
    if (targetText.includes(qTerm)) return true;

    // Direct tracking code prefix match
    const cleanTracking = issue.tracking_code.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanQuery = qTerm.replace(/[^a-z0-9]/g, '');
    if (cleanTracking && cleanQuery && cleanTracking.includes(cleanQuery)) return true;

    // Fuzzy matching against tokens for short typos (e.g. "pothol" -> "potholes", "hyderbad" -> "hyderabad")
    if (qTerm.length >= 4) {
      const maxDistance = qTerm.length <= 5 ? 1 : 2;
      return targetTokens.some((token) => {
        if (Math.abs(token.length - qTerm.length) > maxDistance) return false;
        return levenshteinDistance(token, qTerm) <= maxDistance;
      });
    }

    return false;
  });
}

export const IssueList: React.FC<IssueListProps> = ({
  issues,
  onSelectIssue,
  onOpenReportModal,
  onOpenMapModal
}) => {
  const { t, translateCategory, translateStatus, translateTier } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = matchIssueSearch(issue, searchTerm);
    const matchesCategory = selectedCategory === 'All' || issue.category === selectedCategory;

    let matchesStatus = true;
    if (selectedStatus === 'Open') {
      matchesStatus = ['submitted', 'filed', 'escalated_tier2', 'escalated_tier3'].includes(issue.status);
    } else if (selectedStatus === 'Claimed') {
      matchesStatus = issue.status === 'claimed_resolved_by_official' || issue.status === 'ngo_claimed';
    } else if (selectedStatus === 'Resolved') {
      matchesStatus = issue.status === 'resolved';
    } else if (selectedStatus === 'NGO') {
      matchesStatus = issue.status === 'open_for_ngo';
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate SLA countdown string
  const getSLAStatus = (deadlineAt: string) => {
    const diff = new Date(deadlineAt).getTime() - Date.now();
    if (diff <= 0) {
      return { text: t('overdue'), class: 'bg-rose-950/80 text-rose-300 border-rose-800' };
    }
    const mins = Math.ceil(diff / (1000 * 60));
    if (mins < 60) {
      return { text: `${mins}m ${t('active_sla')}`, class: 'bg-amber-950/80 text-amber-300 border-amber-800' };
    }
    const hours = (mins / 60).toFixed(1);
    return { text: `${hours}h ${t('active_sla')}`, class: 'bg-slate-800 text-slate-300 border-slate-700' };
  };

  const getTierBadge = (tier: number, status: IssueStatus) => {
    if (status === 'resolved') {
      return <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-semibold">{t('status_resolved')}</span>;
    }
    if (status === 'claimed_resolved_by_official') {
      return <span className="bg-amber-950/90 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-semibold">{t('status_claimed_resolved_by_official')}</span>;
    }
    if (status === 'open_for_ngo') {
      return <span className="bg-purple-950/90 text-purple-300 border border-purple-800 px-2 py-0.5 rounded text-[10px] font-semibold">{t('status_open_for_ngo')}</span>;
    }
    if (tier === 3) {
      return <span className="bg-rose-950/90 text-rose-300 border border-rose-800 px-2 py-0.5 rounded text-[10px] font-semibold">{translateTier(3)}</span>;
    }
    if (tier === 2) {
      return <span className="bg-orange-950/90 text-orange-300 border border-orange-800 px-2 py-0.5 rounded text-[10px] font-semibold">{translateTier(2)}</span>;
    }
    return <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">{translateTier(1)}</span>;
  };

  const totalCount = issues.length;
  const inProgressCount = issues.filter(i => ['submitted', 'filed', 'escalated_tier2', 'escalated_tier3'].includes(i.status)).length;
  const overdueCount = issues.filter(i => new Date(i.deadline_at).getTime() < Date.now() && i.status !== 'resolved').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100 space-y-8">
      {/* Header & Metrics Overview */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{t('public_directory_title')}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {t('public_directory_subtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onOpenMapModal && (
              <button
                onClick={onOpenMapModal}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition cursor-pointer"
              >
                <MapPin className="size-4 text-orange-400 shrink-0" />
                <span>{t('open_gis_map')}</span>
              </button>
            )}

            <button
              onClick={onOpenReportModal}
              className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 transition shadow-sm cursor-pointer"
            >
              <PlusCircle className="size-4 shrink-0" />
              <span>{t('report_issue')}</span>
            </button>
          </div>
        </div>

        {/* Executive Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium">{t('total_filed_complaints')}</span>
            <div className="text-2xl font-bold text-white mt-1">{totalCount}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4">
            <span className="text-xs text-amber-400 font-medium">{t('active_under_sla')}</span>
            <div className="text-2xl font-bold text-amber-300 mt-1">{inProgressCount}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4">
            <span className="text-xs text-rose-400 font-medium">{t('sla_breached')}</span>
            <div className="text-2xl font-bold text-rose-300 mt-1">{overdueCount}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4">
            <span className="text-xs text-emerald-400 font-medium">{t('verified_resolved')}</span>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{resolvedCount}</div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input Container */}
            <div className="relative flex-1 w-full">
              <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('search_input_placeholder')}
                className="w-full bg-slate-950 text-white pl-10 pr-10 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition cursor-pointer"
                  title="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Category and Status Dropdowns */}
            <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
              >
                <option value="All">{t('all_categories')}</option>
                <option value="Potholes & Roads">🚧 {translateCategory('Potholes & Roads')}</option>
                <option value="Garbage & Sanitation">🗑️ {translateCategory('Garbage & Sanitation')}</option>
                <option value="Water Supply">💧 {translateCategory('Water Supply')}</option>
                <option value="Street Lighting">💡 {translateCategory('Street Lighting')}</option>
                <option value="Drainage & Sewage">🌊 {translateCategory('Drainage & Sewage')}</option>
                <option value="Parks & Public Spaces">🌳 {translateCategory('Parks & Public Spaces')}</option>
                <option value="Encroachment & Traffic">🚦 {translateCategory('Encroachment & Traffic')}</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
              >
                <option value="All">{t('all_statuses')}</option>
                <option value="Open">{t('badge_open')}</option>
                <option value="Claimed">{t('status_claimed_resolved_by_official')}</option>
                <option value="Resolved">{t('status_resolved')}</option>
                <option value="NGO">{t('status_open_for_ngo')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIssues.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <ShieldAlert className="size-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">{t('no_matching_complaints')}</h3>
            <p className="text-xs text-slate-400 mt-1">{t('no_matching_sub')}</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          filteredIssues.filter(Boolean).map((issue) => {
            const sla = getSLAStatus(issue.deadline_at);
            return (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className="bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-200 cursor-pointer flex flex-col justify-between group"
              >
                {/* Photo & Badges Container */}
                <div className="h-48 relative overflow-hidden bg-slate-950">
                  <img
                    src={issue?.photo_url || ''}
                    alt={issue?.category || ''}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Top Badges Bar */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-slate-950/80 backdrop-blur-md text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded-lg font-mono font-bold text-xs">
                      #{issue.tracking_code}
                    </span>
                    {getTierBadge(issue.current_tier, issue.status)}
                  </div>

                  {/* Bottom SLA & Verification Badges */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border backdrop-blur-md flex items-center space-x-1 ${sla.class}`}>
                      <Clock className="size-3 shrink-0" />
                      <span>{sla.text}</span>
                    </span>

                    {issue.physical_verification_status === 'physically_verified_true' && (
                      <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-800 px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md flex items-center space-x-1" title="Physically Verified True by Volunteer">
                        <UserCheck className="size-3 shrink-0 text-emerald-400" />
                        <span>Ground Verified</span>
                      </span>
                    )}
                    {issue.physical_verification_status === 'physically_verified_false' && (
                      <span className="bg-rose-950/90 text-rose-300 border border-rose-800 px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md flex items-center space-x-1" title="Physically Verified False / Fake Claim">
                        <ShieldAlert className="size-3 shrink-0 text-rose-400" />
                        <span>Fake/Unresolved</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between text-xs">
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                      {translateCategory(issue.category)}
                    </div>

                    <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-orange-400 transition">
                      {issue.address}
                    </h3>

                    <p className="text-slate-400 line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center space-x-1">
                      {issue.is_anonymous ? (
                        <>
                          <Lock className="size-3 text-slate-500 shrink-0" />
                          <span className="italic text-slate-500">{t('submit_anonymously')}</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="size-3 text-emerald-400 shrink-0" />
                          <span className="font-medium text-slate-300">{issue.reporter_name}</span>
                        </>
                      )}
                    </div>

                    <span className="text-orange-400 font-bold flex items-center space-x-1 group-hover:translate-x-1 transition">
                      <span>{t('view_details')}</span>
                      <ArrowRight className="size-3 shrink-0" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
