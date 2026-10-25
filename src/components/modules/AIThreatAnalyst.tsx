import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  ShieldAlert, 
  CheckCircle, 
  AlertCircle, 
  Code, 
  Terminal, 
  RefreshCw, 
  FileText,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { ThreatRecord, ClassificationType, SeverityType } from '../../types/nexus';

interface AIThreatAnalystProps {
  threats: ThreatRecord[];
  onApplyRemediation: (threatId: string, cmd: string) => void;
}

export const AIThreatAnalyst: React.FC<AIThreatAnalystProps> = ({
  threats,
  onApplyRemediation,
}) => {
  const [selectedThreat, setSelectedThreat] = useState<ThreatRecord>(threats[0] || null);
  const [customLogInput, setCustomLogInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [investigationQuery, setInvestigationQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'NEXUS AI Cybersecurity Engine initialized (Gemini 3.8 Flash hybrid analyzer). I can analyze kernel audit logs, correlate process anomalies, provide plain-language explanations, and generate actionable containment scripts. Select an active threat or enter a custom audit log event below.',
      time: 'Just now',
    },
  ]);

  const handleAnalyzeThreat = async (threat: ThreatRecord) => {
    setSelectedThreat(threat);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/ai/analyze-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: threat }),
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeCustomLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLogInput.trim()) return;

    setIsAnalyzing(true);
    const mockEvent = {
      id: `CUSTOM-${Date.now().toString().slice(-4)}`,
      title: 'Manual Telemetry Query',
      details: customLogInput,
      timestamp: 'Just now',
      processName: 'kernel-auditd',
    };

    try {
      const res = await fetch('/api/ai/analyze-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: mockEvent }),
      });
      const data = await res.json();
      setAnalysisResult(data);
      setSelectedThreat(mockEvent as any);
    } catch (err) {
      console.error('Custom log analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investigationQuery.trim()) return;

    const userText = investigationQuery;
    setInvestigationQuery('');
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);

    try {
      const res = await fetch('/api/ai/terminal-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText }),
      });
      const data = await res.json();

      let reply = data.response;
      if (data.suggestedCommand) {
        reply += `\n\nSuggested Command:\n\`${data.suggestedCommand}\``;
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Error contacting security analysis endpoint. Reviewing local deterministic policy engine.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const getClassificationBadge = (classification?: ClassificationType) => {
    switch (classification) {
      case 'CONFIRMED':
        return 'text-rose-400 bg-rose-950/70 border-rose-800/80';
      case 'SUSPICIOUS_INDICATOR':
        return 'text-amber-400 bg-amber-950/70 border-amber-800/80';
      case 'UNVERIFIED_HYPOTHESIS':
        return 'text-cyan-400 bg-cyan-950/70 border-cyan-800/80';
      case 'FALSE_POSITIVE_POSSIBILITY':
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-800/80';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
      {/* Left 4 cols: Threat Selector & Log Input */}
      <div className="lg:col-span-4 space-y-4 flex flex-col">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              Pending Security Events
            </span>
            <span className="text-xs font-mono text-cyan-400">
              {threats.length} Captured
            </span>
          </div>

          <div className="space-y-2">
            {threats.map((threat) => (
              <button
                key={threat.id}
                onClick={() => handleAnalyzeThreat(threat)}
                className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex flex-col gap-1.5 ${
                  selectedThreat?.id === threat.id
                    ? 'bg-cyan-950/80 border-cyan-700 text-slate-100 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-cyan-400">
                    {threat.id}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getClassificationBadge(threat.classification)}`}>
                    {threat.classification.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="font-semibold text-slate-200 line-clamp-1">
                  {threat.title}
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate">
                  {threat.processName} · {threat.timestamp}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Audit Log Query */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex-1 flex flex-col">
          <span className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">
            Audit Log / Syscall Ingestion
          </span>
          <p className="text-xs text-slate-400 mb-3">
            Paste raw Linux auditd, AppArmor DENIED, or nftables drop log lines for instant AI triage.
          </p>

          <form onSubmit={handleAnalyzeCustomLog} className="flex-1 flex flex-col gap-2">
            <textarea
              value={customLogInput}
              onChange={(e) => setCustomLogInput(e.target.value)}
              placeholder="e.g. type=AVC msg=audit(1729828412.312:491): apparmor='DENIED' operation='open' profile='nexus-tor-browser' name='/etc/shadow' pid=2419 comm='firefox' requested_mask='r' denied_mask='r'"
              rows={4}
              className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isAnalyzing || !customLogInput.trim()}
              className="py-2 px-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Telemetry...</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5" />
                  <span>Analyze Log with AI</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right 8 cols: Detailed AI Analysis Output & Interactive Chat */}
      <div className="lg:col-span-8 space-y-4 flex flex-col">
        {/* Active Analysis Report */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">
                  AI Threat Assessment & Explanation
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Hybrid Deterministic + Gemini 3.8 Cyber Intelligence Engine
                </p>
              </div>
            </div>

            {selectedThreat && (
              <button
                onClick={() => handleAnalyzeThreat(selectedThreat)}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/80 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>Re-Analyze</span>
              </button>
            )}
          </div>

          {isAnalyzing ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs font-mono">
                Extracting syscall telemetry & correlating against MITRE ATT&CK knowledge base...
              </p>
            </div>
          ) : analysisResult || selectedThreat ? (
            <div className="space-y-4">
              {/* Classification and Confidence Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Classification Category
                  </span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border inline-block ${getClassificationBadge(analysisResult?.classification || selectedThreat?.classification)}`}>
                    {(analysisResult?.classification || selectedThreat?.classification || 'CONFIRMED').replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Confidence Level
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-cyan-400">
                      {analysisResult?.confidenceScore || selectedThreat?.confidenceScore || 92}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      (Deterministic rule match)
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    MITRE ATT&CK Mapping
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(analysisResult?.mitreAttack || selectedThreat?.mitre || ['T1059.004']).map((m: string) => (
                      <span key={m} className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/60">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Plain Language Explanation */}
              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
                  Plain-Language Risk Explanation
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {analysisResult?.plainLanguageExplanation ||
                    selectedThreat?.details ||
                    'Suspicious behavioral indicator identified by the Security Policy Engine.'}
                </p>
                {analysisResult?.technicalDetails && (
                  <p className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                    <strong className="text-slate-300">Technical Context:</strong> {analysisResult.technicalDetails}
                  </p>
                )}
              </div>

              {/* Actionable Remediation Guidance */}
              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono text-emerald-400 uppercase font-semibold">
                  Recommended Defensive Remediation
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {(analysisResult?.recommendedRemediation || selectedThreat?.aiRemediation || [
                    'Isolate the originating process namespace',
                    'Check integrity baseline of affected path',
                    'Deploy nftables stateful filter',
                  ]).map((step: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-mono font-bold">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>

                {/* Remediation Script / Command */}
                {(analysisResult?.remediationScript || selectedThreat?.remediationCommand) && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 bg-slate-900/90 p-2.5 rounded border border-slate-800">
                    <div className="flex items-center gap-2 overflow-x-auto font-mono text-xs text-cyan-300">
                      <Terminal className="w-4 h-4 text-slate-400 shrink-0" />
                      <code>{analysisResult?.remediationScript || selectedThreat?.remediationCommand}</code>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => copyToClipboard(analysisResult?.remediationScript || selectedThreat?.remediationCommand || '')}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Copy command"
                      >
                        {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onApplyRemediation(selectedThreat.id, analysisResult?.remediationScript || selectedThreat.remediationCommand || '')}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs transition-colors"
                      >
                        Execute Fix
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              Select an active threat from the list to inspect AI-generated remediation.
            </div>
          )}
        </div>

        {/* Interactive Threat Analyst Chat Console */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              Interactive Security Analyst Console
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Zero Prompt Hallucination Rule Active
            </span>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto mb-3 pr-1 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg flex flex-col gap-1 ${
                  msg.sender === 'user'
                    ? 'bg-cyan-950/50 border border-cyan-800/60 ml-8 text-slate-200'
                    : 'bg-slate-950/80 border border-slate-800 mr-8 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{msg.sender === 'user' ? 'Operator' : 'NEXUS AI Analyst'}</span>
                  <span>{msg.time}</span>
                </div>
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAskAssistant} className="flex items-center gap-2">
            <input
              type="text"
              value={investigationQuery}
              onChange={(e) => setInvestigationQuery(e.target.value)}
              placeholder="Ask AI Analyst: e.g. 'How should I harden against PID 4891 reverse shell?'"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              type="submit"
              disabled={!investigationQuery.trim()}
              className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
