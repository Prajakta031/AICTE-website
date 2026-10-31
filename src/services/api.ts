import { Student, ValidationCheck, ValidationStatus, CrossInstitutionConflict, Institution } from '../types';
import { validateStudentData } from '../utils/validationEngine';

export interface VerifyApiResponse {
  success: boolean;
  api: string;
  version?: string;
  timestamp: string;
  latencyMs?: number;
  recordCount: number;
  isLocalFallback?: boolean;
  summary: {
    valid: number;
    review: number;
    error: number;
    overallStatus: ValidationStatus;
  };
  results: Array<{
    id: string;
    name: string;
    apaarId: string;
    normalizedApaarId: string;
    department: string;
    academicYear: string;
    institutionId: string;
    institutionName: string;
    admissionCategory: string;
    admissionStatus: string;
    validationStatus: ValidationStatus;
    validationChecks: ValidationCheck[];
    flagNotes: string;
    crossInstitutionConflict?: CrossInstitutionConflict | null;
  }>;
  result?: {
    id: string;
    name: string;
    apaarId: string;
    normalizedApaarId: string;
    department: string;
    academicYear: string;
    institutionId: string;
    institutionName: string;
    admissionCategory: string;
    admissionStatus: string;
    validationStatus: ValidationStatus;
    validationChecks: ValidationCheck[];
    flagNotes: string;
    crossInstitutionConflict?: CrossInstitutionConflict | null;
  };
  error?: string;
  details?: string;
}

export interface VerifyStudentApiParams {
  student: Partial<Student>;
  existingStudents?: Student[];
  institutions?: Institution[];
  currentInstitutionId?: string;
}

/**
 * Sends a real HTTP POST request to /api/demo/verify
 */
export async function verifyStudentViaApi(
  params: VerifyStudentApiParams
): Promise<VerifyApiResponse> {
  const startTime = performance.now();

  try {
    const payload = {
      student: params.student,
      institutionId: params.currentInstitutionId || params.student.institutionId,
      existingStudents: params.existingStudents?.map(s => ({
        id: s.id,
        name: s.name,
        apaarId: s.apaarId,
        institutionId: s.institutionId,
        institutionName: s.institutionName,
        department: s.department,
        academicYear: s.academicYear
      })),
      institutions: params.institutions?.map(i => ({
        id: i.id,
        code: i.code,
        name: i.name,
        departments: i.departments
      }))
    };

    const response = await fetch('/api/demo/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      throw new Error(errorJson?.error || `API returned status ${response.status}`);
    }

    const data: VerifyApiResponse = await response.json();
    return {
      ...data,
      latencyMs: elapsed
    };
  } catch (err: any) {
    const elapsed = Math.round(performance.now() - startTime);
    console.warn('POST /api/demo/verify network fallback activated:', err?.message);

    // Fallback using client-side validation engine if API is temporarily unreachable
    const clientValidation = validateStudentData({
      student: params.student,
      existingStudents: params.existingStudents || [],
      institutions: params.institutions || [],
      currentInstitutionId: params.currentInstitutionId || params.student.institutionId || ''
    });

    const singleResult = {
      id: params.student.id || `std-fallback-${Date.now()}`,
      name: params.student.name || 'Unnamed Student',
      apaarId: params.student.apaarId || '',
      normalizedApaarId: (params.student.apaarId || '').replace(/[\s-]/g, ''),
      department: params.student.department || 'Computer Science & Engineering',
      academicYear: params.student.academicYear || '2025-26',
      institutionId: params.currentInstitutionId || '',
      institutionName: params.institutions?.find(i => i.id === params.currentInstitutionId)?.name || 'Local Institution',
      admissionCategory: params.student.admissionCategory || 'General',
      admissionStatus: params.student.admissionStatus || 'Active',
      validationStatus: clientValidation.validationStatus,
      validationChecks: clientValidation.validationChecks,
      flagNotes: clientValidation.flagNotes,
      crossInstitutionConflict: clientValidation.crossInstitutionConflict || null
    };

    return {
      success: true,
      api: 'POST /api/demo/verify',
      version: '1.2.0-fallback',
      timestamp: new Date().toISOString(),
      latencyMs: elapsed,
      isLocalFallback: true,
      recordCount: 1,
      summary: {
        valid: clientValidation.validationStatus === 'valid' ? 1 : 0,
        review: clientValidation.validationStatus === 'review' ? 1 : 0,
        error: clientValidation.validationStatus === 'error' ? 1 : 0,
        overallStatus: clientValidation.validationStatus
      },
      results: [singleResult],
      result: singleResult
    };
  }
}

/**
 * Batch verification via POST /api/demo/verify
 */
