import React, { useState } from 'react';
import { 
  Flame, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  ShieldAlert, 
  CheckCircle, 
  Filter, 
  Radio,
  RefreshCw 
} from 'lucide-react';
import { FirewallRule } from '../../types/nexus';

interface FirewallCenterProps {
  rules: FirewallRule[];
  onToggleRule: (ruleId: string) => void;
  onAddRule: (rule: Omit<FirewallRule, 'id' | 'hitsCount'>) => void;
  onDeleteRule: (ruleId: string) => void;
}

export const FirewallCenter: React.FC<FirewallCenterProps> = ({
  rules,
  onToggleRule,
  onAddRule,
  onDeleteRule,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProto, setNewProto] = useState<'tcp' | 'udp' | 'icmp' | 'all'>('tcp');
  const [newChain, setNewChain] = useState<'input' | 'output' | 'forward'>('input');
  const [newPort, setNewPort] = useState('');
  const [newSource, setNewSource] = useState('*');
  const [newAction, setNewAction] = useState<'accept' | 'drop' | 'reject'>('drop');
  const [newComment, setNewComment] = useState('');

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPort.trim()) return;

    onAddRule({
      family: 'inet',
      table: 'nexus_filter',
      chain: newChain,
      proto: newProto,
      source: newSource.trim() || '*',
      destPort: newPort.trim(),
      action: newAction,
      comment: newComment.trim() || 'Custom operator perimeter rule',
      enabled: true,
    });

    setShowAddModal(false);
    setNewPort('');
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Stats */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              nftables Stateful Packet Filter (table inet nexus_filter)
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Hardware-accelerated netfilter subsystem with conntrack stateful inspection and zero-trust default drop policy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-sm font-bold font-mono text-cyan-400">
              {rules.filter((r) => r.enabled).length} / {rules.length} Active
            </span>
            <span className="block text-[10px] text-slate-400 font-mono">
              Policy: Default DROP
            </span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add nftables Rule</span>
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
            Active Ruleset & Packet Hit Counts
          </span>
          <span className="text-xs font-mono text-slate-500">
            Kernel Hook: prerouting / input / output
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-2.5 px-3">CHAIN</th>
                <th className="py-2.5 px-3">PROTO</th>
                <th className="py-2.5 px-3">SOURCE IP</th>
                <th className="py-2.5 px-3">DEST PORT</th>
                <th className="py-2.5 px-3">TARGET ACTION</th>
                <th className="py-2.5 px-3">PACKET HITS</th>
                <th className="py-2.5 px-3">COMMENT</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {rules.map((rule) => (
                <tr
                  key={rule.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    !rule.enabled ? 'opacity-40' : ''
                  }`}
                >
                  <td className="py-3 px-3 uppercase text-slate-300 font-semibold">
                    {rule.chain}
                  </td>
                  <td className="py-3 px-3 text-cyan-300 uppercase">
                    {rule.proto}
                  </td>
                  <td className="py-3 px-3 text-slate-200">
                    {rule.source}
                  </td>
                  <td className="py-3 px-3 text-amber-300">
                    {rule.destPort}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rule.action === 'accept'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                          : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                      }`}
                    >
                      {rule.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {rule.hitsCount.toLocaleString()} pkts
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-300 max-w-xs truncate">
                    {rule.comment}
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => onToggleRule(rule.id)}
                      className="text-slate-400 hover:text-cyan-400 transition-colors"
                      title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                    >
                      {rule.enabled ? (
                        <ToggleRight className="w-5 h-5 text-cyan-400 inline" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-600 inline" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteRule(rule.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
            <h4 className="font-semibold text-slate-100 text-sm mb-4">
              Add New nftables Rule
            </h4>

            <form onSubmit={handleCreateRule} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Chain</label>
                  <select
                    value={newChain}
                    onChange={(e: any) => setNewChain(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  >
                    <option value="input">input</option>
                    <option value="output">output</option>
                    <option value="forward">forward</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Protocol</label>
                  <select
                    value={newProto}
                    onChange={(e: any) => setNewProto(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  >
                    <option value="tcp">tcp</option>
                    <option value="udp">udp</option>
                    <option value="icmp">icmp</option>
                    <option value="all">all</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Destination Port (or * for all)</label>
                <input
                  type="text"
                  placeholder="e.g. 4444 or 80,443"
                  value={newPort}
                  onChange={(e) => setNewPort(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Source IP / CIDR</label>
                <input
                  type="text"
                  placeholder="e.g. 203.0.113.195 or *"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Action</label>
                <select
                  value={newAction}
                  onChange={(e: any) => setNewAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                >
                  <option value="drop">drop (silent discard)</option>
                  <option value="reject">reject (send ICMP unreach)</option>
                  <option value="accept">accept</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Comment</label>
                <input
                  type="text"
                  placeholder="e.g. Block suspicious C2 egress"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold transition-colors"
                >
                  Append Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
