export function ProfileFooter() {
  return (
    <footer className="mt-12 pt-6 text-center animate-fade-in"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
        <a href="/" className="transition-colors hover:opacity-80" style={{ color: '#d4a853' }}>
          TanyaPeguam.com
        </a>
        <span className="mx-2" style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
        Profil Peguam Disahkan
      </p>
    </footer>
  );
}
