import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Shield, CornerDownLeft, Maximize2, Trash2 } from 'lucide-react';
import { 
  SystemMetrics, 
  ThreatRecord, 
  FIMItem, 
  FirewallRule, 
  NetworkConnection, 
  SandboxApp, 
  AuditLogEntry 
} from '../../types/nexus';

interface TerminalModuleProps {
  metrics: SystemMetrics;
  threats: ThreatRecord[];
  fimItems: FIMItem[];
  firewallRules: FirewallRule[];
  connections: NetworkConnection[];
  sandboxes: SandboxApp[];
  auditLogs: AuditLogEntry[];
  onTriggerFIM: () => void;
}

interface CommandHistoryItem {
  id: string;
  command: string;
  output: string | React.ReactNode;
  timestamp: string;
  isError?: boolean;
}

export const TerminalModule: React.FC<TerminalModuleProps> = ({
  metrics,
  threats,
  fimItems,
  firewallRules,
  connections,
  sandboxes,
  auditLogs,
  onTriggerFIM,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<CommandHistoryItem[]>([
    {
      id: 'init-1',
      command: 'nexus status',
      output: (
        <div className="space-y-1 text-slate-300 font-mono text-xs">
          <p className="text-cyan-400 font-bold">NEXUS OS 2026 — Security Core Telemetry</p>
          <p>Kernel: {metrics.kernelVersion}</p>
          <p>Architecture: {metrics.architecture}</p>
          <p>Secure Boot: {metrics.secureBootStatus} (TPM 2.0 PCR-7 sealed)</p>
          <p>Root Partition: /sysroot mounted {metrics.rootPartitionMode} (dm-verity enforced)</p>
          <p>Mandatory Access Control: AppArmor ({metrics.appArmorStatus})</p>
          <p>Storage Encryption: {metrics.luksEncryption}</p>
          <p>Active Sandboxes: {sandboxes.filter(s => s.status === 'RUNNING').length} running / {sandboxes.length} total</p>
          <p>Firewall: nftables (inet nexus_filter active, {firewallRules.filter(r => r.enabled).length} rules)</p>
          <p className="text-slate-400">Type <span className="text-cyan-300">'nexus help'</span> or <span className="text-cyan-300">'help'</span> to inspect available security commands.</p>
        </div>
      ),
      timestamp: '22:55:00',
    },
  ]);
  const [cmdHistoryList, setCmdHistoryList] = useState<string[]>(['nexus status']);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isSudoElevated, setIsSudoElevated] = useState<boolean>(false);
  const [sudoPromptActive, setSudoPromptActive] = useState<boolean>(false);
  const [pendingCommand, setPendingCommand] = useState<string>('');

  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const AVAILABLE_COMMANDS = [
    'nexus status',
    'nexus security audit',
    'nexus integrity check',
    'nexus network status',
    'nexus firewall status',
    'nexus threat report',
    'nexus update verify',
    'nexus logs --security',
    'nexus sandbox list',
    'nexus help',
    'nexus ask',
    'sudo su',
    'ps aux',
    'uname -a',
    'uptime',
    'clear',
    'cat /etc/os-release',
    'cat /etc/nftables.conf',
    'whoami',
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Tab completion
    if (e.key === 'Tab') {
      e.preventDefault();
      const current = inputVal.trim();
      if (!current) return;
      const matched = AVAILABLE_COMMANDS.find((cmd) => cmd.startsWith(current));
      if (matched) {
        setInputVal(matched);
      }
      return;
    }

    // Command history navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistoryList.length === 0) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex < cmdHistoryList.length) {
        setHistoryIndex(nextIndex);
        setInputVal(cmdHistoryList[cmdHistoryList.length - 1 - nextIndex]);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputVal(cmdHistoryList[cmdHistoryList.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
      return;
    }
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = inputVal.trim();
    if (!rawCmd && !sudoPromptActive) return;

    if (sudoPromptActive) {
      // Handling sudo password prompt
      setSudoPromptActive(false);
      setInputVal('');
      if (rawCmd === '2026' || rawCmd === 'nexus' || rawCmd === '') {
        setIsSudoElevated(true);
        executeCommand(pendingCommand, true);
      } else {
        setHistory((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            command: 'sudo auth challenge',
            output: 'sudo: 1 incorrect password attempt. Security incident logged in /var/log/audit/audit.log',
            timestamp: new Date().toLocaleTimeString(),
            isError: true,
          },
        ]);
      }
      setPendingCommand('');
      return;
    }

    setCmdHistoryList((prev) => [...prev, rawCmd]);
    setHistoryIndex(-1);
    setInputVal('');

    // Check if command requires administrative privilege
    const requiresPrivilege =
      rawCmd.startsWith('sudo') ||
      rawCmd.includes('--quarantine') ||
      rawCmd.includes('--kill') ||
      rawCmd.includes('nft add') ||
      rawCmd.includes('integrity restore');

    if (requiresPrivilege && !isSudoElevated && !rawCmd.startsWith('sudo su')) {
      setPendingCommand(rawCmd);
      setSudoPromptActive(true);
      return;
    }

    executeCommand(rawCmd, isSudoElevated);
  };

  const executeCommand = async (cmd: string, elevated: boolean) => {
    const isJson = cmd.includes('--json');
    const cleanCmd = cmd.replace('--json', '').trim().toLowerCase();

    const timestamp = new Date().toLocaleTimeString();

    if (cleanCmd === 'clear') {
      setHistory([]);
      return;
    }

    if (cleanCmd === 'whoami') {
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          command: cmd,
          output: elevated ? 'root (uid=0 gid=0)' : 'sec-operator (uid=1000 gid=1000 groups=sec-wheel,docker,kvm)',
          timestamp,
        },
      ]);
      return;
    }

    if (cleanCmd === 'sudo su') {
      setIsSudoElevated(true);
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          command: cmd,
          output: 'Privilege elevated to root. Mandatory access control (AppArmor) rules remain strictly enforced.',
          timestamp,
        },
      ]);
      return;
    }

    if (cleanCmd === 'cat /etc/os-release') {
      const releaseInfo = `NAME="NEXUS OS"
VERSION="2026.1 LTS (Security Edition)"
ID=nexus
ID_LIKE=linux
PRETTY_NAME="NEXUS OS 2026 — Advanced Security OS"
BUILD_ID="2026.10.24-SEC"
HOME_URL="https://nexus-os.security"
SUPPORT_URL="https://nexus-os.security/docs"
BUG_REPORT_URL="https://nexus-os.security/issues"
PRIVACY_POLICY_URL="https://nexus-os.security/privacy"
SECURITY_POLICY="immutable-root-ro + dm-verity + apparmor-4.0"`;

      setHistory((prev) => [
        ...prev,
        { id: Date.now().toString(), command: cmd, output: <pre className="text-slate-300 font-mono text-xs">{releaseInfo}</pre>, timestamp },
      ]);
      return;
    }

    if (cleanCmd === 'uname -a') {
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          command: cmd,
          output: `${metrics.kernelVersion} ${metrics.architecture} GNU/Linux`,
          timestamp,
        },
      ]);
      return;
    }

    if (cleanCmd === 'uptime') {
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          command: cmd,
          output: `up 23 hours, 31 min,  1 user,  load average: ${metrics.loadAverage.join(', ')}`,
          timestamp,
        },
      ]);
      return;
    }

    if (cleanCmd.startsWith('nexus ask')) {
      const query = cmd.replace(/^nexus ask/i, '').replace(/["']/g, '').trim();
      try {
        const res = await fetch('/api/ai/terminal-assist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        const data = await res.json();
        setHistory((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            command: cmd,
            output: (
              <div className="space-y-1 font-mono text-xs">
                <p className="text-cyan-300 font-bold">[NEXUS AI CYBER-ASSIST]</p>
                <p className="text-slate-200">{data.response}</p>
                {data.suggestedCommand && (
                  <p className="text-emerald-400">Suggested: <span className="underline cursor-pointer" onClick={() => setInputVal(data.suggestedCommand)}>{data.suggestedCommand}</span></p>
                )}
              </div>
            ),
            timestamp,
          },
        ]);
      } catch (err) {
        setHistory((prev) => [
          ...prev,
          { id: Date.now().toString(), command: cmd, output: 'Error communicating with AI assistant.', timestamp, isError: true },
        ]);
      }
      return;
    }

    if (cleanCmd === 'nexus status') {
      const output = isJson ? (
        <pre className="text-xs font-mono text-slate-300">
          {JSON.stringify(metrics, null, 2)}
        </pre>
      ) : (
        <div className="space-y-1 font-mono text-xs text-slate-300">
          <p className="text-cyan-400 font-bold">NEXUS SECURITY OPERATING SYSTEM STATUS</p>
          <p>OS Edition: {metrics.osEdition}</p>
          <p>Kernel: {metrics.kernelVersion}</p>
          <p>Secure Boot: {metrics.secureBootStatus}</p>
          <p>Root Partition: {metrics.rootPartitionMode} (dm-verity verified)</p>
          <p>TPM Status: {metrics.tpmStatus}</p>
          <p>Storage: {metrics.luksEncryption}</p>
          <p>Load Average: {metrics.loadAverage.join(', ')}</p>
          <p>CPU Utilization: {metrics.cpuUsage}%</p>
          <p>RAM: {metrics.memoryUsedMb}MB / {metrics.memoryTotalMb}MB</p>
        </div>
      );
      setHistory((prev) => [...prev, { id: Date.now().toString(), command: cmd, output, timestamp }]);
      return;
    }

    if (cleanCmd === 'nexus security audit') {
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          command: cmd,
          output: (
            <div className="space-y-1.5 font-mono text-xs text-slate-300">
              <p className="text-cyan-400 font-bold">CIS LINUX BENCHMARK HARNESS (Level 2 Server/Desktop Hardened)</p>
              <p className="text-emerald-400">[PASS] 1.1 Read-Only Root Partition (/sysroot mounted ro)</p>
              <p className="text-emerald-400">[PASS] 1.2 Unused filesystems disabled (cramfs, freevxfs, jffs2, hfs)</p>
              <p className="text-emerald-400">[PASS] 2.1 AppArmor MAC enforcing mode with 48 active profiles</p>
              <p className="text-emerald-400">[PASS] 3.1 IP forwarding disabled (net.ipv4.ip_forward=0)</p>
              <p className="text-emerald-400">[PASS] 3.2 Reverse path filtering active (rp_filter=1)</p>
              <p className="text-emerald-400">[PASS] 4.1 Immutable auditd rules active (-e 2)</p>
              <p className="text-emerald-400">[PASS] 5.1 SSH root login disabled and dropped</p>
              <p className="text-emerald-400">[PASS] 6.1 LUKS2 AES-XTS-512 full disk encryption verified</p>
              <p className="text-emerald-400">[PASS] 7.1 Ed25519 signature enforcement on A/B update packages</p>
              <p className="text-slate-400 pt-1">CIS Hardening Score: 98/100 (No unmitigated high-risk vulnerabilities)</p>
            </div>
          ),
          timestamp,
        },
      ]);
      return;
    }

    if (cleanCmd === 'nexus integrity check') {
      onTriggerFIM();
      const output = isJson ? (
        <pre className="text-xs font-mono text-slate-300">
          {JSON.stringify(fimItems, null, 2)}
        </pre>
      ) : (
        <div className="space-y-1 font-mono text-xs text-slate-300">
          <p className="text-cyan-400 font-bold">NEXUS FILE INTEGRITY MONITOR (FIM) REPORT</p>
          <p className="text-slate-400">Comparing cryptographic SHA-256 digests against sealed PCR-10 baseline:</p>
          {fimItems.map((f) => (
            <div key={f.id} className="flex items-center justify-between text-xs">
              <span className="text-slate-200">{f.path}</span>
              <span className={f.status === 'MATCH' ? 'text-emerald-400' : 'text-rose-400'}>
                [{f.status}] SHA-256: {f.currentHash.slice(0, 16)}...
              </span>
            </div>
          ))}
          <p className="text-emerald-400 pt-1">All {fimItems.length} protected system paths verified against immutable baseline.</p>
        </div>
      );
      setHistory((prev) => [...prev, { id: Date.now().toString(), command: cmd, output, timestamp }]);
      return;
    }

    if (cleanCmd === 'nexus network status') {
      const output = isJson ? (
        <pre className="text-xs font-mono text-slate-300">{JSON.stringify(connections, null, 2)}</pre>
      ) : (
        <div className="space-y-1 font-mono text-xs text-slate-300">
          <p className="text-cyan-400 font-bold">ACTIVE NETWORK SOCKETS & DO-H STATUS</p>
          <div className="grid grid-cols-12 gap-2 text-slate-400 border-b border-slate-700 pb-1">
            <span className="col-span-2">PROTO</span>
            <span className="col-span-4">REMOTE ADDR</span>
            <span className="col-span-3">PROCESS</span>
            <span className="col-span-3">STATUS</span>
          </div>
          {connections.map((c) => (
            <div key={c.id} className="grid grid-cols-12 gap-2 text-xs">
              <span className="col-span-2 text-slate-400">{c.proto}</span>
              <span className="col-span-4 text-slate-200">{c.remoteAddr}:{c.remotePort}</span>
              <span className="col-span-3 text-cyan-300 truncate">{c.processName}</span>
              <span className={`col-span-3 ${c.state === 'BLOCKED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {c.state}
              </span>
            </div>
          ))}
        </div>
      );
      setHistory((prev) => [...prev, { id: Date.now().toString(), command: cmd, output, timestamp }]);
      return;
    }

    if (cleanCmd === 'nexus firewall status') {
      const output = isJson ? (
        <pre className="text-xs font-mono text-slate-300">{JSON.stringify(firewallRules, null, 2)}</pre>
      ) : (
        <div className="space-y-1 font-mono text-xs text-slate-300">
          <p className="text-cyan-400 font-bold">NFTABLES LIVE RULESET (table inet nexus_filter)</p>
          <p className="text-slate-400">Default Policy: INPUT DROP | FORWARD DROP | OUTPUT ACCEPT (STATEFUL)</p>
          {firewallRules.map((r) => (
            <div key={r.id} className="text-xs">
              <span className="text-slate-400">rule #{r.id.split('-')[1]} ({r.chain}):</span>{' '}
              <span className="text-cyan-300">{r.proto}</span> port <span className="text-amber-300">{r.destPort}</span>{' '}
              <span className={r.action === 'accept' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {r.action.toUpperCase()}
              </span>{' '}
              <span className="text-slate-500">({r.hitsCount} pkts) - {r.comment}</span>
            </div>
          ))}
        </div>
      );
      setHistory((prev) => [...prev, { id: Date.now().toString(), command: cmd, output, timestamp }]);
      return;
    }

    if (cleanCmd === 'nexus threat report') {
      const output = isJson ? (
        <pre className="text-xs font-mono text-slate-300">{JSON.stringify(threats, null, 2)}</pre>
      ) : (
        <div className="space-y-1 font-mono text-xs text-slate-300">
          <p className="text-cyan-400 font-bold">NEXUS THREAT CORRELATION REPORT</p>
          {threats.map((t) => (
            <div key={t.id} className="p-2 rounded bg-slate-900 border border-slate-800 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-bold">[{t.severity}] {t.id}</span>
                <span className="text-slate-400">{t.classification} ({t.confidenceScore}% conf)</span>
              </div>
              <p className="text-slate-200">{t.title}</p>
              <p className="text-slate-400 text-[11px]">{t.details}</p>
              <p className="text-cyan-300 text-[10px]">MITRE: {t.mitre.join(', ')}</p>
            </div>
          ))}
        </div>
      );
      setHistory((prev) => [...prev, { id: Date.now().toString(), command: cmd, output, timestamp }]);
      return;
    }

    if (cleanCmd === 'nexus update verify') {
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          command: cmd,
          output: (
            <div className="space-y-1 font-mono text-xs text-slate-300">
              <p className="text-cyan-400 font-bold">NEXUS SYSTEM UPDATE VERIFICATION</p>
              <p>Active Root Partition: Partition A (/dev/nvme0n1p2) [MOUNTED RO, INTACT]</p>
              <p>Standby Root Partition: Partition B (/dev/nvme0n1p3) [STAGED]</p>
              <p>Cryptographic Signature: Ed25519 valid (Public Key ID: 0x9F4C-RELEASE-2026)</p>
              <p>dm-verity Root Digest: sha256:d8a26189e3fa51... [VERIFIED]</p>
              <p>Rollback Counter: Monotonic HW TPM NV index #0x01800001 (replay attack protected)</p>
              <p className="text-emerald-400">All cryptographic update constraints satisfied.</p>
            </div>
          ),
          timestamp,
        },
      ]);
      return;
    }

    if (cleanCmd.startsWith('nexus logs')) {
      const logsToShow = auditLogs.slice(0, 5);
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          command: cmd,
          output: (
            <div className="space-y-1 font-mono text-xs text-slate-300">
              <p className="text-cyan-400 font-bold">KERNEL SECURITY AUDIT TRAIL (/var/log/audit/audit.log)</p>
              {logsToShow.map((l) => (
                <div key={l.id} className="text-xs">
                  <span className="text-slate-500">{l.timestamp}</span>{' '}
                  <span className="text-cyan-300">[{l.subsystem}]</span>{' '}
                  <span className="text-slate-200">{l.actor}</span> -&gt;{' '}
                  <span className="text-amber-300">{l.action}</span> ({l.target}) :{' '}
                  <span className={l.result === 'BLOCKED' ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {l.result}
                  </span>
                </div>
              ))}
            </div>
          ),
          timestamp,
        },
      ]);
      return;
    }

    if (cleanCmd === 'nexus sandbox list') {
      const output = isJson ? (
        <pre className="text-xs font-mono text-slate-300">{JSON.stringify(sandboxes, null, 2)}</pre>
      ) : (
        <div className="space-y-1 font-mono text-xs text-slate-300">
          <p className="text-cyan-400 font-bold">ACTIVE APPLICATION SANDBOX NAMESPACES</p>
          <div className="grid grid-cols-12 gap-2 text-slate-400 border-b border-slate-700 pb-1">
            <span className="col-span-2">PID</span>
            <span className="col-span-4">APPLICATION</span>
            <span className="col-span-3">SECCOMP</span>
            <span className="col-span-3">STATUS</span>
          </div>
          {sandboxes.map((s) => (
            <div key={s.id} className="grid grid-cols-12 gap-2 text-xs">
              <span className="col-span-2 font-mono text-slate-400">{s.pid || 'N/A'}</span>
              <span className="col-span-4 text-slate-200">{s.name}</span>
              <span className="col-span-3 text-cyan-300 truncate">{s.seccompProfile}</span>
              <span className={`col-span-3 ${s.status === 'RUNNING' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      );
      setHistory((prev) => [...prev, { id: Date.now().toString(), command: cmd, output, timestamp }]);
      return;
    }

    if (cleanCmd === 'ps' || cleanCmd === 'ps aux') {
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          command: cmd,
          output: (
            <div className="space-y-1 font-mono text-xs text-slate-300">
              <p className="text-slate-400">USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND</p>
              <p>root         1  0.0  0.1 168420 12040 ?        Ss   00:00   0:02 /sbin/init</p>
              <p>root       742  0.1  0.2  89210  9420 ?        S    00:01   0:01 /usr/lib/systemd/systemd-resolved</p>
              <p>nexus     1840  0.2  0.5 210400 42100 pts/0    Ss+  00:10   0:03 /usr/bin/nexus-terminal</p>
              <p>nexus     2419  3.8  2.9 892400 248000 ?       Sl   00:15   1:12 /usr/bin/nexus-tor-browser (sandboxed)</p>
              <p>nexus     3108  2.1  1.2 410200 98000 ?        Sl   00:20   0:44 /usr/bin/nexus-netscope</p>
              <p>nexus     4891  0.0  0.6 142000 48000 ?        T    00:42   0:00 python3 pyscanner (isolated)</p>
            </div>
          ),
          timestamp,
        },
      ]);
      return;
    }

    if (cleanCmd === 'nexus help' || cleanCmd === 'help') {
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          command: cmd,
          output: (
            <div className="space-y-1.5 font-mono text-xs text-slate-300">
              <p className="text-cyan-400 font-bold">NEXUS OS 2026 CLI REFERENCE SUITE</p>
              <p><span className="text-cyan-300">nexus status [--json]</span> : Display operating system integrity & hardware security state</p>
              <p><span className="text-cyan-300">nexus security audit</span> : Run CIS Linux Benchmark hardening checks</p>
              <p><span className="text-cyan-300">nexus integrity check</span> : Compare system binaries with SHA-256 tripwire baseline</p>
              <p><span className="text-cyan-300">nexus network status</span> : List active sockets, DNS-over-HTTPS status, and packet rates</p>
              <p><span className="text-cyan-300">nexus firewall status</span> : Inspect nftables live filter tables and dropped packets</p>
              <p><span className="text-cyan-300">nexus threat report</span> : Query correlated security events and MITRE ATT&CK vectors</p>
              <p><span className="text-cyan-300">nexus update verify</span> : Cryptographically check A/B root partition signed payload</p>
              <p><span className="text-cyan-300">nexus logs --security</span> : Stream latest kernel auditd and AppArmor violation logs</p>
              <p><span className="text-cyan-300">nexus sandbox list</span> : Display isolated Bubblewrap namespaces and seccomp filters</p>
              <p><span className="text-cyan-300">nexus ask "&lt;query&gt;"</span> : Consult Gemini AI Cyber Assistant directly from CLI</p>
              <p><span className="text-cyan-300">sudo su / whoami / ps aux / clear</span> : Standard Unix/Linux utilities</p>
            </div>
          ),
          timestamp,
        },
      ]);
      return;
    }

    // Default: unrecognized command
    setHistory((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        command: cmd,
        output: `nexus: command not found: '${cmd}'. Type 'nexus help' for a list of valid security utilities.`,
        timestamp,
        isError: true,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
      {/* Terminal Title Bar */}
      <div className="h-9 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">nexus@sec-workstation:~</span>
          <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/60">
            {isSudoElevated ? 'ROOT (ELEVATED)' : 'SANDBOXED SHELL'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistory([])}
            className="p-1 hover:text-slate-200 transition-colors"
            title="Clear Terminal Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <span className={isSudoElevated ? 'text-rose-400 font-bold' : 'text-cyan-400'}>
                {isSudoElevated ? 'root@nexus:#' : 'sec-operator@nexus:~$'}
              </span>
              <span className="text-slate-100 font-semibold">{item.command}</span>
              <span className="text-slate-600 text-[10px] ml-auto">{item.timestamp}</span>
            </div>

            <div className={`pl-4 ${item.isError ? 'text-rose-400' : 'text-slate-300'}`}>
              {item.output}
            </div>
          </div>
        ))}
        <div ref={terminalBottomRef} />
      </div>

      {/* Input Prompt */}
      <form onSubmit={handleCommandSubmit} className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
        <span className={sudoPromptActive ? 'text-amber-400 font-bold' : isSudoElevated ? 'text-rose-400 font-bold' : 'text-cyan-400 font-bold'}>
          {sudoPromptActive ? '[sudo] password for sec-operator:' : isSudoElevated ? 'root@nexus:#' : 'sec-operator@nexus:~$'}
        </span>

        <input
          ref={inputRef}
          type={sudoPromptActive ? 'password' : 'text'}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder={sudoPromptActive ? 'Enter PIN (2026 or press Enter)' : 'Type a command or try "nexus help" (Tab for autocomplete)'}
          className="flex-1 bg-transparent text-slate-100 focus:outline-none font-mono text-xs placeholder-slate-600"
        />

        <button
          type="submit"
          className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
          title="Execute"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
