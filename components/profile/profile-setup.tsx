'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Building, Briefcase, Save, Loader2 } from 'lucide-react';

interface LinkItem {
  type: string;
  label: string;
  subtitle?: string;
  url?: string;
  displayOrder: number;
  isActive: boolean;
}

type Profile = {
  id?: string;
  name?: string;
  title?: string;
  firm?: string;
  firmFull?: string;
  monogram?: string;
  location?: string;
  status?: 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';
  practiceAreas?: string[];
  bio?: string;
  isVerified?: boolean;
  isActive?: boolean;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  links?: LinkItem[];
};

export function ProfileSetup({ initialProfile }: { initialProfile: Profile | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState<Profile>({
    name: initialProfile?.name || '',
    title: initialProfile?.title || '',
    firm: initialProfile?.firm || '',
    firmFull: initialProfile?.firmFull || '',
    location: initialProfile?.location || '',
    bio: initialProfile?.bio || '',
    status: initialProfile?.status || 'AVAILABLE',
    isVerified: initialProfile?.isVerified || false,
    links: initialProfile?.links || [
      { type: 'website', label: 'Firm Website', url: '', displayOrder: 1, isActive: true },
      { type: 'social', label: 'FB', url: '', displayOrder: 2, isActive: true },
      { type: 'social', label: 'TikTok', url: '', displayOrder: 3, isActive: true },
      { type: 'social', label: 'LinkedIn', url: '', displayOrder: 4, isActive: true },
      { type: 'social', label: 'IG', url: '', displayOrder: 5, isActive: true },
    ],
  });

  function update(key: keyof Profile, value: string | string[] | boolean | LinkItem[]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    startTransition(async () => {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        router.refresh();
      }
    });
  }

  const practiceAreaOptions = [
    'Defamasi & Reputasi',
    'Probet & Harta Pusaka',
    'Hartanah',
    'Pekerjaan & Buruh',
    'Jenayah',
    'Keluarga & Perkahwinan',
    'Korporat & Perniagaan',
    'Sivil Am',
  ];

  return (
    <div className="glass-card rounded-2xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">Maklumat Profil</h2>
          <p className="text-sm text-text-secondary">
            Kemaskini maklumat profesional anda untuk dipaparkan di profil awam.
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-[#34d399]">
            <div className="w-6 h-6 rounded-full bg-[rgba(52,211,153,0.12)] flex items-center justify-center">
              <Save size={14} />
            </div>
            <span className="text-sm font-medium">Disimpan!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <User size={16} className="inline mr-2" />
            Nama Penuh
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Masukkan nama penuh anda"
            className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lia transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <Briefcase size={16} className="inline mr-2" />
            Jawatan
          </label>
          <input
            type="text"
            value={profile.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Contoh: Managing Partner"
            className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lia transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <Building size={16} className="inline mr-2" />
            Nama Firma
          </label>
          <input
            type="text"
            value={profile.firm}
            onChange={(e) => update('firm', e.target.value)}
            placeholder="Nama firma guaman"
            className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lia transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <MapPin size={16} className="inline mr-2" />
            Lokasi Umum
          </label>
          <input
            type="text"
            value={profile.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="Kuala Lumpur"
            className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lia transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Bio</label>
        <textarea
          value={profile.bio}
          onChange={(e) => update('bio', e.target.value)}
          rows={4}
          placeholder="Berikan ringkasan tentang latar belakang dan pengkhususan anda..."
          className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lia transition-colors resize-none"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-primary mb-3">Tetapan Profil</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:border-border-hover">
            <input
              type="checkbox"
              checked={profile.isActive}
              onChange={(e) => update('isActive', e.target.checked)}
              className="w-4 h-4 text-lia border-border rounded focus:ring-lia"
            />
            <div>
              <p className="text-sm font-medium text-text-primary">Profil Aktif</p>
              <p className="text-xs text-text-muted">Tunjukkan profil di laman awam</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:border-border-hover">
            <input
              type="checkbox"
              checked={profile.isVerified}
              onChange={(e) => update('isVerified', e.target.checked)}
              className="w-4 h-4 text-lia border-border rounded focus:ring-lia"
            />
            <div>
              <p className="text-sm font-medium text-text-primary">Peguam Disahkan</p>
              <p className="text-xs text-text-muted">"Saya mengaku bahawa saya mempunyai Sijil Annual dan Sijil Amalan (SAPC) yang sah bagi tahun 2026."</p>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-primary mb-3">Pautan Sosial & Laman</h3>
        <div className="space-y-3">
          {profile.links?.map((link, index) => (
            <div key={index} className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary min-w-[120px]">
                {link.label}
              </label>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="url"
                  value={link.url || ''}
                  onChange={(e) => {
                    const updatedLinks = [...(profile.links || [])];
                    updatedLinks[index] = { ...link, url: e.target.value };
                    update('links', updatedLinks);
                  }}
                  placeholder={`https://...`}
                  className={`flex-1 bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lia transition-colors ${!link.isActive ? 'opacity-50' : ''}`}
                  disabled={!link.isActive}
                />
                <button
                  type="button"
                  onClick={() => {
                    const updatedLinks = [...(profile.links || [])];
                    updatedLinks[index] = { ...link, isActive: !link.isActive };
                    update('links', updatedLinks);
                  }}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    link.isActive 
                      ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20' 
                      : 'bg-bg-3 text-text-muted hover:bg-bg-2 border border-border'
                  }`}
                >
                  {link.isActive ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Lawyer ID</label>
          <input
            type="text"
            value={profile.slug}
            onChange={(e) => update('slug', e.target.value)}
            placeholder="Lawyer Username"
            className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lia transition-colors"
          />
          <p className="text-xs text-text-muted mt-1">URL untuk profil awam: tanyapeguam.com/[slug]</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Meta Title (SEO)</label>
          <input
            type="text"
            value={profile.metaTitle}
            onChange={(e) => update('metaTitle', e.target.value)}
            placeholder="Lawyer Name - Peguam Berdaftar | TanyaPeguam"
            className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lia transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Meta Description (SEO)</label>
          <textarea
            value={profile.metaDescription}
            onChange={(e) => update('metaDescription', e.target.value)}
            rows={2}
            placeholder="Deskripsi profil untuk enjin carian..."
            className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lia transition-colors resize-none"
          />
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
        <button
          onClick={submit}
          disabled={isPending}
          className="flex items-center gap-2 bg-lia hover:bg-lia/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          {isPending ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save size={15} />
              Simpan Profil
            </>
          )}
        </button>
        
        {saved && (
          <div className="text-sm text-green-500 font-medium animate-fade-in">
            Profil telah disimpan!
          </div>
        )}
      </div>
    </div>
  );
}
