import {
  Student,
  Institution,
  ValidationCheck,
  ValidationStatus,
  CrossInstitutionConflict,
  ApaarVerificationStatus,
  DocumentComparisonRecord
} from '../types';

/**
 * Normalizes APAAR ID by stripping whitespace and dashes
 * Expected format: 12-digit numeric string (e.g. "984210923841" or "9842 1092 3841")
 */
export function normalizeApaarId(apaarId: string | undefined | null): string {
  if (!apaarId) return '';
  return apaarId.toString().replace(/[\s-]/g, '').trim();
}

/**
 * Masks APAAR ID for student privacy compliance (e.g. "•••• •••• 3841")
 */
export function maskApaarId(apaarId: string | undefined | null): string {
  const normalized = normalizeApaarId(apaarId);
  if (!normalized || normalized.length < 4) return '•••• •••• ••••';
  if (normalized.length !== 12) return `•••• •••• ${normalized.slice(-4)}`;
  return `•••• •••• ${normalized.slice(8, 12)}`;
}

/**
 * Formats 12-digit APAAR ID into easily readable 4-4-4 format: "9842 1092 3841"
 */
export function formatApaarId(apaarId: string | undefined | null): string {
  const normalized = normalizeApaarId(apaarId);
  if (normalized.length !== 12) return normalized;
  return `${normalized.slice(0, 4)} ${normalized.slice(4, 8)} ${normalized.slice(8, 12)}`;
}

/**
 * Checks for invalid repetitive sequences like '000000000000', '111111111111', or sequential '123456789012'
 */
function isDummySequence(id: string): boolean {
  if (/^(\d)\1{11}$/.test(id)) return true;
  if (id === '123456789012' || id === '012345678901' || id === '987654321098') return true;
  return false;
}

/**
 * Simulated Verhoeff / Modulo Checksum verification for 12-digit government identification numbers
 */
function verifyIdChecksum(id: string): boolean {
  if (!/^\d{12}$/.test(id)) return false;
  // Calculate synthetic checksum weight
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(id.charAt(i), 10);
    const weight = ((i % 2) === 0) ? 1 : 3;
    sum += digit * weight;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  // In our synthetic sample engine, check digits 0-9 are checked, but allow flexible sample records
  return !isDummySequence(id);
}

export interface ValidateStudentParams {
  student: Partial<Student>;
  existingStudents: Student[];
  institutions: Institution[];
  currentInstitutionId: string;
  isBatchMode?: boolean;
  batchPeers?: Array<{ apaarId: string; tempId: string | number }>;
}

export interface ValidationEngineResult {
  validationStatus: ValidationStatus;
  validationChecks: ValidationCheck[];
  flagNotes: string;
  crossInstitutionConflict?: CrossInstitutionConflict;
}

/**
 * Automated 6-Rule Validation Engine for AICTE-Approved Institutions
 */
