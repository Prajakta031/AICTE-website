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
  Eye,
  EyeOff,
  FileText,
  UploadCloud,
  FileCheck2,
  Lock,
  RefreshCw,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';
import { Student, ApaarVerificationStatus } from '../../types';
import {
  formatApaarId,
  maskApaarId,
  getApaarStatusMeta,
  validateApaarFormatLevel1,
  compareStudentWithDocument
} from '../../utils/validationEngine';
import { OFFICIAL_API_CONFIG } from '../../services/apaarApiService';
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
  const {
    submitCorrection,
    currentUser,
    verifyStudentLevel1,
    compareStudentDocument,
    markStudentManualReview,
    requestOfficialVerification,
    runDemoSimulationVerification
  } = useApp();

  const [isMasked, setIsMasked] = useState(true);

  // Correction appeal form state
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [justification, setJustification] = useState('');
  const [proposedCorrection, setProposedCorrection] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  // Document upload simulation state (Level 2)
  const [uploadedDocName, setUploadedDocName] = useState<string>(student.documentRecord?.fileName || 'APAAR_Candidate_Doc.pdf');
  const [docType, setDocType] = useState<'DigiLocker APAAR Card' | 'ABC Issued Certificate' | 'Scanned Copy'>(
    student.documentRecord?.documentType || 'DigiLocker APAAR Card'
  );
  const [ocrExtractedName, setOcrExtractedName] = useState<string>(student.documentRecord?.extractedName || student.name);
  const [ocrExtractedApaar, setOcrExtractedApaar] = useState<string>(student.documentRecord?.extractedApaarId || student.apaarId);
  const [ocrConfidence, setOcrConfidence] = useState<number>(student.documentRecord?.ocrConfidence || 96);
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);
  const [docComparisonFeedback, setDocComparisonFeedback] = useState<string | null>(null);

  // Level 3 state
  const [apiProcessing, setApiProcessing] = useState(false);
  const [apiFeedback, setApiFeedback] = useState<string | null>(null);

  const statusMeta = getApaarStatusMeta(student.apaarStatus);

  // Run Level 1 verification on button click
  const handleRunLevel1 = () => {
    const res = verifyStudentLevel1(student.id);
    setDocComparisonFeedback(`Level 1 check completed: ${res.statusLabel}. ${res.disclaimer}`);
    setTimeout(() => setDocComparisonFeedback(null), 4000);
  };

  // Run Level 2 document comparison
  const handleRunLevel2Comparison = (preset?: 'match' | 'mismatch' | 'unreadable') => {
    setIsProcessingDoc(true);

    let nameToCompare = ocrExtractedName;
    let apaarToCompare = ocrExtractedApaar;
    let confidence = ocrConfidence;
    let unreadable = false;
    let fileName = uploadedDocName;

    if (preset === 'match') {
      nameToCompare = student.name;
      apaarToCompare = student.apaarId;
      confidence = 98;
      fileName = `DigiLocker_${student.name.replace(/\s+/g, '_')}_APAAR.pdf`;
      setUploadedDocName(fileName);
      setOcrExtractedName(nameToCompare);
      setOcrExtractedApaar(apaarToCompare);
      setOcrConfidence(confidence);
    } else if (preset === 'mismatch') {
      nameToCompare = student.name + ' Kumar';
      apaarToCompare = student.apaarId;
      confidence = 91;
      fileName = `Card_Scan_SpellingMismatch_${student.name.split(' ')[0]}.pdf`;
      setUploadedDocName(fileName);
      setOcrExtractedName(nameToCompare);
      setOcrExtractedApaar(apaarToCompare);
      setOcrConfidence(confidence);
    } else if (preset === 'unreadable') {
      nameToCompare = 'Unreadable';
      apaarToCompare = 'Unreadable';
      confidence = 34;
      unreadable = true;
      fileName = 'Corrupted_Scan_Blurry.png';
      setUploadedDocName(fileName);
      setOcrExtractedName('Unreadable');
      setOcrExtractedApaar('Unreadable');
      setOcrConfidence(confidence);
    }

    setTimeout(() => {
      const outcome = compareStudentDocument(student.id, {
        fileName,
        documentType: docType,
        extractedName: nameToCompare,
        extractedApaarId: apaarToCompare,
        ocrConfidence: confidence,
        isUnreadable: unreadable
      });

      setIsProcessingDoc(false);
      setDocComparisonFeedback(`Document comparison recorded: "${outcome.statusLabel}". (Document Comparison – Not Officially Verified)`);
      setTimeout(() => setDocComparisonFeedback(null), 4500);
    }, 600);
  };

  // Trigger manual review
  const handleMarkManualReview = () => {
    markStudentManualReview(student.id, 'Officer flagged document for manual verification');
    setDocComparisonFeedback('Record marked as "Manual Review Required". Institutional inspection queued.');
    setTimeout(() => setDocComparisonFeedback(null), 4000);
  };

  // Run Level 3 Official Check attempt
  const handleOfficialGatewayCheck = async () => {
    setApiProcessing(true);
    const res = await requestOfficialVerification(student.id);
    setApiProcessing(false);
    setApiFeedback(res.errorDetail || res.statusMessage);
  };

  // Run Level 3 Demo Simulation
  const handleDemoSimulation = async () => {
    setApiProcessing(true);
    const res = await runDemoSimulationVerification(student.id);
    setApiProcessing(false);
    setApiFeedback(res.statusMessage);
  };

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
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Student Profile & APAAR Verification</h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${statusMeta.badgeClass}`}>
                  {statusMeta.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Record ID: {student.id} · {student.institutionName}
              </p>
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
          {/* APAAR Digital Credential Card with Privacy Masking */}
          <div className="relative rounded-xl border border-teal-200 shadow-md p-5 overflow-hidden text-slate-800 bg-gradient-to-br from-teal-50/70 via-white to-blue-50/50">
            <div className="relative z-10 flex flex-col justify-between h-full gap-4">
              {/* Card Top Strip */}
              <div className="flex items-start justify-between border-b border-teal-200/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    AICTE
                  </div>
                  <div>
                    <div className="text-[10px] tracking-wider uppercase font-semibold text-teal-800">
                      Ministry of Education · Government of India
                    </div>
                    <div className="text-sm font-bold text-slate-900 tracking-tight">
                      APAAR · Automated Permanent Academic Account Registry
                    </div>
                    <div className="text-[11px] text-slate-500">
                      One Nation, One Student ID (Academic Bank of Credits)
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${statusMeta.badgeClass}`}>
                    <span className={`w-2 h-2 rounded-full ${statusMeta.dotColor}`} />
                    <span>{statusMeta.label}</span>
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    Tier: {statusMeta.levelBadge}
                  </div>
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
                    <div className="flex items-center justify-between pr-4">
                      <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">
                        APAAR 12-Digit Identifier (Masked for Privacy)
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsMasked(!isMasked)}
                        className="text-xs text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        {isMasked ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Reveal ID</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Mask ID</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-xl font-mono font-bold tracking-widest text-teal-900 mt-0.5">
                      {isMasked ? maskApaarId(student.apaarId) : formatApaarId(student.apaarId) || 'NOT ASSIGNED'}
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

                {/* Institution block */}
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

                  <div className="p-2 bg-white rounded border border-slate-200 text-right mt-2 text-[10px] text-slate-600">
                    <div className="font-medium text-slate-800">Verification Source:</div>
                    <div className="text-slate-500 truncate max-w-[180px]">{student.verificationSource || 'Level 1 Engine'}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5 font-mono">{student.verificationDate || 'Recent'}</div>
                  </div>
                </div>
              </div>

              {/* Card Footer Notice */}
              <div className="text-[10px] text-slate-500 pt-2 border-t border-teal-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="italic">
                  {statusMeta.description}
                </span>
                <span className="font-mono text-slate-400">Admitted: {student.dateOfAdmission}</span>
              </div>
            </div>
          </div>

          {/* Feedback alert after action */}
          {docComparisonFeedback && (
            <div className="p-3 rounded-lg bg-teal-50 border border-teal-300 text-teal-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
              <span>{docComparisonFeedback}</span>
            </div>
          )}

          {/* 3-LEVEL VERIFICATION WORKFLOW TABS */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>Transparent Three-Level APAAR Verification Workflow</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Clear separation between format validation, document comparison, and authorized government API integration.
                </p>
              </div>
            </div>

            {/* Three Sequential Verification Stages (No bulky tab buttons) */}
            <div className="divide-y divide-slate-200">
              {/* LEVEL 1: FORMAT VALIDATION */}
              <div className="p-4 space-y-3 text-xs bg-white">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center justify-center font-mono">1</span>
                    <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      Level 1: APAAR Format Validation
                    </h5>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                    Format Valid (Not Official)
                  </span>
                </div>

                {/* Result Pill & Disclaimer */}
                <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-900 flex items-start gap-2.5">
                  <FileCheck2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-xs flex items-center gap-2">
                      <span>Level 1 Status:</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 font-mono">
                        {student.apaarStatus === 'invalid_format' ? 'Invalid Format' : 'Format Valid'}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      <strong>Important Notice:</strong> "Format Valid" verifies that the APAAR ID adheres to the 12-digit numeric specification, contains no illegal dummy sequences (e.g. 000000000000), and has no active duplicate collisions.
                      <span className="block font-semibold text-rose-700 mt-0.5">
                        Format Valid does not mean Officially Verified against the government registry.
                      </span>
                    </p>
                  </div>
                </div>

                {/* Validation checklist */}
                <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Format & Syntax Audit Checks
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-700">Exactly 12 Numeric Digits Check</span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-700 font-mono text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {student.apaarId.replace(/[\s-]/g, '').length === 12 ? 'Passed (12 digits)' : 'Failed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-700">Dummy / Repetitive Sequence Rejection (e.g. 000000000000)</span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-700 font-mono text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Passed (No trivial sequence)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-700">Intra-Institutional Duplicate Check (Same College)</span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-700 font-mono text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Unique in Institution
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-700">Inter-Institutional Duplicate Enrolment Check (Cross-College)</span>
                      <span className={`flex items-center gap-1 font-semibold font-mono text-[11px] ${
                        student.crossInstitutionConflict ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                        {student.crossInstitutionConflict ? (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Flagged Conflict</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Clean (No Dual Enrolment)</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Audit Date: {student.verificationDate || 'Recently validated'}
                  </span>
                  <button
                    onClick={handleRunLevel1}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                    Re-run Level 1 Check
                  </button>
                </div>
              </div>

              {/* LEVEL 2: DOCUMENT-BASED COMPARISON */}
              <div className="p-4 space-y-3 text-xs bg-slate-50/30">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center font-mono">2</span>
                    <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      Level 2: Document-Based Comparison
                    </h5>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Document Match (Not Official)
                  </span>
                </div>

                {/* Mandatory Disclaimer */}
                <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-300 text-amber-900 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-xs flex items-center gap-2">
                      <span>Stage:</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-semibold">
                        Document Comparison – Not Officially Verified
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Upload candidate's APAAR card issued via DigiLocker or Academic Bank of Credits (ABC). Text extraction compares the candidate's name and 12-digit number against institutional records.
                      <span className="block font-semibold text-rose-700 mt-0.5">
                        Notice: An uploaded PDF or image does not prove authentic government issuance simply because text extraction succeeds.
                      </span>
                    </p>
                  </div>
                </div>

                {/* Upload & Preset Selector */}
                <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-teal-700" />
                      <span>Upload Student Document (DigiLocker PDF / Scanned Card)</span>
                    </label>
                    <span className="text-[10px] text-slate-500">Secure Client-Side Analysis</span>
                  </div>

                  {/* Preset test buttons for judges */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-medium text-slate-600">Quick Test Scenarios for Demonstration:</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleRunLevel2Comparison('match')}
                        className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        ✓ Demo: Matching DigiLocker Card
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRunLevel2Comparison('mismatch')}
                        className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        ⚠ Demo: Name Spelling Mismatch
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRunLevel2Comparison('unreadable')}
                        className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-800 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        🔍 Demo: Blurry / Unreadable Document
                      </button>
                    </div>
                  </div>

                  {/* Document metadata display */}
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="font-mono font-semibold text-slate-800">{uploadedDocName}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {docType}
                      </span>
                    </div>

                    {/* Extracted fields comparison table */}
                    <div className="divide-y divide-slate-100 pt-1 text-xs">
                      <div className="py-1.5 flex items-center justify-between">
                        <span className="text-slate-500">Submitted Name:</span>
                        <span className="font-semibold text-slate-900">{student.name}</span>
                      </div>
                      <div className="py-1.5 flex items-center justify-between">
                        <span className="text-slate-500">Document Extracted Name:</span>
                        <span className="font-mono font-semibold text-slate-800">{ocrExtractedName}</span>
                      </div>
                      <div className="py-1.5 flex items-center justify-between">
                        <span className="text-slate-500">Submitted APAAR ID:</span>
                        <span className="font-mono text-slate-900">{formatApaarId(student.apaarId)}</span>
                      </div>
                      <div className="py-1.5 flex items-center justify-between">
                        <span className="text-slate-500">Document Extracted APAAR:</span>
                        <span className="font-mono text-slate-800">{formatApaarId(ocrExtractedApaar)}</span>
                      </div>
                      <div className="py-1.5 flex items-center justify-between">
                        <span className="text-slate-500">Text Extraction Confidence:</span>
                        <span className="font-semibold text-teal-800 font-mono">{ocrConfidence}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => handleRunLevel2Comparison()}
                      disabled={isProcessingDoc}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingDoc ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Processing Document...</span>
                        </>
                      ) : (
                        <>
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Compare Extracted Details</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleMarkManualReview}
                      className="px-3 py-1.5 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Mark for Manual Review</span>
                    </button>
                  </div>
                </div>

                {/* Outcome badge if available */}
                {student.documentRecord && (
                  <div className="p-3 rounded-lg border bg-white border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Latest Document Comparison Result:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        student.documentRecord.status === 'matched'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : student.documentRecord.status === 'mismatch'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-purple-100 text-purple-800 border border-purple-300'
                      }`}>
                        {student.documentRecord.status === 'matched'
                          ? 'Document Details Matched'
                          : student.documentRecord.status === 'mismatch'
                          ? 'Document Mismatch'
                          : 'Manual Review Required'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {student.documentRecord.remarks}
                    </p>
                  </div>
                )}
              </div>

              {/* LEVEL 3: OFFICIAL APAAR/ABC API INTEGRATION */}
              <div className="p-4 space-y-3 text-xs bg-white">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center font-mono">3</span>
                    <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      Level 3: Official APAAR/ABC API Integration
                    </h5>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                    API Access Pending
                  </span>
                </div>

                {/* Prominent Access Pending State */}
                <div className="p-4 rounded-lg bg-slate-900 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-xs text-amber-300">
                        {OFFICIAL_API_CONFIG.statusLabel}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                      Integration Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Production verification requires an authorized institutional MoU with the Ministry of Education and API Setu credentials (mTLS certificate & API Key). In accordance with hackathon ethics, live government requests are disabled.
                  </p>
                </div>

                {/* Technical Gateway Contract Specifications */}
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                  <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    API Setu / ABC Gateway Specifications (Staged Backend Contract)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">API Directory</span>
                      <span className="font-semibold text-slate-800 font-mono text-[10px]">
                        directory.apisetu.gov.in/api-collection/abc
                      </span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Authentication Scheme</span>
                      <span className="font-semibold text-slate-800">OAuth 2.0 + HMAC SHA-256</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Schema Version</span>
                      <span className="font-semibold text-slate-800 font-mono text-[10px]">ABC-APAAR v2.1 (NeGD)</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Credential State</span>
                      <span className="font-semibold text-amber-700">Pending Ministry Approval</span>
                    </div>
                  </div>
                </div>

                {/* Live vs Demo actions */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Disabled Live Button */}
                    <button
                      disabled
                      title="Disabled pending authorized production credentials"
                      className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-500 font-semibold text-xs flex items-center gap-1.5 cursor-not-allowed border border-slate-300"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Live Government Gateway (API Access Pending)</span>
                    </button>

                    {/* Demo Mode Button */}
                    <button
                      onClick={handleDemoSimulation}
                      disabled={apiProcessing}
                      className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Run Demo Simulation</span>
                    </button>
                  </div>

                  {apiFeedback && (
                    <div className="p-3 rounded-lg bg-orange-50 border border-orange-300 text-orange-900 text-xs">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span>Demo Simulation – Not Official</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed">
                        {apiFeedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cross-Institution Conflict Callout if present */}
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
                Candidate must submit seat cancellation or migration proof to clear the duplicate lock.
              </p>
            </div>
          )}

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
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-xs font-medium transition-colors cursor-pointer"
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
