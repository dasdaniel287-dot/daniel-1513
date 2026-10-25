/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ModuleKey, 
  SecurityLevel, 
  SystemMetrics, 
  ThreatRecord, 
  FIMItem, 
  FirewallRule, 
  NetworkConnection, 
  SandboxApp, 
  AuditLogEntry, 
  SecurityIncident 
} from './types/nexus';
import { 
  INITIAL_METRICS, 
  INITIAL_SANDBOXES, 
  INITIAL_FIM_ITEMS, 
  INITIAL_CONNECTIONS, 
  INITIAL_FIREWALL_RULES, 
  INITIAL_THREATS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_INCIDENTS 
} from './services/nexusCore';

import { TopBar } from './components/desktop/TopBar';
import { Dock, DOCK_ITEMS } from './components/desktop/Dock';
import { AppLauncher } from './components/desktop/AppLauncher';
import { WindowContainer } from './components/desktop/WindowContainer';
import { LockScreen } from './components/desktop/LockScreen';

// 15 System Modules
import { HomeDashboard } from './components/modules/HomeDashboard';
import { SecurityCenter } from './components/modules/SecurityCenter';
import { AIThreatAnalyst } from './components/modules/AIThreatAnalyst';
import { SystemMonitor } from './components/modules/SystemMonitor';
import { NetworkMonitor } from './components/modules/NetworkMonitor';
import { FirewallCenter } from './components/modules/FirewallCenter';
import { ApplicationManager } from './components/modules/ApplicationManager';
import { TerminalModule } from './components/modules/TerminalModule';
import { VulnerabilityScanner } from './components/modules/VulnerabilityScanner';
import { PrivacyCenter } from './components/modules/PrivacyCenter';
import { FileIntegrityModule } from './components/modules/FileIntegrityModule';
import { IncidentResponseModule } from './components/modules/IncidentResponseModule';
import { UpdateManagerModule } from './components/modules/UpdateManagerModule';
import { DeviceSettingsModule } from './components/modules/DeviceSettingsModule';
import { SecurityReportsModule } from './components/modules/SecurityReportsModule';