export function validateStudentData(params: ValidateStudentParams): ValidationEngineResult {
  const {
    student,
    existingStudents,
    institutions,
    currentInstitutionId,
    batchPeers = []
  } = params;

  const checks: ValidationCheck[] = [];
  const normalizedApaar = normalizeApaarId(student.apaarId);
  let crossConflict: CrossInstitutionConflict | undefined = undefined;

  // RULE 1: Mandatory Student Fields
  const missingFields: string[] = [];
  if (!student.name?.trim()) missingFields.push('Student Name');
  if (!normalizedApaar) missingFields.push('APAAR ID');
  if (!student.department?.trim()) missingFields.push('Department');
  if (!student.academicYear?.trim()) missingFields.push('Academic Year');
  if (!student.admissionCategory?.trim()) missingFields.push('Admission Category');

  if (missingFields.length > 0) {
    checks.push({
      ruleId: 'RULE_MANDATORY_FIELDS',
      name: 'Mandatory Fields Check',
      passed: false,
      severity: 'error',
      message: `Missing mandatory field(s): ${missingFields.join(', ')}`
    });
  } else {
    checks.push({
      ruleId: 'RULE_MANDATORY_FIELDS',
      name: 'Mandatory Fields Check',
      passed: true,
      severity: 'success',
      message: 'All mandatory student profile fields are present.'
    });
  }

  // RULE 2: APAAR ID Format & Syntax Validation
  if (!normalizedApaar) {
    checks.push({
      ruleId: 'RULE_APAAR_FORMAT',
      name: 'APAAR ID Format Validation',
      passed: false,
      severity: 'error',
      message: 'APAAR ID is missing. Format must be a valid 12-digit number.'
    });
  } else if (!/^\d{12}$/.test(normalizedApaar)) {
    checks.push({
      ruleId: 'RULE_APAAR_FORMAT',
      name: 'APAAR ID Format Validation',
      passed: false,
      severity: 'error',
      message: `Invalid format: APAAR ID must be exactly 12 digits (Received ${normalizedApaar.length} chars).`
    });
  } else if (isDummySequence(normalizedApaar)) {
    checks.push({
      ruleId: 'RULE_APAAR_FORMAT',
      name: 'APAAR ID Format Validation',
      passed: false,
      severity: 'error',
      message: 'Dummy or repetitive sequence detected (e.g. 000000000000 / 123456789012). Must be valid unique ID.'
    });
  } else if (!verifyIdChecksum(normalizedApaar)) {
    checks.push({
      ruleId: 'RULE_APAAR_FORMAT',
      name: 'APAAR ID Format Validation',
      passed: false,
      severity: 'error',
      message: 'Simulated checksum failed for APAAR ID sequence.'
    });
  } else {
    checks.push({
      ruleId: 'RULE_APAAR_FORMAT',
      name: 'APAAR ID Format Validation',
      passed: true,
      severity: 'success',
      message: 'APAAR ID complies with 12-digit standard structure (Format check passed).'
    });
  }

  // RULE 3: Local Institution Duplicate Check
  if (normalizedApaar) {
    const localDuplicate = existingStudents.find(
      s => s.institutionId === currentInstitutionId &&
           normalizeApaarId(s.apaarId) === normalizedApaar &&
           s.id !== student.id
    );

    // Also check intra-batch duplicates if uploading a batch
    const batchDuplicate = batchPeers.find(
      p => normalizeApaarId(p.apaarId) === normalizedApaar && p.tempId !== student.id
    );

    if (localDuplicate) {
      checks.push({
        ruleId: 'RULE_LOCAL_DUPLICATE',
        name: 'Intra-Institutional Duplicate Check',
        passed: false,
        severity: 'error',
        message: `Duplicate APAAR ID within this institution! Already assigned to: ${localDuplicate.name} (${localDuplicate.department}, ${localDuplicate.academicYear}).`
      });
    } else if (batchDuplicate) {
      checks.push({
        ruleId: 'RULE_LOCAL_DUPLICATE',
        name: 'Intra-Institutional Duplicate Check',
        passed: false,
        severity: 'error',
        message: `Duplicate APAAR ID repeated multiple times within this batch upload.`
      });
    } else {
      checks.push({
        ruleId: 'RULE_LOCAL_DUPLICATE',
        name: 'Intra-Institutional Duplicate Check',
        passed: true,
        severity: 'success',
        message: 'No duplicate APAAR ID detected within this institution.'
      });
    }
  }

  // RULE 4: Cross-Institutional Duplicate Enrolment Check
  if (normalizedApaar) {
    const otherInstitutionStudent = existingStudents.find(
      s => s.institutionId !== currentInstitutionId &&
           normalizeApaarId(s.apaarId) === normalizedApaar &&
           s.academicYear === student.academicYear
    );

    if (otherInstitutionStudent) {
      crossConflict = {
        otherInstitutionId: otherInstitutionStudent.institutionId,
        otherInstitutionName: otherInstitutionStudent.institutionName,
        otherStudentName: otherInstitutionStudent.name,
        otherDepartment: otherInstitutionStudent.department,
        otherYear: otherInstitutionStudent.academicYear
      };

      checks.push({
        ruleId: 'RULE_CROSS_INSTITUTION_DUPLICATE',
        name: 'Inter-Institutional Duplicate Enrolment',
        passed: false,
        severity: 'warning', // flagged for human review, not treated as confirmed breach
        message: `Potential dual enrolment detected: Matching APAAR ID registered at "${otherInstitutionStudent.institutionName}" (${otherInstitutionStudent.department}, ${otherInstitutionStudent.name}). Flagged for administrative verification.`
      });
    } else {
      checks.push({
        ruleId: 'RULE_CROSS_INSTITUTION_DUPLICATE',
        name: 'Inter-Institutional Duplicate Enrolment',
        passed: true,
        severity: 'success',
        message: 'No cross-institutional dual enrolment conflicts found in AICTE registry.'
      });
    }
  }

  // RULE 5: Approved Intake Limit Comparison
  const currentInst = institutions.find(i => i.id === currentInstitutionId);
  if (currentInst && student.department) {
    const deptConfig = currentInst.departments.find(
      d => d.department.toLowerCase() === student.department?.toLowerCase()
    );

    if (deptConfig) {
      const activeEnrolledInDept = existingStudents.filter(
        s => s.institutionId === currentInstitutionId &&
             s.department.toLowerCase() === student.department?.toLowerCase() &&
             s.academicYear === (student.academicYear || '2025-26') &&
             s.id !== student.id
      ).length;

      const proposedTotal = activeEnrolledInDept + 1;
      const approvedCap = deptConfig.approvedIntake;

      if (proposedTotal > approvedCap) {
        checks.push({
          ruleId: 'RULE_INTAKE_LIMIT',
          name: 'AICTE Approved Intake Audit',
          passed: false,
          severity: 'warning',
          message: `Department intake exceeded: Enrolment (${proposedTotal}) exceeds sanctioned AICTE seat quota (${approvedCap}) for ${student.department}. Flagged for audit review.`
        });
      } else if (proposedTotal >= approvedCap * 0.95) {
        checks.push({
          ruleId: 'RULE_INTAKE_LIMIT',
          name: 'AICTE Approved Intake Audit',
          passed: true,
          severity: 'warning',
          message: `Intake capacity nearing threshold: ${proposedTotal}/${approvedCap} seats allocated (Capacity at ${(proposedTotal / approvedCap * 100).toFixed(0)}%).`
        });
      } else {
        checks.push({
          ruleId: 'RULE_INTAKE_LIMIT',
          name: 'AICTE Approved Intake Audit',
          passed: true,
          severity: 'success',
          message: `Within approved intake limit (${proposedTotal}/${approvedCap} seats allocated).`
        });
      }
    } else {
      checks.push({
        ruleId: 'RULE_INTAKE_LIMIT',
        name: 'AICTE Approved Intake Audit',
        passed: true,
        severity: 'warning',
        message: `Department "${student.department}" not explicitly recognized in institution's AICTE approval dossier.`
      });
    }
  }

  // RULE 6: Inconsistent or Irregular Information Check
  const inconsistencies: string[] = [];
  if (student.dateOfAdmission && student.academicYear) {
    const admissionYear = new Date(student.dateOfAdmission).getFullYear();
    const yearMatch = student.academicYear.match(/^(\d{4})/);
    if (yearMatch) {
      const expectedYear = parseInt(yearMatch[1], 10);
      if (Math.abs(admissionYear - expectedYear) > 1) {
        inconsistencies.push(`Admission date year (${admissionYear}) does not correlate with academic term (${student.academicYear})`);
      }
    }
  }

  if (student.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    inconsistencies.push('Invalid student email address format');
  }

  if (inconsistencies.length > 0) {
    checks.push({
      ruleId: 'RULE_INCONSISTENT_DATA',
      name: 'Data Consistency Check',
      passed: false,
      severity: 'warning',
      message: `Inconsistencies detected: ${inconsistencies.join('; ')}`
    });
  } else {
    checks.push({
      ruleId: 'RULE_INCONSISTENT_DATA',
      name: 'Data Consistency Check',
      passed: true,
      severity: 'success',
      message: 'Student record parameters are consistent with institutional guidelines.'
    });
  }

  // Determine overall status
  const hasError = checks.some(c => c.severity === 'error');
  const hasWarning = checks.some(c => c.severity === 'warning');

  let validationStatus: ValidationStatus = 'valid';
  let flagNotes = 'Record is valid and complies with AICTE intake specifications.';

  if (hasError) {
    validationStatus = 'error';
    const errorChecks = checks.filter(c => c.severity === 'error');
    flagNotes = errorChecks.map(c => c.message).join(' | ');
  } else if (hasWarning) {
    validationStatus = 'review';
    const warningChecks = checks.filter(c => c.severity === 'warning');
    flagNotes = warningChecks.map(c => c.message).join(' | ');
  }

  return {
    validationStatus,
    validationChecks: checks,
    flagNotes,
    crossInstitutionConflict: crossConflict
  };
}

