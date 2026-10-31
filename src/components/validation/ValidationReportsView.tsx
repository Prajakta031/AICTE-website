import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck2,
  Download,
  Printer,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Info,
  ArrowRight,
  Edit2,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatApaarId } from '../../utils/validationEngine';
import { exportStudentsToCsv, triggerPrintReport } from '../../utils/exportUtils';
import { ValidationRuleId, Student } from '../../types';

interface RuleCardProps {
  id: ValidationRuleId;
  title: string;
  checkNo: number;
  description: string;
  passedCount: number;
  flaggedCount: number;
  isSelected: boolean;
  onSelect: () => void;
}

const SimpleCheckCard: React.FC<RuleCardProps> = ({
  title,
  checkNo,
  description,
  passedCount,
  flaggedCount,
  isSelected,
  onSelect
}) => (
  <button
    onClick={onSelect}
    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
      isSelected
        ? 'border-teal-600 bg-teal-50/50 shadow-xs ring-1 ring-teal-600'
        : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-mono font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
        Check #{checkNo}
      </span>
      {flaggedCount > 0 ? (
        <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          {flaggedCount} Issues Found
        </span>
      ) : (
        <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
          All Passed
        </span>
      )}
    </div>
    <h3 className="font-bold text-xs text-slate-900 mb-1">{title}</h3>
    <p className="text-[11px] text-slate-500 leading-snug">{description}</p>
  </button>
);

