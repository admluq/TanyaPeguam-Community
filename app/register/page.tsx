'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Kata laluan tidak sepadan');
      return;
    }

    if (form.password.length < 6) {
      setError('Kata laluan mesti sekurang-kurangnya 6 aksara');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Pendaftaran gagal');
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        router.push('/login?registered=true');
        return;
      }

      router.push(result?.url ?? '/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ralat tidak diketahui');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06060a]">
      {/* Geometric background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[rgba(139,92,246,0.07)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-[rgba(212,168,83,0.05)]" />
        <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-[rgba(99,102,241,0.04)] blur-[60px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[rgba(212,168,83,0.04)] blur-[60px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center shadow-lg">
              <span className="text-white font-display font-semibold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-text-primary tracking-tight">TanyaPeguam</span>
          </div>
          <h1 className="text-2xl font-display font-semibold text-text-primary mb-2">
            Daftar Akaun Baharu
          </h1>
          <p className="text-text-secondary text-sm">
            Buat akaun untuk menguruskan Donna anda
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          {error && (
            <div className="mb-5 flex items-start gap-3 p-3 rounded-lg bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.2)]">
              <AlertCircle size={16} className="text-[#f87171] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#f87171]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Nama Penuh</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nama anda"
                disabled={isLoading}
                className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lia transition-colors disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">E-mel</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nama@firma.com"
                disabled={isLoading}
                className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lia transition-colors disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Kata Laluan</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Sekurang-kurangnya 6 aksara"
                disabled={isLoading}
                className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lia transition-colors disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Sahkan Kata Laluan</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Ulang kata laluan"
                disabled={isLoading}
                className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lia transition-colors disabled:opacity-50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-lia hover:bg-lia/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-150"
            >
              {isLoading ? (
                <><Loader2 size={15} className="animate-spin" /> Mendaftar...</>
              ) : (
                'Daftar Akaun'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-center text-text-muted text-xs">
              Sudah ada akaun?{' '}
              <Link href="/login" className="text-gold hover:text-gold-light transition-colors font-medium">
                Log masuk
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-text-muted text-xs mt-6">
          © 2026 TanyaPeguam. Hak cipta terpelihara.
        </p>
      </div>
    </div>
  );
}