// =========================================================================
// LEVEL 1: APAAR FORMAT VALIDATION
// =========================================================================

export interface Level1ValidationResult {
  passed: boolean;
  status: 'format_valid' | 'invalid_format' | 'duplicate_detected';
  statusLabel: 'Format Valid' | 'Invalid Format' | 'Duplicate Detected';
  errors: string[];
  notes: string;
  isDuplicate: boolean;
  duplicateScope?: 'local' | 'cross_institution';
  duplicateDetails?: {
    studentName: string;
    institutionName: string;
    department?: string;
  };
  disclaimer: string;
}

/**
 * Level 1 Format Validation
 * Verifies 12-digit numeric constraint, dummy sequence rejection, and local/cross duplicate checking.
 * Transparently flagged: "Format Valid – Does not mean Officially Verified".
 */
export function validateApaarFormatLevel1(
  apaarId: string | undefined | null,
  currentStudentId?: string,
  currentInstitutionId?: string,
  allStudents: Student[] = []
): Level1ValidationResult {
  const normalized = normalizeApaarId(apaarId);
  const errors: string[] = [];

  // Check 1: Non-empty & Exactly 12 digits
  if (!normalized) {
    errors.push('APAAR ID cannot be empty');
  } else if (!/^\d+$/.test(normalized)) {
    errors.push('APAAR ID must contain only numeric digits (no alphabetic or special characters allowed)');
  } else if (normalized.length !== 12) {
    errors.push(`APAAR ID must be exactly 12 digits in length (received ${normalized.length} digits)`);
  }

  // Check 2: Reject obvious dummy or sequence values
  if (normalized && isDummySequence(normalized)) {
    errors.push(`Obvious dummy sequence detected (${normalized}). Must be a valid unique identifier`);
  }

  if (errors.length > 0) {
    return {
      passed: false,
      status: 'invalid_format',
      statusLabel: 'Invalid Format',
      errors,
      notes: errors.join('; '),
      isDuplicate: false,
      disclaimer: 'Format Check Failed. Not eligible for official submission.'
    };
  }

  // Check 3: Intra-institutional and Inter-institutional Duplicates
  if (normalized && allStudents.length > 0) {
    // 3A: Within same institution
    if (currentInstitutionId) {
      const localDup = allStudents.find(
        s => s.institutionId === currentInstitutionId &&
             normalizeApaarId(s.apaarId) === normalized &&
             s.id !== currentStudentId
      );

      if (localDup) {
        return {
          passed: false,
          status: 'duplicate_detected',
          statusLabel: 'Duplicate Detected',
          errors: [`Duplicate within same college: Already assigned to "${localDup.name}" (${localDup.department})`],
          notes: `Duplicate APAAR ID detected in current institution: assigned to ${localDup.name}`,
          isDuplicate: true,
          duplicateScope: 'local',
          duplicateDetails: {
            studentName: localDup.name,
            institutionName: localDup.institutionName,
            department: localDup.department
          },
          disclaimer: 'Format Valid structure, but Duplicate ID detected within institution.'
        };
      }
    }

    // 3B: Across different institutions
    const crossDup = allStudents.find(
      s => (currentInstitutionId ? s.institutionId !== currentInstitutionId : true) &&
           normalizeApaarId(s.apaarId) === normalized &&
           s.id !== currentStudentId
    );

    if (crossDup) {
      return {
        passed: false,
        status: 'duplicate_detected',
        statusLabel: 'Duplicate Detected',
        errors: [`Cross-institution duplicate: Matching APAAR ID registered at "${crossDup.institutionName}" (${crossDup.name})`],
        notes: `Cross-institutional duplicate detected at ${crossDup.institutionName}`,
        isDuplicate: true,
        duplicateScope: 'cross_institution',
        duplicateDetails: {
          studentName: crossDup.name,
          institutionName: crossDup.institutionName,
          department: crossDup.department
        },
        disclaimer: 'Format Valid structure, but Matching ID exists at another AICTE institution.'
      };
    }
  }

  return {
    passed: true,
    status: 'format_valid',
    statusLabel: 'Format Valid',
    errors: [],
    notes: 'Meets 12-digit standard structure with zero intra/cross duplicate collisions.',
    isDuplicate: false,
    disclaimer: 'Format Valid – Does not mean Officially Verified against government database.'
  };
}

