'use client';
import React, { useEffect, useState } from 'react';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import { beekeeperApi } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';

export default function AdminBeekeepersPage() {
  const [beekeepers, setBeekeepers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const loadData = () => {
    beekeeperApi.listAll().then(res => {
      setBeekeepers(res.data || []);
      setLoading(false);
    }).catch(console.error);
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (id: string) => {
    if(!confirm('Approve this beekeeper?')) return;
    try {
      await beekeeperApi.approve(id);
      loadData();
    } catch(err) { alert('Action failed'); }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if(!reason) return;
    try {
      await beekeeperApi.reject(id, reason);
      loadData();
    } catch(err) { alert('Action failed'); }
  };

  const filtered = beekeepers.filter(b => {
    const bName = (b.fullName || b.user?.fullName || b.user?.name || '').toLowerCase();
    const kvicId = (b.kvicRegistrationId || '').toLowerCase();
    if (filter !== 'ALL' && b.status !== filter) return false;
    if (search && !bName.includes(search.toLowerCase()) && !kvicId.includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Beekeeper Management</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-amber-100 text-amber-900' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search name or ID..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Name</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">KVIC ID</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Location</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Boxes</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center p-8 text-gray-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-8 text-gray-500">No beekeepers found.</td></tr>
              ) : (
                filtered.map(bk => (
                  <tr key={bk._id || bk.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{bk.fullName || bk.user?.fullName || bk.user?.name}</div>
                      <div className="text-xs text-gray-500">{bk.user?.email || bk.phone}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">{bk.kvicRegistrationId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{bk.address?.district}, {bk.address?.state}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{bk.numberOfBeeBoxes}</td>
                    <td className="px-6 py-4"><StatusBadge status={bk.status} /></td>
                    <td className="px-6 py-4 text-right">
                      {bk.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleApprove(bk._id || bk.id)} className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100"><CheckCircle2 className="w-5 h-5" /></button>
                          <button onClick={() => handleReject(bk._id || bk.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><XCircle className="w-5 h-5" /></button>
                        </div>
                      )}
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
