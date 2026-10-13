import React, { useState } from 'react';
import { ShoppingBag, CreditCard, ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function CustomerStoreCheckout({ onProcessPayment, isProcessing }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  const [formData, setFormData] = useState({
    accountId: 'ACC-MYWALLET-01',
    amount: '4.50',
    itemName: 'Espresso Coffee',
    location: 'US-NewYork',
  });

  const sampleProducts = [
    {
      id: 'coffee',
      name: 'Espresso Coffee',
      price: '4.50',
      icon: '☕',
      accountId: 'ACC-REGULAR-USER',
      desc: 'Small normal payment',
      expected: 'APPROVED (Green)',
      badgeClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    },
    {
      id: 'laptop',
      name: 'MacBook Pro 16"',
      price: '2499.00',
      icon: '💻',
      accountId: 'ACC-TECH-BUYER',
      desc: 'Typical electronics purchase',
      expected: 'APPROVED (Green)',
      badgeClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    },
    {
      id: 'luxury',
      name: 'Rolex Submariner Watch',
      price: '18500.00',
      icon: '💎',
      accountId: 'ACC-VIP-SPENDER',
      desc: 'Over $10,000 threshold!',
      expected: 'FLAGGED (Yellow)',
      badgeClass: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    },
    {
      id: 'stolen',
      name: 'Crypto Gift Cards',
      price: '4500.00',
      icon: '⚠️',
      accountId: 'ACC-FRAUD-999',
      desc: 'Uses blacklisted criminal account',
      expected: 'BLOCKED (Red)',
      badgeClass: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
    },
  ];

  const handleSelectProduct = (product) => {
    setSelectedProduct(product.id);
    setFormData({
      accountId: product.accountId,
      amount: product.price,
      itemName: product.name,
      location: 'US-NewYork',
    });
    setPaymentResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaymentResult(null);

    const txPayload = {
      accountId: formData.accountId || 'ACC-SHOPPER',
      amount: parseFloat(formData.amount) || 0.0,
      currency: 'USD',
      location: formData.location || 'US-NewYork',
      deviceFingerprint: 'Customer-Checkout-WebClient',
      merchantCategory: 'RETAIL',
    };

    const res = await onProcessPayment(txPayload);
    if (res) {
      setPaymentResult(res);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-xl mb-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide">
              CUSTOMER PAYMENT CHECKOUT (LIVE DEMO STORE)
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Pretend You are the Shopper
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Pick an item or enter your own amount, click "Pay Now", and watch RiskShield decide in real-time!
            </p>
          </div>
        </div>
      </div>

      {/* 4 Sample Products to Click */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {sampleProducts.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleSelectProduct(p)}
            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
              selectedProduct === p.id
                ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-400/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{p.icon}</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${p.badgeClass}`}>
                  {p.expected}
                </span>
              </div>
              <div className="font-bold text-sm text-white">{p.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{p.desc}</div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">Price:</span>
              <span className="text-sm font-mono font-extrabold text-cyan-300">${p.price}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Checkout Form */}
      <form onSubmit={handleSubmit} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Your Account / Card ID
            </label>
            <input
              type="text"
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
              placeholder="e.g. ACC-JOHN-DOE"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Payment Amount ($ USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
              placeholder="e.g. 50.00"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Location City
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
              placeholder="e.g. US-NewYork"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 font-mono">
            Total to charge: <span className="text-white font-bold text-sm">${parseFloat(formData.amount || 0).toFixed(2)} USD</span>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all font-mono"
          >
            <CreditCard className="w-4 h-4" />
            {isProcessing ? 'Processing with RiskShield...' : 'Pay Now & Test Safety'}
          </button>
        </div>
      </form>

      {/* Immediate Real-Time Feedback Banner */}
      {paymentResult && (
        <div className="mt-4 p-4 rounded-xl border animate-fadeIn">
          {paymentResult.status === 'APPROVED' && (
            <div className="flex items-start gap-3 bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-xl text-emerald-300">
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  ✅ PAYMENT APPROVED! (Safe Customer)
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-900 border border-emerald-700">
                    TX: {paymentResult.transactionId}
                  </span>
                </h4>
                <p className="text-xs text-slate-200 mt-1">
                  Passed all 5 fraud security checks in <span className="font-bold text-emerald-400">{paymentResult.evaluationLatencyMs}ms</span>. Money was approved to transfer!
                </p>
                <div className="mt-2 text-[11px] font-mono text-emerald-400/90 font-semibold">
                  ↓ Added to the Threat Table below!
                </div>
              </div>
            </div>
          )}

          {paymentResult.status === 'FLAGGED' && (
            <div className="flex items-start gap-3 bg-amber-950/80 border border-amber-500/50 p-4 rounded-xl text-amber-300">
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                  ⚠️ PAYMENT FLAGGED FOR REVIEW!
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-900 border border-amber-700">
                    TX: {paymentResult.transactionId}
                  </span>
                </h4>
                <p className="text-xs text-slate-200 mt-1">
                  Reason: {paymentResult.decisionReason || 'Transaction amount exceeds standard limit.'}
                </p>
                <p className="text-xs text-amber-300 mt-1">
                  In a real store, the customer would now see an <b>SMS OTP screen</b> to confirm their identity.
                </p>
                <div className="mt-2 text-[11px] font-mono text-amber-400/90 font-semibold">
                  ↓ Added to the Threat Table below!
                </div>
              </div>
            </div>
          )}

          {paymentResult.status === 'REJECTED' && (
            <div className="flex items-start gap-3 bg-rose-950/80 border border-rose-500/50 p-4 rounded-xl text-rose-300">
              <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-rose-400 flex items-center gap-2">
                  🚫 PAYMENT BLOCKED &amp; REJECTED! (Fraud Prevented)
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-900 border border-rose-700">
                    TX: {paymentResult.transactionId}
                  </span>
                </h4>
                <p className="text-xs text-slate-200 mt-1">
                  Reason: {paymentResult.decisionReason || 'Account is flagged on global sanctions watchlist.'}
                </p>
                <p className="text-xs text-rose-300 mt-1">
                  The credit card was <b>NOT charged</b>. RiskShield short-circuited and saved the merchant from fraud in <b>{paymentResult.evaluationLatencyMs}ms</b>!
                </p>
                <div className="mt-2 text-[11px] font-mono text-rose-400/90 font-semibold">
                  ↓ Added to the Threat Table below!
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
