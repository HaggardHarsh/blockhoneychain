'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Navigation, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { hiveApi } from '@/lib/api';

export default function NewHivePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    locationName: '',
    floralSource: 'Multifloral',
    installDate: new Date().toISOString().split('T')[0],
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(false);

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString()
        }));
      }, (err) => {
        alert('Could not get location. Please enter manually if needed.');
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await hiveApi.create({
        locationName: formData.locationName,
        floralSource: formData.floralSource,
        installDate: new Date(formData.installDate).toISOString(),
        coordinates: (formData.latitude && formData.longitude) ? {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        } : undefined
      });
      router.push('/dashboard/beekeeper/hives');
    } catch (err) {
      console.error(err);
      alert('Failed to add hive');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/beekeeper/hives" className="p-2 -ml-2 rounded-full hover:bg-gray-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Hive</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
            <input required type="text" placeholder="e.g., North Field, Orchard" className="w-full px-4 py-3 border rounded-xl" value={formData.locationName} onChange={e => setFormData({...formData, locationName: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Floral Source</label>
            <select className="w-full px-4 py-3 border rounded-xl" value={formData.floralSource} onChange={e => setFormData({...formData, floralSource: e.target.value})}>
              {['Multifloral', 'Mustard', 'Litchi', 'Jamun', 'Eucalyptus', 'Sunflower'].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Install Date</label>
            <input required type="date" className="w-full px-4 py-3 border rounded-xl" value={formData.installDate} onChange={e => setFormData({...formData, installDate: e.target.value})} />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">GPS Coordinates (Optional)</label>
              <button type="button" onClick={handleLocation} className="text-xs flex items-center gap-1 text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                <Navigation className="w-3 h-3" /> Use current
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" step="any" placeholder="Latitude" className="w-full px-4 py-3 border rounded-xl text-sm" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} />
              <input type="number" step="any" placeholder="Longitude" className="w-full px-4 py-3 border rounded-xl text-sm" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 mt-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm">
            {loading ? 'Adding...' : 'Add Hive'}
          </button>
        </form>
      </div>
    </div>
  );
}
