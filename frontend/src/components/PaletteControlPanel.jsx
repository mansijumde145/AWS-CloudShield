import React, { useState } from 'react';
import PalettePill from './PalettePill';
import OrbitLines from './OrbitLines';
import { Sliders, Check, Copy } from 'lucide-react';

export const ON_FIRE_STOPS = [
  {
    stop: 1,
    hex: '#2A1617',
    name: 'Darkest Brown / Near Black',
    role: 'Start Stop • Deep Canvas Floor',
  },
  {
    stop: 2,
    hex: '#7A4B47',
    name: 'Medium Reddish-Brown',
    role: 'Stop 02 • Structural Warmth',
  },
  {
    stop: 3,
    hex: '#FFFB97',
    name: 'Very Pale Cream',
    role: 'Stop 03 • Luminous Core Contrast',
  },
  {
    stop: 4,
    hex: '#FE7F42',
    name: 'Bright Orange',
    role: 'Stop 04 • High Energy Action',
  },
  {
    stop: 5,
    hex: '#B32C1A',
    name: 'Deep Cherry Red',
    role: 'End Stop • Disaster Recovery Red',
  },
];

export default function PaletteControlPanel({
  activeAccent = '#FE7F42',
  onSelectAccent,
  onToast,
}) {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyPalette = () => {
    const paletteString = ON_FIRE_STOPS.map((s) => `${s.hex} (${s.name})`).join('\n');
    navigator.clipboard?.writeText(paletteString);
    setCopiedAll(true);
    if (onToast) onToast('Copied all 5 "On Fire" palette codes!', 'success');
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const activeStop =
    ON_FIRE_STOPS.find((s) => s.hex.toLowerCase() === activeAccent.toLowerCase()) ||
    ON_FIRE_STOPS[3];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#7A4B47]/50 bg-[#1c0f10]/95 backdrop-blur-md p-5 sm:p-6 shadow-2xl transition-all">
      {/* Decorative corner orbit lines */}
      <OrbitLines size={180} rings={3} position="corner-tr" accentColor={activeAccent} />

      <div className="relative z-10 space-y-4">
        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#7A4B47]/40 pb-3.5">
          <div className="flex items-center space-x-3">
            <div
              className="p-2 rounded-xl border border-[#FFFB97]/20 flex items-center justify-center"
              style={{ backgroundColor: `${activeAccent}25` }}
            >
              <Sliders className="w-4 h-4" style={{ color: activeAccent }} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FFFB97] font-sans">
                  "On Fire" Palette Control Panel
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FE7F42]/20 text-[#FE7F42] border border-[#FE7F42]/30">
                  5-Stop Swatches
                </span>
              </div>
              <p className="text-xs text-[#FFFB97]/60 font-sans mt-0.5">
                Click any palette pill below to dynamically change the dashboard theme accent
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyPalette}
            className="self-start sm:self-auto text-xs font-mono font-medium px-3.5 py-1.5 rounded-full border border-[#7A4B47] text-[#FFFB97] hover:bg-[#2A1617] hover:border-[#FFFB97]/40 transition flex items-center space-x-1.5 cursor-pointer"
          >
            {copiedAll ? (
              <Check className="w-3.5 h-3.5 text-[#FFFB97]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#FE7F42]" />
            )}
            <span>{copiedAll ? 'Palette Copied' : 'Copy All Stops'}</span>
          </button>
        </div>

        {/* 5 Distinct Palette Pill Swatches */}
        <div className="flex flex-wrap items-center gap-3 py-1">
          {ON_FIRE_STOPS.map((color) => (
            <PalettePill
              key={color.hex}
              hex={color.hex}
              name={color.name}
              stopNumber={color.stop}
              isActive={activeAccent.toLowerCase() === color.hex.toLowerCase()}
              onClick={() => {
                if (onSelectAccent) onSelectAccent(color.hex);
                if (onToast) onToast(`Applied accent: ${color.hex} (${color.name})`, 'info');
              }}
              onCopy={(copiedHex) => {
                if (onToast) onToast(`Copied ${copiedHex} to clipboard`, 'info');
              }}
            />
          ))}
        </div>

        {/* Continuous Multi-stop Gradient Ribbon */}
        <div className="space-y-2 pt-2 border-t border-[#7A4B47]/20">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#FFFB97]/60">
            <span>STOP 1: #2A1617</span>
            <span className="text-[#FE7F42] font-semibold tracking-wider">
              VASIL ENEV 5-STOP "ON FIRE" SPECTRUM
            </span>
            <span>STOP 5: #B32C1A</span>
          </div>

          {/* 5-stop gradient ribbon */}
          <div
            className="relative h-3.5 w-full rounded-full overflow-hidden shadow-inner ring-1 ring-[#FFFB97]/25"
            style={{
              background:
                'linear-gradient(90deg, #2A1617 0%, #7A4B47 25%, #FFFB97 50%, #FE7F42 75%, #B32C1A 100%)',
            }}
          />

          {/* Active Color Info Callout */}
          <div className="flex flex-wrap items-center justify-between text-xs pt-1 text-[#FFFB97]/80 gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase text-[#FFFB97]/50">
                Active Theme Accent:
              </span>
              <span className="font-bold text-[#FFFB97] font-sans">{activeStop.name}</span>
              <span
                className="font-mono text-xs px-2 py-0.5 rounded font-bold"
                style={{
                  backgroundColor: '#2A1617',
                  color: activeStop.hex === '#2A1617' ? '#FFFB97' : activeStop.hex,
                  border: '1px solid #7A4B47',
                }}
              >
                {activeStop.hex}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#FFFB97]/60">
              {activeStop.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
