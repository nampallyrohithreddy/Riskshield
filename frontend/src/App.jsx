import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import TelemetryStats from './components/TelemetryStats';
import AttackSimulator from './components/AttackSimulator';
import RuleChainVisualizer from './components/RuleChainVisualizer';
import MetricsCharts from './components/MetricsCharts';
import ThreatFeed from './components/ThreatFeed';
import TransactionDetailModal from './components/TransactionDetailModal';
import wsService from './services/websocket';
import { api, generateMockTransaction } from './services/api';

import CustomerStoreCheckout from './components/CustomerStoreCheckout';
import PaymentScriptRunner from './components/PaymentScriptRunner';


export default function App() {
  const [activeTab, setActiveTab] = useState('store'); // 'store' or 'simulator'
  const [connectionState, setConnectionState] = useState('DISCONNECTED');
  const [feed, setFeed] = useState([]);
  const [metrics, setMetrics] = useState({
    totalEvaluations: 0,
    approvedCount: 0,
    flaggedCount: 0,
    rejectedCount: 0,
    averageLatencyMs: 0.0,
    shortCircuitedCount: 0,
    fraudRatePercentage: 0.0,
    currentTps: 0.0,
  });
  const [latencyHistory, setLatencyHistory] = useState([]);
  const [latestDecision, setLatestDecision] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [autoTraffic, setAutoTraffic] = useState(false);

  const autoTrafficTimer = useRef(null);

  // 1. Initialize WebSocket & fetch baseline on mount
  useEffect(() => {
    // Subscribe to STOMP WebSocket status
    const unsubStatus = wsService.onStatusChange((st) => setConnectionState(st));

    // Threat feed listener (real-time evaluated transactions)
    const unsubFeed = wsService.onThreatFeed((decision) => {
      handleIncomingDecision(decision);
    });

    // Metrics listener
    const unsubMetrics = wsService.onMetrics((incomingMetrics) => {
      setMetrics(incomingMetrics);
    });

    // Initiate connection
    wsService.connect();

    // Fetch initial data via REST
    loadInitialData();

    return () => {
      unsubStatus();
      unsubFeed();
      unsubMetrics();
      wsService.disconnect();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const [recentTx, liveMetrics] = await Promise.all([
        api.getRecent(20),
        api.getMetrics(),
      ]);
      if (recentTx && recentTx.length > 0) {
        setFeed(recentTx);
        const history = recentTx.slice(-15).map((t, idx) => ({
          time: new Date(t.timestamp).toLocaleTimeString([], { hour12: false, second: '2-digit' }),
          latency: Number(t.evaluationLatencyMs || 2.5),
          txId: t.transactionId,
          status: t.status,
        }));
        setLatencyHistory(history);
        setLatestDecision(recentTx[0]);
      }
      if (liveMetrics) {
        setMetrics(liveMetrics);
      }
    } catch (err) {
      console.warn('Backend not currently reachable via REST, seeding local interactive mock preview:', err.message);
      // Seed with initial baseline mock data so the dashboard is immediately vivid and interactive
      seedInitialMockData();
    }
  };

  const seedInitialMockData = () => {
    const seeds = [
      generateMockTransaction('normal'),
      generateMockTransaction('normal'),
      generateMockTransaction('high-amount'),
      generateMockTransaction('velocity-burst'),
      generateMockTransaction('normal'),
    ];
    setFeed(seeds);
    setLatestDecision(seeds[0]);
    recomputeLocalMetrics(seeds);
  };

  const recomputeLocalMetrics = (currentFeed) => {
    const total = currentFeed.length;
    const approved = currentFeed.filter((t) => t.status === 'APPROVED').length;
    const flagged = currentFeed.filter((t) => t.status === 'FLAGGED').length;
    const rejected = currentFeed.filter((t) => t.status === 'REJECTED').length;
    const shortCircuited = currentFeed.filter((t) => t.shortCircuited).length;
    const avgLatency =
      total > 0
        ? currentFeed.reduce((acc, t) => acc + (t.evaluationLatencyMs || 0), 0) / total
        : 0;

    setMetrics({
      totalEvaluations: total,
      approvedCount: approved,
      flaggedCount: flagged,
      rejectedCount: rejected,
      shortCircuitedCount: shortCircuited,
      averageLatencyMs: Number(avgLatency.toFixed(2)),
      fraudRatePercentage: total > 0 ? Number(((rejected / total) * 100).toFixed(1)) : 0.0,
      currentTps: +(1.2 + Math.random() * 2.5).toFixed(1),
    });

    const history = currentFeed.slice(0, 20).reverse().map((t) => ({
      time: new Date(t.timestamp).toLocaleTimeString([], { hour12: false, second: '2-digit' }),
      latency: Number(t.evaluationLatencyMs || 2.5),
      txId: t.transactionId,
      status: t.status,
    }));
    setLatencyHistory(history);
  };

  const handleIncomingDecision = (decision) => {
    setLatestDecision(decision);
    setFeed((prev) => [decision, ...prev.slice(0, 99)]);

    setLatencyHistory((prev) => {
      const entry = {
        time: new Date(decision.timestamp || Date.now()).toLocaleTimeString([], { hour12: false, second: '2-digit' }),
        latency: Number(decision.evaluationLatencyMs || 0),
        txId: decision.transactionId,
        status: decision.status,
      };
      return [...prev.slice(-19), entry];
    });
  };

  // 2. Trigger Simulation Scenario
  const handleSimulate = async (scenario) => {
    setIsSimulating(true);
    try {
      const decision = await api.simulate(scenario);
      handleIncomingDecision(decision);
      // Refresh live metrics
      try {
        const updatedMetrics = await api.getMetrics();
        setMetrics(updatedMetrics);
      } catch (ignored) {}
    } catch (err) {
      console.warn('Backend simulate error, fallback to client mock generator:', err.message);
      const mock = generateMockTransaction(scenario);
      handleIncomingDecision(mock);
    } finally {
      setIsSimulating(false);
    }
  };

  // 3. Custom Transaction Submission
  const handleCustomSubmit = async (customTx) => {
    setIsSimulating(true);
    let result = null;
    try {
      const decision = await api.evaluate(customTx);
      handleIncomingDecision(decision);
      result = decision;
      try {
        const updatedMetrics = await api.getMetrics();
        setMetrics(updatedMetrics);
      } catch (ignored) {}
    } catch (err) {
      console.warn('Backend evaluate error, fallback to simulated response:', err.message);
      const isBlacklist = customTx.accountId === 'ACC-FRAUD-999';
      const isHighAmount = customTx.amount > 10000;
      const mock = {
        ...generateMockTransaction(isBlacklist ? 'blacklist-hit' : isHighAmount ? 'high-amount' : 'normal'),
        ...customTx,
        status: isBlacklist ? 'REJECTED' : isHighAmount ? 'FLAGGED' : 'APPROVED',
        triggeredRule: isBlacklist
          ? 'Sanctions & Blacklist Screening'
          : isHighAmount
          ? 'High-Value Transaction Threshold'
          : 'None',
        decisionReason: isBlacklist
          ? 'Account is flagged on global sanctions watchlist.'
          : isHighAmount
          ? 'Transaction amount exceeds standard limit ($10,000).'
          : 'All fraud policies evaluated clean. Transaction approved.',
        riskScore: isBlacklist ? 100 : isHighAmount ? 60 : 0,
      };
      handleIncomingDecision(mock);
      result = mock;
    } finally {
      setIsSimulating(false);
    }
    return result;
  };

  // 4. Continuous Auto-Traffic Stream
  useEffect(() => {
    if (autoTraffic) {
      const scenarios = [
        'normal',
        'normal',
        'normal',
        'high-amount',
        'velocity-burst',
        'geo-anomaly',
        'device-tamper',
        'normal',
      ];
      autoTrafficTimer.current = setInterval(() => {
        const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        handleSimulate(randomScenario);
      }, 1500);
    } else {
      if (autoTrafficTimer.current) {
        clearInterval(autoTrafficTimer.current);
      }
    }
    return () => {
      if (autoTrafficTimer.current) {
        clearInterval(autoTrafficTimer.current);
      }
    };
  }, [autoTraffic]);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation & Status Bar */}
      <Header
        connectionState={connectionState}
        liveMetrics={metrics}
        autoTraffic={autoTraffic}
        setAutoTraffic={setAutoTraffic}
      />

      {/* Main SOC Dashboard Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Telemetry Stats */}
        <TelemetryStats metrics={metrics} />

        {/* View Mode Switcher Tabs */}
        <div className="flex items-center gap-3 mb-6 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 w-fit flex-wrap">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'store'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🛍️</span>
            <span>CUSTOMER CHECKOUT</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'script'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🤖</span>
            <span>SCRIPT RUNNER (AUTO PAYMENTS)</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'simulator'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🛡️</span>
            <span>SECURITY GUARD</span>
          </button>
        </div>

        {/* Active Tab View */}
        {activeTab === 'store' ? (
          <>
            <CustomerStoreCheckout
              onProcessPayment={handleCustomSubmit}
              isProcessing={isSimulating}
            />
            <MetricsCharts latencyHistory={latencyHistory} metrics={metrics} feed={feed} />
            <ThreatFeed feed={feed} onSelectTransaction={setSelectedTransaction} onClearFeed={() => setFeed([])} />
          </>
        ) : activeTab === 'script' ? (
          <>
            <PaymentScriptRunner onPaymentResult={handleIncomingDecision} />
            <MetricsCharts latencyHistory={latencyHistory} metrics={metrics} feed={feed} />
            <ThreatFeed feed={feed} onSelectTransaction={setSelectedTransaction} onClearFeed={() => setFeed([])} />
          </>
        ) : (
          <>
            <AttackSimulator
              onSimulate={handleSimulate}
              onCustomSubmit={handleCustomSubmit}
              isSimulating={isSimulating}
            />
            <RuleChainVisualizer latestDecision={latestDecision} />
            <MetricsCharts latencyHistory={latencyHistory} metrics={metrics} feed={feed} />
            <ThreatFeed feed={feed} onSelectTransaction={setSelectedTransaction} onClearFeed={() => setFeed([])} />
          </>
        )}
      </main>

      {/* Forensic Inspection Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#060910] py-4 text-center text-xs font-mono text-slate-500">
        RiskShield FinTech Gateway &bull; Spring Boot 3 &bull; Redis Sliding Window &bull; PostgreSQL Audit &bull; STOMP WebSocket
      </footer>
    </div>
  );
}
