import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * Reusable Palette Pill Component
 * Shape: Pill / rounded corners (rounded-full)
 * Content: Circular swatch showing the color + exact hexadecimal text (#XXXXXX)
 * Typography: Clean, modern sans-serif (Inter)
 */
export default function PalettePill({
  hex,
  name,
  stopNumber,
  isActive = false,
  onClick,
  onCopy,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(hex);
    setCopied(true);
    if (onCopy) onCopy(hex);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      title={`${name || 'Color Stop'} - Click to apply accent (${hex})`}
      className={`palette-pill-btn group inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full font-mono text-xs cursor-pointer transition-all duration-200 select-none ${
        isActive
          ? 'bg-[#2A1617] text-[#FFFB97] border-2 border-[#FE7F42] shadow-lg shadow-[#FE7F42]/20 scale-105'
          : 'bg-[#1c0f10]/90 hover:bg-[#2A1617] text-[#FFFB97]/90 hover:text-[#FFFB97] border border-[#7A4B47]/60 hover:border-[#FFFB97]/40 shadow-sm'
      }`}
      style={{
        boxSizing: 'border-box',
        verticalAlign: 'middle',
      }}
    >
      {/* Circular Color Swatch */}
      <span
        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-inner ring-1 ring-black/40 group-hover:scale-110 transition-transform"
        style={{ backgroundColor: hex }}
      />

      {/* Exact Hexadecimal Text */}
      <span className="font-bold tracking-wider uppercase leading-none text-[11px]">
        {hex}
      </span>

      {/* Stop Number Tag */}
      {stopNumber && (
        <span
          className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full font-bold leading-none ${
            isActive
              ? 'bg-[#FE7F42] text-[#2A1617]'
              : 'bg-[#2A1617] text-[#FFFB97]/60 border border-[#7A4B47]/40'
          }`}
        >
          #{stopNumber}
        </span>
      )}

      {/* Copy Action Icon */}
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${hex}`}
        title="Copy hex code"
        className="p-1 rounded-full text-[#FFFB97]/40 hover:text-[#FFFB97] hover:bg-[#FFFB97]/15 transition-colors cursor-pointer"
      >
        {copied ? (
          <Check className="w-3 h-3 text-[#FFFB97]" />
        ) : (
          <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    </div>
  );
}
