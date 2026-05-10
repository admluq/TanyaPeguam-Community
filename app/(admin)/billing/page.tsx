'use client';

import Link from 'next/link';

export default function BillingPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">
          ← Back to Admin
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
        <p className="text-gray-300 mb-8">
          Manage your subscription plan (Coming in v2)
        </p>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center py-16">
          <div className="text-5xl mb-4">💳</div>
          <h2 className="text-2xl font-bold text-white mb-2">Freemium Model (v2)</h2>
          <p className="text-gray-400 mb-4">
            Billing and subscription management is planned for v2.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Current plan: <span className="text-blue-400 font-semibold">Free (Unlimited v1)</span>
          </p>

          <div className="bg-slate-700 rounded-lg p-4 text-left inline-block">
            <p className="text-sm text-gray-300 mb-3 font-semibold">v2 Plans (Planned):</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>✓ Free: Limited intake queries</li>
              <li>✓ Pro: Unlimited + Advanced analytics</li>
              <li>✓ Enterprise: Custom integration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
