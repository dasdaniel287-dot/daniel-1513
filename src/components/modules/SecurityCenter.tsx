import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Cpu, 
  RefreshCw, 
  FileCode, 
  HardDrive,
  Sliders,
  Check
} from 'lucide-react';
import { CIS_BENCHMARKS } from '../../services/nexusCore';
import { SystemMetrics } from '../../types/nexus';

interface SecurityCenterProps {
  metrics: SystemMetrics;
}

export const SecurityCenter: React.FC<SecurityCenterProps> = ({ metrics }) => {
  const [benchmarks, setBenchmarks] = useState(CIS_BENCHMARKS);
  const [isAuditing, setIsAuditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'apparmor' | 'kernel' | 'tpm'>('benchmarks');

  const appArmorProfiles = [
    { name: 'nexus-tor-browser', mode: 'Enforcing', compliant: true, deniedCount: 0, path: '/usr/bin/nexus-tor-browser' },
    { name: 'nexus-terminal', mode: 'Enforcing', compliant: true, deniedCount: 0, path: '/usr/bin/nexus-terminal' },
    { name: 'nexus-netscope', mode: 'Enforcing', compliant: true, deniedCount: 0, path: '/usr/bin/nexus-netscope' },
    { name: 'nexus-vault', mode: 'Enforcing', compliant: true, deniedCount: 0, path: '/usr/bin/nexus-vault' },
    { name: 'systemd-resolved', mode: 'Enforcing', compliant: true, deniedCount: 0, path: '/lib/systemd/systemd-resolved' },
    { name: 'untrusted-generic', mode: 'Strict-Sandbox', compliant: true, deniedCount: 4, path: '/home/nexus/.local/bin/*' },
  ];

  const kernelInvariants = [
    { param: 'security=apparmor', description: 'AppArmor LSM enabled at boot', status: 'ACTIVE' },
    { param: 'module.sig_enforce=1', description: 'Reject unsigned kernel modules', status: 'ENFORCING' },
    { param: 'kernel.kptr_restrict=2', description: 'Hide kernel pointer addresses', status: 'ACTIVE' },
    { param: 'kernel.dmesg_restrict=1', description: 'Restrict dmesg to root', status: 'ACTIVE' },
    { param: 'kernel.yama.ptrace_scope=2', description: 'Admin-only ptrace attach', status: 'ACTIVE' },
    { param: 'fs.protected_symlinks=1', description: 'Prevent symlink TOCTOU attacks', status: 'ACTIVE' },
    { param: 'fs.protected_hardlinks=1', description: 'Prevent hardlink spoofing', status: 'ACTIVE' },
    { param: 'net.ipv4.tcp_syncookies=1', description: 'SYN flood protection', status: 'ACTIVE' },
  ];

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Overview Top Bar */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              NEXUS Security Policy Engine & CIS Benchmark
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Automated verification of Center for Internet Security (CIS) Level 2 hardening benchmarks and mandatory access controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-emerald-400">98 / 100</span>
            <span className="block text-[10px] text-slate-400 uppercase font-mono">Compliance Score</span>
          </div>
          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold text-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Auditing...' : 'Run CIS Audit'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'benchmarks'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          CIS Benchmarks (9)
        </button>
        <button
          onClick={() => setActiveTab('apparmor')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'apparmor'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          AppArmor MAC (6 Profiles)
        </button>
        <button
          onClick={() => setActiveTab('kernel')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'kernel'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Kernel Sysctl Invariants
        </button>
        <button
          onClick={() => setActiveTab('tpm')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'tpm'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          TPM 2.0 & Secure Boot
        </button>
      </div>

      {/* Tab 1: CIS Benchmarks */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {benchmarks.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      {item.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    {item.details}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-emerald-400">PASS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: AppArmor Profiles */}
      {activeTab === 'apparmor' && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Profile Name & Executable Path</span>
            <span>Enforcement Mode & Denials</span>
          </div>

          <div className="space-y-2">
            {appArmorProfiles.map((p) => (
              <div
                key={p.name}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {p.name}
                  </span>
                  <span className="block text-[11px] text-slate-400 font-mono">
                    {p.path}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {p.deniedCount > 0 && (
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                      {p.deniedCount} Syscalls Blocked
                    </span>
                  )}
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/60">
                    {p.mode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Kernel Invariants */}
      {activeTab === 'kernel' && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {kernelInvariants.map((k) => (
              <div
                key={k.param}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <code className="text-xs text-cyan-300 font-mono font-bold block">
                    {k.param}
                  </code>
                  <span className="text-xs text-slate-400">{k.description}</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  [{k.status}]
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: TPM & Secure Boot */}
      {activeTab === 'tpm' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>TPM 2.0 Platform Configuration Registers</span>
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex justify-between">
                <span className="text-slate-400">PCR[0] - Core System Firmware</span>
                <span className="text-emerald-400 font-bold">MATCH (Sealed)</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex justify-between">
                <span className="text-slate-400">PCR[2] - Extended ROM & Option ROMs</span>
                <span className="text-emerald-400 font-bold">MATCH (Sealed)</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex justify-between">
                <span className="text-slate-400">PCR[4] - Boot Loader / Shim Executable</span>
                <span className="text-emerald-400 font-bold">MATCH (Sealed)</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex justify-between">
                <span className="text-slate-400">PCR[7] - Secure Boot State & Certificates</span>
                <span className="text-emerald-400 font-bold">MATCH (Sealed)</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex justify-between">
                <span className="text-slate-400">PCR[10] - NEXUS FIM Immutable Baseline</span>
                <span className="text-emerald-400 font-bold">MATCH (Sealed)</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>Cryptographic Volume Health</span>
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex justify-between">
                <span className="text-slate-400">LUKS Format</span>
                <span className="text-slate-200">LUKS2 (header v2)</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex justify-between">
                <span className="text-slate-400">Cipher Specification</span>
                <span className="text-slate-200">aes-xts-plain64:sha512</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex justify-between">
                <span className="text-slate-400">Key Derivation Function</span>
                <span className="text-slate-200">Argon2id (time: 4, mem: 1GB)</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex justify-between">
                <span className="text-slate-400">dm-verity Integrity Root</span>
                <span className="text-emerald-400 font-bold">VALIDATED RO</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
