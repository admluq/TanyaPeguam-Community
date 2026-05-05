import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md animate-fade-in">
        <p className="font-display text-gold text-9xl leading-none mb-4">404</p>
        <h1 className="font-display text-cream text-3xl mb-3">
          Profil tidak dijumpai
        </h1>
        <p className="text-cream-muted mb-8">
          Pautan yang anda cuba akses tidak wujud atau telah dipadam.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 border border-gold/40 hover:border-gold rounded-full text-gold transition-colors"
        >
          ← Kembali ke laman utama
        </Link>
      </div>
    </main>
  );
}
