import React from 'react';

export default function GoogleGIcon({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center text-[17px] font-black leading-none ${className}`}
      style={{
        background: 'conic-gradient(from -45deg, #4285F4 0 25%, #34A853 25% 42%, #FBBC05 42% 67%, #EA4335 67% 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        fontFamily: 'Arial, sans-serif',
      }}
    >G</span>
  );
}
