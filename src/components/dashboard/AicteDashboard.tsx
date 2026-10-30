import React, { useState } from 'react';
import {
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Download,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  FileBarChart,
  Eye,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { exportStudentsToCsv } from '../../utils/exportUtils';
import { formatApaarId } from '../../utils/validationEngine';

const STATE_COLORS = ['#0f766e', '#0284c7', '#d97706', '#6366f1', '#ec4899', '#10b981'];

export const AicteDashboard: React.FC = () => {
  const {
    institutions,
    students,
    alerts,
    corrections,
    switchRole,
    setActiveTab,
    reviewCorrection,
    setSelectedStudentForDetail
  } = useApp();

  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('all');
  const [reviewModalRequest, setReviewModalRequest] = useState<any | null>(null);
  const [reviewerNote, setReviewerNote] = useState('');

  // Consolidated National Metrics
  const totalRegisteredInstitutions = institutions.length;
  const totalStudentEnrolments = students.length;
  const totalValidRecords = students.filter(s => s.validationStatus === 'valid').length;
  const totalReviewRecords = students.filter(s => s.validationStatus === 'review').length;
  const totalErrorRecords = students.filter(s => s.validationStatus === 'error').length;

  const validPercentage = totalStudentEnrolments > 0
    ? ((totalValidRecords / totalStudentEnrolments) * 100).toFixed(1)
    : '0';

  // Duplicate ID alerts count
  const duplicateAlertsCount = alerts.filter(a => a.type === 'duplicate_apaar' && !a.isResolved).length;

  // Institutions exceeding intake
  const institutionsExceedingIntake = institutions.filter(inst => {
    const instStudentsCount = students.filter(s => s.institutionId === inst.id).length;
    return instStudentsCount > inst.approvedTotalIntake;
  }).length;

  // State-wise enrolment aggregation
  const stateMap: Record<string, { state: string; enrolments: number; institutions: number }> = {};
  institutions.forEach(inst => {
    const instStudentsCount = students.filter(s => s.institutionId === inst.id).length;
    if (!stateMap[inst.state]) {
      stateMap[inst.state] = { state: inst.state, enrolments: 0, institutions: 0 };
    }
    stateMap[inst.state].institutions += 1;
    stateMap[inst.state].enrolments += instStudentsCount;
  });
  const stateChartData = Object.values(stateMap);

  // Department-wise national enrolment
  const deptMap: Record<string, number> = {};
  students.forEach(s => {
    deptMap[s.department] = (deptMap[s.department] || 0) + 1;
  });
  const deptChartData = Object.entries(deptMap).map(([dept, count]) => ({
    name: dept.replace('Engineering', 'Engg.').replace('Computer Science & Engg.', 'CSE').replace('Electronics & Communication', 'ECE').replace('AI & Data Science', 'AI/DS'),
    students: count
  }));

  // Pending Corrections
  const pendingCorrections = corrections.filter(c => c.status === 'pending');

  const handleReviewDecision = (status: 'approved' | 'rejected') => {
    if (reviewModalRequest) {
      reviewCorrection(reviewModalRequest.id, status, reviewerNote);
      setReviewModalRequest(null);
      setReviewerNote('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              AICTE National Command & Compliance Bureau
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
              National Council
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated APAAR Identity, Dual-Enrolment Verification & Institutional Intake Audits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportStudentsToCsv(students, 'AICTE_All_India_Student_Census_Report.csv')}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-700" />
            <span>Download All-India Census (CSV)</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-900 hover:bg-blue-950 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <FileBarChart className="w-4 h-4" />
            <span>Consolidated Dossier</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (6 National Cards per requirement) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Registered Institutions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Registered Institutions
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalRegisteredInstitutions}
            </div>
            <div className="text-[11px] text-slate-400">AICTE Approved Campuses</div>
          </div>
          <div className="text-[10px] text-blue-700 font-medium">Pan-India Network</div>
        </div>

        {/* Total Student Enrolments */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Student Enrolments
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalStudentEnrolments}
            </div>
            <div className="text-[11px] text-slate-400">AY 2025-26 Submissions</div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">ABC ID Synced</div>
        </div>

        {/* Total Valid Records */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
            <span>Valid Records</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {totalValidRecords}
            </div>
            <div className="text-[11px] text-emerald-700/80">{validPercentage}% Compliance Rate</div>
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${validPercentage}%` }}
            />
          </div>
        </div>

        {/* Records Requiring Review */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center justify-between">
            <span>Requires Review</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {totalReviewRecords}
            </div>
            <div className="text-[11px] text-amber-700/80">Cross-College & Intake Flags</div>
          </div>
          <div className="text-[10px] text-amber-700">Flagged for Human Verification</div>
        </div>

        {/* Duplicate ID Alerts */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider flex items-center justify-between">
            <span>Duplicate ID Alerts</span>
            <Copy className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-rose-700 tabular-nums">
              {duplicateAlertsCount}
            </div>
            <div className="text-[11px] text-rose-700/80">Dual Enrolments in AICTE</div>
          </div>
          <button
            onClick={() => setActiveTab('duplicates')}
            className="text-[10px] font-semibold text-rose-800 hover:underline text-left cursor-pointer"
          >
            Inspect duplicate matrix →
          </button>
        </div>

        {/* Institutions Exceeding Intake */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Intake Breaches</span>
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-rose-600 tabular-nums">
              {institutionsExceedingIntake}
            </div>
            <div className="text-[11px] text-slate-400">Institutes Exceeding Quota</div>
          </div>
          <div className="text-[10px] text-slate-500">Under regulatory notice</div>
        </div>
      </div>

      {/* Visual Charts: State-wise Enrolments & Department-wise Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State-wise Enrolment Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                State-wise Student Enrolment Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Pan-India technical education density across active regional councils
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">States</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <XAxis dataKey="state" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="enrolments" name="Registered Students" fill="#0369a1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* National Department-wise Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Department-wise National Student Enrolment
              </h3>
              <p className="text-xs text-slate-500">
                Concentration of student admissions by discipline
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Students</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-10} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="students" name="Students" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Institution-wise Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Institution-wise AICTE Compliance & Intake Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Comparative intake quotas, enrolled students, flagged records, and inspection access
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {institutions.length} Institutions Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Institution Name & AICTE Code</th>
                <th className="py-3 px-4">State / City</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Approved Intake</th>
                <th className="py-3 px-4">Enrolled Students</th>
                <th className="py-3 px-4">Occupancy</th>
                <th className="py-3 px-4">Flagged / Errors</th>
                <th className="py-3 px-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {institutions.map(inst => {
                const instStudents = students.filter(s => s.institutionId === inst.id);
                const enrolled = instStudents.length;
                const approved = inst.approvedTotalIntake;
                const occupancy = approved > 0 ? (enrolled / approved) * 100 : 0;
                const flagged = instStudents.filter(s => s.validationStatus !== 'valid').length;
                const isOverIntake = enrolled > approved;

                return (
                  <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{inst.name}</div>
                      <div className="font-mono text-[11px] text-slate-500">{inst.code}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      {inst.city}, <span className="font-medium">{inst.state}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                        {inst.type}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {approved} seats
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {enrolled}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOverIntake ? 'bg-rose-600' : 'bg-teal-600'
                            }`}
                            style={{ width: `${Math.min(100, occupancy)}%` }}
                          />
                        </div>
                        <span className={`font-mono text-[11px] font-bold ${
                          isOverIntake ? 'text-rose-600' : 'text-slate-700'
                        }`}>
                          {occupancy.toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {flagged > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{flagged} Flagged</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>100% Valid</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          switchRole('college_admin', inst.id);
                          setActiveTab('students');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect Records</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Correction Requests Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Pending Institutional Correction Appeals Queue</span>
            </h3>
            <p className="text-xs text-slate-500">
              Formal appeals submitted by college registrars for duplicate clearance or APAAR format revisions
            </p>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
            {pendingCorrections.length} Pending AICTE Decision
          </span>
        </div>

        {pendingCorrections.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">All institutional appeals are reviewed!</p>
            <p className="text-[11px] text-slate-400">No pending clearance items currently in queue.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingCorrections.map(req => (
              <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{req.studentName}</span>
                    <span className="font-mono text-slate-500">({formatApaarId(req.apaarId)})</span>
                    <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-medium text-[11px]">
                      {req.institutionName}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    <span className="font-medium text-slate-800">Issue:</span> {req.issueType} ·{' '}
                    <span className="font-medium text-slate-800">Proposed Action:</span> {req.proposedCorrection}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    <span className="font-medium text-slate-700">Registrar Justification:</span> "{req.justification}"
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setReviewModalRequest(req);
                      setReviewerNote('Approved after verification of migration/cancellation documentation.');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setReviewModalRequest(req);
                      setReviewerNote('Rejected: Inadequate documentary proof for duplicate resolution.');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Confirmation Modal */}
      {reviewModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h4 className="font-bold text-slate-900 text-base">
              AICTE Decision on Appeal ({reviewModalRequest.studentName})
            </h4>
            <p className="text-xs text-slate-600">
              Institution: <span className="font-semibold">{reviewModalRequest.institutionName}</span>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official AICTE Reviewer Note & Resolution
              </label>
              <textarea
                rows={3}
                value={reviewerNote}
                onChange={e => setReviewerNote(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewModalRequest(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewDecision('rejected')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => handleReviewDecision('approved')}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
