import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  CreditCard,
  Send,
  Edit2,
  User,
  GraduationCap,
  ExternalLink
} from 'lucide-react';
import { Student } from '../../types';
import { formatApaarId } from '../../utils/validationEngine';
import { useApp } from '../../context/AppContext';

interface StudentDetailModalProps {
  student: Student;
  onClose: () => void;
  onEdit: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onEdit
}) => {
  const { submitCorrection, currentUser } = useApp();
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [justification, setJustification] = useState('');
  const [proposedCorrection, setProposedCorrection] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim() || !proposedCorrection.trim()) return;

    submitCorrection({
      institutionId: student.institutionId,
      institutionName: student.institutionName,
      studentId: student.id,
      studentName: student.name,
      apaarId: student.apaarId,
      issueType: student.crossInstitutionConflict
        ? 'Cross-Institutional Enrolment Resolution'
        : 'APAAR ID Verification Appeal',
      justification,
      proposedCorrection
    });

    setSubmittedMessage(true);
    setTimeout(() => {
      setShowCorrectionForm(false);
      setSubmittedMessage(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Profile & APAAR Verification</h3>
              <p className="text-xs text-slate-500 font-mono">Record ID: {student.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Simulated APAAR Digital Credential Card */}
          <div className="relative rounded-xl border border-teal-200 shadow-md p-5 overflow-hidden text-slate-800 bg-gradient-to-br from-teal-50/70 via-white to-blue-50/50">
            {/* Background Guilloche Texture */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
              style={{ backgroundImage: `url('/src/assets/images/apaar_digital_card_bg_1793373599190.jpg')` }}
            />

            <div className="relative z-10 flex flex-col justify-between h-full gap-4">
              {/* Card Top Strip */}
              <div className="flex items-start justify-between border-b border-teal-200/80 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/src/assets/images/aicte_emblem_insignia_1793373599365.jpg"
                    alt="AICTE Insignia"
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-contain rounded-full shadow-xs"
                  />
                  <div>
                    <div className="text-[10px] tracking-wider uppercase font-semibold text-teal-800">
                      Ministry of Education · Government of India
                    </div>
                    <div className="text-sm font-bold text-slate-900 tracking-tight">
                      APAAR · Automated Permanent Academic Account Registry
                    </div>
                    <div className="text-[11px] text-slate-500">
                      One Nation, One Student ID (ABC ID Ecosystem)
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold ${
                      student.validationStatus === 'valid'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : student.validationStatus === 'review'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {student.validationStatus === 'valid' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {student.validationStatus === 'review' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                    {student.validationStatus === 'error' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                    <span>
                      {student.validationStatus === 'valid'
                        ? 'Valid Record'
                        : student.validationStatus === 'review'
                        ? 'Requires Review'
                        : 'Error Detected'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Card Center - Student Info & APAAR Number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="sm:col-span-2 space-y-2">
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Candidate Full Name</div>
                    <div className="text-lg font-bold text-slate-950">{student.name}</div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">APAAR 12-Digit Identifier</div>
                    <div className="text-xl font-mono font-bold tracking-widest text-teal-900">
                      {formatApaarId(student.apaarId) || 'NOT ASSIGNED'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Department</span>
                      <span className="font-semibold text-slate-800">{student.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Academic Term</span>
                      <span className="font-semibold text-slate-800">{student.academicYear}</span>
                    </div>
                  </div>
                </div>

                {/* Institution & QR simulation block */}
                <div className="flex flex-col items-end justify-between border-t sm:border-t-0 sm:border-l border-teal-200/60 pt-3 sm:pt-0 sm:pl-4 text-right">
                  <div className="text-xs">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Institution</div>
                    <div className="font-semibold text-slate-900 text-xs truncate max-w-[170px]">
                      {student.institutionName}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Category: <span className="font-medium text-slate-800">{student.admissionCategory}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Status: <span className="font-medium text-slate-800">{student.admissionStatus}</span>
                    </div>
                  </div>

                  {/* QR Pattern visual */}
                  <div className="w-16 h-16 bg-white p-1 rounded border border-slate-300 shadow-2xs mt-2 self-end flex items-center justify-center">
                    <div className="w-full h-full bg-slate-900 rounded-xs flex items-center justify-center text-[9px] text-white font-mono font-bold">
                      QR·OK
                    </div>
                  </div>
                </div>
              </div>

              {/* Disclaimer Notice */}
              <div className="text-[10px] text-slate-500 pt-2 border-t border-teal-200/60 flex items-center justify-between">
                <span>Synthetic simulation for AICTE SIH26263 platform. Does not query live UIDAI/DigiLocker servers.</span>
                <span className="font-mono">Admitted: {student.dateOfAdmission}</span>
              </div>
            </div>
          </div>

          {/* Cross-Institution Dual Enrolment Alert Callout if exists */}
          {student.crossInstitutionConflict && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Inter-Institutional Dual Enrolment Conflict Detected</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                This APAAR ID (<span className="font-mono font-semibold">{formatApaarId(student.apaarId)}</span>) is also registered at:
              </p>
              <div className="bg-white/80 p-3 rounded border border-amber-200 text-xs space-y-1">
                <div className="font-bold text-slate-900">
                  {student.crossInstitutionConflict.otherInstitutionName}
                </div>
                <div className="text-slate-600">
                  Student: <span className="font-medium text-slate-900">{student.crossInstitutionConflict.otherStudentName}</span> · Department: {student.crossInstitutionConflict.otherDepartment} · AY: {student.crossInstitutionConflict.otherYear}
                </div>
              </div>
              <p className="text-[11px] text-amber-700 italic">
                Rule 4: Candidate must submit seat cancellation or migration proof to clear the duplicate lock.
              </p>
            </div>
          )}

          {/* Validation Engine Rule-by-Rule Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span>Automated Validation Engine Audit (6 Rules Checked)</span>
              </h4>
              <span className="text-xs text-slate-500 font-mono">
                {student.validationChecks?.filter(c => c.passed).length || 0} / {student.validationChecks?.length || 6} Passed
              </span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
              {student.validationChecks && student.validationChecks.length > 0 ? (
                student.validationChecks.map((check, idx) => (
                  <div key={idx} className="p-3 text-xs flex items-start gap-3 bg-white hover:bg-slate-50/80 transition-colors">
                    {check.severity === 'success' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {check.severity === 'warning' && (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    {check.severity === 'error' && (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{check.name}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
                            check.severity === 'success'
                              ? 'text-emerald-700 bg-emerald-50'
                              : check.severity === 'warning'
                              ? 'text-amber-700 bg-amber-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {check.ruleId}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">
                        {check.message}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-xs text-slate-500">Validation checks pending.</div>
              )}
            </div>
          </div>

          {/* Remediation & Correction Appeal Form */}
          {showCorrectionForm && (
            <form onSubmit={handleCorrectionSubmit} className="p-4 rounded-lg bg-slate-100 border border-slate-300 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-xs text-slate-900">Submit Verification & Correction Appeal</h5>
                <button
                  type="button"
                  onClick={() => setShowCorrectionForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              {submittedMessage ? (
                <div className="p-3 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Appeal submitted to AICTE Compliance Desk successfully!</span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Proposed Resolution / Corrected Value
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Update APAAR to authentic ID or attach surrender certificate"
                      value={proposedCorrection}
                      onChange={e => setProposedCorrection(e.target.value)}
                      className="w-full text-xs p-2 rounded border border-slate-300 bg-white focus:outline-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Justification & Documentary Evidence
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Explain institutional verification, candidate DigiLocker clearance, or seat transfer details..."
                      value={justification}
                      onChange={e => setJustification(e.target.value)}
                      className="w-full text-xs p-2 rounded border border-slate-300 bg-white focus:outline-teal-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Appeal to AICTE Bureau
                  </button>
                </>
              )}
            </form>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!showCorrectionForm && (
              <button
                onClick={() => setShowCorrectionForm(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-xs font-medium transition-colors"
              >
                File Correction Appeal
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="px-4 py-1.5 rounded-lg border border-teal-700 text-teal-700 hover:bg-teal-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Record
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
