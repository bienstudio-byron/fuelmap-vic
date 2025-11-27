'use client';

import { AlertTriangle, ExternalLink } from 'lucide-react';

export default function SetupBanner() {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 mx-4 rounded-r shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-bold text-amber-800">Demo Mode: Simulated Prices</h3>
          <div className="mt-2 text-sm text-amber-700 space-y-2">
            <p>
              Real-time Victorian fuel price data is <strong>government-regulated</strong> and not publicly accessible without an authorized API key.
            </p>
            <p>
              This app is currently using <strong>Real Station Locations</strong> (via OpenStreetMap) combined with <strong>Smart Price Profiles</strong> to simulate realistic market conditions (e.g. Costco is cheaper, 7-Eleven is expensive).
            </p>
            <div className="pt-2">
               <a 
                 href="https://service.vic.gov.au/find-services/transport-and-driving/servo-saver/help-centre/servo-saver-public-api"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-1 text-amber-900 underline font-semibold hover:text-amber-950"
               >
                 Apply for Real Data Access <ExternalLink size={12} />
               </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
