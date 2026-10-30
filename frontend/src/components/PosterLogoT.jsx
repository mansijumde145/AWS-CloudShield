import React from 'react';

/**
 * Minimalist graphic "t" logo accent seen on the modernist poster reference.
 * Features a crisp, geometric sans-serif 't' glyph inside a refined graphic mark.
 */
export default function PosterLogoT({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-7 h-7 text-sm',
    lg: 'w-10 h-10 text-base font-black',
    xl: 'w-14 h-14 text-2xl font-black',
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-sans select-none rounded-lg border border-[#FFFB97]/20 bg-[#2A1617]/70 backdrop-blur-sm text-[#FFFB97] shadow-sm transition-transform hover:scale-105 ${sizeClasses[size] || sizeClasses.md} ${className}`}
      title="Poster Glyph 't' Accent"
      aria-label="Poster accent logo t"
    >
      <span className="font-extrabold tracking-tighter leading-none transform -translate-y-[1px]">
        t
      </span>
      <span className="w-1 h-1 rounded-full bg-[#FE7F42] ml-0.5 transform -translate-y-1"></span>
    </span>
  );
}

