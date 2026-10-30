import { Institution, Student, NotificationAlert, CorrectionRequest, User } from '../types';

export const INITIAL_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-dtu',
    code: 'AICTE-1-1049281',
    name: 'Delhi Technological University',
    state: 'Delhi',
    city: 'New Delhi',
    type: 'State University',
    approvedTotalIntake: 420,
    establishedYear: 1941,
    contactPerson: 'Dr. Rameshwar Sharma (Dean Academics)',
    contactEmail: 'academics@dtu.ac.in',
    status: 'Active',
    departments: [
      { department: 'Computer Science & Engineering', approvedIntake: 120 },
      { department: 'Electronics & Communication', approvedIntake: 90 },
      { department: 'Mechanical Engineering', approvedIntake: 90 },
      { department: 'AI & Data Science', approvedIntake: 60 },
      { department: 'Civil Engineering', approvedIntake: 60 },
    ]
  },
  {
    id: 'inst-coep',
    code: 'AICTE-1-2094812',
    name: 'College of Engineering Pune (COEP Tech)',
    state: 'Maharashtra',
    city: 'Pune',
    type: 'Autonomous Institute',
    approvedTotalIntake: 360,
    establishedYear: 1854,
    contactPerson: 'Prof. Anjali Kulkarni (Registrar)',
    contactEmail: 'registrar@coep.ac.in',
    status: 'Active',
    departments: [
      { department: 'Computer Science & Engineering', approvedIntake: 120 },
      { department: 'Mechanical Engineering', approvedIntake: 90 },
      { department: 'Electrical Engineering', approvedIntake: 60 },
      { department: 'Civil Engineering', approvedIntake: 60 },
      { department: 'Electronics & Communication', approvedIntake: 30 },
    ]
  },
  {
    id: 'inst-rvce',
    code: 'AICTE-1-3948201',
    name: 'RV College of Engineering',
    state: 'Karnataka',
    city: 'Bengaluru',
    type: 'Autonomous Institute',
    approvedTotalIntake: 360,
    establishedYear: 1963,
    contactPerson: 'Dr. Subramanya K. (Admin Officer)',
    contactEmail: 'principal@rvce.edu.in',
    status: 'Active',
    departments: [
      { department: 'Computer Science & Engineering', approvedIntake: 120 },
      { department: 'AI & Data Science', approvedIntake: 60 },
      { department: 'Electronics & Communication', approvedIntake: 90 },
      { department: 'Mechanical Engineering', approvedIntake: 90 },
    ]
  },
  {
    id: 'inst-psg',
    code: 'AICTE-1-4820194',
    name: 'PSG College of Technology',
    state: 'Tamil Nadu',
    city: 'Coimbatore',
    type: 'Autonomous Institute',
    approvedTotalIntake: 300,
    establishedYear: 1951,
    contactPerson: 'Dr. Natarajan V. (Academic Cell)',
    contactEmail: 'academic@psgtech.edu',
    status: 'Active',
    departments: [
      { department: 'Computer Science & Engineering', approvedIntake: 90 },
      { department: 'Electronics & Communication', approvedIntake: 90 },
      { department: 'Mechanical Engineering', approvedIntake: 60 },
      { department: 'Electrical Engineering', approvedIntake: 60 },
    ]
  },
  {
    id: 'inst-vit',
    code: 'AICTE-1-5910294',
    name: 'Vidyalankar Institute of Technology',
    state: 'Maharashtra',
    city: 'Mumbai',
    type: 'Affiliated College',
    approvedTotalIntake: 240,
    establishedYear: 1999,
    contactPerson: 'Prof. Sandeep Joshi (Vice Principal)',
    contactEmail: 'dean@vit.edu.in',
    status: 'Under Audit',
    departments: [
      { department: 'Computer Science & Engineering', approvedIntake: 90 },
      { department: 'AI & Data Science', approvedIntake: 60 },
      { department: 'Electronics & Communication', approvedIntake: 60 },
      { department: 'Information Technology', approvedIntake: 30 },
    ]
  }
];

