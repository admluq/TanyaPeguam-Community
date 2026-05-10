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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    // Profile basics
    slug: '',
    username: '',
    status: 'AVAILABLE',
    position: '',

    // Peguam (Lawyer Details)
    bio: '',

    // Firma (Firm Details)
    firmName: '',
    firmPhone: '',
    firmWebsite: '',
    firmAddress: '',
    googleMapsUrl: '',

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
          position: profile.position || '',
          bio: profile.bio || '',
          firmName: profile.firmName || '',
          firmPhone: profile.firmPhone || '',
          firmWebsite: profile.firmWebsite || '',
          firmAddress: profile.firmAddress || '',
          googleMapsUrl: profile.googleMapsUrl || '',
          socialFacebook: social.facebook || '',
          socialInstagram: social.instagram || '',
          socialTiktok: social.tiktok || '',
          socialLinkedin: social.linkedin || '',
          socialWhatsapp: social.whatsapp || '',
          isPublic: profile.isPublic || false,
        });

        // Set preview URL if profile has a slug
        if (profile.slug) {
          setPreviewUrl(`/${profile.slug}`);
        }
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
        position: form.position,
        bio: form.bio,
        firmName: form.firmName,
        firmPhone: form.firmPhone,
        firmWebsite: form.firmWebsite,
        firmAddress: form.firmAddress,
        googleMapsUrl: form.googleMapsUrl,
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
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cream mb-2">👤 Digital Card Setup</h1>
          <p className="text-cream/80">Configure your lawyer profile - this is what clients will see</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: PEGUAM */}
          <div className="card-base border border-purple/20 rounded-lg p-6">
            <h2 className="text-lg font-bold text-cream mb-4 flex items-center gap-2">
              👤 Peguam (Lawyer Details)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-cream mb-2">Profile Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. arif-azmi"
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-cream mb-2">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="e.g. arifazmi"
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-cream mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-semibold text-cream mb-2">Position / Title</label>
                <input
                  type="text"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  placeholder="e.g. Founder / Principal Lawyer"
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-cream mb-2">Professional Bio (100 words max)</label>
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
                className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
              />
              <p className="text-xs text-cream/50 mt-1">
                {form.bio.split(/\s+/).filter(Boolean).length} / 100 words
              </p>
            </div>
          </div>


          {/* SECTION 2: FIRMA */}
          <div className="card-base border border-purple/20 rounded-lg p-6">
            <h2 className="text-lg font-bold text-cream mb-4 flex items-center gap-2">
              🏢 Firma (Firm Details)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-cream mb-2">Nama Firma</label>
                <input
                  type="text"
                  value={form.firmName}
                  onChange={(e) => setForm({ ...form, firmName: e.target.value })}
                  placeholder="e.g. Arif Azmi & Co"
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream mb-2">Telefon Firma</label>
                <input
                  type="tel"
                  value={form.firmPhone}
                  onChange={(e) => setForm({ ...form, firmPhone: e.target.value })}
                  placeholder="+60312345678"
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream mb-2">Laman Web</label>
                <input
                  type="url"
                  value={form.firmWebsite}
                  onChange={(e) => setForm({ ...form, firmWebsite: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream mb-2">Google Maps URL</label>
                <input
                  type="url"
                  value={form.googleMapsUrl}
                  onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                />
              </div>
            </div>

            {/* Address */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-cream mb-2">Alamat Firma</label>
              <textarea
                value={form.firmAddress}
                onChange={(e) => setForm({ ...form, firmAddress: e.target.value })}
                placeholder="Full firm address..."
                rows={2}
                className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
              />
            </div>
          </div>

          {/* SECTION 3: SOCIAL MEDIA */}
          <div className="card-base border border-purple/20 rounded-lg p-6">
            <h2 className="text-lg font-bold text-cream mb-4 flex items-center gap-2">
              📱 Media Sosial Profesional (Professional Socials)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-cream mb-2">📘 Facebook URL</label>
                <input
                  type="url"
                  value={form.socialFacebook}
                  onChange={(e) => setForm({ ...form, socialFacebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream mb-2">📷 Instagram Handle</label>
                <input
                  type="text"
                  value={form.socialInstagram}
                  onChange={(e) => setForm({ ...form, socialInstagram: e.target.value })}
                  placeholder="@handle"
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream mb-2">🎵 TikTok Handle</label>
                <input
                  type="text"
                  value={form.socialTiktok}
                  onChange={(e) => setForm({ ...form, socialTiktok: e.target.value })}
                  placeholder="@handle"
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream mb-2">💼 LinkedIn URL</label>
                <input
                  type="url"
                  value={form.socialLinkedin}
                  onChange={(e) => setForm({ ...form, socialLinkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream mb-2">💬 WhatsApp Number</label>
                <input
                  type="tel"
                  value={form.socialWhatsapp}
                  onChange={(e) => setForm({ ...form, socialWhatsapp: e.target.value })}
                  placeholder="+60123456789"
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                />
              </div>
            </div>
          </div>

          {/* Public Toggle */}
          <div className="card-base border border-purple/20 rounded-lg p-6">
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                className="w-5 h-5 bg-ink-300 border border-purple/30 rounded"
              />
              <span className="font-semibold text-cream">Publish Digital Card to Directory</span>
            </label>
            <p className="text-sm text-cream/50 mb-4">
              When enabled, your profile will be visible in the public TanyaPeguam directory
            </p>

            {/* Preview Link */}
            {previewUrl && form.slug && (
              <div className="bg-ink-300 rounded-lg p-4">
                <p className="text-xs text-cream/50 mb-2">Your Digital Card Preview:</p>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm font-semibold break-all"
                >
                  {`${typeof window !== 'undefined' ? window.location.origin : ''}${previewUrl}`}
                </a>
              </div>
            )}
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

          {/* Step Indicator */}
          <div className="flex items-center justify-between py-4 px-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <span className="text-sm font-semibold text-cream">Step 1 of 5: Digital Card</span>
            <span className="text-xs text-cream/60">Create your lawyer profile & digital card</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-cream font-semibold py-3 px-6 rounded-lg transition"
            >
              {loading ? 'Saving...' : 'Save Digital Card'}
            </button>
            <Link href="/legal-service" className="flex-1">
              <button
                type="button"
                className="w-full bg-purple-600 hover:bg-purple-700 text-cream font-semibold py-3 px-6 rounded-lg transition"
              >
                Next: Step 2 - Legal Service →
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
