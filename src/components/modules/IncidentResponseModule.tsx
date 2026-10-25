import React, { useState } from 'react';
import { 
  AlertOctagon, 
  ShieldAlert, 
  Lock, 
  Play, 
  CheckCircle2, 
  FileText, 
  RefreshCw, 
  Layers, 
  Bot,
  Terminal,
  Activity
} from 'lucide-react';
import { SecurityIncident, AuditLogEntry } from '../../types/nexus';

interface IncidentResponseModuleProps {
  incidents: SecurityIncident[];
  auditLogs: AuditLogEntry[];
  onExecutePlaybook: (incidentId: string, playbook: string) => void;
}

export const IncidentResponseModule: React.FC<IncidentResponseModuleProps> = ({
  incidents,
  auditLogs,
  onExecutePlaybook,
}) => {
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident>(incidents[0]);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigationData, setInvestigationData] = useState<any>(null);

  const handleDeepInvestigation = async () => {
    setIsInvestigating(true);
    setInvestigationData(null);

    try {
      const res = await fetch('/api/ai/investigate-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident: selectedIncident,
          correlatedEvents: auditLogs.slice(0, 4),
        }),
      });
      const data = await res.json();
      setInvestigationData(data);
    } catch (err) {
      console.error('Deep triage error:', err);
    } finally {
      setIsInvestigating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              Security Event Correlation Engine & Incident Response Manager
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Automated correlation of kernel auditd events, seccomp violations, and network egress anomalies into unified incident playbooks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDeepInvestigation}
            disabled={isInvestigating}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold text-xs transition-colors"
          >
            <Bot className="w-4 h-4" />
            <span>{isInvestigating ? 'Correlating with AI...' : 'Generate Full AI Triage'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 4 cols: Incidents list */}
        <div className="lg:col-span-4 space-y-2.5">
          <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
            Correlated Incident Queue
          </span>

          <div className="space-y-2">
            {incidents.map((inc) => (
              <button
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                  selectedIncident.id === inc.id
                    ? 'bg-cyan-950/70 border-cyan-700 text-slate-100 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-cyan-400">{inc.id}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      inc.status === 'CONTAINED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {inc.status}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                  {inc.title}
                </h4>
                <div className="text-[11px] text-slate-400 font-mono">
                  {inc.correlatedEventsCount} correlated events · {inc.detectedAt}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 8 cols: Incident details, Timeline, Playbook execution */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
                  {selectedIncident.severity}
                </span>
                <h3 className="font-semibold text-slate-100 text-sm">
                  {selectedIncident.title}
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Root Cause: {selectedIncident.rootCause} (MITRE: {selectedIncident.mitreAttackId})
              </p>
            </div>

            <button
              onClick={() => onExecutePlaybook(selectedIncident.id, selectedIncident.containmentPlaybook)}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Execute Playbook</span>
            </button>
          </div>

          {/* AI Forensic Triage Output if generated */}
          {investigationData && (
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/80 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold">
                <Bot className="w-4 h-4" />
                <span>AI Cybersecurity Engine — Forensic Triage Report</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {investigationData.summary}
              </p>

              {/* Containment Strategy */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 block font-semibold">
                  Containment Directives:
                </span>
                <ul className="text-xs text-slate-300 space-y-1">
                  {investigationData.containmentStrategy?.map((s: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-cyan-400 font-mono">[{idx + 1}]</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggested nftables rules */}
              {investigationData.nftablesRules && (
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300">
                  <div className="text-[10px] text-slate-400 mb-1">Interception Command:</div>
                  <code>{investigationData.nftablesRules[0]}</code>
                </div>
              )}
            </div>
          )}

          {/* Forensic Chronological Event Timeline */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
              Correlated Forensic Event Timeline
            </span>

            <div className="space-y-2 border-l border-slate-800 pl-4 ml-1">
              {auditLogs.slice(0, 4).map((log, idx) => (
                <div key={log.id} className="relative space-y-0.5">
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-500 border border-slate-950" />
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-400">{log.timestamp}</span>
                    <span className="text-cyan-400">[{log.subsystem}]</span>
                    <span className="text-slate-200">{log.action}</span>
                    <span className={log.result === 'BLOCKED' ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {log.result}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    {log.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
