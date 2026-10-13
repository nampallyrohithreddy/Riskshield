import React from 'react';
import {
  X,
  Shield,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Cpu,
  MapPin,
  Laptop,
  CreditCard,
  Hash,
} from 'lucide-react';

export default function TransactionDetailModal({ transaction, onClose }) {
  if (!transaction) return null;

  const {
    transactionId,
    accountId,
    targetAccountId,
    amount,
    currency = 'USD',
    status,
    riskScore = 0,
    shortCircuited,
    triggeredRule,
    decisionReason,
    evaluationLatencyMs = 0,
    timestamp,
    location,
    ipAddress,
    deviceFingerprint,
    merchantCategory,
    ruleResults = [],
  } = transaction;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b1222] border border-cyan-500/30 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col font-mono">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#0b1222]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  TRANSACTION FORENSIC AUDIT
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {transactionId}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Evaluation Timestamp: {new Date(timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Top Banner: Status & Risk Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Decision Status */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
              <span className="text-[11px] text-slate-400">FINAL DECISION</span>
              <div className="mt-2 flex items-center gap-2">
                {status === 'APPROVED' && (
                  <span className="px-3 py-1 rounded-lg text-sm font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> APPROVED
                  </span>
                )}
                {status === 'FLAGGED' && (
                  <span className="px-3 py-1 rounded-lg text-sm font-bold bg-amber-950/80 text-amber-400 border border-amber-500/40 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> FLAGGED (REVIEW)
                  </span>
                )}
                {status === 'REJECTED' && (
                  <span className="px-3 py-1 rounded-lg text-sm font-bold bg-rose-950/80 text-rose-400 border border-rose-500/40 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> REJECTED (DROPPED)
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                {status === 'APPROVED'
                  ? 'Zero policy breaches detected.'
                  : status === 'FLAGGED'
                  ? 'Transferred to SOC analyst queue.'
                  : 'Automated block invoked.'}
              </p>
            </div>

            {/* Risk Score */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
              <span className="text-[11px] text-slate-400">CALCULATED RISK SCORE</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={`text-3xl font-extrabold ${
                    riskScore >= 80
                      ? 'text-rose-400'
                      : riskScore >= 40
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {riskScore}
                </span>
                <span className="text-xs text-slate-500">/ 100 max</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    riskScore >= 80
                      ? 'bg-rose-500'
                      : riskScore >= 40
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
                ></div>
              </div>
            </div>

            {/* Evaluation SLA Latency */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
              <span className="text-[11px] text-slate-400">ENGINE LATENCY</span>
              <div className="mt-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-2xl font-bold text-white">
                  {Number(evaluationLatencyMs).toFixed(2)}
                  <span className="text-xs font-normal text-slate-400 ml-1">ms</span>
                </span>
              </div>
              <div className="text-[10px] font-mono mt-2">
                {shortCircuited ? (
                  <span className="text-purple-400 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    Short-circuit saved ~40ms
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Full chain validated
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Triggered Rule Reason Box */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
              <span>Decision Reason:</span>
              <span className="text-cyan-400 font-normal">[{triggeredRule || 'None'}]</span>
            </div>
            <p className="text-slate-200 text-xs leading-relaxed">
              {decisionReason || 'Transaction successfully cleared all 5 compliance and fraud checks.'}
            </p>
          </div>

          {/* Transaction Metadata Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
              TRANSACTION METADATA
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">SOURCE ACCOUNT</span>
                <span className="text-slate-200 font-semibold">{accountId}</span>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">AMOUNT / CURRENCY</span>
                <span className="text-cyan-300 font-semibold">
                  ${Number(amount).toFixed(2)} {currency}
                </span>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">DESTINATION ACCOUNT</span>
                <span className="text-slate-300">{targetAccountId || 'N/A (Merchant)'}</span>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">MERCHANT CATEGORY</span>
                <span className="text-slate-300">{merchantCategory || 'ECOMMERCE'}</span>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">LOCATION</span>
                <span className="text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" /> {location || 'US-East'}
                </span>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">IP ADDRESS</span>
                <span className="text-slate-300">{ipAddress || '127.0.0.1'}</span>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800 col-span-2">
                <span className="text-[10px] text-slate-500 block">DEVICE FINGERPRINT</span>
                <span className="text-slate-300 truncate block">
                  {deviceFingerprint || 'Clean Web Client'}
                </span>
              </div>
            </div>
          </div>

          {/* Rule Execution Audit Trail Table */}
          {ruleResults && ruleResults.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                RULE EXECUTION AUDIT TRAIL (CHAIN OF RESPONSIBILITY)
              </h4>
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-2">RULE NAME</th>
                      <th className="p-2">OUTCOME</th>
                      <th className="p-2">SCORE</th>
                      <th className="p-2">LATENCY</th>
                      <th className="p-2">DIAGNOSTIC DETAILS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/40 text-[11px]">
                    {ruleResults.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-900/80">
                        <td className="p-2 font-medium text-slate-200">
                          {r.ruleName}
                        </td>
                        <td className="p-2">
                          {r.passed ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> PASS
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center gap-1 font-semibold">
                              <XCircle className="w-3 h-3" /> TRIGGERED
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-slate-300">
                          +{r.scoreContribution || 0}
                        </td>
                        <td className="p-2 text-cyan-400 font-semibold">
                          {r.latencyMs != null ? Number(r.latencyMs).toFixed(2) + 'ms' : '< 1ms'}
                        </td>
                        <td className="p-2 text-slate-400 max-w-xs truncate">
                          {r.details || (r.passed ? 'Rule conditions satisfied without flags' : 'Policy breach')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Close Audit Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
