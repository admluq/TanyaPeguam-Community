export function ProfileFooter() {
  return (
    <footer className="mt-12 pt-6 border-t border-ink-50 text-center animate-fade-in">
      <p className="text-cream-muted text-xs">
        <a
          href={process.env.NEXT_PUBLIC_SITE_URL ?? '/'}
          className="text-gold hover:text-gold-300 transition-colors font-display"
        >
          TanyaPeguam.com
        </a>
        <span className="mx-2 text-gold/30">·</span>
        Profil Peguam Disahkan
      </p>
    </footer>
  );
}
