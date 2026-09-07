import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestResultsTableProps {
  test: any;
}

export function TestResultsTable({ test }: TestResultsTableProps) {
  if (!test) return null;

  const p = test.parameters || {};
  const parameters = [
    { name: 'Total Reducing Sugar', value: p.reducingSugar?.value, limit: '≥ 65%', status: p.reducingSugar?.pass },
    { name: 'Sucrose', value: p.sucrose?.value, limit: '≤ 5%', status: p.sucrose?.pass },
    { name: 'Moisture', value: p.moisture?.value, limit: '≤ 20%', status: p.moisture?.pass },
    { name: 'Ash', value: p.ash?.value, limit: '≤ 0.5%', status: p.ash?.pass },
    { name: "Fiehe's Test", value: p.fiehesTest?.value, limit: 'Negative', status: p.fiehesTest?.pass },
    { name: 'HMF', value: p.hmf?.value, limit: '≤ 80 mg/kg', status: p.hmf?.pass },
    { name: 'F/G Ratio', value: p.fgRatio?.value, limit: '0.95 - 1.50', status: p.fgRatio?.pass },
    { name: 'Specific Gravity', value: p.specificGravity?.value, limit: '≥ 1.35', status: p.specificGravity?.pass },
    { name: 'Acidity', value: p.acidity?.value, limit: '≤ 0.20%', status: p.acidity?.pass },
    { name: 'Proline', value: p.proline?.value, limit: '≥ 180 mg/kg', status: p.proline?.pass },
  ];

  const overallPass = test.overallResult === 'PASS';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Lab Analysis Report</h3>
          <p className="text-sm text-gray-500">{test.labName} • Report #{test.reportNumber}</p>
        </div>
        <div className={cn('px-4 py-2 rounded-full font-bold flex items-center gap-2', overallPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
          {overallPass ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {overallPass ? 'OVERALL PASS' : 'OVERALL FAIL'}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
              <th className="py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">Result</th>
              <th className="py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">FSSAI Limit</th>
              <th className="py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {parameters.map((p, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6 text-sm font-medium text-gray-900">{p.name}</td>
                <td className="py-3 px-6 text-sm text-gray-600">{p.value}</td>
                <td className="py-3 px-6 text-sm text-gray-500">{p.limit}</td>
                <td className="py-3 px-6 text-center">
                  {p.status ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 inline" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 inline" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
