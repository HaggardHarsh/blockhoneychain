import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let colorClass = 'bg-gray-100 text-gray-800';
  
  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'CERTIFIED':
    case 'APPROVED':
      colorClass = 'bg-green-100 text-green-800 border border-green-200/50';
      break;
    case 'INACTIVE':
      colorClass = 'bg-gray-100 text-gray-600';
      break;
    case 'HARVESTED':
      colorClass = 'bg-yellow-100 text-yellow-800 border border-yellow-200/50';
      break;
    case 'SUBMITTED_FOR_TEST':
      colorClass = 'bg-blue-100 text-blue-800 border border-blue-200/50';
      break;
    case 'TESTING':
      colorClass = 'bg-purple-100 text-purple-800 border border-purple-200/50';
      break;
    case 'REJECTED':
      colorClass = 'bg-red-100 text-red-800 border border-red-200/50';
      break;
    case 'PACKAGED':
      colorClass = 'bg-teal-100 text-teal-800 border border-teal-200/50';
      break;
    case 'DISPATCHED':
      colorClass = 'bg-orange-100 text-orange-800 border border-orange-200/50';
      break;
    case 'DELIVERED':
      colorClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200/50';
      break;
    case 'PENDING':
      colorClass = 'bg-amber-100 text-amber-800 border border-amber-200/50';
      break;
    case 'FLAGGED':
      colorClass = 'bg-red-100 text-red-800 border border-red-300 animate-pulse';
      break;
    case 'SUSPENDED':
      colorClass = 'bg-red-200 text-red-900 border border-red-300';
      break;
  }

  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide', colorClass, className)}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
