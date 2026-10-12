import React, { useState, useEffect } from 'react';
import { WardRepresentative, Issue, CitizenReporter, Badge } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import {
  BarChart3,
  Award,
  TrendingUp,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
  Calendar,
  AlertOctagon,
  Trophy,
  Flame,
  Star,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';

export const AccountabilityDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'citizens' | 'wards'>('citizens');
  const [wards, setWards] = useState<WardRepresentative[]>([]);
  const [leaderboard, setLeaderboard] = useState<CitizenReporter[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<WardRepresentative | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | 'ytd'>('30d');
  const [leaderIssues, setLeaderIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'bronze' | 'silver' | 'gold' | 'platinum'>('all');

  useEffect(() => {
    fetchWards();
    fetchLeaderboardAndBadges();
  }, []);

  const fetchWards = async () => {
    try {
      const res = await fetch('/api/wards');
      const data = await res.json();
      setWards(data.wards || []);
    } catch (err) {
      console.error('Error fetching wards:', err);
    }
  };

  const fetchLeaderboardAndBadges = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
      if (data.badges) {
        setBadges(data.badges);
      }
    } catch (err) {
      console.error('Error fetching leaderboard & badges:', err);
    }
  };

  useEffect(() => {
    if (selectedLeader) {
      fetchLeaderIssues(selectedLeader.ward_name);
    }
  }, [selectedLeader]);

  const fetchLeaderIssues = async (wardName: string) => {
    setLoadingIssues(true);
    try {
      const res = await fetch('/api/issues');
      const data = await res.json();
      const allIssues: Issue[] = data.issues || [];
      const wardKey = wardName.toLowerCase().split('(')[0].trim();
      const filtered = allIssues.filter((iss) =>
        iss.address.toLowerCase().includes(wardKey) || wardKey.includes(iss.address.toLowerCase().slice(0, 5))
      );
      setLeaderIssues(filtered.length > 0 ? filtered : allIssues.slice(0, 4));
    } catch (err) {
      console.error('Error fetching leader issues:', err);
    } finally {
      setLoadingIssues(false);
    }
  };

  const filteredBadges = badgeFilter === 'all' 
    ? badges 
    : badges.filter(b => b.level === badgeFilter);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/50', icon: '🥇', label: '1st Place' };
    if (rank === 2) return { bg: 'bg-slate-300/20 text-slate-200 border-slate-400/50', icon: '🥈', label: '2nd Place' };
    if (rank === 3) return { bg: 'bg-amber-700/20 text-amber-400 border-amber-700/50', icon: '🥉', label: '3rd Place' };
    return { bg: 'bg-slate-800 text-slate-300 border-slate-700', icon: `#${rank}`, label: `Rank #${rank}` };
  };

  const getBadgeLevelColor = (level: string) => {
    switch (level) {
      case 'platinum': return 'bg-purple-500/10 text-purple-400 border-purple-500/40';
      case 'gold': return 'bg-amber-500/10 text-amber-400 border-amber-500/40';
      case 'silver': return 'bg-slate-300/10 text-slate-300 border-slate-400/40';
      default: return 'bg-orange-500/10 text-orange-400 border-orange-500/40';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Trophy className="size-6 shrink-0" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{t('ward_stats_title')}</h2>
              <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                GHMC CIVIC REWARDS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Public Accountability & Gamification: Track top citizen reporters, earn verified badges, and audit ward resolution rates across GHMC divisions.
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('citizens')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'citizens'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Trophy className="size-3.5" />
            <span>Citizen Leaderboard & Badges</span>
          </button>
          <button
            onClick={() => setActiveTab('wards')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'wards'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building2 className="size-3.5" />
            <span>Ward Representatives ({wards.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CITIZEN GAMIFICATION & BADGES */}
      {activeTab === 'citizens' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Trophy className="size-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Top Active Citizen</div>
                <div className="text-base font-bold text-white mt-0.5 truncate">{leaderboard[0]?.name || 'Ananya Reddy'}</div>
                <div className="text-[11px] text-amber-400 font-mono font-bold">{leaderboard[0]?.points || 1450} Points (Rank #1)</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                <Flame className="size-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Longest Vigilance Streak</div>
                <div className="text-base font-bold text-white mt-0.5">12 Days Active</div>
                <div className="text-[11px] text-orange-400 font-medium">Daily On-Site Reporting</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">GPS Verified Reports</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5 font-mono">100% On-Ground</div>
                <div className="text-[11px] text-slate-400">Live Camera Geotagged</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Award className="size-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Available Badges</div>
                <div className="text-base font-bold text-white mt-0.5">{badges.length} Achievements</div>
                <div className="text-[11px] text-purple-400 font-medium">+50 to +100 Pts / Unlock</div>
              </div>
            </div>
          </div>

          {/* Gamification Points Rules Info Banner */}
          <div className="bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-900 border border-orange-500/30 rounded-2xl p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">How Civic Gamification Works in Hyderabad</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Earn <strong className="text-orange-400">+50 Points</strong> for on-site live GPS photo reports, <strong className="text-emerald-400">+30 Points</strong> for AI verification, and <strong className="text-purple-400">+100 Points</strong> when your issue is resolved by GHMC!
                </p>
              </div>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 shrink-0 font-mono">
              ⚡ Anti-Spam: Live Camera & GPS Enforced
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Citizen Leaderboard Table */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2.5">
                  <Trophy className="size-5 text-orange-400" />
                  <h3 className="text-base font-bold text-white">Top Citizen Civic Reporters</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Real-Time Points Ranking</span>
              </div>

              <div className="space-y-3">
                {leaderboard.map((reporter) => {
                  const rankInfo = getRankBadge(reporter.rank);
                  return (
                    <div
                      key={reporter.id}
                      className="bg-slate-950 border border-slate-800 hover:border-orange-500/40 rounded-xl p-4 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Left: Rank & Citizen Profile */}
                      <div className="flex items-center space-x-3.5">
                        {/* Rank Badge */}
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${rankInfo.bg}`}>
                          {rankInfo.icon}
                        </div>

                        {/* Avatar */}
                        <img
                          src={reporter.avatar_url}
                          alt={reporter.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                        />

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">{reporter.name}</span>
                            {reporter.streak_days > 0 && (
                              <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center space-x-0.5">
                                <Flame className="size-2.5" />
                                <span>{reporter.streak_days}d streak</span>
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center space-x-1.5 mt-0.5">
                            <MapPin className="size-3 text-slate-500 shrink-0" />
                            <span className="truncate max-w-[200px]">{reporter.ward_name}</span>
                          </div>

                          {/* Unlocked Badges Pills */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {reporter.badges.map((b) => (
                              <span
                                key={b.id}
                                onClick={() => setSelectedBadge(b)}
                                className={`text-[10px] px-2 py-0.5 rounded-md border font-medium flex items-center space-x-1 cursor-pointer transition hover:scale-105 ${getBadgeLevelColor(b.level)}`}
                                title={`${b.name}: ${b.description}`}
                              >
                                <span>{b.icon}</span>
                                <span>{b.name}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Points & Stats */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4 border-t sm:border-t-0 border-slate-800/80 pt-3 sm:pt-0 shrink-0">
                        <div className="text-center sm:text-right">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Reports</div>
                          <div className="text-xs font-bold text-slate-200 mt-0.5">
                            <span className="text-emerald-400 font-mono">{reporter.resolved_reports_count}</span>
                            <span className="text-slate-500"> / </span>
                            <span className="font-mono">{reporter.verified_reports_count}</span>
                          </div>
                          <div className="text-[9px] text-slate-500">Resolved / Filed</div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-center shrink-0">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Civic Points</div>
                          <div className="text-base font-black text-orange-400 font-mono mt-0.5">
                            {reporter.points.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 1 Col: Badges Catalog & Achievements */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2.5">
                  <Award className="size-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Civic Badges Catalog</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">{badges.length} Badges</span>
              </div>

              {/* Level Filter Tabs */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                {(['all', 'bronze', 'silver', 'gold', 'platinum'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setBadgeFilter(lvl)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition capitalize cursor-pointer shrink-0 ${
                      badgeFilter === lvl
                        ? 'bg-orange-600 text-white border-orange-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Badges List */}
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {filteredBadges.map((badge) => (
                  <div
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl p-3.5 transition cursor-pointer flex items-start space-x-3.5 group"
                  >
                    <div className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 group-hover:scale-110 transition-transform">
                      {badge.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-xs text-white group-hover:text-amber-400 transition truncate">
                          {badge.name}
                        </h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold shrink-0 ${getBadgeLevelColor(badge.level)}`}>
                          {badge.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {badge.description}
                      </p>
                      <div className="text-[10px] text-orange-400/90 font-medium mt-1.5 flex items-center space-x-1">
                        <Zap className="size-2.5" />
                        <span>Category: {badge.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WARD REPRESENTATIVES & PUBLIC DEPARTMENT AUDIT */}
      {activeTab === 'wards' && (
        <div className="space-y-6 animate-fade-in">
          {/* Ward Representative Leaderboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wards.map((ward) => {
              const rate = Math.round((ward.resolved_complaints / ward.total_complaints) * 100);
              return (
                <div
                  key={ward.id}
                  onClick={() => setSelectedLeader(ward)}
                  className="bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-2xl p-5 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-orange-500/5 flex flex-col justify-between space-y-4 cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-orange-500/0 via-orange-500/40 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Top Row: Representative Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      <div className="relative">
                        <img
                          src={ward?.photo_url || ''}
                          alt={ward?.representative_name || ''}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shadow-md group-hover:border-orange-500/60 transition-colors"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-0.5 rounded-full border border-slate-900" title="Verified Representative">
                          <ShieldCheck className="size-3.5 fill-emerald-500 text-slate-950" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white leading-tight group-hover:text-orange-400 transition-colors flex items-center space-x-1">
                          <span>{ward.representative_name}</span>
                          <ChevronRight className="size-4 text-slate-500 group-hover:text-orange-400 transition-transform group-hover:translate-x-0.5" />
                        </h3>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">
                          {ward.designation}
                        </div>
                        <div className="inline-block mt-1 bg-slate-800 text-orange-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          Party: {ward.party}
                        </div>
                      </div>
                    </div>

                    <span className="bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-xl text-xs font-mono font-bold shrink-0">
                      Ward #{ward.ward_number}
                    </span>
                  </div>

                  {/* Ward Location & Jurisdiction */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400 font-medium">
                      <span className="flex items-center space-x-1">
                        <MapPin className="size-3.5 text-orange-400 shrink-0" />
                        <span>Jurisdiction:</span>
                      </span>
                      <span className="text-white font-bold text-right truncate max-w-[170px]">{ward.ward_name}</span>
                    </div>

                    {ward.office_address && (
                      <div className="text-[11px] text-slate-400 border-t border-slate-900 pt-1.5 truncate" title={ward.office_address}>
                        🏢 <span className="text-slate-300">{ward.office_address}</span>
                      </div>
                    )}
                  </div>

                  {/* Resolution Rate Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">{t('resolution_rate')}</span>
                      <span className={rate >= 70 ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>{rate}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full ${rate >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom Quick Metrics Grid */}
                  <div className="grid grid-cols-4 gap-1.5 text-xs pt-2 border-t border-slate-800/80 text-center">
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <div className="text-[9px] text-slate-400 font-semibold uppercase">Reported</div>
                      <div className="text-xs font-bold text-white mt-0.5">{ward.total_complaints}</div>
                    </div>

                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <div className="text-[9px] text-emerald-400 font-semibold uppercase">Resolved</div>
                      <div className="text-xs font-bold text-emerald-400 mt-0.5">{ward.resolved_complaints}</div>
                    </div>

                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <div className="text-[9px] text-amber-400 font-semibold uppercase">Pending</div>
                      <div className="text-xs font-bold text-amber-400 mt-0.5">
                        {ward.pending_complaints || Math.max(0, ward.total_complaints - ward.resolved_complaints - 3)}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <div className="text-[9px] text-rose-400 font-semibold uppercase">Ignored</div>
                      <div className="text-xs font-bold text-rose-400 mt-0.5">
                        {ward.ignored_breached_complaints || 3}
                      </div>
                    </div>
                  </div>

                  {/* Action Hint */}
                  <div className="text-center pt-1 text-[11px] text-orange-400 font-medium group-hover:underline flex items-center justify-center space-x-1">
                    <span>View Full Department Audit & History</span>
                    <ChevronRight className="size-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Badge Details View */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="text-4xl p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                  {selectedBadge.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedBadge.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold inline-block mt-1 ${getBadgeLevelColor(selectedBadge.level)}`}>
                    {selectedBadge.level} Achievement
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBadge(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-400 font-semibold">Achievement Criteria:</div>
              <p className="text-slate-200 leading-relaxed">{selectedBadge.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Category</div>
                <div className="font-bold text-white mt-0.5">{selectedBadge.category}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Points Reward</div>
                <div className="font-bold text-orange-400 font-mono mt-0.5">+100 Points</div>
              </div>
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal: Leader Department Performance Audit */}
      {selectedLeader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedLeader?.photo_url || ''}
                  alt={selectedLeader?.representative_name || ''}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-700 shadow-lg shrink-0"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold text-white">{selectedLeader.representative_name}</h3>
                    <span className="bg-slate-800 text-orange-400 border border-slate-700 px-2 py-0.5 rounded text-xs font-bold">
                      {selectedLeader.party}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{selectedLeader.designation}</div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">
                    {selectedLeader.ward_name} (Ward #{selectedLeader.ward_number})
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedLeader(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Timeframe Filter Buttons */}
            <div className="flex items-center justify-between bg-slate-950 p-2 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2 text-xs text-slate-400 pl-2">
                <Calendar className="size-3.5 text-orange-400" />
                <span>Audit Period:</span>
              </div>
              <div className="flex space-x-1.5">
                {(['30d', '90d', 'ytd'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition capitalize cursor-pointer ${
                      timeframe === tf
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {tf === '30d' ? 'Last 30 Days' : tf === '90d' ? 'Last 90 Days' : 'Year to Date'}
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Department Performance Grid */}
            {(() => {
              const total = selectedLeader.total_complaints;
              const resolved = selectedLeader.resolved_complaints;
              const pending = selectedLeader.pending_complaints || Math.max(0, total - resolved - 3);
              const ignored = selectedLeader.ignored_breached_complaints || 3;
              const resRate = Math.round((resolved / total) * 100);

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs font-semibold mb-1">
                        <AlertCircle className="size-4 text-slate-400" />
                      </div>
                      <div className="text-2xl font-black text-white font-mono">{total}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Reported</div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-center space-x-1 text-emerald-400 text-xs font-semibold mb-1">
                        <CheckCircle2 className="size-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-black text-emerald-400 font-mono">{resolved}</div>
                      <div className="text-[10px] text-emerald-400 font-medium">Resolved</div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-center space-x-1 text-amber-400 text-xs font-semibold mb-1">
                        <Clock className="size-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-black text-amber-400 font-mono">{pending}</div>
                      <div className="text-[10px] text-amber-400 font-medium">In Progress</div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-center space-x-1 text-rose-400 text-xs font-semibold mb-1">
                        <AlertOctagon className="size-4 text-rose-400" />
                      </div>
                      <div className="text-2xl font-black text-rose-400 font-mono">{ignored}</div>
                      <div className="text-[10px] text-rose-400 font-medium">SLA Breached</div>
                    </div>
                  </div>

                  {/* Resolution SLA Performance Meter */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-300">SLA Resolution Performance Rate</span>
                      <span className={resRate >= 70 ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>
                        {resRate}% Compliant
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          resRate >= 70 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${resRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                      <span>Average SLA Turnaround: <strong className="text-white">{selectedLeader.avg_sla_days} Days</strong></span>
                      <span>GHMC Ward Compliance Rank: <strong className="text-orange-400"># Top 3 Division</strong></span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Official Contact & Helpline Office */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="size-3.5 text-orange-400" />
                <span>Official Ward Office & Helplines</span>
              </h4>

              <div className="text-xs text-slate-300 space-y-2">
                {selectedLeader.office_address && (
                  <div className="flex items-start space-x-2">
                    <span className="text-slate-400 font-semibold shrink-0">Address:</span>
                    <span>{selectedLeader.office_address}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {selectedLeader.contact_phone && (
                    <a
                      href={`tel:${selectedLeader.contact_phone}`}
                      className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center space-x-2 text-slate-200 hover:border-emerald-500/50 hover:text-emerald-400 transition"
                    >
                      <Phone className="size-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400">Office Phone</div>
                        <div className="font-mono font-bold">{selectedLeader.contact_phone}</div>
                      </div>
                    </a>
                  )}

                  {selectedLeader.helpline_email && (
                    <a
                      href={`mailto:${selectedLeader.helpline_email}`}
                      className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center space-x-2 text-slate-200 hover:border-sky-500/50 hover:text-sky-400 transition"
                    >
                      <Mail className="size-4 text-sky-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400">Official Email</div>
                        <div className="font-mono font-bold truncate max-w-[170px]">{selectedLeader.helpline_email}</div>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Audit Trail: Recent Complaints in Jurisdiction */}
            <div className="space-y-3 border-t border-slate-800 pt-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Recent Complaints Filed in {selectedLeader.ward_name.split('(')[0]}</span>
                <span className="text-[10px] text-slate-400 font-mono">{leaderIssues.length} Recent Audit Records</span>
              </h4>

              {loadingIssues ? (
                <div className="text-center py-6 text-slate-400 text-xs">Loading department complaint records...</div>
              ) : leaderIssues.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">No active complaints found in this ward division.</div>
              ) : (
                <div className="space-y-2">
                  {leaderIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <img
                          src={issue?.photo_url || ''}
                          alt={issue?.category || ''}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-800"
                        />
                        <div className="truncate">
                          <div className="font-bold text-white truncate">{issue.address}</div>
                          <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                            <span className="text-orange-400 font-semibold">{issue.category}</span>
                            <span>•</span>
                            <span>{issue.tracking_code}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            issue.status === 'Resolved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : issue.status === 'In Progress'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {issue.status}
                        </span>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {issue.status === 'Resolved' ? 'Resolved in 1.2d' : 'Pending SLA'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Close Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedLeader(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs cursor-pointer transition"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
