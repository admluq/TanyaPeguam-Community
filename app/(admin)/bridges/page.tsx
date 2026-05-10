'use client';

import Link from 'next/link';

export default function BridgesPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">
          ← Back to Admin
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Bridge Manager</h1>
        <p className="text-gray-300 mb-8">
          Manage your intake links and track engagement (Coming soon)
        </p>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center py-16">
          <div className="text-5xl mb-4">🔗</div>
          <h2 className="text-2xl font-bold text-white mb-2">Bridge Manager</h2>
          <p className="text-gray-400 mb-4">
            This feature is coming next after profile setup is complete.
          </p>
          <p className="text-sm text-gray-500">
            You'll be able to generate intake links, track clicks, and manage session contexts here.
          </p>
        </div>
      </div>
    </div>
  );
}
