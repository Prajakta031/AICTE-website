import React from 'react';
import {
  Users,
  Building,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  UploadCloud,
  UserPlus,
  ArrowRight,
  TrendingUp,
  FileCheck2
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
import { formatApaarId } from '../../utils/validationEngine';

const CATEGORY_COLORS = ['#0d9488', '#0284c7', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];
const STATUS_COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

export const CollegeDashboard: React.FC = () => {
  const {
    currentInstitution,
    students,
    alerts,
    setActiveTab,
    setSelectedStudentForDetail
  } = useApp();

  // Institution students
  const instStudents = students.filter(s => s.institutionId === currentInstitution.id);
  const totalApprovedIntake = currentInstitution.approvedTotalIntake;
  const actualEnrolment = instStudents.length;
  const remainingSeats = Math.max(0, totalApprovedIntake - actualEnrolment);

  const validRecordsCount = instStudents.filter(s => s.validationStatus === 'valid').length;
  const reviewRecordsCount = instStudents.filter(s => s.validationStatus === 'review').length;
  const errorRecordsCount = instStudents.filter(s => s.validationStatus === 'error').length;
  const totalFlagged = reviewRecordsCount + errorRecordsCount;

  // Duplicate APAARs count
  const duplicateApaarCount = instStudents.filter(s => {
    return s.validationChecks?.some(
      c => (c.ruleId === 'RULE_LOCAL_DUPLICATE' || c.ruleId === 'RULE_CROSS_INSTITUTION_DUPLICATE') && !c.passed
    );
  }).length;

  // Missing or Invalid records count
  const invalidOrMissingCount = instStudents.filter(s => {
    return s.validationChecks?.some(
      c => (c.ruleId === 'RULE_MANDATORY_FIELDS' || c.ruleId === 'RULE_APAAR_FORMAT') && !c.passed
    );
  }).length;

  // Department-wise Intake vs Actual chart data
  const deptData = currentInstitution.departments.map(dept => {
    const enrolled = instStudents.filter(s => s.department.toLowerCase() === dept.department.toLowerCase()).length;
    return {
      name: dept.department.replace('Engineering', 'Engg.').replace('Computer Science & Engg.', 'CSE').replace('Electronics & Communication', 'ECE').replace('AI & Data Science', 'AI/DS'),
      approved: dept.approvedIntake,
      enrolled: enrolled,
      available: Math.max(0, dept.approvedIntake - enrolled)
    };
  });

  // Category distribution data
  const categoryMap: Record<string, number> = {};
  instStudents.forEach(s => {
    categoryMap[s.admissionCategory] = (categoryMap[s.admissionCategory] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([category, count]) => ({
    name: category,
    value: count
  }));

  // Status Distribution data
  const statusPieData = [
    { name: 'Valid Records', value: validRecordsCount },
    { name: 'Review Required', value: reviewRecordsCount },
    { name: 'Errors Detected', value: errorRecordsCount }
  ];

  // Recent Flagged Students
  const flaggedStudents = instStudents
    .filter(s => s.validationStatus !== 'valid')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {currentInstitution.name}
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {currentInstitution.code}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            AICTE Approved Enrolment & APAAR Verification Dashboard · Academic Year 2025-26
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Student CSV</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Users className="w-4 h-4 text-teal-700" />
            <span>Manage Records</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (6 Cards per requirement) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Approved Intake */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Approved Intake
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalApprovedIntake}
            </div>
            <div className="text-[11px] text-slate-400">Sanctioned AICTE Quota</div>
          </div>
          <div className="text-[10px] text-teal-700 font-medium">Cap verified</div>
        </div>

        {/* Actual Enrolment */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Actual Enrolment
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {actualEnrolment}
            </div>
            <div className="text-[11px] text-slate-400">
              {totalApprovedIntake > 0 ? `${((actualEnrolment / totalApprovedIntake) * 100).toFixed(1)}% Capacity Filled` : ''}
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                actualEnrolment > totalApprovedIntake ? 'bg-rose-500' : 'bg-teal-600'
              }`}
              style={{ width: `${Math.min(100, (actualEnrolment / (totalApprovedIntake || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Remaining Seats */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Remaining Seats
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-teal-700 tabular-nums">
              {remainingSeats}
            </div>
            <div className="text-[11px] text-slate-400">Vacant Seats Left</div>
          </div>
          <div className="text-[10px] text-slate-500">Across all departments</div>
        </div>

        {/* Flagged Records */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center justify-between">
            <span>Flagged Records</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {totalFlagged}
            </div>
            <div className="text-[11px] text-amber-700/80">Pending Remediation</div>
          </div>
          <button
            onClick={() => setActiveTab('validation')}
            className="text-[10px] font-semibold text-amber-800 hover:underline text-left cursor-pointer"
          >
            Inspect audit reports →
          </button>
        </div>

        {/* Duplicate APAAR IDs */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider flex items-center justify-between">
            <span>Duplicate APAARs</span>
            <Copy className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-rose-700 tabular-nums">
              {duplicateApaarCount}
            </div>
            <div className="text-[11px] text-rose-700/80">Internal & Cross-College</div>
          </div>
          <div className="text-[10px] text-rose-700">High-priority clearance</div>
        </div>

        {/* Missing or Invalid Records */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Missing / Invalid</span>
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-slate-800 tabular-nums">
              {invalidOrMissingCount}
            </div>
            <div className="text-[11px] text-slate-400">Format or Mandatory gaps</div>
          </div>
          <div className="text-[10px] text-slate-500">Correct in Batch Upload</div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Approved Intake vs Actual Enrolment (Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Department-wise Intake vs. Actual Enrolment
              </h3>
              <p className="text-xs text-slate-500">
                Comparison of AICTE approved seat limits against registered APAAR enrolments
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Seats Count</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-10} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="approved" name="Approved Intake Quota" fill="#0f766e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="enrolled" name="Current Enrolment" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Validation Status Breakdown (Donut Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Validation Status Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Rule-based validation audit across all enrolled student records
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {instStudents.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No student records enrolled yet</div>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Valid Records:</span>
              </div>
              <span className="font-mono font-bold text-slate-800">{validRecordsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-800 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Requires Review:</span>
              </div>
              <span className="font-mono font-bold text-slate-800">{reviewRecordsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-rose-800 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Error Detected:</span>
              </div>
              <span className="font-mono font-bold text-slate-800">{errorRecordsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Category-wise Distribution & Flagged Records Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Category-wise Enrolment Statistics
            </h3>
            <p className="text-xs text-slate-500">
              General, OBC, SC, ST, EWS, and Management Quota breakdown
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" name="Students" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flagged Records Watchlist Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Flagged Records Requiring Attention</span>
              </h3>
              <p className="text-xs text-slate-500">
                Students with duplicate APAAR IDs, invalid format, or intake threshold warnings
              </p>
            </div>
            <button
              onClick={() => setActiveTab('students')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View all ({totalFlagged})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {flaggedStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 text-xs">No flagged student records!</p>
              <p className="text-[11px] text-slate-400">All registered students currently pass validation rules.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {flaggedStudents.map(student => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudentForDetail(student)}
                  className="p-3 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{student.name}</span>
                      <span className="text-[11px] font-mono text-slate-500">
                        ({formatApaarId(student.apaarId) || 'Missing ID'})
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          student.validationStatus === 'error'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {student.validationStatus === 'error' ? 'Error' : 'Review'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate max-w-[450px]">
                      {student.flagNotes}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-teal-700 hover:underline">
                      Review & Resolve →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
