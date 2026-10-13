import React from 'react';
import { GitCommit, ArrowRight, ShieldAlert, Zap, Globe2, Smartphone, DollarSign, CheckCircle2 } from 'lucide-react';

export default function RuleChainVisualizer({ latestDecision }) {
  const rules = [
    {
      order: 1,
      name: 'Blacklist Screening',
      fullTitle: 'Sanctions & Blacklist Screening',
      icon: ShieldAlert,
      type: 'REJECT',
      shortCircuit: true,
      color: 'border-red-500 text-red-400',
      activeColor: 'bg-red-950/80 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]',
    },
    {
      order: 2,
      name: 'Velocity Breach',
      fullTitle: 'Sliding-Window Velocity & Burst Rate',
      icon: Zap,
      type: 'REJECT',
      shortCircuit: true,
      color: 'border-purple-500 text-purple-400',
      activeColor: 'bg-purple-950/80 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]',
    },
    {
      order: 3,
      name: 'Geo Impossible Travel',
      fullTitle: 'Geo-Velocity & Impossible Travel Anomaly',
      icon: Globe2,
      type: 'FLAG',
      shortCircuit: false,
      color: 'border-blue-500 text-blue-400',
      activeColor: 'bg-blue-950/80 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    },
    {
      order: 4,
      name: 'Device Tampering',
      fullTitle: 'Device Integrity & Root/Emulator Detection',
      icon: Smartphone,
      type: 'FLAG',
      shortCircuit: false,
      color: 'border-rose-500 text-rose-400',
      activeColor: 'bg-rose-950/80 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]',
    },
    {
      order: 5,
      name: 'High Amount (> $10k)',
      fullTitle: 'High-Value Transaction Threshold',
      icon: DollarSign,
      type: 'FLAG',
      shortCircuit: false,
      color: 'border-amber-500 text-amber-400',
      activeColor: 'bg-amber-950/80 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    },
  ];

  const triggeredRule = latestDecision?.triggeredRule;
  const isApproved = latestDecision?.status === 'APPROVED';

  return (
    <div className="glass-panel p-4 rounded-xl mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            CHAIN OF RESPONSIBILITY PIPELINE (&lt;100ms)
          </h3>
        </div>
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Instant REJECT (Order 1-2)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Cumulative FLAGGED (Order 3-5)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 relative">
        {rules.map((rule, idx) => {
          const Icon = rule.icon;
          const isTriggered = triggeredRule === rule.fullTitle;
          const wasBypassed =
            latestDecision?.shortCircuited &&
            rules.findIndex((r) => r.fullTitle === triggeredRule) < idx &&
            rules.findIndex((r) => r.fullTitle === triggeredRule) !== -1;

          return (
            <div
              key={rule.order}
              className={`p-3 rounded-lg border transition-all duration-300 relative flex flex-col justify-between ${
                isTriggered
                  ? rule.activeColor
                  : wasBypassed
                  ? 'border-slate-800 bg-slate-950/40 opacity-40'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono">
                      {rule.order}
                    </span>
                    <Icon className={`w-3.5 h-3.5 ${isTriggered ? 'text-white' : rule.color.split(' ')[1]}`} />
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      rule.type === 'REJECT'
                        ? 'bg-red-950/80 text-red-300 border border-red-800'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {rule.shortCircuit ? 'SHORT-CIRCUIT' : 'EVAL'}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200">{rule.name}</div>
              </div>

              <div className="mt-2 text-[10px] font-mono pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-500">Action:</span>
                <span
                  className={
                    isTriggered
                      ? 'text-white font-bold animate-pulse'
                      : wasBypassed
                      ? 'text-slate-600 line-through'
                      : 'text-slate-400'
                  }
                >
                  {isTriggered ? `TRIGGERED` : wasBypassed ? 'BYPASSED' : rule.type}
                </span>
              </div>
            </div>
          );
        })}

        {/* Final Legitimate Approval State */}
        <div
          className={`p-3 rounded-lg border transition-all duration-300 flex flex-col justify-between ${
            isApproved
              ? 'bg-emerald-950/80 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
              : 'border-slate-800 bg-slate-900/50 opacity-60'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono">
                ✓
              </span>
              <CheckCircle2 className={`w-3.5 h-3.5 ${isApproved ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                FINAL
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-200">Safe Pass</div>
          </div>
          <div className="mt-2 text-[10px] font-mono pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-500">Status:</span>
            <span className={isApproved ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {isApproved ? 'APPROVED' : 'WAITING'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
