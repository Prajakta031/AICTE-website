import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Award,
  Layers,
  Mail,
  User,
  MapPin,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InstitutionSettingsView: React.FC = () => {
  const { currentInstitution, students } = useApp();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const instStudents = students.filter(s => s.institutionId === currentInstitution.id);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Institution Profile & Sanctioned Intake Settings
          </h2>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
            {currentInstitution.code}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          AICTE Statutory Approval Specifications & Sanctioned Department Seat Quotas
        </p>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xl">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{currentInstitution.name}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{currentInstitution.city}, {currentInstitution.state}</span>
                <span>·</span>
                <span className="font-semibold text-slate-700">{currentInstitution.type}</span>
                <span>·</span>
                <span>Est. {currentInstitution.establishedYear}</span>
              </div>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            AICTE Approved
          </span>
        </div>

        {/* Nodal Officer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px] block">
              Designated Institutional Nodal Officer
            </span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {currentInstitution.contactPerson}
            </span>
            <span className="text-slate-500">{currentInstitution.contactEmail}</span>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px] block">
              Total Approved Intake Quota
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono font-bold text-slate-900 text-lg">
                {currentInstitution.approvedTotalIntake} Seats
              </span>
              <span className="text-slate-500">
                (Currently Enrolled: <span className="font-bold text-teal-700">{instStudents.length}</span>)
              </span>
            </div>
          </div>
        </div>

        {/* Department-wise Breakdown Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-700" />
            <span>Approved Department Intake Allotment</span>
          </h4>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Discipline / Branch</th>
                  <th className="py-2.5 px-3">Approved AICTE Cap</th>
                  <th className="py-2.5 px-3">Registered Enrolment</th>
                  <th className="py-2.5 px-3">Available Vacancies</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentInstitution.departments.map((dept, idx) => {
                  const enrolled = instStudents.filter(
                    s => s.department.toLowerCase() === dept.department.toLowerCase()
                  ).length;
                  const available = Math.max(0, dept.approvedIntake - enrolled);
                  const isExceeded = enrolled > dept.approvedIntake;

                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {dept.department}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {dept.approvedIntake} seats
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-teal-800">
                        {enrolled}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {available} seats
                      </td>
                      <td className="py-2.5 px-3">
                        {isExceeded ? (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold text-[10px]">
                            Cap Exceeded
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium text-[10px]">
                            Within Quota
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
