import React from 'react';
import OrbitLines from './OrbitLines';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeVariant = 'cream', // 'cream' | 'orange' | 'cherry' | 'brown'
  accentColor = '#FE7F42',
}) {
  const badgeStyles = {
    // Alternating text contrast: dark text (#2A1617) against light cream (#FFFB97)
    cream: { backgroundColor: '#FFFB97', color: '#2A1617', fontWeight: 800 },
    orange: { backgroundColor: '#FE7F42', color: '#2A1617', fontWeight: 800 },
    cherry: { backgroundColor: '#B32C1A', color: '#FFFB97', fontWeight: 700 },
    brown: { backgroundColor: '#7A4B47', color: '#FFFB97', fontWeight: 600 },
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[#7A4B47]/60 bg-[#1c0f10] p-5 shadow-lg transition-all hover:border-[#FE7F42]/70 hover:shadow-xl group flex flex-col justify-between"
      style={{ minHeight: '136px' }}
    >
      {/* Decorative fine Orbit lines in panel corner */}
      <OrbitLines
        size={110}
        rings={3}
        position="corner-tr"
        accentColor={accentColor}
        className="opacity-50 group-hover:opacity-90 transition-opacity"
      />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#FFFB97]/60 font-medium">
            {title}
          </span>
          {Icon && (
            <div
              className="p-2 rounded-xl border border-[#7A4B47]/60 flex items-center justify-center"
              style={{ backgroundColor: '#2A1617', color: accentColor }}
            >
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Value & Badge Row */}
        <div className="space-y-1">
          <div className="flex items-baseline space-x-2.5">
            <h3 className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-[#FFFB97] leading-none">
              {value}
            </h3>
            {badge && (
              <span
                className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full shadow-xs"
                style={badgeStyles[badgeVariant] || badgeStyles.cream}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs font-normal text-[#FFFB97]/70 font-sans mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