export const ValidationReportsView: React.FC = () => {
  const { students, currentUser, currentInstitution, setSelectedStudentForDetail, revalidateAll, setActiveTab } = useApp();

  const isAicte = currentUser.role === 'aicte_admin';
  const targetStudents = isAicte ? students : students.filter(s => s.institutionId === currentUser.institutionId);

  const [selectedRule, setSelectedRule] = useState<ValidationRuleId | 'all'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'valid' | 'review' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 6 Checks in simple, familiar non-technical language (Per Section 4)
  const checksList = [
    {
      id: 'RULE_MANDATORY_FIELDS' as ValidationRuleId,
      checkNo: 1,
      title: 'Required Student Information',
      description: 'Ensures student name, APAAR ID, branch, admission year, and category are not blank.'
    },
    {
      id: 'RULE_APAAR_FORMAT' as ValidationRuleId,
      checkNo: 2,
      title: 'Student ID (APAAR ID) Format',
      description: 'Checks that the ID is exactly 12 digits and not a dummy sequence like 000000000000.'
    },
    {
      id: 'RULE_LOCAL_DUPLICATE' as ValidationRuleId,
      checkNo: 3,
      title: 'Same-College Duplicate ID Check',
      description: 'Finds if the same student ID was entered twice within your own institution.'
    },
    {
      id: 'RULE_CROSS_INSTITUTION_DUPLICATE' as ValidationRuleId,
      checkNo: 4,
      title: 'Other Colleges Dual Admission Check',
      description: 'Detects if the student ID is concurrently active in another AICTE-approved college.'
    },
    {
      id: 'RULE_INTAKE_LIMIT' as ValidationRuleId,
      checkNo: 5,
      title: 'Approved Seat Quota Audit',
      description: 'Warns if total admissions in any department exceed the AICTE sanctioned intake.'
    },
    {
      id: 'RULE_INCONSISTENT_DATA' as ValidationRuleId,
      checkNo: 6,
      title: 'Information Consistency Check',
      description: 'Verifies that admission dates correlate with academic years and email addresses are valid.'
    }
  ];

  // Filter students based on selected rule & status
  const filteredStudents = targetStudents.filter(student => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().replace(/[\s-]/g, '');
      const matchName = student.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchApaar = student.apaarId.includes(q);
      if (!matchName && !matchApaar) return false;
    }

    if (selectedStatusFilter !== 'all' && student.validationStatus !== selectedStatusFilter) {
      return false;
    }

    if (selectedRule !== 'all') {
      const check = student.validationChecks?.find(c => c.ruleId === selectedRule);
      if (!check || check.passed) return false;
    }

    return true;
  });

  const totalValid = targetStudents.filter(s => s.validationStatus === 'valid').length;
  const totalReview = targetStudents.filter(s => s.validationStatus === 'review').length;
  const totalError = targetStudents.filter(s => s.validationStatus === 'error').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Data Verification
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                Check Student Information
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              The platform automatically verifies student records against standard AICTE criteria to identify errors and ensure compliance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={revalidateAll}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Check Records Now</span>
            </button>
            <button
              onClick={() => exportStudentsToCsv(filteredStudents, 'Student_Verification_Audit.csv')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Helpful Non-Technical Explanation Box */}
      <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-900 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-blue-900">How do the verification checks work?</span>
          <p className="text-blue-800 text-[11px] mt-0.5 leading-relaxed">
            Records marked in <span className="font-semibold text-emerald-800">Green</span> are fully valid. Records in <span className="font-semibold text-amber-800">Orange</span> require administrative review (e.g., dual college enrolment). Records in <span className="font-semibold text-rose-800">Red</span> have errors that must be corrected before final AICTE approval.
          </p>
        </div>
      </div>

      {/* Live Verification API Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-700/40 text-white text-xs flex items-center justify-between flex-wrap gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Live Verification API Connected</span>
              <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30 font-bold">
                POST /api/demo/verify
              </span>
            </div>
            <p className="text-slate-300 text-[11px] mt-0.5">
              Live automated endpoint for AICTE compliance, cross-college duplicate checks, and instant APAAR verification.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('api-verifier')}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <span>Open API Sandbox & Inspector</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6 Simple Verification Check Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {checksList.map(item => {
          const flaggedCount = targetStudents.filter(s => {
            const check = s.validationChecks?.find(c => c.ruleId === item.id);
            return check && !check.passed;
          }).length;

          const passedCount = targetStudents.length - flaggedCount;

          return (
            <SimpleCheckCard
              key={item.id}
              id={item.id}
              checkNo={item.checkNo}
              title={item.title}
              description={item.description}
              passedCount={passedCount}
              flaggedCount={flaggedCount}
              isSelected={selectedRule === item.id}
              onSelect={() => setSelectedRule(selectedRule === item.id ? 'all' : item.id)}
            />
          );
        })}
      </div>

      {/* Search and Status Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or APAAR ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 whitespace-nowrap">Filter:</span>
            <select
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value as any)}
              className="text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Verification Statuses</option>
              <option value="valid">🟢 Valid Records Only ({totalValid})</option>
              <option value="review">🟡 Needs Review Only ({totalReview})</option>
              <option value="error">🔴 Needs Correction Only ({totalError})</option>
            </select>

            {selectedRule !== 'all' && (
              <button
                onClick={() => setSelectedRule('all')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 px-2 py-1 cursor-pointer"
              >
                Clear Check Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Verification Results ({filteredStudents.length} Records)
            </h3>
            <p className="text-xs text-slate-500">
              Click any row to inspect the student's APAAR card and check details
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-emerald-700 font-semibold">{totalValid} Valid</span>
            <span className="text-slate-300">·</span>
            <span className="text-amber-700 font-semibold">{totalReview} Review</span>
            <span className="text-slate-300">·</span>
            <span className="text-rose-700 font-semibold">{totalError} Error</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">APAAR ID</th>
                <th className="py-3 px-4">Department & Year</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Verification Findings</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No student records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(stu => {
                  const failed = stu.validationChecks?.filter(c => !c.passed) || [];

                  return (
                    <tr
                      key={stu.id}
                      onClick={() => setSelectedStudentForDetail(stu)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {stu.name}
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {stu.institutionName}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                        {formatApaarId(stu.apaarId) || <span className="text-rose-500 italic">Missing ID</span>}
                      </td>

                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <span className="font-medium text-slate-800">{stu.department}</span>
                        <span className="text-[11px] text-slate-400 block font-mono">{stu.academicYear}</span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          stu.validationStatus === 'valid'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : stu.validationStatus === 'review'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {stu.validationStatus === 'valid' ? 'Valid Record' : stu.validationStatus === 'review' ? 'Needs Review' : 'Needs Correction'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[11px] text-slate-600 max-w-sm">
                        {failed.length > 0 ? (
                          <span className="text-rose-700 font-medium">
                            {failed[0].message}
                          </span>
                        ) : (
                          <span className="text-emerald-700">
                            Passed all 6 verification checks.
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedStudentForDetail(stu)}
                          className="px-2.5 py-1 text-xs font-semibold rounded text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
