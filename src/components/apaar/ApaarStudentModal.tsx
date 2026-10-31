import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Sparkles, Building2, User, BookOpen, Calendar, ShieldCheck } from 'lucide-react';
import { SyntheticStudent } from '../../services/apaarApi';

interface ApaarStudentModalProps {
  initialStudent?: SyntheticStudent | null;
  onSave: (data: Partial<SyntheticStudent>) => Promise<void>;
  onClose: () => void;
}

export const ApaarStudentModal: React.FC<ApaarStudentModalProps> = ({
  initialStudent,
  onSave,
  onClose
}) => {
  const isEditing = !!initialStudent;

  const [apaarId, setApaarId] = useState(initialStudent?.apaar_id || '');
  const [studentName, setStudentName] = useState(initialStudent?.student_name || '');
  const [institutionName, setInstitutionName] = useState(
    initialStudent?.institution_name || 'Delhi Technological University'
  );
  const [aicteCode, setAicteCode] = useState(initialStudent?.aicte_institution_code || '1-1049281');
  const [department, setDepartment] = useState(
    initialStudent?.department || 'Computer Science & Engineering'
  );
  const [academicYear, setAcademicYear] = useState(initialStudent?.academic_year || '2025-26');
  const [admissionStatus, setAdmissionStatus] = useState<SyntheticStudent['admission_status']>(
    initialStudent?.admission_status || 'Active'
  );
  const [gender, setGender] = useState<SyntheticStudent['gender']>(initialStudent?.gender || 'Male');
  const [dob, setDob] = useState(initialStudent?.dob || '2004-01-01');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate test APAAR ID if blank
  const handleGenerateSyntheticId = () => {
    const randomSuffix = String(Math.floor(100000 + Math.random() * 900000));
    setApaarId(`900000${randomSuffix}`);
  };

  const cleanId = apaarId.replace(/[\s-]/g, '').trim();
  const isValid12 = /^\d{12}$/.test(cleanId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cleanId || !isValid12) {
      setError('APAAR ID must be exactly 12 numeric digits.');
      return;
    }
    if (!studentName.trim()) {
      setError('Student Name is required.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        apaar_id: cleanId,
        student_name: studentName.trim(),
        institution_name: institutionName.trim(),
        aicte_institution_code: aicteCode.trim(),
        department,
        academic_year: academicYear,
        admission_status: admissionStatus,
        gender,
        dob
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save student record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>{isEditing ? 'Edit Synthetic Student Record' : 'Register New Synthetic Student'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulated government database record for SIH 2026 demo
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* APAAR ID */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Synthetic APAAR ID (12 Digits) <span className="text-rose-500">*</span>
              </label>
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleGenerateSyntheticId}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate Test ID</span>
                </button>
              )}
            </div>
            <input
              type="text"
              required
              maxLength={14}
              value={apaarId}
              onChange={e => setApaarId(e.target.value)}
              placeholder="e.g. 900000000001"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono tracking-wider focus:outline-none transition-colors ${
                isValid12
                  ? 'border-emerald-400 bg-emerald-50/20 text-slate-900 focus:ring-2 focus:ring-emerald-500'
                  : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'
              }`}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Must be exactly 12 numeric digits ({cleanId.length}/12 digits entered)
            </p>
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Student Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Institution & AICTE Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institution Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={institutionName}
                onChange={e => setInstitutionName(e.target.value)}
                placeholder="e.g. Delhi Technological University"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                AICTE Institution Code
              </label>
              <input
                type="text"
                value={aicteCode}
                onChange={e => setAicteCode(e.target.value)}
                placeholder="e.g. 1-1049281"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Department & Academic Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department / Branch
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="AI & Data Science">AI & Data Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                placeholder="2025-26"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Admission Status & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admission Status
              </label>
              <select
                value={admissionStatus}
                onChange={e => setAdmissionStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Provisional">Provisional</option>
                <option value="Graduated">Graduated</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving to Database...' : isEditing ? 'Update Record' : 'Save Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
