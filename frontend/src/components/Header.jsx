import React, { useState } from 'react';
import { Shield, Radio, Activity, Zap, Cpu, Server, Lock, Settings } from 'lucide-react';
import BackendConfigModal from './BackendConfigModal';

export default function Header({ connectionState, liveMetrics, autoTraffic, setAutoTraffic, onRefreshData }) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const getStatusBadge = () => {
    switch (connectionState) {
      case 'CONNECTED':
        return (
          <button
            onClick={() => setIsConfigOpen(true)}
            title="STOMP WebSocket Live - Click to view or change backend URL"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)] hover:border-emerald-400 transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>STOMP WEBSOCKET LIVE</span>
            <Settings className="w-3 h-3 opacity-60 ml-0.5" />
          </button>
        );
      case 'CONNECTING':
        return (
          <button
            onClick={() => setIsConfigOpen(true)}
            title="Connecting - Click to check backend URL"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-amber-950/80 text-amber-400 border border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>CONNECTING...</span>
            <Settings className="w-3 h-3 opacity-60 ml-0.5" />
          </button>
        );
      default:
        return (
          <button
            onClick={() => setIsConfigOpen(true)}
            title="Click to enter Render backend URL and connect"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-red-950/80 text-red-400 border border-red-500/40 hover:bg-red-900/40 hover:border-red-400 transition-all cursor-pointer group"
          >
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>DISCONNECTED (CLICK TO CONNECT)</span>
            <Settings className="w-3 h-3 opacity-80 group-hover:rotate-45 transition-transform ml-0.5" />
          </button>
        );
    }
  };

  return (
    <>
      <header className="border-b border-slate-800 bg-[#0a0f1d]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#080c14] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  RISK<span className="text-cyan-400">SHIELD</span>
                </h1>
                <span className="px-1.5 py-0.5 text-[10px] font-mono tracking-wider bg-cyan-950/90 text-cyan-300 border border-cyan-800 rounded">
                  SOC v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
                <span>Short-Circuit Fraud Gateway</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> &lt;100ms SLA
                </span>
              </p>
            </div>
          </div>

          {/* Center: System Telemetry Badges */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs font-mono text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Chain of Responsibility:</span>
              <span className="text-cyan-300 font-semibold">5 Rules</span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs font-mono text-slate-300">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Redis Rate Limiter:</span>
              <span className="text-indigo-300 font-semibold">20 req/s (Burst 50)</span>
            </div>
          </div>

          {/* Right: Controls & Connection Status */}
          <div className="flex items-center gap-3">
            {/* Continuous Traffic Generator Toggle */}
            <button
              id="btn-auto-traffic"
              onClick={() => setAutoTraffic(!autoTraffic)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-2 transition-all border ${
                autoTraffic
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
              title="Toggle autonomous simulated traffic stream"
            >
              <Activity className={`w-3.5 h-3.5 ${autoTraffic ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{autoTraffic ? 'STREAM: ON' : 'STREAM: OFF'}</span>
            </button>

            {getStatusBadge()}
          </div>
        </div>
      </header>

      <BackendConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConnected={onRefreshData}
      />
    </>
  );
}
