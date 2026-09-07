'use client';
import React, { useEffect, useState } from 'react';
import { Search, Eye } from 'lucide-react';
import Link from 'next/link';
import { batchApi } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    batchApi.listAll().then(res => {
      setBatches(res.data || []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const filtered = batches.filter(b => {
    if (filter !== 'ALL' && b.status !== filter) return false;
    if (search && !b.batchCode.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Batch Oversight</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {['ALL', 'HARVESTED', 'SUBMITTED_FOR_TEST', 'TESTING', 'CERTIFIED'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-amber-100 text-amber-900' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                {f.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search batch code..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Batch Code</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Floral Source</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Quantity (kg)</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center p-8 text-gray-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-8 text-gray-500">No batches found.</td></tr>
              ) : (
                filtered.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{b.batchCode}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.floralSource}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{b.rawQuantityKg}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(b.harvestDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={b.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/admin/batches/${b._id}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
                        <Eye className="w-4 h-4" /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
