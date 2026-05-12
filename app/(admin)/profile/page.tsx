'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import LawyerAvatar from '@/components/LawyerAvatar';
import SetupProgress from '@/components/SetupProgress';

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Resize image to max 240px and return base64 JPEG
  function resizeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX = 240;
          let { width, height } = img;
          if (width > height) {
            if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
          } else {
            if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas unavailable'));
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    setAvatarUploading(true);
    setError(null);
    try {
      const b64 = await resizeImage(file);
      setAvatarUrl(b64);
    } catch {
      setError('Failed to process image. Please try a different file.');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleUseGooglePhoto() {
    const googleImg = session?.user?.image ?? null;
    if (googleImg) setAvatarUrl(googleImg);
  }

  function handleRemoveAvatar() {
    setAvatarUrl(null);
  }

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

        if (profile.avatarUrl) setAvatarUrl(profile.avatarUrl);

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
        avatarUrl: avatarUrl ?? null,
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
        {/* Onboarding progress — auto-hides when all steps done */}
        <SetupProgress />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cream mb-2">Digital Card Setup</h1>
          <p className="text-cream/80">Configure your lawyer profile - this is what clients will see</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* SECTION 0: PROFILE PICTURE */}
          <div className="card-base border border-purple/20 rounded-lg p-6">
            <h2 className="text-lg font-bold text-cream mb-1">Profile Picture</h2>
            <p className="text-xs text-cream/50 mb-5">Displayed on your Digital Card, Directory, and Bridge link.</p>

            <div className="flex items-center gap-6">
              {/* Current avatar preview */}
              <LawyerAvatar
                avatarUrl={avatarUrl}
                googleImage={session?.user?.image}
                name={form.username || session?.user?.name || 'P'}
                size={80}
                className="rounded-2xl ring-2 ring-purple-500/30"
              />

              <div className="flex flex-col gap-2">
                {/* Upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="px-4 py-2 rounded-lg bg-purple-500 text-ink-500 text-sm font-semibold hover:bg-purple-400 disabled:opacity-50 transition"
                >
                  {avatarUploading ? 'Processing…' : 'Upload Photo'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />

                {/* Use Google photo */}
                {session?.user?.image && !avatarUrl?.startsWith('data:') && (
                  <button
                    type="button"
                    onClick={handleUseGooglePhoto}
                    className="px-4 py-2 rounded-lg bg-ink-300/40 text-cream/70 text-sm hover:bg-ink-300/60 transition border border-white/10"
                  >
                    Use Google Photo
                  </button>
                )}

                {/* Remove */}
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-xs text-red-400 hover:text-red-300 transition text-left"
                  >
                    Remove photo
                  </button>
                )}

                <p className="text-[11px] text-cream/35 mt-1">Max 5 MB · JPG, PNG, WebP · Auto-resized to 240px</p>
              </div>
            </div>
          </div>

          {/* SECTION 1: PEGUAM */}
          <div className="card-base border border-purple/20 rounded-lg p-6">
            <h2 className="text-lg font-bold text-cream mb-4">
              Lawyer Details
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
            <h2 className="text-lg font-bold text-cream mb-4">
              Firm Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-cream mb-2">Firm Name</label>
                <input
                  type="text"
                  value={form.firmName}
                  onChange={(e) => setForm({ ...form, firmName: e.target.value })}
                  placeholder="e.g. Arif Azmi & Co"
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream mb-2">Firm Phone</label>
                <input
                  type="tel"
                  value={form.firmPhone}
                  onChange={(e) => setForm({ ...form, firmPhone: e.target.value })}
                  placeholder="+60312345678"
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream mb-2">Website</label>
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
              <label className="block text-sm font-semibold text-cream mb-2">Firm Address</label>
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
            <h2 className="text-lg font-bold text-cream mb-4">
              Professional Socials
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-cream mb-2">Facebook URL</label>
                <input
                  type="url"
                  value={form.socialFacebook}
                  onChange={(e) => setForm({ ...form, socialFacebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream mb-2">Instagram Handle</label>
                <input
                  type="text"
                  value={form.socialInstagram}
                  onChange={(e) => setForm({ ...form, socialInstagram: e.target.value })}
                  placeholder="@handle"
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream mb-2">TikTok Handle</label>
                <input
                  type="text"
                  value={form.socialTiktok}
                  onChange={(e) => setForm({ ...form, socialTiktok: e.target.value })}
                  placeholder="@handle"
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  value={form.socialLinkedin}
                  onChange={(e) => setForm({ ...form, socialLinkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream mb-2">WhatsApp Number</label>
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
