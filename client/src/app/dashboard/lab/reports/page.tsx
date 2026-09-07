'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Eye, CheckCircle, XCircle } from 'lucide-react';
import { batchApi } from '@/lib/api';

export default function LabReportsPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    batchApi.listAll().then(res => {
      // Filter for batches that have been tested
      const completed = res.data?.filter((b: any) => ['CERTIFIED', 'REJECTED'].includes(b.status)) || [];
      // Sort by latest harvestDate or updated time for now
      completed.sort((a: any, b: any) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime());
      setBatches(completed);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Completed Reports</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-blue-50/50">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Tested Batches ({batches.length})</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : batches.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No completed reports found.</div>
          ) : (
            batches.map(b => (
              <div key={b._id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono font-bold text-lg text-gray-900">{b.batchCode}</span>
                    {b.status === 'CERTIFIED' ? (
                      <span className="px-2 py-1 text-xs font-bold rounded-md bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3"/> CERTIFIED
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-bold rounded-md bg-red-100 text-red-700 flex items-center gap-1">
                        <XCircle className="w-3 h-3"/> REJECTED
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Harvested: {new Date(b.harvestDate).toLocaleDateString()} • {b.rawQuantityKg} kg • {b.floralSource}
                  </div>
                </div>
                <Link href={`/dashboard/lab/test/${b._id}`} className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-200 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> View Report
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