export default function App() {
  const [metrics, setMetrics] = useState<SystemMetrics>(INITIAL_METRICS);
  const [threats, setThreats] = useState<ThreatRecord[]>(INITIAL_THREATS);
  const [fimItems, setFIMItems] = useState<FIMItem[]>(INITIAL_FIM_ITEMS);
  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>(INITIAL_FIREWALL_RULES);
  const [connections, setConnections] = useState<NetworkConnection[]>(INITIAL_CONNECTIONS);
  const [sandboxes, setSandboxes] = useState<SandboxApp[]>(INITIAL_SANDBOXES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [incidents, setIncidents] = useState<SecurityIncident[]>(INITIAL_INCIDENTS);

  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>('NORMAL');
  const [activeModule, setActiveModule] = useState<ModuleKey>('dashboard');
  const [openModules, setOpenModules] = useState<ModuleKey[]>(['dashboard', 'terminal', 'ai-analyst']);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notification, setNotification] = useState<{ title: string; message: string; type: 'info' | 'warn' | 'crit' } | null>(null);

  // Periodic heartbeat to simulate realistic live telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics((prev) => {
        const jitter = (Math.random() - 0.5) * 1.2;
        const newCpu = Math.max(8.0, Math.min(65.0, Number((prev.cpuUsage + jitter).toFixed(1))));
        return {
          ...prev,
          cpuUsage: newCpu,
          uptimeSeconds: prev.uptimeSeconds + 3,
        };
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const showNotification = (title: string, message: string, type: 'info' | 'warn' | 'crit' = 'info') => {
    setNotification({ title, message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.title === title ? null : curr));
    }, 4500);
  };

  const handleOpenModule = (key: ModuleKey) => {
    setActiveModule(key);
    if (!openModules.includes(key)) {
      setOpenModules([...openModules, key]);
    }
  };

  const handleCloseModule = () => {
    const remaining = openModules.filter((m) => m !== activeModule);
    setOpenModules(remaining);
    if (remaining.length > 0) {
      setActiveModule(remaining[remaining.length - 1]);
    } else {
      setActiveModule('dashboard');
      setOpenModules(['dashboard']);
    }
  };

  const handleMinimize = () => {
    // switch to dashboard or previous
    if (activeModule !== 'dashboard') {
      setActiveModule('dashboard');
    }
  };

  // FIM Handlers
  const handleTriggerFIM = () => {
    setFIMItems((prev) =>
      prev.map((item) => ({
        ...item,
        lastChecked: 'Just now',
      }))
    );
    showNotification('Baseline Check Complete', 'SHA-256 digests verified against TPM PCR[10].', 'info');
  };

  const handleSimulateTamper = (id: string) => {
    setFIMItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              currentHash: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
              status: 'TAMPERED',
              lastChecked: 'Just now',
            }
          : item
      )
    );

    const tampered = fimItems.find((f) => f.id === id);
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toLocaleTimeString(),
      subsystem: 'FIM',
      severity: 'CRITICAL',
      actor: 'nexus-fim-tripwire',
      action: 'HASH_MISMATCH',
      target: tampered?.path || 'protected path',
      result: 'ALERT',
      details: `Tripwire tripped! Digest deviation detected on ${tampered?.path || 'system'}. Inode sealed flag violated.`,
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    const newThreat: ThreatRecord = {
      id: `THR-${Date.now().toString().slice(-4)}`,
      title: `Unauthorized Inode Hash Deviation on ${tampered?.path || 'System Binary'}`,
      category: 'File Tampering',
      severity: 'CRITICAL',
      timestamp: 'Just now',
      processName: 'kernel-inotify',
      pid: 1,
      details: `Live SHA-256 does not match sealed baseline. Potential rootkit insertion on ${tampered?.path}.`,
      classification: 'CONFIRMED',
      confidenceScore: 98,
      mitre: ['T1565.001 - Stored Data Manipulation'],
      status: 'ACTIVE',
      remediationCommand: `nexus integrity check --path "${tampered?.path}" --restore`,
    };

    setThreats((prev) => [newThreat, ...prev]);
    showNotification('CRITICAL: Tripwire Alert', `Hash drift detected on ${tampered?.path || 'protected path'}.`, 'crit');
  };

  const handleRestoreBaseline = (id: string) => {
    setFIMItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              currentHash: item.expectedHash,
              status: 'MATCH',
              lastChecked: 'Just now',
            }
          : item
      )
    );
    showNotification('Baseline Restored', 'Cryptographic state restored from read-only base root partition.', 'info');
  };

  // Firewall Handlers
  const handleToggleFirewallRule = (id: string) => {
    setFirewallRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleAddFirewallRule = (rule: Omit<FirewallRule, 'id' | 'hitsCount'>) => {
    const newRule: FirewallRule = {
      ...rule,
      id: `fw-${Date.now().toString().slice(-4)}`,
      hitsCount: 0,
    };
    setFirewallRules((prev) => [...prev, newRule]);
    showNotification('nftables Rule Appended', `Rule for port ${newRule.destPort} committed to inet nexus_filter.`, 'info');
  };

  const handleDeleteFirewallRule = (id: string) => {
    setFirewallRules((prev) => prev.filter((r) => r.id !== id));
    showNotification('nftables Rule Deleted', 'Rule removed from live kernel table.', 'info');
  };

  // Sandbox Handlers
  const handleToggleSandboxPermission = (appId: string, perm: keyof SandboxApp['permissions']) => {
    setSandboxes((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const updatedPerms = {
            ...app.permissions,
            [perm]: !app.permissions[perm],
          };
          return {
            ...app,
            permissions: updatedPerms,
          };
        }
        return app;
      })
    );
    showNotification('Sandbox Policy Updated', `Capability '${String(perm)}' updated for application namespace.`, 'info');
  };

  const handleTerminateApp = (appId: string) => {
    setSandboxes((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              status: 'STOPPED',
              pid: null,
              cpuPercent: 0,
              memoryMb: 0,
            }
          : app
      )
    );
    showNotification('Process Terminated', 'SIGKILL delivered via kernel cgroup controller.', 'warn');
  };

  const handleIsolateApp = (appId: string) => {
    setSandboxes((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              status: 'ISOLATED',
              seccompProfile: 'strict-bpf',
              permissions: {
                ...app.permissions,
                network: false,
                rawSockets: false,
              },
            }
          : app
      )
    );
    showNotification('Strict Isolation Enforced', 'Process cgroup frozen and network namespace disconnected.', 'warn');
  };

  // Network Handlers
  const handleBlockConnection = (id: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, state: 'BLOCKED' } : c))
    );
    showNotification('Connection Intercepted', 'nftables drop rule deployed for target IP.', 'warn');
  };

  const handleAllowConnection = (id: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, state: 'ESTABLISHED' } : c))
    );
  };

  // Remediation Execution from AI Analyst
  const handleApplyRemediation = (threatId: string, cmd: string) => {
    setThreats((prev) =>
      prev.map((t) => (t.id === threatId ? { ...t, status: 'RESOLVED' } : t))
    );
    showNotification('Remediation Applied', `Defensive command executed: ${cmd}`, 'info');
  };

  // Incident Playbook Execution
  const handleExecutePlaybook = (incidentId: string, playbook: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              status: 'CONTAINED',
              quarantineActive: true,
            }
          : inc
      )
    );
    showNotification('Playbook Executed', `Playbook '${playbook}' executed: process isolated, network perimeter sealed.`, 'info');
  };

  // Current active dock item metadata
  const currentDockItem = DOCK_ITEMS.find((d) => d.key === activeModule) || DOCK_ITEMS[0];
  const ActiveIcon = currentDockItem.icon;

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} relative overflow-hidden font-sans`}>
      {/* Background Cyber Wallpaper with Subtle Geometric Rings */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Desktop Navigation Bar */}
      <TopBar
        securityLevel={securityLevel}
        setSecurityLevel={setSecurityLevel}
        activeModuleName={currentDockItem.label}
        onOpenModule={handleOpenModule}
        onLockScreen={() => setIsScreenLocked(true)}
        unreadAlertsCount={threats.filter((t) => t.status === 'ACTIVE').length}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onToggleLauncher={() => setIsLauncherOpen(!isLauncherOpen)}
        isLauncherOpen={isLauncherOpen}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 relative z-10 p-2 sm:p-4 overflow-hidden flex flex-col justify-center">
        <WindowContainer
          title={currentDockItem.label}
          subtitle={`NEXUS SEC-CORE // ${activeModule.toUpperCase()}`}
          icon={<ActiveIcon className="w-4 h-4" />}
          isMaximized={isMaximized}
          onToggleMaximize={() => setIsMaximized(!isMaximized)}
          onMinimize={handleMinimize}
          onClose={handleCloseModule}
        >
          {activeModule === 'dashboard' && (
            <HomeDashboard
              metrics={metrics}
              threats={threats}
              securityLevel={securityLevel}
              onSetSecurityLevel={setSecurityLevel}
              onOpenModule={handleOpenModule}
              onRunFIMCheck={handleTriggerFIM}
            />
          )}

          {activeModule === 'security-center' && (
            <SecurityCenter metrics={metrics} />
          )}

          {activeModule === 'ai-analyst' && (
            <AIThreatAnalyst
              threats={threats}
              onApplyRemediation={handleApplyRemediation}
            />
          )}

          {activeModule === 'system-monitor' && (
            <SystemMonitor
              metrics={metrics}
              sandboxes={sandboxes}
              onTerminateProcess={(pid) => {
                showNotification('Process Terminated', `SIGKILL dispatched to PID ${pid}`, 'warn');
              }}
            />
          )}

          {activeModule === 'network-monitor' && (
            <NetworkMonitor
              connections={connections}
              onBlockConnection={handleBlockConnection}
              onAllowConnection={handleAllowConnection}
            />
          )}

          {activeModule === 'firewall' && (
            <FirewallCenter
              rules={firewallRules}
              onToggleRule={handleToggleFirewallRule}
              onAddRule={handleAddFirewallRule}
              onDeleteRule={handleDeleteFirewallRule}
            />
          )}

          {activeModule === 'apps' && (
            <ApplicationManager
              sandboxes={sandboxes}
              onTogglePermission={handleToggleSandboxPermission}
              onTerminateApp={handleTerminateApp}
              onIsolateApp={handleIsolateApp}
            />
          )}

          {activeModule === 'terminal' && (
            <TerminalModule
              metrics={metrics}
              threats={threats}
              fimItems={fimItems}
              firewallRules={firewallRules}
              connections={connections}
              sandboxes={sandboxes}
              auditLogs={auditLogs}
              onTriggerFIM={handleTriggerFIM}
            />
          )}

          {activeModule === 'vulnerability-scanner' && (
            <VulnerabilityScanner />
          )}

          {activeModule === 'privacy-center' && (
            <PrivacyCenter />
          )}

          {activeModule === 'file-integrity' && (
            <FileIntegrityModule
              items={fimItems}
              onTriggerCheck={handleTriggerFIM}
              onSimulateTamper={handleSimulateTamper}
              onRestoreBaseline={handleRestoreBaseline}
            />
          )}

          {activeModule === 'incident-response' && (
            <IncidentResponseModule
              incidents={incidents}
              auditLogs={auditLogs}
              onExecutePlaybook={handleExecutePlaybook}
            />
          )}

          {activeModule === 'update-manager' && (
            <UpdateManagerModule />
          )}

          {activeModule === 'device-settings' && (
            <DeviceSettingsModule metrics={metrics} />
          )}

          {activeModule === 'reports' && (
            <SecurityReportsModule />
          )}
        </WindowContainer>
      </main>

      {/* Floating Application Launcher Dock */}
      <Dock
        activeModule={activeModule}
        openModules={openModules}
        onSelectModule={handleOpenModule}
      />

      {/* Application Launcher Modal */}
      <AppLauncher
        isOpen={isLauncherOpen}
        onClose={() => setIsLauncherOpen(false)}
        onSelectModule={handleOpenModule}
        onLockScreen={() => setIsScreenLocked(true)}
      />

      {/* Lock Screen Modal */}
      {isScreenLocked && (
        <LockScreen
          onUnlock={() => setIsScreenLocked(false)}
          failedAttempts={failedLoginAttempts}
          onFailedAttempt={() => setFailedLoginAttempts((p) => p + 1)}
        />
      )}

      {/* Toast Notification Alert */}
      {notification && (
        <div 
          className={`fixed top-12 right-4 z-50 p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-xl transition-all duration-300 max-w-sm ${
            notification.type === 'crit'
              ? 'bg-rose-950/90 border-rose-800 text-rose-100'
              : notification.type === 'warn'
              ? 'bg-amber-950/90 border-amber-800 text-amber-100'
              : 'bg-slate-900/90 border-cyan-800 text-slate-100'
          }`}
        >
          <div className="space-y-0.5 flex-1">
            <h4 className="text-xs font-bold font-mono tracking-wide">
              {notification.title}
            </h4>
            <p className="text-xs text-slate-300">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-100 text-xs font-mono ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
