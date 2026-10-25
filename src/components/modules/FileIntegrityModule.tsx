import React, { useState } from 'react';
import { 
  FileCheck2, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  ShieldAlert, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { FIMItem } from '../../types/nexus';

interface FileIntegrityModuleProps {
  items: FIMItem[];
  onTriggerCheck: () => void;
  onSimulateTamper: (id: string) => void;
  onRestoreBaseline: (id: string) => void;
}

export const FileIntegrityModule: React.FC<FileIntegrityModuleProps> = ({
  items,
  onTriggerCheck,
  onSimulateTamper,
  onRestoreBaseline,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FIMItem>(items[0]);

  const handleVerifyAll = () => {
    setIsVerifying(true);
    onTriggerCheck();
    setTimeout(() => {
      setIsVerifying(false);
    }, 700);
  };

  const modifiedItems = items.filter((i) => i.status !== 'MATCH');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck2 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              File Integrity Monitor (FIM) & Cryptographic Tripwire
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Real-time inotify/fanotify tripwire with SHA-256 digest sealing anchored in TPM 2.0 Platform Configuration Register 10.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className={`text-sm font-bold font-mono ${modifiedItems.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {items.length - modifiedItems.length} / {items.length} Invariants Valid
            </span>
            <span className="block text-[10px] text-slate-400 font-mono">
              Base Root: Read-Only
            </span>
          </div>

          <button
            onClick={handleVerifyAll}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold text-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Calculating SHA-256...' : 'Verify Baseline'}</span>
          </button>
        </div>
      </div>

      {modifiedItems.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-rose-200">
                CRITICAL: Hash Drift Detected on {modifiedItems.length} Monitored Path(s)
              </h4>
              <p className="text-xs text-rose-300/80">
                A system file digest differs from the immutable baseline sealed in TPM PCR[10]. Potential rootkit or unauthorized tampering.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Files List & Detailed Diff */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 6 cols: File Table */}
        <div className="lg:col-span-6 space-y-2.5">
          <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
            Monitored Kernel & Security System Paths
          </span>

          <div className="space-y-2">
            {items.map((file) => (
              <button
                key={file.id}
                onClick={() => setSelectedItem(file)}
                className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex items-center justify-between gap-3 ${
                  selectedItem.id === file.id
                    ? 'bg-cyan-950/70 border-cyan-700 text-slate-100 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="space-y-0.5 truncate">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200 font-mono truncate">
                      {file.path}
                    </span>
                    {file.immutableAttr && (
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-800/60">
                        +i chattr
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Checked {file.lastChecked}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      file.status === 'MATCH'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                        : 'bg-rose-950 text-rose-300 border border-rose-800/80 animate-pulse'
                    }`}
                  >
                    {file.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 6 cols: Hash Inspector & Action */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="font-semibold text-slate-100 text-sm font-mono">
                {selectedItem.path}
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                Sealed Baseline Object #0x{selectedItem.id.split('-')[1]}
              </span>
            </div>

            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
                selectedItem.status === 'MATCH'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              {selectedItem.status}
            </span>
          </div>

          {/* Expected vs Current Hash */}
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Sealed Reference SHA-256 Digest (PCR-10)
              </span>
              <p className="text-emerald-400 break-all select-all text-[11px]">
                {selectedItem.expectedHash}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Live Filesystem Inode SHA-256 Digest
              </span>
              <p className={`break-all select-all text-[11px] ${selectedItem.status === 'MATCH' ? 'text-emerald-400' : 'text-rose-400 font-bold'}`}>
                {selectedItem.currentHash}
              </p>
            </div>
          </div>

          {/* Tamper Simulation & Restore Tools */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
              Operator Testing & Restoration Harness
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onSimulateTamper(selectedItem.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/80 text-rose-300 text-xs font-mono font-medium transition-colors"
                title="Simulate unauthorized bytecode modification"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Hash Tamper Attack</span>
              </button>

              <button
                onClick={() => onRestoreBaseline(selectedItem.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-semibold transition-colors"
                title="Restore binary from read-only base OS"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Clean Baseline</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              * Simulate Hash Tamper modifies the live digest to demonstrate real-time tripwire triggering, kernel audit logging, and AI remediation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
