const fs = require('fs');

// Read the pristine cinematic source to extract the Bee components
const cinematicSource = fs.readFileSync('c:/Users/HP/Downloads/blockhoneychain-main/blockhoneychain-main/client-landing/src/App.tsx', 'utf8');

// Extract Bee, HexGrid, DriftingBee, ScrollBee
const beeComponentMatch = cinematicSource.match(/function Bee\(\{[\s\S]*?\n\}/);
const hexGridMatch = cinematicSource.match(/function HexGrid\(\) \{[\s\S]*?<\/svg>\n    <\/div>\n  \);\n\}/);
const driftingBeeMatch = cinematicSource.match(/function DriftingBee\(\{[\s\S]*?\n\}/);
const scrollBeeMatch = cinematicSource.match(/function ScrollBee\(\) \{[\s\S]*?<\/div>\n  \);\n\}/);

const beeComponents = `
${beeComponentMatch[0]}
${hexGridMatch[0]}
${driftingBeeMatch[0]}
${scrollBeeMatch[0]}
`;

// Now create the new page.tsx content
const newPageContent = `'use client';
import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { QrCode, ShieldCheck, MapPin, Hexagon, Beaker } from 'lucide-react';
import './verify/cinematic.css';

${beeComponents}

export default function Home() {
  // Global scroll-reveal: add .in when element top enters viewport
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
    reveal(); // Initial check
    return () => window.removeEventListener("scroll", reveal);
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-cream font-body text-brown overflow-hidden relative">
      <HexGrid />
      <ScrollBee />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex-1 flex items-center">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 -left-32 w-[600px] h-[600px] bg-honey-light rounded-full blur-[140px] opacity-20" style={{ animation: "float-blob 15s ease-in-out infinite" }} />
          <div className="absolute bottom-10 -right-40 w-[800px] h-[800px] bg-honey-rich rounded-full blur-[160px] opacity-10" style={{ animation: "float-blob 20s ease-in-out infinite reverse" }} />
        </div>

        <DriftingBee delay={0} size={48} startY={20} duration={18} />
        <DriftingBee delay={5} size={36} startY={60} duration={22} />

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

      {/* Stats Section */}
      <section className="bg-brown py-16 text-honey-pale relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div data-sr className="p-6">
              <div className="font-display text-5xl mb-2 text-honey-light">500+</div>
              <div className="font-mono text-sm uppercase tracking-wider text-honey-pale/80">Verified Beekeepers</div>
            </div>
            <div data-sr style={{ transitionDelay: '0.1s' }} className="p-6">
              <div className="font-display text-5xl mb-2 text-honey-light">2000+</div>
              <div className="font-mono text-sm uppercase tracking-wider text-honey-pale/80">Batches Tracked</div>
            </div>
            <div data-sr style={{ transitionDelay: '0.2s' }} className="p-6">
              <div className="font-display text-5xl mb-2 text-honey-light">100%</div>
              <div className="font-mono text-sm uppercase tracking-wider text-honey-pale/80">Blockchain Verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-cream relative z-10 overflow-hidden">
        <DriftingBee delay={2} size={50} startY={30} duration={25} />
        
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

      {/* Footer */}
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
`;

fs.writeFileSync('c:/Users/HP/Downloads/blockhoneychain-main/blockhoneychain-main/client/src/app/page.tsx', newPageContent, 'utf8');
console.log('Successfully injected bees and animations into page.tsx');
