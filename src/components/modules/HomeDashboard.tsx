import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Cpu, 
  HardDrive, 
  Activity, 
  CheckCircle2, 
  Lock, 
  Radio, 
  Terminal, 
  ArrowUpRight, 
  Boxes,
  Zap,
  RefreshCw
} from 'lucide-react';
import { SystemMetrics, ThreatRecord, SecurityLevel, ModuleKey } from '../../types/nexus';

interface HomeDashboardProps {
  metrics: SystemMetrics;
  threats: ThreatRecord[];
  securityLevel: SecurityLevel;
  onSetSecurityLevel: (lvl: SecurityLevel) => void;
  onOpenModule: (key: ModuleKey) => void;
  onRunFIMCheck: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  metrics,
  threats,
  securityLevel,
  onSetSecurityLevel,
  onOpenModule,
  onRunFIMCheck,
}) => {
  const activeThreats = threats.filter((t) => t.status === 'ACTIVE');
  const threatScore = activeThreats.length > 0 ? 24 : 8;

  const coreServices = [
    { name: '1. Security Policy Engine', status: 'Enforcing', detail: 'AppArmor 4.0 Active', ok: true },
    { name: '2. App Isolation Manager', status: 'Active', detail: 'Bubblewrap Namespaces', ok: true },
    { name: '3. File Integrity Monitor', status: 'Verified', detail: 'SHA-256 Tripwire', ok: true },
    { name: '4. Network Security Monitor', status: 'Filtering', detail: 'DoH + nftables', ok: true },
    { name: '5. Threat Detection Engine', status: 'Heuristics On', detail: 'Real-time telemetry', ok: true },
    { name: '6. Authentication Manager', status: 'Enforcing', detail: 'PAM + Argon2id', ok: true },
    { name: '7. System Update Verifier', status: 'Sealed', detail: 'Ed25519 Verified', ok: true },
    { name: '8. Audit Logging Service', status: 'Active', detail: 'Kernel auditd (-e 2)', ok: true },
    { name: '9. Event Correlation Engine', status: 'Running', detail: 'Cross-subsystem triage', ok: true },
    { name: '10. Incident Response Mgr', status: 'Armed', detail: 'Containment playbooks', ok: true },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Defense Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Posture Score */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              System Risk Index
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              LOW RISK
            </span>
          </div>

          <div className="my-4 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold font-mono text-slate-100">
              {threatScore}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100 Risk Score</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Immutable read-only root <span className="font-mono text-cyan-400">/sysroot</span> with dm-verity. Hardware-backed TPM 2.0 PCR-7 sealed.
          </p>
        </div>

        {/* Defense Enforcement Selector */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              Security Level
            </span>
            <span className="text-xs font-mono text-cyan-400">Active: {securityLevel}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(['NORMAL', 'ELEVATED', 'STRICT', 'LOCKDOWN'] as SecurityLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onSetSecurityLevel(lvl)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold font-mono text-center transition-all ${
                  securityLevel === lvl
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                    : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 mt-3">
            {securityLevel === 'LOCKDOWN' && 'Air-gap mode: all non-essential ingress/egress is dropped via nftables.'}
            {securityLevel === 'STRICT' && 'Strict isolation: unsanctioned binaries freeze immediately upon execution.'}
            {securityLevel === 'ELEVATED' && 'High telemetry & deep packet inspection enabled.'}
            {securityLevel === 'NORMAL' && 'Standard defensive isolation & AppArmor profile enforcement.'}
          </p>
        </div>

        {/* Quick Toggles */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">
            Automated Defensive Controls
          </span>

          <div className="space-y-2">
            <button
              onClick={onRunFIMCheck}
              className="w-full flex items-center justify-between p-2 rounded bg-slate-950/80 border border-slate-800 hover:border-cyan-800/80 transition-colors text-xs text-left"
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-200 font-medium">Verify File Baseline</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Run SHA-256</span>
            </button>

            <button
              onClick={() => onOpenModule('ai-analyst')}
              className="w-full flex items-center justify-between p-2 rounded bg-slate-950/80 border border-slate-800 hover:border-cyan-800/80 transition-colors text-xs text-left"
            >
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-200 font-medium">AI Threat Triage</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">Gemini 3.8</span>
            </button>

            <button
              onClick={() => onOpenModule('terminal')}
              className="w-full flex items-center justify-between p-2 rounded bg-slate-950/80 border border-slate-800 hover:border-cyan-800/80 transition-colors text-xs text-left"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-200 font-medium">Nexus CLI Prompt</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">nexus status</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Hardware & Isolation Telemetry */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-mono">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU Load
            </span>
            <span className="font-mono text-slate-200">{metrics.cpuUsage}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-cyan-500 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(100, metrics.cpuUsage)}%` }} 
            />
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2">
            Load: {metrics.loadAverage.join(', ')}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-mono">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Memory
            </span>
            <span className="font-mono text-slate-200">
              {Math.round(metrics.memoryUsedMb / 1024 * 10) / 10} / {Math.round(metrics.memoryTotalMb / 1024)} GB
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
              style={{ width: `${(metrics.memoryUsedMb / metrics.memoryTotalMb) * 100}%` }} 
            />
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2">
            SLUB hardening & ASLR active
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-mono">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" /> Root Disk
            </span>
            <span className="font-mono text-slate-200">{metrics.rootPartitionMode}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-300" 
              style={{ width: `${(metrics.diskUsedGb / metrics.diskTotalGb) * 100}%` }} 
            />
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2">
            dm-verity hash tree verified
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-mono">
              <Lock className="w-3.5 h-3.5 text-indigo-400" /> Cryptography
            </span>
            <span className="font-mono text-indigo-300 text-[11px]">TPM 2.0</span>
          </div>
          <div className="w-full h-1.5 bg-indigo-950 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-indigo-400 rounded-full w-full" />
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2">
            LUKS2 AES-XTS-512 sealed
          </p>
        </div>
      </div>

      {/* 10 Core Security Engine Subsystems Matrix */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">
              NEXUS Security Core Subsystems
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              10 independent modular defense services running with explicit permissions and fail-safe boundaries.
            </p>
          </div>
          <button
            onClick={() => onOpenModule('security-center')}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View Full Audit</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {coreServices.map((svc) => (
            <div
              key={svc.name}
              className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    {svc.name.split('.')[0]}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                </div>
                <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                  {svc.name.split('. ')[1]}
                </h4>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-400">{svc.status}</span>
                <span className="text-slate-500 text-[10px] truncate max-w-[90px]">
                  {svc.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active High-Priority Threats & Alerts */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              Active Security Events & Indicators
            </h3>
            <span className="text-xs font-mono text-slate-400">
              ({activeThreats.length} unresolved)
            </span>
          </div>

          <button
            onClick={() => onOpenModule('ai-analyst')}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            <span>Open AI Threat Analyst</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeThreats.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs bg-slate-950/50 rounded-lg border border-slate-800/60">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <span>No active uncontained threats detected. All kernel invariants sealed.</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeThreats.map((threat) => (
              <div
                key={threat.id}
                className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
                      {threat.severity}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {threat.id} · {threat.timestamp}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {threat.classification}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    {threat.title}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {threat.details}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenModule('ai-analyst')}
                    className="px-3 py-1.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900/60 text-xs font-medium transition-colors"
                  >
                    Analyze with AI
                  </button>
                  <button
                    onClick={() => onOpenModule('incident-response')}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    Isolate & Quarantine
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
