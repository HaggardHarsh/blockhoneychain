'use client';
import React, { useEffect, useState } from 'react';
import { Users, Package, AlertCircle, ShieldCheck, Droplets } from 'lucide-react';
import { adminApi, fraudApi } from '@/lib/api';
import { StatsCard } from '@/components/StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getDashboard(),
      fraudApi.getAlerts('status=OPEN')
    ]).then(([dashboardRes, alertsRes]) => {
      setData(dashboardRes.data);
      setFraudAlerts((alertsRes.data || []).slice(0, 3));
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div></div>;

  const barData = [
    { name: 'Harvested', count: 45 },
    { name: 'Testing', count: 12 },
    { name: 'Certified', count: 180 },
    { name: 'Delivered', count: 120 },
  ];

  const pieData = [
    { name: 'Passed', value: 92 },
    { name: 'Failed', value: 8 },
  ];
  const COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Beekeepers" value={data?.totalBeekeepers || 0} icon={Users} color="blue" />
        <StatsCard title="Pending Approvals" value={data?.pendingApprovals || 0} icon={AlertCircle} color="amber" />
        <StatsCard title="Total Batches" value={data?.totalBatches || 0} icon={Package} color="purple" />
        <StatsCard title="Certified Rate" value={`${data?.certifiedRate || 0}%`} icon={ShieldCheck} color="green" />
        <StatsCard title="Total Honey (kg)" value={data?.totalHoneyKg || 0} icon={Droplets} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Batch Status Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Fraud Alerts</h3>
            <a href="/dashboard/admin/fraud" className="text-sm font-bold text-amber-600 hover:text-amber-700">View All</a>
          </div>
          {fraudAlerts.length > 0 ? (
            <div className="space-y-4">
              {fraudAlerts.map((alert: any) => (
                <a key={alert._id} href={`/dashboard/admin/fraud`} className="block p-4 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-bold text-gray-900">{alert.batch?.batchCode}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-red-200 text-red-800 rounded">Score: {alert.riskScore}</span>
                  </div>
                  <p className="text-sm text-gray-700">{alert.flags[0]?.description}</p>
                </a>
              ))}
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-center">
              <ShieldCheck className="w-12 h-12 text-green-400 mb-3" />
              <p className="text-gray-500 font-medium">No open fraud alerts.</p>
              <p className="text-sm text-gray-400">System is monitoring automatically.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
