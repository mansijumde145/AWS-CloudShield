import React from 'react';
import { Upload } from 'lucide-react';
import PosterLogoT from './PosterLogoT';
import OrbitLines from './OrbitLines';

export default function PosterHero({
  fileCount = 0,
  isDemo = false,
  bucketName = '',
  region = 'ap-south-1',
  activeAccent = '#FE7F42',
  onUploadClick,
  uploading = false,
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#7A4B47]/70 shadow-2xl transition-all duration-300">
      {/* Layer 1: Full "On Fire" 5-stop Multi-Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #2A1617 0%, #7A4B47 25%, #FFFB97 50%, #FE7F42 75%, #B32C1A 100%)',
          opacity: 0.85,
        }}
      />

      {/* Layer 2: Vignette overlay for razor-sharp typography contrast & deep dark mode balance */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(42, 22, 23, 0.45) 0%, rgba(28, 15, 16, 0.82) 65%, rgba(23, 12, 13, 0.96) 100%)',
        }}
      />

      {/* Layer 3: Subtle decorative circular "Orbit" lines */}
      <OrbitLines size={420} rings={5} position="center" accentColor={activeAccent} glow />
      <OrbitLines size={200} rings={3} position="corner-tl" accentColor="#FFFB97" />
      <OrbitLines size={220} rings={4} position="corner-br" accentColor="#FE7F42" />

      {/* Layer 4: Structured Poster Grid Content */}
      <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-between min-h-[420px] gap-8">
        {/* Top Corners Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-mono tracking-widest uppercase">
          {/* Top-Left Corner Metadata */}
          <div className="flex items-center space-x-2 bg-[#2A1617]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#7A4B47]/60 shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#FE7F42] animate-pulse"></span>
            <span className="text-[#FE7F42] font-bold">SYSTEM // S3-DR-SHIELD</span>
            <span className="text-[#FFFB97]/40">&bull;</span>
            <span className="text-[#FFFB97]/80">{region.toUpperCase()} &bull; AES-256</span>
          </div>

          {/* Top-Right Corner Metadata */}
          <div className="flex items-center space-x-2 bg-[#2A1617]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#7A4B47]/60 shadow-md">
            <span className="text-[#FFFB97] font-bold">RPO TARGET &lt; 1.0 SEC</span>
            <span className="text-[#FFFB97]/40">&bull;</span>
            <span className="text-[#FE7F42]">
              {isDemo ? 'SIMULATION STATE' : `VAULT: ${bucketName}`}
            </span>
          </div>
        </div>

        {/* Center Poster Composition: Clean, Centered, High Contrast */}
        <div className="my-auto py-4 text-center space-y-4 max-w-3xl mx-auto">
          {/* Minimalist Graphic "t" Logo Accent & Header Tag */}
          <div className="inline-flex items-center space-x-2.5 bg-[#2A1617]/90 border border-[#7A4B47] px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg">
            <PosterLogoT size="sm" />
            <span className="text-xs font-mono font-bold tracking-wider text-[#FFFB97] uppercase">
              Cloud Disaster Recovery
            </span>
            <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-[#FE7F42] text-[#2A1617]">
              ON FIRE PALETTE
            </span>
          </div>

          {/* Main Dashboard Title: Bold, Clean Modern Sans-Serif in #FFFB97 (Pale Cream) */}
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-black font-sans tracking-tight uppercase leading-none text-[#FFFB97] drop-shadow-lg"
            style={{ letterSpacing: '-0.04em' }}
          >
            CLOUDSHIELD
          </h1>

          <p className="text-sm sm:text-base font-normal text-[#FFFB97]/85 max-w-xl mx-auto leading-relaxed font-sans">
            Continuous cloud disaster recovery with automated S3 object versioning and instant, zero-loss rollback.
          </p>

          {/* Center Action Buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={onUploadClick}
              disabled={uploading}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#FE7F42] hover:bg-[#FE7F42]/90 text-[#2A1617] font-sans font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#FE7F42]/30 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>{uploading ? 'UPLOADING...' : 'UPLOAD NEW BACKUP'}</span>
            </button>

            {/* Alternating Text Style: Light cream background with dark text #2A1617 */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#FFFB97] text-[#2A1617] font-mono text-xs font-bold shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#B32C1A]"></span>
              <span>{fileCount} BACKUP OBJECTS ARMED</span>
            </div>
          </div>
        </div>

        {/* Bottom Corners Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-mono tracking-widest uppercase text-[#FFFB97]/75">
          {/* Bottom-Left Corner Metadata */}
          <div className="bg-[#2A1617]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#7A4B47]/60 shadow-md">
            <span className="text-[#FE7F42] font-bold">5 STOPS: </span>
            <span className="text-[#FFFB97]">#2A1617</span>
            <span className="text-[#FFFB97]/40"> &bull; </span>
            <span className="text-[#FFFB97]">#7A4B47</span>
            <span className="text-[#FFFB97]/40"> &bull; </span>
            <span className="text-[#FFFB97]">#FFFB97</span>
            <span className="text-[#FFFB97]/40"> &bull; </span>
            <span className="text-[#FFFB97]">#FE7F42</span>
            <span className="text-[#FFFB97]/40"> &bull; </span>
            <span className="text-[#FFFB97]">#B32C1A</span>
          </div>

          {/* Bottom-Right Corner Metadata */}
          <div className="bg-[#2A1617]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#7A4B47]/60 shadow-md sm:text-right">
            <span className="text-[#FFFB97] font-bold">POSTER GRID SPEC</span>
            <span className="text-[#FFFB97]/40"> &bull; </span>
            <span className="text-[#FE7F42]">VASIL ENEV THEME</span>
          </div>
        </div>
      </div>
    </section>
  );
}
