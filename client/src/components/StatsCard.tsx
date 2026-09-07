import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'amber' | 'green' | 'blue' | 'purple' | 'red';
  trend?: string;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, color = 'amber', trend, className }: StatsCardProps) {
  const colorMap = {
    amber: 'text-amber-700 bg-gradient-to-br from-amber-100 to-amber-200/60',
    green: 'text-green-700 bg-gradient-to-br from-green-100 to-green-200/60',
    blue: 'text-blue-700 bg-gradient-to-br from-blue-100 to-blue-200/60',
    purple: 'text-purple-700 bg-gradient-to-br from-purple-100 to-purple-200/60',
    red: 'text-red-700 bg-gradient-to-br from-red-100 to-red-200/60',
  };

  return (
    <div className={cn('stats-card-honey p-5 rounded-2xl flex flex-col', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-amber-900/70">{title}</h3>
        <div className={cn('p-2.5 rounded-xl shadow-sm', colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-amber-950">{value}</span>
        {trend && <span className="text-sm font-medium text-green-600">{trend}</span>}
      </div>
    </div>
  );
}
