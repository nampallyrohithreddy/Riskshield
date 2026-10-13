import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Activity, PieChart as PieIcon, BarChart3 } from 'lucide-react';

const STATUS_COLORS = {
  APPROVED: '#10b981',
  FLAGGED: '#f59e0b',
  REJECTED: '#ef4444',
};

export default function MetricsCharts({ latencyHistory = [], metrics = {}, feed = [] }) {
  // Compute decision breakdown
  const pieData = [
    { name: 'Approved', value: metrics.approvedCount || 0, color: STATUS_COLORS.APPROVED },
    { name: 'Flagged', value: metrics.flaggedCount || 0, color: STATUS_COLORS.FLAGGED },
    { name: 'Blocked', value: metrics.rejectedCount || 0, color: STATUS_COLORS.REJECTED },
  ].filter((item) => item.value > 0);

  // Compute rule distribution from recent transactions
  const ruleCounts = feed.reduce((acc, tx) => {
    const rule = tx.triggeredRule || 'Clean';
    acc[rule] = (acc[rule] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(ruleCounts)
    .map(([name, count]) => ({
      name: name.length > 18 ? name.substring(0, 16) + '...' : name,
      fullName: name,
      count,
    }))
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      {/* 1. Real-time Sub-100ms Latency Chart */}
      <div className="glass-panel p-4 rounded-xl flex flex-col justify-between col-span-1 lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              EVALUATION LATENCY TIMELINE (ms)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-0.5 bg-emerald-400"></span> Actual Latency
            </span>
            <span className="text-rose-400/80 flex items-center gap-1">
              <span className="w-2 h-0.5 bg-rose-400 border-dashed"></span> 100ms SLA Ceiling
            </span>
          </div>
        </div>

        <div className="h-48 w-full">
          {latencyHistory.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
              Awaiting transaction telemetry stream...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  fontFamily="JetBrains Mono"
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  domain={[0, (dataMax) => Math.max(15, Math.ceil(dataMax * 1.3))]}
                  fontFamily="JetBrains Mono"
                  unit="ms"
                />
                <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-xl font-mono text-xs">
                          <p className="text-cyan-400 font-bold">{data.txId || 'Transaction'}</p>
                          <p className="text-slate-300">Latency: <span className="text-white font-bold">{data.latency}ms</span></p>
                          <p className="text-slate-400 text-[10px]">Status: {data.status}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="latency"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#latencyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Decision Distribution Donut */}
      <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">DECISION BREAKDOWN</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Audit Ratio</span>
        </div>

        <div className="h-48 w-full flex items-center justify-center relative">
          {pieData.length === 0 ? (
            <div className="text-xs font-mono text-slate-500">No data collected yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-2 rounded text-xs font-mono">
                            <span style={{ color: payload[0].payload.color }}>
                              {payload[0].name}: {payload[0].value}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center pointer-events-none">
                <div className="text-xl font-bold font-mono text-white">
                  {metrics.totalEvaluations || 0}
                </div>
                <div className="text-[9px] font-mono text-slate-500">TOTAL TX</div>
              </div>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800 text-[10px] font-mono text-center">
          <div>
            <span className="text-emerald-400 font-bold">{metrics.approvedCount || 0}</span>
            <p className="text-slate-500">Apprv</p>
          </div>
          <div>
            <span className="text-amber-400 font-bold">{metrics.flaggedCount || 0}</span>
            <p className="text-slate-500">Flag</p>
          </div>
          <div>
            <span className="text-red-400 font-bold">{metrics.rejectedCount || 0}</span>
            <p className="text-slate-500">Block</p>
          </div>
        </div>
      </div>
    </div>
  );
}
