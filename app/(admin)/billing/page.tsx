'use client';

import Link from 'next/link';

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/bridges" className="text-green-400 hover:text-green-300 inline-block">
              ← Back to Bridges
            </Link>
            <div className="flex items-center gap-2 text-sm text-cream/50">
              <span>Setup Complete</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-cream mb-2">💳 Billing & Subscription</h1>
          <p className="text-cream/80">Manage your subscription plan</p>
        </div>

        {/* Form */}
        <div className="card-base border border-purple/20 rounded-lg p-8">
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💳</div>
            <h2 className="text-2xl font-bold text-cream mb-2">Freemium Model (v2)</h2>
            <p className="text-cream/50 mb-4">
              Billing and subscription management is planned for v2.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Current plan: <span className="text-purple-400 font-semibold">Free (Unlimited v1)</span>
            </p>

            <div className="bg-ink-300 rounded-lg p-4 text-left inline-block mb-8">
              <p className="text-sm text-cream/80 mb-3 font-semibold">v2 Plans (Planned):</p>
              <ul className="text-xs text-cream/50 space-y-1">
                <li>✓ Free: Limited intake queries</li>
                <li>✓ Pro: Unlimited + Advanced analytics</li>
                <li>✓ Enterprise: Custom integration</li>
              </ul>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={() => window.location.href = '/bridges'}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-cream font-semibold py-3 px-6 rounded-lg transition"
            >
              ← Back to Bridges
            </button>
            <Link href="/profile" className="flex-1">
              <button
                type="button"
                className="w-full bg-purple-600 hover:bg-purple-700 text-cream font-semibold py-3 px-6 rounded-lg transition"
              >
                View Digital Card →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
