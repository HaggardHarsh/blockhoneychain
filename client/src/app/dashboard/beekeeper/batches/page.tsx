'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, QrCode, Search, Filter } from 'lucide-react';
import { batchApi } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';

export default function MyBatchesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    batchApi.listMine().then(res => {
      setBatches(res.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const filteredBatches = filter === 'ALL' ? batches : batches.filter(b => b.status === filter);

  if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div></div>;

  return (
    <div className="max-w-5xl mx-auto pb-24 md:pb-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Batches</h1>
        <div className="hidden md:block">
          <Link href="/dashboard/beekeeper/batches/new" className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl shadow-sm hover:bg-amber-600">
            <Plus className="w-5 h-5" /> New Batch
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 flex gap-4 overflow-x-auto">
          {['ALL', 'HARVESTED', 'SUBMITTED_FOR_TEST', 'TESTING', 'CERTIFIED', 'REJECTED', 'DELIVERED'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-amber-100 text-amber-900' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {filteredBatches.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No batches found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredBatches.map(batch => (
              <div key={batch._id} onClick={() => router.push(`/dashboard/beekeeper/batches/${batch._id}`)} className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-900">{batch.batchCode}</span>
                    <StatusBadge status={batch.status} />
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-4">
                    <span>{new Date(batch.harvestDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{batch.rawQuantityKg} kg</span>
                    <span>•</span>
                    <span>{batch.floralSource}</span>
                  </div>
                </div>
                <div className="pl-4">
                  <button onClick={(e) => { e.stopPropagation(); router.push(`/verify/${batch.batchCode}`); }} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors">
                    <QrCode className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link href="/dashboard/beekeeper/batches/new" className="fixed md:hidden bottom-24 right-4 w-14 h-14 bg-amber-500 text-white rounded-full shadow-lg flex items-center justify-center z-40">
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
