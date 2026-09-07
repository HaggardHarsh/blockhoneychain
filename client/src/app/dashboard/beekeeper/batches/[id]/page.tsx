'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, QrCode, Shield } from 'lucide-react';
import { batchApi } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { BatchTimeline } from '@/components/BatchTimeline';
import { TestResultsTable } from '@/components/TestResultsTable';

export default function BatchDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    batchApi.get(params.id).then(res => {
      setBatch(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div></div>;
  if (!batch) return <div className="p-8 text-center text-gray-500">Batch not found</div>;

  const submitForTesting = async () => {
    if (!confirm('Submit this batch for lab testing?')) return;
    try {
      await batchApi.updateStatus(batch._id, 'SUBMITTED_FOR_TEST', 'Submitted to regional lab for FSSAI analysis');
      const res = await batchApi.get(params.id);
      setBatch(res.data);
    } catch (err) {
      alert('Failed to submit for testing');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/beekeeper/batches" className="p-2 -ml-2 rounded-full hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Batch {batch.batchCode}</h1>
        </div>
        <Link href={`/verify/${batch.batchCode}`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
          <QrCode className="w-4 h-4" /> View Public Page
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <StatusBadge status={batch.status} />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Quantity</p>
                <p className="text-xl font-bold text-gray-900">{batch.rawQuantityKg} kg</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Floral Source</p>
                <p className="font-bold text-gray-900">{batch.floralSource}</p>
              </div>
              <div>
                <p className="text-gray-500">Harvest Date</p>
                <p className="font-bold text-gray-900">{new Date(batch.harvestDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Extraction Method</p>
                <p className="font-bold text-gray-900">{batch.extractionMethod}</p>
              </div>
              <div>
                <p className="text-gray-500">Source Hives</p>
                <p className="font-bold text-gray-900">{batch.hives?.length || 0} Hives</p>
              </div>
            </div>
            
            {batch.status === 'HARVESTED' && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button onClick={submitForTesting} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                  Submit for Lab Testing
                </button>
              </div>
            )}
          </div>

          {batch.qualityTest && (
            <TestResultsTable test={batch.qualityTest} />
          )}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Blockchain Traceability</h3>
            <BatchTimeline history={batch.statusHistory} />
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-gradient-to-b from-amber-500 to-amber-700 p-1 rounded-2xl shadow-lg sticky top-6">
            <div className="bg-white p-6 rounded-xl text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                <Shield className="w-32 h-32" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-1 relative z-10">NFT Certificate</h3>
              <p className="text-[10px] font-bold tracking-widest text-amber-600 uppercase mb-5 relative z-10">Proof of Authenticity</p>
              
              <div className="bg-white p-2 rounded-xl inline-block mb-4 shadow-[0_0_15px_rgba(0,0,0,0.1)] relative z-10">
                {batch.qrCodeUrl ? (
                  <img src={batch.qrCodeUrl} alt="NFT QR Code" className="w-40 h-40 object-contain mx-auto mix-blend-multiply" />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center bg-gray-50 rounded-lg">
                    <QrCode className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mb-5 relative z-10 font-medium">Scan to view the immutable blockchain record and lab results.</p>
              
              <div className="bg-gray-900 text-amber-400 py-2.5 px-3 rounded-lg font-mono text-xs mb-4 flex items-center justify-between relative z-10 shadow-inner">
                <span className="text-gray-500 font-sans font-medium text-[10px] uppercase tracking-wider">Token ID</span>
                <span>{batch.blockchainBatchId ? `#${batch.blockchainBatchId}` : batch.batchCode}</span>
              </div>
              
              <Link href={`/verify/${batch.batchCode}`} target="_blank" className="w-full flex justify-center items-center gap-2 py-3 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200 rounded-xl font-bold hover:from-amber-100 hover:to-orange-100 transition-all relative z-10 shadow-sm">
                <ExternalLink className="w-4 h-4" /> View Blockchain Record
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
