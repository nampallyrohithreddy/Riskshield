import React, { useState, useRef } from "react";
import { api } from "../services/api";

const PAYMENT_SCRIPTS = {
  "Betting Platform Rush": {
    description: "Simulates a busy Saturday night on a sports betting site. Normal deposits, quick withdrawals, one carding attempt.",
    speed: 1200,
    transactions: [
      { accountId: "USR-JoeKowalski-4821", amount: 50.0, merchantId: "BetKing-Deposits", country: "US", city: "Chicago", deviceType: "MOBILE", ipAddress: "74.125.12.55" },
      { accountId: "USR-MariaLopez-7723", amount: 200.0, merchantId: "BetKing-Deposits", country: "US", city: "Miami", deviceType: "BROWSER", ipAddress: "104.28.11.22" },
      { accountId: "USR-RajPatel-1199", amount: 75.0, merchantId: "BetKing-Deposits", country: "IN", city: "Mumbai", deviceType: "MOBILE", ipAddress: "103.21.44.12" },
      { accountId: "USR-Carding-FAKE-001", amount: 5.0, merchantId: "BetKing-Deposits", country: "RU", city: "Moscow", deviceType: "EMULATOR", ipAddress: "185.220.101.5" },
      { accountId: "USR-TomHanson-9900", amount: 30.0, merchantId: "BetKing-Deposits", country: "US", city: "New York", deviceType: "BROWSER", ipAddress: "72.21.198.64" },
      { accountId: "USR-CamilleDumont-3344", amount: 100.0, merchantId: "BetKing-Deposits", country: "FR", city: "Paris", deviceType: "MOBILE", ipAddress: "82.65.33.11" },
      { accountId: "USR-MariaLopez-7723", amount: 350.0, merchantId: "BetKing-Withdraw", country: "NG", city: "Lagos", deviceType: "BROWSER", ipAddress: "196.12.55.88" },
      { accountId: "USR-SamirAhmed-5566", amount: 60.0, merchantId: "BetKing-Deposits", country: "AE", city: "Dubai", deviceType: "MOBILE", ipAddress: "77.88.22.9" },
      { accountId: "USR-JennyWu-2281", amount: 25.0, merchantId: "BetKing-Deposits", country: "SG", city: "Singapore", deviceType: "BROWSER", ipAddress: "116.28.14.77" },
      { accountId: "USR-Carding-FAKE-002", amount: 10.0, merchantId: "BetKing-Deposits", country: "CN", city: "Shenzhen", deviceType: "EMULATOR", ipAddress: "103.102.55.21" },
    ],
  },
  "Bonus Abuse Attack": {
    description: "A coordinated ring of accounts trying to claim signup bonuses multiple times rapidly.",
    speed: 600,
    transactions: [
      { accountId: "BONUS-ABUSE-ACC-01", amount: 10.0, merchantId: "Casino-Bonuses", country: "BR", city: "Sao Paulo", deviceType: "MOBILE", ipAddress: "177.53.12.4" },
      { accountId: "BONUS-ABUSE-ACC-02", amount: 10.0, merchantId: "Casino-Bonuses", country: "BR", city: "Sao Paulo", deviceType: "MOBILE", ipAddress: "177.53.12.5" },
      { accountId: "BONUS-ABUSE-ACC-03", amount: 10.0, merchantId: "Casino-Bonuses", country: "BR", city: "Sao Paulo", deviceType: "EMULATOR", ipAddress: "177.53.12.6" },
      { accountId: "BONUS-ABUSE-ACC-04", amount: 10.0, merchantId: "Casino-Bonuses", country: "BR", city: "Sao Paulo", deviceType: "EMULATOR", ipAddress: "177.53.12.7" },
      { accountId: "BONUS-ABUSE-ACC-05", amount: 10.0, merchantId: "Casino-Bonuses", country: "BR", city: "Sao Paulo", deviceType: "EMULATOR", ipAddress: "177.53.12.8" },
      { accountId: "BONUS-ABUSE-ACC-06", amount: 10.0, merchantId: "Casino-Bonuses", country: "BR", city: "Sao Paulo", deviceType: "MOBILE", ipAddress: "177.53.12.9" },
      { accountId: "BONUS-ABUSE-ACC-07", amount: 10.0, merchantId: "Casino-Bonuses", country: "BR", city: "Sao Paulo", deviceType: "EMULATOR", ipAddress: "177.53.12.10" },
      { accountId: "BONUS-ABUSE-ACC-08", amount: 10.0, merchantId: "Casino-Bonuses", country: "BR", city: "Sao Paulo", deviceType: "EMULATOR", ipAddress: "177.53.12.11" },
    ],
  },
  "High-Value VIP Withdrawals": {
    description: "VIP players cashing out big winnings. One impersonation attempt included.",
    speed: 2000,
    transactions: [
      { accountId: "VIP-GoldTier-Alexander", amount: 15000.0, merchantId: "Platinum-Cashout", country: "GB", city: "London", deviceType: "BROWSER", ipAddress: "81.108.55.12" },
      { accountId: "VIP-GoldTier-Yuki", amount: 22500.0, merchantId: "Platinum-Cashout", country: "JP", city: "Tokyo", deviceType: "BROWSER", ipAddress: "101.110.55.9" },
      { accountId: "VIP-Impersonator-FAKE", amount: 50000.0, merchantId: "Platinum-Cashout", country: "KP", city: "Pyongyang", deviceType: "EMULATOR", ipAddress: "175.45.176.3" },
      { accountId: "VIP-SilverTier-Marcus", amount: 8500.0, merchantId: "Platinum-Cashout", country: "DE", city: "Berlin", deviceType: "MOBILE", ipAddress: "91.198.174.55" },
      { accountId: "VIP-GoldTier-Fatima", amount: 11200.0, merchantId: "Platinum-Cashout", country: "SA", city: "Riyadh", deviceType: "BROWSER", ipAddress: "212.55.190.3" },
    ],
  },
  "Normal Shopping Day": {
    description: "Regular e-commerce payments. All should be approved. Good baseline test.",
    speed: 1500,
    transactions: [
      { accountId: "SHOPPER-Alice-3301", amount: 29.99, merchantId: "Amazon-US", country: "US", city: "Seattle", deviceType: "BROWSER", ipAddress: "54.88.12.3" },
      { accountId: "SHOPPER-Bob-7782", amount: 14.5, merchantId: "Netflix-Sub", country: "CA", city: "Toronto", deviceType: "MOBILE", ipAddress: "99.79.55.21" },
      { accountId: "SHOPPER-Chloe-9901", amount: 89.0, merchantId: "Zalando-DE", country: "DE", city: "Munich", deviceType: "BROWSER", ipAddress: "88.77.44.12" },
      { accountId: "SHOPPER-David-5544", amount: 5.99, merchantId: "Spotify-Sub", country: "AU", city: "Sydney", deviceType: "MOBILE", ipAddress: "103.22.55.9" },
      { accountId: "SHOPPER-Elena-2278", amount: 149.0, merchantId: "Apple-Store", country: "US", city: "San Francisco", deviceType: "MOBILE", ipAddress: "17.32.144.23" },
      { accountId: "SHOPPER-Faisal-8812", amount: 45.0, merchantId: "Noon-AE", country: "AE", city: "Dubai", deviceType: "BROWSER", ipAddress: "92.38.12.7" },
    ],
  },
};

