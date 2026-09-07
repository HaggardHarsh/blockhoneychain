'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Play } from 'lucide-react';
import { batchApi } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';

export default function LabDashboardPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In real app, fetch only SUBMITTED_FOR_TEST or TESTING for this specific lab.
    batchApi.listAll().then(res => {
      const pending = res.data?.filter((b: any) => ['SUBMITTED_FOR_TEST', 'TESTING'].includes(b.status)) || [];
      setBatches(pending);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Lab Dashboard</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-blue-50/50">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Pending Tests ({batches.length})</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : batches.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No batches currently await testing.</div>
          ) : (
            batches.map(b => (
              <div key={b._id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono font-bold text-lg text-gray-900">{b.batchCode}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="text-sm text-gray-500">
                    Harvested: {new Date(b.harvestDate).toLocaleDateString()} • {b.rawQuantityKg} kg • {b.floralSource}
                  </div>
                </div>
                <Link href={`/dashboard/lab/test/${b._id}`} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 flex items-center gap-2">
                  <Play className="w-4 h-4" /> Start Test
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
