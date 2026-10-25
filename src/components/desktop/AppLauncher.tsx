import React, { useState } from 'react';
import { 
  Search, 
  X, 
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
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';
import { ModuleKey } from '../../types/nexus';

interface AppLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (key: ModuleKey) => void;
  onLockScreen: () => void;
}

interface AppEntry {
  key: ModuleKey;
  name: string;
  category: 'Core Security' | 'Defensive Tools' | 'System & Telemetry' | 'Administration & Governance';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const APPS: AppEntry[] = [
  {
    key: 'dashboard',
    name: 'Home Dashboard',
    category: 'Core Security',
    description: 'Central security posture, threat score, active subsystems and high-level health.',
    icon: ShieldCheck,
  },
  {
    key: 'security-center',
    name: 'Security Center',
    category: 'Core Security',
    description: 'CIS Linux benchmark auditing, AppArmor MAC profiles, kernel hardening invariants.',
    icon: Shield,
    badge: 'Benchmark',
  },
  {
    key: 'ai-analyst',
    name: 'AI Threat Analyst',
    category: 'Core Security',
    description: 'Gemini 3.8-powered security intelligence, automated event triage, and MITRE mapping.',
    icon: Bot,
    badge: 'Gemini AI',
  },
  {
    key: 'firewall',
    name: 'Firewall Center',
    category: 'Defensive Tools',
    description: 'nftables live ruleset management, port access policies, and stateful packet filters.',
    icon: Flame,
  },
  {
    key: 'file-integrity',
    name: 'File Integrity Monitor',
    category: 'Defensive Tools',
    description: 'Cryptographic SHA-256 tripwire baseline monitoring across /etc, /boot, and system binaries.',
    icon: FileCheck2,
    badge: 'FIM Tripwire',
  },
  {
    key: 'vulnerability-scanner',
    name: 'Vulnerability Scanner',
    category: 'Defensive Tools',
    description: 'Real-time CVE scanning, CVSS vulnerability scoring, and software package analysis.',
    icon: ScanLine,
  },
  {
    key: 'incident-response',
    name: 'Incident Response',
    category: 'Defensive Tools',
    description: 'Security event correlation, forensic incident triage, automated quarantine playbooks.',
    icon: AlertOctagon,
  },
  {
    key: 'privacy-center',
    name: 'Privacy Center',
    category: 'Defensive Tools',
    description: 'Hardware kill-switches, anti-telemetry enforcement, DoH resolver and MAC address cycling.',
    icon: EyeOff,
  },
  {
    key: 'apps',
    name: 'Application Sandboxing',
    category: 'System & Telemetry',
    description: 'Bubblewrap namespaces, seccomp-bpf syscall filtering, and granular capability matrix.',
    icon: Boxes,
  },
  {
    key: 'system-monitor',
    name: 'System Monitor',
    category: 'System & Telemetry',
    description: 'Real-time process tree, cgroups resource controls, memory allocation and CPU tracking.',
    icon: Cpu,
  },
  {
    key: 'network-monitor',
    name: 'Network Defense',
    category: 'System & Telemetry',
    description: 'Live socket inspector, traffic rates, DNS queries, and anomalous egress detection.',
    icon: Activity,
  },
  {
    key: 'terminal',
    name: 'Nexus Terminal',
    category: 'Administration & Governance',
    description: 'Hardened Linux command shell with custom nexus CLI suite and JSON output support.',
    icon: Terminal,
  },
  {
    key: 'update-manager',
    name: 'Update Verifier',
    category: 'Administration & Governance',
    description: 'Cryptographically signed A/B immutable root partitions with atomic rollback protection.',
    icon: RefreshCw,
  },
  {
    key: 'device-settings',
    name: 'Device & Hardware Security',
    category: 'Administration & Governance',
    description: 'TPM 2.0 PCR sealing, Secure Boot status, LUKS2 disk encryption, and FIDO2 keys.',
    icon: Sliders,
  },
  {
    key: 'reports',
    name: 'Project Deliverables',
    category: 'Administration & Governance',
    description: 'Architecture documentation, STRIDE threat model, SBOM catalog, and VM installation scripts.',
    icon: FileText,
    badge: 'Deliverables',
  },
];

export const AppLauncher: React.FC<AppLauncherProps> = ({
  isOpen,
  onClose,
  onSelectModule,
  onLockScreen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const filteredApps = APPS.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['All', 'Core Security', 'Defensive Tools', 'System & Telemetry', 'Administration & Governance'];

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Search and Close */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-4 bg-slate-950/60">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search security modules, tools, or system parameters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close Launcher"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="px-4 py-2 border-b border-slate-800/60 flex items-center gap-1 overflow-x-auto bg-slate-900/50">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs rounded-md font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/70'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Apps Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 flex-1">
          {filteredApps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.key}
                onClick={() => {
                  onSelectModule(app.key);
                  onClose();
                }}
                className="text-left p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/70 hover:border-cyan-700/60 hover:bg-slate-850/60 transition-all duration-150 flex items-start gap-3 group"
              >
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 group-hover:text-cyan-300 group-hover:border-cyan-600/50 transition-colors shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <h3 className="font-semibold text-slate-100 text-sm truncate group-hover:text-cyan-300">
                      {app.name}
                    </h3>
                    {app.badge && (
                      <span className="text-[10px] font-mono text-cyan-400 shrink-0">
                        {app.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {app.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer with Quick Session Lock */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-semibold">NEXUS SEC-CORE 2026</span>
            <span>·</span>
            <span>All 15 System Modules Loaded</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onLockScreen();
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Lock Screen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
