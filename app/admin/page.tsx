'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">TanyaPeguam Admin</h1>
            <p className="text-gray-300">Donna AI Orchestration & Lawyer Portal</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Sign Out
          </button>
        </div>

        {/* User Info */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
          <p className="text-gray-300 mb-1">Signed in as</p>
          <p className="text-xl font-semibold text-white">{session.user?.email}</p>
          {(session.user as any)?.profileSlug && (
            <p className="text-sm text-gray-400 mt-2">
              Profile: <span className="text-blue-400">{(session.user as any).profileSlug}</span>
            </p>
          )}
        </div>

        {/* Setup Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1: Profile Setup */}
          <Link href="/admin/profile">
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700 rounded-lg p-8 cursor-pointer hover:border-blue-500 transition h-full flex flex-col justify-between">
              <div>
                <div className="text-4xl font-bold text-blue-300 mb-2">1</div>
                <h2 className="text-2xl font-bold text-white mb-3">Lawyer Profile</h2>
                <p className="text-blue-100 mb-4">
                  Set up your lawyer profile, firm name, bio, and social links.
                </p>
              </div>
              <div className="flex items-center text-blue-300 font-semibold">
                Configure Profile →
              </div>
            </div>
          </Link>

          {/* Step 2: Donna Config */}
          <Link href="/admin/donna-config">
            <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-700 rounded-lg p-8 cursor-pointer hover:border-purple-500 transition h-full flex flex-col justify-between">
              <div>
                <div className="text-4xl font-bold text-purple-300 mb-2">2</div>
                <h2 className="text-2xl font-bold text-white mb-3">Donna AI Config</h2>
                <p className="text-purple-100 mb-4">
                  Configure AI personality, knowledge base, and triage rules.
                </p>
              </div>
              <div className="flex items-center text-purple-300 font-semibold">
                Configure Donna →
              </div>
            </div>
          </Link>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Setup Guide</h3>
          <ol className="space-y-2 text-gray-300">
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">1.</span>
              <span>Create your lawyer profile with firm details</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">2.</span>
              <span>Configure Donna AI with your practice areas and triage rules</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 font-bold">3.</span>
              <span>Deploy intake widget to your Facebook Group</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
