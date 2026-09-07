'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/auth/login';
    if (user.role === 'BEEKEEPER') return '/dashboard/beekeeper';
    if (user.role === 'ADMIN') return '/dashboard/admin';
    if (user.role === 'LAB_TESTER') return '/dashboard/lab';
    return '/auth/login';
  };

  return (
    <nav 
      className={cn('fixed top-0 w-full z-50 transition-all duration-400', scrolled ? 'py-4' : 'py-6')}
      style={{
        background: scrolled ? "rgba(255,251,240,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 2px 24px rgba(244,166,34,0.12)" : "none",
        borderBottom: scrolled ? "1.5px solid rgba(244,166,34,0.15)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-honey-light to-honey">
              <span style={{ fontSize: 18 }}>🐝</span>
            </div>
            <span className="font-display text-2xl text-brown">Honey Chain</span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="font-body font-bold text-sm text-brown-mid hover:text-honey-rich transition-colors">Home</Link>
            <Link href="/scan" className="font-body font-bold text-sm text-brown-mid hover:text-honey-rich transition-colors">Scan QR</Link>
            
            {user ? (
              <Link href={getDashboardLink()} className="btn-primary text-sm px-6 py-2">
                Dashboard
              </Link>
            ) : (
              <Link href="/auth/login" className="btn-primary text-sm px-6 py-2">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-brown">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-cream shadow-xl absolute top-full left-0 w-full border-t border-honey/20">
          <div className="px-6 py-4 flex flex-col space-y-4">
            <Link href="/" onClick={() => setIsOpen(false)} className="font-body font-bold text-brown">Home</Link>
            <Link href="/scan" onClick={() => setIsOpen(false)} className="font-body font-bold text-brown">Scan QR</Link>
            
            {user ? (
              <Link href={getDashboardLink()} onClick={() => setIsOpen(false)} className="btn-primary text-center py-2">
                Dashboard
              </Link>
            ) : (
              <Link href="/auth/login" onClick={() => setIsOpen(false)} className="btn-primary text-center py-2">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
