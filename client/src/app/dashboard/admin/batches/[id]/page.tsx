'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, MapPin, Map, Calendar, Camera, FileText, Package, User, Shield, ExternalLink } from 'lucide-react';
import { batchApi } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';

export default function AdminBatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    batchApi.get(params.id as string).then(res => {
      setBatch(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div></div>;
  if (!batch) return <div className="p-8 text-center text-gray-500">Batch not found</div>;

  const beekeeper = batch.beekeeper || {};
  const quality = batch.qualityTest || null;

  const ParamRow = ({ label, param, unit }: { label: string; param: any; unit?: string }) => {
    if (!param) return null;
    return (
      <tr className="border-b border-gray-50 hover:bg-gray-50/50">
        <td className="px-4 py-3 text-sm font-medium text-gray-900">{label}</td>
        <td className="px-4 py-3 text-sm text-gray-700">{param.value}{unit ? ` ${unit}` : ''}</td>
        <td className="px-4 py-3 text-right">
          {param.pass !== undefined && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${param.pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {param.pass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {param.pass ? 'PASS' : 'FAIL'}
            </span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Batch {batch.batchCode}</h1>
            <p className="text-sm text-gray-500">Admin Review</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={batch.status} />
          <Link href={`/verify/${batch.batchCode}`} target="_blank" className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
            <ExternalLink className="w-4 h-4" /> Public Page
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* Batch Overview */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-gray-900">Batch Overview</h3>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Harvest Date</p>
              <p className="font-medium text-gray-900">{new Date(batch.harvestDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Raw Quantity</p>
              <p className="font-medium text-gray-900">{batch.rawQuantityKg} kg</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Floral Source</p>
              <p className="font-medium text-gray-900">{batch.floralSource}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Extraction Method</p>
              <p className="font-medium text-gray-900">{batch.extractionMethod}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Source Hives</p>
              <p className="font-medium text-gray-900">{batch.hives?.length || 0} hives</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Registered On</p>
              <p className="font-medium text-gray-900">{new Date(batch.createdAt).toLocaleDateString()}</p>
            </div>
            {batch.blockchainTxHash && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-1">Blockchain Tx Hash</p>
                <p className="font-mono text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 break-all">{batch.blockchainTxHash}</p>
              </div>
            )}
          </div>
        </section>

        {/* Beekeeper Info */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-gray-900">Beekeeper Information</h3>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Name</p>
              <p className="font-medium text-gray-900">{beekeeper.fullName || beekeeper.user?.fullName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">KVIC Registration</p>
              <p className="font-mono text-sm text-gray-700">{beekeeper.kvicRegistrationId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <p className="font-medium text-gray-900">
                {beekeeper.address?.village ? `${beekeeper.address.village}, ` : ''}
                {beekeeper.address?.district ? `${beekeeper.address.district}, ` : ''}
                {beekeeper.address?.state || 'N/A'}
              </p>
            </div>
          </div>
        </section>

        {/* Harvest Proof */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-gray-900">Harvest Proof & Evidence</h3>
          </div>
          <div className="p-6">
            {batch.harvestProofImage ? (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Proof Photo</p>
                <img src={batch.harvestProofImage} alt="Harvest Proof" className="w-full max-h-96 object-contain rounded-xl border border-gray-200 bg-gray-50" />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
                <Camera className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No harvest proof photo was uploaded for this batch.</p>
              </div>
            )}

            {batch.harvestLocation && batch.harvestLocation.coordinates && batch.harvestLocation.coordinates[0] !== 0 ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <Map className="w-4 h-4 text-blue-500" />
                Verified GPS Location: {batch.harvestLocation.coordinates[1]?.toFixed(5)}, {batch.harvestLocation.coordinates[0]?.toFixed(5)}
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <MapPin className="w-4 h-4" />
                No GPS location recorded.
              </div>
            )}

            {batch.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-900 mb-1">Beekeeper Notes</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">{batch.notes}</p>
              </div>
            )}
          </div>
        </section>

        {/* Full Quality Report */}
        {quality ? (
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-gray-900">Full Quality Report</h3>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 ${
                quality.overallResult === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {quality.overallResult === 'PASS' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {quality.overallResult}
              </span>
            </div>
            <div className="p-6">
              {/* Lab Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-100">
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
                  <p className="font-medium text-gray-900 flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(quality.testDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tested By</p>
                  <p className="font-medium text-gray-900">{quality.testedBy?.fullName || quality.testedBy?.email || 'Lab Analyst'}</p>
                </div>
              </div>

              {/* Parameters Table */}
              <h4 className="text-sm font-bold text-gray-900 mb-3">FSSAI Parameter Results</h4>
              <div className="overflow-x-auto border border-gray-200 rounded-xl mb-6">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Parameter</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Value</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    <ParamRow label="Moisture Content" param={quality.parameters?.moisture} unit="%" />
                    <ParamRow label="HMF (Hydroxymethylfurfural)" param={quality.parameters?.hmf} unit="mg/kg" />
                    <ParamRow label="Diastase Activity" param={quality.parameters?.diastaseActivity} unit="DN" />
                    <ParamRow label="Reducing Sugars" param={quality.parameters?.reducingSugars} unit="%" />
                    <ParamRow label="Sucrose" param={quality.parameters?.sucrose} unit="%" />
                    <ParamRow label="Fructose/Glucose Ratio" param={quality.parameters?.fructoseGlucoseRatio} />
                    <ParamRow label="C4 Sugars" param={quality.parameters?.c4Sugars} unit="%" />
                    <ParamRow label="Fiehe's Test" param={quality.parameters?.fiehesTest} />
                    <ParamRow label="Heavy Metals — Lead" param={quality.parameters?.heavyMetals?.lead} unit="ppm" />
                    <ParamRow label="Heavy Metals — Arsenic" param={quality.parameters?.heavyMetals?.arsenic} unit="ppm" />
                    {quality.parameters?.antibioticResidues && (
                      <tr className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Antibiotic Residues</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{quality.parameters.antibioticResidues.detected ? 'Detected' : 'Not Detected'}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${!quality.parameters.antibioticResidues.detected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {!quality.parameters.antibioticResidues.detected ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {!quality.parameters.antibioticResidues.detected ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pollen Analysis */}
              {quality.parameters?.pollenAnalysis && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Pollen Analysis</h4>
                  <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Dominant Pollen</p>
                      <p className="font-medium text-gray-900">{quality.parameters.pollenAnalysis.dominantPollen || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pollen Count</p>
                      <p className="font-medium text-gray-900">{quality.parameters.pollenAnalysis.pollenCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Floral Type</p>
                      <p className="font-medium text-gray-900">{quality.parameters.pollenAnalysis.floralType || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Remarks */}
              {quality.remarks && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Lab Remarks</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">{quality.remarks}</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="bg-gray-50 rounded-2xl border border-gray-200 p-8 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Quality test results are pending or not yet submitted for this batch.</p>
          </section>
        )}

        {/* Status Timeline */}
        {batch.statusHistory && batch.statusHistory.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-gray-900">Status Timeline</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {batch.statusHistory.map((entry: any, i: number) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${i === batch.statusHistory.length - 1 ? 'bg-amber-500' : 'bg-gray-300'}`} />
                      {i < batch.statusHistory.length - 1 && <div className="w-0.5 h-8 bg-gray-200" />}
                    </div>
                    <div>
                      <StatusBadge status={entry.status} />
                      <p className="text-xs text-gray-500 mt-1">{new Date(entry.timestamp).toLocaleString()}</p>
                      {entry.notes && <p className="text-xs text-gray-400 mt-0.5">{entry.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
