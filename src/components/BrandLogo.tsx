import { HeartPulse } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'lg';
  tone?: 'light' | 'dark';
}

export default function BrandLogo({ size = 'sm', tone = 'dark' }: BrandLogoProps) {
  const isLarge = size === 'lg';
  const textTone = tone === 'light' ? 'text-white' : 'text-red-600';

  return (
    <div className="inline-flex items-center gap-2.5">
      <span
        className={`flex items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-600/30 ${
          isLarge ? 'h-14 w-14' : 'h-9 w-9'
        }`}
      >
        <HeartPulse className={isLarge ? 'h-8 w-8' : 'h-5 w-5'} strokeWidth={2.25} />
      </span>
      <span className={`font-extrabold tracking-tight ${isLarge ? 'text-3xl' : 'text-lg'} ${textTone}`}>
        Blood Bridge
      </span>
    </div>
  );
}
