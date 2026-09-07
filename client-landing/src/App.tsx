import { useState, useEffect, useRef, ReactNode } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

/* ─────────────────────────────────────────────
   Scroll-reveal — pure DOM, no observer API
   A single global listener adds `.in` to any
   [data-sr] element whose top edge has entered
   the viewport. Zero per-component state.
───────────────────────────────────────────── */
function SR({
  children,
  dir = "up",
  delay = 0,
  stagger = false,
  className = "",
  style,
}: {
  children: ReactNode;
  dir?: "up" | "left" | "right" | "pop" | "rotate";
  delay?: number;
  stagger?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const base = stagger ? "sr-stagger" : `sr sr-${dir}`;
  return (
    <div
      data-sr="1"
      className={`${base} ${className}`}
      style={{
        transitionDelay: !stagger && delay ? `${delay}s` : undefined,
        minHeight: 0,
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Scroll-progress bee (fixed right side)
───────────────────────────────────────────── */
function ScrollBee() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const fn = () => {
      try {
        const scrolled = window.scrollY;
        const total = document.body.scrollHeight - window.innerHeight;
        setProgress(total > 0 ? Math.min(scrolled / total, 1) : 0);
      } catch (_) {}
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const trackH = 320;
  const beeY = progress * (trackH - 36);

  return (
    <div
      className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-0"
      style={{ height: trackH }}
    >
      {/* Trail track */}
      <div className="relative flex flex-col items-center" style={{ width: 12, height: trackH }}>
        {/* Background track */}
        <div className="absolute inset-x-0 top-0 bottom-0 rounded-full" style={{ background: "rgba(244,166,34,0.12)" }} />
        {/* Filled trail */}
        <div
          className="absolute inset-x-0 top-0 rounded-full transition-all duration-200"
          style={{
            height: `${progress * 100}%`,
            background: "linear-gradient(to bottom, #FFD04B, #E8960A)",
            boxShadow: "0 0 8px rgba(244,166,34,0.4)",
          }}
        />
        {/* Honey drip beads along track */}
        {[0.2, 0.45, 0.7].map((p) => (
          <div
            key={p}
            className="absolute w-2 h-2 rounded-full"
            style={{
              top: `${p * 100}%`,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#F4A622",
              opacity: progress > p ? 1 : 0.2,
              transition: "opacity 0.4s ease",
              boxShadow: progress > p ? "0 0 6px #F4A622" : "none",
            }}
          />
        ))}
        {/* Bee at current progress */}
        <div
          className="absolute"
          style={{
            top: beeY,
            left: "50%",
            transform: "translateX(-50%)",
            transition: "top 0.15s ease-out",
            filter: "drop-shadow(0 2px 4px rgba(244,166,34,0.4))",
          }}
        >
          <Bee size={34} wingSpeed={100} />
        </div>
      </div>
      {/* Percentage */}
      <p className="font-mono text-[9px] mt-1" style={{ color: "#E8960A" }}>
        {Math.round(progress * 100)}%
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Interactive Linked Honeycomb Hub
───────────────────────────────────────────── */
const HEX_SECTIONS = [
  { id: "trace-honey",       emoji: "🐝", label: "Hive",        sub: "IoT sensors",         color: "#FFD04B", ring: "#E8960A" },
  { id: "trace-honey",       emoji: "🌾", label: "Harvest",     sub: "Batch tracking",      color: "#F4A622", ring: "#C87A10" },
  { id: "trace-honey",       emoji: "🔗", label: "Verify",      sub: "Blockchain proof",    color: "#E8960A", ring: "#A86010" },
  { id: "hive-intelligence", emoji: "🧠", label: "AI & IoT",    sub: "Hive intelligence",   color: "#6BBF71", ring: "#3A8A40" },
  { id: "impact",            emoji: "🗺️",  label: "India Map",   sub: "Cluster network",     color: "#6BA8C4", ring: "#3A78A0" },
  { id: "for-beekeepers",    emoji: "👨‍🌾", label: "Beekeepers",  sub: "Human stories",       color: "#F9C8A0", ring: "#C87A10" },
];

function HoneycombHub() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [clicked, setClicked] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // scroll-reveal for hex cells — no IntersectionObserver, plain getBoundingClientRect
  useEffect(() => {
    const check = () => {
      const el = gridRef.current;
      if (!el) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
        setVisible(true);
        window.removeEventListener("scroll", check);
      }
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  function navigate(sectionId: string, idx: number) {
    setClicked(idx);
    setTimeout(() => setClicked(null), 600);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  }

  // Honeycomb layout: 3 top, 3 bottom offset
  const positions: [number, number][] = [
    [0, 0], [1, 0], [2, 0],
    [0.5, 1], [1.5, 1], [2.5, 1],
  ];
  const HEX_W = 120, HEX_H = 104, GAP_X = 128, GAP_Y = 110;

  return (
    <section
      className="relative py-24 px-6 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #FFF8D6 0%, #FFECD2 100%)" }}
      id="honeycomb-hub"
    >
      <div className="absolute inset-0 hex-fill opacity-30" />
      <GuideeBee size={64} style={{ top: "6%", left: "3%", position: "absolute" }} label="Navigate!" delay={0} />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <SR dir="up">
          <p className="font-mono text-sm mb-3" style={{ color: "#E8960A" }}>⬡ The Honey Map</p>
          <h2 className="font-display text-5xl md:text-6xl mb-3" style={{ color: "#5C3A0A" }}>
            Explore the Hive 🍯
          </h2>
          <p className="font-body text-lg mb-14" style={{ color: "#8B5E2A" }}>
            Tap any cell to jump to that part of the journey. Each hexagon is a door.
          </p>
        </SR>

        <div
          ref={gridRef}
          className="relative mx-auto"
          style={{
            width: 3 * GAP_X + HEX_W * 0.5,
            height: 2 * GAP_Y + HEX_H,
          }}
        >
          {HEX_SECTIONS.map((sec, i) => {
            const [col, row] = positions[i];
            const x = col * GAP_X;
            const y = row * GAP_Y;
            const isHov = hovered === i;
            const isClk = clicked === i;
            const delay = (visible ? i * 0.08 : 99);

            return (
              <div
                key={i}
                className="absolute flex flex-col items-center justify-center cursor-pointer select-none"
                style={{
                  left: x,
                  top: y,
                  width: HEX_W,
                  height: HEX_H,
                  opacity: visible ? 1 : 0,
                  transform: visible
                    ? isClk ? "scale(0.88)" : isHov ? "scale(1.12) translateY(-6px)" : "scale(1)"
                    : "scale(0.5) translateY(30px)",
                  transition: `opacity 0.55s ${delay}s cubic-bezier(.22,1,.36,1), transform 0.3s cubic-bezier(.34,1.56,.64,1)`,
                  filter: isHov ? `drop-shadow(0 8px 20px ${sec.color}80)` : "none",
                  zIndex: isHov ? 10 : 1,
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate(sec.id, i)}
              >
                {/* Hexagon SVG */}
                <svg
                  viewBox="0 0 120 104"
                  width={HEX_W}
                  height={HEX_H}
                  className="absolute inset-0"
                  overflow="visible"
                >
                  {/* Outer glow ring when hovered */}
                  {isHov && (
                    <polygon
                      points="60,2 116,30 116,74 60,102 4,74 4,30"
                      fill="none"
                      stroke={sec.ring}
                      strokeWidth="3"
                      strokeOpacity="0.5"
                      style={{ filter: `blur(3px)` }}
                    />
                  )}
                  {/* Fill */}
                  <polygon
                    points="60,4 114,32 114,72 60,100 6,72 6,32"
                    fill={isHov ? sec.color : `${sec.color}55`}
                    stroke={sec.ring}
                    strokeWidth={isHov ? "2.5" : "1.5"}
                    strokeOpacity={isHov ? 1 : 0.5}
                    style={{ transition: "fill 0.25s ease, stroke-width 0.2s" }}
                  />
                  {/* Inner shimmer */}
                  {isHov && (
                    <polygon
                      points="60,18 100,40 100,68 60,90 20,68 20,40"
                      fill="rgba(255,255,255,0.25)"
                    />
                  )}
                </svg>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-1 px-3">
                  <span className="text-3xl" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))" }}>
                    {sec.emoji}
                  </span>
                  <p className="font-display text-base leading-tight" style={{ color: "#5C3A0A" }}>{sec.label}</p>
                  <p
                    className="font-mono text-[9px] text-center leading-tight"
                    style={{ color: "#8B5E2A", opacity: isHov ? 1 : 0.7, transition: "opacity 0.2s" }}
                  >
                    {sec.sub}
                  </p>
                  {isHov && (
                    <div
                      className="mt-1 px-2 py-0.5 rounded-full font-mono text-[8px] font-700"
                      style={{ background: sec.ring, color: "#fff" }}
                    >
                      → Go
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Connecting lines SVG overlay */}
        <div className="relative mx-auto mt-6" style={{ maxWidth: 500 }}>
          <p className="font-body text-sm" style={{ color: "#B08A60" }}>
            🐝 Each hexagon connects to a section of the Honey Chain journey
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Images
───────────────────────────────────────────── */
const IMG_HONEY_DRIP  = "https://images.unsplash.com/photo-1613548058193-1cd24c1bebcf?w=1200&h=800&fit=crop&auto=format";
const IMG_HONEY_JAR   = "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=800&h=1000&fit=crop&auto=format";
const IMG_MEADOW      = "https://images.unsplash.com/photo-1780255903366-2d20f7e20c56?w=1600&h=900&fit=crop&auto=format";
const IMG_BEEKEEPER   = "https://images.unsplash.com/photo-1758522964417-058679fcb7c7?w=1200&h=900&fit=crop&auto=format";
const IMG_HIVES       = "https://images.unsplash.com/photo-1633637437933-d665ee7c03c9?w=1200&h=800&fit=crop&auto=format";

/* ─────────────────────────────────────────────
   SVG Bee Component — full illustrated bee
───────────────────────────────────────────── */
interface BeeProps {
  size?: number;
  style?: React.CSSProperties;
  className?: string;
  wingSpeed?: number;  // ms per flap cycle
}

function Bee({ size = 64, style, className = "", wingSpeed = 120 }: BeeProps) {
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
            <stop offset="100%" stopColor="#FFD04B" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

/* Floating guide bee — bobs and hovers at a position */
function GuideeBee({
  size = 72,
  delay = 0,
  style,
  label,
}: {
  size?: number;
  delay?: number;
  style?: React.CSSProperties;
  label?: string;
}) {
  return (
    <div
      className="pointer-events-none absolute z-20 flex flex-col items-center gap-1"
      style={{
        animation: `bee-guide ${3.5 + delay * 0.4}s ease-in-out infinite ${delay * 0.3}s`,
        ...style,
      }}
    >
      <Bee size={size} wingSpeed={110} />
      {label && (
        <div
          className="font-display text-xs px-3 py-1 rounded-full shadow-md"
          style={{ background: "#FFD04B", color: "#5C3A0A", whiteSpace: "nowrap" }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

/* Drifting bee that flies across the screen */
function DriftingBee({ delay = 0, top = "30%", size = 52 }: { delay?: number; top?: string; size?: number }) {
  return (
    <div
      className="fixed pointer-events-none z-30"
      style={{
        top,
        left: 0,
        animation: `bee-drift-across ${18 + delay * 4}s linear infinite ${delay}s`,
      }}
    >
      <Bee size={size} wingSpeed={100} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Honey Drip Decoration
───────────────────────────────────────────── */
function HoneyDrip({ color = "#F4A622", drips = 8 }: { color?: string; drips?: number }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 64, marginBottom: -2 }}>
      <svg viewBox={`0 0 ${drips * 60} 60`} preserveAspectRatio="none" width="100%" height="64" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width={drips * 60} height="12" fill={color} />
        {Array.from({ length: drips }).map((_, i) => {
          const x = i * 60 + 15 + Math.sin(i * 1.8) * 10;
          const h = 20 + Math.sin(i * 2.3) * 14;
          return (
            <g key={i}>
              <path
                d={`M ${x} 10 Q ${x - 6} ${10 + h * 0.6} ${x} ${10 + h} Q ${x + 6} ${10 + h * 0.6} ${x} 10`}
                fill={color}
                style={{
                  animation: `drip 2.4s ease-in-out infinite ${i * 0.22}s`,
                  transformOrigin: `${x}px 10px`,
                }}
              />
              <circle
                cx={x}
                cy={14 + h}
                r={4 + Math.sin(i) * 1.5}
                fill={color}
                opacity="0.6"
                style={{
                  animation: `drip-drop 2.4s ease-in infinite ${i * 0.22 + 1}s`,
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* Upside-down drip (drips up from bottom of previous section) */
function HoneyDripUp({ color = "#FFECD2" }: { color?: string }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 48, marginTop: -2 }}>
      <svg viewBox="0 0 600 48" preserveAspectRatio="none" width="100%" height="48" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="36" width="600" height="12" fill={color} />
        {Array.from({ length: 10 }).map((_, i) => {
          const x = i * 64 + 20 + (i % 3) * 8;
          const h = 16 + (i % 4) * 6;
          return (
            <path
              key={i}
              d={`M ${x} 38 Q ${x - 5} ${38 - h * 0.5} ${x} ${38 - h} Q ${x + 5} ${38 - h * 0.5} ${x} 38`}
              fill={color}
            />
          );
        })}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Hexagon cell grid (bubbly animated)
───────────────────────────────────────────── */
function HexGrid({ rows = 4, cols = 10, color = "#F4A622" }: { rows?: number; cols?: number; color?: string }) {
  const [lit, setLit] = useState<Set<number>>(new Set([2, 7, 14, 21]));
  useEffect(() => {
    const id = setInterval(() => {
      const total = rows * cols;
      const next = Math.floor(Math.random() * total);
      setLit((prev) => {
        const s = new Set(prev);
        s.add(next);
        if (s.size > 8) { const first = s.values().next(); if (!first.done) s.delete(first.value); }
        return s;
      });
    }, 400);
    return () => clearInterval(id);
  }, [rows, cols]);

  const W = 52, H = 60, R = 26;
  return (
    <svg
      width={cols * W * 0.76 + R}
      height={rows * H + H * 0.5}
      className="opacity-60"
    >
      {Array.from({ length: rows * cols }).map((_, idx) => {
        const r = Math.floor(idx / cols);
        const c = idx % cols;
        const cx = c * W * 0.76 + R;
        const cy = r * H + (c % 2 === 1 ? H / 2 : 0) + 28;
        const pts = Array.from({ length: 6 }, (_, i) => {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          return `${cx + R * 0.88 * Math.cos(a)},${cy + R * 0.88 * Math.sin(a)}`;
        }).join(" ");
        const isLit = lit.has(idx);
        return (
          <polygon
            key={idx}
            points={pts}
            fill={isLit ? color : "transparent"}
            stroke={color}
            strokeWidth="1.2"
            strokeOpacity={0.3}
            fillOpacity={isLit ? 0.22 : 0}
            style={{ transition: "fill-opacity 0.5s ease" }}
          />
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Blob decoration
───────────────────────────────────────────── */
function Blob({ color, style }: { color: string; style?: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        background: color,
        filter: "blur(40px)",
        animation: "float-blob 8s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   Navigation
───────────────────────────────────────────── */
const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || "http://localhost:3000";

function Nav({ onScan }: { onScan: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 transition-all duration-400"
      style={{
        background: scrolled ? "rgba(255,251,240,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 2px 24px rgba(244,166,34,0.12)" : "none",
        borderBottom: scrolled ? "1.5px solid rgba(244,166,34,0.15)" : "none",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#FFD04B,#F4A622)" }}
        >
          <span style={{ fontSize: 18 }}>🐝</span>
        </div>
        <span className="font-display text-2xl" style={{ color: "#5C3A0A" }}>Honey Chain</span>
      </div>

      {/* Links */}
      <div className="hidden md:flex items-center gap-7">
        {["Trace Honey", "Hive Intelligence", "For Beekeepers", "Impact"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(/ /g, "-")}`}
            className="font-body font-600 text-sm transition-colors duration-200 hover:text-[#E8960A]"
            style={{ color: "#8B5E2A" }}
          >
            {item}
          </a>
        ))}
        <a
          href={`${DASHBOARD_URL}/auth/login`}
          className="font-body font-600 text-sm transition-colors duration-200 hover:text-[#E8960A]"
          style={{ color: "#8B5E2A" }}
        >
          Login / Dashboard
        </a>
      </div>

      <div className="flex items-center gap-3">
        <a
          href={`${DASHBOARD_URL}/scan`}
          className="btn-outline text-sm px-5 py-2.5 hidden sm:inline-block"
        >
          📱 Real Scanner
        </a>
        <button className="btn-primary text-base px-6 py-3" onClick={onScan}>
          🐝 Demo Scan
        </button>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────
   Hero
───────────────────────────────────────────── */
function Hero({ onTrace }: { onTrace: () => void }) {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      style={{ background: "linear-gradient(160deg, #FFF8D6 0%, #FFECD2 40%, #FFD49A 100%)" }}
    >
      {/* Background blobs */}
      <Blob color="rgba(244,166,34,0.18)" style={{ width: 500, height: 500, top: -100, right: -100 }} />
      <Blob color="rgba(249,212,200,0.3)" style={{ width: 400, height: 400, bottom: 50, left: -80 }} />
      <Blob color="rgba(255,208,75,0.2)" style={{ width: 300, height: 300, top: "30%", left: "30%" }} />

      {/* Hex tiling */}
      <div className="absolute inset-0 hex-fill opacity-40" />

      {/* Drifting bees */}
      <DriftingBee delay={0} top="18%" size={56} />
      <DriftingBee delay={8} top="55%" size={44} />
      <DriftingBee delay={15} top="38%" size={60} />

      {/* Guide bees at corners */}
      <GuideeBee size={80} delay={0} style={{ top: "22%", left: "8%" }} label="Sweet!" />
      <GuideeBee size={68} delay={2} style={{ top: "15%", right: "10%" }} label="100% Pure" />
      <GuideeBee size={58} delay={1} style={{ bottom: "20%", right: "6%" }} />

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto" style={{ animation: "fade-up 0.9s ease-out both" }}>
        {/* Honey drip from top */}
        <div className="flex justify-center mb-8">
          <img
            src={IMG_HONEY_DRIP}
            alt="Golden honey dripping from a wooden dipper"
            className="w-36 h-36 object-cover rounded-full"
            style={{
              border: "4px solid #F4A622",
              boxShadow: "0 8px 32px rgba(244,166,34,0.35)",
              animation: "wiggle 4s ease-in-out infinite",
            }}
          />
        </div>

        <div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 font-body font-700 text-sm"
          style={{ background: "rgba(244,166,34,0.18)", color: "#8B5E2A", border: "1.5px solid rgba(244,166,34,0.35)" }}
        >
          🔗 Blockchain · 🤖 AI · 📡 IoT
        </div>

        <h1 className="font-display leading-tight mb-6" style={{ fontSize: "clamp(3rem,8vw,6.5rem)", color: "#5C3A0A" }}>
          Know where your<br />
          <span style={{ color: "#E8960A" }}>honey</span> comes from 🍯
        </h1>

        <p className="font-body text-lg max-w-xl mx-auto leading-relaxed mb-10" style={{ color: "#8B5E2A" }}>
          From hive to harvest to your hands — every drop verified, every step transparent,
          every beekeeper celebrated. <strong>Sweet, simple, trustworthy.</strong>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-14">
          <button className="btn-primary" onClick={onTrace}>🍯 Trace Your Honey</button>
          <a href={`${DASHBOARD_URL}/auth/login`} className="btn-outline">🌍 Login to Dashboard</a>
        </div>

        {/* Journey breadcrumb */}
        <div
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-mono text-xs"
          style={{ background: "rgba(255,255,255,0.7)", color: "#8B5E2A", border: "1.5px solid rgba(244,166,34,0.2)" }}
        >
          {["🐝 Hive", "🌾 Harvest", "⚗️ Processing", "🚚 Market", "🫙 You"].map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span>{s}</span>
              {i < 4 && <span style={{ color: "#F4A622" }}>→</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom meadow image */}
      <div className="absolute bottom-0 left-0 right-0 h-56 overflow-hidden">
        <img src={IMG_MEADOW} alt="Sunflower meadow" className="w-full h-full object-cover" style={{ filter: "brightness(0.85) saturate(1.1)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(255,236,210,1) 0%, transparent 60%)" }} />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Journey Section
───────────────────────────────────────────── */
const journeySteps = [
  { emoji: "🐝", label: "Hive", sub: "IoT sensors monitor 24/7", color: "#FFD04B" },
  { emoji: "🌾", label: "Harvest", sub: "Batch sealed & weighed", color: "#F4A622" },
  { emoji: "🔗", label: "Verified", sub: "Blockchain record locked", color: "#E8960A" },
  { emoji: "🔬", label: "Quality", sub: "FSSAI lab certified", color: "#D4820A" },
  { emoji: "📦", label: "Packed", sub: "Tamper-evident sealed", color: "#C87A10" },
  { emoji: "🫙", label: "You!", sub: "Scan & trace complete", color: "#5C3A0A" },
];

function JourneySection() {
  return (
    <section className="relative pt-8 pb-20 px-6 hex-fill" style={{ background: "#FFFBF0" }} id="trace-honey">
      <HoneyDripUp color="#FFD49A" />

      <div className="max-w-6xl mx-auto">
        <SR dir="up">
          <div className="text-center mb-16 relative">
            <GuideeBee size={70} style={{ top: -30, right: "10%", position: "absolute" }} label="Follow me!" delay={1} />
            <p className="font-mono text-sm mb-3" style={{ color: "#E8960A" }}>✨ The Sweet Path</p>
            <h2 className="font-display text-5xl md:text-6xl" style={{ color: "#5C3A0A" }}>
              Follow Honey's Journey 🍯
            </h2>
            <p className="font-body mt-4 text-lg max-w-lg mx-auto" style={{ color: "#8B5E2A" }}>
              Every batch has a story. Every step is recorded and visible to you.
            </p>
          </div>
        </SR>

        <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sr-stagger">
          {/* Connecting dotted line */}
          <div className="hidden lg:block absolute top-14 left-8 right-8 border-t-4 border-dashed"
            style={{ borderColor: "rgba(244,166,34,0.3)", zIndex: 0 }} />

          {journeySteps.map((step, i) => (
            <div
              key={step.label}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center mb-4 text-4xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{
                  background: `radial-gradient(circle, ${step.color}30 0%, ${step.color}10 100%)`,
                  border: `3px solid ${step.color}60`,
                  boxShadow: `0 4px 20px ${step.color}30`,
                  position: "relative",
                }}
              >
                {step.emoji}
                <span
                  className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-display"
                  style={{ background: step.color, color: "#fff" }}
                >
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display text-xl mb-1" style={{ color: "#5C3A0A" }}>{step.label}</h3>
              <p className="font-body text-xs leading-relaxed" style={{ color: "#8B5E2A" }}>{step.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Trace Section
───────────────────────────────────────────── */
const custodyChain = [
  { stage: "Hive",            date: "12 Aug 2026", note: "Colony HP-04 / HIVE-047",       hash: "0x4f2a...8e1c" },
  { stage: "Harvest",         date: "18 Aug 2026", note: "14.2 kg collected, batch sealed",hash: "0x9b1d...3f7a" },
  { stage: "Collection Ctr",  date: "19 Aug 2026", note: "Weight & moisture verified",     hash: "0x2c8e...5d94" },
  { stage: "Quality Testing", date: "20 Aug 2026", note: "FSSAI certified",                hash: "0x7a3f...1b2e" },
  { stage: "Processing",      date: "22 Aug 2026", note: "Cold filtered, pH 3.8",          hash: "0xe4c9...0a71" },
  { stage: "Packaging",       date: "23 Aug 2026", note: "Tamper-evident sealed",          hash: "0x1d5b...9f4c" },
  { stage: "Distributor",     date: "24 Aug 2026", note: "Cold chain — HP → Delhi",        hash: "0x6f82...2c3d" },
  { stage: "Consumer 🎉",     date: "26 Aug 2026", note: "QR verified at point of sale",   hash: "0x3e47...8b9a" },
];

function TraceSection({ scanActive, onScanComplete }: { scanActive: boolean; onScanComplete: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  useEffect(() => {
    if (scanActive && !scanning && !revealed) {
      setScanning(true);
      setTimeout(() => { setScanning(false); setRevealed(true); onScanComplete(); }, 2400);
    }
  }, [scanActive]);

  function demo() {
    if (revealed || scanning) return;
    setScanning(true);
    setTimeout(() => { setScanning(false); setRevealed(true); }, 2400);
  }

  return (
    <section
      className="relative py-24 px-6 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FFECD2 0%, #FFF8D6 100%)" }}
      id="trace-honey"
    >
      <Blob color="rgba(244,166,34,0.12)" style={{ width: 400, height: 400, top: -100, left: "60%" }} />
      <Blob color="rgba(249,212,200,0.2)" style={{ width: 300, height: 300, bottom: -50, left: -80 }} />

      {/* Guide bees */}
      <GuideeBee size={72} style={{ top: "8%", right: "4%", position: "absolute" }} label="Scan me!" delay={0} />
      <GuideeBee size={56} style={{ bottom: "12%", left: "3%", position: "absolute" }} delay={2} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <SR dir="up">
          <div className="text-center mb-14">
            <p className="font-mono text-sm mb-3" style={{ color: "#E8960A" }}>🔍 Provenance</p>
            <h2 className="font-display text-5xl md:text-6xl" style={{ color: "#5C3A0A" }}>
              Where did your<br /><span style={{ color: "#E8960A" }}>honey</span> come from?
            </h2>
          </div>
        </SR>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Scanner card */}
          <SR dir="left">
          <div className="card-honey p-8">
            {!revealed ? (
              <div className="flex flex-col items-center text-center">
                {/* Animated QR area */}
                <div
                  onClick={demo}
                  className="relative w-64 h-64 rounded-3xl flex items-center justify-center mb-8 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105"
                  style={{ background: "#FFF8D6", border: "3px dashed rgba(244,166,34,0.5)" }}
                >
                  {scanning ? (
                    <>
                      <div className="flex flex-col items-center gap-3">
                        <Bee size={60} wingSpeed={90} style={{ animation: "bee-guide 1s ease-in-out infinite" }} />
                        <p className="font-display text-xl" style={{ color: "#E8960A" }}>Buzzing…</p>
                      </div>
                      <div
                        className="absolute left-0 right-0 h-1 rounded-full opacity-80"
                        style={{ background: "linear-gradient(90deg,transparent,#F4A622,transparent)", animation: "scan-line 1.6s ease-in-out infinite" }}
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      {/* QR grid illustration */}
                      <svg viewBox="0 0 100 100" width="110" height="110" opacity="0.5">
                        <rect x="10" y="10" width="30" height="30" fill="none" stroke="#F4A622" strokeWidth="3" rx="3"/>
                        <rect x="16" y="16" width="18" height="18" fill="#F4A622" opacity="0.4" rx="1"/>
                        <rect x="60" y="10" width="30" height="30" fill="none" stroke="#F4A622" strokeWidth="3" rx="3"/>
                        <rect x="66" y="16" width="18" height="18" fill="#F4A622" opacity="0.4" rx="1"/>
                        <rect x="10" y="60" width="30" height="30" fill="none" stroke="#F4A622" strokeWidth="3" rx="3"/>
                        <rect x="16" y="66" width="18" height="18" fill="#F4A622" opacity="0.4" rx="1"/>
                        {[60,68,76,60,68,60].map((x,i) => (
                          <rect key={i} x={x} y={60+(Math.floor(i/3)*8)} width="6" height="6" fill="#F4A622" opacity="0.5" rx="1"/>
                        ))}
                      </svg>
                      <p className="font-body text-sm font-600" style={{ color: "#8B5E2A" }}>Tap to scan!</p>
                    </div>
                  )}
                  {/* Corner brackets */}
                  {[["top-3 left-3","border-t-4 border-l-4"],["top-3 right-3","border-t-4 border-r-4"],["bottom-3 left-3","border-b-4 border-l-4"],["bottom-3 right-3","border-b-4 border-r-4"]].map(([pos,brd]) => (
                    <div key={pos} className={`absolute ${pos} w-7 h-7 ${brd} rounded-sm`} style={{ borderColor: "#F4A622" }}/>
                  ))}
                </div>

                <h3 className="font-display text-2xl mb-3" style={{ color: "#5C3A0A" }}>Scan Your Honey Jar</h3>
                <p className="font-body text-sm mb-6" style={{ color: "#8B5E2A" }}>
                  Point at the QR on your Honey Chain jar, or try the demo below.
                </p>
                <button className="btn-primary w-full" onClick={demo} disabled={scanning}>
                  {scanning ? "🐝 Bees Working…" : "🍯 Demo Scan — HC-2026-08241"}
                </button>
                <div className="flex items-center gap-3 my-4 w-full">
                  <div className="flex-1 h-px" style={{ background: "rgba(244,166,34,0.2)" }}/>
                  <span className="font-mono text-xs" style={{ color: "#8B5E2A" }}>or</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(244,166,34,0.2)" }}/>
                </div>
                <input
                  className="w-full px-4 py-3 rounded-2xl font-mono text-sm outline-none transition-all duration-200"
                  style={{
                    background: "#FFF8D6",
                    border: "2px solid rgba(244,166,34,0.3)",
                    color: "#5C3A0A",
                  }}
                  placeholder="Enter Batch ID e.g. HC-2026-08241"
                  onFocus={(e) => (e.target.style.borderColor = "#F4A622")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(244,166,34,0.3)")}
                />
              </div>
            ) : (
              <div style={{ animation: "fade-up 0.5s ease-out both" }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#D4EDDA" }}>
                    <span>✅</span>
                  </div>
                  <div>
                    <p className="font-display text-lg" style={{ color: "#2D7A3A" }}>Batch Verified!</p>
                    <p className="font-mono text-xs" style={{ color: "#8B5E2A" }}>Your honey travelled through 7 verified stages 🐝</p>
                  </div>
                </div>

                <div
                  className="w-full rounded-2xl p-4 mb-5 flex items-center gap-4"
                  style={{ background: "linear-gradient(135deg,#FFD04B20,#F4A62210)", border: "2px solid rgba(244,166,34,0.25)" }}
                >
                  <img src={IMG_HONEY_JAR} alt="Honey jar" className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <p className="font-display text-xl" style={{ color: "#5C3A0A" }}>Batch HC-2026-08241</p>
                    <p className="font-body text-xs" style={{ color: "#8B5E2A" }}>Mustard + Wildflower · Himachal Pradesh</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: "Origin", value: "Himachal Pradesh, India", icon: "📍" },
                    { label: "Hive", value: "HIVE-047", icon: "🏠" },
                    { label: "Harvest", value: "18 August 2026", icon: "📅" },
                    { label: "Floral Source", value: "Mustard + Wildflower", icon: "🌸" },
                    { label: "Beekeeper", value: "Verified Producer ✓", icon: "👨‍🌾" },
                    { label: "Quality", value: "FSSAI Lab Certified", icon: "🔬" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl p-3"
                      style={{ background: "#FFF8D6", border: "1.5px solid rgba(244,166,34,0.2)" }}
                    >
                      <p className="font-mono text-xs mb-0.5" style={{ color: "#B08A60" }}>{item.icon} {item.label}</p>
                      <p className="font-body text-sm font-700" style={{ color: "#5C3A0A" }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowVerify(!showVerify)}
                  className="w-full py-3 rounded-2xl font-body font-700 text-sm transition-all duration-200"
                  style={{
                    background: showVerify ? "#FFF3CC" : "#FFF8D6",
                    border: "1.5px solid rgba(244,166,34,0.3)",
                    color: "#E8960A",
                  }}
                >
                  {showVerify ? "Hide" : "🔗 View"} Blockchain Data
                </button>

                {showVerify && (
                  <div className="mt-3 rounded-2xl p-4 font-mono text-xs space-y-2" style={{ background: "#FFF8D6", border: "1.5px solid rgba(244,166,34,0.15)" }}>
                    {[["Batch ID","HC-2026-08241"],["Tx Hash","0x4f2a9c...8e1c"],["Timestamp","2026-08-18 09:14 UTC"],["Producer ID","BK-HP-047"],["Quality Cert","FSSAI-2026-HP-0891"]].map(([k,v]) => (
                      <div key={k} className="flex justify-between gap-2">
                        <span style={{ color: "#B08A60" }}>{k}</span>
                        <span style={{ color: "#E8960A" }}>{v}</span>
                      </div>
                    ))}
                    <p className="text-[10px] pt-2 border-t" style={{ borderColor: "rgba(244,166,34,0.15)", color: "#B08A60" }}>
                      🔒 Tamper-proof blockchain verified
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          </SR>
          {/* Chain of custody */}
          <SR dir="right">
          <div>
            <h3 className="font-display text-3xl mb-8" style={{ color: "#5C3A0A" }}>
              Chain of Custody 🔗
            </h3>
            <div className="relative">
              <div
                className="absolute left-5 top-0 bottom-0 w-1 rounded-full"
                style={{ background: "linear-gradient(to bottom, #F4A622, #FFD04B, rgba(244,166,34,0.1))" }}
              />
              <div className="space-y-5">
                {custodyChain.map((step, i) => (
                  <div
                    key={step.stage}
                    className="relative flex gap-5 group"
                    style={{ animation: revealed ? `fade-up 0.4s ease-out ${i * 0.07}s both` : "none" }}
                  >
                    <div
                      className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                      style={{
                        background: revealed ? "linear-gradient(135deg,#FFD04B,#F4A622)" : "#FFECD2",
                        border: `2px solid ${revealed ? "#E8960A" : "rgba(244,166,34,0.2)"}`,
                        boxShadow: revealed ? "0 2px 12px rgba(244,166,34,0.3)" : "none",
                      }}
                    >
                      {revealed ? <span className="text-sm">✓</span> : <span className="w-2 h-2 rounded-full" style={{ background: "rgba(244,166,34,0.3)" }}/>}
                    </div>
                    <div className="flex-1 pb-4 border-b" style={{ borderColor: "rgba(244,166,34,0.1)" }}>
                      <div className="flex justify-between items-baseline gap-2 mb-0.5">
                        <p className="font-body font-700 text-sm" style={{ color: "#5C3A0A" }}>{step.stage}</p>
                        <span className="font-mono text-xs flex-shrink-0" style={{ color: "#B08A60" }}>{step.date}</span>
                      </div>
                      <p className="font-body text-xs" style={{ color: "#8B5E2A" }}>{step.note}</p>
                      {revealed && (
                        <p className="font-mono text-[10px] mt-0.5" style={{ color: "#E8960A", opacity: 0.7 }}>{step.hash}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </SR>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Hive Intelligence
───────────────────────────────────────────── */
const hiveData = [
  { day: "Mon", temp: 33.8, humidity: 58, activity: 82 },
  { day: "Tue", temp: 34.1, humidity: 61, activity: 86 },
  { day: "Wed", temp: 34.5, humidity: 63, activity: 79 },
  { day: "Thu", temp: 33.9, humidity: 60, activity: 84 },
  { day: "Fri", temp: 34.2, humidity: 61, activity: 87 },
  { day: "Sat", temp: 34.6, humidity: 64, activity: 91 },
  { day: "Sun", temp: 34.2, humidity: 61, activity: 87 },
];

function HiveTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-honey px-4 py-3 text-xs">
      <p className="font-mono mb-2" style={{ color: "#E8960A" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex gap-3 font-body">
          <span style={{ color: p.color }}>●</span>
          <span style={{ color: "#8B5E2A" }}>{p.name}</span>
          <span className="font-mono font-700" style={{ color: "#5C3A0A" }}>{p.value}{p.name==="temp"?"°C":"%"}</span>
        </p>
      ))}
    </div>
  );
}

function HiveIntelligence() {
  const metrics = [
    { label: "Temperature",        value: "34.2°C", status: "Optimal 🌡",   icon: "🌡", color: "#F4A622" },
    { label: "Humidity",           value: "61%",    status: "Normal 💧",    icon: "💧", color: "#6BA8C4" },
    { label: "Colony Activity",    value: "87%",    status: "Healthy 🐝",   icon: "🐝", color: "#6BBF71" },
    { label: "Production Forecast",value: "+18%",   status: "↑ vs last cycle", icon: "🍯", color: "#FFD04B" },
  ];
  return (
    <section className="relative py-24 px-6 overflow-hidden hex-fill" style={{ background: "#FFFBF0" }} id="hive-intelligence">
      <Blob color="rgba(255,208,75,0.15)" style={{ width: 350, height: 350, top: -80, right: "5%" }} />

      <GuideeBee size={76} style={{ top: "5%", left: "3%", position: "absolute" }} label="Live data!" delay={0} />
      <GuideeBee size={60} style={{ bottom: "8%", right: "4%", position: "absolute" }} delay={3} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <SR dir="up">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
            <div>
              <p className="font-mono text-sm mb-3" style={{ color: "#E8960A" }}>📡 IoT + 🤖 AI</p>
              <h2 className="font-display text-5xl md:text-6xl" style={{ color: "#5C3A0A" }}>Hive Intelligence 🧠</h2>
              <p className="font-body mt-4 text-lg max-w-lg" style={{ color: "#8B5E2A" }}>
                Real-time sensors in every hive, AI-processed to surface what actually matters.
              </p>
            </div>
            <div className="card-honey px-6 py-4 flex flex-col gap-1 flex-shrink-0">
              <p className="font-mono text-xs" style={{ color: "#B08A60" }}>Hive Cluster</p>
              <p className="font-display text-3xl" style={{ color: "#E8960A" }}>HP-042</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500" style={{ animation: "pulse-soft 2s ease-out infinite" }}/>
                <span className="font-mono text-xs" style={{ color: "#6BBF71" }}>Live · 12 hives active</span>
              </div>
            </div>
          </div>
        </SR>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10 sr-stagger">
          {metrics.map((m) => (
            <div key={m.label} className="card-honey p-6 group cursor-default" style={{ transition: "all 0.3s ease" }}>
              <span className="text-3xl">{m.icon}</span>
              <p className="font-display text-3xl mt-3 mb-1" style={{ color: m.color }}>{m.value}</p>
              <p className="font-body text-sm font-600 mb-2" style={{ color: "#5C3A0A" }}>{m.label}</p>
              <div className="h-1 rounded-full" style={{ background: `linear-gradient(to right,${m.color}80,transparent)` }}/>
              <p className="font-mono text-xs mt-2" style={{ color: m.color }}>{m.status}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <SR dir="up" delay={0.1} className="w-full">
        <div className="card-honey p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="font-display text-2xl" style={{ color: "#5C3A0A" }}>Hive Health — 7 Days</h3>
              <p className="font-mono text-xs mt-1" style={{ color: "#B08A60" }}>HIVE-047 · Mustard season</p>
            </div>
            <div className="flex gap-5 text-xs font-mono">
              {[["Temperature","#F4A622"],["Humidity","#6BA8C4"],["Activity","#6BBF71"]].map(([l,c]) => (
                <div key={l} className="flex items-center gap-2">
                  <div className="w-3 h-1 rounded-full" style={{ background: c as string }}/>
                  <span style={{ color: "#8B5E2A" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ width: "100%", height: 240, minHeight: 240 }}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={hiveData} margin={{ top:4,right:4,left:-20,bottom:0 }}>
                <defs>
                  {[["temp","#F4A622"],["humidity","#6BA8C4"],["activity","#6BBF71"]].map(([k,c])=>(
                    <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c as string} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={c as string} stopOpacity={0.02}/>
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="day" stroke="#B08A60" tick={{ fontSize:11, fontFamily:"'Nunito'" }} axisLine={false} tickLine={false}/>
                <YAxis stroke="transparent" tick={false}/>
                <Tooltip content={<HiveTooltip />} cursor={{ stroke:"rgba(244,166,34,0.2)",strokeWidth:1 }}/>
                <Area type="monotone" dataKey="temp" name="temp" stroke="#F4A622" strokeWidth={2.5} fill="url(#g-temp)" dot={false}/>
                <Area type="monotone" dataKey="humidity" name="humidity" stroke="#6BA8C4" strokeWidth={2.5} fill="url(#g-humidity)" dot={false}/>
                <Area type="monotone" dataKey="activity" name="activity" stroke="#6BBF71" strokeWidth={2.5} fill="url(#g-activity)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        </SR>

        {/* Daily brief */}
        <SR dir="up" delay={0.15}>
        <div className="card-honey p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <p className="font-mono text-xs mb-3" style={{ color: "#E8960A" }}>🌅 Today's Brief</p>
              <h3 className="font-display text-3xl mb-5" style={{ color: "#5C3A0A" }}>Good morning, Beekeeper! 🌻</h3>
              <div className="flex gap-8">
                {[["9","Healthy 🟢","#6BBF71"],["2","Attention 🟡","#F4A622"],["1","Critical 🔴","#E05252"]].map(([n,l,c])=>(
                  <div key={l} className="text-center">
                    <p className="font-display text-4xl" style={{ color: c as string }}>{n}</p>
                    <p className="font-mono text-xs" style={{ color: "#8B5E2A" }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {[
                { hive:"Hive 17", issue:"Humidity slightly elevated", action:"Inspect ventilation", urgent:false },
                { hive:"Hive 23", issue:"Activity dropped 14%",       action:"Colony inspection",   urgent:true },
                { hive:"Hive 31", issue:"Production forecast +18%",   action:"Prep equipment",      urgent:false },
              ].map((rec)=>(
                <div key={rec.hive} className="flex gap-4 p-4 rounded-2xl" style={{ background: rec.urgent ? "#FDE8E8" : "#FFF8D6", border: `1.5px solid ${rec.urgent ? "rgba(224,82,82,0.25)" : "rgba(244,166,34,0.2)"}` }}>
                  <span className="text-xl mt-0.5">{rec.urgent ? "🔴" : "🟡"}</span>
                  <div>
                    <p className="font-body font-700 text-sm" style={{ color: "#5C3A0A" }}>{rec.hive}</p>
                    <p className="font-body text-xs" style={{ color: "#8B5E2A" }}>{rec.issue}</p>
                    <p className="font-mono text-xs mt-1" style={{ color: "#E8960A" }}>→ {rec.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </SR>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   AI Detection
───────────────────────────────────────────── */
function AIDetection() {
  const [result, setResult] = useState<"healthy"|"warning"|null>(null);
  const [loading, setLoading] = useState(false);

  function run(type: "healthy"|"warning") {
    if (loading) return;
    setLoading(true); setResult(null);
    setTimeout(() => { setLoading(false); setResult(type); }, 2000);
  }

  return (
    <section className="relative py-24 px-6 overflow-hidden" style={{ background: "linear-gradient(180deg, #FFECD2 0%, #FFF3CC 100%)" }}>
      <Blob color="rgba(107,191,113,0.12)" style={{ width: 300, height: 300, top: -60, right: "15%" }} />
      <GuideeBee size={68} style={{ top: "6%", right: "3%", position: "absolute" }} label="AI scan!" delay={1} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <SR dir="up">
          <div className="text-center mb-14">
            <p className="font-mono text-sm mb-3" style={{ color: "#E8960A" }}>👁️ Computer Vision</p>
            <h2 className="font-display text-5xl md:text-6xl" style={{ color: "#5C3A0A" }}>
              AI Hive Health<br /><span style={{ color: "#E8960A" }}>Assessment 🔬</span>
            </h2>
            <p className="font-body mt-4 text-lg max-w-lg mx-auto" style={{ color: "#8B5E2A" }}>
              Upload a hive photo — our model spots disease, stress, or healthy colonies in seconds.
            </p>
          </div>
        </SR>

        <div className="grid lg:grid-cols-2 gap-10 items-stretch">
          <SR dir="left">
          <div className="card-honey p-8 flex flex-col">
            <div
              className="flex-1 rounded-3xl flex flex-col items-center justify-center gap-5 py-12 cursor-pointer transition-all duration-300 hover:scale-[1.02] mb-6 relative overflow-hidden"
              style={{ background: "#FFF8D6", border: "2.5px dashed rgba(244,166,34,0.45)" }}
              onClick={() => run("healthy")}
            >
              {loading ? (
                <>
                  <Bee size={72} wingSpeed={80} style={{ animation: "bee-guide 0.8s ease-in-out infinite" }} />
                  <p className="font-display text-xl" style={{ color: "#E8960A" }}>Bees analysing…</p>
                  <div className="absolute left-0 right-0 h-1 opacity-70"
                    style={{ background: "linear-gradient(90deg,transparent,#F4A622,transparent)", animation: "scan-line 1.4s ease-in-out infinite" }}
                  />
                </>
              ) : (
                <>
                  <div className="text-6xl" style={{ animation: "wiggle 3s ease-in-out infinite" }}>🔬</div>
                  <p className="font-display text-xl" style={{ color: "#5C3A0A" }}>Upload Hive Image</p>
                  <p className="font-body text-sm" style={{ color: "#8B5E2A" }}>Click to run demo analysis</p>
                </>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => run("healthy")} disabled={loading} className="flex-1 py-3 rounded-2xl font-body font-700 text-sm transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: "#D4EDDA", color: "#2D7A3A", border: "1.5px solid rgba(107,191,113,0.4)" }}>
                ✅ Demo Healthy
              </button>
              <button onClick={() => run("warning")} disabled={loading} className="flex-1 py-3 rounded-2xl font-body font-700 text-sm transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: "#FDE8E8", color: "#C0392B", border: "1.5px solid rgba(224,82,82,0.4)" }}>
                ⚠️ Demo Warning
              </button>
            </div>
          </div>
          </SR>

          <SR dir="right">
          <div className="card-honey p-8 flex flex-col justify-center">
            {!result ? (
              <div className="text-center" style={{ color: "#B08A60" }}>
                <div className="text-6xl mb-5" style={{ animation: "wiggle 4s ease-in-out infinite" }}>🐝</div>
                <p className="font-display text-2xl mb-2" style={{ color: "#5C3A0A" }}>Awaiting Image</p>
                <p className="font-body text-sm">Click a demo above and watch the bees work their magic!</p>
              </div>
            ) : (
              <div style={{ animation: "pop-in 0.5s ease-out both" }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl`}
                    style={{ background: result === "healthy" ? "#D4EDDA" : "#FDE8E8" }}>
                    {result === "healthy" ? "✅" : "⚠️"}
                  </div>
                  <div>
                    <p className="font-display text-xl" style={{ color: result === "healthy" ? "#2D7A3A" : "#C0392B" }}>
                      {result === "healthy" ? "Colony Healthy!" : "Potential Issue!"}
                    </p>
                    <p className="font-mono text-xs" style={{ color: "#B08A60" }}>AI Analysis Complete</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-3 mb-6">
                  <p className="font-display text-6xl" style={{ color: "#5C3A0A" }}>
                    {result === "healthy" ? "94.7" : "87.2"}<span className="text-2xl" style={{ color: "#B08A60" }}>%</span>
                  </p>
                  <p className="font-body text-sm" style={{ color: "#8B5E2A" }}>Confidence</p>
                </div>

                {result === "healthy" ? (
                  <ul className="space-y-3 mb-4">
                    {["Normal bee activity detected 🐝","Healthy brood pattern 🥚","No abnormal clustering 🏠","Stable environment readings 🌡"].map(s=>(
                      <li key={s} className="font-body text-sm flex gap-2" style={{ color: "#5C3A0A" }}>
                        <span style={{ color: "#6BBF71" }}>✓</span>{s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <>
                    <div className="rounded-2xl p-4 mb-4" style={{ background: "#FDE8E8", border: "1.5px solid rgba(224,82,82,0.2)" }}>
                      <p className="font-body font-700 text-sm mb-1" style={{ color: "#C0392B" }}>⚠️ Possible Varroa Infestation</p>
                      <p className="font-body text-xs" style={{ color: "#8B5E2A" }}>Elevated mite indicators detected in brood cells.</p>
                    </div>
                    <div className="rounded-2xl p-4" style={{ background: "#FFF3CC", border: "1.5px solid rgba(244,166,34,0.3)" }}>
                      <p className="font-mono text-xs mb-1" style={{ color: "#E8960A" }}>🐝 Recommended Action</p>
                      <p className="font-body text-sm font-700" style={{ color: "#5C3A0A" }}>Inspect Hive H-024 within 24 hours.</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          </SR>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Beekeeper Story
───────────────────────────────────────────── */
function BeekeeperStory() {
  return (
    <section className="relative py-24 px-6 overflow-hidden" style={{ background: "#FFFBF0" }} id="for-beekeepers">
      <div className="absolute inset-0 hex-fill opacity-30" />
      <Blob color="rgba(249,212,200,0.3)" style={{ width: 400, height: 400, top: -100, left: "60%" }} />
      <GuideeBee size={76} style={{ top: "10%", left: "2%", position: "absolute" }} label="Our beekeepers!" delay={0} />
      <GuideeBee size={58} style={{ bottom: "15%", right: "3%", position: "absolute" }} delay={2} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <SR dir="left">
          <div>
            <p className="font-mono text-sm mb-3" style={{ color: "#E8960A" }}>👨‍🌾 The Human Story</p>
            <h2 className="font-display text-5xl md:text-6xl leading-tight mb-6" style={{ color: "#5C3A0A" }}>
              Behind every jar<br />is a <span style={{ color: "#E8960A" }}>beekeeper.</span> 🐝
            </h2>
            <p className="font-body text-lg leading-relaxed mb-8" style={{ color: "#8B5E2A" }}>
              Honey Chain connects rural beekeepers with AI intelligence, market access, and recognition —
              so every jar carries not just honey, but a story worth tracing.
            </p>
            <div className="grid grid-cols-3 gap-5 mb-10">
              {[
                { icon:"📈", head:"↑ Productivity", sub:"AI hive monitoring" },
                { icon:"🌐", head:"↑ Market Access", sub:"Verified identity" },
                { icon:"🤝", head:"↑ Trust", sub:"Transparent journey" },
              ].map(s=>(
                <div key={s.head} className="card-honey p-5 text-center">
                  <span className="text-3xl">{s.icon}</span>
                  <p className="font-display text-lg mt-2 mb-1" style={{ color: "#E8960A" }}>{s.head}</p>
                  <p className="font-body text-xs" style={{ color: "#8B5E2A" }}>{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="card-honey p-6">
              <p className="font-mono text-xs mb-3" style={{ color: "#E8960A" }}>🏆 Verified Producer Profile</p>
              <h4 className="font-display text-2xl mb-4" style={{ color: "#5C3A0A" }}>ABC Beekeeping Cooperative</h4>
              <div className="grid grid-cols-2 gap-2">
                {[["🐝","84 Active Hives"],["🍯","2.4 tonnes / year"],["📍","Himachal Pradesh"],["✅","Identity Verified"],["✅","Batch Verified"],["✅","Quality Records"]].map(([i,l])=>(
                  <div key={l} className="flex gap-2 text-sm font-body" style={{ color: "#8B5E2A" }}>
                    <span>{i}</span>{l}
                  </div>
                ))}
              </div>
            </div>
          </div>
          </SR>

          <SR dir="right">
          <div className="relative">
            <img
              src={IMG_BEEKEEPER}
              alt="Beekeeper carrying honeycomb frames"
              className="w-full h-[560px] object-cover rounded-3xl"
              style={{ boxShadow: "0 20px 60px rgba(244,166,34,0.2)" }}
            />
            <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(to top, rgba(255,251,240,0.6) 0%, transparent 40%)" }}/>
            <div
              className="absolute bottom-6 left-6 right-6 rounded-2xl p-4"
              style={{ background: "rgba(255,251,240,0.92)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(244,166,34,0.25)" }}
            >
              <p className="font-mono text-xs mb-1" style={{ color: "#E8960A" }}>Cluster HP-04 · Himachal Pradesh</p>
              <p className="font-body text-sm font-700" style={{ color: "#5C3A0A" }}>142 hives · 28 beekeepers · 1,240 kg harvested 🍯</p>
            </div>
          </div>
          </SR>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   India Map
───────────────────────────────────────────── */
// Coordinates mapped to the viewBox="0 0 340 430" India outline below
const clusters = [
  { id:"HP-04", name:"Himachal Pradesh", x:138, y:64,  hives:142, keepers:28, harvest:"1,240 kg", healthy:92 },
  { id:"PB-07", name:"Punjab",           x:112, y:78,  hives:98,  keepers:19, harvest:"870 kg",   healthy:88 },
  { id:"UK-02", name:"Uttarakhand",      x:162, y:80,  hives:76,  keepers:14, harvest:"620 kg",   healthy:95 },
  { id:"WB-11", name:"West Bengal",      x:246, y:148, hives:203, keepers:41, harvest:"1,890 kg", healthy:84 },
  { id:"MH-06", name:"Maharashtra",      x:144, y:212, hives:124, keepers:23, harvest:"1,020 kg", healthy:86 },
  { id:"KA-09", name:"Karnataka",        x:154, y:264, hives:178, keepers:35, harvest:"1,540 kg", healthy:90 },
];

function IndiaMap() {
  const [sel, setSel] = useState<typeof clusters[0]|null>(null);
  return (
    <section className="relative py-24 px-6 overflow-hidden" style={{ background: "linear-gradient(180deg, #FFF3CC 0%, #FFECD2 100%)" }} id="impact">
      <Blob color="rgba(107,191,113,0.1)" style={{ width: 350, height: 350, bottom: -80, left: -60 }} />
      <GuideeBee size={70} style={{ top: "5%", right: "5%", position: "absolute" }} label="Tap a cluster!" delay={0} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <SR dir="up">
          <div className="text-center mb-14">
            <p className="font-mono text-sm mb-3" style={{ color: "#E8960A" }}>🗺️ Network</p>
            <h2 className="font-display text-5xl md:text-6xl" style={{ color: "#5C3A0A" }}>Honey Across India 🇮🇳</h2>
            <p className="font-body mt-4 max-w-md mx-auto" style={{ color: "#8B5E2A" }}>Tap a glowing cluster to explore local hive data.</p>
          </div>
        </SR>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
          <SR dir="left">
          <div className="card-honey p-4 overflow-hidden relative" style={{ minHeight: 460 }}>
            <svg
              viewBox="0 0 340 430"
              className="w-full h-full"
              style={{ minHeight: 420 }}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* ── India accurate silhouette (bezier curves) ── */}
              <path
                d="
                  M 76,30
                  C 88,22 106,16 122,14
                  Q 138,12 154,13
                  Q 170,14 186,13
                  Q 200,14 214,18
                  Q 226,19 238,23
                  Q 248,28 256,36
                  L 260,48 L 259,56
                  Q 267,54 278,51
                  Q 292,47 304,49
                  Q 314,52 318,62
                  Q 320,72 314,82
                  Q 306,90 294,94
                  Q 280,97 268,99
                  L 257,104
                  Q 260,118 264,132
                  Q 267,148 265,163
                  Q 260,176 252,188
                  Q 244,200 238,214
                  Q 230,226 220,236
                  Q 208,248 197,260
                  Q 184,274 172,288
                  Q 161,302 153,318
                  Q 147,333 144,350
                  Q 142,364 141,380
                  L 140,392
                  L 138,380
                  Q 136,364 131,348
                  Q 124,332 114,318
                  Q 103,304 93,290
                  Q 83,276 76,261
                  Q 69,246 66,231
                  L 63,218
                  Q 56,212 48,216
                  Q 41,223 43,235
                  Q 47,246 59,248
                  L 67,245 L 68,236
                  Q 67,222 65,208
                  Q 62,192 61,176
                  Q 60,160 62,144
                  Q 62,130 60,116
                  Q 61,102 65,90
                  Q 70,78 76,66
                  Q 78,52 76,38 Z
                "
                fill="rgba(255,243,204,0.88)"
                stroke="rgba(244,166,34,0.6)"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Sri Lanka */}
              <ellipse cx="150" cy="404" rx="10" ry="8"
                fill="rgba(255,243,204,0.65)" stroke="rgba(244,166,34,0.4)" strokeWidth="1.4"/>

              {/* Cluster dots */}
              {clusters.map((c) => (
                <g key={c.id} onClick={() => setSel(c)} style={{ cursor: "pointer" }}>
                  <circle
                    cx={c.x} cy={c.y} r={18}
                    fill="rgba(244,166,34,0.18)"
                    style={{ animation: "pulse-soft 2.5s ease-out infinite" }}
                  />
                  <circle
                    cx={c.x} cy={c.y}
                    r={sel?.id === c.id ? 10 : 7}
                    fill={sel?.id === c.id ? "#E8960A" : "#F4A622"}
                    style={{
                      transition: "all 0.3s ease",
                      filter: sel?.id === c.id
                        ? "drop-shadow(0 0 8px #F4A622)"
                        : "drop-shadow(0 0 3px rgba(244,166,34,0.7))",
                    }}
                  />
                  <text
                    x={c.x + 13} y={c.y + 4}
                    fontSize="8" fill="#8B5E2A"
                    fontFamily="'DM Mono'" fontWeight="500"
                  >{c.id}</text>
                </g>
              ))}
            </svg>
          </div>
          </SR>

          <SR dir="right">
          <div>
            {sel ? (
              <div className="card-honey p-6" style={{ animation: "pop-in 0.4s ease-out both" }}>
                <button onClick={() => setSel(null)} className="font-mono text-xs mb-4 hover:underline" style={{ color: "#E8960A" }}>← Back</button>
                <p className="font-mono text-xs mb-2" style={{ color: "#E8960A" }}>Cluster {sel.id}</p>
                <h3 className="font-display text-2xl mb-5" style={{ color: "#5C3A0A" }}>{sel.name}</h3>
                {[["Active Hives",sel.hives],["Beekeepers",sel.keepers],["Total Harvest",sel.harvest],["Healthy Colonies",`${sel.healthy}%`]].map(([l,v])=>(
                  <div key={String(l)} className="flex justify-between py-3 border-b" style={{ borderColor: "rgba(244,166,34,0.1)" }}>
                    <span className="font-body text-sm" style={{ color: "#8B5E2A" }}>{l}</span>
                    <span className="font-mono text-sm font-700" style={{ color: "#E8960A" }}>{v}</span>
                  </div>
                ))}
                <div className="mt-5 h-3 rounded-full overflow-hidden" style={{ background: "#FFF3CC" }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${sel.healthy}%`, background: "linear-gradient(to right,#FFD04B,#6BBF71)" }}/>
                </div>
                <p className="font-mono text-xs mt-2" style={{ color: "#6BBF71" }}>{sel.healthy}% colony health 🐝</p>
              </div>
            ) : (
              <div className="card-honey p-6">
                <p className="font-mono text-xs mb-4" style={{ color: "#E8960A" }}>🗺️ Network Overview</p>
                <div className="space-y-2">
                  {clusters.map(c=>(
                    <button key={c.id} onClick={() => setSel(c)}
                      className="w-full flex justify-between items-center py-3 px-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02]"
                      style={{ background: "#FFF8D6", border: "1.5px solid rgba(244,166,34,0.15)" }}
                    >
                      <div>
                        <span className="font-mono text-xs" style={{ color: "#E8960A" }}>{c.id}</span>
                        <p className="font-body text-sm font-700" style={{ color: "#5C3A0A" }}>{c.name}</p>
                      </div>
                      <span className="font-mono text-xs" style={{ color: "#B08A60" }}>{c.hives} 🐝 →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          </SR>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Hive to Market
───────────────────────────────────────────── */
function HiveToMarket() {
  const pipeline = ["🐝 Beekeeper","🍯 Verified Honey","🔗 Honey Chain","🏪 Buyer / Retailer","🫙 Consumer"];
  return (
    <section className="relative py-24 px-6 overflow-hidden hex-fill" style={{ background: "#FFFBF0" }}>
      <Blob color="rgba(244,166,34,0.12)" style={{ width: 300, height: 300, top: -60, right: "10%" }} />
      <GuideeBee size={66} style={{ bottom: "10%", left: "4%", position: "absolute" }} label="To market!" delay={1} />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <SR dir="up">
          <p className="font-mono text-sm mb-3" style={{ color: "#E8960A" }}>🚚 Market Access</p>
          <h2 className="font-display text-5xl md:text-6xl mb-6" style={{ color: "#5C3A0A" }}>From Hive to Market 🏪</h2>
          <p className="font-body text-lg max-w-lg mx-auto mb-14" style={{ color: "#8B5E2A" }}>
            Verified provenance gives rural producers access to buyers who value authenticity and quality.
          </p>
        </SR>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-0 flex-wrap mb-14">
          {pipeline.map((step, i) => (
            <div key={step} className="flex items-center">
              <div
                className="px-5 py-3 rounded-full font-body font-700 text-sm transition-all duration-300 hover:scale-105"
                style={{
                  background: i === 2 ? "linear-gradient(135deg,#FFD04B,#F4A622)" : "#ffffff",
                  color: i === 2 ? "#5C3A0A" : "#8B5E2A",
                  border: "2px solid rgba(244,166,34,0.25)",
                  boxShadow: i === 2 ? "0 4px 20px rgba(244,166,34,0.35)" : "0 2px 8px rgba(244,166,34,0.08)",
                }}
              >{step}</div>
              {i < pipeline.length - 1 && <span className="mx-2 text-xl" style={{ color: "#F4A622" }}>→</span>}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 sr-stagger">
          {[
            { icon:"🌱", title:"Transparent Origin",    body:"Every jar carries verifiable proof of where, when, and how it was produced." },
            { icon:"🔒", title:"Tamper-Proof Records",  body:"Blockchain means no silent alterations between hive and shelf." },
            { icon:"🤝", title:"Direct Market Signal",  body:"Authentic producers build buyer trust and access premium markets." },
          ].map(card=>(
            <div key={card.title} className="card-honey p-8 text-left">
              <span className="text-4xl">{card.icon}</span>
              <h3 className="font-display text-2xl mt-4 mb-3" style={{ color: "#5C3A0A" }}>{card.title}</h3>
              <p className="font-body text-sm leading-relaxed" style={{ color: "#8B5E2A" }}>{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Final CTA
───────────────────────────────────────────── */
function FinalCTA({ onScan }: { onScan: () => void }) {
  return (
    <section
      className="relative py-40 px-6 overflow-hidden text-center"
      style={{ background: "linear-gradient(160deg, #FFD04B 0%, #F4A622 40%, #E8960A 100%)" }}
    >
      {/* Hex on gold */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='104'%3E%3Cpolygon points='30,4 56,18 56,46 30,60 4,46 4,18' fill='rgba(255,255,255,0.08)' stroke='rgba(255,255,255,0.12)' stroke-width='1'/%3E%3C/svg%3E")`
      }}/>

      <Blob color="rgba(255,255,255,0.15)" style={{ width: 400, height: 400, top: -100, left: "20%" }} />
      <Blob color="rgba(200,100,0,0.2)" style={{ width: 300, height: 300, bottom: -60, right: "15%" }} />

      {/* Bees circling */}
      <GuideeBee size={80} style={{ top: "10%", left: "8%", position: "absolute" }} delay={0} />
      <GuideeBee size={68} style={{ top: "15%", right: "6%", position: "absolute" }} delay={1} />
      <GuideeBee size={60} style={{ bottom: "18%", left: "5%", position: "absolute" }} delay={2} />
      <GuideeBee size={72} style={{ bottom: "12%", right: "8%", position: "absolute" }} delay={0.5} />

      <div className="relative z-10 max-w-3xl mx-auto">
        <img
          src={IMG_HIVES}
          alt="Beehives in a meadow"
          className="w-28 h-28 object-cover rounded-full mx-auto mb-10"
          style={{ border: "5px solid rgba(255,255,255,0.6)", boxShadow: "0 8px 32px rgba(200,100,0,0.3)" }}
        />
        <h2 className="font-display leading-tight mb-6" style={{ fontSize: "clamp(3rem,7vw,6rem)", color: "#ffffff", textShadow: "0 2px 16px rgba(150,60,0,0.3)" }}>
          Know your honey.<br />Trust your source. 🐝
        </h2>
        <p className="font-body text-xl mb-12 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.85)" }}>
          Every jar has a story. Every batch has a beekeeper. Every drop is traceable.
        </p>
        <button
          onClick={onScan}
          className="font-display text-2xl px-14 py-5 rounded-full transition-all duration-300 hover:scale-105"
          style={{
            background: "#ffffff",
            color: "#E8960A",
            boxShadow: "0 8px 40px rgba(150,60,0,0.25)",
          }}
        >
          🍯 Scan Your Honey Now
        </button>
        <a
          href={`${DASHBOARD_URL}/scan`}
          className="inline-block font-display text-lg px-10 py-3 mt-4 rounded-full transition-all duration-300 hover:scale-105"
          style={{
            background: "rgba(255,255,255,0.2)",
            color: "#ffffff",
            border: "2px solid rgba(255,255,255,0.5)",
          }}
        >
          📱 Open Real QR Scanner
        </a>
        <p className="font-mono text-sm mt-6" style={{ color: "rgba(255,255,255,0.7)" }}>
          Blockchain verified · AI monitored · IoT connected
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Footer
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="py-12 px-8" style={{ background: "#5C3A0A" }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#F4A622" }}>
            <span style={{ fontSize: 18 }}>🐝</span>
          </div>
          <span className="font-display text-2xl" style={{ color: "#FFD04B" }}>Honey Chain</span>
        </div>
        <div className="flex items-center gap-5">
          {[
            ["Login", `${DASHBOARD_URL}/auth/login`],
            ["Scan QR", `${DASHBOARD_URL}/scan`],
            ["Dashboard", `${DASHBOARD_URL}`],
          ].map(([label, href]) => (
            <a key={label} href={href} className="font-mono text-xs transition-colors hover:text-[#FFD04B]" style={{ color: "rgba(255,208,75,0.7)" }}>
              {label}
            </a>
          ))}
        </div>
        <p className="font-mono text-xs" style={{ color: "rgba(255,208,75,0.6)" }}>
          Hive 🐝 Harvest 🌾 Verify 🔗 Distribute 🚚 You 🫙
        </p>
        <p className="font-body text-xs" style={{ color: "rgba(255,208,75,0.5)" }}>© 2026 Honey Chain. All batches verified. 🍯</p>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   Root
───────────────────────────────────────────── */
export default function App() {
  const [scanTriggered, setScanTriggered] = useState(false);
  const [scanDone, setScanDone] = useState(false);

  // Global scroll-reveal: add .in when element top enters viewport
  useEffect(() => {
    const reveal = () => {
      const cutoff = window.innerHeight * 0.92;
      document.querySelectorAll<HTMLElement>("[data-sr]").forEach((el) => {
        if (el.getBoundingClientRect().top < cutoff) {
          el.classList.add("in");
        }
      });
    };
    reveal(); // catch anything already visible on mount
    window.addEventListener("scroll", reveal, { passive: true });
    window.addEventListener("resize", reveal, { passive: true });
    return () => {
      window.removeEventListener("scroll", reveal);
      window.removeEventListener("resize", reveal);
    };
  }, []);

  function handleScan() {
    document.getElementById("trace-honey")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => { if (!scanDone) setScanTriggered(true); }, 700);
  }

  return (
    <div className="min-h-screen" style={{ background: "#FFFBF0" }}>
      <Nav onScan={handleScan} />
      <ScrollBee />
      <Hero onTrace={handleScan} />
      <HoneyDrip color="#FFD04B" drips={10} />
      <HoneycombHub />
      <HoneyDrip color="#FFECD2" drips={10} />
      <JourneySection />
      <HoneyDrip color="#FFECD2" drips={12} />
      <TraceSection
        scanActive={scanTriggered && !scanDone}
        onScanComplete={() => setScanDone(true)}
      />
      <HoneyDrip color="#FFFBF0" drips={10} />
      <HiveIntelligence />
      <HoneyDrip color="#FFECD2" drips={11} />
      <AIDetection />
      <HoneyDrip color="#FFFBF0" drips={9} />
      <BeekeeperStory />
      <HoneyDrip color="#FFF3CC" drips={12} />
      <IndiaMap />
      <HoneyDrip color="#FFFBF0" drips={10} />
      <HiveToMarket />
      <HoneyDrip color="#FFD04B" drips={14} />
      <FinalCTA onScan={handleScan} />
      <Footer />
    </div>
  );
}
