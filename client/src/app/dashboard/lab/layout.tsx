'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Hexagon, FlaskConical, FileText, LogOut } from 'lucide-react';
import { DriftingBee } from '@/components/HoneyBees';

export default function LabLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && (!user || user.role !== 'LAB_TESTER')) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (!mounted || loading || !user) return <div className="min-h-screen flex items-center justify-center honey-gradient"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div></div>;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard/lab', icon: FlaskConical },
    { name: 'My Reports', href: '/dashboard/lab/reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen honey-gradient flex relative overflow-hidden">
      {/* Honeycomb bg */}
      <div className="fixed inset-0 honeycomb-bg opacity-40 pointer-events-none z-0"></div>
      
      {/* Roaming Honeybees */}
      <DriftingBee delay={5} top="20%" size={50} duration={21} />
      <DriftingBee delay={15} top="65%" size={48} duration={25} />
      
      {/* Bubbles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="bubble" style={{ width: 90, height: 90, top: '20%', right: '8%', animationDuration: '17s', animationDelay: '2s' }}></div>
        <div className="bubble" style={{ width: 50, height: 50, top: '60%', right: '25%', animationDuration: '21s', animationDelay: '5s' }}></div>
      </div>

      <aside className="w-64 glass-sidebar border-r border-amber-200/40 hidden md:flex flex-col z-50">
        <div className="h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-400"></div>
        <div className="flex items-center gap-2 p-6">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/20">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-amber-900">Lab Portal</span>
        </div>
        <nav className="flex-1 px-4 space-y-1.5">
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
        <div className="p-4 border-t border-amber-200/40">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-bold text-amber-900">{user.fullName || user.name || 'Lab Analyst'}</p>
            <p className="text-xs text-amber-600/70">Lab Analyst</p>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
