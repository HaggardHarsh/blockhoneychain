'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fraudApi } from '@/lib/api';
import { AlertTriangle, ShieldAlert, CheckCircle2, XCircle, ChevronRight, Map, TestTube, MapPin, Search, Filter } from 'lucide-react';

export default function FraudAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [filter, setFilter] = useState('OPEN');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [alertsRes, statsRes] = await Promise.all([
        fraudApi.getAlerts(filter !== 'ALL' ? `status=${filter}` : ''),
        fraudApi.getStats()
      ]);
      setAlerts(alertsRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status: string) => {
    if (!selectedAlert) return;
    if (status === 'CONFIRMED' && !confirm('This will FLAG the beekeeper. They can raise a dispute before final suspension. Continue?')) return;
    
    try {
      await fraudApi.updateAlert(selectedAlert._id, status, actionNotes);
      setSelectedAlert(null);
      setActionNotes('');
      fetchData();
    } catch (err) {
      alert('Failed to update alert');
    }
  };

  const handleFinalDecision = async (decision: string) => {
    if (!selectedAlert) return;
    const confirmMsg = decision === 'SUSPEND' 
      ? 'Are you sure you want to SUSPEND this beekeeper? This will block their account.'
      : 'Are you sure you want to CLEAR this beekeeper? Their account will be restored to APPROVED.';
    if (!confirm(confirmMsg)) return;

    try {
      await fraudApi.finalDecision(selectedAlert._id, decision, actionNotes);
      setSelectedAlert(null);
      setActionNotes('');
      fetchData();
    } catch (err) {
      alert('Failed to process final decision');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFlagIcon = (type: string) => {
    switch(type) {
      case 'PERFECT_SCORES': return <TestTube className="w-4 h-4 text-purple-500" />;
      case 'GEO_FLORAL_MISMATCH':
      case 'HARVEST_DISTANCE': return <Map className="w-4 h-4 text-orange-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-600" />
          Fraud Detection Alerts
        </h1>
        <p className="text-gray-500 mt-1">AI-powered anomaly and geo-mismatch detection</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Total Open</p>
            <p className="text-2xl font-black text-gray-900">{stats.TOTAL}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-100 shadow-sm">
            <p className="text-sm text-red-600 font-medium">Critical</p>
            <p className="text-2xl font-black text-red-700">{stats.CRITICAL}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 shadow-sm">
            <p className="text-sm text-orange-600 font-medium">High</p>
            <p className="text-2xl font-black text-orange-700">{stats.HIGH}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 shadow-sm">
            <p className="text-sm text-yellow-600 font-medium">Medium</p>
            <p className="text-2xl font-black text-yellow-700">{stats.MEDIUM}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 shadow-sm">
            <p className="text-sm text-blue-600 font-medium">Low</p>
            <p className="text-2xl font-black text-blue-700">{stats.LOW}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            {['OPEN', 'REVIEWING', 'CONFIRMED', 'DISPUTED', 'DISMISSED', 'ALL'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No fraud alerts found for this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Batch & Source</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Flags</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {alerts.map((alert) => (
                  <tr key={alert._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedAlert(alert)}>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-bold text-gray-900">{alert.batch?.batchCode || 'Unknown'}</div>
                      <div className="text-sm text-gray-500 mt-1">{alert.beekeeper?.fullName || 'Unknown Beekeeper'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <div className="text-sm font-bold text-gray-900">{alert.riskScore}/100</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {alert.flags.slice(0, 3).map((f: any, i: number) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm" title={f.type}>
                            {getFlagIcon(f.type)}
                          </div>
                        ))}
                        {alert.flags.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shadow-sm text-xs font-bold text-gray-600">
                            +{alert.flags.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-5 h-5 text-gray-400 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Alert Details <span className="font-mono text-gray-500 text-sm">#{selectedAlert._id.slice(-6)}</span>
              </h2>
              <button onClick={() => setSelectedAlert(null)} className="p-2 hover:bg-gray-200 rounded-full">
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Risk Score</p>
                  <p className="text-3xl font-black text-gray-900">{selectedAlert.riskScore}<span className="text-lg text-gray-400">/100</span></p>
                </div>
                <span className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${getSeverityColor(selectedAlert.severity)}`}>
                  {selectedAlert.severity} RISK
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500">Batch Code</p>
                  <Link href={`/dashboard/admin/batches/${selectedAlert.batch?._id}`} className="font-mono font-bold text-blue-600 hover:underline">
                    {selectedAlert.batch?.batchCode}
                  </Link>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Declared Source</p>
                  <p className="font-medium text-gray-900">{selectedAlert.batch?.floralSource}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Beekeeper</p>
                  <p className="font-medium text-gray-900">{selectedAlert.beekeeper?.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Testing Lab</p>
                  <p className="font-medium text-gray-900">{selectedAlert.qualityTest?.labName || 'N/A'}</p>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-3 border-b pb-2">Detected Anomalies</h3>
              <div className="space-y-3 mb-6">
                {selectedAlert.flags.map((flag: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg border border-red-100">
                    <div className="mt-0.5">{getFlagIcon(flag.type)}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{flag.type.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-gray-700">{flag.description}</p>
                    </div>
                    <div className="ml-auto text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                      +{flag.weight} pts
                    </div>
                  </div>
                ))}
              </div>

              {/* Show beekeeper's dispute if exists */}
              {selectedAlert.disputeReason && (
                <div className="mb-6 bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                  <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                    📝 Beekeeper&apos;s Dispute
                  </h3>
                  <p className="text-sm text-yellow-900">{selectedAlert.disputeReason}</p>
                  {selectedAlert.disputeEvidence && (
                    <p className="text-sm text-yellow-800 mt-2 italic">Evidence: {selectedAlert.disputeEvidence}</p>
                  )}
                  <p className="text-xs text-yellow-600 mt-2">Submitted on {new Date(selectedAlert.disputeDate).toLocaleDateString()}</p>
                </div>
              )}

              {/* Status info for closed alerts */}
              {['DISMISSED', 'SUSPENSION_CONFIRMED', 'CLEARED'].includes(selectedAlert.status) && (
                <div className={`p-4 rounded-xl border mb-6 ${
                  selectedAlert.status === 'CLEARED' ? 'bg-green-50 border-green-200' :
                  selectedAlert.status === 'SUSPENSION_CONFIRMED' ? 'bg-red-50 border-red-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <p className="text-sm font-bold text-gray-900 mb-1">
                    Final Status: {selectedAlert.status === 'CLEARED' ? '✅ Cleared (False Alarm)' : 
                    selectedAlert.status === 'SUSPENSION_CONFIRMED' ? '🚫 Beekeeper Suspended' : 
                    '❌ Dismissed'}
                  </p>
                  <p className="text-sm text-gray-600">Reviewed by {selectedAlert.reviewedBy?.fullName || 'Admin'} on {new Date(selectedAlert.reviewedAt).toLocaleDateString()}</p>
                  {selectedAlert.adminNotes && (
                    <p className="mt-2 text-sm text-gray-700 italic border-l-2 border-gray-300 pl-2">"{selectedAlert.adminNotes}"</p>
                  )}
                </div>
              )}

              {/* Initial review: Dismiss or Confirm (Flag beekeeper) */}
              {(selectedAlert.status === 'OPEN' || selectedAlert.status === 'REVIEWING') && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Admin Notes</label>
                  <textarea 
                    className="w-full px-4 py-2 border rounded-xl bg-gray-50 mb-4 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    rows={3}
                    placeholder="E.g., Contacted lab, verified data is accurate..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleAction('DISMISSED')}
                      className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
                    >
                      Dismiss (False Alarm)
                    </button>
                    <button 
                      onClick={() => handleAction('CONFIRMED')}
                      className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
                    >
                      Confirm &amp; Flag Beekeeper
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">Confirming will flag the beekeeper. They can raise a dispute before final suspension.</p>
                </div>
              )}

              {/* Final decision: After beekeeper disputes OR admin wants to finalize confirmed alert */}
              {(selectedAlert.status === 'CONFIRMED' || selectedAlert.status === 'DISPUTED') && (
                <div>
                  <div className={`p-3 rounded-lg mb-4 ${selectedAlert.status === 'DISPUTED' ? 'bg-yellow-50 border border-yellow-200' : 'bg-orange-50 border border-orange-200'}`}>
                    <p className="text-sm font-bold">
                      {selectedAlert.status === 'DISPUTED' 
                        ? '📝 The beekeeper has raised a dispute. Review their explanation above and make a final decision.'
                        : '⏳ Waiting for beekeeper to respond. You can also make a final decision now.'}
                    </p>
                  </div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Final Decision Notes</label>
                  <textarea 
                    className="w-full px-4 py-2 border rounded-xl bg-gray-50 mb-4 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    rows={3}
                    placeholder="E.g., Reviewed dispute, explanation not convincing..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleFinalDecision('CLEAR')}
                      className="py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
                    >
                      ✅ Clear Beekeeper
                    </button>
                    <button 
                      onClick={() => handleFinalDecision('SUSPEND')}
                      className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
                    >
                      🚫 Suspend Beekeeper
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
