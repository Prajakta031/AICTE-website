import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Users,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  ShieldAlert,
  Send,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatApaarId } from '../../utils/validationEngine';

export const CrossInstitutionDuplicatesView: React.FC = () => {
  const { students, institutions, setSelectedStudentForDetail, submitCorrection } = useApp();

  // Find all students that have cross-institution conflict
  const conflictingStudents = students.filter(s => s.crossInstitutionConflict);

  // Group by APAAR ID
  const groupedConflicts: Record<string, typeof students> = {};
  students.forEach(s => {
    if (!s.apaarId) return;
    if (!groupedConflicts[s.apaarId]) groupedConflicts[s.apaarId] = [];
    groupedConflicts[s.apaarId].push(s);
  });

  const duplicateGroups = Object.entries(groupedConflicts).filter(([_, list]) => {
    // Check if distinct institutions exist
    const distinctInsts = new Set(list.map(item => item.institutionId));
    return distinctInsts.size > 1;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Inter-Institutional Duplicate APAAR Audit Matrix
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
            Rule 4 Verification
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Detection of concurrent active student admissions across multiple AICTE-approved institutions under the same APAAR ID
        </p>
      </div>

      {/* Overview Alert Callout */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <span>Statutory Compliance Guideline (AICTE Approval Handbook 2025-26)</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Under the National Education Policy (NEP 2020) and ABC guidelines, a full-time regular degree student cannot hold simultaneous active admissions in two separate degree-granting AICTE institutions without authorized dual-degree registration. Duplicate records require transfer certificate or seat surrender verification.
        </p>
      </div>

      {/* Duplicate Groups Matrix */}
      {duplicateGroups.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">No Cross-Institutional Duplicates Found!</h4>
          <p className="text-xs text-slate-500 mt-1">
            All registered APAAR IDs are unique to their respective colleges nationwide.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {duplicateGroups.map(([apaarId, records], idx) => (
            <div
              key={apaarId}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
            >
              {/* Header strip */}
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 font-mono">Case #{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">APAAR ID:</span>
                    <span className="font-mono font-bold text-base text-slate-900">
                      {formatApaarId(apaarId)}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  {records.length} Concurrent Enrolments
                </span>
              </div>

              {/* Institutions involved side-by-side */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {records.map((rec, rIdx) => (
                  <div key={rec.id} className={`${rIdx > 0 ? 'md:pl-4 pt-4 md:pt-0' : ''} space-y-2`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-teal-700" />
                        <span className="font-bold text-slate-900 text-sm">{rec.institutionName}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Record: {rec.id}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1.5 border border-slate-200/60">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Candidate Name:</span>
                        <span className="font-semibold text-slate-900">{rec.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Department:</span>
                        <span className="font-medium text-slate-800">{rec.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Academic Year:</span>
                        <span className="font-mono text-slate-800">{rec.academicYear}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Admission Date:</span>
                        <span className="font-mono text-slate-800">{rec.dateOfAdmission}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        <span className="font-medium text-slate-800">{rec.admissionStatus}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => setSelectedStudentForDetail(rec)}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Student Credential Card</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended Action & Resolution Footer */}
              <div className="bg-slate-50/70 p-3.5 px-5 border-t border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-slate-600">
                  <span className="font-bold text-slate-800">Action Required:</span> Contact Registrar of both institutions. Request seat cancellation certificate or migrate primary registration.
                </div>
                <button
                  onClick={() => {
                    const primary = records[0];
                    setSelectedStudentForDetail(primary);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-700 text-white hover:bg-teal-800 font-semibold text-xs flex items-center gap-1 shrink-0"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Initiate Resolution</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