export const INITIAL_STUDENTS: Student[] = [
  // DTU Students (mix of valid, review, and error)
  {
    id: 'stu-dtu-001',
    name: 'Aarav Devendra Sharma',
    apaarId: '984210923841',
    institutionId: 'inst-dtu',
    institutionName: 'Delhi Technological University',
    department: 'Computer Science & Engineering',
    academicYear: '2025-26',
    admissionCategory: 'General',
    admissionStatus: 'Active',
    dateOfAdmission: '2025-08-14',
    gender: 'Male',
    email: 'aarav.sharma@dtu.ac.in',
    validationStatus: 'valid',
    validationChecks: [
      { ruleId: 'RULE_MANDATORY_FIELDS', name: 'Mandatory Fields Check', passed: true, severity: 'success', message: 'All mandatory student profile fields are present.' },
      { ruleId: 'RULE_APAAR_FORMAT', name: 'APAAR ID Format Validation', passed: true, severity: 'success', message: 'APAAR ID complies with 12-digit standard structure.' },
      { ruleId: 'RULE_LOCAL_DUPLICATE', name: 'Intra-Institutional Duplicate Check', passed: true, severity: 'success', message: 'No duplicate APAAR ID detected within this institution.' },
      { ruleId: 'RULE_CROSS_INSTITUTION_DUPLICATE', name: 'Inter-Institutional Duplicate Enrolment', passed: true, severity: 'success', message: 'No cross-institutional dual enrolment conflicts found in AICTE registry.' },
      { ruleId: 'RULE_INTAKE_LIMIT', name: 'AICTE Approved Intake Audit', passed: true, severity: 'success', message: 'Within approved intake limit.' },
      { ruleId: 'RULE_INCONSISTENT_DATA', name: 'Data Consistency Check', passed: true, severity: 'success', message: 'Student record parameters are consistent with institutional guidelines.' }
    ],
    flagNotes: 'Record is valid and complies with AICTE intake specifications.'
  },
  {
    id: 'stu-dtu-002',
    name: 'Diya Rajesh Patel',
    apaarId: '827103948201',
    institutionId: 'inst-dtu',
    institutionName: 'Delhi Technological University',
    department: 'Computer Science & Engineering',
    academicYear: '2025-26',
    admissionCategory: 'OBC',
    admissionStatus: 'Active',
    dateOfAdmission: '2025-08-12',
    gender: 'Female',
    email: 'diya.patel@dtu.ac.in',
    validationStatus: 'valid',
    validationChecks: [
      { ruleId: 'RULE_MANDATORY_FIELDS', name: 'Mandatory Fields Check', passed: true, severity: 'success', message: 'All mandatory student profile fields are present.' },
      { ruleId: 'RULE_APAAR_FORMAT', name: 'APAAR ID Format Validation', passed: true, severity: 'success', message: 'APAAR ID complies with 12-digit standard structure.' },
      { ruleId: 'RULE_LOCAL_DUPLICATE', name: 'Intra-Institutional Duplicate Check', passed: true, severity: 'success', message: 'No duplicate APAAR ID detected within this institution.' },
      { ruleId: 'RULE_CROSS_INSTITUTION_DUPLICATE', name: 'Inter-Institutional Duplicate Enrolment', passed: true, severity: 'success', message: 'No cross-institutional dual enrolment conflicts found in AICTE registry.' },
      { ruleId: 'RULE_INTAKE_LIMIT', name: 'AICTE Approved Intake Audit', passed: true, severity: 'success', message: 'Within approved intake limit.' },
      { ruleId: 'RULE_INCONSISTENT_DATA', name: 'Data Consistency Check', passed: true, severity: 'success', message: 'Student record parameters are consistent.' }
    ],
    flagNotes: 'Record is valid.'
  },
  {
    id: 'stu-dtu-003',
    name: 'Rohan Vikram Singhania',
    apaarId: '761928401928', // Intentional Cross-Institution conflict with RV College of Engineering!
    institutionId: 'inst-dtu',
    institutionName: 'Delhi Technological University',
    department: 'Computer Science & Engineering',
    academicYear: '2025-26',
    admissionCategory: 'General',
    admissionStatus: 'Provisional',
    dateOfAdmission: '2025-08-16',
    gender: 'Male',
    email: 'rohan.singhania@dtu.ac.in',
    validationStatus: 'review',
    crossInstitutionConflict: {
      otherInstitutionId: 'inst-rvce',
      otherInstitutionName: 'RV College of Engineering',
      otherStudentName: 'Rohan V. Singhania',
      otherDepartment: 'Computer Science & Engineering',
      otherYear: '2025-26'
    },
    validationChecks: [
      { ruleId: 'RULE_MANDATORY_FIELDS', name: 'Mandatory Fields Check', passed: true, severity: 'success', message: 'All mandatory student profile fields are present.' },
      { ruleId: 'RULE_APAAR_FORMAT', name: 'APAAR ID Format Validation', passed: true, severity: 'success', message: 'APAAR ID format is syntactically valid.' },
      { ruleId: 'RULE_LOCAL_DUPLICATE', name: 'Intra-Institutional Duplicate Check', passed: true, severity: 'success', message: 'Unique within DTU registry.' },
      {
        ruleId: 'RULE_CROSS_INSTITUTION_DUPLICATE',
        name: 'Inter-Institutional Duplicate Enrolment',
        passed: false,
        severity: 'warning',
        message: 'Potential dual enrolment detected: Matching APAAR ID registered at "RV College of Engineering" (Computer Science & Engineering). Flagged for administrative verification.'
      },
      { ruleId: 'RULE_INTAKE_LIMIT', name: 'AICTE Approved Intake Audit', passed: true, severity: 'success', message: 'Within approved intake limit.' },
      { ruleId: 'RULE_INCONSISTENT_DATA', name: 'Data Consistency Check', passed: true, severity: 'success', message: 'Data parameters consistent.' }
    ],
    flagNotes: 'Dual Enrolment Alert: Student APAAR also registered at RV College of Engineering for AY 2025-26. Verification required.'
  },
  {
    id: 'stu-dtu-004',
    name: 'Ananya S. Iyer',
    apaarId: '000000000000', // Intentional Dummy/Invalid APAAR format!
    institutionId: 'inst-dtu',
    institutionName: 'Delhi Technological University',
    department: 'Electronics & Communication',
    academicYear: '2025-26',
    admissionCategory: 'General',
    admissionStatus: 'Provisional',
    dateOfAdmission: '2025-08-20',
    gender: 'Female',
    email: 'ananya.iyer@dtu.ac.in',
    validationStatus: 'error',
    validationChecks: [
      { ruleId: 'RULE_MANDATORY_FIELDS', name: 'Mandatory Fields Check', passed: true, severity: 'success', message: 'All mandatory student profile fields are present.' },
      {
        ruleId: 'RULE_APAAR_FORMAT',
        name: 'APAAR ID Format Validation',
        passed: false,
        severity: 'error',
        message: 'Dummy or repetitive sequence detected (000000000000). Official 12-digit APAAR required.'
      },
      { ruleId: 'RULE_LOCAL_DUPLICATE', name: 'Intra-Institutional Duplicate Check', passed: true, severity: 'success', message: 'Passed.' },
      { ruleId: 'RULE_CROSS_INSTITUTION_DUPLICATE', name: 'Inter-Institutional Duplicate Enrolment', passed: true, severity: 'success', message: 'Passed.' },
      { ruleId: 'RULE_INTAKE_LIMIT', name: 'AICTE Approved Intake Audit', passed: true, severity: 'success', message: 'Passed.' },
      { ruleId: 'RULE_INCONSISTENT_DATA', name: 'Data Consistency Check', passed: true, severity: 'success', message: 'Passed.' }
    ],
    flagNotes: 'Invalid APAAR Format: Repetitive dummy number placeholder detected. Must upload authentic 12-digit APAAR ID.'
  },
  {
    id: 'stu-dtu-005',
    name: 'Kavita Kumari',
    apaarId: '984210923841', // Intentional duplicate of stu-dtu-001 within DTU!
    institutionId: 'inst-dtu',
    institutionName: 'Delhi Technological University',
    department: 'Mechanical Engineering',
    academicYear: '2025-26',
    admissionCategory: 'SC',
    admissionStatus: 'Active',
    dateOfAdmission: '2025-08-15',
    gender: 'Female',
    email: 'kavita.k@dtu.ac.in',
    validationStatus: 'error',
    validationChecks: [
      { ruleId: 'RULE_MANDATORY_FIELDS', name: 'Mandatory Fields Check', passed: true, severity: 'success', message: 'All mandatory fields present.' },
      { ruleId: 'RULE_APAAR_FORMAT', name: 'APAAR ID Format Validation', passed: true, severity: 'success', message: 'Format structure is 12 digits.' },
      {
        ruleId: 'RULE_LOCAL_DUPLICATE',
        name: 'Intra-Institutional Duplicate Check',
        passed: false,
        severity: 'error',
        message: 'Duplicate APAAR ID within this institution! Already assigned to: Aarav Devendra Sharma (Computer Science & Engineering).'
      },
      { ruleId: 'RULE_CROSS_INSTITUTION_DUPLICATE', name: 'Inter-Institutional Duplicate Enrolment', passed: true, severity: 'success', message: 'Passed.' },
      { ruleId: 'RULE_INTAKE_LIMIT', name: 'AICTE Approved Intake Audit', passed: true, severity: 'success', message: 'Passed.' },
      { ruleId: 'RULE_INCONSISTENT_DATA', name: 'Data Consistency Check', passed: true, severity: 'success', message: 'Passed.' }
    ],
    flagNotes: 'Duplicate APAAR ID within same institution: Collides with Aarav Devendra Sharma.'
  },
  {
    id: 'stu-dtu-006',
    name: 'Kabir Harshavardhan Rao',
    apaarId: '542198031245',
    institutionId: 'inst-dtu',
    institutionName: 'Delhi Technological University',
    department: 'AI & Data Science',
    academicYear: '2025-26',
    admissionCategory: 'EWS',
    admissionStatus: 'Active',
    dateOfAdmission: '2025-08-10',
    gender: 'Male',
    email: 'kabir.rao@dtu.ac.in',
    validationStatus: 'valid',
    validationChecks: [
      { ruleId: 'RULE_MANDATORY_FIELDS', name: 'Mandatory Fields Check', passed: true, severity: 'success', message: 'All fields present.' },
      { ruleId: 'RULE_APAAR_FORMAT', name: 'APAAR ID Format Validation', passed: true, severity: 'success', message: 'Valid 12-digit format.' },
      { ruleId: 'RULE_LOCAL_DUPLICATE', name: 'Intra-Institutional Duplicate Check', passed: true, severity: 'success', message: 'Unique.' },
      { ruleId: 'RULE_CROSS_INSTITUTION_DUPLICATE', name: 'Inter-Institutional Duplicate Enrolment', passed: true, severity: 'success', message: 'Unique.' },
      { ruleId: 'RULE_INTAKE_LIMIT', name: 'AICTE Approved Intake Audit', passed: true, severity: 'success', message: 'Within approved quota.' },
      { ruleId: 'RULE_INCONSISTENT_DATA', name: 'Data Consistency Check', passed: true, severity: 'success', message: 'Consistent data.' }
    ],
    flagNotes: 'Record is valid.'
  },
  {
    id: 'stu-dtu-007',
    name: 'Pooja Meena',
    apaarId: '639102948172',
    institutionId: 'inst-dtu',
    institutionName: 'Delhi Technological University',
    department: 'Civil Engineering',
    academicYear: '2025-26',
    admissionCategory: 'ST',
    admissionStatus: 'Active',
    dateOfAdmission: '2025-08-11',
    gender: 'Female',
    email: 'pooja.meena@dtu.ac.in',
    validationStatus: 'valid',
    validationChecks: [
      { ruleId: 'RULE_MANDATORY_FIELDS', name: 'Mandatory Fields Check', passed: true, severity: 'success', message: 'All mandatory fields present.' },
      { ruleId: 'RULE_APAAR_FORMAT', name: 'APAAR ID Format Validation', passed: true, severity: 'success', message: 'Valid format.' },
      { ruleId: 'RULE_LOCAL_DUPLICATE', name: 'Intra-Institutional Duplicate Check', passed: true, severity: 'success', message: 'Unique.' },
      { ruleId: 'RULE_CROSS_INSTITUTION_DUPLICATE', name: 'Inter-Institutional Duplicate Enrolment', passed: true, severity: 'success', message: 'Unique.' },
      { ruleId: 'RULE_INTAKE_LIMIT', name: 'AICTE Approved Intake Audit', passed: true, severity: 'success', message: 'Within approved quota.' },
      { ruleId: 'RULE_INCONSISTENT_DATA', name: 'Data Consistency Check', passed: true, severity: 'success', message: 'Consistent.' }
    ],
    flagNotes: 'Record is valid.'
  },

  // RVCE Bengaluru Student (contains the cross conflict counterpart)
  {
    id: 'stu-rvce-001',
    name: 'Rohan V. Singhania',
    apaarId: '761928401928',
    institutionId: 'inst-rvce',
    institutionName: 'RV College of Engineering',
    department: 'Computer Science & Engineering',
    academicYear: '2025-26',
    admissionCategory: 'General',
    admissionStatus: 'Active',
    dateOfAdmission: '2025-08-08',
    gender: 'Male',
    email: 'rohan.s@rvce.edu.in',
    validationStatus: 'review',
    crossInstitutionConflict: {
      otherInstitutionId: 'inst-dtu',
      otherInstitutionName: 'Delhi Technological University',
      otherStudentName: 'Rohan Vikram Singhania',
      otherDepartment: 'Computer Science & Engineering',
      otherYear: '2025-26'
    },
    validationChecks: [
      { ruleId: 'RULE_MANDATORY_FIELDS', name: 'Mandatory Fields Check', passed: true, severity: 'success', message: 'All fields present.' },
      { ruleId: 'RULE_APAAR_FORMAT', name: 'APAAR ID Format Validation', passed: true, severity: 'success', message: 'Valid format.' },
      { ruleId: 'RULE_LOCAL_DUPLICATE', name: 'Intra-Institutional Duplicate Check', passed: true, severity: 'success', message: 'Unique.' },
      {
        ruleId: 'RULE_CROSS_INSTITUTION_DUPLICATE',
        name: 'Inter-Institutional Duplicate Enrolment',
        passed: false,
        severity: 'warning',
        message: 'Potential dual enrolment detected: Matching APAAR ID registered at "Delhi Technological University" (Computer Science & Engineering). Flagged for administrative verification.'
      },
      { ruleId: 'RULE_INTAKE_LIMIT', name: 'AICTE Approved Intake Audit', passed: true, severity: 'success', message: 'Intake valid.' },
      { ruleId: 'RULE_INCONSISTENT_DATA', name: 'Data Consistency Check', passed: true, severity: 'success', message: 'Data consistent.' }
    ],
    flagNotes: 'Dual Enrolment Alert: Cross-referenced with Delhi Technological University.'
  },
  {
    id: 'stu-rvce-002',
    name: 'Sneha Venkatesh Rao',
    apaarId: '381920491820',
    institutionId: 'inst-rvce',
    institutionName: 'RV College of Engineering',
    department: 'AI & Data Science',
    academicYear: '2025-26',
    admissionCategory: 'OBC',
    admissionStatus: 'Active',
    dateOfAdmission: '2025-08-10',
    gender: 'Female',
    email: 'sneha.v@rvce.edu.in',
    validationStatus: 'valid',
    validationChecks: [
      { ruleId: 'RULE_MANDATORY_FIELDS', name: 'Mandatory Fields Check', passed: true, severity: 'success', message: 'All fields present.' },
      { ruleId: 'RULE_APAAR_FORMAT', name: 'APAAR ID Format Validation', passed: true, severity: 'success', message: 'Valid format.' },
      { ruleId: 'RULE_LOCAL_DUPLICATE', name: 'Intra-Institutional Duplicate Check', passed: true, severity: 'success', message: 'Unique.' },
      { ruleId: 'RULE_CROSS_INSTITUTION_DUPLICATE', name: 'Inter-Institutional Duplicate Enrolment', passed: true, severity: 'success', message: 'Unique.' },
      { ruleId: 'RULE_INTAKE_LIMIT', name: 'AICTE Approved Intake Audit', passed: true, severity: 'success', message: 'Intake valid.' },
      { ruleId: 'RULE_INCONSISTENT_DATA', name: 'Data Consistency Check', passed: true, severity: 'success', message: 'Data consistent.' }
    ],
    flagNotes: 'Record is valid.'
  },

  // COEP Pune Students
  {
    id: 'stu-coep-001',
    name: 'Tanmay Vinod Deshmukh',
    apaarId: '472910482910',
    institutionId: 'inst-coep',
    institutionName: 'College of Engineering Pune (COEP Tech)',
    department: 'Computer Science & Engineering',
    academicYear: '2025-26',
    admissionCategory: 'General',
    admissionStatus: 'Active',
    dateOfAdmission: '2025-08-05',
    gender: 'Male',
    email: 'tanmay.deshmukh@coep.ac.in',
    validationStatus: 'valid',
    validationChecks: [
      { ruleId: 'RULE_MANDATORY_FIELDS', name: 'Mandatory Fields Check', passed: true, severity: 'success', message: 'All fields present.' },
      { ruleId: 'RULE_APAAR_FORMAT', name: 'APAAR ID Format Validation', passed: true, severity: 'success', message: 'Valid format.' },
      { ruleId: 'RULE_LOCAL_DUPLICATE', name: 'Intra-Institutional Duplicate Check', passed: true, severity: 'success', message: 'Unique.' },
      { ruleId: 'RULE_CROSS_INSTITUTION_DUPLICATE', name: 'Inter-Institutional Duplicate Enrolment', passed: true, severity: 'success', message: 'Unique.' },
      { ruleId: 'RULE_INTAKE_LIMIT', name: 'AICTE Approved Intake Audit', passed: true, severity: 'success', message: 'Intake valid.' },
      { ruleId: 'RULE_INCONSISTENT_DATA', name: 'Data Consistency Check', passed: true, severity: 'success', message: 'Data consistent.' }
    ],
    flagNotes: 'Record is valid.'
  },
  {
    id: 'stu-coep-002',
    name: 'Pranali Milind Shinde',
    apaarId: '582019482019',
    institutionId: 'inst-coep',
    institutionName: 'College of Engineering Pune (COEP Tech)',
    department: 'Mechanical Engineering',
    academicYear: '2025-26',
    admissionCategory: 'OBC',
    admissionStatus: 'Active',
    dateOfAdmission: '2025-08-07',
    gender: 'Female',
    email: 'pranali.shinde@coep.ac.in',
    validationStatus: 'valid',
    validationChecks: [
      { ruleId: 'RULE_MANDATORY_FIELDS', name: 'Mandatory Fields Check', passed: true, severity: 'success', message: 'All fields present.' },
      { ruleId: 'RULE_APAAR_FORMAT', name: 'APAAR ID Format Validation', passed: true, severity: 'success', message: 'Valid format.' },
      { ruleId: 'RULE_LOCAL_DUPLICATE', name: 'Intra-Institutional Duplicate Check', passed: true, severity: 'success', message: 'Unique.' },
      { ruleId: 'RULE_CROSS_INSTITUTION_DUPLICATE', name: 'Inter-Institutional Duplicate Enrolment', passed: true, severity: 'success', message: 'Unique.' },
      { ruleId: 'RULE_INTAKE_LIMIT', name: 'AICTE Approved Intake Audit', passed: true, severity: 'success', message: 'Intake valid.' },
      { ruleId: 'RULE_INCONSISTENT_DATA', name: 'Data Consistency Check', passed: true, severity: 'success', message: 'Data consistent.' }
    ],
    flagNotes: 'Record is valid.'
  },

  // PSG Tech Students
  {
    id: 'stu-psg-001',
    name: 'Karthikeyan Subramanian',
    apaarId: '849201948201',
    institutionId: 'inst-psg',
    institutionName: 'PSG College of Technology',
    department: 'Computer Science & Engineering',
    academicYear: '2025-26',
    admissionCategory: 'General',
    admissionStatus: 'Active',
    dateOfAdmission: '2025-08-04',
    gender: 'Male',
    email: 'karthik.s@psgtech.edu',
    validationStatus: 'valid',
    validationChecks: [
      { ruleId: 'RULE_MANDATORY_FIELDS', name: 'Mandatory Fields Check', passed: true, severity: 'success', message: 'All fields present.' },
      { ruleId: 'RULE_APAAR_FORMAT', name: 'APAAR ID Format Validation', passed: true, severity: 'success', message: 'Valid format.' },
      { ruleId: 'RULE_LOCAL_DUPLICATE', name: 'Intra-Institutional Duplicate Check', passed: true, severity: 'success', message: 'Unique.' },
      { ruleId: 'RULE_CROSS_INSTITUTION_DUPLICATE', name: 'Inter-Institutional Duplicate Enrolment', passed: true, severity: 'success', message: 'Unique.' },
      { ruleId: 'RULE_INTAKE_LIMIT', name: 'AICTE Approved Intake Audit', passed: true, severity: 'success', message: 'Intake valid.' },
      { ruleId: 'RULE_INCONSISTENT_DATA', name: 'Data Consistency Check', passed: true, severity: 'success', message: 'Data consistent.' }
    ],
    flagNotes: 'Record is valid.'
  },

  // VIT Mumbai (Over intake demo & flagged records)
  {
    id: 'stu-vit-001',
    name: 'Aditya Manish Rane',
    apaarId: '192840192830',
    institutionId: 'inst-vit',
    institutionName: 'Vidyalankar Institute of Technology',
    department: 'Computer Science & Engineering',
    academicYear: '2025-26',
    admissionCategory: 'Management Quota',
    admissionStatus: 'Active',
    dateOfAdmission: '2025-08-25',
    gender: 'Male',
    email: 'aditya.rane@vit.edu.in',
    validationStatus: 'review',
    validationChecks: [
      { ruleId: 'RULE_MANDATORY_FIELDS', name: 'Mandatory Fields Check', passed: true, severity: 'success', message: 'All fields present.' },
      { ruleId: 'RULE_APAAR_FORMAT', name: 'APAAR ID Format Validation', passed: true, severity: 'success', message: 'Format valid.' },
      { ruleId: 'RULE_LOCAL_DUPLICATE', name: 'Intra-Institutional Duplicate Check', passed: true, severity: 'success', message: 'Unique.' },
      { ruleId: 'RULE_CROSS_INSTITUTION_DUPLICATE', name: 'Inter-Institutional Duplicate Enrolment', passed: true, severity: 'success', message: 'Unique.' },
      {
        ruleId: 'RULE_INTAKE_LIMIT',
        name: 'AICTE Approved Intake Audit',
        passed: false,
        severity: 'warning',
        message: 'Department intake capacity nearing threshold: 91/90 seats allocated (Over quota by 1 seat in CS).'
      },
      { ruleId: 'RULE_INCONSISTENT_DATA', name: 'Data Consistency Check', passed: true, severity: 'success', message: 'Data consistent.' }
    ],
    flagNotes: 'Intake Audit Alert: CSE enrolment at 91/90 seats. Management quota allocation requires approval validation.'
  }
];

