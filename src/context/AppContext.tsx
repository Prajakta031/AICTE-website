import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Institution,
  Student,
  NotificationAlert,
  CorrectionRequest,
  UserRole,
  AppTheme,
  ThemeDefinition,
  AVAILABLE_THEMES
} from '../types';
import {
  INITIAL_INSTITUTIONS,
  INITIAL_STUDENTS,
  INITIAL_ALERTS,
  INITIAL_CORRECTIONS,
  DEMO_USERS
} from '../data/mockData';
import {
  validateStudentData,
  normalizeApaarId,
  validateApaarFormatLevel1,
  compareStudentWithDocument,
  Level1ValidationResult,
  DocumentComparisonOutcome,
  DocumentComparisonInput
} from '../utils/validationEngine';
import {
  verifyViaOfficialGateway,
  runDemoSimulation,
  OfficialVerificationResult,
  OFFICIAL_API_CONFIG
} from '../services/apaarApiService';

interface AppContextType {
  currentUser: User;
  institutions: Institution[];
  currentInstitution: Institution;
  students: Student[];
  alerts: NotificationAlert[];
  corrections: CorrectionRequest[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedStudentForDetail: Student | null;
  setSelectedStudentForDetail: (student: Student | null) => void;

  // Theme
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  availableThemes: ThemeDefinition[];

  // 3-Level Verification Actions
  verifyStudentLevel1: (studentId: string) => Level1ValidationResult;
  compareStudentDocument: (studentId: string, input: Omit<DocumentComparisonInput, 'student'>) => DocumentComparisonOutcome;
  markStudentManualReview: (studentId: string, reason: string) => void;
  requestOfficialVerification: (studentId: string) => Promise<OfficialVerificationResult>;
  runDemoSimulationVerification: (studentId: string) => Promise<OfficialVerificationResult>;

  // Actions
  switchRole: (role: UserRole, institutionId?: string) => void;
  switchInstitution: (institutionId: string) => void;
  addStudent: (data: Partial<Student>) => Student;
  updateStudent: (id: string, updatedFields: Partial<Student>) => Student;
  deleteStudent: (id: string) => void;
  batchUploadStudents: (newRows: Partial<Student>[]) => { added: number; valid: number; review: number; error: number };
  resolveAlert: (alertId: string) => void;
  submitCorrection: (req: Omit<CorrectionRequest, 'id' | 'submittedAt' | 'status'>) => void;
  reviewCorrection: (id: string, status: 'approved' | 'rejected', reviewerNote?: string) => void;
  registerInstitution: (newInst: Omit<Institution, 'id'>) => Institution;
  revalidateAll: () => void;
  resetAllData: () => void;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence initialization from localStorage or initial mock data
  const [institutions, setInstitutions] = useState<Institution[]>(() => {
    const saved = localStorage.getItem('apaar_institutions');
    return saved ? JSON.parse(saved) : INITIAL_INSTITUTIONS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('apaar_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [alerts, setAlerts] = useState<NotificationAlert[]>(() => {
    const saved = localStorage.getItem('apaar_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [corrections, setCorrections] = useState<CorrectionRequest[]>(() => {
    const saved = localStorage.getItem('apaar_corrections');
    return saved ? JSON.parse(saved) : INITIAL_CORRECTIONS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('apaar_current_user');
    return saved ? JSON.parse(saved) : DEMO_USERS[0]; // Default to College Admin (DTU)
  });

  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('apaar_theme') as AppTheme;
    if (saved && ['bharat-royal', 'digital-indigo', 'academic-emerald', 'minimal-slate', 'executive-dark'].includes(saved)) {
      return saved;
    }
    return 'bharat-royal';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  // Sync theme
  useEffect(() => {
    localStorage.setItem('apaar_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'executive-dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync to localStorage

  useEffect(() => {
    localStorage.setItem('apaar_institutions', JSON.stringify(institutions));
  }, [institutions]);

  useEffect(() => {
    localStorage.setItem('apaar_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('apaar_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('apaar_corrections', JSON.stringify(corrections));
  }, [corrections]);

  useEffect(() => {
    localStorage.setItem('apaar_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Derived current institution
  const currentInstitution = institutions.find(i => i.id === currentUser.institutionId) || institutions[0];

  // Switch role or institution
  const switchRole = (role: UserRole, institutionId?: string) => {
    if (role === 'aicte_admin') {
      setCurrentUser(DEMO_USERS[2]); // AICTE admin
    } else {
      const targetInstId = institutionId || institutions[0].id;
      const inst = institutions.find(i => i.id === targetInstId) || institutions[0];
      setCurrentUser({
        id: `user-${inst.id}`,
        name: inst.contactPerson,
        email: inst.contactEmail,
        role: 'college_admin',
        institutionId: inst.id,
        institutionName: inst.name,
        designation: 'Institutional Administrator'
      });
    }
  };

  const switchInstitution = (institutionId: string) => {
    const inst = institutions.find(i => i.id === institutionId);
    if (!inst) return;
    setCurrentUser(prev => ({
      ...prev,
      institutionId: inst.id,
      institutionName: inst.name,
      name: inst.contactPerson,
      email: inst.contactEmail
    }));
  };

  // LEVEL 1: Format & Duplicate Verification
  const verifyStudentLevel1 = (studentId: string): Level1ValidationResult => {
    const target = students.find(s => s.id === studentId);
    if (!target) {
      return {
        passed: false,
        status: 'invalid_format',
        statusLabel: 'Invalid Format',
        errors: ['Student record not found in registry'],
        notes: 'Record missing',
        isDuplicate: false,
        disclaimer: 'Format Check Failed.'
      };
    }

    const result = validateApaarFormatLevel1(
      target.apaarId,
      target.id,
      target.institutionId,
      students
    );

    const now = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    updateStudent(studentId, {
      apaarStatus: result.status,
      verificationLevel: 1,
      verificationSource: 'Level 1 Algorithmic Regex & Duplicate Scanner',
      verificationDate: now
    });

    return result;
  };

  // LEVEL 2: Document-Based Comparison (DigiLocker / Card)
  const compareStudentDocument = (
    studentId: string,
    input: Omit<DocumentComparisonInput, 'student'>
  ): DocumentComparisonOutcome => {
    const target = students.find(s => s.id === studentId);
    if (!target) {
      throw new Error(`Student ${studentId} not found`);
    }

    const outcome = compareStudentWithDocument({
      ...input,
      student: target
    });

    const now = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    updateStudent(studentId, {
      apaarStatus: outcome.status,
      verificationLevel: 2,
      verificationSource: `Level 2 ${input.documentType || 'DigiLocker'} OCR Comparison`,
      verificationDate: now,
      documentRecord: outcome.record
    });

    return outcome;
  };

  // LEVEL 2: Manual Review Tag
  const markStudentManualReview = (studentId: string, reason: string) => {
    const now = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    updateStudent(studentId, {
      apaarStatus: 'manual_review',
      verificationLevel: 2,
      verificationSource: 'Institutional Manual Review (Authorized Officer)',
      verificationDate: now,
      flagNotes: `Manual Review: ${reason}`
    });
  };

  // LEVEL 3: Official Government Gateway Check (Honest, un-faked)
  const requestOfficialVerification = async (
    studentId: string
  ): Promise<OfficialVerificationResult> => {
    const target = students.find(s => s.id === studentId);
    if (!target) {
      throw new Error(`Student ${studentId} not found`);
    }

    const res = await verifyViaOfficialGateway(target);

    updateStudent(studentId, {
      apaarStatus: 'pending_official',
      verificationLevel: 3,
      verificationSource: res.verificationSource,
      verificationDate: res.verifiedAt,
      officialApiStatus: 'pending_access'
    });

    return res;
  };

  // LEVEL 3: Sandbox Demo Simulation (Explicitly labeled "Demo Simulation – Not Official")
  const runDemoSimulationVerification = async (
    studentId: string
  ): Promise<OfficialVerificationResult> => {
    const target = students.find(s => s.id === studentId);
    if (!target) {
      throw new Error(`Student ${studentId} not found`);
    }

    const res = await runDemoSimulation(target);

    updateStudent(studentId, {
      apaarStatus: res.status,
      verificationLevel: 3,
      verificationSource: res.verificationSource,
      verificationDate: res.verifiedAt,
      officialApiStatus: 'demo_simulation'
    });

    return res;
  };

  // Add single student with validation
  const addStudent = (data: Partial<Student>): Student => {
    const newId = `stu-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const instId = currentUser.institutionId || institutions[0].id;
    const inst = institutions.find(i => i.id === instId) || institutions[0];

    const studentCandidate: Student = {
      id: newId,
      name: data.name?.trim() || '',
      apaarId: normalizeApaarId(data.apaarId),
      institutionId: instId,
      institutionName: inst.name,
      department: data.department || inst.departments[0]?.department || 'Computer Science & Engineering',
      academicYear: data.academicYear || '2025-26',
      admissionCategory: (data.admissionCategory as any) || 'General',
      admissionStatus: (data.admissionStatus as any) || 'Active',
      dateOfAdmission: data.dateOfAdmission || new Date().toISOString().split('T')[0],
      gender: (data.gender as any) || 'Male',
      email: data.email || '',
      validationStatus: 'valid',
      validationChecks: [],
      flagNotes: ''
    };

    // Run validation engine
    const engineRes = validateStudentData({
      student: studentCandidate,
      existingStudents: students,
      institutions,
      currentInstitutionId: instId
    });

    studentCandidate.validationStatus = engineRes.validationStatus;
    studentCandidate.validationChecks = engineRes.validationChecks;
    studentCandidate.flagNotes = engineRes.flagNotes;
    studentCandidate.crossInstitutionConflict = engineRes.crossInstitutionConflict;

    // Run Level 1 APAAR check
    const l1 = validateApaarFormatLevel1(studentCandidate.apaarId, newId, instId, students);
    studentCandidate.apaarStatus = l1.status;
    studentCandidate.verificationLevel = 1;
    studentCandidate.verificationSource = 'Level 1 Algorithmic Regex & Duplicate Scanner';
    studentCandidate.verificationDate = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    studentCandidate.officialApiStatus = 'pending_access';

    setStudents(prev => [studentCandidate, ...prev]);

    // Generate alerts if severe
    if (engineRes.validationStatus === 'error' || engineRes.validationStatus === 'review') {
      const newAlert: NotificationAlert = {
        id: `alert-${Date.now()}`,
        institutionId: instId,
        institutionName: inst.name,
        title: engineRes.validationStatus === 'error' ? 'Validation Error on New Student' : 'Student Record Requires Review',
        type: engineRes.crossInstitutionConflict ? 'duplicate_apaar' : 'invalid_format',
        severity: engineRes.validationStatus === 'error' ? 'critical' : 'warning',
        description: `Student ${studentCandidate.name} (${studentCandidate.department}) flagged: ${engineRes.flagNotes}`,
        recommendedAction: 'Inspect student details in Student Records and verify academic credentials.',
        timestamp: new Date().toLocaleString(),
        isResolved: false,
        studentId: newId,
        apaarId: studentCandidate.apaarId
      };
      setAlerts(prev => [newAlert, ...prev]);
    }

    return studentCandidate;
  };

  // Update existing student
  const updateStudent = (id: string, updatedFields: Partial<Student>): Student => {
    let updatedStudent: Student | null = null;

    setStudents(prev => {
      return prev.map(s => {
        if (s.id !== id) return s;

        const merged: Student = {
          ...s,
          ...updatedFields,
          apaarId: updatedFields.apaarId !== undefined ? normalizeApaarId(updatedFields.apaarId) : s.apaarId
        };

        const otherStudents = prev.filter(item => item.id !== id);
        const engineRes = validateStudentData({
          student: merged,
          existingStudents: otherStudents,
          institutions,
          currentInstitutionId: merged.institutionId
        });

        merged.validationStatus = engineRes.validationStatus;
        merged.validationChecks = engineRes.validationChecks;
        merged.flagNotes = engineRes.flagNotes;
        merged.crossInstitutionConflict = engineRes.crossInstitutionConflict;

        // If apaarId changed or unassigned status, run level 1
        if (!merged.apaarStatus || updatedFields.apaarId !== undefined) {
          const l1 = validateApaarFormatLevel1(merged.apaarId, merged.id, merged.institutionId, otherStudents);
          merged.apaarStatus = l1.status;
          merged.verificationLevel = 1;
          merged.verificationSource = 'Level 1 Algorithmic Regex & Duplicate Scanner';
          merged.verificationDate = new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }

        updatedStudent = merged;
        return merged;
      });
    });

    if (selectedStudentForDetail && selectedStudentForDetail.id === id && updatedStudent) {
      setSelectedStudentForDetail(updatedStudent);
    }

    return updatedStudent || (students.find(s => s.id === id) as Student);
  };

  // Delete student
  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    if (selectedStudentForDetail?.id === id) {
      setSelectedStudentForDetail(null);
    }
  };

  // Batch upload students
  const batchUploadStudents = (newRows: Partial<Student>[]) => {
    const instId = currentUser.institutionId || institutions[0].id;
    const inst = institutions.find(i => i.id === instId) || institutions[0];

    const batchPeers = newRows.map((r, idx) => ({
      apaarId: normalizeApaarId(r.apaarId),
      tempId: `batch-temp-${idx}`
    }));

    let validCount = 0;
    let reviewCount = 0;
    let errorCount = 0;

    const newStudentObjects: Student[] = newRows.map((row, idx) => {
      const studentId = `stu-${Date.now()}-${idx}`;
      const tempCandidate: Student = {
        id: studentId,
        name: row.name?.trim() || `Student ${idx + 1}`,
        apaarId: normalizeApaarId(row.apaarId),
        institutionId: instId,
        institutionName: inst.name,
        department: row.department || inst.departments[0]?.department || 'Computer Science & Engineering',
        academicYear: row.academicYear || '2025-26',
        admissionCategory: (row.admissionCategory as any) || 'General',
        admissionStatus: (row.admissionStatus as any) || 'Active',
        dateOfAdmission: row.dateOfAdmission || new Date().toISOString().split('T')[0],
        gender: (row.gender as any) || 'Male',
        email: row.email || '',
        validationStatus: 'valid',
        validationChecks: [],
        flagNotes: ''
      };

      const res = validateStudentData({
        student: tempCandidate,
        existingStudents: students,
        institutions,
        currentInstitutionId: instId,
        isBatchMode: true,
        batchPeers
      });

      tempCandidate.validationStatus = res.validationStatus;
      tempCandidate.validationChecks = res.validationChecks;
      tempCandidate.flagNotes = res.flagNotes;
      tempCandidate.crossInstitutionConflict = res.crossInstitutionConflict;

      const l1 = validateApaarFormatLevel1(tempCandidate.apaarId, studentId, instId, students);
      tempCandidate.apaarStatus = l1.status;
      tempCandidate.verificationLevel = 1;
      tempCandidate.verificationSource = 'Level 1 Batch Upload Format Validator';
      tempCandidate.verificationDate = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      tempCandidate.officialApiStatus = 'pending_access';

      if (res.validationStatus === 'valid') validCount++;
      else if (res.validationStatus === 'review') reviewCount++;
      else errorCount++;

      return tempCandidate;
    });

    setStudents(prev => [...newStudentObjects, ...prev]);

    // Create a batch alert summary
    if (errorCount > 0 || reviewCount > 0) {
      const batchAlert: NotificationAlert = {
        id: `alert-batch-${Date.now()}`,
        institutionId: instId,
        institutionName: inst.name,
        title: `Batch Enrolment Upload Completed (${newStudentObjects.length} records)`,
        type: errorCount > 0 ? 'invalid_format' : 'duplicate_apaar',
        severity: errorCount > 0 ? 'critical' : 'warning',
        description: `Uploaded ${newStudentObjects.length} records: ${validCount} valid, ${reviewCount} review required, ${errorCount} errors detected.`,
        recommendedAction: 'Filter student records by "Error" and "Review" to remediate flagged entries.',
        timestamp: new Date().toLocaleString(),
        isResolved: false
      };
      setAlerts(prev => [batchAlert, ...prev]);
    }

    return {
      added: newStudentObjects.length,
      valid: validCount,
      review: reviewCount,
      error: errorCount
    };
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isResolved: true } : a));
  };

  const submitCorrection = (req: Omit<CorrectionRequest, 'id' | 'submittedAt' | 'status'>) => {
    const newReq: CorrectionRequest = {
      ...req,
      id: `corr-${Date.now()}`,
      submittedAt: new Date().toLocaleString(),
      status: 'pending'
    };
    setCorrections(prev => [newReq, ...prev]);
  };

  const reviewCorrection = (id: string, status: 'approved' | 'rejected', reviewerNote?: string) => {
    setCorrections(prev => prev.map(c => {
      if (c.id !== id) return c;
      return {
        ...c,
        status,
        reviewerNote: reviewerNote || (status === 'approved' ? 'Approved by AICTE National Bureau' : 'Rejected after audit'),
        reviewedAt: new Date().toLocaleString()
      };
    }));
  };

  const registerInstitution = (newInstData: Omit<Institution, 'id'>): Institution => {
    const newId = `inst-${Date.now()}`;
    const newInst: Institution = {
      ...newInstData,
      id: newId
    };
    setInstitutions(prev => [...prev, newInst]);
    return newInst;
  };

  const revalidateAll = () => {
    setStudents(prev => {
      return prev.map(s => {
        const others = prev.filter(o => o.id !== s.id);
        const res = validateStudentData({
          student: s,
          existingStudents: others,
          institutions,
          currentInstitutionId: s.institutionId
        });
        return {
          ...s,
          validationStatus: res.validationStatus,
          validationChecks: res.validationChecks,
          flagNotes: res.flagNotes,
          crossInstitutionConflict: res.crossInstitutionConflict
        };
      });
    });
  };

  const resetAllData = () => {
    setInstitutions(INITIAL_INSTITUTIONS);
    setStudents(INITIAL_STUDENTS);
    setAlerts(INITIAL_ALERTS);
    setCorrections(INITIAL_CORRECTIONS);
    setCurrentUser(DEMO_USERS[0]);
    localStorage.removeItem('apaar_institutions');
    localStorage.removeItem('apaar_students');
    localStorage.removeItem('apaar_alerts');
    localStorage.removeItem('apaar_corrections');
    localStorage.removeItem('apaar_current_user');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        institutions,
        currentInstitution,
        students,
        alerts,
        corrections,
        activeTab,
        setActiveTab,
        selectedStudentForDetail,
        setSelectedStudentForDetail,
        theme,
        setTheme,
        availableThemes: AVAILABLE_THEMES,
        verifyStudentLevel1,
        compareStudentDocument,
        markStudentManualReview,
        requestOfficialVerification,
        runDemoSimulationVerification,
        switchRole,
        switchInstitution,
        addStudent,
        updateStudent,
        deleteStudent,
        batchUploadStudents,
        resolveAlert,
        submitCorrection,
        reviewCorrection,
        registerInstitution,
        revalidateAll,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
