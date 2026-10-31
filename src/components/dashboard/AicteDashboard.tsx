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
  Info,
  Layers,
  ArrowUpRight
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
import { exportStudentsToCsv } from '../../utils/exportUtils';
import { formatApaarId, calculateVerificationBreakdown } from '../../utils/validationEngine';

export const AicteDashboard: React.FC = () => {
  const {
    institutions,
    students,
    alerts,
    corrections,
    switchRole,
    setActiveTab,
    reviewCorrection,
    setSelectedStudentForDetail,
    theme
  } = useApp();

  const [reviewModalRequest, setReviewModalRequest] = useState<any | null>(null);
  const [reviewerNote, setReviewerNote] = useState('');

  // Theme-aware chart colors
  const getThemeBarColors = () => {
    switch (theme) {
      case 'bharat-royal':
        return { primary: '#ea580c', secondary: '#0b192c', ctaBtn: 'bg-orange-600 hover:bg-orange-700 text-white' };
      case 'digital-indigo':
        return { primary: '#0284c7', secondary: '#1e1b4b', ctaBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white' };
      case 'academic-emerald':
        return { primary: '#059669', secondary: '#064e3b', ctaBtn: 'bg-emerald-700 hover:bg-emerald-800 text-white' };
      case 'minimal-slate':
        return { primary: '#2563eb', secondary: '#1e293b', ctaBtn: 'bg-slate-900 hover:bg-slate-800 text-white' };
      case 'executive-dark':
        return { primary: '#f59e0b', secondary: '#38bdf8', ctaBtn: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold' };
      default:
        return { primary: '#ea580c', secondary: '#0b192c', ctaBtn: 'bg-orange-600 hover:bg-orange-700 text-white' };
    }
  };

  const themeBarColors = getThemeBarColors();

  // 6 Essential National Statistics
  const totalRegisteredInstitutions = institutions.length;
  const totalStudentEnrolments = students.length;
  const vBreakdown = calculateVerificationBreakdown(students);

  // Duplicate IDs count
  const duplicateIdCount = students.filter(s => {
    return s.validationChecks?.some(
      c => (c.ruleId === 'RULE_LOCAL_DUPLICATE' || c.ruleId === 'RULE_CROSS_INSTITUTION_DUPLICATE') && !c.passed
    );
  }).length;

  // Institutions with admissions above approved intake
  const institutionsWithExcess = institutions.filter(inst => {
    const instStudentsCount = students.filter(s => s.institutionId === inst.id).length;
    return instStudentsCount > inst.approvedTotalIntake;
  });

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
    name: dept
      .replace('Computer Science & Engineering', 'CSE')
      .replace('Electronics & Communication', 'ECE')
      .replace('Mechanical Engineering', 'ME')
      .replace('Civil Engineering', 'CE')
      .replace('AI & Data Science', 'AI/DS')
      .replace('Electrical Engineering', 'EE'),
    students: count
  }));

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
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                AICTE Central Directorate Dashboard
              </h1>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-mono font-medium text-slate-500">
                All-India Census (SIH26263)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              National student enrolment oversight, statutory intake compliance, and APAAR verification telemetry
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => exportStudentsToCsv(students, 'AICTE_All_India_Student_Enrolment.csv')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Census (CSV)</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${themeBarColors.ctaBtn}`}
            >
              <FileBarChart className="w-3.5 h-3.5" />
              <span>National Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Essential Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Total Registered Institutions */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Approved Campuses
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {totalRegisteredInstitutions}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Registered colleges
          </div>
        </div>

        {/* 2. Total Student Enrolments */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Enrolments
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {totalStudentEnrolments}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Live student records
          </div>
        </div>

        {/* 3. Level 1 Format Valid */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-blue-800 uppercase tracking-wider block">
              Format Valid (L1)
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1 tabular-nums">
            {vBreakdown.formatValid}
          </div>
          <div className="text-[11px] text-blue-700 mt-1 font-medium">
            12-Digit Validated
          </div>
        </div>

        {/* 4. Level 2 Document Matched */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Doc Matched (L2)
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            {vBreakdown.documentMatched}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            DigiLocker OCR Match
          </div>
        </div>

        {/* 5. Potential Duplicate Student IDs */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-rose-800 uppercase tracking-wider block">
              Duplicate IDs
            </span>
            <Copy className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
            {vBreakdown.duplicateDetected}
          </div>
          <button
            onClick={() => setActiveTab('duplicates')}
            className="text-[11px] text-rose-800 font-medium hover:underline mt-1 block cursor-pointer"
          >
            Review flags →
          </button>
        </div>

        {/* 6. Institutions Above Approved Intake */}
        <div className={`p-3.5 rounded-xl border shadow-2xs ${
          institutionsWithExcess.length > 0 ? 'bg-rose-50/60 border-rose-200' : 'bg-white border-slate-200/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block">
              Intake Excess
            </span>
            <Building2 className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
            {institutionsWithExcess.length}
          </div>
          <button
            onClick={() => setActiveTab('intake')}
            className="text-[11px] text-rose-800 font-medium hover:underline mt-1 block cursor-pointer"
          >
            View affected →
          </button>
        </div>
      </div>

      {/* NATIONAL THREE-LEVEL APAAR VERIFICATION AUDIT MATRIX */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>All-India APAAR Verification Audit Matrix (Consolidated Oversight)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly isolated reporting across Format Valid (L1), Document Matched (L2), and Officially Verified (L3).
            </p>
          </div>
          <div className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-[11px] text-slate-600 font-mono">
            Zero Conflation Standard
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
              12-digit numeric format valid. No duplicate collision.
            </p>
            <span className="inline-block mt-2 text-[9px] font-semibold text-blue-800 bg-blue-100/80 px-1.5 py-0.5 rounded">
              Level 1 (Not Official)
            </span>
          </div>

          {/* 2. Document Details Matched */}
          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40">
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
              2. Document Matched
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-800 mt-1 tabular-nums">
              {vBreakdown.documentMatched}
            </div>
            <p className="text-[10px] text-emerald-700 mt-1 leading-snug">
              Name & APAAR matched against DigiLocker document.
            </p>
            <span className="inline-block mt-2 text-[9px] font-semibold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded">
              Level 2 (Doc Comparison)
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
              Cross-college & local duplicates requiring audit.
            </p>
            <button
              onClick={() => setActiveTab('duplicates')}
              className="inline-block mt-2 text-[9px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Resolve Duplicates →
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
              Unreadable/blurry scans requiring manual audit.
            </p>
            <span className="inline-block mt-2 text-[9px] font-semibold text-purple-800 bg-purple-100/80 px-1.5 py-0.5 rounded">
              Under Review
            </span>
          </div>

          {/* 5. Officially Verified */}
          <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-100/60">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
              5. Officially Verified
            </span>
            <div className="text-2xl font-bold font-mono text-slate-800 mt-1 tabular-nums">
              {vBreakdown.officiallyVerified}
            </div>
            <p className="text-[10px] text-slate-600 mt-1 leading-snug">
              Ministry of Education live API Setu gateway.
            </p>
            <span className="inline-block mt-2 text-[9px] font-semibold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
              API Access Pending
            </span>
          </div>
        </div>

        {/* Audit Disclaimer Banner */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-[11px] text-slate-600">
              <strong>Statutory Compliance:</strong> Format-valid and document-matched records are kept strictly distinct from official verification. No fake API calls are simulated or asserted as official government clearance.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('students')}
            className="text-xs font-semibold text-teal-800 hover:text-teal-950 whitespace-nowrap cursor-pointer"
          >
            All Student Records →
          </button>
        </div>
      </div>

      {/* Middle Grid: State-wise Distribution & Engineering Discipline Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State-wise Admissions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                State-wise Technical Student Enrolments
              </h2>
              <p className="text-xs text-slate-500">
                Total registered technical students across Indian states
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {stateChartData.length} Regions
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="state" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
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
                <Bar dataKey="enrolments" name="Registered Students" fill={themeBarColors.primary} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department-wise National Trends */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                National Enrolment by Engineering Discipline
              </h2>
              <p className="text-xs text-slate-500">
                Student admissions across key technical domains
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {deptChartData.length} Disciplines
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="students" name="Students" fill={themeBarColors.secondary} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Institution-wise Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 tracking-tight">
              Institutional Compliance & Quota Occupancy
            </h3>
            <p className="text-xs text-slate-500">
              Directory of all recognized campuses with live seat utilization status
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {institutions.length} Campuses Monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-semibold">
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">AICTE Code</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Sanctioned Quota</th>
                <th className="py-3 px-4">Live Admissions</th>
                <th className="py-3 px-4">Occupancy</th>
                <th className="py-3 px-4">Flagged Records</th>
                <th className="py-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {institutions.map(inst => {
                const instStudents = students.filter(s => s.institutionId === inst.id);
                const enrolled = instStudents.length;
                const approved = inst.approvedTotalIntake;
                const occupancy = approved > 0 ? (enrolled / approved) * 100 : 0;
                const flagged = instStudents.filter(s => s.validationStatus !== 'valid').length;
                const isOver = enrolled > approved;

                return (
                  <tr key={inst.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{inst.name}</span>
                      <span className="text-[11px] text-slate-400">{inst.city}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{inst.code}</td>
                    <td className="py-3 px-4 text-slate-600">{inst.state}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{approved} seats</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{enrolled}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isOver ? 'bg-rose-500' : 'bg-emerald-600'}`}
                            style={{ width: `${Math.min(100, occupancy)}%` }}
                          />
                        </div>
                        <span className={`font-mono text-[11px] font-semibold ${isOver ? 'text-rose-600' : 'text-slate-700'}`}>
                          {occupancy.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {flagged > 0 ? (
                        <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          <span>{flagged} Flagged</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Clean</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          switchRole('college_admin', inst.id);
                          setActiveTab('overview');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Institutional Correction Appeals */}
      {pendingCorrections.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Pending Institutional Correction Appeals</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and approve correction requests submitted by college administrators for flagged records.
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              {pendingCorrections.length} Awaiting AICTE Approval
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingCorrections.map(req => (
              <div
                key={req.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 text-xs transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{req.studentName}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-slate-600">{formatApaarId(req.apaarId)}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600">{req.institutionName}</span>
                  </div>
                  <div className="text-slate-500">
                    <span className="font-semibold text-slate-700">Issue:</span> {req.issueType}
                    <span className="mx-2 text-slate-300">·</span>
                    <span className="font-semibold text-slate-700">Proposed:</span> {req.proposedCorrection}
                  </div>
                  <p className="text-slate-500 text-[11px] italic">
                    "{req.justification}"
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setReviewModalRequest(req)}
                    className="px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs cursor-pointer"
                  >
                    Review Dossier
                  </button>
                  <button
                    onClick={() => reviewCorrection(req.id, 'approved', 'Approved automatically by central directorate.')}
                    className="px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                Official Review: {reviewModalRequest.studentName}
              </h3>
              <button
                onClick={() => setReviewModalRequest(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Campus:</span>
                  <span className="font-semibold">{reviewModalRequest.institutionName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">APAAR ID:</span>
                  <span className="font-mono">{formatApaarId(reviewModalRequest.apaarId)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Issue Identified:</span>
                  <span>{reviewModalRequest.issueType}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Proposed Fix:</span>
                  <span className="font-semibold text-emerald-800">{reviewModalRequest.proposedCorrection}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-800 block mb-1">Campus Administrator Justification:</span>
                <p className="p-2.5 bg-slate-50 rounded border border-slate-200/80 text-[11px] text-slate-600">
                  {reviewModalRequest.justification}
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  AICTE Reviewer Regulatory Remarks (Optional):
                </label>
                <textarea
                  value={reviewerNote}
                  onChange={e => setReviewerNote(e.target.value)}
                  placeholder="Enter official remark or statutory order number..."
                  rows={2}
                  className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleReviewDecision('rejected')}
                className="px-3.5 py-1.5 rounded-md border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
              >
                Reject Request
              </button>
              <button
                onClick={() => handleReviewDecision('approved')}
                className="px-4 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
              >
                Approve Correction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
