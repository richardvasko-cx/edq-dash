import React, { useId } from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

function useSparkGradient() {
  const uid = useId().replace(/:/g, '');
  const gradientId = `spark-grad-${uid}`;
  const defs = (
    <defs>
      <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1A73E8" />
        <stop offset="50%" stopColor="#7C4DFF" />
        <stop offset="100%" stopColor="#A040FF" />
      </linearGradient>
    </defs>
  );
  return { gradientId, defs };
}

// 1. Search with Spark (RAG search)
export function SearchSparkIcon({ className = "w-5 h-5" }: IconProps) {
  const { gradientId, defs } = useSparkGradient();
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      {defs}
      {/* Magnifying Glass */}
      <circle cx="10" cy="11" r="5" stroke={`url(#${gradientId})`} />
      <line x1="14" y1="15" x2="19" y2="20" stroke={`url(#${gradientId})`} />
      {/* Spark star in top right */}
      <path d="M19 3c0 2-1 3-3 3 2 0 3 1 3 3 0-2 1-3 3-3-2 0-3-1-3-3z" fill={`url(#${gradientId})`} />
    </svg>
  );
}

// 2. Settings with Spark (AI Config)
export function SettingsSparkIcon({ className = "w-5 h-5" }: IconProps) {
  const { gradientId, defs } = useSparkGradient();
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      {defs}
      {/* Gear */}
      <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.38a2 2 0 00-.73-2.73l-.15-.1a2 2 0 01-1-1.72v-.51a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" stroke={`url(#${gradientId})`} />
      <circle cx="12" cy="12" r="3" stroke={`url(#${gradientId})`} />
      {/* Spark star inside top-right gear area */}
      <path d="M17.5 4.5c0 1.2-.6 1.8-1.8 1.8 1.2 0 1.8.6 1.8 1.8 0-1.2.6-1.8 1.8-1.8-1.2 0-1.8-.6-1.8-1.8z" fill={`url(#${gradientId})`} />
    </svg>
  );
}

// 3. Chat bubble with Spark (AI Chat)
export function ChatSparkIcon({ className = "w-5 h-5" }: IconProps) {
  const { gradientId, defs } = useSparkGradient();
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      {defs}
      {/* Chat bubble */}
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5" stroke={`url(#${gradientId})`} />
      <line x1="8" y1="10" x2="12" y2="10" stroke={`url(#${gradientId})`} />
      <line x1="8" y1="14" x2="14" y2="14" stroke={`url(#${gradientId})`} />
      {/* Spark in top right */}
      <path d="M19 4c0 1.6-.8 2.4-2.4 2.4 1.6 0 2.4.8 2.4 2.4 0-1.6.8-2.4 2.4-2.4-1.6 0-2.4-.8-2.4-2.4z" fill={`url(#${gradientId})`} />
    </svg>
  );
}

// 4. Draft/Pencil with Spark (Copilot email generator)
export function DraftSparkIcon({ className = "w-5 h-5" }: IconProps) {
  const { gradientId, defs } = useSparkGradient();
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      {defs}
      {/* Pencil */}
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke={`url(#${gradientId})`} />
      {/* Spark star next to tip */}
      <path d="M6 10c0 1.2-.6 1.8-1.8 1.8 1.2 0 1.8.6 1.8 1.8 0-1.2.6-1.8 1.8-1.8-1.2 0-1.8-.6-1.8-1.8z" fill={`url(#${gradientId})`} />
    </svg>
  );
}

// 5. Document/Book with Spark (User Guide / Doc articles)
export function DocSparkIcon({ className = "w-5 h-5" }: IconProps) {
  const { gradientId, defs } = useSparkGradient();
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      {defs}
      {/* Document page */}
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={`url(#${gradientId})`} />
      <polyline points="14 2 14 8 20 8" stroke={`url(#${gradientId})`} />
      <line x1="8" y1="13" x2="16" y2="13" stroke={`url(#${gradientId})`} />
      <line x1="8" y1="17" x2="16" y2="17" stroke={`url(#${gradientId})`} />
      {/* Spark inside document top left */}
      <path d="M9 7c0 .8-.4 1.2-1.2 1.2.8 0 1.2.4 1.2 1.2 0-.8.4-1.2 1.2-1.2-.8 0-1.2-.4-1.2-1.2z" fill={`url(#${gradientId})`} />
    </svg>
  );
}