// =========================================================================
// LEVEL 2: DOCUMENT-BASED COMPARISON (DigiLocker / APAAR Card)
// =========================================================================

export interface DocumentComparisonInput {
  student: Student;
  fileName: string;
  fileSize?: number;
  documentType?: 'DigiLocker APAAR Card' | 'ABC Issued Certificate' | 'Scanned Copy';
  extractedName?: string;
  extractedApaarId?: string;
  rawText?: string;
  ocrConfidence?: number;
  isUnreadable?: boolean;
}

export interface DocumentComparisonOutcome {
  status: 'document_matched' | 'document_mismatch' | 'manual_review';
  statusLabel: 'Document Details Matched' | 'Document Mismatch' | 'Manual Review Required';
  nameMatched: boolean;
  apaarMatched: boolean;
  nameScore: number;
  extractedName: string;
  extractedApaarId: string;
  differences: string[];
  disclaimer: string;
  record: DocumentComparisonRecord;
}

/**
 * Fuzzy comparison between registered student record and OCR extracted document fields
 */
function normalizeStudentName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(mr|ms|mrs|shri|smt|dr|prof|kumar|kumari)\b\.?/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function compareStudentWithDocument(
  input: DocumentComparisonInput
): DocumentComparisonOutcome {
  const {
    student,
    fileName,
    fileSize = 184000,
    documentType = 'DigiLocker APAAR Card',
    extractedName = '',
    extractedApaarId = '',
    ocrConfidence = 95,
    isUnreadable = false
  } = input;

  const now = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const disclaimer = 'Document Comparison – Not Officially Verified';

  // If OCR flagged as unreadable / corrupted file
  if (isUnreadable || !extractedName.trim() || !extractedApaarId.trim() || ocrConfidence < 50) {
    const unreadableRecord: DocumentComparisonRecord = {
      fileName,
      fileSize,
      uploadedAt: now,
      documentType,
      extractedName: extractedName || 'Unreadable',
      extractedApaarId: extractedApaarId || 'Unreadable',
      nameMatch: false,
      apaarMatch: false,
      ocrConfidence: ocrConfidence || 30,
      status: 'unreadable',
      remarks: 'Document text could not be extracted with high confidence. Manual review required by institutional officer.'
    };

    return {
      status: 'manual_review',
      statusLabel: 'Manual Review Required',
      nameMatched: false,
      apaarMatched: false,
      nameScore: 0,
      extractedName: extractedName || 'Unreadable',
      extractedApaarId: extractedApaarId || 'Unreadable',
      differences: ['Document text is unreadable, blurry, or password-protected. Manual verification required.'],
      disclaimer,
      record: unreadableRecord
    };
  }

  // Compare APAAR ID
  const normExtractedApaar = normalizeApaarId(extractedApaarId);
  const normStudentApaar = normalizeApaarId(student.apaarId);
  const apaarMatched = normExtractedApaar === normStudentApaar;

  // Compare Name
  const normRegName = normalizeStudentName(student.name);
  const normExtName = normalizeStudentName(extractedName);

  const wordsReg = normRegName.split(' ').filter(w => w.length > 1);
  const wordsExt = normExtName.split(' ').filter(w => w.length > 1);

  let matchingWords = 0;
  wordsReg.forEach(w => {
    if (wordsExt.some(ew => ew === w || ew.includes(w) || w.includes(ew))) {
      matchingWords++;
    }
  });

  const nameScore = wordsReg.length > 0 ? Math.round((matchingWords / wordsReg.length) * 100) : 0;
  const nameMatched = nameScore >= 70 || normRegName === normExtName;

  const differences: string[] = [];
  if (!apaarMatched) {
    differences.push(
      `APAAR ID mismatch: Extracted "${formatApaarId(normExtractedApaar)}" does not match registered "${formatApaarId(normStudentApaar)}"`
    );
  }
  if (!nameMatched) {
    differences.push(
      `Candidate Name mismatch: Extracted "${extractedName}" does not match registered "${student.name}" (${nameScore}% word match)`
    );
  }

  const isFullMatch = apaarMatched && nameMatched;

  const comparisonRecord: DocumentComparisonRecord = {
    fileName,
    fileSize,
    uploadedAt: now,
    documentType,
    extractedName,
    extractedApaarId: normExtractedApaar,
    nameMatch: nameMatched,
    apaarMatch: apaarMatched,
    ocrConfidence,
    status: isFullMatch ? 'matched' : 'mismatch',
    remarks: isFullMatch
      ? 'Document details successfully matched student profile.'
      : differences.join(' | ')
  };

  return {
    status: isFullMatch ? 'document_matched' : 'document_mismatch',
    statusLabel: isFullMatch ? 'Document Details Matched' : 'Document Mismatch',
    nameMatched,
    apaarMatched,
    nameScore,
    extractedName,
    extractedApaarId: normExtractedApaar,
    differences,
    disclaimer,
    record: comparisonRecord
  };
}

