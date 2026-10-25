import React from 'react';
import { 
  ShieldCheck, 
  Shield, 
  Bot, 
  Cpu, 
  Activity, 
  Flame, 
  Boxes, 
  Terminal, 
  ScanLine, 
  EyeOff, 
  FileCheck2, 
  AlertOctagon, 
  RefreshCw, 
  Sliders, 
  FileText 
} from 'lucide-react';
import { ModuleKey } from '../../types/nexus';

interface DockProps {
  activeModule: ModuleKey;
  openModules: ModuleKey[];
  onSelectModule: (key: ModuleKey) => void;
}

export const DOCK_ITEMS: { key: ModuleKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'dashboard', label: 'Home Dashboard', icon: ShieldCheck },
  { key: 'security-center', label: 'Security Center', icon: Shield },
  { key: 'ai-analyst', label: 'AI Threat Analyst', icon: Bot },
  { key: 'system-monitor', label: 'System Monitor', icon: Cpu },
  { key: 'network-monitor', label: 'Network Defense', icon: Activity },
  { key: 'firewall', label: 'Firewall Center', icon: Flame },
  { key: 'apps', label: 'App Sandboxing', icon: Boxes },
  { key: 'terminal', label: 'Terminal', icon: Terminal },
  { key: 'vulnerability-scanner', label: 'Vulnerability Scanner', icon: ScanLine },
  { key: 'privacy-center', label: 'Privacy Center', icon: EyeOff },
  { key: 'file-integrity', label: 'File Integrity', icon: FileCheck2 },
  { key: 'incident-response', label: 'Incident Response', icon: AlertOctagon },
  { key: 'update-manager', label: 'Update Verifier', icon: RefreshCw },
  { key: 'device-settings', label: 'Device Settings', icon: Sliders },
  { key: 'reports', label: 'Project Deliverables', icon: FileText },
];

export const Dock: React.FC<DockProps> = ({ activeModule, openModules, onSelectModule }) => {
  return (
    <nav 
      aria-label="Desktop application dock"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl max-w-[95vw] overflow-x-auto"
    >
      {DOCK_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeModule === item.key;
        const isOpen = openModules.includes(item.key);

        return (
          <button
            key={item.key}
            onClick={() => onSelectModule(item.key)}
            className={`group relative p-2 rounded-xl transition-all duration-150 flex flex-col items-center ${
              isActive
                ? 'bg-cyan-950 text-cyan-300 shadow-sm border border-cyan-700/60'
                : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
            title={item.label}
          >
            <Icon className="w-5 h-5 transition-transform duration-150 group-hover:scale-110" />

            {/* Active / Running Indicator Dot */}
            <span
              className={`w-1 h-1 rounded-full mt-1 transition-all ${
                isActive
                  ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
                  : isOpen
                  ? 'bg-slate-500'
                  : 'bg-transparent'
              }`}
            />

            {/* Tooltip on hover */}
            <span className="pointer-events-none absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-slate-100 text-[11px] px-2 py-0.5 rounded shadow-lg border border-slate-700 whitespace-nowrap z-50">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
