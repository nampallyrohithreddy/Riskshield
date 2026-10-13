import React, { useState, useEffect } from 'react';
import { Server, CheckCircle2, AlertCircle, X, ExternalLink, RefreshCw } from 'lucide-react';
import { getBackendUrl, setBackendUrl, api } from '../services/api';
import wsService from '../services/websocket';

export default function BackendConfigModal({ isOpen, onClose, onConnected }) {
  const [url, setUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null); // { ok: boolean, message: string }

  useEffect(() => {
    if (isOpen) {
      setUrl(getBackendUrl());
      setStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e) => {
    e.preventDefault();
    setTesting(true);
    setStatus(null);

    const cleanUrl = url.trim().replace(/\/+$/, '');

    try {
      // Test the endpoint
      const testEndpoint = cleanUrl ? `${cleanUrl}/api/v1/transactions/health` : '/api/v1/transactions/health';
      const res = await fetch(testEndpoint);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      
      // Save and reconnect
      setBackendUrl(cleanUrl);
      wsService.disconnect();
      wsService.connect();
      if (onConnected) onConnected();

      setStatus({
        ok: true,
        message: `Successfully connected! Gateway: ${data.gateway || 'RiskShield v1.0'}`,
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setStatus({
        ok: false,
        message: `Could not connect to backend: ${err.message}. Ensure your Render backend is running and URL is correct.`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleReset = () => {
    setBackendUrl('');
    setUrl('');
    wsService.disconnect();
    wsService.connect();
    if (onConnected) onConnected();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b1120] border border-cyan-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-cyan-950/50">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Backend Connection Settings</h2>
              <p className="text-xs text-slate-400">Connect frontend to your Render backend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleTestAndSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              Backend Service URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://riskshield-backend.onrender.com"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Paste the public URL from your <span className="text-cyan-400">Render Dashboard</span> (e.g. <code className="text-slate-300">https://your-app.onrender.com</code>).
            </p>
          </div>

          {status && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                status.ok
                  ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/30 text-rose-300'
              }`}
            >
              {status.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{status.message}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              Reset to Relative /
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={testing}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-950/40 flex items-center gap-1.5 disabled:opacity-50"
              >
                {testing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{testing ? 'Testing...' : 'Save & Connect'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
