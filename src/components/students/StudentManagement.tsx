import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Building,
  RotateCcw
} from 'lucide-react';
import { Student } from '../../types';
import { formatApaarId } from '../../utils/validationEngine';
import { exportStudentsToCsv } from '../../utils/exportUtils';
import { useApp } from '../../context/AppContext';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentFormModal } from './StudentFormModal';

export const StudentManagement: React.FC = () => {
  const {
    students,
    currentUser,
    currentInstitution,
    deleteStudent,
    revalidateAll,
    selectedStudentForDetail,
    setSelectedStudentForDetail
  } = useApp();

  const isAicte = currentUser.role === 'aicte_admin';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Available departments based on role
  const availableDepts = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => set.add(s.department));
    return Array.from(set);
  }, [students]);

  // Filtered dataset
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // If college admin, only show this college's students
      if (!isAicte && s.institutionId !== currentUser.institutionId) {
        return false;
      }

      // If AICTE admin and institution filter is set
      if (isAicte && selectedInstitution !== 'all' && s.institutionId !== selectedInstitution) {
        return false;
      }

      // Search query (Name or APAAR ID)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().replace(/[\s-]/g, '');
        const matchName = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchApaar = s.apaarId.includes(query);
        if (!matchName && !matchApaar) return false;
      }

      // Department filter
      if (selectedDept !== 'all' && s.department !== selectedDept) {
        return false;
      }

      // Academic Year filter
      if (selectedYear !== 'all' && s.academicYear !== selectedYear) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && s.validationStatus !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [students, isAicte, currentUser.institutionId, selectedInstitution, searchQuery, selectedDept, selectedYear, selectedStatus]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (stu: Student) => {
    setEditingStudent(stu);
    setFormModalOpen(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {isAicte ? 'Master Student Registry (All India)' : 'Student Enrolment Registry'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAicte
              ? 'Consolidated national APAAR records across registered AICTE institutions'
              : `${currentInstitution.name} · Department-level enrolment records & validation audit`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={revalidateAll}
            title="Re-run automated 6-rule validation across all records"
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden md:inline">Re-run Validation</span>
          </button>

          <button
            onClick={() => exportStudentsToCsv(filteredStudents, `${isAicte ? 'AICTE_Master' : currentInstitution.name.replace(/\s+/g, '_')}_Students.csv`)}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          {!isAicte && (
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or 12-digit APAAR ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Departments</option>
              {availableDepts.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Academic Years</option>
              <option value="2025-26">2025-26 (Current)</option>
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Statuses</option>
              <option value="valid">🟢 Valid Records Only</option>
              <option value="review">🟡 Requires Review Only</option>
              <option value="error">🔴 Error Detected Only</option>
            </select>
          </div>
        </div>

        {/* Results summary & Active Filter clear */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Showing <span className="font-semibold text-slate-900 tabular-nums">{filteredStudents.length}</span> students
            {filteredStudents.length !== students.length && (
              <span className="text-slate-400"> (filtered from {students.length} total records)</span>
            )}
          </div>
          {(searchQuery || selectedDept !== 'all' || selectedYear !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('all');
                setSelectedYear('all');
                setSelectedStatus('all');
                setSelectedInstitution('all');
              }}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Student Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">APAAR ID</th>
                {isAicte && <th className="py-3 px-4">Institution</th>}
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Validation Audit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={isAicte ? 9 : 8} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="font-medium text-slate-700">No student records match criteria</p>
                      <p className="text-[11px] text-slate-400">
                        Try modifying your search query or reset filter settings.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const statusColors = {
                    valid: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    review: 'bg-amber-50 text-amber-800 border-amber-200',
                    error: 'bg-rose-50 text-rose-800 border-rose-200'
                  }[student.validationStatus];

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedStudentForDetail(student)}
                    >
                      {/* Name */}
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{student.name}</span>
                          {student.crossInstitutionConflict && (
                            <span
                              title="Dual Enrolment Detected across institutions"
                              className="w-2 h-2 rounded-full bg-amber-500 shrink-0"
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">ID: {student.id}</span>
                      </td>

                      {/* APAAR ID */}
                      <td className="py-3 px-4 font-mono font-medium tracking-wider text-slate-700 whitespace-nowrap">
                        {formatApaarId(student.apaarId) || (
                          <span className="text-rose-500 font-sans italic">Missing ID</span>
                        )}
                      </td>

                      {/* Institution (Only in AICTE mode) */}
                      {isAicte && (
                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                          <span className="truncate max-w-[180px] block font-medium" title={student.institutionName}>
                            {student.institutionName}
                          </span>
                        </td>
                      )}

                      {/* Department */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap font-medium">
                        {student.department}
                      </td>

                      {/* Academic Year */}
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {student.academicYear}
                      </td>

                      {/* Admission Category */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {student.admissionCategory}
                        </span>
                      </td>

                      {/* Admission Status */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <span className="text-[11px]">{student.admissionStatus}</span>
                      </td>

                      {/* Validation Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedStudentForDetail(student)}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${statusColors} hover:opacity-90 cursor-pointer`}
                        >
                          {student.validationStatus === 'valid' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          {student.validationStatus === 'review' && (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          {student.validationStatus === 'error' && (
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          <span>
                            {student.validationStatus === 'valid'
                              ? 'Valid'
                              : student.validationStatus === 'review'
                              ? 'Review'
                              : 'Error'}
                          </span>
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStudentForDetail(student)}
                            title="View APAAR Credential & Details"
                            className="p-1.5 rounded text-slate-500 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {!isAicte && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(student)}
                                title="Edit Record"
                                className="p-1.5 rounded text-slate-500 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setStudentToDelete(student)}
                                title="Delete Record"
                                className="p-1.5 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">Delete Student Record?</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete record for{' '}
                <span className="font-semibold text-slate-800">{studentToDelete.name}</span> (APAAR: {formatApaarId(studentToDelete.apaarId)})?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedStudentForDetail && (
        <StudentDetailModal
          student={selectedStudentForDetail}
          onClose={() => setSelectedStudentForDetail(null)}
          onEdit={stu => {
            setSelectedStudentForDetail(null);
            handleOpenEdit(stu);
          }}
        />
      )}

      {/* Add / Edit Form Modal */}
      {formModalOpen && (
        <StudentFormModal
          initialStudent={editingStudent}
          onClose={() => {
            setFormModalOpen(false);
            setEditingStudent(null);
          }}
        />
      )}
    </div>
  );
};
