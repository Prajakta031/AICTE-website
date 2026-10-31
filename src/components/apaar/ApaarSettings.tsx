import React, { useState } from 'react';
import {
  Settings,
  Shield,
  RotateCcw,
  Download,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Database,
  Lock,
  Key
} from 'lucide-react';
import { resetDemoDatabase, fetchSyntheticRecords } from '../../services/apaarApi';

export const ApaarSettings: React.FC = () => {
  const [apiKey, setApiKey] = useState('apaar_demo_secret_key_sih2026');
  const [showKey, setShowKey] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleReset = async () => {
    if (!window.confirm('Reset synthetic database to initial baseline test dataset?')) {
      return;
    }
    setResetting(true);
    setResetMessage(null);
    try {
      const count = await resetDemoDatabase();
      setResetMessage(`Synthetic database reset successfully! ${count} standard test records restored.`);
    } catch (err: any) {
      setResetMessage(`Reset failed: ${err?.message || 'Error'}`);
    } finally {
      setResetting(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const data = await fetchSyntheticRecords();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `APAAR_Registry_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Registry Environment & API Settings
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Configure API security, CORS origins, and manage synthetic test database state.
        </p>
      </div>

      {resetMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Grid of Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Credentials */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
            <Key className="w-4 h-4 text-indigo-600" />
            <span>API Security & Authentication</span>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Demo API Key (X-API-Key Header)
            </label>
            <div className="flex items-center gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                readOnly
                value={apiKey}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono bg-slate-50 text-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-semibold cursor-pointer shrink-0"
              >
                {showKey ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Shared synthetic API key for authenticating requests between AICTE client portal and this registry.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Active CORS Origin Configuration
            </label>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
              * (Permissive for Hackathon evaluation / AICTE Prototype)
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Configured to accept HTTP POST requests from AICTE Portal origins.
            </p>
          </div>
        </div>

        {/* Database Management */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Synthetic Database Operations</span>
          </div>

          <div>
            <span className="font-semibold text-slate-800 block">
              Reset Synthetic Records
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Restores the default standard dataset containing valid test records, mismatches, and multi-college duplicates for demonstration.
            </p>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="mt-2.5 px-4 py-2 rounded-xl border border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting...' : 'Reset to Baseline Dataset'}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="font-semibold text-slate-800 block">
              Export Database Snapshot
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Download complete synthetic registry database in structured JSON format.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="mt-2.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Database JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
