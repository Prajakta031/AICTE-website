export type UserRole = 'college_admin' | 'aicte_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institutionId?: string;
  institutionName?: string;
  designation: string;
}

export interface DepartmentIntake {
  department: string;
  approvedIntake: number;
}

export interface Institution {
  id: string;
  code: string; // e.g. 1-3829104
  name: string;
  state: string;
  city: string;
  type: 'Autonomous Institute' | 'State University' | 'Deemed University' | 'Affiliated College';
  approvedTotalIntake: number;
  departments: DepartmentIntake[];
  contactPerson: string;
  contactEmail: string;
  establishedYear: number;
  status: 'Active' | 'Under Audit';
}

export type ValidationStatus = 'valid' | 'review' | 'error';

export type ValidationRuleId =
  | 'RULE_MANDATORY_FIELDS'
  | 'RULE_APAAR_FORMAT'
  | 'RULE_LOCAL_DUPLICATE'
  | 'RULE_CROSS_INSTITUTION_DUPLICATE'
  | 'RULE_INTAKE_LIMIT'
  | 'RULE_INCONSISTENT_DATA';

export interface ValidationCheck {
  ruleId: ValidationRuleId;
  name: string;
  passed: boolean;
  severity: 'success' | 'warning' | 'error';
  message: string;
}

export interface CrossInstitutionConflict {
  otherInstitutionId: string;
  otherInstitutionName: string;
  otherStudentName: string;
  otherDepartment: string;
  otherYear: string;
}

export interface Student {
  id: string;
  name: string;
  apaarId: string; // 12-digit number (e.g., "9182 4819 2018")
  institutionId: string;
  institutionName: string;
  department: string;
  academicYear: string; // e.g., "2025-26"
  admissionCategory: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'Management Quota';
  admissionStatus: 'Active' | 'Provisional' | 'Suspended' | 'Completed';
  dateOfAdmission: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  email?: string;
  validationStatus: ValidationStatus;
  validationChecks: ValidationCheck[];
  flagNotes?: string;
  crossInstitutionConflict?: CrossInstitutionConflict;
}

export interface NotificationAlert {
  id: string;
  institutionId: string;
  institutionName: string;
  title: string;
  type: 'duplicate_apaar' | 'intake_exceeded' | 'invalid_format' | 'missing_fields' | 'correction_request';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  recommendedAction: string;
  timestamp: string;
  isResolved: boolean;
  studentId?: string;
  apaarId?: string;
}

export interface CorrectionRequest {
  id: string;
  institutionId: string;
  institutionName: string;
  studentId: string;
  studentName: string;
  apaarId: string;
  issueType: string;
  justification: string;
  proposedCorrection: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewerNote?: string;
}

export interface BatchUploadRow {
  rowNumber: number;
  name: string;
  apaarId: string;
  department: string;
  academicYear: string;
  admissionCategory: string;
  admissionStatus: string;
  dateOfAdmission: string;
  gender: string;
  email: string;
  validationStatus: ValidationStatus;
  validationChecks: ValidationCheck[];
  hasError: boolean;
  hasReview: boolean;
  errorMessages: string[];
}
