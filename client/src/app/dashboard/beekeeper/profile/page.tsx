'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, MapPin, Briefcase, Phone, Mail, Box, ShieldCheck, LogOut } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-amber-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-amber-500"></div>
        <div className="relative z-10 pt-16 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white rounded-full p-2 shadow-lg mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-amber-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-amber-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{user.fullName || user.name || 'Beekeeper'}</h2>
          <p className="text-gray-500 mb-3">Beekeeper</p>
          <StatusBadge status={user.profile?.status || (user as any).beekeeper?.status || 'PENDING'} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-500" /> Registration Details
          </h3>
          <div className="space-y-3 pt-2">
            <div>
              <p className="text-xs text-gray-500 uppercase">KVIC Registration ID</p>
              <p className="font-medium text-gray-900">{user.profile?.kvicRegistrationId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Aadhaar (Last 4)</p>
              <p className="font-medium text-gray-900">XXXX-XXXX-XXXX-{user.profile?.aadhaarLast4}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Number of Bee Boxes</p>
              <p className="font-medium text-gray-900">{user.profile?.numberOfBeeBoxes} Boxes</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Primary Floral Sources</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.profile?.floralSources?.map((s: string) => (
                  <span key={s} className="px-2 py-1 bg-amber-50 text-amber-800 text-xs rounded-md border border-amber-100">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-500" /> Contact & Address
          </h3>
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-gray-400 mt-1" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-gray-400 mt-1" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Phone</p>
                <p className="font-medium text-gray-900">{user.profile?.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-1" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Address</p>
                <p className="font-medium text-gray-900">
                  {user.profile?.address?.village}<br/>
                  {user.profile?.address?.district}, {user.profile?.address?.state}<br/>
                  {user.profile?.address?.pincode}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button onClick={logout} className="w-full flex justify-center items-center gap-2 py-4 bg-white border border-red-200 text-red-600 rounded-2xl font-bold hover:bg-red-50">
        <LogOut className="w-5 h-5" /> Logout
      </button>
    </div>
  );
}