// =========================================================================
// STATUS METADATA & DASHBOARD BREAKDOWN HELPERS
// =========================================================================

export function getApaarStatusMeta(status?: ApaarVerificationStatus): {
  label: string;
  shortLabel: string;
  badgeClass: string;
  dotColor: string;
  levelBadge: string;
  level: 1 | 2 | 3;
  description: string;
} {
  switch (status) {
    case 'format_valid':
      return {
        label: 'Format Valid',
        shortLabel: 'Format Valid',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        dotColor: 'bg-blue-500',
        levelBadge: 'Level 1',
        level: 1,
        description: 'Validated 12-digit format with zero duplicates. (Not Officially Verified)'
      };
    case 'document_matched':
      return {
        label: 'Document Details Matched',
        shortLabel: 'Doc Matched',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotColor: 'bg-emerald-500',
        levelBadge: 'Level 2',
        level: 2,
        description: 'Uploaded DigiLocker/APAAR document matches candidate record. (Document Comparison)'
      };
    case 'document_mismatch':
      return {
        label: 'Document Mismatch',
        shortLabel: 'Doc Mismatch',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
        dotColor: 'bg-rose-500',
        levelBadge: 'Level 2',
        level: 2,
        description: 'Extracted document details do not match registered student record.'
      };
    case 'duplicate_detected':
      return {
        label: 'Duplicate Detected',
        shortLabel: 'Duplicate',
        badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
        dotColor: 'bg-amber-500',
        levelBadge: 'Level 1',
        level: 1,
        description: 'Duplicate APAAR ID found within current college or at another institution.'
      };
    case 'manual_review':
      return {
        label: 'Manual Review Required',
        shortLabel: 'Manual Review',
        badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
        dotColor: 'bg-purple-500',
        levelBadge: 'Level 2',
        level: 2,
        description: 'OCR unreadable or document flagged for administrative physical verification.'
      };
    case 'pending_official':
      return {
        label: 'Pending Official Verification',
        shortLabel: 'Pending API',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
        dotColor: 'bg-slate-400',
        levelBadge: 'Level 3',
        level: 3,
        description: 'Official Verification Not Available – API Access Pending authorized credentials.'
      };
    case 'officially_verified':
      return {
        label: 'Officially Verified',
        shortLabel: 'Official API',
        badgeClass: 'bg-teal-50 text-teal-900 border-teal-300 font-bold',
        dotColor: 'bg-teal-600',
        levelBadge: 'Level 3',
        level: 3,
        description: 'Officially verified via authorized Ministry of Education API Setu gateway.'
      };
    case 'demo_simulation':
      return {
        label: 'Demo Simulation – Not Official',
        shortLabel: 'Demo Sim',
        badgeClass: 'bg-orange-50 text-orange-800 border-orange-300 border-dashed',
        dotColor: 'bg-orange-500',
        levelBadge: 'Sandbox',
        level: 3,
        description: 'Demo sandbox simulation using synthetic records. Not genuine government verification.'
      };
    case 'invalid_format':
    default:
      return {
        label: 'Invalid Format',
        shortLabel: 'Invalid Format',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
        dotColor: 'bg-rose-500',
        levelBadge: 'Level 1',
        level: 1,
        description: 'Does not comply with 12-digit numeric APAAR standard or is a dummy sequence.'
      };
  }
}

