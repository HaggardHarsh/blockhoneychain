'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Hexagon, LayoutGrid, Box, Package, User, LogOut, AlertCircle } from 'lucide-react';
import { DriftingBee } from '@/components/HoneyBees';

export default function BeekeeperLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && (!user || user.role !== 'BEEKEEPER')) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (!mounted || loading || !user) return <div className="min-h-screen flex items-center justify-center honey-gradient"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div></div>;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard/beekeeper', icon: LayoutGrid },
    { name: 'My Hives', href: '/dashboard/beekeeper/hives', icon: Box },
    { name: 'My Batches', href: '/dashboard/beekeeper/batches', icon: Package },
    { name: 'Profile', href: '/dashboard/beekeeper/profile', icon: User },
  ];

  return (
    <div className="min-h-screen honey-gradient flex flex-col md:flex-row relative">
      {/* Decorative honeycomb background */}
      <div className="fixed inset-0 honeycomb-bg opacity-40 pointer-events-none z-0"></div>
      
      {/* Roaming Honeybees */}
      <DriftingBee delay={0} top="25%" size={50} duration={22} />
      <DriftingBee delay={8} top="70%" size={40} duration={28} />
      <DriftingBee delay={15} top="15%" size={60} duration={25} />
      <DriftingBee delay={4} top="85%" size={45} duration={30} />
      
      {/* Floating bubbles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="bubble" style={{ width: 100, height: 100, top: '15%', right: '10%', animationDuration: '16s', animationDelay: '1s' }}></div>
        <div className="bubble" style={{ width: 60, height: 60, top: '50%', right: '20%', animationDuration: '22s', animationDelay: '4s' }}></div>
        <div className="bubble" style={{ width: 45, height: 45, top: '75%', left: '55%', animationDuration: '19s', animationDelay: '7s' }}></div>
      </div>

      {/* Top App Bar (Mobile) & Sidebar (Desktop) */}
      <div className="md:w-64 glass-sidebar border-b md:border-r border-amber-200/40 sticky top-0 md:h-screen md:flex-shrink-0 flex md:flex-col justify-between items-center md:items-stretch px-4 md:px-0 py-3 md:py-0 z-50">
        {/* Honey accent line */}
        <div className="hidden md:block h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-400"></div>
        
        <div className="flex items-center md:px-6 md:py-6 gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
            <span className="text-sm">🐝</span>
          </div>
          <span className="text-xl font-bold text-amber-900 hidden md:block">HoneyChain</span>
        </div>
        
        <nav className="hidden md:flex flex-col flex-grow px-4 py-4 space-y-1.5">
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${active ? 'nav-honey-active text-amber-900 shadow-sm' : 'text-amber-800/70 hover:bg-amber-100/50 hover:text-amber-900'}`}>
                <item.icon className={`w-5 h-5 ${active ? 'text-amber-600' : 'text-amber-500/60'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 md:px-6 md:py-6 md:border-t md:border-amber-200/40">
          <div className="hidden md:block flex-grow">
            <p className="text-sm font-bold text-amber-900 truncate">{user.fullName || user.name || 'Beekeeper'}</p>
            <p className="text-xs text-amber-600/70">Beekeeper</p>
          </div>
          <button onClick={logout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col pb-20 md:pb-0 relative overflow-x-hidden z-10">
        {/* Pending Approval Banner */}
        {user.profile?.status === 'PENDING' && (
          <div className="bg-amber-100/80 backdrop-blur-sm border-b border-amber-200 p-3 px-4 md:px-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">Your profile is currently <strong>pending approval</strong> by KVIC Admin.</p>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-amber-200/50 flex justify-around items-center z-50 px-2 py-2 safe-area-bottom">
        {navItems.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className={`flex flex-col items-center p-2 rounded-xl min-w-[64px] ${active ? 'text-amber-600' : 'text-gray-500'}`}>
              <item.icon className={`w-6 h-6 mb-1 ${active ? 'fill-amber-100' : ''}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
