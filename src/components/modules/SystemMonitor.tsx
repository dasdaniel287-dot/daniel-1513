import React, { useState } from 'react';
import { 
  Cpu, 
  HardDrive, 
  Activity, 
  Power, 
  Pause, 
  Play, 
  Lock, 
  Search,
  Layers
} from 'lucide-react';
import { SystemMetrics, SandboxApp } from '../../types/nexus';

interface SystemMonitorProps {
  metrics: SystemMetrics;
  sandboxes: SandboxApp[];
  onTerminateProcess: (pid: number) => void;
}

export const SystemMonitor: React.FC<SystemMonitorProps> = ({
  metrics,
  sandboxes,
  onTerminateProcess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPid, setSelectedPid] = useState<number | null>(null);

  const processes = [
    { pid: 1, user: 'root', name: 'systemd', cpu: 0.1, mem: 12.0, state: 'Sleeping', cgroup: 'system.slice', sandboxed: false, seccomp: 'system' },
    { pid: 618, user: 'systemd-network', name: 'systemd-networkd', cpu: 0.0, mem: 8.4, state: 'Sleeping', cgroup: 'system.slice', sandboxed: true, seccomp: 'strict' },
    { pid: 742, user: 'systemd-resolve', name: 'systemd-resolved (DoH)', cpu: 0.2, mem: 14.1, state: 'Running', cgroup: 'system.slice', sandboxed: true, seccomp: 'strict' },
    { pid: 1840, user: 'nexus', name: 'nexus-terminal', cpu: 0.4, mem: 42.0, state: 'Running', cgroup: 'user-1000.slice', sandboxed: true, seccomp: 'default' },
    { pid: 2419, user: 'nexus', name: 'nexus-tor-browser', cpu: 3.8, mem: 480.0, state: 'Running', cgroup: 'app.slice/tor.scope', sandboxed: true, seccomp: 'network-only' },
    { pid: 3108, user: 'nexus', name: 'nexus-netscope', cpu: 2.1, mem: 210.0, state: 'Running', cgroup: 'app.slice/netscope.scope', sandboxed: true, seccomp: 'strict-bpf' },
    { pid: 4012, user: 'nexus', name: 'nexus-signal', cpu: 1.2, mem: 240.0, state: 'Running', cgroup: 'app.slice/signal.scope', sandboxed: true, seccomp: 'network-only' },
    { pid: 4891, user: 'nexus', name: 'python3 [pyscanner]', cpu: 0.0, mem: 110.0, state: 'Frozen', cgroup: 'isolated.slice/untrusted', sandboxed: true, seccomp: 'strict-bpf' },
  ];

  const filtered = processes.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pid.toString().includes(searchTerm) ||
      p.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-mono flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU Core Utilization
            </span>
            <span className="font-mono text-slate-200">{metrics.cpuUsage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, metrics.cpuUsage)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2">
            Governor: schedutil · Microcode CET enabled
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Physical RAM
            </span>
            <span className="font-mono text-slate-200">
              {metrics.memoryUsedMb}MB / {metrics.memoryTotalMb}MB
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${(metrics.memoryUsedMb / metrics.memoryTotalMb) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2">
            ZRAM swap enabled · Zero unencrypted paging
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-mono flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" /> Storage I/O
            </span>
            <span className="font-mono text-slate-200">NVMe0n1p3 (LUKS2)</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-indigo-500 rounded-full w-1/5" />
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2">
            Read: 2.4 MB/s · Write: 0.1 MB/s (/sysroot is ro)
          </p>
        </div>
      </div>

      {/* Process Table */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter processes by name, PID, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {selectedPid && (
              <button
                onClick={() => onTerminateProcess(selectedPid)}
                className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-slate-100 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Power className="w-3.5 h-3.5" />
                <span>SIGKILL PID {selectedPid}</span>
              </button>
            )}
            <span className="text-xs font-mono text-slate-400">
              {filtered.length} Processes
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">PID</th>
                <th className="py-2.5 px-3">USER</th>
                <th className="py-2.5 px-3">COMMAND</th>
                <th className="py-2.5 px-3">CPU%</th>
                <th className="py-2.5 px-3">MEM (MB)</th>
                <th className="py-2.5 px-3">STATE</th>
                <th className="py-2.5 px-3">SECCOMP</th>
                <th className="py-2.5 px-3">ISOLATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((proc) => {
                const isSelected = selectedPid === proc.pid;
                return (
                  <tr
                    key={proc.pid}
                    onClick={() => setSelectedPid(proc.pid)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/60 text-slate-100'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-cyan-400">
                      {proc.pid}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {proc.user}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200">
                      {proc.name}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {proc.cpu.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {proc.mem.toFixed(1)} MB
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          proc.state === 'Running'
                            ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800/60'
                            : proc.state === 'Frozen'
                            ? 'text-amber-300 bg-amber-950/60 border border-amber-800/60'
                            : 'text-slate-400'
                        }`}
                      >
                        {proc.state}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-cyan-300 text-[11px]">
                      {proc.seccomp}
                    </td>
                    <td className="py-3 px-3">
                      {proc.sandboxed ? (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> cgroups-bpf
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">
                          system
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
