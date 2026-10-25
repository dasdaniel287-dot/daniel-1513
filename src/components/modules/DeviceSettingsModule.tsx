import React, { useState } from 'react';
import { 
  Sliders, 
  Lock, 
  Fingerprint, 
  Key, 
  ShieldCheck, 
  HardDrive, 
  Smartphone, 
  Laptop, 
  Clock,
  CheckCircle2
} from 'lucide-react';
import { SystemMetrics } from '../../types/nexus';

interface DeviceSettingsProps {
  metrics: SystemMetrics;
}

export const DeviceSettingsModule: React.FC<DeviceSettingsProps> = ({ metrics }) => {
  const [lockTimerMinutes, setLockTimerMinutes] = useState(5);
  const [fido2Enrolled, setFido2Enrolled] = useState(true);
  const [hardwareTarget, setHardwareTarget] = useState<'x86' | 'arm64' | 'mobile'>('x86');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              Hardware Security & Device Profile Manager
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Hardware-backed cryptographic keystores, FIDO2 enrollment, Secure Boot keys, and target architecture settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/80">
            TPM 2.0: PCR-Sealed
          </span>
        </div>
      </div>

      {/* Target Device Profile Selector */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
          Cross-Device Deployment Profile (Section 13)
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <button
            onClick={() => setHardwareTarget('x86')}
            className={`p-4 rounded-xl border text-left transition-all ${
              hardwareTarget === 'x86'
                ? 'bg-cyan-950/70 border-cyan-700 text-slate-100 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Laptop className="w-5 h-5 text-cyan-400" />
              <span className="text-[10px] font-mono text-cyan-300">Phase A</span>
            </div>
            <h4 className="font-semibold text-sm text-slate-100 mb-1">
              x86-64 Desktop & VM
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Target for enterprise laptops, workstations, and QEMU/KVM virtual machines with CET microcode support.
            </p>
          </button>

          <button
            onClick={() => setHardwareTarget('arm64')}
            className={`p-4 rounded-xl border text-left transition-all ${
              hardwareTarget === 'arm64'
                ? 'bg-cyan-950/70 border-cyan-700 text-slate-100 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="w-5 h-5 text-indigo-400" />
              <span className="text-[10px] font-mono text-indigo-300">Phase B</span>
            </div>
            <h4 className="font-semibold text-sm text-slate-100 mb-1">
              ARM64 Hardware & SBCs
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Target for compatible ARM64 single-board development boards and Neoverse-N2 computing platforms.
            </p>
          </button>

          <button
            onClick={() => setHardwareTarget('mobile')}
            className={`p-4 rounded-xl border text-left transition-all ${
              hardwareTarget === 'mobile'
                ? 'bg-cyan-950/70 border-cyan-700 text-slate-100 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-mono text-emerald-300">Phase C</span>
            </div>
            <h4 className="font-semibold text-sm text-slate-100 mb-1">
              Mobile Companion
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Android and iOS companion app for remote telemetry viewing and emergency out-of-band node isolation.
            </p>
          </button>
        </div>
      </div>

      {/* Security Keys & Screen Lock Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <h4 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-cyan-400" />
            <span>Hardware FIDO2 / YubiKey Authentication</span>
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Requires physical presence verification (tap or biometric) for all privileged administrative commands (`sudo`).
          </p>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300">
              YubiKey 5 NFC (Serial: #19842104)
            </span>
            <button
              onClick={() => setFido2Enrolled(!fido2Enrolled)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                fido2Enrolled
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {fido2Enrolled ? 'ENROLLED' : 'DISABLED'}
            </button>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <h4 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Automatic Screen Lock Timeout</span>
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automatically lock display and seal decrypt keys into TPM PCR registers upon operator inactivity.
          </p>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300">Lock Inactivity Window:</span>
            <select
              value={lockTimerMinutes}
              onChange={(e) => setLockTimerMinutes(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 font-mono"
            >
              <option value={1}>1 Minute (Strict)</option>
              <option value={5}>5 Minutes (Default)</option>
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
