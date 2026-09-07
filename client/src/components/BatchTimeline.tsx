import React from 'react';
import { ExternalLink, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  status: string;
  timestamp?: string;
  date?: string;
  notes?: string;
  actor?: string;
  txHash?: string;
}

interface BatchTimelineProps {
  history: TimelineEvent[];
}

export function BatchTimeline({ history }: BatchTimelineProps) {
  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (['CERTIFIED', 'DELIVERED'].includes(s)) return 'bg-green-500 border-green-500';
    if (['REJECTED'].includes(s)) return 'bg-red-500 border-red-500';
    if (['TESTING', 'SUBMITTED_FOR_TEST'].includes(s)) return 'bg-blue-500 border-blue-500';
    return 'bg-amber-500 border-amber-500';
  };

  const getStatusIcon = (status: string) => {
    const s = status.toUpperCase();
    if (['CERTIFIED', 'DELIVERED'].includes(s)) return <CheckCircle2 className="w-4 h-4 text-white" />;
    if (['REJECTED'].includes(s)) return <AlertCircle className="w-4 h-4 text-white" />;
    return <Clock className="w-4 h-4 text-white" />;
  };

  return (
    <div className="relative pl-6 border-l-2 border-amber-100 space-y-8 my-6">
      {history.map((event, idx) => (
        <div key={idx} className="relative">
          <div className={cn('absolute -left-[35px] w-8 h-8 rounded-full border-4 border-white flex items-center justify-center', getStatusColor(event.status))}>
            {getStatusIcon(event.status)}
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-gray-900 capitalize">{event.status.replace(/_/g, ' ')}</h4>
              <div className="text-right">
                <span className="block text-sm font-medium text-gray-900">
                  {new Date(event.timestamp || event.date || new Date()).toLocaleDateString()}
                </span>
                <span className="block text-xs text-gray-500">
                  {new Date(event.timestamp || event.date || new Date()).toLocaleTimeString()}
                </span>
              </div>
            </div>
            {event.notes && <p className="text-sm text-gray-600 mb-2">{event.notes}</p>}
            {event.actor && <p className="text-xs text-gray-500 mb-2">By: {event.actor}</p>}
            {event.txHash && (
              <a 
                href={`https://testnet.snowtrace.io/tx/${event.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-mono bg-blue-50 px-2 py-1 rounded"
              >
                {event.txHash.slice(0, 6)}...{event.txHash.slice(-4)}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
