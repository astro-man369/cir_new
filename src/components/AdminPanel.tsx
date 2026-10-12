import React, { useState, useEffect } from 'react';
import { NGO, Issue } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { SUPABASE_SQL_SCHEMA } from '../lib/supabaseSchema';
import {
  Settings,
  ShieldCheck,
  Zap,
  Mail,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Database,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Server
} from 'lucide-react';

interface AdminPanelProps {
  ngos: NGO[];
  issues: Issue[];
  onRefreshData: () => void;
  onRunEscalation: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  ngos,
  issues,
  onRefreshData,
  onRunEscalation,
}) => {
  const { t } = useTranslation();
  const [escalatedResult, setEscalatedResult] = useState<any>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [syncingSupabase, setSyncingSupabase] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [showSchema, setShowSchema] = useState(false);

  const checkSupabase = async () => {
    setTestingSupabase(true);
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      setSupabaseStatus(data);
    } catch (err: any) {
      setSupabaseStatus({ configured: false, connected: false, message: 'Failed to connect to backend endpoint' });
    } finally {
      setTestingSupabase(false);
    }
  };

  useEffect(() => {
    checkSupabase();
  }, []);

  const handleSyncToSupabase = async () => {
    setSyncingSupabase(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/supabase/sync', { method: 'POST' });
      const data = await res.json();
      setSyncResult(data);
      if (data.success) {
        checkSupabase();
      }
    } catch (err: any) {
      setSyncResult({ success: false, error: err?.message || 'Sync failed' });
    } finally {
      setSyncingSupabase(false);
    }
  };

  const copySqlSchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleToggleVerify = async (ngoId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/ngos/${ngoId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentStatus }),
      });
      onRefreshData();
    } catch (err) {
      console.error('Error verifying NGO:', err);
    }
  };

  const handleManualEscalationCheck = async () => {
    try {
      const res = await fetch('/api/escalation/check', { method: 'POST' });
      const data = await res.json();
      setEscalatedResult(data);
      onRefreshData();
    } catch (err) {
      console.error('Error running escalation:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
            <Settings className="size-5 shrink-0" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{t('admin_panel')}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Super Admin Console: Supabase cloud integration, NGO registrations, SLA escalation timers, and audit system logs.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleManualEscalationCheck}
            className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-2 transition shadow-sm cursor-pointer shrink-0"
          >
            <Zap className="size-4 fill-amber-300 shrink-0" />
            <span>Execute SLA Escalation Check</span>
          </button>
        </div>
      </div>

      {escalatedResult && (
        <div className="bg-amber-500/10 border border-amber-500/40 p-4 rounded-2xl text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="size-4 text-amber-400" />
            <span>
              Escalation Engine Executed: <strong>{escalatedResult.escalatedCount} complaints overdue and moved to next tier!</strong>
            </span>
          </div>
          <button onClick={() => setEscalatedResult(null)} className="text-amber-400 hover:text-white font-bold">Dismiss</button>
        </div>
      )}

      {/* Supabase Cloud Database Integration Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base">Supabase Cloud Database Integration</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  PostgreSQL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Persistent relational data storage for civic complaints, NGO registries, resolution proofs, and volunteer drives.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={checkSupabase}
              disabled={testingSupabase}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingSupabase ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{testingSupabase ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              onClick={handleSyncToSupabase}
              disabled={syncingSupabase}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
            >
              <Server className={`w-3.5 h-3.5 ${syncingSupabase ? 'animate-pulse' : ''}`} />
              <span>{syncingSupabase ? 'Syncing...' : 'Sync Data to Supabase'}</span>
            </button>
          </div>
        </div>

        {/* Status Indicator Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Integration Status</div>
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${supabaseStatus?.connected ? 'bg-emerald-400 animate-ping' : supabaseStatus?.configured ? 'bg-amber-400' : 'bg-slate-500'}`} />
              <span className="font-bold text-sm text-white">
                {supabaseStatus?.connected
                  ? 'Connected & Active'
                  : supabaseStatus?.configured
                  ? 'Configured (Awaiting Ping)'
                  : 'Ready for Configuration'}
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Project Endpoint</div>
            <div className="font-mono text-xs text-slate-300 truncate">
              {supabaseStatus?.url || (supabaseStatus?.configured ? 'Configured via Environment' : 'SUPABASE_URL')}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Response Latency</div>
            <div className="font-mono text-xs text-emerald-400">
              {supabaseStatus?.latencyMs ? `${supabaseStatus.latencyMs} ms` : 'Local Fallback Engine Active'}
            </div>
          </div>
        </div>

        {supabaseStatus?.message && (
          <div className={`p-3.5 rounded-xl text-xs border flex items-center justify-between ${
            supabaseStatus?.connected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
          }`}>
            <div className="flex items-center space-x-2">
              {supabaseStatus?.connected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>{supabaseStatus.message}</span>
            </div>
          </div>
        )}

        {syncResult && (
          <div className={`p-3.5 rounded-xl text-xs border ${
            syncResult.success
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-200'
          }`}>
            {syncResult.success ? syncResult.message : `Sync Error: ${syncResult.error || 'Failed'}`}
          </div>
        )}

        {/* Setup & Schema Actions */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Quick Configuration Guide:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSchema(!showSchema)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer underline"
              >
                {showSchema ? 'Hide SQL Schema' : 'View SQL Schema'}
              </button>
              <button
                onClick={copySqlSchema}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center space-x-1 transition cursor-pointer"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSchema ? 'Copied SQL!' : 'Copy SQL Schema'}</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-400">
            <p>
              1. In your Supabase Project Dashboard, go to <strong>SQL Editor</strong> and run the provided SQL Schema.
            </p>
            <p>
              2. Add your <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> to the app's environment variables or Settings.
            </p>
            <p>
              3. Click <strong>Sync Data to Supabase</strong> to instantly populate all civic issues, NGOs, and drives into your Supabase database!
            </p>
          </div>

          {showSchema && (
            <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-emerald-400">supabase/schema.sql</span>
                <button
                  onClick={copySqlSchema}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded flex items-center space-x-1 cursor-pointer"
                >
                  {copiedSchema ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSchema ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 max-h-60 overflow-y-auto p-2 bg-slate-900 rounded border border-slate-800/80">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Main Admin Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* NGO Verification Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span>NGO Registration Verification Queue</span>
          </h3>

          <div className="space-y-3">
            {ngos.map((ngo) => (
              <div key={ngo.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">{ngo.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{ngo.contact_email}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Areas: {ngo.areas_served.join(', ')}</div>
                </div>

                <button
                  onClick={() => handleToggleVerify(ngo.id, ngo.verified)}
                  className={`font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer ${
                    ngo.verified
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {ngo.verified ? 'Verified (Flip)' : 'Approve & Verify NGO'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Escalation Engine & Inbound Parser Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Clock className="w-5 h-5 text-orange-400" />
            <span>Automated Escalation & SLA Rules</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white text-xs">Escalation Protocol Logic:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Tier 1: Executive Engineer (Response SLA: 2 Mins in Demo / 2 Days in Prod)</li>
                <li>Tier 2: Chief Engineer (Re-sends email notice + CCs Commissioner)</li>
                <li>Tier 3: Municipal Commissioner / Collector</li>
                <li>Post Tier 3: Converted to Public Open Issue for NGO Claim</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white text-xs">Resend Inbound Email Parse Webhook:</div>
              <p className="text-slate-400">
                Endpoint <code>POST /api/inbound-email</code> accepts department reply webhooks, automatically matching tracking codes (e.g. <code>#CS-PUN-84920</code>) and setting status to <code>claimed_resolved_by_official</code> ONLY.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