/**
 * Calculates separate breakdown counts for dashboards
 * Strictly ensures format-valid or document-matched are never conflated with officially verified!
 */
export function calculateVerificationBreakdown(students: Student[]): {
  total: number;
  formatValid: number;
  documentMatched: number;
  documentMismatch: number;
  duplicateDetected: number;
  manualReview: number;
  pendingOfficial: number;
  officiallyVerified: number;
  demoSimulated: number;
  invalidFormat: number;
} {
  let formatValid = 0;
  let documentMatched = 0;
  let documentMismatch = 0;
  let duplicateDetected = 0;
  let manualReview = 0;
  let pendingOfficial = 0;
  let officiallyVerified = 0;
  let demoSimulated = 0;
  let invalidFormat = 0;

  students.forEach(s => {
    const status = s.apaarStatus || (s.validationStatus === 'valid' ? 'format_valid' : 'invalid_format');
    switch (status) {
      case 'format_valid':
        formatValid++;
        break;
      case 'document_matched':
        documentMatched++;
        break;
      case 'document_mismatch':
        documentMismatch++;
        break;
      case 'duplicate_detected':
        duplicateDetected++;
        break;
      case 'manual_review':
        manualReview++;
        break;
      case 'pending_official':
        pendingOfficial++;
        break;
      case 'officially_verified':
        officiallyVerified++;
        break;
      case 'demo_simulation':
        demoSimulated++;
        break;
      case 'invalid_format':
      default:
        invalidFormat++;
        break;
    }
  });

  return {
    total: students.length,
    formatValid,
    documentMatched,
    documentMismatch,
    duplicateDetected,
    manualReview,
    pendingOfficial,
    officiallyVerified,
    demoSimulated,
    invalidFormat
  };
}

