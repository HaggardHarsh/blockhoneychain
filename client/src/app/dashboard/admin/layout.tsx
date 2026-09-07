'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Hexagon, LayoutDashboard, Users, Package, ShieldCheck, LogOut, Menu, X, AlertTriangle } from 'lucide-react';
import { DriftingBee } from '@/components/HoneyBees';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (!mounted || loading || !user) return <div className="min-h-screen flex items-center justify-center honey-gradient"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div></div>;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Beekeepers', href: '/dashboard/admin/beekeepers', icon: Users },
    { name: 'Batches', href: '/dashboard/admin/batches', icon: Package },
    { name: 'Quality Tests', href: '/dashboard/admin/quality', icon: ShieldCheck },
    { name: 'Fraud Alerts', href: '/dashboard/admin/fraud', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen honey-gradient flex relative overflow-hidden">
      {/* Decorative honeycomb background */}
      <div className="fixed inset-0 honeycomb-bg opacity-40 pointer-events-none z-0"></div>
      
      {/* Roaming Honeybees */}
      <DriftingBee delay={2} top="15%" size={55} duration={24} />
      <DriftingBee delay={12} top="80%" size={45} duration={26} />
      <DriftingBee delay={7} top="40%" size={50} duration={20} />
      
      {/* Decorative floating bubbles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="bubble" style={{ width: 120, height: 120, top: '10%', right: '5%', animationDuration: '15s', animationDelay: '0s' }}></div>
        <div className="bubble" style={{ width: 80, height: 80, top: '40%', right: '15%', animationDuration: '20s', animationDelay: '3s' }}></div>
        <div className="bubble" style={{ width: 60, height: 60, top: '70%', left: '60%', animationDuration: '18s', animationDelay: '6s' }}></div>
        <div className="bubble" style={{ width: 40, height: 40, top: '20%', left: '40%', animationDuration: '22s', animationDelay: '2s' }}></div>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 glass-sidebar border-r border-amber-200/40 z-50 transform transition-transform duration-300 md:transform-none flex flex-col ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Honey drip accent on top */}
        <div className="h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-400"></div>
        
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
              <span className="text-lg">🍯</span>
            </div>
            <span className="text-xl font-bold text-amber-900">Admin Portal</span>
          </div>
          <button className="md:hidden text-gray-500" onClick={() => setIsMobileOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${active ? 'nav-honey-active text-amber-900 shadow-sm' : 'text-amber-800/70 hover:bg-amber-100/50 hover:text-amber-900'}`}>
                <item.icon className={`w-5 h-5 ${active ? 'text-amber-600' : 'text-amber-500/60'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-amber-200/40">
          <div className="flex items-center gap-3 px-4 py-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full flex items-center justify-center text-amber-800 font-bold shadow-sm">
              {(user.fullName || user.name || 'Admin').charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">{user.fullName || user.name || 'Admin'}</p>
              <p className="text-xs text-amber-600/70">Administrator</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        <header className="bg-white/60 backdrop-blur-sm border-b border-amber-200/30 px-6 py-4 flex items-center gap-4 md:hidden">
          <button onClick={() => setIsMobileOpen(true)} className="text-amber-800 hover:text-amber-900">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-amber-900">HoneyChain Admin</span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
