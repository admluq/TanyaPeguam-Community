'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'BUSY', label: 'Busy' },
  { value: 'AWAY', label: 'Away' },
  { value: 'OFFLINE', label: 'Offline' },
];

export default function ProfileSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    // Profile basics
    slug: '',
    username: '',
    status: 'AVAILABLE',

    // Peguam (Lawyer Details)
    phone: '',
    bio: '',

    // Firma (Firm Details)
    firmName: '',
    firmPhone: '',
    firmWebsite: '',
    firmAddress: '',
    googleMapsUrl: '',
    googleReviewUrl: '',

    // Social Links
    socialFacebook: '',
    socialInstagram: '',
    socialTiktok: '',
    socialLinkedin: '',
    socialWhatsapp: '',

    isPublic: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  async function fetchProfile() {
    try {
      const res = await fetch('/api/admin/profile');
      if (res.ok) {
        const data = await res.json();
        const profile = data.profile;
        const social = profile.socialLinks || {};

        setForm({
          slug: profile.slug || '',
          username: profile.username || '',
          status: profile.status || 'AVAILABLE',
          phone: profile.phone || '',
          bio: profile.bio || '',
          firmName: profile.firmName || '',
          firmPhone: profile.firmPhone || '',
          firmWebsite: profile.firmWebsite || '',
          firmAddress: profile.firmAddress || '',
          googleMapsUrl: profile.googleMapsUrl || '',
          googleReviewUrl: profile.googleReviewUrl || '',
          socialFacebook: social.facebook || '',
          socialInstagram: social.instagram || '',
          socialTiktok: social.tiktok || '',
          socialLinkedin: social.linkedin || '',
          socialWhatsapp: social.whatsapp || '',
          isPublic: profile.isPublic || false,
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
      const payload = {
        slug: form.slug,
        username: form.username,
        status: form.status,
        phone: form.phone,
        bio: form.bio,
        firmName: form.firmName,
        firmPhone: form.firmPhone,
        firmWebsite: form.firmWebsite,
        firmAddress: form.firmAddress,
        googleMapsUrl: form.googleMapsUrl,
        googleReviewUrl: form.googleReviewUrl,
        socialLinks: {
          facebook: form.socialFacebook,
          instagram: form.socialInstagram,
          tiktok: form.socialTiktok,
          linkedin: form.socialLinkedin,
          whatsapp: form.socialWhatsapp,
        },
        isPublic: form.isPublic,
      };

      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Digital Card Setup</h1>
          <p className="text-gray-300">Configure your comprehensive lawyer profile for the directory</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: PEGUAM */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              👤 Peguam (Lawyer Details)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Profile Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. arif-azmi"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="e.g. arifazmi"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Phone (WhatsApp)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+60123456789"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-white mb-2">Professional Bio (100 words max)</label>
              <textarea
                value={form.bio}
                onChange={(e) => {
                  const words = e.target.value.split(/\s+/).length;
                  if (words <= 100) {
                    setForm({ ...form, bio: e.target.value });
                  }
                }}
                placeholder="Tell clients about your expertise..."
                rows={3}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.bio.split(/\s+/).filter(Boolean).length} / 100 words
              </p>
            </div>
          </div>

          {/* SECTION 2: FIRMA */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              🏢 Firma (Firm Details)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Nama Firma</label>
                <input
                  type="text"
                  value={form.firmName}
                  onChange={(e) => setForm({ ...form, firmName: e.target.value })}
                  placeholder="e.g. Arif Azmi & Co"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Telefon Firma</label>
                <input
                  type="tel"
                  value={form.firmPhone}
                  onChange={(e) => setForm({ ...form, firmPhone: e.target.value })}
                  placeholder="+60312345678"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Laman Web</label>
                <input
                  type="url"
                  value={form.firmWebsite}
                  onChange={(e) => setForm({ ...form, firmWebsite: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Google Maps URL</label>
                <input
                  type="url"
                  value={form.googleMapsUrl}
                  onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Google Review URL</label>
                <input
                  type="url"
                  value={form.googleReviewUrl}
                  onChange={(e) => setForm({ ...form, googleReviewUrl: e.target.value })}
                  placeholder="https://www.google.com/maps/place/..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            {/* Address */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-white mb-2">Alamat Firma</label>
              <textarea
                value={form.firmAddress}
                onChange={(e) => setForm({ ...form, firmAddress: e.target.value })}
                placeholder="Full firm address..."
                rows={2}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>

          {/* SECTION 3: SOCIAL MEDIA */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              📱 Media Sosial Profesional (Professional Socials)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">📘 Facebook URL</label>
                <input
                  type="url"
                  value={form.socialFacebook}
                  onChange={(e) => setForm({ ...form, socialFacebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">📷 Instagram Handle</label>
                <input
                  type="text"
                  value={form.socialInstagram}
                  onChange={(e) => setForm({ ...form, socialInstagram: e.target.value })}
                  placeholder="@handle"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">🎵 TikTok Handle</label>
                <input
                  type="text"
                  value={form.socialTiktok}
                  onChange={(e) => setForm({ ...form, socialTiktok: e.target.value })}
                  placeholder="@handle"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">💼 LinkedIn URL</label>
                <input
                  type="url"
                  value={form.socialLinkedin}
                  onChange={(e) => setForm({ ...form, socialLinkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">💬 WhatsApp Number</label>
                <input
                  type="tel"
                  value={form.socialWhatsapp}
                  onChange={(e) => setForm({ ...form, socialWhatsapp: e.target.value })}
                  placeholder="+60123456789"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Public Toggle */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                className="w-5 h-5 bg-slate-700 border border-slate-600 rounded"
              />
              <span className="font-semibold text-white">Publish Digital Card to Directory</span>
            </label>
            <p className="text-sm text-gray-400 mt-2">
              When enabled, your profile will be visible in the public TanyaPeguam directory
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-lg">
              ✓ Digital Card saved successfully!
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              {loading ? 'Saving...' : 'Save Digital Card'}
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
    </div>
  );
}
