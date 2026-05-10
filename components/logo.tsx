import Image from 'next/image';

export function Logo({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <Image
        src="/tanya-peguam-official-logo-removebg-preview.png"
        alt="TanyaPeguam Logo"
        width={48}
        height={48}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}

export function LogoWithText({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={size} />
      <span className={`${textSizes[size]} font-bold text-white tracking-tight`}>
        TanyaPeguam
      </span>
    </div>
  );
}
