import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  Plus,
  FileCode2
} from 'lucide-react';
import {
  fetchRegistryStats,
  RegistryStats,
  VerificationHistoryItem,
  formatApaarId
} from '../../services/apaarApi';

interface ApaarAdminDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenAddModal: () => void;
}

export const ApaarAdminDashboard: React.FC<ApaarAdminDashboardProps> = ({
  onNavigate,
  onOpenAddModal
}) => {
  const [stats, setStats] = useState<RegistryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await fetchRegistryStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load registry stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Poll every 5 seconds to keep stats synchronized with live API requests
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              APAAR Demo Registry Administrator
            </h1>
            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
              MOCK SERVICE v2.0
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulated central authority holding national synthetic APAAR ID student records for AICTE Hackathon testing.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Stats</span>
          </button>
          <button
            onClick={() => onNavigate('engine')}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Test Verification Engine</span>
          </button>
        </div>
      </div>

      {/* 5 Primary Stat Cards required by Section 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Total Synthetic Records */}
        <div
          onClick={() => onNavigate('database')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Synthetic Records
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2 tabular-nums">
            {stats ? stats.total_records : '...'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>In mock database</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        {/* 2. Demo Records Matched */}
        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Records Matched
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-2 tabular-nums">
            {stats ? stats.records_matched : '...'}
          </div>
          <p className="text-[11px] text-emerald-800/80 mt-1">
            DEMO_MATCH responses
          </p>
        </div>

        {/* 3. Demo Records Mismatched */}
        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Mismatched Records
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-700 mt-2 tabular-nums">
            {stats ? stats.records_mismatched : '...'}
          </div>
          <p className="text-[11px] text-amber-800/80 mt-1">
            DEMO_MISMATCH responses
          </p>
        </div>

        {/* 4. IDs Not Found */}
        <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
              IDs Not Found
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-700 mt-2 tabular-nums">
            {stats ? stats.ids_not_found : '...'}
          </div>
          <p className="text-[11px] text-rose-800/80 mt-1">
            DEMO_ID_NOT_FOUND
          </p>
        </div>

        {/* 5. Total Verification Requests */}
        <div
          onClick={() => onNavigate('history')}
          className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm hover:bg-slate-850 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
              Total Requests
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/30 text-indigo-300 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white mt-2 tabular-nums">
            {stats ? stats.total_verification_requests : '...'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>View audit logs</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>
      </div>

      {/* Two Column Layout: Recent Activity & Quick Tester Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Verification Activity (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Recent Verification Activity Stream
              </h3>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View Full History</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-x-auto">
            {!stats || stats.recent_activity.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No verification activity recorded yet. Run a verification test to see real-time events.
              </div>
            ) : (
              stats.recent_activity.slice(0, 7).map(item => (
                <div
                  key={item.id}
                  className="p-3.5 px-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-xs gap-3"
                >
                  <div className="flex items-center gap-3">
                    {item.status === 'DEMO_MATCH' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : item.status === 'DEMO_MISMATCH' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : item.status === 'DEMO_DUPLICATE' ? (
                      <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0" />
                    ) : item.status === 'INVALID_FORMAT' ? (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          {item.masked_apaar_id || item.apaar_id}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                          {item.student_name || 'N/A'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-sm">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        item.status === 'DEMO_MATCH'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : item.status === 'DEMO_MISMATCH'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : item.status === 'DEMO_DUPLICATE'
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} ({item.latency_ms}ms)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick Action Center & API Endpoint Spec (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Endpoint Card */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-2xl p-5 text-white border border-indigo-900 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                REST API Endpoint
              </span>
              <span className="text-[11px] font-mono text-emerald-400">PORT 3000 ACTIVE</span>
            </div>

            <h4 className="font-mono text-sm font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">POST</span>
              <span>/api/demo/verify</span>
            </h4>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              External systems (like our AICTE Portal) send student APAAR IDs and names to verify against this mock registry.
            </p>

            <div className="mt-3.5 bg-slate-950/80 rounded-xl p-3 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
              <div className="text-slate-500">// Sample Request Body</div>
              <div>&#123;</div>
              <div className="pl-4 text-emerald-300">"apaar_id": "900000000001",</div>
              <div className="pl-4 text-emerald-300">"student_name": "Rahul Sharma"</div>
              <div>&#125;</div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => onNavigate('docs')}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>View Full API Documentation</span>
              </button>
            </div>
          </div>

          {/* Quick Registry Management */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Registry Management Actions
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={onOpenAddModal}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/50 text-slate-800 font-semibold text-left transition-all flex flex-col gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Add Student Record</span>
                <span className="text-[10px] text-slate-500 font-normal">Manually create synthetic record</span>
              </button>

              <button
                onClick={() => onNavigate('database')}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/50 text-slate-800 font-semibold text-left transition-all flex flex-col gap-1 cursor-pointer"
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Browse Registry</span>
                <span className="text-[10px] text-slate-500 font-normal">Search, filter & CSV import</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
