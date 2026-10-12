import React, { useState } from 'react';
import { Issue } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { Search, X, ShieldAlert, Lock, ArrowRight } from 'lucide-react';

interface TrackIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIssue: (issue: Issue) => void;
}

export const TrackIssueModal: React.FC<TrackIssueModalProps> = ({ isOpen, onClose, onSelectIssue }) => {
  const { t, translateStatus } = useTranslation();
  const [code, setCode] = useState('');
  const [searchedIssue, setSearchedIssue] = useState<Issue | null | 'not_found'>(null);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/issues?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (data.issues && data.issues.length > 0) {
        setSearchedIssue(data.issues[0]);
      } else {
        setSearchedIssue('not_found');
      }
    } catch (err) {
      console.error('Error searching tracking code:', err);
      setSearchedIssue('not_found');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl text-slate-100 overflow-hidden">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Lock className="size-4 shrink-0" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{t('track_issue')}</h3>
              <p className="text-xs text-slate-400">Search by complaint tracking code</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer">
            <X className="size-4 shrink-0" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleSearch} className="space-y-3">
          <p className="text-xs text-slate-400">
            Enter your private tracking code (e.g. <strong>CS-PUN-84920</strong>) to view live escalation status and email logs.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CS-PUN-84920"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <button
              type="submit"
              disabled={isSearching}
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Results Card */}
        {searchedIssue === 'not_found' && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 text-center">
            No complaint found matching tracking code "{code}". Please check your code and try again.
          </div>
        )}

        {searchedIssue && searchedIssue !== 'not_found' && (
          <div
            onClick={() => {
              onSelectIssue(searchedIssue);
              onClose();
            }}
            className="p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-orange-500/50 cursor-pointer space-y-2 transition"
          >
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-orange-400">#{searchedIssue.tracking_code}</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                {translateStatus(searchedIssue.status)}
              </span>
            </div>
            <div className="font-bold text-sm text-white">{searchedIssue.address}</div>
            <p className="text-xs text-slate-400 line-clamp-1">{searchedIssue.description}</p>
            <div className="text-xs text-orange-400 font-bold flex items-center justify-end space-x-1 pt-1">
              <span>View Full Details & Audit Trail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