function buildPayload(tx) {
  const txId = "SCRIPT-" + Math.random().toString(36).substring(2, 9).toUpperCase();
  return {
    transactionId: txId,
    accountId: tx.accountId,
    targetAccountId: tx.merchantId || "MERCHANT-UNKNOWN",
    amount: tx.amount,
    currency: "USD",
    merchantId: tx.merchantId,
    merchantCategory: "BETTING_GAMBLING",
    originCountry: tx.country,
    originCity: tx.city || "Unknown",
    deviceType: tx.deviceType || "BROWSER",
    ipAddress: tx.ipAddress || "0.0.0.0",
    userAgent: "ScriptRunner/1.0",
    sessionId: "SES-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
    timestamp: new Date().toISOString(),
  };
}

const STATUS_COLORS = {
  APPROVED: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  FLAGGED:  { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/30",   dot: "bg-amber-400" },
  REJECTED: { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/30",     dot: "bg-red-400" },
  PENDING:  { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/30",    dot: "bg-blue-400" },
  ERROR:    { bg: "bg-slate-500/10",   text: "text-slate-400",   border: "border-slate-500/30",   dot: "bg-slate-400" },
};

export default function PaymentScriptRunner({ onPaymentResult }) {
  const [selectedScript, setSelectedScript] = useState("Betting Platform Rush");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState([]);
  const [currentTx, setCurrentTx] = useState(null);
  const abortRef = useRef(false);
  const logEndRef = useRef(null);

  const script = PAYMENT_SCRIPTS[selectedScript];

  const runScript = async () => {
    abortRef.current = false;
    setIsRunning(true);
    setLog([]);
    setProgress(0);

    const txns = script.transactions;

    for (let i = 0; i < txns.length; i++) {
      if (abortRef.current) break;

      const tx = txns[i];
      const payload = buildPayload(tx);
      setCurrentTx({ ...tx, index: i });

      const pendingEntry = {
        index: i + 1, accountId: tx.accountId, amount: tx.amount,
        country: tx.country, device: tx.deviceType,
        status: "PENDING", reason: "Sending...", riskScore: null,
      };
      setLog((prev) => [...prev, pendingEntry]);

      try {
        const decision = await api.evaluate(payload);
        const done = {
          index: i + 1, accountId: tx.accountId, amount: tx.amount,
          country: tx.country, device: tx.deviceType,
          status: decision.status || "APPROVED",
          reason: decision.decisionReason || "-",
          riskScore: decision.riskScore ?? 0,
        };
        setLog((prev) => { const u = [...prev]; u[u.length - 1] = done; return u; });
        if (onPaymentResult) onPaymentResult(decision);
      } catch (err) {
        setLog((prev) => {
          const u = [...prev];
          u[u.length - 1] = { ...u[u.length - 1], status: "ERROR", reason: "Backend offline", riskScore: 0 };
          return u;
        });
      }

      setProgress(Math.round(((i + 1) / txns.length) * 100));
      if (i < txns.length - 1 && !abortRef.current) {
        await new Promise((r) => setTimeout(r, script.speed));
      }
    }

    setCurrentTx(null);
    setIsRunning(false);
  };

  const stopScript = () => { abortRef.current = true; setIsRunning(false); setCurrentTx(null); };

  const stats = log.reduce((a, e) => {
    if (e.status === "APPROVED") a.approved++;
    else if (e.status === "FLAGGED") a.flagged++;
    else if (e.status === "REJECTED") a.rejected++;
    return a;
  }, { approved: 0, flagged: 0, rejected: 0 });

  return (
    <div className="space-y-6 p-6 bg-[#0b0f1a] rounded-2xl border border-slate-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xl">🤖</div>
        <div>
          <h2 className="text-lg font-bold text-white">Payment Script Runner</h2>
          <p className="text-xs text-slate-400">Auto-fire realistic transaction sequences like a live betting platform</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(PAYMENT_SCRIPTS).map(([name, s]) => (
          <button key={name} onClick={() => !isRunning && setSelectedScript(name)} disabled={isRunning}
            className={`text-left p-4 rounded-xl border transition-all duration-200 ${selectedScript === name ? "border-violet-500/60 bg-violet-500/10" : "border-slate-700 bg-slate-800/50 hover:border-slate-600"} ${isRunning ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
            <div className="font-semibold text-sm text-white">{name}</div>
            <div className="text-xs text-slate-400 mt-1 leading-relaxed">{s.description}</div>
            <div className="mt-2 flex gap-2 text-xs text-slate-500">
              <span>⚡ {s.transactions.length} payments</span>
              <span>•</span>
              <span>⏱ {(s.speed / 1000).toFixed(1)}s delay</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {!isRunning ? (
          <button onClick={runScript}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all duration-200 shadow-lg shadow-violet-900/30">
            <span>▶</span><span>Run Script</span>
          </button>
        ) : (
          <button onClick={stopScript}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all duration-200">
            <span>⏹</span><span>Stop</span>
          </button>
        )}
        {isRunning && currentTx && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="inline-block w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            <span>Processing: <span className="text-violet-300 font-mono text-xs">{currentTx.accountId}</span></span>
          </div>
        )}
        {log.length > 0 && !isRunning && (
          <button onClick={() => { setLog([]); setProgress(0); }} className="ml-auto text-xs text-slate-500 hover:text-slate-300 transition-colors">Clear log</button>
        )}
      </div>

      {(isRunning || progress > 0) && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>{isRunning ? "Running..." : "Complete"}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.approved}</div>
            <div className="text-xs text-slate-400 mt-1">Approved</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.flagged}</div>
            <div className="text-xs text-slate-400 mt-1">Flagged</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
            <div className="text-xs text-slate-400 mt-1">Rejected</div>
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <div className="bg-slate-900/50 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-800">SCRIPT EXECUTION LOG</div>
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-xs font-mono">
              <thead className="bg-slate-900/70">
                <tr className="text-slate-500">
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Account</th>
                  <th className="px-3 py-2 text-left">Amount</th>
                  <th className="px-3 py-2 text-left">Country</th>
                  <th className="px-3 py-2 text-left">Device</th>
                  <th className="px-3 py-2 text-left">Risk</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                {log.map((entry, i) => {
                  const c = STATUS_COLORS[entry.status] || STATUS_COLORS.PENDING;
                  return (
                    <tr key={i} className="border-t border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-3 py-2 text-slate-500">{entry.index}</td>
                      <td className="px-3 py-2 text-slate-200 max-w-[140px] truncate" title={entry.accountId}>{entry.accountId}</td>
                      <td className="px-3 py-2 text-white font-bold">${entry.amount?.toFixed(2)}</td>
                      <td className="px-3 py-2 text-slate-300">{entry.country}</td>
                      <td className="px-3 py-2 text-slate-400">{entry.device}</td>
                      <td className="px-3 py-2">
                        {entry.riskScore !== null ? (
                          <span className={`font-bold ${entry.riskScore > 70 ? "text-red-400" : entry.riskScore > 40 ? "text-amber-400" : "text-emerald-400"}`}>{entry.riskScore}</span>
                        ) : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.bg} ${c.text} ${c.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${entry.status === "PENDING" ? "animate-pulse" : ""}`} />
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-400 max-w-[200px] truncate" title={entry.reason}>{entry.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}
