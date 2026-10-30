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
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatApaarId } from '../../utils/validationEngine';
import { exportStudentsToCsv, triggerPrintReport } from '../../utils/exportUtils';
import { ValidationRuleId, Student } from '../../types';

interface RuleCardProps {
  id: ValidationRuleId;
  title: string;
  ruleNo: number;
  description: string;
  passedCount: number;
  flaggedCount: number;
  isSelected: boolean;
  onSelect: () => void;
}

const RuleCard: React.FC<RuleCardProps> = ({
  title,
  ruleNo,
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
        ? 'border-teal-600 bg-teal-50/40 shadow-xs ring-1 ring-teal-600'
        : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-mono font-bold uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
        Rule 0{ruleNo}
      </span>
      {flaggedCount > 0 ? (
        <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          {flaggedCount} Flags
        </span>
      ) : (
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
          Pass
        </span>
      )}
    </div>
    <h4 className="font-bold text-xs text-slate-900 mb-1">{title}</h4>
    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{description}</p>
  </button>
);

export const ValidationReportsView: React.FC = () => {
  const { students, currentUser, currentInstitution, setSelectedStudentForDetail, revalidateAll } = useApp();

  const isAicte = currentUser.role === 'aicte_admin';
  const targetStudents = isAicte ? students : students.filter(s => s.institutionId === currentUser.institutionId);

  const [selectedRule, setSelectedRule] = useState<ValidationRuleId | 'all'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'valid' | 'review' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Rules definition
  const rules = [
    {
      id: 'RULE_MANDATORY_FIELDS' as ValidationRuleId,
      ruleNo: 1,
      title: 'Mandatory Student Profile Check',
      description: 'Verifies presence of Student Name, APAAR ID, Department, Term, and Category.'
    },
    {
      id: 'RULE_APAAR_FORMAT' as ValidationRuleId,
      ruleNo: 2,
      title: 'APAAR ID Format & Checksum',
      description: 'Enforces 12-digit numeric constraint, checksum validity, and eliminates dummy sequences.'
    },
    {
      id: 'RULE_LOCAL_DUPLICATE' as ValidationRuleId,
      ruleNo: 3,
      title: 'Intra-Institutional Duplicate Check',
      description: 'Detects duplicate APAAR IDs registered within the same college campus.'
    },
    {
      id: 'RULE_CROSS_INSTITUTION_DUPLICATE' as ValidationRuleId,
      ruleNo: 4,
      title: 'Inter-Institutional Dual Enrolment',
      description: 'Cross-references APAAR IDs across all AICTE institutions for concurrent active admissions.'
    },
    {
      id: 'RULE_INTAKE_LIMIT' as ValidationRuleId,
      ruleNo: 5,
      title: 'AICTE Approved Intake Audit',
      description: 'Audits actual department enrolment counts against sanctioned statutory quotas.'
    },
    {
      id: 'RULE_INCONSISTENT_DATA' as ValidationRuleId,
      ruleNo: 6,
      title: 'Data Consistency & Integrity',
      description: 'Checks admission year chronology, email formatting, and field correlation.'
    }
  ];

  // Filter students based on selected rule & status
  const filteredStudents = targetStudents.filter(student => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().replace(/[\s-]/g, '');
      const matchName = student.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchApaar = student.apaarId.includes(q);
      if (!matchName && !matchApaar) return false;
    }

    // Status filter
    if (selectedStatusFilter !== 'all' && student.validationStatus !== selectedStatusFilter) {
      return false;
    }

    // Rule filter
    if (selectedRule !== 'all') {
      const check = student.validationChecks?.find(c => c.ruleId === selectedRule);
      if (!check || check.passed) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Automated Validation Engine Audit Reports
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
              6 Rules Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAicte
              ? 'Consolidated national audit reports across all registered institutions'
              : `${currentInstitution.name} · Rule-by-rule institutional verification ledger`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={revalidateAll}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-700" />
            <span>Revalidate Now</span>
          </button>
          <button
            onClick={triggerPrintReport}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Dossier</span>
          </button>
          <button
            onClick={() => exportStudentsToCsv(filteredStudents, 'AICTE_Validation_Audit_Report.csv')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Mandatory Regulatory Disclaimer */}
      <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">Standard AICTE SIH26263 Compliance Protocol:</span>
          <p className="text-blue-800 text-[11px] leading-relaxed">
            Format validation and duplicate matches generated by this automated platform are rule-based institutional filters. Potential violations and cross-institution conflicts are flagged for administrative human review and do not constitute automatic punitive disqualifications.
          </p>
        </div>
      </div>

      {/* 6 Rule Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rules.map(rule => {
          const flaggedCount = targetStudents.filter(s => {
            const check = s.validationChecks?.find(c => c.ruleId === rule.id);
            return check && !check.passed;
          }).length;

          const passedCount = targetStudents.length - flaggedCount;

          return (
            <RuleCard
              key={rule.id}
              id={rule.id}
              ruleNo={rule.ruleNo}
              title={rule.title}
              description={rule.description}
              passedCount={passedCount}
              flaggedCount={flaggedCount}
              isSelected={selectedRule === rule.id}
              onSelect={() => setSelectedRule(selectedRule === rule.id ? 'all' : rule.id)}
            />
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search flagged records..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 whitespace-nowrap">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value as any)}
              className="text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Validation Statuses</option>
              <option value="valid">🟢 Valid Records</option>
              <option value="review">🟡 Requires Review</option>
              <option value="error">🔴 Error Detected</option>
            </select>

            {selectedRule !== 'all' && (
              <button
                onClick={() => setSelectedRule('all')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 px-2 py-1"
              >
                Clear Rule Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Validation Results Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="font-bold text-sm text-slate-900">
            Audit Records ({filteredStudents.length} entries matching criteria)
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-emerald-700">Valid: {targetStudents.filter(s => s.validationStatus === 'valid').length}</span>
            <span className="text-amber-700">Review: {targetStudents.filter(s => s.validationStatus === 'review').length}</span>
            <span className="text-rose-700">Error: {targetStudents.filter(s => s.validationStatus === 'error').length}</span>
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
                <th className="py-3 px-4">Validation Audit Details</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No student records matching current audit criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(stu => {
                  const failedChecks = stu.validationChecks?.filter(c => !c.passed) || [];

                  return (
                    <tr
                      key={stu.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedStudentForDetail(stu)}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {stu.name}
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {stu.institutionName}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                        {formatApaarId(stu.apaarId) || (
                          <span className="text-rose-500 italic font-sans">Missing</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <span className="font-medium text-slate-800">{stu.department}</span>
                        <span className="text-[11px] text-slate-400 block font-mono">{stu.academicYear}</span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            stu.validationStatus === 'valid'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : stu.validationStatus === 'review'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {stu.validationStatus === 'valid' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {stu.validationStatus === 'review' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                          {stu.validationStatus === 'error' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                          <span>
                            {stu.validationStatus === 'valid'
                              ? 'Valid'
                              : stu.validationStatus === 'review'
                              ? 'Review Required'
                              : 'Error Detected'}
                          </span>
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-md">
                        {failedChecks.length > 0 ? (
                          <div className="space-y-1">
                            {failedChecks.map((check, i) => (
                              <div key={i} className="text-[11px] text-rose-700 flex items-start gap-1">
                                <span className="font-bold text-slate-500 font-mono text-[10px]">{check.ruleId}:</span>
                                <span>{check.message}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-700">
                            All 6 validation rules passed successfully.
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedStudentForDetail(stu)}
                          className="px-2.5 py-1 text-xs font-semibold rounded text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
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
