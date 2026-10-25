import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Wifi, 
  Battery, 
  Volume2, 
  Lock, 
  Terminal, 
  Cpu, 
  Bell, 
  Moon, 
  Sun,
  LayoutGrid,
  Radio
} from 'lucide-react';
import { ModuleKey, SecurityLevel } from '../../types/nexus';

interface TopBarProps {
  securityLevel: SecurityLevel;
  setSecurityLevel: (lvl: SecurityLevel) => void;
  activeModuleName: string;
  onOpenModule: (key: ModuleKey) => void;
  onLockScreen: () => void;
  unreadAlertsCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onToggleLauncher: () => void;
  isLauncherOpen: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  securityLevel,
  setSecurityLevel,
  activeModuleName,
  onOpenModule,
  onLockScreen,
  unreadAlertsCount,
  theme,
  onToggleTheme,
  onToggleLauncher,
  isLauncherOpen,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showSecurityMenu, setShowSecurityMenu] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getSecurityBadgeColor = () => {
    switch (securityLevel) {
      case 'LOCKDOWN':
        return 'text-rose-400 bg-rose-950/60 border-rose-800/80';
      case 'STRICT':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/80';
      case 'ELEVATED':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800/80';
      case 'NORMAL':
      default:
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80';
    }
  };

  return (
    <header className="h-10 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md px-3 flex items-center justify-between z-40 select-none text-xs text-slate-300">
      {/* Left: Brand & Launcher & Active Module */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLauncher}
          aria-label="Application Launcher"
          className={`flex items-center gap-2 px-2.5 py-1 rounded-md transition-colors ${
            isLauncherOpen ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60' : 'hover:bg-slate-800/70 text-slate-200'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold tracking-wider text-slate-100 font-mono">NEXUS</span>
          <span className="text-[10px] text-cyan-400 font-mono">OS 2026</span>
        </button>

        <div className="h-3.5 w-px bg-slate-800" aria-hidden="true" />

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-mono">APP //</span>
          <span className="font-medium text-slate-200">{activeModuleName}</span>
        </div>
      </div>

      {/* Middle: Security Posture Selector */}
      <div className="relative">
        <button
          onClick={() => setShowSecurityMenu(!showSecurityMenu)}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded border transition-colors ${getSecurityBadgeColor()}`}
          title="Security Enforcement Level"
        >
          {securityLevel === 'LOCKDOWN' ? (
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse text-rose-400" />
          ) : (
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span className="font-mono font-semibold tracking-wide text-[11px] uppercase">
            SEC: {securityLevel}
          </span>
        </button>

        {showSecurityMenu && (
          <div 
            className="absolute top-8 left-1/2 -translate-x-1/2 w-64 bg-slate-900 border border-slate-800 rounded-lg p-2 shadow-2xl z-50 text-slate-200"
            onMouseLeave={() => setShowSecurityMenu(false)}
          >
            <div className="px-2 py-1 text-[10px] text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800/80 mb-1">
              Select Defense Posture
            </div>
            {(['NORMAL', 'ELEVATED', 'STRICT', 'LOCKDOWN'] as SecurityLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setSecurityLevel(lvl);
                  setShowSecurityMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between text-xs transition-colors ${
                  securityLevel === lvl ? 'bg-cyan-950/80 text-cyan-300 font-medium' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>{lvl} Mode</span>
                <span className="text-[10px] text-slate-500">
                  {lvl === 'NORMAL' && 'Base MAC & Sandbox'}
                  {lvl === 'ELEVATED' && 'Strict Network Ingress'}
                  {lvl === 'STRICT' && 'Drop Non-Tor Egress'}
                  {lvl === 'LOCKDOWN' && 'Air-gap / Freeze Sandbox'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Quick Indicators & Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Launch Terminal */}
        <button
          onClick={() => onOpenModule('terminal')}
          className="p-1.5 rounded hover:bg-slate-800/80 text-slate-400 hover:text-cyan-400 transition-colors"
          title="Open Nexus Terminal"
          aria-label="Open Terminal"
        >
          <Terminal className="w-3.5 h-3.5" />
        </button>

        {/* Quick Launch AI Analyst */}
        <button
          onClick={() => onOpenModule('ai-analyst')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-950/40 border border-cyan-800/50 hover:bg-cyan-900/40 text-cyan-300 transition-colors"
          title="AI Threat Analyst"
        >
          <Radio className="w-3 h-3 text-cyan-400" />
          <span className="text-[11px] font-mono">AI Threat Engine</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => onOpenModule('incident-response')}
          className="relative p-1.5 rounded hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors"
          title="Security Incidents"
          aria-label="Security Incidents"
        >
          <Bell className="w-3.5 h-3.5" />
          {unreadAlertsCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        <div className="h-3.5 w-px bg-slate-800" aria-hidden="true" />

        {/* System Status Indicators */}
        <div className="flex items-center gap-2 text-slate-400">
          <span title="Network: Encrypted (DoH Active)">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          </span>
          <span title="Audio Device Ready">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
          </span>
          <span title="Power: AC Connected">
            <Battery className="w-3.5 h-3.5 text-slate-300" />
          </span>
        </div>

        <div className="h-3.5 w-px bg-slate-800" aria-hidden="true" />

        {/* Clock & Date */}
        <div className="font-mono text-slate-300 text-right">
          <span className="font-medium">{currentTime}</span>
          <span className="text-slate-500 ml-1.5 hidden sm:inline">{currentDate}</span>
        </div>

        {/* Screen Lock */}
        <button
          onClick={onLockScreen}
          className="p-1.5 rounded hover:bg-slate-800/80 text-slate-400 hover:text-amber-400 transition-colors"
          title="Lock Screen & Secure Sessions"
          aria-label="Lock Screen"
        >
          <Lock className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
