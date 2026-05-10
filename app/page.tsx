import Link from 'next/link';
import { db } from '@/lib/db';

export default async function HomePage() {
  // Fetch active profiles for showcase
  const profiles = await db.profile.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 12,
    select: {
      slug: true,
      name: true,
      title: true,
      firm: true,
      monogram: true,
      location: true,
      practiceAreas: true,
    },
  });

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Decorative gold radial */}
      <div className="absolute inset-0 bg-gold-radial opacity-30 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 py-24">
        {/* Header */}
        <header className="text-center mb-20 animate-fade-in">
          <p className="text-gold tracking-[0.3em] text-xs uppercase mb-4">
            TanyaPeguam.com
          </p>
          <h1 className="font-display text-6xl md:text-7xl text-cream leading-tight mb-6">
            Direktori Peguam<br />
            <span className="text-gold-gradient italic">Malaysia</span>
          </h1>
          <p className="text-cream-muted max-w-xl mx-auto text-lg leading-relaxed">
            Cari peguam terpilih, hubungi terus melalui WhatsApp atau pelbagai
            saluran komunikasi. Profesional. Disahkan. Mudah.
          </p>
        </header>

        {/* Profile grid */}
        <section>
          <h2 className="font-display text-2xl text-cream mb-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />
            Peguam Terpilih
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
          </h2>

          {profiles.length === 0 ? (
            <p className="text-center text-cream-muted py-12">
              Belum ada profil peguam. Jalankan{' '}
              <code className="text-gold">npm run db:seed</code> untuk seed data.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {profiles.map((p) => (
                <Link
                  key={p.slug}
                  href={`/${p.slug}`}
                  className="card-base group p-5 flex items-center gap-4 animate-slide-up"
                >
                  {/* Monogram circle */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full border border-gold/40 flex items-center justify-center bg-ink-300 group-hover:border-gold transition-colors">
                      <span className="font-display text-gold text-lg">
                        {p.monogram ?? p.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-cream text-lg leading-tight truncate">
                      {p.name}
                    </p>
                    <p className="text-gold/80 text-xs uppercase tracking-wider mt-0.5">
                      {p.title} {p.firm && `· ${p.firm}`}
                    </p>
                    <p className="text-cream-muted text-xs mt-1.5 truncate">
                      {p.location}
                    </p>
                  </div>

                  {/* Arrow */}
                  <span className="text-gold/40 group-hover:text-gold transition-colors text-xl">
                    →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-ink-50 text-center">
          <p className="text-cream-muted text-xs">
            <span className="text-gold">TanyaPeguam.com</span> · D7 Holdings Sdn Bhd
          </p>
        </footer>
      </div>
    </main>
  );
}
