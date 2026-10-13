import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Eye,
  Clock,
  ArrowUpDown,
  Radio,
} from 'lucide-react';

export default function ThreatFeed({ feed = [], onSelectTransaction, onClearFeed }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFeed = feed.filter((tx) => {
    const matchesStatus = filterStatus === 'ALL' || tx.status === filterStatus;
    const matchesSearch =
      searchTerm === '' ||
      tx.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.accountId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.triggeredRule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            APPROVED
          </span>
        );
      case 'FLAGGED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-950/80 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            FLAGGED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-rose-950/80 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-400" />
            REJECTED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="glass-panel p-4 rounded-xl">
      {/* Feed Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              REAL-TIME THREAT LOGS &amp; AUDIT TRAIL
              <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">
                {filteredFeed.length} Events
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Live STOMP socket stream (/topic/threat-feed)
            </p>
          </div>
        </div>

        {/* Filter pills & search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by ID, Account, Rule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:border-cyan-500 focus:outline-none w-48 sm:w-60"
            />
          </div>

          {/* Status buttons */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
            {['ALL', 'APPROVED', 'FLAGGED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  filterStatus === st
                    ? st === 'APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                      : st === 'FLAGGED'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : st === 'REJECTED'
                      ? 'bg-rose-500/20 text-rose-300 font-bold'
                      : 'bg-slate-800 text-cyan-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {onClearFeed && (
            <button
              onClick={onClearFeed}
              className="text-xs font-mono text-slate-500 hover:text-slate-300 px-2 py-1 rounded hover:bg-slate-900 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
              <th className="pb-2.5 font-medium">TIMESTAMP</th>
              <th className="pb-2.5 font-medium">TX ID</th>
              <th className="pb-2.5 font-medium">ACCOUNT</th>
              <th className="pb-2.5 font-medium">AMOUNT</th>
              <th className="pb-2.5 font-medium">STATUS</th>
              <th className="pb-2.5 font-medium">SCORE</th>
              <th className="pb-2.5 font-medium">TRIGGERED RULE</th>
              <th className="pb-2.5 font-medium">LATENCY</th>
              <th className="pb-2.5 font-medium text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredFeed.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                  No transaction events matching current filter. Trigger an attack scenario above!
                </td>
              </tr>
            ) : (
              filteredFeed.map((tx) => {
                const dateStr = tx.timestamp
                  ? new Date(tx.timestamp).toLocaleTimeString([], { hour12: false })
                  : '--:--:--';

                return (
                  <tr
                    key={tx.transactionId || Math.random()}
                    className="hover:bg-slate-900/60 transition-colors group cursor-pointer"
                    onClick={() => onSelectTransaction(tx)}
                  >
                    <td className="py-2.5 text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-600" />
                      {dateStr}
                    </td>

                    <td className="py-2.5 font-semibold text-cyan-300">
                      {tx.transactionId}
                    </td>

                    <td className="py-2.5 text-slate-300">
                      {tx.accountId}
                    </td>

                    <td className="py-2.5 font-semibold text-slate-100">
                      ${Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-2.5">
                      {getStatusBadge(tx.status)}
                    </td>

                    <td className="py-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          tx.riskScore >= 80
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : tx.riskScore >= 40
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {tx.riskScore ?? 0}/100
                      </span>
                    </td>

                    <td className="py-2.5 text-slate-300 max-w-xs truncate" title={tx.triggeredRule}>
                      <div className="flex items-center gap-1.5">
                        {tx.shortCircuited && (
                          <span className="px-1 py-0.2 rounded text-[9px] bg-purple-950 text-purple-300 border border-purple-800 font-bold shrink-0">
                            FAST-EXIT
                          </span>
                        )}
                        <span className="truncate">{tx.triggeredRule || 'None (Clean)'}</span>
                      </div>
                    </td>

                    <td className="py-2.5 text-emerald-400 font-semibold whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        {Number(tx.evaluationLatencyMs || 0).toFixed(2)}ms
                      </span>
                    </td>

                    <td className="py-2.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransaction(tx);
                        }}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-700 text-[10px] font-mono inline-flex items-center gap-1 transition-all"
                      >
                        <Eye className="w-3 h-3" />
                        Audit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
