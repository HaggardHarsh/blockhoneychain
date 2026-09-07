'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Navbar } from '@/components/Navbar';
import { QrCode, Search, Hexagon } from 'lucide-react';

export default function ScanPage() {
  const router = useRouter();
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    
    scanner.render((decodedText) => {
      scanner.clear();
      // Expecting a URL or just the batch code. Let's extract the batch code.
      let code = decodedText;
      if (decodedText.includes('/verify/')) {
        code = decodedText.split('/verify/')[1].split('?')[0];
      }
      router.push(`/verify/${code}`);
    }, (err) => {
      // Ignore scan errors, they happen continuously until a QR is found
    });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [router]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      router.push(`/verify/${manualCode.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-24 pb-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
          <div className="p-8 text-center bg-amber-500 text-white">
            <Hexagon className="w-12 h-12 mx-auto mb-4 fill-amber-300 text-amber-300" />
            <h1 className="text-2xl font-bold mb-2">Verify Authenticity</h1>
            <p className="text-amber-100">Scan the QR code on your HoneyChain jar.</p>
          </div>
          
          <div className="p-6">
            <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-dashed border-amber-200"></div>
            
            <div className="my-6 flex items-center text-gray-400 before:flex-1 before:border-t before:border-gray-200 before:mr-4 after:flex-1 after:border-t after:border-gray-200 after:ml-4">
              OR
            </div>

            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Batch Code (e.g. BATCH-123)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              />
              <button type="submit" className="px-6 py-3 bg-amber-900 hover:bg-amber-800 text-white font-bold rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
