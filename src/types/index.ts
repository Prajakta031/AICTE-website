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

/**
 * Standardized 3-Level APAAR Verification Statuses
 * Strictly delineates format check, document comparison, and government API status
 */
export type ApaarVerificationStatus =
  | 'invalid_format'
  | 'format_valid'
  | 'document_matched'
  | 'document_mismatch'
  | 'duplicate_detected'
  | 'manual_review'
  | 'pending_official'
  | 'officially_verified'
  | 'demo_simulation';

export interface DocumentComparisonRecord {
  fileName: string;
  fileSize?: number;
  uploadedAt: string;
  documentType: 'DigiLocker APAAR Card' | 'ABC Issued Certificate' | 'Scanned Copy';
  extractedName?: string;
  extractedApaarId?: string;
  nameMatch: boolean;
  apaarMatch: boolean;
  ocrConfidence: number;
  status: 'matched' | 'mismatch' | 'unreadable';
  remarks?: string;
}

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

  // Level 1-3 Verification Fields
  apaarStatus?: ApaarVerificationStatus;
  verificationLevel?: 1 | 2 | 3;
  verificationSource?: string;
  verificationDate?: string;
  documentRecord?: DocumentComparisonRecord;
  officialApiStatus?: 'not_configured' | 'pending_access' | 'demo_simulation' | 'officially_verified';
}

export interface VerificationBreakdown {
  total: number;
  formatValid: number;
  documentMatched: number;
  documentMismatch: number;
  duplicateDetected: number;
  manualReview: number;
  pendingOfficial: number;
  officiallyVerified: number;
  demoSimulated: number;
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

export type AppTheme =
  | 'bharat-royal'
  | 'digital-indigo'
  | 'academic-emerald'
  | 'minimal-slate'
  | 'executive-dark';

export interface ThemeDefinition {
  id: AppTheme;
  name: string;
  tagline: string;
  flagEmoji: string;
  previewColors: {
    primary: string;
    accent: string;
    bg: string;
  };
}

export const AVAILABLE_THEMES: ThemeDefinition[] = [
  {
    id: 'bharat-royal',
    name: 'Bharat Royal',
    tagline: 'National AICTE Royal Navy with Saffron & Emerald',
    flagEmoji: '🇮🇳',
    previewColors: {
      primary: '#0B192C',
      accent: '#EA580C',
      bg: '#F8FAFC'
    }
  },
  {
    id: 'digital-indigo',
    name: 'Digital India',
    tagline: 'Modern Tech Indigo with Vibrant Sky Blue',
    flagEmoji: '🔷',
    previewColors: {
      primary: '#1E1B4B',
      accent: '#0284C7',
      bg: '#F8FAFC'
    }
  },
  {
    id: 'academic-emerald',
    name: 'Academic Emerald',
    tagline: 'Prestigious Campus Deep Green & Warm Gold',
    flagEmoji: '🌲',
    previewColors: {
      primary: '#064E3B',
      accent: '#D97706',
      bg: '#F6FAF7'
    }
  },
  {
    id: 'minimal-slate',
    name: 'Minimalist Slate',
    tagline: 'Clean Corporate Steel & Blue with High Clarity',
    flagEmoji: '⚙️',
    previewColors: {
      primary: '#1E293B',
      accent: '#2563EB',
      bg: '#F8FAFC'
    }
  },
  {
    id: 'executive-dark',
    name: 'Executive Midnight',
    tagline: 'High-Contrast Dark Command Center with Gold Accents',
    flagEmoji: '🌙',
    previewColors: {
      primary: '#0F172A',
      accent: '#F59E0B',
      bg: '#090D16'
    }
  }
];


