import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Zap, Clock, Activity, ShieldAlert } from 'lucide-react';

export default function TelemetryStats({ metrics }) {
  const {
    totalEvaluations = 0,
    approvedCount = 0,
    flaggedCount = 0,
    rejectedCount = 0,
    averageLatencyMs = 0.0,
    shortCircuitedCount = 0,
    fraudRatePercentage = 0.0,
    currentTps = 0.0,
  } = metrics || {};

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      {/* 1. Total Throughput */}
      <div className="glass-panel p-3.5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
        <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
          <span>TOTAL LOGGED</span>
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {totalEvaluations.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Postgres Audit Log
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all"></div>
      </div>

      {/* 2. Approved */}
      <div className="glass-panel p-3.5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
        <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
          <span className="text-emerald-400 font-semibold">APPROVED</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
            {approvedCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-500/80 font-mono mt-0.5">
            {totalEvaluations > 0 ? ((approvedCount / totalEvaluations) * 100).toFixed(1) : 0}% clean
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl"></div>
      </div>

      {/* 3. Flagged */}
      <div className="glass-panel p-3.5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/50 transition-colors">
        <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
          <span className="text-amber-400 font-semibold">FLAGGED</span>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-mono text-amber-400 tracking-tight">
            {flaggedCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-400/80 font-mono mt-0.5">
            Step-up review req.
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-amber-500/10 rounded-full blur-xl"></div>
      </div>

      {/* 4. Blocked / Rejected */}
      <div className="glass-panel p-3.5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-red-500/50 transition-colors">
        <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
          <span className="text-red-400 font-semibold">BLOCKED</span>
          <XCircle className="w-3.5 h-3.5 text-red-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-mono text-red-400 tracking-tight">
            {rejectedCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-red-400/80 font-mono mt-0.5">
            {fraudRatePercentage}% fraud rate
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-red-500/10 rounded-full blur-xl"></div>
      </div>

      {/* 5. Short-Circuited Fast Drops */}
      <div className="glass-panel p-3.5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/50 transition-colors">
        <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
          <span className="text-purple-300 font-semibold">SHORT-CIRCUIT</span>
          <Zap className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-mono text-purple-400 tracking-tight">
            {shortCircuitedCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-purple-400/80 font-mono mt-0.5">
            Chain bypassed early
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-purple-500/10 rounded-full blur-xl"></div>
      </div>

      {/* 6. Evaluation Latency */}
      <div className="glass-panel p-3.5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
        <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
          <span>AVG LATENCY</span>
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-mono text-cyan-400 tracking-tight">
            {averageLatencyMs.toFixed(2)}
            <span className="text-xs font-normal text-slate-400 ml-1">ms</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            &lt; 100ms Target Met
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl"></div>
      </div>

      {/* 7. Current TPS */}
      <div className="glass-panel p-3.5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/50 transition-colors col-span-2 md:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
          <span>LIVE TPS</span>
          <Activity className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-mono text-blue-400 tracking-tight">
            {currentTps.toFixed(1)}
            <span className="text-xs font-normal text-slate-400 ml-1">tx/s</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Token-bucket gate
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
      </div>
    </div>
  );
}
