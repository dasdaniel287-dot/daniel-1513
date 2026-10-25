import React, { useState } from 'react';
import { 
  Activity, 
  Wifi, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Globe, 
  Radio, 
  Ban, 
  CheckCircle2, 
  RefreshCw,
  Search
} from 'lucide-react';
import { NetworkConnection } from '../../types/nexus';

interface NetworkMonitorProps {
  connections: NetworkConnection[];
  onBlockConnection: (id: string) => void;
  onAllowConnection: (id: string) => void;
}

export const NetworkMonitor: React.FC<NetworkMonitorProps> = ({
  connections,
  onBlockConnection,
  onAllowConnection,
}) => {
  const [filterTerm, setFilterTerm] = useState('');
  const [dohProvider, setDohProvider] = useState('Cloudflare (1.1.1.1)');
  const [torRoutingActive, setTorRoutingActive] = useState(true);

  const filtered = connections.filter(
    (c) =>
      c.remoteAddr.includes(filterTerm) ||
      c.processName.toLowerCase().includes(filterTerm.toLowerCase()) ||
      c.remoteHostname.toLowerCase().includes(filterTerm.toLowerCase()) ||
      c.remotePort.toString().includes(filterTerm)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              Network Security Monitor & DNS-over-HTTPS (DoH)
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Per-socket eBPF traffic telemetry, DNSSEC verification, and automated egress anomaly interception.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs font-mono">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300">DoH: {dohProvider}</span>
          </div>

          <button
            onClick={() => setTorRoutingActive(!torRoutingActive)}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 ${
              torRoutingActive
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>{torRoutingActive ? 'Tor Circuit: ON' : 'Tor Circuit: OFF'}</span>
          </button>
        </div>
      </div>

      {/* Traffic Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Active Sockets
          </span>
          <span className="text-xl font-bold font-mono text-cyan-400">
            {connections.length} Established
          </span>
          <p className="text-[10px] text-slate-500 font-mono mt-1">
            0 unencrypted plaintext leaks
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Inbound Bandwidth
          </span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            47.5 KB/s
          </span>
          <p className="text-[10px] text-slate-500 font-mono mt-1">
            Strict synproxy SYN filter active
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Outbound Bandwidth
          </span>
          <span className="text-xl font-bold font-mono text-slate-200">
            20.4 KB/s
          </span>
          <p className="text-[10px] text-slate-500 font-mono mt-1">
            Per-application egress isolated
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Blocked Anomalies
          </span>
          <span className="text-xl font-bold font-mono text-rose-400">
            {connections.filter((c) => c.state === 'BLOCKED').length} Intercepted
          </span>
          <p className="text-[10px] text-slate-500 font-mono mt-1">
            Immediate drop by nftables
          </p>
        </div>
      </div>

      {/* Live Sockets Table */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by remote IP, process, or port..."
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <span className="text-xs font-mono text-slate-400">
            Kernel Socket Telemetry (TCP/UDP)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">PROTO</th>
                <th className="py-2.5 px-3">LOCAL SOCKET</th>
                <th className="py-2.5 px-3">REMOTE ENDPOINT</th>
                <th className="py-2.5 px-3">PROCESS (PID)</th>
                <th className="py-2.5 px-3">TRANSFER RATE</th>
                <th className="py-2.5 px-3">STATE</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((conn) => (
                <tr
                  key={conn.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    conn.suspicious ? 'bg-rose-950/20' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-slate-400">
                    {conn.proto}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {conn.localAddr}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-100 font-semibold block">
                      {conn.remoteAddr}:{conn.remotePort}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-xs">
                      {conn.remoteHostname} ({conn.country})
                    </span>
                  </td>
                  <td className="py-3 px-3 text-cyan-300">
                    {conn.processName} (PID {conn.pid})
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    ↓ {conn.inRateKbps} KB/s · ↑ {conn.outRateKbps} KB/s
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        conn.state === 'ESTABLISHED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                          : conn.state === 'BLOCKED'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/80'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {conn.state}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {conn.state === 'BLOCKED' ? (
                      <button
                        onClick={() => onAllowConnection(conn.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        onClick={() => onBlockConnection(conn.id)}
                        className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-[11px] font-medium transition-colors"
                      >
                        Drop / Block
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
