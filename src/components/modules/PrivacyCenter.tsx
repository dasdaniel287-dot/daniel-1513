import React, { useState } from 'react';
import { 
  EyeOff, 
  Camera, 
  Mic, 
  Bluetooth, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  Radio, 
  FileCheck, 
  SlidersHorizontal 
} from 'lucide-react';

export const PrivacyCenter: React.FC = () => {
  const [cameraHardwareBlocked, setCameraHardwareBlocked] = useState(false);
  const [micHardwareBlocked, setMicHardwareBlocked] = useState(false);
  const [bluetoothDisabled, setBluetoothDisabled] = useState(true);
  const [macRandomization, setMacRandomization] = useState(true);
  const [localFirstAIOnly, setLocalFirstAIOnly] = useState(false);
  const [aiConsentGranted, setAiConsentGranted] = useState(true);
  const [telemetryScrubbing, setTelemetryScrubbing] = useState(true);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <EyeOff className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              NEXUS Privacy Center & Data Minimization Engine
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Hardware-enforced isolation kill-switches, ephemeral MAC addresses, and strict zero-telemetry boundary policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/80">
            Zero Diagnostics Leak
          </span>
        </div>
      </div>

      {/* Hardware Kill-Switches */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
          Hardware & Peripheral Kill-Switches (Kernel Driver Detach)
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Camera */}
          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className={`w-5 h-5 ${cameraHardwareBlocked ? 'text-rose-400' : 'text-cyan-400'}`} />
              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  Camera Sensor (/dev/video0)
                </h4>
                <p className="text-[11px] text-slate-400">
                  {cameraHardwareBlocked ? 'Driver unbound from USB bus' : 'Hardware node accessible to approved sandboxes'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setCameraHardwareBlocked(!cameraHardwareBlocked)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                cameraHardwareBlocked
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {cameraHardwareBlocked ? 'KILL (OFF)' : 'ACTIVE'}
            </button>
          </div>

          {/* Microphone */}
          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic className={`w-5 h-5 ${micHardwareBlocked ? 'text-rose-400' : 'text-cyan-400'}`} />
              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  Microphone Array (/dev/snd)
                </h4>
                <p className="text-[11px] text-slate-400">
                  {micHardwareBlocked ? 'Audio capture hardware powered down' : 'PipeWire sandboxed channel open'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setMicHardwareBlocked(!micHardwareBlocked)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                micHardwareBlocked
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {micHardwareBlocked ? 'KILL (OFF)' : 'ACTIVE'}
            </button>
          </div>

          {/* Bluetooth */}
          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bluetooth className={`w-5 h-5 ${bluetoothDisabled ? 'text-slate-500' : 'text-cyan-400'}`} />
              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  Bluetooth Radio Subsystem
                </h4>
                <p className="text-[11px] text-slate-400">
                  {bluetoothDisabled ? 'rfkill block bluetooth active' : 'Bluetooth daemon scanning'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setBluetoothDisabled(!bluetoothDisabled)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                bluetoothDisabled
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              }`}
            >
              {bluetoothDisabled ? 'DISABLED' : 'ENABLED'}
            </button>
          </div>

          {/* MAC Address Randomization */}
          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  MAC Address Cycling
                </h4>
                <p className="text-[11px] text-slate-400">
                  Rotates physical NIC hardware address on each Wi-Fi association
                </p>
              </div>
            </div>

            <button
              onClick={() => setMacRandomization(!macRandomization)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                macRandomization
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {macRandomization ? 'ENFORCED' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Informed AI Data Governance & Local-First Processing */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
          AI Cyber-Intelligence Consent & Data Minimization
        </span>

        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-slate-200">
                Informed Operator Consent for External AI Threat Analysis
              </h4>
              <p className="text-[11px] text-slate-400 max-w-xl mt-0.5">
                When enabled, security event signatures may be triaged using Gemini 3.8 Flash. Never transmits personal user files, bash history, or plaintext memory payloads.
              </p>
            </div>

            <button
              onClick={() => setAiConsentGranted(!aiConsentGranted)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                aiConsentGranted
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              {aiConsentGranted ? 'CONSENT GRANTED' : 'PROHIBITED'}
            </button>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-slate-200">
                Kernel Telemetry Anonymization & Scrubber
              </h4>
              <p className="text-[11px] text-slate-400 max-w-xl mt-0.5">
                Automatically masks usernames, home directory paths, and internal LAN IPs before passing telemetry into any correlation queue.
              </p>
            </div>

            <button
              onClick={() => setTelemetryScrubbing(!telemetryScrubbing)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                telemetryScrubbing
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {telemetryScrubbing ? 'ACTIVE' : 'RAW'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
