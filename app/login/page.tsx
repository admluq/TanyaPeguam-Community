'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const registered = searchParams.get('registered') === 'true';
  const errorParam = searchParams.get('error');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === 'CredentialsSignin'
      ? 'E-mel atau kata laluan tidak betul.'
      : errorParam
        ? 'Log masuk gagal. Cuba lagi.'
        : null,
  );
  const [tab, setTab] = useState<'google' | 'email'>('google');
  const [form, setForm] = useState({ email: '', password: '' });

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl,
      });

      if (!res || res.error) {
        setError('E-mel atau kata laluan tidak betul.');
        return;
      }

      router.push(res.url ?? callbackUrl);
      router.refresh();
    } catch {
      setError('Log masuk gagal. Cuba lagi.');
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
            Log masuk ke Dashboard
          </h1>
          <p className="text-text-secondary text-sm">
            Akses panel kawalan Donna anda
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          {registered && (
            <div className="mb-5 flex items-start gap-3 p-3 rounded-lg bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.2)]">
              <div className="w-4 h-4 rounded-full bg-[#34d399] mt-0.5" />
              <p className="text-sm text-[#34d399]">
                Akaun berjaya didaftarkan. Sila log masuk.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-start gap-3 p-3 rounded-lg bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.2)]">
              <AlertCircle size={16} className="text-[#f87171] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#f87171]">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              type="button"
              onClick={() => setTab('google')}
              className={`rounded-xl py-2.5 text-sm font-semibold border transition-colors ${
                tab === 'google'
                  ? 'bg-bg-3 border-border text-text-primary'
                  : 'bg-transparent border-border text-text-muted hover:text-text-primary'
              }`}
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => setTab('email')}
              className={`rounded-xl py-2.5 text-sm font-semibold border transition-colors ${
                tab === 'email'
                  ? 'bg-bg-3 border-border text-text-primary'
                  : 'bg-transparent border-border text-text-muted hover:text-text-primary'
              }`}
            >
              E-mel
            </button>
          </div>

          {tab === 'google' ? (
            <button
              onClick={() => signIn('google', { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3.5 px-6 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-150 shadow-md"
            >
              <GoogleIcon />
              Teruskan dengan Google
            </button>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                  placeholder="Kata laluan"
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
                  <>
                    <Loader2 size={15} className="animate-spin" /> Log masuk...
                  </>
                ) : (
                  'Log masuk'
                )}
              </button>

              <div className="space-y-3">
                <p className="text-center text-text-muted text-xs">
                  Belum ada akaun?{' '}
                  <a href="/register" className="text-gold hover:text-gold-light transition-colors font-medium">
                    Daftar
                  </a>
                </p>
                <div className="flex items-center gap-2 text-center">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-text-muted text-xs">atau</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <Link
                  href="/"
                  className="w-full flex items-center justify-center gap-2 bg-bg-3 hover:bg-bg-2 text-text-primary font-medium py-2.5 px-4 rounded-xl transition-all duration-150 border border-border"
                >
                  Kembali ke Laman Utama
                </Link>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-text-muted text-xs leading-relaxed">
              Hanya peguam berdaftar TanyaPeguam boleh log masuk.
              <br />
              Belum berdaftar?{' '}
              <a href="mailto:hello@tanyapeguam.com" className="text-gold hover:text-gold-light transition-colors">
                Hubungi kami
              </a>
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

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
