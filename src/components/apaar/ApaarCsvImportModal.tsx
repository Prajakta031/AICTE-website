import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { SyntheticStudent } from '../../services/apaarApi';

interface ApaarCsvImportModalProps {
  onImport: (records: Array<Omit<SyntheticStudent, 'record_id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  onClose: () => void;
}

export const ApaarCsvImportModal: React.FC<ApaarCsvImportModalProps> = ({ onImport, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent =
      'apaar_id,student_name,institution_name,aicte_institution_code,department,academic_year,admission_status\n' +
      '900000000021,Aniket Roy,Delhi Technological University,1-1049281,Computer Science & Engineering,2025-26,Active\n' +
      '900000000022,Bhavna Seth,RV College of Engineering,1-3948201,Electronics & Communication,2025-26,Active\n' +
      '900000000023,Chirag Shah,College of Engineering Pune,1-2094812,Mechanical Engineering,2025-26,Provisional\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'APAAR_Synthetic_Records_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError(null);

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length < 2) {
          setError('CSV file must have a header row and at least one student data row.');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const idIdx = headers.findIndex(h => h.includes('apaar') || h.includes('id'));
        const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('student'));
        const instIdx = headers.findIndex(h => h.includes('institution') || h.includes('college'));
        const codeIdx = headers.findIndex(h => h.includes('code') || h.includes('aicte'));
        const deptIdx = headers.findIndex(h => h.includes('dept') || h.includes('department') || h.includes('branch'));
        const yearIdx = headers.findIndex(h => h.includes('year'));
        const statusIdx = headers.findIndex(h => h.includes('status'));

        const rows: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length < 2) continue;

          const rawId = (idIdx >= 0 ? cols[idIdx] : cols[0]) || '';
          const cleanId = rawId.replace(/[\s-]/g, '');
          const studentName = (nameIdx >= 0 ? cols[nameIdx] : cols[1]) || '';
          const institutionName = (instIdx >= 0 ? cols[instIdx] : cols[2]) || 'Delhi Technological University';
          const aicteCode = (codeIdx >= 0 ? cols[codeIdx] : cols[3]) || '1-1049281';
          const department = (deptIdx >= 0 ? cols[deptIdx] : cols[4]) || 'Computer Science & Engineering';
          const academicYear = (yearIdx >= 0 ? cols[yearIdx] : cols[5]) || '2025-26';
          const admissionStatus = (statusIdx >= 0 ? cols[statusIdx] : cols[6]) || 'Active';

          rows.push({
            apaar_id: cleanId,
            student_name: studentName,
            institution_name: institutionName,
            aicte_institution_code: aicteCode,
            department,
            academic_year: academicYear,
            admission_status: admissionStatus,
            isValidFormat: /^\d{12}$/.test(cleanId) && studentName.length > 0
          });
        }

        setParsedRows(rows);
      } catch (err) {
        setError('Failed to parse CSV file. Please use the standard template.');
      }
    };
    reader.readAsText(selected);
  };

  const handleImportSubmit = async () => {
    if (parsedRows.length === 0) return;
    setLoading(true);
    try {
      const validRecords = parsedRows
        .filter(r => r.isValidFormat)
        .map(r => ({
          apaar_id: r.apaar_id,
          student_name: r.student_name,
          institution_name: r.institution_name,
          aicte_institution_code: r.aicte_institution_code,
          department: r.department,
          academic_year: r.academic_year,
          admission_status: r.admission_status
        }));

      await onImport(validRecords);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Import failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <span>Import Synthetic Student Records</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload CSV file with 12-digit test APAAR IDs to populate registry
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Download sample template */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs">
            <div className="text-indigo-900">
              <span className="font-bold">Need the correct column format?</span>
              <p className="text-indigo-700 text-[11px] mt-0.5">
                Download the standardized CSV template pre-populated with test rows.
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get CSV Template</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
            <span className="text-xs font-bold text-slate-800 block">
              {file ? file.name : 'Click to select CSV file from computer'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Supports .csv files with UTF-8 encoding
            </span>
          </div>

          {/* Parsed Rows Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  Preview: {parsedRows.length} Records Found
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{parsedRows.filter(r => r.isValidFormat).length} Valid Format</span>
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg text-xs divide-y divide-slate-100 font-mono">
                {parsedRows.slice(0, 10).map((r, i) => (
                  <div key={i} className="p-2 flex items-center justify-between bg-white text-[11px]">
                    <div className="truncate pr-2">
                      <span className="font-bold text-indigo-700">{r.apaar_id}</span>
                      <span className="text-slate-400 mx-1">|</span>
                      <span className="text-slate-800 font-sans">{r.student_name}</span>
                      <span className="text-slate-400 mx-1">|</span>
                      <span className="text-slate-500 font-sans">{r.department}</span>
                    </div>
                    {r.isValidFormat ? (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0 font-sans">
                        Valid
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 shrink-0 font-sans">
                        Invalid (Not 12 Digits)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleImportSubmit}
              disabled={loading || parsedRows.filter(r => r.isValidFormat).length === 0}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>
                {loading
                  ? 'Importing...'
                  : `Import ${parsedRows.filter(r => r.isValidFormat).length} Records`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
