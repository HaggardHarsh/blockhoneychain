'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, Package, CheckCircle2, Droplets, Plus, AlertTriangle, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { batchApi, hiveApi, fraudApi } from '@/lib/api';
import { StatsCard } from '@/components/StatsCard';
import { StatusBadge } from '@/components/StatusBadge';

export default function BeekeeperDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ hives: 0, activeBatches: 0, certifiedBatches: 0, totalHoney: 0 });
  const [recentBatches, setRecentBatches] = useState<any[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [disputeText, setDisputeText] = useState('');
  const [disputingId, setDisputingId] = useState<string | null>(null);
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [hivesRes, batchesRes] = await Promise.all([hiveApi.listMine(), batchApi.listMine()]);
        const hives = hivesRes.data || [];
        const batches = batchesRes.data || [];
        
        setStats({
          hives: hives.length,
          activeBatches: batches.filter((b: any) => !['CERTIFIED', 'DELIVERED', 'REJECTED'].includes(b.status)).length,
          certifiedBatches: batches.filter((b: any) => ['CERTIFIED', 'DELIVERED'].includes(b.status)).length,
          totalHoney: batches.reduce((sum: number, b: any) => sum + (b.quantityKg || 0), 0)
        });
        
        setRecentBatches(batches.slice(0, 3));

        // Load fraud alerts for this beekeeper
        try {
          const alertsRes = await fraudApi.getMyAlerts();
          setFraudAlerts(alertsRes.data || []);
        } catch (e) {
          // Ignore if no alerts
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleDispute = async (alertId: string) => {
    if (!disputeText || disputeText.trim().length < 10) {
      alert('Please provide a detailed explanation (at least 10 characters)');
      return;
    }
    setDisputeSubmitting(true);
    try {
      const res = await fraudApi.submitDispute(alertId, disputeText);
      if (res.success) {
        alert('Dispute submitted successfully! Admin will review your response.');
        setDisputingId(null);
        setDisputeText('');
        // Refresh alerts
        const alertsRes = await fraudApi.getMyAlerts();
        setFraudAlerts(alertsRes.data || []);
      } else {
        alert(res.message || 'Failed to submit dispute');
      }
    } catch (err) {
      alert('Failed to submit dispute');
    } finally {
      setDisputeSubmitting(false);
    }
  };

  const isFlagged = user?.profile?.status === 'FLAGGED';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* FRAUD FLAG WARNING BANNER */}
      {isFlagged && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-7 h-7 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-extrabold text-red-800">⚠️ Your Account Has Been Flagged</h2>
              <p className="text-red-700 mt-1">
                Our automated fraud detection system has flagged suspicious activity on your account. 
                Your account is temporarily restricted. You can raise a dispute below to explain the situation. 
                An admin will review your response before making a final decision.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FRAUD ALERTS WITH DISPUTE OPTION */}
      {fraudAlerts.length > 0 && (
        <div className="space-y-4">
          {fraudAlerts.map((alert: any) => (
            <div key={alert._id} className="bg-white rounded-2xl border-2 border-red-200 shadow-sm overflow-hidden">
              <div className="p-5 bg-red-50/50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Fraud Alert — Batch {alert.batch?.batchCode}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Floral Source: {alert.batch?.floralSource}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    alert.status === 'CONFIRMED' ? 'bg-red-100 text-red-800' :
                    alert.status === 'DISPUTED' ? 'bg-yellow-100 text-yellow-800' :
                    alert.status === 'CLEARED' ? 'bg-green-100 text-green-800' :
                    alert.status === 'SUSPENSION_CONFIRMED' ? 'bg-red-200 text-red-900' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {alert.status === 'CONFIRMED' ? '⏳ Awaiting Your Response' :
                     alert.status === 'DISPUTED' ? '📝 Dispute Under Review' :
                     alert.status === 'CLEARED' ? '✅ Cleared' :
                     alert.status === 'SUSPENSION_CONFIRMED' ? '🚫 Suspended' :
                     alert.status}
                  </span>
                </div>

                <div className="text-sm text-gray-700 space-y-1 mb-3">
                  <p className="font-medium text-gray-900">Detected Issues:</p>
                  {alert.flags?.map((flag: any, i: number) => (
                    <p key={i} className="pl-4 text-red-700">• {flag.description}</p>
                  ))}
                </div>

                {alert.adminNotes && (
                  <div className="text-sm bg-white/60 p-3 rounded-lg border border-red-100 mb-3">
                    <span className="font-bold text-gray-700">Admin Notes: </span>
                    <span className="text-gray-600">{alert.adminNotes}</span>
                  </div>
                )}

                {/* Dispute Form - only show for CONFIRMED alerts */}
                {alert.status === 'CONFIRMED' && (
                  <div className="mt-4">
                    {disputingId === alert._id ? (
                      <div className="space-y-3">
                        <textarea
                          className="w-full px-4 py-3 border-2 border-red-200 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                          rows={4}
                          placeholder="Explain why this is a false alarm. Provide details about your harvest location, floral source, etc. (Minimum 10 characters)"
                          value={disputeText}
                          onChange={(e) => setDisputeText(e.target.value)}
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDispute(alert._id)}
                            disabled={disputeSubmitting}
                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                            {disputeSubmitting ? 'Submitting...' : 'Submit Dispute'}
                          </button>
                          <button
                            onClick={() => { setDisputingId(null); setDisputeText(''); }}
                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDisputingId(alert._id)}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Raise a Dispute
                      </button>
                    )}
                  </div>
                )}

                {/* Show dispute reason if already disputed */}
                {alert.status === 'DISPUTED' && alert.disputeReason && (
                  <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <span className="font-bold text-yellow-800 text-sm">Your Dispute: </span>
                    <span className="text-sm text-yellow-900">{alert.disputeReason}</span>
                    <p className="text-xs text-yellow-600 mt-1">Submitted on {new Date(alert.disputeDate).toLocaleDateString()}</p>
                  </div>
                )}

                {/* Cleared message */}
                {alert.status === 'CLEARED' && (
                  <div className="mt-3 bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 font-bold">✅ Your account has been cleared. This was a false alarm.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome back, {(user?.fullName || user?.name || 'Beekeeper').split(' ')[0]}! 🍯</h1>
          <p className="text-gray-500 mt-1">Here is what is happening with your hives today.</p>
        </div>
        <StatusBadge status={user?.profile?.status || 'PENDING'} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Total Hives" value={stats.hives} icon={Box} color="amber" />
        <StatsCard title="Active Batches" value={stats.activeBatches} icon={Package} color="blue" />
        <StatsCard title="Certified" value={stats.certifiedBatches} icon={CheckCircle2} color="green" />
        <StatsCard title="Honey (kg)" value={stats.totalHoney} icon={Droplets} color="amber" />
      </div>

      <div className="flex gap-4">
        <Link href="/dashboard/beekeeper/batches/new" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-sm transition-colors">
          <Plus className="w-5 h-5" /> New Batch
        </Link>
        <Link href="/dashboard/beekeeper/hives/new" className="flex-1 bg-white hover:bg-gray-50 text-amber-900 border border-amber-200 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-sm transition-colors">
          <Plus className="w-5 h-5" /> Add Hive
        </Link>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Batches</h2>
          <Link href="/dashboard/beekeeper/batches" className="text-sm font-medium text-amber-600">View All</Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {recentBatches.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No batches yet. Create your first one!</div>
          ) : (
            recentBatches.map(batch => (
              <div key={batch.id} className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-900">{batch.batchCode}</div>
                  <div className="text-sm text-gray-500">{batch.floralSource} • {batch.quantityKg} kg</div>
                </div>
                <StatusBadge status={batch.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
