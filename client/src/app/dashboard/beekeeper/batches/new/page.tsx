'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Camera, MapPin, Loader2 } from 'lucide-react';
import { hiveApi, batchApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function NewBatchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [hives, setHives] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [formData, setFormData] = useState({
    hiveIds: [] as string[],
    floralSource: '',
    harvestDate: new Date().toISOString().split('T')[0],
    quantityKg: '',
    extractionMethod: 'CENTRIFUGAL',
    notes: '',
    harvestProofImage: '',
    harvestLocation: null as { lat: number; lng: number } | null,
  });

  useEffect(() => {
    hiveApi.listMine().then(res => setHives(res.data?.filter((h: any) => h.status === 'ACTIVE') || []));
  }, []);

  const handleHiveToggle = (id: string) => {
    setFormData(prev => {
      const newIds = prev.hiveIds.includes(id) ? prev.hiveIds.filter(i => i !== id) : [...prev.hiveIds, id];
      let newFloral = prev.floralSource;
      if (newIds.length > 0 && !prev.floralSource) {
        const firstHive = hives.find(h => h._id === newIds[0]);
        if (firstHive) newFloral = firstHive.floralSource;
      }
      return { ...prev, hiveIds: newIds, floralSource: newFloral };
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, harvestProofImage: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const captureGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          harvestLocation: { lat: position.coords.latitude, lng: position.coords.longitude }
        }));
        setGpsLoading(false);
      },
      (err) => {
        setError('Unable to capture GPS location. Please allow location access.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.hiveIds.length === 0) { setError('Select at least one source hive'); return; }
    if (!formData.harvestProofImage) { setError('Please upload a harvest proof photo'); return; }
    if (!formData.harvestLocation) { setError('Please capture your GPS location for verification'); return; }

    setLoading(true);
    try {
      const res = await batchApi.create({
        hiveIds: formData.hiveIds,
        floralSource: formData.floralSource,
        harvestDate: new Date(formData.harvestDate).toISOString(),
        rawQuantityKg: parseFloat(formData.quantityKg),
        extractionMethod: formData.extractionMethod,
        notes: formData.notes,
        harvestProofImage: formData.harvestProofImage,
        harvestLocation: {
          type: 'Point',
          coordinates: [formData.harvestLocation.lng, formData.harvestLocation.lat]
        }
      });
      if (!res.success) {
        throw new Error(res.message || 'Failed to create batch');
      }
      setSuccess(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center mt-12 bg-white p-8 rounded-2xl shadow-sm border border-green-100">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Batch Created Successfully!</h2>
        <p className="text-gray-500 mb-6">Your batch has been recorded on the blockchain.</p>
        
        <div className="bg-gray-50 p-6 rounded-xl mb-4">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Batch Code</p>
          <div className="flex items-center justify-center gap-2 text-2xl font-mono font-bold text-gray-900">
            {success.batchCode}
          </div>
        </div>

        {success.blockchainTxHash && (
          <div className="bg-blue-50 p-4 rounded-xl mb-6 text-left">
            <p className="text-xs text-blue-600 uppercase tracking-wider mb-1 font-bold">Blockchain Tx Hash</p>
            <p className="text-xs font-mono text-blue-800 break-all">{success.blockchainTxHash}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link href={`/verify/${success.batchCode}`} className="block w-full py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600">
            View Public Verification Page
          </Link>
          <Link href="/dashboard/beekeeper/batches" className="block w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50">
            Back to My Batches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/beekeeper/batches" className="p-2 -ml-2 rounded-full hover:bg-gray-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Record New Harvest</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Source Hives */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Source Hives</label>
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-100">
              {hives.length === 0 ? <p className="text-sm text-gray-500 col-span-2">No active hives available.</p> : null}
              {hives.map(hive => (
                <label key={hive._id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.hiveIds.includes(hive._id) ? 'bg-amber-50 border-amber-500' : 'bg-white border-gray-200 hover:border-amber-300'}`}>
                  <input type="checkbox" className="rounded text-amber-500 focus:ring-amber-500" checked={formData.hiveIds.includes(hive._id)} onChange={() => handleHiveToggle(hive._id)} />
                  <div>
                    <div className="text-sm font-bold text-gray-900">{hive.hiveCode}</div>
                    <div className="text-xs text-gray-500">{hive.floralSource}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floral Source</label>
              <input required type="text" className="w-full px-4 py-3 border rounded-xl" value={formData.floralSource} onChange={e => setFormData({...formData, floralSource: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
              <input required type="date" className="w-full px-4 py-3 border rounded-xl" value={formData.harvestDate} onChange={e => setFormData({...formData, harvestDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
              <input required type="number" step="0.1" min="0.1" className="w-full px-4 py-3 border rounded-xl" value={formData.quantityKg} onChange={e => setFormData({...formData, quantityKg: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Extraction Method</label>
              <select className="w-full px-4 py-3 border rounded-xl" value={formData.extractionMethod} onChange={e => setFormData({...formData, extractionMethod: e.target.value})}>
                <option value="MANUAL">Manual</option>
                <option value="CENTRIFUGAL">Centrifugal</option>
                <option value="CRUSH_STRAIN">Crush & Strain</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea className="w-full px-4 py-3 border rounded-xl resize-none" rows={2} placeholder="Any additional notes about the harvest..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>

          {/* Harvest Proof Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harvest Proof Photo <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">Upload a photo of the harvest for blockchain verification</p>
            {formData.harvestProofImage ? (
              <div className="relative">
                <img src={formData.harvestProofImage} alt="Harvest proof" className="w-full h-48 object-cover rounded-xl border border-green-300" />
                <button type="button" onClick={() => setFormData(prev => ({...prev, harvestProofImage: ''}))} className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-600">Remove</button>
                <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Photo attached
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-amber-300 rounded-xl bg-amber-50 cursor-pointer hover:bg-amber-100 transition-colors">
                <Camera className="w-8 h-8 text-amber-500 mb-2" />
                <span className="text-sm font-medium text-amber-700">Click to upload photo</span>
                <span className="text-xs text-amber-500 mt-1">Max 5MB • JPG, PNG</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>

          {/* GPS Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harvest Location (GPS) <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">Capture your current location for geo-verification</p>
            {formData.harvestLocation ? (
              <div className="flex flex-col gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-bold text-green-800">Location captured (Editable for Demo)</p>
                    <p className="text-xs text-green-600">
                      You ({user?.fullName || 'Beekeeper'}) are registered at 
                      Lat: {user?.profile?.location?.coordinates?.[1] || 0}, 
                      Lng: {user?.profile?.location?.coordinates?.[0] || 0}.
                    </p>
                  </div>
                  <button type="button" onClick={captureGPS} className="ml-auto text-xs text-green-700 underline hover:text-green-900">Recapture</button>
                </div>
                <div className="flex gap-4 mt-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-green-800 mb-1 block">Latitude</label>
                    <input 
                      type="number" step="any" 
                      className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm bg-white"
                      value={formData.harvestLocation.lat}
                      onChange={e => setFormData({ ...formData, harvestLocation: { ...formData.harvestLocation!, lat: parseFloat(e.target.value) } })}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-green-800 mb-1 block">Longitude</label>
                    <input 
                      type="number" step="any" 
                      className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm bg-white"
                      value={formData.harvestLocation.lng}
                      onChange={e => setFormData({ ...formData, harvestLocation: { ...formData.harvestLocation!, lng: parseFloat(e.target.value) } })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={captureGPS}
                disabled={gpsLoading}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {gpsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                {gpsLoading ? 'Capturing location...' : 'Capture GPS Location'}
              </button>
            )}
          </div>

          <button type="submit" disabled={loading || formData.hiveIds.length === 0} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Recording on Blockchain...' : 'Register Batch'}
          </button>
        </form>
      </div>
    </div>
  );
}
