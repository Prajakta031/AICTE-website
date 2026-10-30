import { Student } from '../types';
import { formatApaarId } from './validationEngine';

/**
 * Downloads a sample CSV template with instructions and sample rows for college admins
 */
export function downloadSampleCsvTemplate() {
  const headers = [
    'Student Name',
    'APAAR ID',
    'Department',
    'Academic Year',
    'Admission Category',
    'Admission Status',
    'Date of Admission (YYYY-MM-DD)',
    'Gender',
    'Email'
  ];

  const sampleRows = [
    [
      'Aarav Sharma',
      '984210923841',
      'Computer Science & Engineering',
      '2025-26',
      'General',
      'Active',
      '2025-08-14',
      'Male',
      'aarav.sharma@example.edu.in'
    ],
    [
      'Priya Nair',
      '827103948201',
      'Electronics & Communication',
      '2025-26',
      'OBC',
      'Active',
      '2025-08-12',
      'Female',
      'priya.nair@example.edu.in'
    ],
    [
      'Rohan Gupta',
      '761928401928',
      'Mechanical Engineering',
      '2025-26',
      'SC',
      'Active',
      '2025-08-15',
      'Male',
      'rohan.gupta@example.edu.in'
    ],
    [
      'Meera Joshi',
      '639102948172',
      'AI & Data Science',
      '2025-26',
      'EWS',
      'Active',
      '2025-08-16',
      'Female',
      'meera.joshi@example.edu.in'
    ]
  ];

  const csvContent = [
    headers.join(','),
    ...sampleRows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'AICTE_APAAR_Student_Data_Template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports current student list to CSV
 */
export function exportStudentsToCsv(students: Student[], filename: string = 'AICTE_Student_Enrolment_Report.csv') {
  const headers = [
    'Student Name',
    'APAAR ID',
    'Institution Name',
    'Department',
    'Academic Year',
    'Admission Category',
    'Admission Status',
    'Date of Admission',
    'Gender',
    'Email',
    'Validation Status',
    'Flag Notes'
  ];

  const rows = students.map(s => [
    s.name,
    formatApaarId(s.apaarId),
    s.institutionName,
    s.department,
    s.academicYear,
    s.admissionCategory,
    s.admissionStatus,
    s.dateOfAdmission,
    s.gender,
    s.email || '',
    s.validationStatus.toUpperCase(),
    s.flagNotes || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers browser print dialog for the official compliance report view
 */
export function triggerPrintReport() {
  window.print();
}
