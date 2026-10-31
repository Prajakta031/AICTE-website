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
  RotateCcw,
  UploadCloud,
  Info,
  ChevronDown,
  X,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { Student } from '../../types';
import { formatApaarId, maskApaarId, getApaarStatusMeta } from '../../utils/validationEngine';
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
    setSelectedStudentForDetail,
    setActiveTab,
    theme
  } = useApp();

  const isAicte = currentUser.role === 'aicte_admin';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [maskAllIds, setMaskAllIds] = useState<boolean>(true);

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
    return students.filter(student => {
      // Role scope
      if (!isAicte && student.institutionId !== currentInstitution.id) {
        return false;
      }

      // Search query (Name or APAAR ID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().replace(/[\s-]/g, '');
        const nameMatch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
        const idMatch = student.apaarId.toLowerCase().replace(/[\s-]/g, '').includes(q);
        if (!nameMatch && !idMatch) return false;
      }

      // Department
      if (selectedDept !== 'all' && student.department !== selectedDept) {
        return false;
      }

      // Academic Year
      if (selectedYear !== 'all' && student.academicYear !== selectedYear) {
        return false;
      }

      // Standardized Verification Status Filter
      if (selectedStatus !== 'all') {
        const effectiveStatus = student.apaarStatus || (student.validationStatus === 'valid' ? 'format_valid' : 'invalid_format');
        if (effectiveStatus !== selectedStatus) {
          return false;
        }
      }

      // Institution filter (AICTE only)
      if (isAicte && selectedInstitution !== 'all' && student.institutionId !== selectedInstitution) {
        return false;
      }

      return true;
    });
  }, [students, isAicte, currentInstitution.id, searchQuery, selectedDept, selectedYear, selectedStatus, selectedInstitution]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormModalOpen(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  const getPrimaryBtnColor = () => {
    switch (theme) {
      case 'bharat-royal':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      case 'digital-indigo':
        return 'bg-indigo-600 hover:bg-indigo-700 text-white';
      case 'academic-emerald':
        return 'bg-emerald-700 hover:bg-emerald-800 text-white';
      case 'minimal-slate':
        return 'bg-slate-900 hover:bg-slate-800 text-white';
      case 'executive-dark':
        return 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold';
      default:
        return 'bg-orange-600 hover:bg-orange-700 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {isAicte ? 'National Master Student Registry' : 'Institutional Student Enrolment'}
              </h1>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-mono font-medium text-slate-500">
                {filteredStudents.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isAicte
                ? 'Centralized registry of verified technical student enrolments across all AICTE campuses'
                : `Verified student admissions and APAAR records for ${currentInstitution.name}`}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {!isAicte && (
              <button
                onClick={() => setActiveTab('upload')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload Excel File</span>
              </button>
            )}

            <button
              onClick={() => exportStudentsToCsv(filteredStudents, `${isAicte ? 'AICTE_Master' : currentInstitution.name.replace(/\s+/g, '_')}_Students.csv`)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download CSV</span>
            </button>

            {!isAicte && (
              <button
                onClick={handleOpenAdd}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${getPrimaryBtnColor()}`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Student</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or 12-digit APAAR ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8.5 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-800 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-800"
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
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-800"
            >
              <option value="all">All Academic Years</option>
              <option value="2025-26">2025-26 (Live Academic Year)</option>
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-800"
            >
              <option value="all">All Verification Statuses (8 Tiers)</option>
              <option value="format_valid">Level 1: Format Valid (Not Official)</option>
              <option value="document_matched">Level 2: Document Details Matched</option>
              <option value="document_mismatch">Level 2: Document Mismatch</option>
              <option value="duplicate_detected">Duplicate Detected (Intra/Cross)</option>
              <option value="manual_review">Manual Review Required</option>
              <option value="pending_official">Level 3: Pending Official API</option>
              <option value="demo_simulation">Demo Simulation (Sandbox)</option>
              <option value="invalid_format">Invalid Format (Format Check Failed)</option>
            </select>
          </div>
        </div>

        {/* Results summary & Active Filter reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Showing <span className="font-semibold text-slate-900 tabular-nums">{filteredStudents.length}</span> students
            {filteredStudents.length !== students.length && (
              <span className="text-slate-400"> (filtered from {students.length} total)</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMaskAllIds(!maskAllIds)}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-medium"
            >
              {maskAllIds ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reveal All APAAR IDs</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mask All APAAR IDs</span>
                </>
              )}
            </button>
            {(searchQuery || selectedDept !== 'all' || selectedYear !== 'all' || selectedStatus !== 'all' || selectedInstitution !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDept('all');
                  setSelectedYear('all');
                  setSelectedStatus('all');
                  setSelectedInstitution('all');
                }}
                className="text-xs text-slate-700 hover:text-slate-950 font-semibold cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <span>APAAR ID</span>
                    <span className="text-[9px] font-mono lowercase text-slate-400">
                      ({maskAllIds ? 'masked' : 'full'})
                    </span>
                  </div>
                </th>
                {isAicte && <th className="py-3 px-4">Institution</th>}
                <th className="py-3 px-4">Department & Term</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Verification Source & Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={isAicte ? 8 : 7} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <p className="font-semibold text-slate-800 text-xs">No matching student records</p>
                      <p className="text-[11px] text-slate-400">
                        Try modifying search query or reset filter selections.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const meta = getApaarStatusMeta(student.apaarStatus);
                  const displayId = maskAllIds ? maskApaarId(student.apaarId) : formatApaarId(student.apaarId);

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedStudentForDetail(student)}
                    >
                      {/* Name */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{student.name}</span>
                          {student.crossInstitutionConflict && (
                            <span
                              title="Dual Enrolment Alert"
                              className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">#{student.id}</span>
                      </td>

                      {/* APAAR ID */}
                      <td className="py-3 px-4 font-mono font-medium tracking-wide text-slate-700 whitespace-nowrap">
                        {displayId || (
                          <span className="text-rose-600 font-sans italic text-[11px]">Missing APAAR</span>
                        )}
                      </td>

                      {/* Institution (Only in AICTE mode) */}
                      {isAicte && (
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          <span className="truncate max-w-[170px] block font-medium" title={student.institutionName}>
                            {student.institutionName}
                          </span>
                        </td>
                      )}

                      {/* Department & Academic Year */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{student.department}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{student.academicYear}</div>
                      </td>

                      {/* Verification Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedStudentForDetail(student)}
                          className="text-left cursor-pointer"
                        >
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${meta.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`} />
                            <span>{meta.label}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Tier: {meta.levelBadge}
                          </span>
                        </button>
                      </td>

                      {/* Verification Source & Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        <div className="text-slate-800 text-[11px] font-medium truncate max-w-[200px]" title={student.verificationSource}>
                          {student.verificationSource || 'Level 1 Algorithmic Regex'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {student.verificationDate || 'Recently validated'}
                        </div>
                      </td>

                      {/* Admission Category */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap text-[11px]">
                        <span className="font-medium text-slate-800">{student.admissionCategory}</span>
                        <span className="text-slate-400 block text-[10px]">{student.admissionStatus}</span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedStudentForDetail(student)}
                            title="Inspect 3-Level Verification & Compare Document"
                            className="px-2.5 py-1 rounded border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="w-3 h-3 text-teal-700" />
                            <span>Verify</span>
                          </button>

                          {!isAicte && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(student)}
                                title="Edit Record"
                                className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3 text-slate-400" />
                              </button>
                              <button
                                onClick={() => setStudentToDelete(student)}
                                title="Delete Record"
                                className="px-2 py-1 rounded border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-rose-600 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3 text-rose-500" />
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
                Are you sure you want to permanently delete the admission record for{' '}
                <span className="font-semibold text-slate-800">{studentToDelete.name}</span> (APAAR: {formatApaarId(studentToDelete.apaarId)})?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-xs cursor-pointer"
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
