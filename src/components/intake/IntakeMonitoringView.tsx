import React, { useState } from 'react';
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Users,
  ArrowRight,
  Info,
  TrendingUp,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { exportStudentsToCsv } from '../../utils/exportUtils';

export const IntakeMonitoringView: React.FC = () => {
  const { currentInstitution, institutions, students, currentUser, setActiveTab, switchRole } = useApp();
  const isAicte = currentUser.role === 'aicte_admin';

  // College-specific data
  const instStudents = students.filter(s => s.institutionId === currentInstitution.id);
  const totalApproved = currentInstitution.approvedTotalIntake;
  const totalEnrolled = instStudents.length;
  const vacantSeats = Math.max(0, totalApproved - totalEnrolled);
  const isOverLimit = totalEnrolled > totalApproved;

  // Department intake breakdown
  const deptData = currentInstitution.departments.map(dept => {
    const enrolled = instStudents.filter(
      s => s.department.toLowerCase() === dept.department.toLowerCase()
    ).length;
    const isDeptOver = enrolled > dept.approvedIntake;
    const vacancy = Math.max(0, dept.approvedIntake - enrolled);
    const percentage = dept.approvedIntake > 0 ? (enrolled / dept.approvedIntake) * 100 : 0;

    return {
      department: dept.department,
      shortName: dept.department
        .replace('Computer Science & Engineering', 'CSE')
        .replace('Electronics & Communication', 'ECE')
        .replace('Mechanical Engineering', 'ME')
        .replace('Civil Engineering', 'CE')
        .replace('AI & Data Science', 'AI/DS')
        .replace('Electrical Engineering', 'EE')
        .replace('Information Technology', 'IT'),
      approved: dept.approvedIntake,
      enrolled,
      vacancy,
      percentage,
      isDeptOver
    };
  });

  // AICTE-wide stats
  const allInstitutionsIntake = institutions.map(inst => {
    const count = students.filter(s => s.institutionId === inst.id).length;
    const over = count > inst.approvedTotalIntake;
    return {
      ...inst,
      enrolled: count,
      overCount: Math.max(0, count - inst.approvedTotalIntake),
      occupancy: inst.approvedTotalIntake > 0 ? (count / inst.approvedTotalIntake) * 100 : 0,
      isOver: over
    };
  });

  const totalNationalApproved = institutions.reduce((acc, i) => acc + i.approvedTotalIntake, 0);
  const institutionsWithExcess = allInstitutionsIntake.filter(i => i.isOver);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Intake Monitoring
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare AICTE-approved seat limits with actual student admissions to ensure proper adherence to sanctioned quotas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white transition-colors cursor-pointer"
            >
              Upload Student File
            </button>
            <button
              onClick={() => exportStudentsToCsv(isAicte ? students : instStudents, 'Intake_Admissions_Report.csv')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            >
              Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Info Callout for Non-Technical Users */}
      <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-900 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-blue-900">What does Intake Monitoring do?</span>
          <p className="text-blue-800 text-[11px] mt-0.5 leading-relaxed">
            Every AICTE-approved institution has a legally sanctioned seat limit for each department. This page automatically alerts you if actual admissions exceed the approved seats or if seats remain vacant.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Approved Intake */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Approved Seat Limit
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {isAicte ? totalNationalApproved : totalApproved}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isAicte ? 'Across all institutions' : 'Sanctioned by AICTE'}
          </div>
        </div>

        {/* Actual Admissions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Actual Student Admissions
          </span>
          <div className="text-2xl font-bold font-mono text-teal-800 mt-1 tabular-nums">
            {isAicte ? students.length : totalEnrolled}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Enrolled with APAAR IDs
          </div>
        </div>

        {/* Vacant Seats */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Remaining Available Seats
          </span>
          <div className="text-2xl font-bold font-mono text-slate-800 mt-1 tabular-nums">
            {isAicte ? Math.max(0, totalNationalApproved - students.length) : vacantSeats}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Seats open for admission
          </div>
        </div>

        {/* Admissions Above Approved Limit */}
        <div className={`p-4 rounded-xl border shadow-2xs ${
          (isAicte ? institutionsWithExcess.length > 0 : isOverLimit)
            ? 'bg-rose-50/70 border-rose-200 text-rose-900'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide">
              Admissions Above Limit
            </span>
            {(isAicte ? institutionsWithExcess.length > 0 : isOverLimit) ? (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div className="text-2xl font-bold font-mono mt-1 tabular-nums">
            {isAicte
              ? `${institutionsWithExcess.length} Colleges`
              : isOverLimit
              ? `+${totalEnrolled - totalApproved}`
              : '0'}
          </div>
          <div className="text-[11px] mt-1 font-medium">
            {(isAicte ? institutionsWithExcess.length > 0 : isOverLimit)
              ? 'Needs Administrative Review'
              : 'Within Permitted Quota'}
          </div>
        </div>
      </div>

      {/* College View: Department Comparison */}
      {!isAicte && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Approved vs. Actual Admissions by Department
                </h2>
                <p className="text-xs text-slate-500">
                  Visual comparison showing which branches have available seats or are at full capacity
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Seat Count</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <XAxis dataKey="shortName" tick={{ fontSize: 11 }} />
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
                  <Bar dataKey="approved" name="Approved Limit" fill="#0f766e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="enrolled" name="Actual Admissions" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Breakdown Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Detailed Department Seat Status
                </h3>
                <p className="text-xs text-slate-500">
                  Check each branch's sanctioned intake, filled seats, and vacancies
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {currentInstitution.name}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Department / Program</th>
                    <th className="py-3 px-4">Approved Limit</th>
                    <th className="py-3 px-4">Actual Admissions</th>
                    <th className="py-3 px-4">Capacity Status</th>
                    <th className="py-3 px-4">Vacant Seats</th>
                    <th className="py-3 px-4 text-right">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deptData.map((dept, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {dept.department}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {dept.approved} seats
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {dept.enrolled}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                dept.isDeptOver ? 'bg-rose-500' : 'bg-teal-600'
                              }`}
                              style={{ width: `${Math.min(100, dept.percentage)}%` }}
                            />
                          </div>
                          <span className={`font-mono text-[11px] font-bold ${
                            dept.isDeptOver ? 'text-rose-600' : 'text-slate-700'
                          }`}>
                            {dept.percentage.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {dept.vacancy} remaining
                      </td>
                      <td className="py-3 px-4 text-right">
                        {dept.isDeptOver ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Exceeds Limit by {dept.enrolled - dept.approved}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Within Limit</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* AICTE View: All Institutions Table */}
      {isAicte && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                All-India Institution Intake Compliance Table
              </h3>
              <p className="text-xs text-slate-500">
                Review approved seat quotas against registered student counts across all institutions
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {allInstitutionsIntake.length} Institutions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Institution Name</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Approved Limit</th>
                  <th className="py-3 px-4">Actual Admissions</th>
                  <th className="py-3 px-4">Occupancy</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allInstitutionsIntake.map(inst => (
                  <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{inst.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{inst.code}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{inst.state}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {inst.approvedTotalIntake} seats
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {inst.enrolled}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${inst.isOver ? 'bg-rose-500' : 'bg-teal-600'}`}
                            style={{ width: `${Math.min(100, inst.occupancy)}%` }}
                          />
                        </div>
                        <span className={`font-mono text-[11px] font-bold ${
                          inst.isOver ? 'text-rose-600' : 'text-slate-700'
                        }`}>
                          {inst.occupancy.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {inst.isOver ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Exceeds by {inst.overCount} seats</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Within Limit</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          switchRole('college_admin', inst.id);
                          setActiveTab('intake');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