export async function verifyBatchStudentsViaApi(
  students: Partial<Student>[],
  currentInstitutionId: string,
  existingStudents?: Student[],
  institutions?: Institution[]
): Promise<VerifyApiResponse> {
  const startTime = performance.now();

  try {
    const payload = {
      students,
      institutionId: currentInstitutionId,
      existingStudents: existingStudents?.map(s => ({
        id: s.id,
        name: s.name,
        apaarId: s.apaarId,
        institutionId: s.institutionId,
        institutionName: s.institutionName,
        department: s.department,
        academicYear: s.academicYear
      })),
      institutions: institutions?.map(i => ({
        id: i.id,
        name: i.name,
        departments: i.departments
      }))
    };

    const response = await fetch('/api/demo/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (!response.ok) {
      throw new Error(`Batch verification API returned status ${response.status}`);
    }

    const data: VerifyApiResponse = await response.json();
    return {
      ...data,
      latencyMs: elapsed
    };
  } catch (err: any) {
    const elapsed = Math.round(performance.now() - startTime);
    console.warn('Batch POST /api/demo/verify fallback:', err?.message);

    // Fallback: evaluate via client engine
    const results = students.map((std, idx) => {
      const v = validateStudentData({
        student: std,
        existingStudents: existingStudents || [],
        institutions: institutions || [],
        currentInstitutionId
      });

      return {
        id: std.id || `batch-${idx}-${Date.now()}`,
        name: std.name || 'Unnamed',
        apaarId: std.apaarId || '',
        normalizedApaarId: (std.apaarId || '').replace(/[\s-]/g, ''),
        department: std.department || 'Engineering',
        academicYear: std.academicYear || '2025-26',
        institutionId: currentInstitutionId,
        institutionName: institutions?.find(i => i.id === currentInstitutionId)?.name || 'Institution',
        admissionCategory: std.admissionCategory || 'General',
        admissionStatus: std.admissionStatus || 'Active',
        validationStatus: v.validationStatus,
        validationChecks: v.validationChecks,
        flagNotes: v.flagNotes,
        crossInstitutionConflict: v.crossInstitutionConflict || null
      };
    });

    const validCount = results.filter(r => r.validationStatus === 'valid').length;
    const reviewCount = results.filter(r => r.validationStatus === 'review').length;
    const errorCount = results.filter(r => r.validationStatus === 'error').length;

    return {
      success: true,
      api: 'POST /api/demo/verify',
      version: '1.2.0-fallback',
      timestamp: new Date().toISOString(),
      latencyMs: elapsed,
      isLocalFallback: true,
      recordCount: results.length,
      summary: {
        valid: validCount,
        review: reviewCount,
        error: errorCount,
        overallStatus: errorCount > 0 ? 'error' : reviewCount > 0 ? 'review' : 'valid'
      },
      results
    };
  }
}

/**
 * Fetch API status and documentation
 */
export async function fetchApiDocs(): Promise<any> {
  try {
    const res = await fetch('/api/demo/verify');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Error fetching API docs:', e);
  }
  return null;
}

/**
 * Pre-configured interactive demo test scenarios
 */
export const DEMO_VERIFY_SCENARIOS = [
  {
    id: 'valid-record',
    name: 'Clean Valid Student',
    description: 'Fully conforming 12-digit APAAR ID with valid checksum, within intake limit and no conflicts.',
    badge: 'Expected: PASS (Valid)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    data: {
      name: 'Aditya Vardhan',
      apaarId: '9182 4819 2018',
      department: 'Computer Science & Engineering',
      academicYear: '2025-26',
      admissionCategory: 'General',
      admissionStatus: 'Active',
      dateOfAdmission: '2025-08-01',
      email: 'aditya.vardhan@dtu.ac.in',
      gender: 'Male'
    }
  },
  {
    id: 'cross-institution',
    name: 'Cross-Institution Dual Enrolment',
    description: 'APAAR ID matches an active student already enrolled at College of Engineering Pune (COEP Tech).',
    badge: 'Expected: REVIEW / FLAG',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    data: {
      name: 'Rohan Deshmukh',
      apaarId: '9842 1092 3841',
      department: 'Computer Science & Engineering',
      academicYear: '2025-26',
      admissionCategory: 'General',
      admissionStatus: 'Active',
      dateOfAdmission: '2025-08-10',
      email: 'rohan.d@student.ac.in',
      gender: 'Male'
    }
  },
  {
    id: 'dummy-sequence',
    name: 'Invalid APAAR Pattern (000000000000)',
    description: 'Repetitive dummy sequence banned under AICTE APAAR validation specifications.',
    badge: 'Expected: ERROR (Reject)',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    data: {
      name: 'Kavita Joshi',
      apaarId: '0000 0000 0000',
      department: 'Electronics & Communication',
      academicYear: '2025-26',
      admissionCategory: 'OBC',
      admissionStatus: 'Provisional',
      dateOfAdmission: '2025-08-15',
      email: 'kavita.joshi@example.com',
      gender: 'Female'
    }
  },
  {
    id: 'short-apaar',
    name: 'Malformed APAAR Length (< 12 digits)',
    description: 'APAAR ID is only 8 digits instead of the mandatory 12 digits.',
    badge: 'Expected: ERROR (Reject)',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    data: {
      name: 'Suresh Menon',
      apaarId: '9842 1092',
      department: 'Mechanical Engineering',
      academicYear: '2025-26',
      admissionCategory: 'General',
      admissionStatus: 'Active',
      dateOfAdmission: '2025-08-20',
      email: 'suresh.menon@dtu.ac.in',
      gender: 'Male'
    }
  },
  {
    id: 'missing-fields',
    name: 'Missing Mandatory Fields',
    description: 'Student record lacks essential required attributes (department & category missing).',
    badge: 'Expected: ERROR (Reject)',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    data: {
      name: 'Ananya Sen',
      apaarId: '8291 0482 1948',
      department: '',
      academicYear: '2025-26',
      admissionCategory: '' as any,
      admissionStatus: 'Active',
      dateOfAdmission: '2025-08-01',
      email: 'ananya@example.com',
      gender: 'Female'
    }
  }
];
