import React, { useState } from 'react';
import {
  Copy,
  AlertTriangle,
  Building2,
  Users,
  CheckCircle2,
  Eye,
  Info,
  Check,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatApaarId, normalizeApaarId } from '../../utils/validationEngine';
import { Student } from '../../types';

export const DuplicateDetectionView: React.FC = () => {
  const { students, currentUser, currentInstitution, setSelectedStudentForDetail, setActiveTab } = useApp();
  const isAicte = currentUser.role === 'aicte_admin';

  const [activeTabType, setActiveTabType] = useState<'cross' | 'local'>('cross');

  // Find all duplicates grouped by normalized APAAR ID
  const groupedByApaar: Record<string, Student[]> = {};
  students.forEach(s => {
    const id = normalizeApaarId(s.apaarId);
    if (!id || id.length < 5) return;
    if (!groupedByApaar[id]) groupedByApaar[id] = [];
    groupedByApaar[id].push(s);
  });

  // Cross-college duplicates: same APAAR in >=2 distinct institutions
  const crossCollegeDuplicates = Object.entries(groupedByApaar).filter(([_, list]) => {
    const instSet = new Set(list.map(s => s.institutionId));
    return instSet.size > 1;
  });

  // Same-college duplicates: same APAAR repeated within the same institution
  const localCollegeDuplicates: Array<{ apaarId: string; institutionName: string; students: Student[] }> = [];
  Object.entries(groupedByApaar).forEach(([apaarId, list]) => {
    const byInst: Record<string, Student[]> = {};
    list.forEach(s => {
      if (!byInst[s.institutionId]) byInst[s.institutionId] = [];
      byInst[s.institutionId].push(s);
    });

    Object.entries(byInst).forEach(([instId, instStudents]) => {
      if (instStudents.length > 1) {
        if (isAicte || instId === currentInstitution.id) {
          localCollegeDuplicates.push({
            apaarId,
            institutionName: instStudents[0].institutionName,
            students: instStudents
          });
        }
      }
    });
  });

  // Total counts
  const totalDuplicateAlerts = crossCollegeDuplicates.length + localCollegeDuplicates.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Duplicate Detection
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Identify and review duplicate APAAR IDs registered within your institution and across other AICTE colleges.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('students')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            >
              View All Students
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white transition-colors cursor-pointer"
            >
              Upload Student File
            </button>
          </div>
        </div>
      </div>

      {/* Helpful Non-Technical Explanation Box */}
      <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-900 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-blue-900">Why does Duplicate Detection matter?</span>
          <p className="text-blue-800 text-[11px] mt-0.5 leading-relaxed">
            Under the National Education Policy (One Nation, One Student ID), every student has a single unique 12-digit APAAR ID. If the same ID appears twice, it usually means either a typing mistake occurred or a student holds dual admissions in two colleges at the same time.
          </p>
        </div>
      </div>

      {/* Two Tab Buttons */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTabType('cross')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTabType === 'cross'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Across Different Colleges</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            activeTabType === 'cross' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-200 text-slate-700'
          }`}>
            {crossCollegeDuplicates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTabType('local')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTabType === 'local'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Within Same College</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            activeTabType === 'local' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-200 text-slate-700'
          }`}>
            {localCollegeDuplicates.length}
          </span>
        </button>
      </div>

      {/* Section 1: Cross-College Duplicates */}
      {activeTabType === 'cross' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              Cases where one student ID is registered at two or more AICTE institutions simultaneously:
            </span>
            <span className="font-semibold text-slate-900 font-mono">
              {crossCollegeDuplicates.length} Potential Conflicts
            </span>
          </div>

          {crossCollegeDuplicates.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-800 text-sm">No Cross-College Duplicates Found!</p>
              <p className="text-xs text-slate-400">All registered student IDs are unique across institutions.</p>
            </div>
          ) : (
            crossCollegeDuplicates.map(([apaarId, records], idx) => (
              <div
                key={apaarId}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
              >
                {/* Header */}
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
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    Dual Enrolment · {records.length} Admissions
                  </span>
                </div>

                {/* Institutions involved */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {records.map((rec, rIdx) => (
                    <div key={rec.id} className={`${rIdx > 0 ? 'md:pl-4 pt-4 md:pt-0' : ''} space-y-2`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-teal-700" />
                          <span className="font-bold text-slate-900 text-sm">{rec.institutionName}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          ID: {rec.id}
                        </span>
                      </div>

                      <div className="bg-slate-50/80 p-3 rounded-lg text-xs space-y-1.5 border border-slate-200/60">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Student Name:</span>
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
                      </div>

                      <div className="flex items-center justify-end pt-1">
                        <button
                          onClick={() => setSelectedStudentForDetail(rec)}
                          className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Student Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resolution Footer */}
                <div className="bg-slate-50 p-3.5 px-5 border-t border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-slate-600">
                    <span className="font-bold text-slate-800">Suggested Action:</span> Verify transfer certificate or cancellation receipt from the other college before finalizing enrolment.
                  </div>
                  <button
                    onClick={() => setSelectedStudentForDetail(records[0])}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-700 text-white hover:bg-teal-800 font-semibold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>Resolve Conflict</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Section 2: Same-College Duplicates */}
      {activeTabType === 'local' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              Cases where two different student entries share the exact same APAAR ID within the same college:
            </span>
            <span className="font-semibold text-slate-900 font-mono">
              {localCollegeDuplicates.length} Cases
            </span>
          </div>

          {localCollegeDuplicates.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-800 text-sm">No Internal Duplicates Detected!</p>
              <p className="text-xs text-slate-400">All registered student IDs in this institution are unique.</p>
            </div>
          ) : (
            localCollegeDuplicates.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-rose-200 shadow-2xs overflow-hidden"
              >
                <div className="bg-rose-50/50 px-5 py-3 border-b border-rose-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span className="font-bold text-xs text-rose-900">
                      Duplicate ID: <span className="font-mono text-sm">{formatApaarId(item.apaarId)}</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-rose-700 font-semibold">
                    {item.institutionName}
                  </span>
                </div>

                <div className="p-4 divide-y divide-slate-100">
                  {item.students.map(s => (
                    <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{s.name}</span>
                        <span className="text-slate-500 ml-2">({s.department}, {s.academicYear})</span>
                        <span className="text-[10px] text-slate-400 font-mono block">Record ID: {s.id}</span>
                      </div>
                      <button
                        onClick={() => setSelectedStudentForDetail(s)}
                        className="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & Correct</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
