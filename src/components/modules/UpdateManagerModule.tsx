import React, { useState } from 'react';
import { 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  RotateCcw, 
  HardDrive, 
  Key, 
  Lock, 
  AlertTriangle 
} from 'lucide-react';

export const UpdateManagerModule: React.FC = () => {
  const [activePartition, setActivePartition] = useState<'A' | 'B'>('A');
  const [isVerifyingSignature, setIsVerifyingSignature] = useState(false);
  const [updateStaged, setUpdateStaged] = useState(false);
  const [rollbackReady, setRollbackReady] = useState(true);

  const handleVerifyPayload = () => {
    setIsVerifyingSignature(true);
    setTimeout(() => {
      setIsVerifyingSignature(false);
      setUpdateStaged(true);
    }, 1000);
  };

  const handleAtomicSwitch = () => {
    setActivePartition(activePartition === 'A' ? 'B' : 'A');
    setUpdateStaged(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              NEXUS Immutable A/B Update System & Signature Verifier
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Cryptographically signed dual-partition deployment with dm-verity hash trees and hardware TPM monotonic anti-rollback protection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/80">
            Ed25519 Signing Key: Valid
          </span>
        </div>
      </div>

      {/* Partition A / B Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Partition A */}
        <div className={`p-5 rounded-xl border transition-all ${activePartition === 'A' ? 'bg-cyan-950/40 border-cyan-700 shadow-md' : 'bg-slate-900 border-slate-800 opacity-70'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HardDrive className={`w-4 h-4 ${activePartition === 'A' ? 'text-cyan-400' : 'text-slate-500'}`} />
              <h4 className="font-bold text-slate-100 text-sm font-mono">
                System Partition A (/dev/nvme0n1p2)
              </h4>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${activePartition === 'A' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-800 text-slate-400'}`}>
              {activePartition === 'A' ? 'ACTIVE ROOT (RO)' : 'STANDBY'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono text-slate-300">
            <p>Version: <span className="text-slate-100 font-bold">2026.1-LTS (Build 891)</span></p>
            <p>Mount: <span className="text-cyan-300">/sysroot (read-only, dm-verity)</span></p>
            <p>Hash Digest: <span className="text-slate-400 text-[11px]">sha256:7f83...d65d</span></p>
            <p>Integrity Tree: <span className="text-emerald-400">Verified Sealed</span></p>
          </div>
        </div>

        {/* Partition B */}
        <div className={`p-5 rounded-xl border transition-all ${activePartition === 'B' ? 'bg-cyan-950/40 border-cyan-700 shadow-md' : 'bg-slate-900 border-slate-800 opacity-70'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HardDrive className={`w-4 h-4 ${activePartition === 'B' ? 'text-cyan-400' : 'text-slate-500'}`} />
              <h4 className="font-bold text-slate-100 text-sm font-mono">
                System Partition B (/dev/nvme0n1p3)
              </h4>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${activePartition === 'B' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-800 text-slate-400'}`}>
              {activePartition === 'B' ? 'ACTIVE ROOT (RO)' : updateStaged ? 'STAGED READY' : 'RESERVE BACKUP'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono text-slate-300">
            <p>Version: <span className="text-slate-100 font-bold">{updateStaged ? '2026.2-SEC (Patch Staged)' : '2026.1-LTS'}</span></p>
            <p>Mount: <span className="text-cyan-300">/dev/nvme0n1p3 (dormant)</span></p>
            <p>Hash Digest: <span className="text-slate-400 text-[11px]">{updateStaged ? 'sha256:d8a2...3b10' : 'sha256:7f83...d65d'}</span></p>
            <p>Status: <span className={updateStaged ? 'text-cyan-400 font-bold' : 'text-slate-400'}>{updateStaged ? 'Cryptographically Sealed' : 'Standby Snapshot'}</span></p>
          </div>
        </div>
      </div>

      {/* Cryptographic Controls */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
          Cryptographic Integrity & Staging Actions
        </span>

        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg bg-slate-950 border border-slate-800">
          <div>
            <h4 className="text-xs font-semibold text-slate-200">
              Release Channel: NEXUS Security Track 2026.2
            </h4>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Payload: nexus-kernel-6.12.8-sec + nftables 1.1.0 update (Signed with Ed25519 Key ID: 0x9F4C...B210)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!updateStaged ? (
              <button
                onClick={handleVerifyPayload}
                disabled={isVerifyingSignature}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold text-xs font-mono transition-colors flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{isVerifyingSignature ? 'Verifying Ed25519...' : 'Verify Signature & Stage'}</span>
              </button>
            ) : (
              <button
                onClick={handleAtomicSwitch}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs font-mono transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Reboot & Switch Partition</span>
              </button>
            )}

            <button
              onClick={handleAtomicSwitch}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Emergency Rollback</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          * Section 12 Requirement: System updates will never install solely because an AI recommends it. Explicit Ed25519 signature checks, hash trees, and operator authorization are enforced.
        </p>
      </div>
    </div>
  );
};
