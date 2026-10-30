import React, { useState } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  FileCheck2,
  Building2,
  Users,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportStudentsToCsv, triggerPrintReport } from '../../utils/exportUtils';
import { formatApaarId } from '../../utils/validationEngine';

export const ReportsView: React.FC = () => {
  const { institutions, students, alerts, currentUser, currentInstitution } = useApp();
  const isAicte = currentUser.role === 'aicte_admin';

  const [activeReportTab, setActiveReportTab] = useState<
    'census' | 'institution' | 'duplicates' | 'errors' | 'intake'
  >('census');

  // Institution filter for report preview
  const [selectedInstId, setSelectedInstId] = useState<string>('all');

  // Filter students based on report tab
  const getReportStudents = () => {
    let list = students;
    if (!isAicte) {
      list = list.filter(s => s.institutionId === currentUser.institutionId);
    } else if (selectedInstId !== 'all') {
      list = list.filter(s => s.institutionId === selectedInstId);
    }

    switch (activeReportTab) {
      case 'duplicates':
        return list.filter(s => s.validationChecks?.some(c => (c.ruleId === 'RULE_LOCAL_DUPLICATE' || c.ruleId === 'RULE_CROSS_INSTITUTION_DUPLICATE') && !c.passed));
      case 'errors':
        return list.filter(s => s.validationStatus === 'error');
      case 'intake':
        return list.filter(s => s.validationChecks?.some(c => c.ruleId === 'RULE_INTAKE_LIMIT' && !c.passed));
      default:
        return list;
    }
  };

  const reportStudents = getReportStudents();

  const handleDownloadCsv = () => {
    const filenames: Record<string, string> = {
      census: 'AICTE_Student_Enrolment_Census_Report.csv',
      institution: 'AICTE_Institution_Wise_Report.csv',
      duplicates: 'AICTE_Duplicate_APAAR_Audit_Report.csv',
      errors: 'AICTE_Validation_Errors_Report.csv',
      intake: 'AICTE_Intake_Comparison_Report.csv'
    };
    exportStudentsToCsv(reportStudents, filenames[activeReportTab]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Reports, Statutory Compliance Dossiers & Exports
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
              Official Dossiers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate and export official AICTE compliant audit documentation, PDF printable dossiers, and CSV ledgers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerPrintReport}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-700" />
            <span>Print Dossier (PDF)</span>
          </button>
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setActiveReportTab('census')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeReportTab === 'census'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Student Enrolment Census</span>
        </button>

        <button
          onClick={() => setActiveReportTab('institution')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeReportTab === 'institution'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Institution-Wise Comparison</span>
        </button>

        <button
          onClick={() => setActiveReportTab('duplicates')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeReportTab === 'duplicates'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Duplicate APAAR Dossier</span>
        </button>

        <button
          onClick={() => setActiveReportTab('errors')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeReportTab === 'errors'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Validation Error Ledger</span>
        </button>

        <button
          onClick={() => setActiveReportTab('intake')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeReportTab === 'intake'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Intake Ceiling Audit</span>
        </button>
      </div>

      {/* Official Government Print Document Preview Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Printable Official Header */}
        <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/src/assets/images/aicte_emblem_insignia_1793373599365.jpg"
              alt="AICTE Emblem"
              referrerPolicy="no-referrer"
              className="w-16 h-16 object-contain rounded-full border border-slate-300"
            />
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-slate-700">
                All India Council for Technical Education (AICTE)
              </div>
              <h1 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                National APAAR Student Verification & Intake Audit Dossier
              </h1>
              <div className="text-xs text-slate-600 mt-0.5">
                Statutory Regulatory Cell · Academic Year: 2025-26 · Smart India Hackathon 2026 (SIH26263)
              </div>
            </div>
          </div>

          <div className="text-right text-xs space-y-0.5 text-slate-600 font-mono">
            <div>Doc Ref: <span className="font-bold text-slate-900">AICTE/APAAR/2026/DOC-984</span></div>
            <div>Date Generated: <span className="font-bold text-slate-900">{new Date().toLocaleDateString()}</span></div>
            <div>Generated By: <span className="font-bold text-slate-900">{currentUser.name}</span></div>
          </div>
        </div>

        {/* Institutional Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Report Scope</span>
            <span className="font-bold text-slate-900">
              {activeReportTab.toUpperCase()} LEDGER
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Covered Records</span>
            <span className="font-bold font-mono text-slate-900 text-sm">
              {reportStudents.length} Students
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Compliance Rate</span>
            <span className="font-bold font-mono text-emerald-700 text-sm">
              {students.length > 0 ? `${((students.filter(s => s.validationStatus === 'valid').length / students.length) * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Audit Status</span>
            <span className="font-bold text-blue-900">
              AUTHENTICATED SIMULATION
            </span>
          </div>
        </div>

        {/* Report Content Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-300">#</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Student Name</th>
                <th className="py-2.5 px-3 border-r border-slate-300">APAAR ID</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Institution</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Department</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Category</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Status</th>
                <th className="py-2.5 px-3">Audit Findings / Flag Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportStudents.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-900">
                    {s.name}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-800">
                    {formatApaarId(s.apaarId) || 'MISSING'}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-slate-700">
                    {s.institutionName}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-slate-700">
                    {s.department}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-slate-700">
                    {s.admissionCategory}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200">
                    <span
                      className={`font-bold uppercase text-[10px] ${
                        s.validationStatus === 'valid'
                          ? 'text-emerald-700'
                          : s.validationStatus === 'review'
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {s.validationStatus}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-600 text-[11px] leading-tight">
                    {s.flagNotes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signature & Seal Block (Print-Ready) */}
        <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs text-slate-600">
          <div>
            <div className="h-12 border-b border-dashed border-slate-400 mb-1" />
            <div className="font-semibold text-slate-900">Institutional Registrar</div>
            <div className="text-[10px] text-slate-400">Seal & Verification Stamp</div>
          </div>
          <div>
            <div className="h-12 border-b border-dashed border-slate-400 mb-1" />
            <div className="font-semibold text-slate-900">AICTE Regional Bureau Officer</div>
            <div className="text-[10px] text-slate-400">Intake & Seat Verification</div>
          </div>
          <div>
            <div className="h-12 border-b border-dashed border-slate-400 mb-1" />
            <div className="font-semibold text-slate-900">National APAAR Data Director</div>
            <div className="text-[10px] text-slate-400">Ministry of Education, GoI</div>
          </div>
        </div>

        {/* Footer print disclaimer */}
        <div className="text-[10px] text-slate-400 text-center pt-4">
          Generated automatically by AICTE APAAR Student Verification Platform (SIH26263). Synthetic data demonstration.
        </div>
      </div>
    </div>
  );
};