export const INITIAL_ALERTS: NotificationAlert[] = [
  {
    id: 'alert-1',
    institutionId: 'inst-dtu',
    institutionName: 'Delhi Technological University',
    title: 'Cross-Institutional Dual Enrolment Detected',
    type: 'duplicate_apaar',
    severity: 'critical',
    description: 'Student APAAR ID 7619 2840 1928 (Rohan Singhania) is registered concurrently at DTU Delhi and RV College of Engineering for Academic Year 2025-26.',
    recommendedAction: 'Verify admission surrender or migration certificate with RV College of Engineering before finalizing enrolment in AICTE National Portal.',
    timestamp: '2026-10-30 07:45 AM',
    isResolved: false,
    apaarId: '761928401928',
    studentId: 'stu-dtu-003'
  },
  {
    id: 'alert-2',
    institutionId: 'inst-dtu',
    institutionName: 'Delhi Technological University',
    title: 'Intra-Institutional Duplicate APAAR Record',
    type: 'duplicate_apaar',
    severity: 'critical',
    description: 'APAAR ID 9842 1092 3841 has been registered under two distinct student records: Aarav Devendra Sharma (CSE) and Kavita Kumari (Mechanical).',
    recommendedAction: 'Verify student DigiLocker APAAR card scan for Kavita Kumari to resolve identity clash.',
    timestamp: '2026-10-29 03:12 PM',
    isResolved: false,
    apaarId: '984210923841',
    studentId: 'stu-dtu-005'
  },
  {
    id: 'alert-3',
    institutionId: 'inst-dtu',
    institutionName: 'Delhi Technological University',
    title: 'Invalid APAAR ID Format Detected',
    type: 'invalid_format',
    severity: 'warning',
    description: 'Student Ananya S. Iyer submitted placeholder value "0000 0000 0000" during bulk data upload.',
    recommendedAction: 'Issue notice to candidate to link Aadhaar-backed ABC account and retrieve authentic 12-digit APAAR ID.',
    timestamp: '2026-10-28 11:20 AM',
    isResolved: false,
    apaarId: '000000000000',
    studentId: 'stu-dtu-004'
  },
  {
    id: 'alert-4',
    institutionId: 'inst-vit',
    institutionName: 'Vidyalankar Institute of Technology',
    title: 'Sanctioned Intake Quota Exceeded',
    type: 'intake_exceeded',
    severity: 'critical',
    description: 'Computer Science & Engineering admissions have reached 91 students against an approved AICTE limit of 90 seats.',
    recommendedAction: 'AICTE Compliance Cell review requested. Verify supernumerary/TFW seat allocations or penalize excess admissions.',
    timestamp: '2026-10-27 09:30 AM',
    isResolved: false
  }
];

