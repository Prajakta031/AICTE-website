import React, { useState, useEffect } from 'react';
import {
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  RotateCcw,
  Download,
  Eye,
  ShieldCheck
} from 'lucide-react';
import {
  VerificationHistoryItem,
  fetchVerificationHistory,
  clearVerificationHistory,
  maskApaarId
} from '../../services/apaarApi';

export const ApaarVerificationHistory: React.FC = () => {
  const [history, setHistory] = useState<VerificationHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<VerificationHistoryItem | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const items = await fetchVerificationHistory();
      setHistory(items);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear the entire verification history log?')) {
      return;
    }
    await clearVerificationHistory();
    loadHistory();
  };

  const filteredHistory = history.filter(item => {
    if (selectedStatus !== 'all' && item.status !== selectedStatus) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.student_name.toLowerCase().includes(q);
      const matchId = item.apaar_id.includes(q);
      const matchMsg = item.message.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchMsg) return false;
    }
    return true;
  });

  const handleExportHistoryCsv = () => {
    if (history.length === 0) return;
    const headers = [
      'Timestamp',
      'Masked APAAR ID',
      'Student Name',
      'Status',
      'Mode',
      'ID Found',
      'Name Matched',
      'Latency (ms)',
      'Message',
      'Client Origin'
    ];

    const rows = history.map(h => [
      `"${h.timestamp}"`,
      `"${maskApaarId(h.apaar_id)}"`,
      `"${h.student_name}"`,
      `"${h.status}"`,
      `"${h.mode}"`,
      `"${h.id_found}"`,
      `"${h.name_matched}"`,
      `"${h.latency_ms}"`,
      `"${h.message.replace(/"/g, '""')}"`,
      `"${h.client_origin || ''}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `APAAR_Verification_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Verification Audit History
            </h2>
            <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {history.length} Logs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit trail of all synthetic verification requests received by the mock registry. Test APAAR IDs are masked for privacy compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportHistoryCsv}
            disabled={history.length === 0}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Audit Log</span>
          </button>
          <button
            onClick={handleClearHistory}
            disabled={history.length === 0}
            className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name, ID or message..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Verification Statuses</option>
            <option value="DEMO_MATCH">DEMO_MATCH (Success)</option>
            <option value="DEMO_MISMATCH">DEMO_MISMATCH (Name Mismatch)</option>
            <option value="DEMO_ID_NOT_FOUND">DEMO_ID_NOT_FOUND (Missing)</option>
            <option value="INVALID_FORMAT">INVALID_FORMAT (Bad Digits)</option>
            <option value="DEMO_DUPLICATE">DEMO_DUPLICATE (Multiple)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Masked Test APAAR ID</th>
                <th className="py-3 px-4">Submitted Name</th>
                <th className="py-3 px-4">Demo Status</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Client Origin</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading verification history...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No verification activity recorded matching current filter.
                  </td>
                </tr>
              ) : (
                filteredHistory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>

                    {/* Masked Test APAAR ID (Per Section 5 requirement) */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.masked_apaar_id || maskApaarId(item.apaar_id)}
                    </td>

                    {/* Submitted Name */}
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {item.student_name || 'N/A'}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase inline-flex items-center gap-1 ${
                          item.status === 'DEMO_MATCH'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : item.status === 'DEMO_MISMATCH'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : item.status === 'DEMO_DUPLICATE'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {item.status === 'DEMO_MATCH' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {item.status === 'DEMO_MISMATCH' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {item.status === 'DEMO_DUPLICATE' && <AlertTriangle className="w-3 h-3 text-purple-600" />}
                        {(item.status === 'DEMO_ID_NOT_FOUND' || item.status === 'INVALID_FORMAT') && (
                          <XCircle className="w-3 h-3 text-rose-600" />
                        )}
                        <span>{item.status}</span>
                      </span>
                    </td>

                    {/* Mode */}
                    <td className="py-3 px-4 font-mono text-[10px] font-bold text-indigo-700">
                      {item.mode}
                    </td>

                    {/* Latency */}
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {item.latency_ms} ms
                    </td>

                    {/* Client Origin */}
                    <td className="py-3 px-4 text-slate-600 text-[11px] truncate max-w-[140px]">
                      {item.client_origin || 'Local Client'}
                    </td>

                    {/* View Details */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                        title="View Full Payload Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Verification Request Log Details
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Log ID:</span>
                <span className="font-mono text-slate-800">{selectedItem.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-mono text-slate-800">{new Date(selectedItem.timestamp).toISOString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Masked Test APAAR ID:</span>
                <span className="font-mono font-bold text-indigo-700">{maskApaarId(selectedItem.apaar_id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted Name:</span>
                <span className="font-semibold text-slate-900">{selectedItem.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Demo Status:</span>
                <span className="font-bold">{selectedItem.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Engine Message:</span>
                <span className="text-slate-800 max-w-xs text-right">{selectedItem.message}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Latency:</span>
                <span className="font-mono text-slate-800">{selectedItem.latency_ms} ms</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
