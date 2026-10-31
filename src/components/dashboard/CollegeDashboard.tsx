import React from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileCheck2,
  ArrowRight,
  Copy,
  Layers,
  Building2,
  Check,
  Info,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { useApp } from '../../context/AppContext';
import {
  formatApaarId,
  calculateVerificationBreakdown,
  getApaarStatusMeta
} from '../../utils/validationEngine';

export const CollegeDashboard: React.FC = () => {
  const {
    currentInstitution,
    students,
    setActiveTab,
    setSelectedStudentForDetail,
    theme
  } = useApp();

  const instStudents = students.filter(s => s.institutionId === currentInstitution.id);
  const totalApprovedIntake = currentInstitution.approvedTotalIntake;
  const actualEnrolment = instStudents.length;
  const vBreakdown = calculateVerificationBreakdown(instStudents);
  const flaggedStudents = instStudents.filter(s => s.validationStatus !== 'valid');

  // Theme-aware chart & accent colors
  const getChartColors = () => {
    switch (theme) {
      case 'bharat-royal':
        return { approved: '#0b192c', enrolled: '#ea580c', primaryBtn: 'bg-orange-600 hover:bg-orange-700 text-white' };
      case 'digital-indigo':
        return { approved: '#1e1b4b', enrolled: '#0284c7', primaryBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white' };
      case 'academic-emerald':
        return { approved: '#064e3b', enrolled: '#059669', primaryBtn: 'bg-emerald-700 hover:bg-emerald-800 text-white' };
      case 'minimal-slate':
        return { approved: '#1e293b', enrolled: '#2563eb', primaryBtn: 'bg-slate-900 hover:bg-slate-800 text-white' };
      case 'executive-dark':
        return { approved: '#334155', enrolled: '#f59e0b', primaryBtn: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold' };
      default:
        return { approved: '#0b192c', enrolled: '#ea580c', primaryBtn: 'bg-orange-600 hover:bg-orange-700 text-white' };
    }
  };

  const chartTheme = getChartColors();

  // Department capacity data
  const deptData = currentInstitution.departments.map(dept => {
    const enrolled = instStudents.filter(
      s => s.department.toLowerCase() === dept.department.toLowerCase()
    ).length;
    return {
      name: dept.department
        .replace('Computer Science & Engineering', 'CSE')
        .replace('Electronics & Communication', 'ECE')
        .replace('Mechanical Engineering', 'Mech')
        .replace('Civil Engineering', 'Civil')
        .replace('AI & Data Science', 'AI/DS')
        .replace('Electrical Engineering', 'EE'),
      approved: dept.approvedIntake,
      enrolled
    };
  });

  const percentOccupancy = totalApprovedIntake > 0
    ? Math.round((actualEnrolment / totalApprovedIntake) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Executive Page Header */}
      <div className="pb-4 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {currentInstitution.name}
              </h1>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-mono font-medium text-slate-500">
                AICTE Code: {currentInstitution.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Campus Census & Enrolment Health · {currentInstitution.city}, {currentInstitution.state}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-2xs cursor-pointer transition-all ${chartTheme.primaryBtn}`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Student File</span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 flex items-center gap-2 shadow-2xs cursor-pointer transition-colors"
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>Manage Students</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Precision Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Approved Intake */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Sanctioned Intake
            </span>
            <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {totalApprovedIntake.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>AICTE Quota Limit</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600 font-medium">100% cap</span>
            </div>
          </div>
        </div>

        {/* Card 2: Enrolled Students */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Total Enrolment
            </span>
            <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {actualEnrolment.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-blue-700 font-semibold">{percentOccupancy}% seats allocated</span>
              <span className="text-slate-300">·</span>
              <span>{totalApprovedIntake - actualEnrolment} available</span>
            </div>
          </div>
        </div>

        {/* Card 3: Format Valid (Level 1) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold tracking-wider text-blue-800 uppercase">
              Format Valid (L1)
            </span>
            <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono tracking-tight text-blue-700 tabular-nums">
              {vBreakdown.formatValid.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-blue-700 font-medium">12-Digit Structure OK</span>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] text-slate-400">Not Official</span>
            </div>
          </div>
        </div>

        {/* Card 4: Document Matched (Level 2) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold tracking-wider text-emerald-800 uppercase">
              Doc Matched (L2)
            </span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono tracking-tight text-emerald-700 tabular-nums">
              {vBreakdown.documentMatched.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-700 font-medium">DigiLocker OCR Match</span>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] text-slate-400">Card Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* THREE-LEVEL APAAR VERIFICATION AUDIT MATRIX */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Institutional APAAR Verification Audit Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Segregated breakdown across Level 1 (Format Check), Level 2 (Document Comparison), and Level 3 (Official Gateway).
            </p>
          </div>
          <div className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-[11px] text-slate-600 font-mono">
            Audit Standard: SIH26263 Compliance
          </div>
        </div>

        {/* 5 Distinct Cards per Prompt Requirement */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Format Valid Records */}
          <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/40">
            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
              1. Format Valid
            </span>
            <div className="text-2xl font-bold font-mono text-blue-800 mt-1 tabular-nums">
              {vBreakdown.formatValid}
            </div>
            <p className="text-[10px] text-blue-700 mt-1 leading-snug">
              12-digit format passed with zero duplicate locks.
            </p>
            <span className="inline-block mt-2 text-[9px] font-semibold text-blue-800 bg-blue-100/80 px-1.5 py-0.5 rounded">
              Level 1 (Not Official)
            </span>
          </div>

          {/* 2. Document Details Matched */}
          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40">
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
              2. Doc Matched
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-800 mt-1 tabular-nums">
              {vBreakdown.documentMatched}
            </div>
            <p className="text-[10px] text-emerald-700 mt-1 leading-snug">
              Name & APAAR matched against DigiLocker card.
            </p>
            <span className="inline-block mt-2 text-[9px] font-semibold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded">
              Level 2 (Document Match)
            </span>
          </div>

          {/* 3. Duplicate Detected */}
          <div className="p-3.5 rounded-lg border border-amber-300 bg-amber-50/40">
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
              3. Duplicate Detected
            </span>
            <div className="text-2xl font-bold font-mono text-amber-800 mt-1 tabular-nums">
              {vBreakdown.duplicateDetected}
            </div>
            <p className="text-[10px] text-amber-700 mt-1 leading-snug">
              Duplicate within college or across institutions.
            </p>
            <button
              onClick={() => setActiveTab('duplicates')}
              className="inline-block mt-2 text-[9px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Inspect Duplicates →
            </button>
          </div>

          {/* 4. Manual Review Required */}
          <div className="p-3.5 rounded-lg border border-purple-200 bg-purple-50/40">
            <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
              4. Manual Review
            </span>
            <div className="text-2xl font-bold font-mono text-purple-800 mt-1 tabular-nums">
              {vBreakdown.manualReview}
            </div>
            <p className="text-[10px] text-purple-700 mt-1 leading-snug">
              Blurry document scan or spelling variance.
            </p>
            <span className="inline-block mt-2 text-[9px] font-semibold text-purple-800 bg-purple-100/80 px-1.5 py-0.5 rounded">
              Awaiting Inspection
            </span>
          </div>

          {/* 5. Officially Verified (Government API) */}
          <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-100/60">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
              5. Officially Verified
            </span>
            <div className="text-2xl font-bold font-mono text-slate-800 mt-1 tabular-nums">
              {vBreakdown.officiallyVerified}
            </div>
            <p className="text-[10px] text-slate-600 mt-1 leading-snug">
              Authorized API Setu gateway integration.
            </p>
            <span className="inline-block mt-2 text-[9px] font-semibold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
              API Access Pending
            </span>
          </div>
        </div>

        {/* Ethical Separation Banner */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-[11px] text-slate-600">
              <strong>Audit Policy:</strong> Format-Valid and Document-Matched records are reported separately and <strong>never combined</strong> with Officially Verified counts until live government API credentials are authenticated.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('students')}
            className="text-xs font-semibold text-teal-800 hover:text-teal-950 whitespace-nowrap cursor-pointer"
          >
            Filter Records →
          </button>
        </div>
      </div>

      {/* Middle Section: Department Seats Breakdown & Fast Pathways */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Department Seats Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Sanctioned vs. Enrolled Capacity by Discipline
              </h2>
              <p className="text-xs text-slate-500">
                Departmental breakdown of approved intake versus live APAAR registrations
              </p>
            </div>
            <button
              onClick={() => setActiveTab('intake')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1 cursor-pointer"
            >
              <span>Capacity Audit</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                <Bar dataKey="approved" name="Sanctioned Intake" fill={chartTheme.approved} radius={[3, 3, 0, 0]} />
                <Bar dataKey="enrolled" name="Live Enrolments" fill={chartTheme.enrolled} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Operational Pathways */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Core Administrative Actions
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Direct access to essential compliance tools and data processing:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('upload')}
                className="w-full p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50/80 text-left transition-colors flex items-center justify-between text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-[11px]">
                    01
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">Batch File Upload</span>
                    <span className="text-slate-500 text-[11px]">Upload Excel or CSV roster</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>

              <button
                onClick={() => setActiveTab('validation')}
                className="w-full p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50/80 text-left transition-colors flex items-center justify-between text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-[11px]">
                    02
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">Data Verification Engine</span>
                    <span className="text-slate-500 text-[11px]">Run automated audit rules</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>

              <button
                onClick={() => setActiveTab('duplicates')}
                className="w-full p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50/80 text-left transition-colors flex items-center justify-between text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-[11px]">
                    03
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">Cross-Campus Deduplication</span>
                    <span className="text-slate-500 text-[11px]">Identify dual college admissions</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className="w-full p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50/80 text-left transition-colors flex items-center justify-between text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-[11px]">
                    04
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">AICTE Compliance Dossiers</span>
                    <span className="text-slate-500 text-[11px]">Export official certificates</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Flagged Student Records requiring review */}
      {flaggedStudents.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Pending Remediation Queue ({flaggedStudents.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Records flagged for format mismatches, duplicate IDs, or missing mandatory profile details.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('validation')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {flaggedStudents.slice(0, 5).map(student => (
              <div
                key={student.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 text-xs transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{student.name}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-slate-600">{formatApaarId(student.apaarId) || 'Missing ID'}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">{student.department}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] text-slate-500">
                    <span className="font-medium text-slate-700">Verification Source:</span>
                    <span className="text-slate-600">{student.verificationSource || 'Level 1 Algorithmic Validation'}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-medium text-slate-700">Date:</span>
                    <span className="font-mono text-slate-600">{student.verificationDate || '2026-10-31'}</span>
                  </div>
                  <p className="text-amber-800 text-[11px] pt-0.5">
                    {student.flagNotes}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedStudentForDetail(student)}
                  className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-800 font-semibold text-xs flex items-center gap-1 self-start sm:self-auto cursor-pointer transition-colors"
                >
                  <span>Resolve Flag</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