export const INITIAL_CORRECTIONS: CorrectionRequest[] = [
  {
    id: 'corr-01',
    institutionId: 'inst-dtu',
    institutionName: 'Delhi Technological University',
    studentId: 'stu-dtu-003',
    studentName: 'Rohan Vikram Singhania',
    apaarId: '7619 2840 1928',
    issueType: 'Dual Enrolment Clarification',
    justification: 'Candidate formally cancelled seat at RVCE on 2025-08-05. Transfer Certificate & Refund Receipt No. RVCE/2025/9402 attached.',
    proposedCorrection: 'Mark DTU admission as primary and release RVCE lock.',
    submittedAt: '2026-10-29 02:15 PM',
    status: 'pending'
  },
  {
    id: 'corr-02',
    institutionId: 'inst-dtu',
    institutionName: 'Delhi Technological University',
    studentId: 'stu-dtu-004',
    studentName: 'Ananya S. Iyer',
    apaarId: '0000 0000 0000',
    issueType: 'APAAR ID Format Correction',
    justification: 'Candidate verified DigiLocker account and generated permanent APAAR ID 3910 4918 2019.',
    proposedCorrection: 'Update APAAR ID to 3910 4918 2019 and revalidate record.',
    submittedAt: '2026-10-30 06:10 AM',
    status: 'pending'
  }
];

export const DEMO_USERS: User[] = [
  {
    id: 'user-dtu',
    name: 'Dr. Rameshwar Sharma',
    email: 'dean.academics@dtu.ac.in',
    role: 'college_admin',
    institutionId: 'inst-dtu',
    institutionName: 'Delhi Technological University',
    designation: 'Dean of Academic Affairs'
  },
  {
    id: 'user-coep',
    name: 'Prof. Anjali Kulkarni',
    email: 'registrar@coep.ac.in',
    role: 'college_admin',
    institutionId: 'inst-coep',
    institutionName: 'College of Engineering Pune (COEP Tech)',
    designation: 'Institutional Registrar'
  },
  {
    id: 'user-aicte',
    name: 'Dr. Vinod K. Sharma',
    email: 'admin.approval@aicte-india.org',
    role: 'aicte_admin',
    designation: 'Director, AICTE National Data & Approval Bureau'
  }
];
