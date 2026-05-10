'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ProfileSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    slug: '',
    firmName: '',
    bio: '',
    isPublic: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Load existing profile if any
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  async function fetchProfile() {
    try {
      const res = await fetch('/api/admin/profile');
      if (res.ok) {
        const data = await res.json();
        setForm({
          slug: data.profile.slug || '',
          firmName: data.profile.firmName || '',
          bio: data.profile.bio || '',
          isPublic: data.profile.isPublic || false,
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save profile');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Lawyer Profile Setup</h1>
          <p className="text-gray-300">Step 1 of 2: Configure your profile</p>
        </div>

        {/* Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Profile Slug <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="e.g. arif-azmi-law"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                URL-safe identifier, e.g. tanyapeguam.com/<span className="text-blue-400">{form.slug || 'your-slug'}</span>
              </p>
            </div>

            {/* Firm Name */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Firm Name
              </label>
              <input
                type="text"
                value={form.firmName}
                onChange={(e) => setForm({ ...form, firmName: e.target.value })}
                placeholder="e.g. Arif Azmi & Co"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Bio / About
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell clients about your expertise and experience..."
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Is Public */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={form.isPublic}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                className="w-4 h-4 bg-slate-700 border border-slate-600 rounded cursor-pointer"
              />
              <label htmlFor="isPublic" className="text-sm font-semibold text-white cursor-pointer">
                Public Profile (visible on TanyaPeguam directory)
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-lg">
                ✓ Profile saved successfully!
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
              <Link href="/admin/donna-config" className="flex-1">
                <button
                  type="button"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  Next: Donna Config →
                </button>
              </Link>
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">What happens next?</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>✓ Your profile slug becomes your unique identifier</li>
            <li>✓ Clients can find you via the TanyaPeguam directory</li>
            <li>✓ Next, configure Donna AI with your practice areas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
