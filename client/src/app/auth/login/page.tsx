'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Hexagon, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success && res.user) {
        if (res.user.role === 'BEEKEEPER') router.push('/dashboard/beekeeper');
        else if (res.user.role === 'ADMIN') router.push('/dashboard/admin');
        else if (res.user.role === 'LAB_TESTER') router.push('/dashboard/lab');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 honey-gradient relative overflow-hidden">
      {/* Honeycomb background */}
      <div className="absolute inset-0 honeycomb-bg opacity-40 pointer-events-none"></div>
      
      {/* Decorative bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="bubble" style={{ width: 180, height: 180, top: '5%', right: '10%', animationDuration: '18s' }}></div>
        <div className="bubble" style={{ width: 120, height: 120, top: '60%', left: '5%', animationDuration: '22s', animationDelay: '3s' }}></div>
        <div className="bubble" style={{ width: 80, height: 80, bottom: '10%', right: '20%', animationDuration: '15s', animationDelay: '6s' }}></div>
        <div className="bubble" style={{ width: 50, height: 50, top: '30%', left: '15%', animationDuration: '20s', animationDelay: '1s' }}></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link href="/" className="inline-flex justify-center items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl shadow-amber-500/30 float-gentle">
            <span className="text-2xl">🍯</span>
          </div>
          <span className="text-3xl font-extrabold text-amber-900">HoneyChain</span>
        </Link>
        <h2 className="text-2xl font-bold text-amber-900/80">Sign in to your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-8 px-4 sm:rounded-2xl sm:px-10 honey-drip-top">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-3 rounded-xl text-sm border border-red-200/50">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-amber-900/80">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-amber-200/60 rounded-xl shadow-sm placeholder-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 bg-white/60 backdrop-blur-sm transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-900/80">Password</label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-amber-200/60 rounded-xl shadow-sm placeholder-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 pr-10 bg-white/60 backdrop-blur-sm transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-400 hover:text-amber-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-amber-500/20 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-70 transition-all hover:-translate-y-0.5"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '🐝 Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-amber-800/60">Don&apos;t have an account? </span>
            <Link href="/auth/register" className="text-sm font-bold text-amber-600 hover:text-amber-500 transition-colors">
              Register as Beekeeper
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
