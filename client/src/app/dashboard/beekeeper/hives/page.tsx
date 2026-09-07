'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, MapPin, Calendar, Leaf, Trash2 } from 'lucide-react';
import { hiveApi } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';

export default function MyHivesPage() {
  const [hives, setHives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadHives = () => {
    setLoading(true);
    hiveApi.listMine().then(res => {
      setHives(res.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => { loadHives(); }, []);

  const handleDelete = async (hiveId: string, hiveCode: string) => {
    if (!confirm(`Are you sure you want to delete hive "${hiveCode}"? This action cannot be undone.`)) return;
    setDeleting(hiveId);
    try {
      const res = await hiveApi.delete(hiveId);
      if (res.success) {
        setHives(prev => prev.filter(h => h._id !== hiveId));
      } else {
        alert(res.message || 'Failed to delete hive');
      }
    } catch (err) {
      alert('Failed to delete hive');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div></div>;

  return (
    <div className="max-w-5xl mx-auto pb-24 md:pb-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Hives</h1>
      </div>

      {hives.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No hives yet</h3>
          <p className="text-gray-500 mt-2 mb-6">Register your first bee hive to start tracking honey.</p>
          <Link href="/dashboard/beekeeper/hives/new" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-bold rounded-xl shadow-sm hover:bg-amber-600">
            <Plus className="w-5 h-5" /> Add Hive
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hives.map(hive => (
            <div key={hive._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-900">{hive.hiveCode}</h3>
                <div className="flex items-center gap-2">
                  <StatusBadge status={hive.status} />
                  <button
                    onClick={() => handleDelete(hive._id, hive.hiveCode)}
                    disabled={deleting === hive._id}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete hive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 mt-auto">
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" /> {hive.locationName}
                </div>
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <Leaf className="w-4 h-4 text-gray-400" /> {hive.floralSource}
                </div>
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" /> {new Date(hive.installDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB for Mobile */}
      {hives.length > 0 && (
        <Link href="/dashboard/beekeeper/hives/new" className="fixed md:hidden bottom-24 right-4 w-14 h-14 bg-amber-500 text-white rounded-full shadow-lg flex items-center justify-center z-40">
          <Plus className="w-6 h-6" />
        </Link>
      )}
      
      {/* Desktop Add Button */}
      {hives.length > 0 && (
        <div className="hidden md:block mt-8 text-center">
          <Link href="/dashboard/beekeeper/hives/new" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-bold rounded-xl shadow-sm hover:bg-amber-600">
            <Plus className="w-5 h-5" /> Add Another Hive
          </Link>
        </div>
      )}
    </div>
  );
}
