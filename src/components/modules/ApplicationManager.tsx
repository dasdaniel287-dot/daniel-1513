import React, { useState } from 'react';
import { 
  Boxes, 
  ShieldCheck, 
  ShieldAlert, 
  Wifi, 
  WifiOff, 
  HardDrive, 
  Camera, 
  Mic, 
  Radio, 
  Power, 
  AlertOctagon, 
  Check, 
  Lock,
  Cpu
} from 'lucide-react';
import { SandboxApp } from '../../types/nexus';

interface ApplicationManagerProps {
  sandboxes: SandboxApp[];
  onTogglePermission: (appId: string, perm: keyof SandboxApp['permissions']) => void;
  onTerminateApp: (appId: string) => void;
  onIsolateApp: (appId: string) => void;
}

export const ApplicationManager: React.FC<ApplicationManagerProps> = ({
  sandboxes,
  onTogglePermission,
  onTerminateApp,
  onIsolateApp,
}) => {
  const [selectedApp, setSelectedApp] = useState<SandboxApp>(sandboxes[0]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Boxes className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              Application Isolation Manager (Bubblewrap & Landlock LSM)
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Unprivileged containerization utilizing Linux user namespaces, cgroups v2 resource capping, and seccomp-bpf syscall filtering.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
            {sandboxes.filter((s) => s.status === 'RUNNING').length} Active Namespaces
          </span>
          <span className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
            Zero Root Defaults
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 5 cols: List of Sandboxed Apps */}
        <div className="lg:col-span-5 space-y-2.5">
          {sandboxes.map((app) => {
            const isSelected = selectedApp.id === app.id;
            return (
              <button
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-700 text-slate-100 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-cyan-400">
                      PID {app.pid || 'STOPPED'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {app.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100">
                    {app.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    {app.seccompProfile} · {app.memoryMb}MB RAM
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      app.status === 'RUNNING'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                        : app.status === 'ISOLATED'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {app.status}
                  </span>
                  {app.signatureVerified ? (
                    <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Signed
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Unsigned
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right 7 cols: Detailed Sandbox Profile & Permissions Matrix */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="font-semibold text-slate-100 text-base">
                {selectedApp.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Signer: {selectedApp.signer}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onIsolateApp(selectedApp.id)}
                className="px-3 py-1.5 rounded bg-amber-600/80 hover:bg-amber-500 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Strict Freeze</span>
              </button>
              <button
                onClick={() => onTerminateApp(selectedApp.id)}
                className="px-3 py-1.5 rounded bg-rose-600/80 hover:bg-rose-500 text-slate-100 font-semibold text-xs transition-colors flex items-center gap-1"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Kill Process</span>
              </button>
            </div>
          </div>

          {/* Sandbox Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">AppArmor Profile</span>
              <span className="text-cyan-300 font-bold truncate block">{selectedApp.appArmorProfile}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Seccomp Filter</span>
              <span className="text-emerald-400 font-bold block">{selectedApp.seccompProfile}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">cgroups CPU Limit</span>
              <span className="text-slate-200 font-bold block">Cap: 15% / {selectedApp.cpuPercent}% Curr</span>
            </div>
          </div>

          {/* Granular Permission Review */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
              Granular Capability & Device Access Review
            </span>

            <div className="space-y-2">
              {/* Network */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {selectedApp.permissions.network ? (
                    <Wifi className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-slate-500" />
                  )}
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Outbound Network Namespace Access
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Permits TCP/UDP sockets via virtual veth pair
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onTogglePermission(selectedApp.id, 'network')}
                  className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                    selectedApp.permissions.network
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {selectedApp.permissions.network ? 'ALLOWED' : 'REVOKED'}
                </button>
              </div>

              {/* Camera */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Camera className={`w-4 h-4 ${selectedApp.permissions.camera ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Video & Camera Device Node (/dev/video0)
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Isolated V4L2 device access
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onTogglePermission(selectedApp.id, 'camera')}
                  className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                    selectedApp.permissions.camera
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {selectedApp.permissions.camera ? 'ALLOWED' : 'BLOCKED'}
                </button>
              </div>

              {/* Mic */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mic className={`w-4 h-4 ${selectedApp.permissions.mic ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Microphone Audio Capture (/dev/snd)
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      PipeWire unprivileged socket tunnel
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onTogglePermission(selectedApp.id, 'mic')}
                  className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                    selectedApp.permissions.mic
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {selectedApp.permissions.mic ? 'ALLOWED' : 'BLOCKED'}
                </button>
              </div>

              {/* Raw Sockets */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Radio className={`w-4 h-4 ${selectedApp.permissions.rawSockets ? 'text-amber-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Raw Socket Capability (CAP_NET_RAW)
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Packet sniffing and raw frame generation
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onTogglePermission(selectedApp.id, 'rawSockets')}
                  className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                    selectedApp.permissions.rawSockets
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {selectedApp.permissions.rawSockets ? 'ALLOWED' : 'RESTRICTED'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
