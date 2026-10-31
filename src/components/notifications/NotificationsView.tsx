import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Building2,
  Calendar,
  Check,
  Filter,
  Eye,
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatApaarId } from '../../utils/validationEngine';

export const NotificationsView: React.FC = () => {
  const { alerts, resolveAlert, currentUser, currentInstitution, setSelectedStudentForDetail, students } = useApp();

  const isAicte = currentUser.role === 'aicte_admin';
  const [filterType, setFilterType] = useState<string>('all');
  const [showResolved, setShowResolved] = useState(false);

  // Filter alerts by institutional scope
  const targetAlerts = alerts.filter(a => {
    if (!isAicte && a.institutionId !== currentUser.institutionId) {
      return false;
    }
    if (!showResolved && a.isResolved) {
      return false;
    }
    if (filterType !== 'all' && a.type !== filterType) {
      return false;
    }
    return true;
  });

  const handleInspectStudent = (studentId?: string, apaarId?: string) => {
    if (studentId) {
      const match = students.find(s => s.id === studentId);
      if (match) setSelectedStudentForDetail(match);
    } else if (apaarId) {
      const match = students.find(s => s.apaarId === apaarId);
      if (match) setSelectedStudentForDetail(match);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Important Notifications & Alerts
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAicte
                ? 'All-India alerts: duplicate student IDs, colleges exceeding approved intake, and required corrections'
                : `Important alerts for ${currentInstitution.name} regarding duplicate IDs and seat limits`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={e => setShowResolved(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>Show Already Resolved Alerts</span>
            </label>
          </div>
        </div>
      </div>

      {/* Helpful Non-Technical Guide Callout */}
      <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-900 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-blue-900">What are these notifications?</span>
          <p className="text-blue-800 text-[11px] mt-0.5 leading-relaxed">
            The platform automatically creates an alert when a duplicate student ID is detected, when admissions exceed approved department seats, or when a student ID has invalid format. Click <span className="font-semibold">"Inspect Record"</span> to view the details or <span className="font-semibold">"Mark as Resolved"</span> once verified.
          </p>
        </div>
      </div>

      {/* Filter Tabs using Simple Language (Per Section 4) */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-medium">Filter by issue:</span>
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Issues
        </button>
        <button
          onClick={() => setFilterType('duplicate_apaar')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            filterType === 'duplicate_apaar' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Duplicate Student IDs
        </button>
        <button
          onClick={() => setFilterType('intake_exceeded')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            filterType === 'intake_exceeded' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Admissions Above Approved Limit
        </button>
        <button
          onClick={() => setFilterType('invalid_format')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            filterType === 'invalid_format' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Records That Need Correction
        </button>
      </div>

      {/* Notifications List */}
      {targetAlerts.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">No Active Alerts!</h4>
          <p className="text-xs text-slate-500 mt-1">
            All records currently comply with statutory APAAR guidelines and approved seat limits.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {targetAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all ${
                alert.isResolved
                  ? 'bg-slate-50/60 border-slate-200 opacity-60'
                  : alert.severity === 'critical'
                  ? 'bg-white border-rose-200 hover:border-rose-300 shadow-2xs'
                  : 'bg-white border-amber-200 hover:border-amber-300 shadow-2xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        alert.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {alert.severity === 'critical' ? 'High Priority' : 'Needs Review'}
                    </span>

                    <span className="text-xs font-semibold text-slate-900 font-mono">
                      {alert.institutionName}
                    </span>

                    <span className="text-slate-400 text-xs">·</span>
                    <span className="text-slate-500 text-[11px] font-mono">{alert.timestamp}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                    <span className="font-bold text-teal-800 shrink-0">Recommended Next Step:</span>
                    <span>{alert.recommendedAction}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-2 sm:pt-0">
                  {(alert.studentId || alert.apaarId) && (
                    <button
                      onClick={() => handleInspectStudent(alert.studentId, alert.apaarId)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Record</span>
                    </button>
                  )}

                  {!alert.isResolved ? (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark as Resolved</span>
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
