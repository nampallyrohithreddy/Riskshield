export function getBackendUrl() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const custom = window.localStorage.getItem('riskshield_backend_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  return '';
}

export function setBackendUrl(url) {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (url && url.trim()) {
      window.localStorage.setItem('riskshield_backend_url', url.trim().replace(/\/+$/, ''));
    } else {
      window.localStorage.removeItem('riskshield_backend_url');
    }
  }
}

function getApiBase() {
  const base = getBackendUrl();
  return base ? `${base}/api/v1/transactions` : '/api/v1/transactions';
}

export const api = {
  async evaluate(transactionData) {
    const res = await fetch(`${getApiBase()}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return await res.json();
  },

  async getRecent(limit = 25) {
    const res = await fetch(`${getApiBase()}/recent?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return await res.json();
  },

  async getMetrics() {
    const res = await fetch(`${getApiBase()}/metrics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return await res.json();
  },

  async simulate(scenario = 'normal') {
    const res = await fetch(`${getApiBase()}/simulate?scenario=${encodeURIComponent(scenario)}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return await res.json();
  },

  async getHealth() {
    const res = await fetch(`${getApiBase()}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return await res.json();
  },
};

// Realistic mock generator for instant offline testing or zero-latency preview
export function generateMockTransaction(scenario = 'normal') {
  const timestamp = new Date().toISOString();
  const txId = 'TX-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  switch (scenario) {
    case 'velocity-burst':
      return {
        transactionId: txId,
        accountId: 'ACC-BURST-' + Math.floor(Math.random() * 5),
        amount: 145.0,
        currency: 'USD',
        status: 'REJECTED',
        riskScore: 92,
        shortCircuited: true,
        triggeredRule: 'Sliding-Window Velocity & Burst Rate',
        decisionReason: 'Rapid burst detected: exceeded 4 tx/min threshold (8 tx in window)',
        evaluationLatencyMs: +(1.2 + Math.random() * 2.5).toFixed(2),
        timestamp,
        ruleResults: [
          { ruleName: 'Sanctions & Blacklist Screening', passed: true, scoreContribution: 0, latencyMs: 0.2 },
          { ruleName: 'Sliding-Window Velocity & Burst Rate', passed: false, scoreContribution: 92, latencyMs: 1.1, shortCircuitTriggered: true, details: 'Account ACC-BURST-2 exceeded velocity limit' },
        ],
      };

    case 'blacklist-hit':
      return {
        transactionId: txId,
        accountId: 'ACC-FRAUD-999',
        targetAccountId: 'ACC-DARKNET-404',
        amount: 4500.0,
        currency: 'USD',
        status: 'REJECTED',
        riskScore: 100,
        shortCircuited: true,
        triggeredRule: 'Sanctions & Blacklist Screening',
        decisionReason: 'Entity is flagged in global OFAC/FinCEN sanctions blacklist',
        evaluationLatencyMs: +(0.4 + Math.random() * 0.8).toFixed(2),
        timestamp,
        ruleResults: [
          { ruleName: 'Sanctions & Blacklist Screening', passed: false, scoreContribution: 100, latencyMs: 0.4, shortCircuitTriggered: true, details: 'Matched designated high-risk blacklist database' },
        ],
      };

    case 'high-amount':
      return {
        transactionId: txId,
        accountId: 'ACC-VIP-' + Math.floor(Math.random() * 800),
        amount: +(15000 + Math.random() * 40000).toFixed(2),
        currency: 'USD',
        status: 'FLAGGED',
        riskScore: 78,
        shortCircuited: false,
        triggeredRule: 'High-Value Transaction Threshold',
        decisionReason: 'Transfer exceeds $10,000 threshold without prior KYC elevation',
        evaluationLatencyMs: +(4.2 + Math.random() * 5.0).toFixed(2),
        timestamp,
        ruleResults: [
          { ruleName: 'Sanctions & Blacklist Screening', passed: true, scoreContribution: 0, latencyMs: 0.3 },
          { ruleName: 'Sliding-Window Velocity & Burst Rate', passed: true, scoreContribution: 0, latencyMs: 1.0 },
          { ruleName: 'Geo-Velocity & Impossible Travel Anomaly', passed: true, scoreContribution: 0, latencyMs: 0.9 },
          { ruleName: 'High-Value Transaction Threshold', passed: false, scoreContribution: 45, latencyMs: 0.6, details: 'Amount $24,500.00 exceeds threshold' },
          { ruleName: 'Device Integrity & Root/Emulator Detection', passed: true, scoreContribution: 0, latencyMs: 0.8 },
        ],
      };

    case 'geo-anomaly':
      return {
        transactionId: txId,
        accountId: 'ACC-TRAVEL-' + Math.floor(Math.random() * 30),
        amount: +(350 + Math.random() * 800).toFixed(2),
        currency: 'USD',
        status: 'FLAGGED',
        riskScore: 65,
        shortCircuited: false,
        triggeredRule: 'Geo-Velocity & Impossible Travel Anomaly',
        decisionReason: 'Physical location jump from US-Chicago to RU-Moscow within 4 minutes',
        evaluationLatencyMs: +(3.8 + Math.random() * 4.2).toFixed(2),
        timestamp,
        ruleResults: [
          { ruleName: 'Sanctions & Blacklist Screening', passed: true, scoreContribution: 0, latencyMs: 0.3 },
          { ruleName: 'Sliding-Window Velocity & Burst Rate', passed: true, scoreContribution: 0, latencyMs: 1.1 },
          { ruleName: 'Geo-Velocity & Impossible Travel Anomaly', passed: false, scoreContribution: 40, latencyMs: 1.2, details: 'Impossible velocity between geographic coordinates' },
          { ruleName: 'High-Value Transaction Threshold', passed: true, scoreContribution: 0, latencyMs: 0.4 },
          { ruleName: 'Device Integrity & Root/Emulator Detection', passed: true, scoreContribution: 0, latencyMs: 0.7 },
        ],
      };

    case 'device-tamper':
      return {
        transactionId: txId,
        accountId: 'ACC-USER-' + Math.floor(Math.random() * 900),
        amount: +(120 + Math.random() * 300).toFixed(2),
        currency: 'USD',
        status: 'FLAGGED',
        riskScore: 60,
        shortCircuited: false,
        triggeredRule: 'Device Integrity & Root/Emulator Detection',
        decisionReason: 'Device fingerprint indicates rooted emulator environment (QEMU/Magisk)',
        evaluationLatencyMs: +(2.5 + Math.random() * 3.5).toFixed(2),
        timestamp,
        ruleResults: [
          { ruleName: 'Sanctions & Blacklist Screening', passed: true, scoreContribution: 0, latencyMs: 0.2 },
          { ruleName: 'Sliding-Window Velocity & Burst Rate', passed: true, scoreContribution: 0, latencyMs: 0.8 },
          { ruleName: 'Geo-Velocity & Impossible Travel Anomaly', passed: true, scoreContribution: 0, latencyMs: 0.7 },
          { ruleName: 'High-Value Transaction Threshold', passed: true, scoreContribution: 0, latencyMs: 0.3 },
          { ruleName: 'Device Integrity & Root/Emulator Detection', passed: false, scoreContribution: 35, latencyMs: 0.5, details: 'Known emulator signatures detected' },
        ],
      };

    case 'normal':
    default:
      return {
        transactionId: txId,
        accountId: 'ACC-LEGIT-' + Math.floor(1000 + Math.random() * 9000),
        amount: +(15 + Math.random() * 180).toFixed(2),
        currency: 'USD',
        status: 'APPROVED',
        riskScore: 0,
        shortCircuited: false,
        triggeredRule: 'None',
        decisionReason: 'Passed all 5 real-time fraud rules with clean biometric & velocity score',
        evaluationLatencyMs: +(2.1 + Math.random() * 3.2).toFixed(2),
        timestamp,
        ruleResults: [
          { ruleName: 'Sanctions & Blacklist Screening', passed: true, scoreContribution: 0, latencyMs: 0.2 },
          { ruleName: 'Sliding-Window Velocity & Burst Rate', passed: true, scoreContribution: 0, latencyMs: 0.7 },
          { ruleName: 'Geo-Velocity & Impossible Travel Anomaly', passed: true, scoreContribution: 0, latencyMs: 0.6 },
          { ruleName: 'High-Value Transaction Threshold', passed: true, scoreContribution: 0, latencyMs: 0.3 },
          { ruleName: 'Device Integrity & Root/Emulator Detection', passed: true, scoreContribution: 0, latencyMs: 0.4 },
        ],
      };
  }
}
