import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Building,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  SyntheticStudent,
  fetchSyntheticRecords,
  createSyntheticRecord,
  updateSyntheticRecord,
  deleteSyntheticRecord,
  formatApaarId
} from '../../services/apaarApi';
import { ApaarStudentModal } from './ApaarStudentModal';
import { ApaarDeleteModal } from './ApaarDeleteModal';
import { ApaarCsvImportModal } from './ApaarCsvImportModal';

export const ApaarStudentDatabase: React.FC = () => {
  const [students, setStudents] = useState<SyntheticStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<SyntheticStudent | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<SyntheticStudent | null>(null);
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await fetchSyntheticRecords({
        search: searchQuery,
        institution: selectedInstitution,
        department: selectedDepartment,
        status: selectedStatus
      });
      setStudents(res.records);
    } catch (err) {
      console.error('Failed to load synthetic records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [searchQuery, selectedInstitution, selectedDepartment, selectedStatus]);

  // Unique institutions & departments for filters
  const institutionsList = Array.from(new Set(students.map(s => s.institution_name))).filter(Boolean);
  const departmentsList = Array.from(new Set(students.map(s => s.department))).filter(Boolean);

  // Pagination calculation
  const totalPages = Math.ceil(students.length / pageSize) || 1;
  const paginatedStudents = students.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Add / Edit handler
  const handleSaveStudent = async (data: Partial<SyntheticStudent>) => {
    if (editingStudent) {
      await updateSyntheticRecord(editingStudent.record_id, data);
    } else {
      await createSyntheticRecord(data as any);
    }
    loadRecords();
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    await deleteSyntheticRecord(studentToDelete.record_id);
    setStudentToDelete(null);
    loadRecords();
  };

  // Bulk CSV Import handler
  const handleBatchImport = async (records: Array<Omit<SyntheticStudent, 'record_id' | 'created_at' | 'updated_at'>>) => {
    for (const r of records) {
      try {
        await createSyntheticRecord(r as any);
      } catch (err) {
        console.error('Error importing row:', err);
      }
    }
    loadRecords();
  };

  // CSV Export handler
  const handleExportCsv = () => {
    if (students.length === 0) return;
    const headers = [
      'Record ID',
      'Synthetic APAAR ID',
      'Student Name',
      'Institution Name',
      'AICTE Institution Code',
      'Department',
      'Academic Year',
      'Admission Status',
      'Gender',
      'DOB'
    ];

    const rows = students.map(s => [
      `"${s.record_id}"`,
      `"${s.apaar_id}"`,
      `"${s.student_name}"`,
      `"${s.institution_name}"`,
      `"${s.aicte_institution_code}"`,
      `"${s.department}"`,
      `"${s.academic_year}"`,
      `"${s.admission_status}"`,
      `"${s.gender || ''}"`,
      `"${s.dob || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `APAAR_Synthetic_Registry_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Synthetic Student Registry Database
            </h2>
            <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {students.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulated central government repository of 12-digit student identity records.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setEditingStudent(null);
              setModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleExportCsv}
            disabled={students.length === 0}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search by APAAR or Name */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search APAAR ID or Name..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Institution Filter */}
          <div>
            <select
              value={selectedInstitution}
              onChange={e => {
                setSelectedInstitution(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Institutions</option>
              {institutionsList.map(inst => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDepartment}
              onChange={e => {
                setSelectedDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Departments</option>
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Admission Statuses</option>
              <option value="Active">Active</option>
              <option value="Provisional">Provisional</option>
              <option value="Graduated">Graduated</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Student Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4">Synthetic APAAR ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">AICTE Code</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Academic Year</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>Loading synthetic records...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    No records found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map(student => (
                  <tr key={student.record_id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Record ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {student.record_id}
                    </td>

                    {/* Synthetic APAAR ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {formatApaarId(student.apaar_id)}
                    </td>

                    {/* Student Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {student.student_name}
                    </td>

                    {/* Institution Name */}
                    <td className="py-3.5 px-4 text-slate-800 max-w-[180px] truncate">
                      {student.institution_name}
                    </td>

                    {/* AICTE Code */}
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {student.aicte_institution_code}
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-slate-700 max-w-[150px] truncate">
                      {student.department}
                    </td>

                    {/* Academic Year */}
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {student.academic_year}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          student.admission_status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : student.admission_status === 'Provisional'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : student.admission_status === 'Graduated'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {student.admission_status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingStudent(student);
                            setModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, students.length)} of {students.length} records
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-mono font-bold text-slate-800">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalOpen && (
        <ApaarStudentModal
          initialStudent={editingStudent}
          onSave={handleSaveStudent}
          onClose={() => setModalOpen(false)}
        />
      )}

      {studentToDelete && (
        <ApaarDeleteModal
          student={studentToDelete}
          onConfirm={handleConfirmDelete}
          onClose={() => setStudentToDelete(null)}
        />
      )}

      {importModalOpen && (
        <ApaarCsvImportModal
          onImport={handleBatchImport}
          onClose={() => setImportModalOpen(false)}
        />
      )}
    </div>
  );
};
