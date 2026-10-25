import React, { useState } from 'react';
import { Shield, KeyRound, Lock, Unlock, AlertTriangle, Fingerprint } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
  failedAttempts: number;
  onFailedAttempt: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  onUnlock,
  failedAttempts,
  onFailedAttempt,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Default secure credentials for operator session
  const CORRECT_PIN = '2026';

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setErrorMsg('');

    setTimeout(() => {
      if (pin === CORRECT_PIN || pin === 'nexus') {
        setIsVerifying(false);
        setPin('');
        onUnlock();
      } else {
        setIsVerifying(false);
        setErrorMsg('Authentication failed. PAM log entry recorded in /var/log/audit/audit.log');
        onFailedAttempt();
        setPin('');
      }
    }, 400);
  };

  const handleQuickKeyUnlock = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onUnlock();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 select-none">
      {/* Background cyber grid & glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="w-full max-w-md z-10 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
        {/* Shield Icon */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-400 mb-4 shadow-inner">
          <Shield className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-slate-100">
          NEXUS OS 2026
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1 mb-6">
          Security Core · Sealed Session · Cryptographic Auth
        </p>

        {/* User Card */}
        <div className="w-full p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl mb-6 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-900/40 border border-cyan-700/60 flex items-center justify-center text-cyan-300 font-mono font-bold text-xs">
              SEC
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">sec-operator</p>
              <p className="text-[11px] text-slate-400 font-mono">UID 1000 (nexus-sec)</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
            PAM Verified
          </span>
        </div>

        {/* PIN / Password Form */}
        <form onSubmit={handleUnlock} className="w-full space-y-4">
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="Enter PIN (Default: 2026 or nexus)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono tracking-widest text-center"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {failedAttempts > 0 && (
            <div className="text-[11px] font-mono text-amber-400">
              Failed authentication attempts: {failedAttempts} (Triggering delay throttle)
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 disabled:opacity-50"
          >
            {isVerifying ? (
              <span>Verifying PAM Token...</span>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>Unlock Workstation</span>
              </>
            )}
          </button>
        </form>

        {/* FIDO2 / Security Key Alternate */}
        <div className="w-full mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={handleQuickKeyUnlock}
            className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
          >
            <Fingerprint className="w-4 h-4 text-cyan-400" />
            <span>Use FIDO2 / TPM Key</span>
          </button>
          <span className="text-[11px] font-mono text-slate-500">TPM 2.0 PCR-7</span>
        </div>
      </div>
    </div>
  );
};
