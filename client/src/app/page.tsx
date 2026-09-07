'use client';
import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { QrCode, ShieldCheck, MapPin, Hexagon, Beaker } from 'lucide-react';
import './verify/cinematic.css';

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
            <stop offset="0%" stopColor="#FFD04B" />
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
const DASHBOARD_URL = "";

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


export default function Home() {
  useEffect(() => {
    const reveal = () => {
      const cutoff = window.innerHeight * 0.92;
      document.querySelectorAll("[data-sr]").forEach((el) => {
        if (el.getBoundingClientRect().top < cutoff) {
          el.classList.add("in");
        }
      });
    };
    window.addEventListener("scroll", reveal);
    reveal(); 
    return () => window.removeEventListener("scroll", reveal);
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-cream font-body text-brown overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30 overflow-hidden"><HexGrid cols={50} rows={50} /></div>
      <ScrollBee />
      <Navbar />
      
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex-1 flex items-center">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 -left-32 w-[600px] h-[600px] bg-honey-light rounded-full blur-[140px] opacity-20" style={{ animation: "float-blob 15s ease-in-out infinite" }} />
          <div className="absolute bottom-10 -right-40 w-[800px] h-[800px] bg-honey-rich rounded-full blur-[160px] opacity-10" style={{ animation: "float-blob 20s ease-in-out infinite reverse" }} />
        </div>

        <DriftingBee delay={0} size={48} top="20%" />
        <DriftingBee delay={5} size={36} top="60%" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div data-sr className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-honey-pale border border-honey/20 mb-6 shadow-sm">
            <span style={{ fontSize: 16 }}>🐝</span>
            <span className="font-mono text-sm font-semibold text-honey-rich tracking-wide">
              KVIC Honey Mission Initiative
            </span>
          </div>
          
          <h1 data-sr style={{ transitionDelay: '0.1s' }} className="font-display text-5xl md:text-7xl font-extrabold text-brown tracking-tight mb-6 leading-tight">
            From Hive to Home, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-honey to-honey-rich">
              Verified on Blockchain.
            </span>
          </h1>
          
          <p data-sr style={{ transitionDelay: '0.2s' }} className="mt-4 text-xl text-brown-mid max-w-3xl mx-auto mb-10 leading-relaxed">
            HoneyChain ensures the purity, origin, and quality of your honey. Every drop is tracked on an immutable blockchain network from the beekeeper to your table.
          </p>
          
          <div data-sr style={{ transitionDelay: '0.3s' }} className="flex flex-col sm:flex-row justify-center items-center gap-4 relative">
            <Link href="/scan" className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto relative group">
              🍯 Scan QR Code
              <div className="absolute -top-6 -right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <Bee size={32} wingSpeed={150} />
              </div>
            </Link>
            <Link href="/auth/login" className="btn-outline flex items-center justify-center gap-2 w-full sm:w-auto">
              🌍 Login to Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-brown py-16 text-honey-pale relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div data-sr className="p-6">
              <div className="font-display text-5xl mb-2 text-honey-light">0</div>
              <div className="font-mono text-sm uppercase tracking-wider text-honey-pale/80">Verified Beekeepers</div>
            </div>
            <div data-sr style={{ transitionDelay: '0.1s' }} className="p-6">
              <div className="font-display text-5xl mb-2 text-honey-light">0</div>
              <div className="font-mono text-sm uppercase tracking-wider text-honey-pale/80">Batches Tracked</div>
            </div>
            <div data-sr style={{ transitionDelay: '0.2s' }} className="p-6">
              <div className="font-display text-5xl mb-2 text-honey-light">100%</div>
              <div className="font-mono text-sm uppercase tracking-wider text-honey-pale/80">Blockchain Verified</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-cream relative z-10 overflow-hidden">
        <DriftingBee delay={2} size={50} top="30%" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div data-sr className="text-center mb-16">
            <h2 className="font-display text-4xl text-brown">How HoneyChain Works</h2>
            <p className="mt-4 text-xl text-brown-mid font-body">Transparent traceability in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div data-sr style={{ transitionDelay: '0.1s' }} className="card-honey text-center p-8 bg-white/80 backdrop-blur-md relative group">
              <div className="absolute -top-4 -left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <Bee size={24} wingSpeed={200} />
              </div>
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-honey-light to-honey rounded-full flex items-center justify-center mb-6 shadow-md shadow-honey/20">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-display text-2xl text-brown mb-3">1. Harvest & Register</h3>
              <p className="text-brown-mid leading-relaxed">Verified beekeepers log their hive locations, floral sources, and harvest data directly onto the immutable ledger.</p>
            </div>
            <div data-sr style={{ transitionDelay: '0.2s' }} className="card-honey text-center p-8 bg-white/80 backdrop-blur-md mt-0 md:mt-10 relative group">
              <div className="absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <Bee size={24} wingSpeed={200} />
              </div>
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-honey-light to-honey rounded-full flex items-center justify-center mb-6 shadow-md shadow-honey/20">
                <Beaker className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-display text-2xl text-brown mb-3">2. Lab Test & Certify</h3>
              <p className="text-brown-mid leading-relaxed">Accredited laboratories test the batch for FSSAI parameters. Results are permanently anchored to the blockchain.</p>
            </div>
            <div data-sr style={{ transitionDelay: '0.3s' }} className="card-honey text-center p-8 bg-white/80 backdrop-blur-md mt-0 md:mt-20 relative group">
              <div className="absolute -top-4 -left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <Bee size={24} wingSpeed={200} />
              </div>
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-honey-light to-honey rounded-full flex items-center justify-center mb-6 shadow-md shadow-honey/20">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-display text-2xl text-brown mb-3">3. Scan & Verify</h3>
              <p className="text-brown-mid leading-relaxed">Consumers scan the QR code on the jar to instantly view the honey's full journey, lab reports, and authenticity proof.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-brown py-12 mt-auto relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-honey-light to-honey">
              <span style={{ fontSize: 16 }}>🐝</span>
            </div>
            <span className="font-display text-xl text-honey-pale">HoneyChain</span>
          </div>
          <p className="font-mono text-xs text-honey-light/60">
            Hive 🐝 Harvest 🌾 Verify 🔗 Distribute 🚚 You 🫙
          </p>
        </div>
      </footer>
    </main>
  );
}
