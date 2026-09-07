'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, Upload, FileText, X, Loader2, Sparkles, XCircle } from 'lucide-react';
import { batchApi, qualityApi } from '@/lib/api';

export default function SubmitTestPage({ params }: { params: { batchId: string } }) {
  const router = useRouter();
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [extractionMessage, setExtractionMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    labName: 'National Honey Testing Lab', reportNumber: 'REP-' + Math.floor(Math.random()*100000),
    reducingSugar: '', sucrose: '', moisture: '', ash: '', fiehesTest: 'Negative',
    hmf: '', fgRatio: '', specificGravity: '', acidity: '', proline: '', remarks: ''
  });

  useEffect(() => { batchApi.get(params.batchId).then(res => setBatch(res.data)).catch(console.error); }, [params.batchId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setUploadedImage(base64); setExtracting(true); setExtractionMessage('AI is reading your lab report...');
      try {
        const res = await qualityApi.extractReport(base64);
        if (res.success && res.data) {
          const d = res.data;
          setFormData(prev => ({
            ...prev,
            labName: d.labName || prev.labName, reportNumber: d.reportNumber || prev.reportNumber,
            reducingSugar: d.reducingSugar != null ? String(d.reducingSugar) : prev.reducingSugar,
            sucrose: d.sucrose != null ? String(d.sucrose) : prev.sucrose,
            moisture: d.moisture != null ? String(d.moisture) : prev.moisture,
            ash: d.ash != null ? String(d.ash) : prev.ash,
            fiehesTest: d.fiehesTest || prev.fiehesTest,
            hmf: d.hmf != null ? String(d.hmf) : prev.hmf,
            fgRatio: d.fgRatio != null ? String(d.fgRatio) : prev.fgRatio,
            specificGravity: d.specificGravity != null ? String(d.specificGravity) : prev.specificGravity,
            acidity: d.acidity != null ? String(d.acidity) : prev.acidity,
            proline: d.proline != null ? String(d.proline) : prev.proline,
            remarks: d.remarks || prev.remarks
          }));
          const fieldsFound = Object.values(d).filter(v => v !== null && v !== undefined).length;
          setExtractionMessage('AI extracted ' + fieldsFound + ' fields. Please review and submit.');
        } else { setExtractionMessage('Could not extract data. Please fill manually.'); }
      } catch (err: any) { setExtractionMessage('AI extraction failed. Please fill manually.'); } finally { setExtracting(false); }
    };
    reader.readAsDataURL(file);
  };

  const removeUpload = () => { setUploadedImage(null); setExtractionMessage(''); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if(!confirm('Submit final results to blockchain?')) return;
    setLoading(true);
    try {
      const payload = {
        ...formData,
        reducingSugar: parseFloat(formData.reducingSugar), sucrose: parseFloat(formData.sucrose),
        moisture: parseFloat(formData.moisture), ash: parseFloat(formData.ash),
        hmf: parseFloat(formData.hmf), fgRatio: parseFloat(formData.fgRatio),
        specificGravity: parseFloat(formData.specificGravity), acidity: parseFloat(formData.acidity),
        proline: parseFloat(formData.proline), labReportImage: uploadedImage || null
      };
      const res = await qualityApi.submitTest(params.batchId, payload);
      if (!res.success) throw new Error(res.message || 'Failed to submit test');
      setSuccess(true);
    } catch(err: any) { alert(err.message || 'Failed to submit test'); } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center mt-12 bg-white p-8 rounded-2xl shadow-sm border border-green-100">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Results Submitted!</h2>
        <p className="text-gray-500 mb-6">Test results anchored to blockchain.</p>
        <Link href="/dashboard/lab" className="block w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Back to Dashboard</Link>
      </div>
    );
  }

  if (!batch) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  if (['CERTIFIED', 'REJECTED'].includes(batch.status) && batch.qualityTest) {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/lab/reports" className="p-2 -ml-2 rounded-full hover:bg-gray-200"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-bold text-gray-900">Lab Report Results</h1>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-gray-500">Batch Code</p>
              <p className="text-xl font-mono font-bold">{batch.batchCode}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Status</p>
              <p className={`font-bold ${batch.status === 'CERTIFIED' ? 'text-green-600' : 'text-red-600'}`}>{batch.status}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(batch.qualityTest.parameters).map(([key, val]: any) => (
              <div key={key} className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="text-lg font-bold flex items-center gap-2">
                  {val.value}
                  {val.pass ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                </p>
              </div>
            ))}
          </div>
          {batch.qualityTest.labReportImage && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Uploaded Document</h3>
              <img src={batch.qualityTest.labReportImage} alt="Lab Report" className="w-full max-w-lg rounded-xl border border-gray-200" />
            </div>
          )}
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/lab" className="p-2 -ml-2 rounded-full hover:bg-gray-200"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-900">FSSAI Quality Analysis</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center bg-gray-50">
        <div><p className="text-sm text-gray-500">Batch Code</p><p className="text-xl font-mono font-bold">{batch.batchCode}</p></div>
        <div className="text-right"><p className="text-sm text-gray-500">Declared Source</p><p className="font-bold">{batch.floralSource}</p></div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border-2 border-dashed border-purple-200 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">AI-Powered Auto-Fill</h3>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">OPTIONAL</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">Upload a FSSAI lab report. Our AI will extract all 10 FSSAI parameters.</p>
        
        {!uploadedImage ? (
          <label className="flex flex-col items-center justify-center py-8 cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50/50 transition-all">
            <Upload className="w-10 h-10 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-600">Click to upload lab report</span>
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} ref={fileInputRef} />
          </label>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img src={uploadedImage} alt="Lab Report" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-gray-900 text-sm">Lab Report Uploaded</span>
                  </div>
                  <button type="button" onClick={removeUpload} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-4 h-4 text-gray-400" /></button>
                </div>
                {extracting ? (
                  <div className="flex items-center gap-2 text-sm text-purple-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-medium">{extractionMessage}</span>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-green-600">
                    {extractionMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Physical Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moisture (%) <span className="text-xs text-gray-400">Max 20</span></label>
              <input required type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg" value={formData.moisture} onChange={e => setFormData({...formData, moisture: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specific Gravity <span className="text-xs text-gray-400">Min 1.35</span></label>
              <input required type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg" value={formData.specificGravity} onChange={e => setFormData({...formData, specificGravity: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ash (%) <span className="text-xs text-gray-400">Max 0.50</span></label>
              <input required type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg" value={formData.ash} onChange={e => setFormData({...formData, ash: e.target.value})} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Chemical & Sugar Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reducing Sugar (%) <span className="text-xs text-gray-400">Min 65</span></label>
              <input required type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg" value={formData.reducingSugar} onChange={e => setFormData({...formData, reducingSugar: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sucrose (%) <span className="text-xs text-gray-400">Max 5</span></label>
              <input required type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg" value={formData.sucrose} onChange={e => setFormData({...formData, sucrose: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">F/G Ratio <span className="text-xs text-gray-400">0.95-1.50</span></label>
              <input required type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg" value={formData.fgRatio} onChange={e => setFormData({...formData, fgRatio: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HMF (mg/kg) <span className="text-xs text-gray-400">Max 80</span></label>
              <input required type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg" value={formData.hmf} onChange={e => setFormData({...formData, hmf: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Acidity (%) <span className="text-xs text-gray-400">Max 0.20</span></label>
              <input required type="number" step="0.001" className="w-full px-4 py-2 border rounded-lg" value={formData.acidity} onChange={e => setFormData({...formData, acidity: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proline (mg/kg) <span className="text-xs text-gray-400">Min 180</span></label>
              <input required type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg" value={formData.proline} onChange={e => setFormData({...formData, proline: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fiehe's Test <span className="text-xs text-gray-400">Must be Negative</span></label>
              <select className="w-full px-4 py-2 border rounded-lg" value={formData.fiehesTest} onChange={e => setFormData({...formData, fiehesTest: e.target.value})}>
                <option value="Negative">Negative (Pass)</option>
                <option value="Positive">Positive (Fail)</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm mt-8">
          {loading ? 'Submitting...' : 'Submit & Certify on Blockchain'}
        </button>
      </form>
    </div>
  );
}
