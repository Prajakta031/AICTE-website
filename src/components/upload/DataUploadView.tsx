import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Edit2,
  Check,
  Save
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
  errorMessages: string[];
}

export const DataUploadView: React.FC = () => {
  const { currentInstitution, students, institutions, batchUploadStudents, setActiveTab } = useApp();

  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccessSummary, setUploadSuccessSummary] = useState<{
    added: number;
    valid: number;
    review: number;
    error: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse raw text into structured rows
  const parseAndValidateContent = (text: string, sourceName: string) => {
    setFileName(sourceName);
    setUploadSuccessSummary(null);

    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) {
      alert('File appears to be empty or contains only header row.');
      return;
    }

    // Header inspection
    const headerLine = lines[0];
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

      const errorMessages = res.validationChecks
        .filter(c => c.severity === 'error' || c.severity === 'warning')
        .map(c => c.message);

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
        errorMessages
      };
    });

    setParsedRows(validatedRows);
  };

  // Robust CSV parser supporting quotes and commas
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

  // Pre-load Synthetic Demonstration Batch
  const loadDemoBatch = () => {
    const sampleBatchCsv = `Student Name,APAAR ID,Department,Academic Year,Admission Category,Admission Status,Date of Admission,Gender,Email
Ishaan Mathur,984210923841,Computer Science & Engineering,2025-26,General,Active,2025-08-14,Male,ishaan@example.edu.in
Bhavna Sen,827103948201,Electronics & Communication,2025-26,OBC,Active,2025-08-12,Female,bhavna@example.edu.in
Rohan Vikram Singhania,761928401928,Computer Science & Engineering,2025-26,General,Provisional,2025-08-16,Male,rohan@example.edu.in
Arjun Dummy,000000000000,Civil Engineering,2025-26,SC,Provisional,2025-08-20,Male,arjun@example.edu.in
Kavita Duplicate,984210923841,Mechanical Engineering,2025-26,ST,Active,2025-08-18,Female,kavita@example.edu.in
Divya Nambiar,,AI & Data Science,2025-26,EWS,Active,2025-08-15,Female,divya@example.edu.in
Harshita Verma,491820481029,AI & Data Science,2025-26,General,Active,2025-08-11,Female,harshita@example.edu.in`;

    parseAndValidateContent(sampleBatchCsv, 'SIH_Demonstration_Student_Enrolment_Batch.csv');
  };

  // Save row inline edit
  const handleInlineSave = (rowId: string, updated: Partial<ParsedRow>) => {
    setParsedRows(prev => {
      const updatedList = prev.map(r => (r.id === rowId ? { ...r, ...updated } : r));

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

        const errorMessages = res.validationChecks
          .filter(c => c.severity === 'error' || c.severity === 'warning')
          .map(c => c.message);

        return {
          ...item,
          validationStatus: res.validationStatus,
          validationChecks: res.validationChecks,
          flagNotes: res.flagNotes,
          errorMessages
        };
      });
    });

    setEditingRowId(null);
  };

  // Submit parsed batch to institutional database
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

  // Counts
  const validCount = parsedRows.filter(r => r.validationStatus === 'valid').length;
  const reviewCount = parsedRows.filter(r => r.validationStatus === 'review').length;
  const errorCount = parsedRows.filter(r => r.validationStatus === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Batch Student Data Upload & Pre-Validation Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Target Institution:{' '}
            <span className="font-semibold text-slate-700">{currentInstitution.name}</span> · Real-time
            duplicate & format inspection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadSampleCsvTemplate}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            <span>Download CSV Template</span>
          </button>

          <button
            onClick={loadDemoBatch}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Demo Batch</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-teal-500 bg-teal-50/50 scale-[1.005]'
            : 'border-slate-300 hover:border-teal-500/80 bg-white hover:bg-slate-50/50'
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
          <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              Drag and drop student enrolment CSV or Excel file here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports CSV, TSV, and tabular formats up to 5,000 student records per submission
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Browse local file</span>
          </div>
        </div>
      </div>

      {/* Success banner after submission */}
      {uploadSuccessSummary && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">
                Successfully committed {uploadSuccessSummary.added} student records!
              </div>
              <div className="text-xs text-emerald-700">
                {uploadSuccessSummary.valid} valid records, {uploadSuccessSummary.review} flagged for review, and{' '}
                {uploadSuccessSummary.error} records with validation alerts stored in registry.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('students')}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 flex items-center gap-1.5"
          >
            <span>View Student Registry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Parsed Preview Section */}
      {parsedRows.length > 0 && !uploadSuccessSummary && (
        <div className="space-y-4">
          {/* Summary KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Total Rows Parsed</span>
              <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">{parsedRows.length}</div>
            </div>

            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ready to Commit</span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">{validCount}</div>
            </div>

            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-amber-800 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Requires Review</span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-700 tabular-nums">{reviewCount}</div>
            </div>

            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-rose-800 font-medium">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Errors Flagged</span>
              </div>
              <div className="text-xl font-bold font-mono text-rose-700 tabular-nums">{errorCount}</div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-600">
              File: <span className="font-semibold text-slate-900">{fileName}</span> ·{' '}
              <span className="italic">Click any row below to edit and fix errors before committing.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setParsedRows([])}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                Clear File
              </button>
              <button
                onClick={handleCommitToDatabase}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-teal-700 text-white hover:bg-teal-800 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Commit {parsedRows.length} Records to Database</span>
              </button>
            </div>
          </div>

          {/* Pre-Validation Table with Inline Fixing */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto max-h-[460px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold z-10">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">Row</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">APAAR ID</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Year</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Validation Status & Diagnostics</th>
                    <th className="py-2.5 px-3 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map(row => {
                    const isEditingThis = editingRowId === row.id;

                    return (
                      <tr
                        key={row.id}
                        className={`transition-colors ${
                          row.validationStatus === 'error'
                            ? 'bg-rose-50/30 hover:bg-rose-50/50'
                            : row.validationStatus === 'review'
                            ? 'bg-amber-50/20 hover:bg-amber-50/40'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Row Num */}
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {row.rowNum}
                        </td>

                        {/* Name */}
                        <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                          {isEditingThis ? (
                            <input
                              type="text"
                              value={row.name}
                              onChange={e =>
                                setParsedRows(prev =>
                                  prev.map(r => (r.id === row.id ? { ...r, name: e.target.value } : r))
                                )
                              }
                              className="p-1 border border-teal-500 rounded text-xs bg-white w-40"
                            />
                          ) : (
                            row.name || <span className="text-rose-500 italic">Missing Name</span>
                          )}
                        </td>

                        {/* APAAR ID */}
                        <td className="py-2.5 px-3 font-mono font-medium tracking-wide whitespace-nowrap">
                          {isEditingThis ? (
                            <input
                              type="text"
                              value={row.apaarId}
                              maxLength={14}
                              onChange={e =>
                                setParsedRows(prev =>
                                  prev.map(r => (r.id === row.id ? { ...r, apaarId: e.target.value } : r))
                                )
                              }
                              className="p-1 border border-teal-500 rounded text-xs bg-white w-36 font-mono"
                            />
                          ) : (
                            formatApaarId(row.apaarId) || (
                              <span className="text-rose-600 font-sans italic">Missing ID</span>
                            )
                          )}
                        </td>

                        {/* Department */}
                        <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                          {isEditingThis ? (
                            <select
                              value={row.department}
                              onChange={e =>
                                setParsedRows(prev =>
                                  prev.map(r => (r.id === row.id ? { ...r, department: e.target.value } : r))
                                )
                              }
                              className="p-1 border border-teal-500 rounded text-xs bg-white"
                            >
                              {currentInstitution.departments.map(d => (
                                <option key={d.department} value={d.department}>
                                  {d.department}
                                </option>
                              ))}
                            </select>
                          ) : (
                            row.department
                          )}
                        </td>

                        {/* Academic Year */}
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {row.academicYear}
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                            {row.admissionCategory}
                          </span>
                        </td>

                        {/* Validation Status & Detailed diagnostics */}
                        <td className="py-2.5 px-3">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                                row.validationStatus === 'valid'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : row.validationStatus === 'review'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {row.validationStatus === 'valid' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              {row.validationStatus === 'review' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                              {row.validationStatus === 'error' && <XCircle className="w-3 h-3 text-rose-600" />}
                              <span>
                                {row.validationStatus === 'valid'
                                  ? 'Valid Record'
                                  : row.validationStatus === 'review'
                                  ? 'Review Required'
                                  : 'Error Detected'}
                              </span>
                            </span>

                            {row.errorMessages.length > 0 && (
                              <div className="text-[11px] text-rose-700 space-y-0.5 leading-snug">
                                {row.errorMessages.map((msg, i) => (
                                  <div key={i} className="flex items-start gap-1">
                                    <span className="text-slate-400">·</span>
                                    <span>{msg}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Row Actions */}
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          {isEditingThis ? (
                            <button
                              onClick={() => handleInlineSave(row.id, { name: row.name, apaarId: row.apaarId, department: row.department })}
                              className="px-2 py-1 rounded bg-teal-700 text-white hover:bg-teal-800 flex items-center gap-1 font-semibold text-[11px]"
                            >
                              <Check className="w-3 h-3" />
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => setEditingRowId(row.id)}
                              className="p-1 rounded text-slate-500 hover:text-teal-700 hover:bg-slate-100"
                              title="Edit in place"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
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
        </div>
      )}
    </div>
  );
};
