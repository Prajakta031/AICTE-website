import React from 'react';
import { AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';

export const ApaarNoticeBanner: React.FC<{ compact?: boolean }> = ({ compact }) => {
  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-900 px-4 py-2 text-xs flex items-center justify-between select-none">
      <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="font-bold tracking-wide uppercase text-[11px] bg-amber-600 text-white px-1.5 py-0.5 rounded text-[10px]">
          DEMO ENVIRONMENT
        </span>
        <span className="text-slate-700 font-medium">
          This application uses synthetic data and does not perform official APAAR, ABC, DigiLocker, or Government of India verification. All records are simulated for Smart India Hackathon testing.
        </span>
      </div>
    </div>
  );
};
