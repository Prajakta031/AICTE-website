import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  Edit2,
  Check,
  Save,
  HelpCircle,
  RotateCcw,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { downloadSampleCsvTemplate } from '../../utils/exportUtils';
import { normalizeApaarId, formatApaarId, validateStudentData } from '../../utils/validationEngine';
import { Student, ValidationCheck } from '../../types';

interface ParsedRow {
  id: string;
  rowNum: number;
  name: string;
  apaarId: string;
  department: string;
  academicYear: string;
  admissionCategory: string;
  admissionStatus: string;
  dateOfAdmission: string;
  gender: string;
  email: string;
  validationStatus: 'valid' | 'review' | 'error';
  validationChecks: ValidationCheck[];
  flagNotes: string;
  issueType: string;
  issueExplanation: string;
  suggestedCorrection: string;
}

export const DataUploadView: React.FC = () => {
  const { currentInstitution, students, institutions, batchUploadStudents, setActiveTab, theme } = useApp();

  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{ name: string; apaarId: string; department: string }>({
    name: '',
    apaarId: '',
    department: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccessSummary, setUploadSuccessSummary] = useState<{
    added: number;
    valid: number;
    review: number;
    error: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse CSV line safely
  const parseCsvLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  // Analyze errors and create suggested corrections in friendly plain language
  const derivePlainIssueDetails = (res: any, rowName: string, rawApaar: string) => {
    const failedChecks = res.validationChecks.filter((c: any) => !c.passed);
    if (failedChecks.length === 0) {
      return {
        issueType: 'None',
        issueExplanation: 'Record passes all checks.',
        suggestedCorrection: 'Ready to submit.'
      };
    }

    const firstFailed = failedChecks[0];
    let issueType = 'Information Needed';
    let issueExplanation = firstFailed.message;
    let suggestedCorrection = 'Review and update student information.';

    if (firstFailed.ruleId === 'RULE_MANDATORY_FIELDS') {
      issueType = 'Missing Required Fields';
      issueExplanation = !rowName ? 'Student name is missing' : 'Student ID (APAAR ID) is empty';
      suggestedCorrection = 'Enter student full name and 12-digit APAAR ID';
    } else if (firstFailed.ruleId === 'RULE_APAAR_FORMAT') {
      issueType = 'Invalid Student ID Format';
      issueExplanation = rawApaar.length !== 12
        ? `Student ID has ${rawApaar.length} digits instead of required 12 digits`
        : 'Student ID contains a placeholder dummy number (e.g. 000000000000)';
      suggestedCorrection = 'Verify official APAAR / ABC card and enter 12-digit number';
    } else if (firstFailed.ruleId === 'RULE_LOCAL_DUPLICATE') {
      issueType = 'Same ID Used Twice in College';
      issueExplanation = 'This Student ID is already assigned to another student in your institution';
      suggestedCorrection = 'Check for duplicate entry or typo in APAAR ID';
    } else if (firstFailed.ruleId === 'RULE_CROSS_INSTITUTION_DUPLICATE') {
      issueType = 'Student ID Found at Another College';
      issueExplanation = 'This Student ID is actively registered at another AICTE-approved institution';
      suggestedCorrection = 'Verify student transfer certificate or seat surrender proof';
    } else if (firstFailed.ruleId === 'RULE_INTAKE_LIMIT') {
      issueType = 'Admissions Above Approved Limit';
      issueExplanation = 'This admission exceeds the sanctioned seat limit for this department';
      suggestedCorrection = 'Confirm seat quota allocation with Academic Office';
    }

    return { issueType, issueExplanation, suggestedCorrection };
  };

  // Parse text content into structured rows
  const parseAndValidateContent = (text: string, sourceName: string) => {
    setFileName(sourceName);
    setUploadSuccessSummary(null);

    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) {
      alert('The selected file appears to be empty or contains only a header.');
      return;
    }

    const dataLines = lines.slice(1);

    const batchPeers = dataLines.map((line, idx) => {
      const parts = parseCsvLine(line);
      return {
        apaarId: normalizeApaarId(parts[1] || ''),
        tempId: `batch-temp-${idx}`
      };
    });

    const validatedRows: ParsedRow[] = dataLines.map((line, idx) => {
      const parts = parseCsvLine(line);
      const rowId = `temp-row-${idx + 1}`;

      const rawName = parts[0]?.trim() || '';
      const rawApaar = normalizeApaarId(parts[1] || '');
      const rawDept = parts[2]?.trim() || currentInstitution.departments[0]?.department || 'Computer Science & Engineering';
      const rawYear = parts[3]?.trim() || '2025-26';
      const rawCategory = parts[4]?.trim() || 'General';
      const rawStatus = parts[5]?.trim() || 'Active';
      const rawDate = parts[6]?.trim() || new Date().toISOString().split('T')[0];
      const rawGender = parts[7]?.trim() || 'Male';
      const rawEmail = parts[8]?.trim() || '';

      const tempCandidate: Partial<Student> = {
        id: rowId,
        name: rawName,
        apaarId: rawApaar,
        department: rawDept,
        academicYear: rawYear,
        admissionCategory: rawCategory as any,
        admissionStatus: rawStatus as any,
        dateOfAdmission: rawDate,
        gender: rawGender as any,
        email: rawEmail,
        institutionId: currentInstitution.id,
        institutionName: currentInstitution.name
      };

      const res = validateStudentData({
        student: tempCandidate,
        existingStudents: students,
        institutions,
        currentInstitutionId: currentInstitution.id,
        isBatchMode: true,
        batchPeers
      });

      const { issueType, issueExplanation, suggestedCorrection } = derivePlainIssueDetails(res, rawName, rawApaar);

      return {
        id: rowId,
        rowNum: idx + 1,
        name: rawName,
        apaarId: rawApaar,
        department: rawDept,
        academicYear: rawYear,
        admissionCategory: rawCategory,
        admissionStatus: rawStatus,
        dateOfAdmission: rawDate,
        gender: rawGender,
        email: rawEmail,
        validationStatus: res.validationStatus,
        validationChecks: res.validationChecks,
        flagNotes: res.flagNotes,
        issueType,
        issueExplanation,
        suggestedCorrection
      };
    });

    setParsedRows(validatedRows);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      parseAndValidateContent(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      parseAndValidateContent(content, file.name);
    };
    reader.readAsText(file);
  };

  // Demo file with intentional mistakes for easy jury demonstration
  const loadDemoFile = () => {
    const sampleBatchCsv = `Student Name,APAAR ID,Department,Academic Year,Admission Category,Admission Status,Date of Admission,Gender,Email
Ishaan Mathur,984210923841,Computer Science & Engineering,2025-26,General,Active,2025-08-14,Male,ishaan@example.edu.in
Bhavna Sen,827103948201,Electronics & Communication,2025-26,OBC,Active,2025-08-12,Female,bhavna@example.edu.in
Rohan Vikram Singhania,761928401928,Computer Science & Engineering,2025-26,General,Provisional,2025-08-16,Male,rohan@example.edu.in
Arjun Kumar,000000000000,Civil Engineering,2025-26,SC,Provisional,2025-08-20,Male,arjun@example.edu.in
Kavita Sharma,984210923841,Mechanical Engineering,2025-26,ST,Active,2025-08-18,Female,kavita@example.edu.in
Divya Nambiar,,AI & Data Science,2025-26,EWS,Active,2025-08-15,Female,divya@example.edu.in
Harshita Verma,491820481029,AI & Data Science,2025-26,General,Active,2025-08-11,Female,harshita@example.edu.in`;

    parseAndValidateContent(sampleBatchCsv, 'SIH_Demonstration_Student_Enrolment.csv');
  };

  const startEditRow = (row: ParsedRow) => {
    setEditingRowId(row.id);
    setEditFormData({
      name: row.name,
      apaarId: row.apaarId,
      department: row.department
    });
  };

  const saveEditRow = (rowId: string) => {
    setParsedRows(prev => {
      const updatedList = prev.map(r => (r.id === rowId ? { ...r, ...editFormData } : r));

      const batchPeers = updatedList.map((item, idx) => ({
        apaarId: normalizeApaarId(item.apaarId),
        tempId: item.id
      }));

      return updatedList.map(item => {
        if (item.id !== rowId) return item;

        const candidate: Partial<Student> = {
          id: item.id,
          name: item.name,
          apaarId: normalizeApaarId(item.apaarId),
          department: item.department,
          academicYear: item.academicYear,
          admissionCategory: item.admissionCategory as any,
          admissionStatus: item.admissionStatus as any,
          dateOfAdmission: item.dateOfAdmission,
          gender: item.gender as any,
          email: item.email,
          institutionId: currentInstitution.id,
          institutionName: currentInstitution.name
        };

        const res = validateStudentData({
          student: candidate,
          existingStudents: students,
          institutions,
          currentInstitutionId: currentInstitution.id,
          isBatchMode: true,
          batchPeers
        });

        const { issueType, issueExplanation, suggestedCorrection } = derivePlainIssueDetails(res, item.name, item.apaarId);

        return {
          ...item,
          validationStatus: res.validationStatus,
          validationChecks: res.validationChecks,
          flagNotes: res.flagNotes,
          issueType,
          issueExplanation,
          suggestedCorrection
        };
      });
    });

    setEditingRowId(null);
  };

  // Commit valid/reviewed records
  const handleCommitToDatabase = () => {
    if (parsedRows.length === 0) return;
    setIsSubmitting(true);

    const candidates: Partial<Student>[] = parsedRows.map(r => ({
      name: r.name,
      apaarId: r.apaarId,
      department: r.department,
      academicYear: r.academicYear,
      admissionCategory: r.admissionCategory as any,
      admissionStatus: r.admissionStatus as any,
      dateOfAdmission: r.dateOfAdmission,
      gender: r.gender as any,
      email: r.email
    }));

    const result = batchUploadStudents(candidates);
    setUploadSuccessSummary(result);
    setIsSubmitting(false);
  };

  const validRows = parsedRows.filter(r => r.validationStatus === 'valid');
  const issueRows = parsedRows.filter(r => r.validationStatus !== 'valid');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Upload Student Data
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload your institution's student enrolment list using Excel or CSV format in three easy steps.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDemoFile}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Demo File (For Jury)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Step Visual Process Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
              Phase 01
            </span>
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
          </div>
          <h3 className="font-bold text-xs text-slate-900">Download Excel Template</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Standard AICTE enrolment spreadsheet format with all mandatory verification fields.
          </p>
          <button
            onClick={downloadSampleCsvTemplate}
            className={`w-full mt-1 py-1.5 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              theme === 'bharat-royal'
                ? 'border-orange-500 text-orange-800 hover:bg-orange-50'
                : theme === 'academic-emerald'
                ? 'border-emerald-700 text-emerald-800 hover:bg-emerald-50'
                : theme === 'digital-indigo'
                ? 'border-indigo-600 text-indigo-800 hover:bg-indigo-50'
                : 'border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample Template</span>
          </button>
        </div>

        {/* Step 2 */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
              Phase 02
            </span>
            <UploadCloud className="w-4 h-4 text-slate-500" />
          </div>
          <h3 className="font-bold text-xs text-slate-900">Upload Completed File</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Drag and drop or select your filled student enrolment Excel or CSV spreadsheet.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`w-full mt-1 py-1.5 px-3 text-xs font-semibold rounded-lg text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
              theme === 'bharat-royal'
                ? 'bg-orange-600 hover:bg-orange-700'
                : theme === 'academic-emerald'
                ? 'bg-emerald-700 hover:bg-emerald-800'
                : theme === 'digital-indigo'
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : theme === 'executive-dark'
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Select Student File</span>
          </button>
        </div>

        {/* Step 3 */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
              Phase 03
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="font-bold text-xs text-slate-900">Level 1 Format Validation</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Automatic real-time pre-flight verification with in-line correction workbench.
          </p>
          <div className="text-[10px] text-blue-700 font-semibold pt-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>Format Valid – Does not mean Officially Verified</span>
          </div>
        </div>
      </div>

      {/* Upload Drag & Drop Zone */}
      {parsedRows.length === 0 && !uploadSuccessSummary && (
        <div
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-slate-800 bg-slate-50 scale-[1.005]'
              : 'border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-3">
            <div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mx-auto shadow-2xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Drag and drop student enrolment roster here
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Supports CSV, XLS, XLSX formats. Or click anywhere in this area to browse disk.
              </p>
            </div>
            <div className="pt-1">
              <span className="text-xs font-semibold text-slate-700 border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg inline-block transition-colors">
                Browse Files
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification after committing */}
      {uploadSuccessSummary && (
        <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">
                Successfully Added {uploadSuccessSummary.added} Student Records to Database!
              </div>
              <div className="text-xs text-emerald-800 mt-0.5">
                {uploadSuccessSummary.valid} records verified successfully. Records requiring review can be managed in the Student Records tab.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setUploadSuccessSummary(null);
                setParsedRows([]);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-600 text-emerald-800 hover:bg-emerald-100"
            >
              Upload Another File
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 flex items-center gap-1 shadow-2xs"
            >
              <span>View Student Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Post-Upload Review & Correction Workspace */}
      {parsedRows.length > 0 && !uploadSuccessSummary && (
        <div className="space-y-6">
          {/* Summary Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Total Rows</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">{parsedRows.length}</div>
            </div>

            <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
              <span className="text-[11px] text-emerald-800 font-semibold uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ready to Save</span>
              </span>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">{validRows.length}</div>
            </div>

            <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 shadow-2xs">
              <span className="text-[11px] text-amber-800 font-semibold uppercase flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Needs Review</span>
              </span>
              <div className="text-xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
                {parsedRows.filter(r => r.validationStatus === 'review').length}
              </div>
            </div>

            <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200 shadow-2xs">
              <span className="text-[11px] text-rose-800 font-semibold uppercase flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Needs Correction</span>
              </span>
              <div className="text-xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
                {parsedRows.filter(r => r.validationStatus === 'error').length}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-600">
              Uploaded File: <span className="font-bold text-slate-900">{fileName}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setParsedRows([])}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel & Upload New
              </button>
              <button
                onClick={handleCommitToDatabase}
                disabled={isSubmitting}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer text-white ${
                  theme === 'bharat-royal'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : theme === 'academic-emerald'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : theme === 'digital-indigo'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : theme === 'executive-dark'
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save All {parsedRows.length} Records to Database</span>
              </button>
            </div>
          </div>

          {/* Error Table per Section 5 Requirements */}
          {issueRows.length > 0 && (
            <div className="bg-white rounded-xl border border-rose-200 shadow-2xs overflow-hidden">
              <div className="p-4 bg-rose-50/50 border-b border-rose-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-rose-950 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Records That Need Correction Before Finalizing</span>
                  </h3>
                  <p className="text-xs text-rose-800 mt-0.5">
                    Click "Correct Information" to fix student details right now without re-uploading the file.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-rose-800 bg-white px-2 py-0.5 rounded border border-rose-300">
                  {issueRows.length} Issues Flagged
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                      <th className="py-2.5 px-3 w-14 text-center">Row</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Type of Issue</th>
                      <th className="py-2.5 px-3">Explanation of Problem</th>
                      <th className="py-2.5 px-3">Suggested Correction</th>
                      <th className="py-2.5 px-3 text-right">Action to Correct</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {issueRows.map(row => {
                      const isEditing = editingRowId === row.id;

                      return (
                        <tr key={row.id} className="hover:bg-rose-50/30 transition-colors">
                          <td className="py-2.5 px-3 text-center font-mono text-slate-500 font-bold">
                            #{row.rowNum}
                          </td>

                          <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editFormData.name}
                                onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                                className="p-1 border border-teal-600 rounded text-xs bg-white w-36"
                              />
                            ) : (
                              row.name || <span className="text-rose-600 italic">Missing Name</span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              {row.issueType}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-slate-700 text-[11px] max-w-xs">
                            {row.issueExplanation}
                          </td>

                          <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs">
                            {row.suggestedCorrection}
                          </td>

                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <input
                                  type="text"
                                  placeholder="Correct APAAR ID"
                                  maxLength={14}
                                  value={editFormData.apaarId}
                                  onChange={e => setEditFormData({ ...editFormData, apaarId: e.target.value })}
                                  className="p-1 border border-teal-600 rounded text-xs font-mono bg-white w-32"
                                />
                                <button
                                  onClick={() => saveEditRow(row.id)}
                                  className="px-2 py-1 rounded bg-teal-700 text-white hover:bg-teal-800 font-semibold text-xs flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Apply</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEditRow(row)}
                                className="px-2.5 py-1 rounded-lg border border-teal-700 text-teal-800 hover:bg-teal-50 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Correct Information</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Clean Preview of All Uploaded Records */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Preview All Uploaded Records ({parsedRows.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Verify the parsed rows before final submission to the student registry
                </p>
              </div>
            </div>

            <div className="overflow-x-auto max-h-60">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Student Name</th>
                    <th className="py-2 px-3">APAAR ID</th>
                    <th className="py-2 px-3">Department</th>
                    <th className="py-2 px-3">Year</th>
                    <th className="py-2 px-3">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-slate-400">{row.rowNum}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{row.name || 'Missing'}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{formatApaarId(row.apaarId) || 'Missing'}</td>
                      <td className="py-2 px-3 text-slate-700">{row.department}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{row.academicYear}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.validationStatus === 'valid'
                            ? 'bg-emerald-50 text-emerald-800'
                            : row.validationStatus === 'review'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-rose-50 text-rose-800'
                        }`}>
                          {row.validationStatus === 'valid' ? 'Valid' : row.validationStatus === 'review' ? 'Review' : 'Error'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
