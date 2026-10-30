import React from 'react';

/**
 * Subtle decorative circular "Orbit" lines replicating the celestial / contour
 * patterns seen in the modernist poster reference.
 * Low opacity, fine 1px strokes, guaranteed absolute positioning.
 */
export default function OrbitLines({
  size = 320,
  rings = 4,
  className = '',
  accentColor = '#FE7F42',
  glow = false,
  position = 'center', // 'corner-tr', 'corner-tl', 'corner-br', 'corner-bl', 'center'
}) {
  const getPositionStyles = () => {
    switch (position) {
      case 'corner-tr':
        return { top: '-15%', right: '-15%', position: 'absolute' };
      case 'corner-tl':
        return { top: '-15%', left: '-15%', position: 'absolute' };
      case 'corner-br':
        return { bottom: '-15%', right: '-15%', position: 'absolute' };
      case 'corner-bl':
        return { bottom: '-15%', left: '-15%', position: 'absolute' };
      case 'center':
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          position: 'absolute',
        };
    }
  };

  const center = size / 2;
  const step = (size / 2 - 16) / Math.max(rings, 1);

  return (
    <div
      className={`pointer-events-none select-none z-0 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        maxWidth: '100%',
        maxHeight: '100%',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0,
        ...getPositionStyles(),
      }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <radialGradient id={`orbitGrad-${size}-${position}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFB97" stopOpacity="0.18" />
            <stop offset="45%" stopColor="#FE7F42" stopOpacity="0.10" />
            <stop offset="75%" stopColor="#B32C1A" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#2A1617" stopOpacity="0" />
          </radialGradient>
        </defs>

        {glow && (
          <circle
            cx={center}
            cy={center}
            r={size * 0.42}
            fill={`url(#orbitGrad-${size}-${position})`}
          />
        )}

        {Array.from({ length: rings }).map((_, i) => {
          const r = (i + 1) * step;
          const isDashed = i % 2 === 1;
          const opacity = 0.10 + (i / rings) * 0.12;

          return (
            <g key={i}>
              <circle
                cx={center}
                cy={center}
                r={r}
                stroke={i === rings - 1 ? accentColor : '#FFFB97'}
                strokeWidth="1"
                strokeOpacity={opacity}
                strokeDasharray={isDashed ? '3 6' : undefined}
              />
              {i >= 2 && (
                <circle
                  cx={center + r * Math.cos((i * 45 * Math.PI) / 180)}
                  cy={center + r * Math.sin((i * 45 * Math.PI) / 180)}
                  r="2"
                  fill={accentColor}
                  fillOpacity={0.6}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
