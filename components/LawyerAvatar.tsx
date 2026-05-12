/**
 * LawyerAvatar — shared display component for all profile picture locations.
 *
 * Fallback chain:
 *   1. avatarUrl (uploaded photo, base64 or URL)
 *   2. googleImage (user.image from Google OAuth)
 *   3. Initials with purple-blue gradient
 *
 * Works in both Server and Client components — no hooks, pure display.
 */

interface LawyerAvatarProps {
  avatarUrl?: string | null;
  googleImage?: string | null;
  name: string;
  /** px size of the avatar square. Default 64. */
  size?: number;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function LawyerAvatar({
  avatarUrl,
  googleImage,
  name,
  size = 64,
  className = '',
}: LawyerAvatarProps) {
  const src = avatarUrl || googleImage || null;
  const initials = getInitials(name || 'P');

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    borderRadius: Math.round(size * 0.25), // ~25% rounded corners
  };

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={{ ...baseStyle, objectFit: 'cover' }}
        className={`flex-shrink-0 ${className}`}
      />
    );
  }

  // Initials fallback
  const fontSize = Math.round(size * 0.3);
  return (
    <div
      style={{ ...baseStyle, fontSize }}
      className={`flex-shrink-0 bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold ${className}`}
    >
      {initials}
    </div>
  );
}
