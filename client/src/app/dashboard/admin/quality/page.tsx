'use client';
import React, { useEffect, useState } from 'react';
import { qualityApi } from '@/lib/api';
import { CheckCircle2, XCircle, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function AdminQualityPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    qualityApi.getAll().then(res => {
      if (res.success) setTests(res.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quality Control Audit</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <FileText className="w-6 h-6 text-gray-600" />
          <h2 className="text-lg font-bold text-gray-900">All Quality Certificates ({tests.length})</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : tests.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Quality tests list will appear here as they are submitted by labs.</p>
            </div>
          ) : (
            tests.map(test => (
              <div key={test._id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono font-bold text-lg text-gray-900">{test.batch?.batchCode || 'Unknown Batch'}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      test.overallResult === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {test.overallResult === 'PASS' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {test.overallResult}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="text-gray-400 text-xs">Lab Name</p>
                      <p className="font-medium text-gray-900">{test.labName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Report Number</p>
                      <p className="font-mono text-xs mt-0.5">{test.reportNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Tested On</p>
                      <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(test.testDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Moisture / HMF</p>
                      <p>{test.parameters?.moisture?.value}% / {test.parameters?.hmf?.value}</p>
                    </div>
                  </div>
                </div>
                {test.batch?.batchCode && (
                  <Link href={`/verify/${test.batch.batchCode}`} target="_blank" className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 whitespace-nowrap text-sm">
                    View Public Page
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
