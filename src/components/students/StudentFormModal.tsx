import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Zap, Send, Clock } from 'lucide-react';
import { Student } from '../../types';
import { useApp } from '../../context/AppContext';
import { normalizeApaarId, formatApaarId } from '../../utils/validationEngine';
import { verifyApaarApi, VerificationResult } from '../../services/apaarApi';

interface StudentFormModalProps {
  initialStudent?: Student | null;
  onClose: () => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({ initialStudent, onClose }) => {
  const { currentInstitution, addStudent, updateStudent, students, institutions } = useApp();

  const isEditing = !!initialStudent;

  const [name, setName] = useState(initialStudent?.name || '');
  const [apaarId, setApaarId] = useState(initialStudent?.apaarId || '');
  const [department, setDepartment] = useState(
    initialStudent?.department || currentInstitution.departments[0]?.department || 'Computer Science & Engineering'
  );
  const [academicYear, setAcademicYear] = useState(initialStudent?.academicYear || '2025-26');
  const [admissionCategory, setAdmissionCategory] = useState<Student['admissionCategory']>(
    initialStudent?.admissionCategory || 'General'
  );
  const [admissionStatus, setAdmissionStatus] = useState<Student['admissionStatus']>(
    initialStudent?.admissionStatus || 'Active'
  );
  const [dateOfAdmission, setDateOfAdmission] = useState(
    initialStudent?.dateOfAdmission || new Date().toISOString().split('T')[0]
  );
  const [gender, setGender] = useState<Student['gender']>(initialStudent?.gender || 'Male');
  const [email, setEmail] = useState(initialStudent?.email || '');

  // Live API Verification state
  const [isVerifyingApi, setIsVerifyingApi] = useState(false);
  const [apaarResult, setApaarResult] = useState<VerificationResult | null>(null);

  const cleanId = normalizeApaarId(apaarId);
  const is12Digits = cleanId.length === 12 && /^\d+$/.test(cleanId);
  const isDummy = cleanId === '000000000000' || cleanId === '111111111111' || cleanId === '123456789012';

  // Trigger POST /api/demo/verify against mock APAAR registry
  const handleVerifyWithApi = async () => {
    if (!cleanId) return;
    setIsVerifyingApi(true);
    try {
      const resp = await verifyApaarApi(cleanId, name.trim(), currentInstitution.name);
      setApaarResult(resp);
    } catch (err) {
      console.error('API Verification error:', err);
    } finally {
      setIsVerifyingApi(false);
    }
  };

  const handleApplyApaarDetails = () => {
    if (!apaarResult?.student) return;
    if (apaarResult.student.student_name) setName(apaarResult.student.student_name);
    if (apaarResult.student.department) setDepartment(apaarResult.student.department);
    if (apaarResult.student.academic_year) setAcademicYear(apaarResult.student.academic_year);
  };

  // Check if APAAR already exists in same college
  const isLocalDuplicate = students.some(
    s => s.institutionId === currentInstitution.id &&
         normalizeApaarId(s.apaarId) === cleanId &&
         s.id !== initialStudent?.id
  );

  // Check if cross-institution duplicate
  const crossInstitutionDuplicate = students.find(
    s => s.institutionId !== currentInstitution.id &&
         normalizeApaarId(s.apaarId) === cleanId &&
         s.academicYear === academicYear
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cleanId) return;

    if (isEditing && initialStudent) {
      updateStudent(initialStudent.id, {
        name,
        apaarId: cleanId,
        department,
        academicYear,
        admissionCategory,
        admissionStatus,
        dateOfAdmission,
        gender,
        email
      });
    } else {
      addStudent({
        name,
        apaarId: cleanId,
        department,
        academicYear,
        admissionCategory,
        admissionStatus,
        dateOfAdmission,
        gender,
        email
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditing ? 'Edit Student Enrolment Record' : 'Register New Student (Single Record)'}
            </h3>
            <p className="text-xs text-slate-500">
              Institution: <span className="font-semibold text-slate-700">{currentInstitution.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Student Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aarav Sharma"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* APAAR ID with live format validation indicator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                APAAR ID (12-Digit One Nation One Student ID) <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[11px] font-mono font-medium ${
                cleanId.length === 12 ? 'text-emerald-600' : 'text-slate-500'
              }`}>
                {cleanId.length}/12 Digits
              </span>
            </div>
            <input
              type="text"
              required
              maxLength={14}
              placeholder="e.g. 984210923841"
              value={apaarId}
              onChange={e => setApaarId(e.target.value)}
              className={`w-full font-mono text-sm p-2.5 rounded-lg border focus:outline-none transition-colors ${
                cleanId.length === 12 && !isDummy && !isLocalDuplicate
                  ? 'border-emerald-400 bg-emerald-50/20 text-slate-900 focus:ring-2 focus:ring-emerald-500'
                  : isLocalDuplicate || isDummy
                  ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-500'
                  : 'border-slate-300 focus:ring-2 focus:ring-teal-500'
              }`}
            />

            {/* Real-time warning / error labels */}
            {isDummy && (
              <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                <ShieldAlert className="w-3.5 h-3.5" />
                Repetitive dummy sequence detected. Enter genuine APAAR number.
              </p>
            )}
            {isLocalDuplicate && (
              <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                <ShieldAlert className="w-3.5 h-3.5" />
                This APAAR ID is already enrolled in {currentInstitution.name}!
              </p>
            )}
            {crossInstitutionDuplicate && !isLocalDuplicate && (
              <p className="mt-1 text-[11px] text-amber-700 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                Warning: Matches record at "{crossInstitutionDuplicate.institutionName}". Will require review.
              </p>
            )}
            {!isDummy && !isLocalDuplicate && is12Digits && !crossInstitutionDuplicate && (
              <p className="mt-1 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Format structure valid (12 Digits).
              </p>
            )}

            {/* Live API Verification Button & Result */}
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleVerifyWithApi}
                disabled={isVerifyingApi || !cleanId}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer disabled:opacity-40"
              >
                {isVerifyingApi ? (
                  <>
                    <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying with APAAR Registry...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Verify with APAAR Registry (POST /api/demo/verify)</span>
                  </>
                )}
              </button>

              {apaarResult?.latency_ms !== undefined && (
                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{apaarResult.latency_ms} ms</span>
                </span>
              )}
            </div>

            {/* API Result Display */}
            {apaarResult && (
              <div className={`mt-2 p-3 rounded-xl border text-xs space-y-2 ${
                apaarResult.status === 'DEMO_MATCH'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : apaarResult.status === 'DEMO_MISMATCH'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : apaarResult.status === 'DEMO_DUPLICATE'
                  ? 'bg-purple-50 border-purple-300 text-purple-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    {apaarResult.status === 'DEMO_MATCH' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : apaarResult.status === 'DEMO_MISMATCH' || apaarResult.status === 'DEMO_DUPLICATE' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                    )}
                    <span>{apaarResult.status} (Mode: {apaarResult.mode})</span>
                  </span>
                  <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/70">
                    HTTP 200
                  </span>
                </div>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  {apaarResult.message}
                </p>

                {/* If student details returned from mock APAAR */}
                {apaarResult.student && (
                  <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200 mt-2 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        Registry Match: {apaarResult.student.student_name}
                      </span>
                      <button
                        type="button"
                        onClick={handleApplyApaarDetails}
                        className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] cursor-pointer"
                      >
                        Auto-fill Details
                      </button>
                    </div>
                    <div className="text-slate-600 grid grid-cols-2 gap-1">
                      <div>Institution: <span className="font-medium text-slate-800">{apaarResult.student.institution_name}</span></div>
                      <div>Dept: <span className="font-medium text-slate-800">{apaarResult.student.department}</span></div>
                      <div>Code: <span className="font-mono text-slate-800">{apaarResult.student.aicte_institution_code}</span></div>
                      <div>Status: <span className="font-semibold text-emerald-700">{apaarResult.student.admission_status}</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Department & Academic Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {currentInstitution.departments.map(dept => (
                  <option key={dept.department} value={dept.department}>
                    {dept.department} (Cap: {dept.approvedIntake})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Year <span className="text-rose-500">*</span>
              </label>
              <select
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="2025-26">2025-26 (Current)</option>
                <option value="2024-25">2024-25</option>
                <option value="2023-24">2023-24</option>
              </select>
            </div>
          </div>

          {/* Admission Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admission Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={admissionCategory}
                onChange={e => setAdmissionCategory(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="General">General (Open Merit)</option>
                <option value="OBC">Other Backward Class (OBC)</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="ST">Scheduled Tribe (ST)</option>
                <option value="EWS">Economically Weaker Section (EWS)</option>
                <option value="Management Quota">Management / NRI Quota</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admission Status
              </label>
              <select
                value={admissionStatus}
                onChange={e => setAdmissionStatus(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Active">Active (Confirmed Admission)</option>
                <option value="Provisional">Provisional (Awaiting Verification)</option>
                <option value="Suspended">Suspended</option>
                <option value="Completed">Graduated / Completed</option>
              </select>
            </div>
          </div>

          {/* Date of Admission & Gender & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admission Date
              </label>
              <input
                type="date"
                value={dateOfAdmission}
                onChange={e => setDateOfAdmission(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Email
              </label>
              <input
                type="email"
                placeholder="student@college.edu.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLocalDuplicate || isDummy || !cleanId}
              className={`px-5 py-2 rounded-lg text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer ${
                isLocalDuplicate || isDummy || !cleanId
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-teal-700 hover:bg-teal-800'
              }`}
            >
              {isEditing ? 'Save Changes' : 'Submit & Validate Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
