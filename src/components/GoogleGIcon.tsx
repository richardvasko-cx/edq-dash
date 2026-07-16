import React from 'react';

export default function GoogleGIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className={`h-[18px] w-[18px] shrink-0 ${className}`}
    >
      <path fill="#FFC107" d="M43.6 20H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34 6.1 29.2 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-4z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34 6.1 29.2 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z" />
      <path fill="#4CAF50" d="M24 44c5.1 0 9.8-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.5 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20H42V20H24v8h11.3c-.8 2.1-2.2 3.9-4.1 5.2l.1-.1 6.2 5.2C37 38.8 44 34 44 24c0-1.3-.1-2.7-.4-4z" />
    </svg>
  );
}
