import React from 'react';

export interface BeeProps {
  size?: number;
  style?: React.CSSProperties;
  className?: string;
  wingSpeed?: number;  // ms per flap cycle
}

export function Bee({ size = 64, style, className = "", wingSpeed = 120 }: BeeProps) {
  const s = size;
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      style={{ width: s, height: s * 0.75, position: "relative", ...style }}
    >
      <svg viewBox="0 0 80 60" width={s} height={s * 0.75} fill="none" overflow="visible">
        {/* Left wing */}
        <ellipse
          cx="27" cy="18" rx="18" ry="10"
          fill="rgba(200,230,255,0.75)"
          stroke="rgba(150,200,255,0.5)"
          strokeWidth="0.8"
          style={{
            transformOrigin: "38px 24px",
            animation: `wing-flap ${wingSpeed}ms ease-in-out infinite`,
          }}
        />
        {/* Right wing */}
        <ellipse
          cx="53" cy="18" rx="18" ry="10"
          fill="rgba(200,230,255,0.75)"
          stroke="rgba(150,200,255,0.5)"
          strokeWidth="0.8"
          style={{
            transformOrigin: "42px 24px",
            animation: `wing-flap-r ${wingSpeed}ms ease-in-out infinite`,
          }}
        />
        {/* Small lower wings */}
        <ellipse
          cx="28" cy="28" rx="11" ry="6"
          fill="rgba(200,230,255,0.5)"
          style={{
            transformOrigin: "38px 28px",
            animation: `wing-flap ${wingSpeed * 0.9}ms ease-in-out infinite 30ms`,
          }}
        />
        <ellipse
          cx="52" cy="28" rx="11" ry="6"
          fill="rgba(200,230,255,0.5)"
          style={{
            transformOrigin: "42px 28px",
            animation: `wing-flap-r ${wingSpeed * 0.9}ms ease-in-out infinite 30ms`,
          }}
        />
        {/* Body shadow */}
        <ellipse cx="41" cy="39" rx="14" ry="8" fill="rgba(180,90,0,0.15)" />
        {/* Body */}
        <ellipse cx="40" cy="34" rx="14" ry="10" fill="#F4A622" />
        {/* Stripes */}
        <rect x="27" y="30" width="26" height="5" rx="2.5" fill="#2C1A00" opacity="0.85" />
        <rect x="27" y="37" width="26" height="4.5" rx="2.25" fill="#2C1A00" opacity="0.85" />
        {/* Head */}
        <circle cx="40" cy="23" r="8" fill="#FFD04B" />
        <circle cx="40" cy="23" r="8" fill="url(#headGrad)" />
        {/* Eyes */}
        <circle cx="37" cy="22" r="2.2" fill="#2C1A00" />
        <circle cx="43" cy="22" r="2.2" fill="#2C1A00" />
        <circle cx="37.8" cy="21.3" r="0.8" fill="white" />
        <circle cx="43.8" cy="21.3" r="0.8" fill="white" />
        {/* Smile */}
        <path d="M 37 25.5 Q 40 28 43 25.5" stroke="#2C1A00" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        {/* Antennae */}
        <line x1="37" y1="16" x2="33" y2="10" stroke="#5C3A0A" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="33" cy="9.5" r="2" fill="#F4A622" stroke="#5C3A0A" strokeWidth="0.8"/>
        <line x1="43" y1="16" x2="47" y2="10" stroke="#5C3A0A" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="47" cy="9.5" r="2" fill="#F4A622" stroke="#5C3A0A" strokeWidth="0.8"/>
        {/* Stinger */}
        <path d="M 40 44 Q 40 50 40 48" stroke="#8B5E2A" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <radialGradient id="headGrad" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#FFE680" />
            <stop offset="0%" stopColor="#FFD04B" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

export function DriftingBee({ delay = 0, top = "30%", size = 52, duration = 20 }: { delay?: number; top?: string; size?: number; duration?: number }) {
  return (
    <div
      className="fixed pointer-events-none z-30 opacity-70"
      style={{
        top,
        left: -100, // Start off-screen to the left
        animation: `bee-drift-across ${duration}s linear infinite ${delay}s`,
      }}
    >
      <Bee size={size} wingSpeed={90} />
    </div>
  );
}
