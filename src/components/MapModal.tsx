import React from 'react';
import { IssueMap } from './IssueMap';
import { Issue, NGO, NGOEvent } from '../types';
import { X, MapPin, Sparkles } from 'lucide-react';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  issues: Issue[];
  ngos: NGO[];
  events: NGOEvent[];
  onSelectIssue: (issue: Issue) => void;
}

export const MapModal: React.FC<MapModalProps> = ({
  isOpen,
  onClose,
  issues,
  ngos,
  events,
  onSelectIssue,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl h-[90vh] shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
              <MapPin className="size-4 shrink-0" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  Interactive GIS Live Complaint Map
                </h2>
                <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                  HYDERABAD GHMC GIS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Click any complaint marker to inspect SLA escalation audit trail or claim for NGO action
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg transition cursor-pointer"
          >
            <X className="size-4 shrink-0" />
          </button>
        </div>

        {/* Map Body */}
        <div className="flex-1 relative overflow-hidden">
          <IssueMap
            issues={issues}
            ngos={ngos}
            events={events}
            onSelectIssue={(issue) => {
              onClose();
              onSelectIssue(issue);
            }}
          />
        </div>
      </div>
    </div>
  );
};
