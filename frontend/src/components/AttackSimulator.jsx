import React, { useState } from 'react';
import { Flame, Zap, ShieldAlert, DollarSign, Globe2, Smartphone, CheckCircle, Send, Terminal } from 'lucide-react';

export default function AttackSimulator({ onSimulate, onCustomSubmit, isSimulating }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customTx, setCustomTx] = useState({
    accountId: 'ACC-CUSTOM-001',
    targetAccountId: '',
    amount: '125.00',
    currency: 'USD',
    ipAddress: '192.168.1.100',
    location: 'US-NewYork',
    deviceFingerprint: 'Chrome/124.0 Windows-11',
    merchantCategory: 'RETAIL',
  });

  const attackScenarios = [
    {
      id: 'velocity-burst',
      name: 'Velocity Burst Attack',
      icon: Zap,
      accent: 'border-purple-500/40 text-purple-400 hover:bg-purple-950/40',
      tag: 'REDIS SLIDING-WINDOW',
      desc: 'Burst of 5+ rapid transactions inside 60s window triggering Redis rate breach.',
      expected: 'REJECTED (Short-Circuit)',
    },
    {
      id: 'blacklist-hit',
      name: 'Sanctioned Entity Hit',
      icon: ShieldAlert,
      accent: 'border-red-500/40 text-red-400 hover:bg-red-950/40',
      tag: 'OFAC / FINCEN LIST',
      desc: 'Known bad actor account ACC-FRAUD-999 mapped to darknet wallet address.',
      expected: 'REJECTED (<1ms Short-Circuit)',
    },
    {
      id: 'high-amount',
      name: 'High-Value Spike',
      icon: DollarSign,
      accent: 'border-amber-500/40 text-amber-400 hover:bg-amber-950/40',
      tag: '> $10,000 THRESHOLD',
      desc: 'Single transaction exceeding threshold requiring Step-Up verification.',
      expected: 'FLAGGED (Manual Review)',
    },
    {
      id: 'geo-anomaly',
      name: 'Impossible Travel Jump',
      icon: Globe2,
      accent: 'border-blue-500/40 text-blue-400 hover:bg-blue-950/40',
      tag: 'GEO-VELOCITY ANOMALY',
      desc: 'Transaction in US followed immediately by transaction in RU within seconds.',
      expected: 'FLAGGED (Location Jump)',
    },
    {
      id: 'device-tamper',
      name: 'Rooted / Emulator Device',
      icon: Smartphone,
      accent: 'border-rose-500/40 text-rose-400 hover:bg-rose-950/40',
      tag: 'FINGERPRINT TAMPER',
      desc: 'Transaction executed on QEMU virtual machine / Magisk rooted environment.',
      expected: 'FLAGGED (Device Risk)',
    },
    {
      id: 'normal',
      name: 'Legitimate Consumer',
      icon: CheckCircle,
      accent: 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/40',
      tag: 'BASELINE CLEAN',
      desc: 'Standard low-risk retail purchase matching normal velocity and geography.',
      expected: 'APPROVED (Score 0)',
    },
  ];

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    onCustomSubmit({
      ...customTx,
      amount: parseFloat(customTx.amount) || 0.0,
    });
  };

  return (
    <div className="glass-panel p-4 rounded-xl mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              ATTACK SIMULATOR &amp; INGRESS GATEWAY
              <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">
                POST /api/v1/transactions/simulate
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Trigger instant synthetic attack vectors to validate rules engine short-circuits &amp; latencies
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCustom(!showCustom)}
          className="text-xs font-mono text-slate-300 hover:text-cyan-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Terminal className="w-3.5 h-3.5" />
          {showCustom ? 'Hide Custom Ingress' : 'Custom JSON Ingress'}
        </button>
      </div>

      {/* Preset Scenario Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5">
        {attackScenarios.map((sc) => {
          const Icon = sc.icon;
          return (
            <button
              key={sc.id}
              disabled={isSimulating}
              onClick={() => onSimulate(sc.id)}
              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all bg-slate-900/60 hover:scale-[1.02] active:scale-[0.98] ${sc.accent} ${
                isSimulating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className="w-4 h-4" />
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-slate-800">
                    {sc.tag}
                  </span>
                </div>
                <div className="font-semibold text-xs text-slate-100 mb-1">{sc.name}</div>
                <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {sc.desc}
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500">Exp:</span>
                <span className="font-semibold text-slate-300">{sc.expected}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Transaction Ingress Form */}
      {showCustom && (
        <form onSubmit={handleCustomSubmit} className="mt-4 pt-4 border-t border-slate-800 bg-slate-950/70 p-4 rounded-lg">
          <div className="text-xs font-mono text-cyan-400 mb-3 flex items-center gap-2">
            <span>&gt; MANUAL TRANSACTION DISPATCH FORM:</span>
            <span className="text-slate-500 text-[11px]">Submits directly to /api/v1/transactions/evaluate</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Account ID</label>
              <input
                type="text"
                value={customTx.accountId}
                onChange={(e) => setCustomTx({ ...customTx, accountId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Amount ($ USD)</label>
              <input
                type="number"
                step="0.01"
                value={customTx.amount}
                onChange={(e) => setCustomTx({ ...customTx, amount: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Location Tag</label>
              <input
                type="text"
                value={customTx.location}
                onChange={(e) => setCustomTx({ ...customTx, location: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Device Fingerprint</label>
              <input
                type="text"
                value={customTx.deviceFingerprint}
                onChange={(e) => setCustomTx({ ...customTx, deviceFingerprint: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={isSimulating}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono rounded font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              Evaluate Custom Transaction
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
