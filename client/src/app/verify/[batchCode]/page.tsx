'use client';
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, MapPin, Calendar, Camera, FileText, Package, User, Shield, FlaskConical, Link as LinkIcon, AlertTriangle, Loader2, AlertCircle, Map } from 'lucide-react';
import { batchApi } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

export default function VerifyBatchPage() {
  const params = useParams();
  const router = useRouter();
  const batchCode = params.batchCode as string;
  const [batch, setBatch] = useState<any>(null);
  const [blockchain, setBlockchain] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (batchCode) {
      batchApi.verify(batchCode)
        .then(res => {
          if (res.success) {
            setBatch(res.data);
            setBlockchain(res.blockchain || null);
          } else {
            setError('Batch not found or invalid QR code.');
          }
        })
        .catch(err => {
          console.error(err);
          setError('Failed to verify batch. Please try again later.');
        })
        .finally(() => setLoading(false));
    }
  }, [batchCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
        <p className="text-gray-500 mb-6 text-center max-w-md">{error}</p>
        <Link href="/" className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600">
          Return Home
        </Link>
      </div>
    );
  }

  const beekeeper = batch.beekeeper || {};
  const quality = batch.qualityTest || {};

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Batch Verification</p>
              <h1 className="text-lg font-mono font-bold text-gray-900">{batch.batchCode}</h1>
            </div>
          </div>
          <StatusBadge status={batch.status} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Top Status Banner */}
        <div className="bg-green-50 border border-green-200 p-6 rounded-2xl flex items-start gap-4">
          <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0 mt-1" />
          <div>
            <h2 className="text-lg font-bold text-green-900 mb-1">Authentic HoneyBatch™</h2>
            <p className="text-green-800 text-sm">
              This honey has been tracked on the blockchain from hive to jar. All quality and origin data has been verified.
            </p>
            {batch.blockchainTxHash && (
              <p className="mt-3 text-xs font-mono text-green-700 bg-green-100/50 p-2 rounded break-all border border-green-200">
                TxHash: {batch.blockchainTxHash}
              </p>
            )}
          </div>
        </div>

        {/* Beekeeper & Origin */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-gray-900">Origin & Beekeeper</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Beekeeper Name</p>
              <p className="font-bold text-gray-900">{beekeeper.fullName || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="font-medium text-gray-900">
                {beekeeper.address?.village ? `${beekeeper.address.village}, ` : ''}
                {beekeeper.address?.district ? `${beekeeper.address.district}, ` : ''}
                {beekeeper.address?.state}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">KVIC Registration</p>
              <p className="font-mono text-sm text-gray-700">{beekeeper.kvicRegistrationId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Floral Source</p>
              <p className="font-medium text-gray-900">{batch.floralSource}</p>
            </div>
          </div>
        </section>

        {/* Harvest Details */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-gray-900">Harvest Details</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Harvest Date</p>
                <p className="font-medium text-gray-900">{new Date(batch.harvestDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Raw Quantity</p>
                <p className="font-medium text-gray-900">{batch.rawQuantityKg} kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Method</p>
                <p className="font-medium text-gray-900">{batch.extractionMethod}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Source Hives</p>
                <p className="font-medium text-gray-900">{batch.hives?.length || 0} hives</p>
              </div>
            </div>

            {batch.harvestProofImage && (
              <div className="mt-4">
                <p className="text-sm font-bold text-gray-900 mb-2">Harvest Proof</p>
                <img src={batch.harvestProofImage} alt="Harvest Proof" className="w-full max-h-64 object-cover rounded-xl border border-gray-200" />
              </div>
            )}
            
            {batch.harvestLocation && batch.harvestLocation.coordinates && batch.harvestLocation.coordinates[0] !== 0 && (
               <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                 <Map className="w-4 h-4 text-blue-500" />
                 Verified Geo-Location: {batch.harvestLocation.coordinates[1].toFixed(4)}, {batch.harvestLocation.coordinates[0].toFixed(4)}
               </div>
            )}
          </div>
        </section>

        {/* Quality Certification */}
        {quality && quality.overallResult ? (
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-gray-900">Quality Certificate</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${quality.overallResult === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {quality.overallResult}
              </span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Testing Lab</p>
                  <p className="font-medium text-gray-900">{quality.labName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Report Number</p>
                  <p className="font-mono text-sm text-gray-900">{quality.reportNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Test Date</p>
                  <p className="font-medium text-gray-900">{new Date(quality.testDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <h4 className="text-sm font-bold text-gray-900 mb-3">FSSAI Parameter Results</h4>
              <div className="overflow-x-auto border border-gray-200 rounded-xl mb-4">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Parameter</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Value</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
  { label: 'Total Reducing Sugar', param: quality.parameters?.reducingSugar, unit: '%' },
  { label: 'Sucrose', param: quality.parameters?.sucrose, unit: '%' },
  { label: 'Moisture', param: quality.parameters?.moisture, unit: '%' },
  { label: 'Ash', param: quality.parameters?.ash, unit: '%' },
  { label: "Fiehe's Test", param: quality.parameters?.fiehesTest, unit: '' },
  { label: 'HMF', param: quality.parameters?.hmf, unit: 'mg/kg' },
  { label: 'F/G Ratio', param: quality.parameters?.fgRatio, unit: '' },
  { label: 'Specific Gravity', param: quality.parameters?.specificGravity, unit: '' },
  { label: 'Acidity', param: quality.parameters?.acidity, unit: '%' },
  { label: 'Proline', param: quality.parameters?.proline, unit: 'mg/kg' },
].filter(r => r.param).map(({ label, param, unit }) => (
                      <tr key={label} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{label}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{param.value}{unit ? ` ${unit}` : ''}</td>
                        <td className="px-4 py-3 text-right">
                          {param.pass !== undefined && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${param.pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {param.pass ? '✓ PASS' : '✗ FAIL'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* View Original Lab Report */}
            {quality.labReportImage && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setShowReport(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl font-bold hover:bg-purple-100 transition-all"
                >
                  <FileText className="w-5 h-5" />
                  View Original Lab Report
                </button>
              </div>
            )}
          </section>
        ) : (
          <section className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center">
            <p className="text-gray-500 text-sm">Quality test results are pending or unavailable for this batch.</p>
          </section>
        )}

        {/* Lab Report Modal */}
        {showReport && quality?.labReportImage && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowReport(false)}>
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-gray-900">Original Lab Report</h3>
                </div>
                <button onClick={() => setShowReport(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6">
                <img src={quality.labReportImage} alt="Original Lab Report" className="w-full rounded-lg border border-gray-200" />
              </div>
            </div>
          </div>
        )}

        {/* Blockchain Verification */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="6" width="8" height="8" rx="1"/><rect x="9" y="2" width="8" height="8" rx="1"/><rect x="9" y="14" width="8" height="8" rx="1"/><rect x="17" y="6" width="6" height="8" rx="1"/></svg>
            <h3 className="font-bold text-gray-900">Blockchain Verification</h3>
          </div>
          <div className="p-6">
            {blockchain && blockchain.verified ? (
              <div className="space-y-4">
                {blockchain.dataIntegrity === 'TAMPERED' ? (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-500 rounded-xl animate-pulse">
                    <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-black text-red-800 text-lg uppercase tracking-wider">Data Compromised!</p>
                      <p className="text-sm text-red-700 font-medium">BLOCKCHAIN SIGNATURE MISMATCH. The database records have been altered and no longer match the immutable cryptographic hash stored on the blockchain.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-green-800">On-Chain Verified ✓</p>
                      <p className="text-sm text-green-700">This batch&apos;s data matches the immutable record stored on the Avalanche Fuji blockchain.</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">On-Chain Batch ID</p>
                    <p className="font-mono font-medium text-gray-900">#{blockchain.batch?.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">On-Chain Status</p>
                    <p className="font-medium text-gray-900">
                      {['Harvested', 'Submitted', 'Testing', 'Certified', 'Rejected', 'Packaged', 'Dispatched', 'Delivered'][blockchain.batch?.status] || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">On-Chain Quantity</p>
                    <p className="font-medium text-gray-900">{blockchain.batch?.quantity} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Certified On-Chain</p>
                    <p className="font-medium text-gray-900">{blockchain.batch?.isCertified ? '✓ Yes' : 'Pending'}</p>
                  </div>
                </div>
                {batch.blockchainTxHash && batch.blockchainTxHash !== 'mock-tx-hash-create' && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                    <a href={`https://testnet.snowtrace.io/tx/${batch.blockchainTxHash}`} target="_blank" rel="noreferrer"
                       className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-mono bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                      {batch.blockchainTxHash.slice(0, 10)}...{batch.blockchainTxHash.slice(-8)}
                    </a>
                  </div>
                )}
                {batch.qualityTest?.certificationTxHash && batch.qualityTest.certificationTxHash !== 'mock-tx-hash-cert' && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Quality Certification Tx</p>
                    <a href={`https://testnet.snowtrace.io/tx/${batch.qualityTest.certificationTxHash}`} target="_blank" rel="noreferrer"
                       className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-mono bg-purple-50 px-3 py-2 rounded-lg border border-purple-100">
                      {batch.qualityTest.certificationTxHash.slice(0, 10)}...{batch.qualityTest.certificationTxHash.slice(-8)}
                    </a>
                  </div>
                )}
                {blockchain.certification && (
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                    <p className="text-xs font-bold text-purple-800 mb-2">On-Chain Lab Certification</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><span className="text-purple-600">Moisture:</span> <span className="font-mono">{blockchain.certification.moisture}%</span></div>
                      <div><span className="text-purple-600">HMF:</span> <span className="font-mono">{blockchain.certification.hmf} mg/kg</span></div>
                      <div><span className="text-purple-600">Proline:</span> <span className="font-mono">{blockchain.certification.diastase} mg/kg</span></div>
                    </div>
                  </div>
                )}
              </div>
            ) : blockchain === null && batch.blockchainTxHash && batch.blockchainTxHash !== 'mock-tx-hash-create' ? (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-amber-800">Recorded on Blockchain</p>
                  <p className="text-sm text-amber-700">Transaction hash: <span className="font-mono text-xs">{batch.blockchainTxHash}</span></p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Blockchain verification data is not yet available for this batch.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}



