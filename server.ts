import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable JSON body parsing and CORS headers for AICTE prototype origin & local testing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Database file path
const DB_PATH = path.resolve(__dirname, 'data', 'apaar_database.json');

// Interface types
export interface SyntheticStudent {
  record_id: string;
  apaar_id: string;
  student_name: string;
  institution_name: string;
  aicte_institution_code: string;
  department: string;
  academic_year: string;
  admission_status: 'Active' | 'Provisional' | 'Graduated' | 'Suspended';
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationHistoryItem {
  id: string;
  timestamp: string;
  apaar_id: string;
  student_name: string;
  status: 'DEMO_MATCH' | 'DEMO_MISMATCH' | 'DEMO_ID_NOT_FOUND' | 'INVALID_FORMAT' | 'DEMO_DUPLICATE';
  id_found: boolean;
  name_matched: boolean;
  message: string;
  mode: 'DEMO';
  latency_ms: number;
  client_origin?: string;
  matched_student?: Partial<SyntheticStudent>;
}

interface DatabaseSchema {
  students: SyntheticStudent[];
  verification_history: VerificationHistoryItem[];
}

// In-memory cache
let cachedDb: DatabaseSchema | null = null;

// Baseline initial data in case file is missing
const INITIAL_BASELINE: DatabaseSchema = {
  students: [
    {
      record_id: 'REC-2026-001',
      apaar_id: '900000000001',
      student_name: 'Rahul Sharma',
      institution_name: 'Delhi Technological University',
      aicte_institution_code: '1-1049281',
      department: 'Computer Science & Engineering',
      academic_year: '2025-26',
      admission_status: 'Active',
      gender: 'Male',
      dob: '2004-03-12',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      record_id: 'REC-2026-002',
      apaar_id: '900000000002',
      student_name: 'Priya Sundaram',
      institution_name: 'RV College of Engineering',
      aicte_institution_code: '1-3948201',
      department: 'Electronics & Communication',
      academic_year: '2025-26',
      admission_status: 'Active',
      gender: 'Female',
      dob: '2003-11-24',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      record_id: 'REC-2026-003',
      apaar_id: '900000000003',
      student_name: 'Aarav Gupta',
      institution_name: 'College of Engineering Pune (COEP Tech)',
      aicte_institution_code: '1-2094812',
      department: 'Mechanical Engineering',
      academic_year: '2025-26',
      admission_status: 'Active',
      gender: 'Male',
      dob: '2004-07-19',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      record_id: 'REC-2026-004',
      apaar_id: '900000000004',
      student_name: 'Ananya Verma',
      institution_name: 'Indian Institute of Technology Bombay',
      aicte_institution_code: '1-0000001',
      department: 'AI & Data Science',
      academic_year: '2025-26',
      admission_status: 'Active',
      gender: 'Female',
      dob: '2004-01-05',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      record_id: 'REC-2026-005',
      apaar_id: '900000000005',
      student_name: 'Karthik Nair',
      institution_name: 'PSG College of Technology',
      aicte_institution_code: '1-4820194',
      department: 'Electrical Engineering',
      academic_year: '2025-26',
      admission_status: 'Active',
      gender: 'Male',
      dob: '2003-08-30',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      record_id: 'REC-2026-098',
      apaar_id: '900000000099',
      student_name: 'Rohan Deshmukh',
      institution_name: 'College of Engineering Pune (COEP Tech)',
      aicte_institution_code: '1-2094812',
      department: 'Computer Science & Engineering',
      academic_year: '2025-26',
      admission_status: 'Active',
      gender: 'Male',
      dob: '2003-05-14',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      record_id: 'REC-2026-099',
      apaar_id: '900000000099',
      student_name: 'Rohan Deshmukh',
      institution_name: 'Delhi Technological University',
      aicte_institution_code: '1-1049281',
      department: 'Computer Science & Engineering',
      academic_year: '2025-26',
      admission_status: 'Active',
      gender: 'Male',
      dob: '2003-05-14',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  verification_history: []
};

// Helper to read DB
function readDatabase(): DatabaseSchema {
  if (cachedDb) return cachedDb;
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      cachedDb = JSON.parse(raw);
      return cachedDb!;
    }
  } catch (err) {
    console.error('Error reading DB file, using fallback:', err);
  }
  cachedDb = JSON.parse(JSON.stringify(INITIAL_BASELINE));
  writeDatabase(cachedDb!);
  return cachedDb!;
}

// Helper to write DB
function writeDatabase(data: DatabaseSchema) {
  try {
    cachedDb = data;
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB file:', err);
  }
}

// Normalize APAAR ID (strip spaces and hyphens)
function cleanApaarId(id: any): string {
  if (!id) return '';
  return String(id).replace(/[\s-]/g, '').trim();
}

// Mask APAAR ID for interface privacy (e.g. "9000 **** **01")
function maskApaarId(id: string): string {
  const clean = cleanApaarId(id);
  if (clean.length !== 12) return clean;
  return `${clean.slice(0, 4)} **** **${clean.slice(10, 12)}`;
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. GET /api/demo/health
app.get('/api/demo/health', (_req: Request, res: Response) => {
  const db = readDatabase();
  res.json({
    status: 'healthy',
    mode: 'DEMO',
    service: 'APAAR Demo Verification Registry',
    version: '2.0.0-sih2026',
    database: 'connected',
    notice: 'DEMO ENVIRONMENT – This application uses synthetic data and does not perform official APAAR/ABC verification.',
    total_records: db.students.length,
    total_verifications: db.verification_history.length,
    uptime_seconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 2. GET /api/demo/stats (Dashboard statistics)
app.get('/api/demo/stats', (_req: Request, res: Response) => {
  const db = readDatabase();
  const history = db.verification_history;

  const matched = history.filter(h => h.status === 'DEMO_MATCH').length;
  const mismatched = history.filter(h => h.status === 'DEMO_MISMATCH').length;
  const notFound = history.filter(h => h.status === 'DEMO_ID_NOT_FOUND').length;
  const invalidFormat = history.filter(h => h.status === 'INVALID_FORMAT').length;
  const duplicates = history.filter(h => h.status === 'DEMO_DUPLICATE').length;

  res.json({
    mode: 'DEMO',
    total_records: db.students.length,
    records_matched: matched,
    records_mismatched: mismatched,
    ids_not_found: notFound,
    invalid_format: invalidFormat,
    duplicate_records_found: duplicates,
    total_verification_requests: history.length,
    recent_activity: history.slice(0, 10).map(item => ({
      ...item,
      masked_apaar_id: maskApaarId(item.apaar_id)
    }))
  });
});

// 3. POST /api/demo/verify (Core Verification Engine)
app.post('/api/demo/verify', (req: Request, res: Response) => {
  const startTime = performance.now();
  const db = readDatabase();

  const body = req.body || {};
  // Handle both { apaar_id, student_name } and backward-compatible formats
  const rawId = body.apaar_id || body.apaarId || body.student?.apaarId || body.student?.apaar_id || '';
  const rawName = body.student_name || body.name || body.student?.name || body.student?.student_name || '';
  const clientOrigin = req.headers['x-client-origin'] as string || req.headers['origin'] as string || 'AICTE Portal Client';

  const apaarId = cleanApaarId(rawId);
  const submittedName = String(rawName).trim();

  let status: VerificationHistoryItem['status'];
  let idFound = false;
  let nameMatched = false;
  let message = '';
  let matchedStudent: SyntheticStudent | undefined = undefined;
  let duplicateCount = 0;
  let duplicatesList: SyntheticStudent[] = [];

  // A. Check whether submitted APAAR ID contains exactly 12 numeric digits
  if (!apaarId || !/^\d{12}$/.test(apaarId)) {
    status = 'INVALID_FORMAT';
    idFound = false;
    nameMatched = false;
    message = `Invalid APAAR ID format. Expected exactly 12 numeric digits (received ${apaarId ? apaarId.length : 0} characters).`;
  } else {
    // B. Search for the ID in the local synthetic database
    const matchingRecords = db.students.filter(s => cleanApaarId(s.apaar_id) === apaarId);

    if (matchingRecords.length === 0) {
      // ID not found
      status = 'DEMO_ID_NOT_FOUND';
      idFound = false;
      nameMatched = false;
      message = `Synthetic APAAR ID '${apaarId}' not found in the demo registry database.`;
    } else if (matchingRecords.length > 1) {
      // D. Check whether the ID is associated with multiple records
      status = 'DEMO_DUPLICATE';
      idFound = true;
      nameMatched = false;
      duplicateCount = matchingRecords.length;
      duplicatesList = matchingRecords;
      message = `Conflict: Multiple synthetic student records (${matchingRecords.length}) are associated with APAAR ID '${apaarId}'.`;
    } else {
      // Single record found
      const student = matchingRecords[0];
      idFound = true;
      matchedStudent = student;

      // C. If the ID is found, compare the submitted student name with name stored in database
      if (submittedName) {
        const normalize = (n: string) => n.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normalize(submittedName) === normalize(student.student_name)) {
          status = 'DEMO_MATCH';
          nameMatched = true;
          message = 'Student record matched in the synthetic database.';
        } else {
          status = 'DEMO_MISMATCH';
          nameMatched = false;
          message = `ID found in synthetic registry, but submitted name '${submittedName}' does not match registered name '${student.student_name}'.`;
        }
      } else {
        // ID lookup without name comparison
        status = 'DEMO_MATCH';
        nameMatched = true;
        message = 'Student record found in the synthetic database.';
      }
    }
  }

  const latencyMs = Math.max(8, Math.round(performance.now() - startTime));

  // Store in verification history
  const historyItem: VerificationHistoryItem = {
    id: `VER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    apaar_id: apaarId || String(rawId),
    student_name: submittedName || (matchedStudent ? matchedStudent.student_name : 'N/A'),
    status,
    id_found: idFound,
    name_matched: nameMatched,
    message,
    mode: 'DEMO',
    latency_ms: latencyMs,
    client_origin: clientOrigin,
    matched_student: matchedStudent
  };

  db.verification_history.unshift(historyItem);
  // Keep max 200 history items
  if (db.verification_history.length > 200) {
    db.verification_history = db.verification_history.slice(0, 200);
  }
  writeDatabase(db);

  return res.status(200).json({
    mode: 'DEMO',
    status,
    id_found: idFound,
    name_matched: nameMatched,
    message,
    student: matchedStudent ? {
      record_id: matchedStudent.record_id,
      apaar_id: matchedStudent.apaar_id,
      student_name: matchedStudent.student_name,
      institution_name: matchedStudent.institution_name,
      aicte_institution_code: matchedStudent.aicte_institution_code,
      department: matchedStudent.department,
      academic_year: matchedStudent.academic_year,
      admission_status: matchedStudent.admission_status,
      dob: matchedStudent.dob,
      gender: matchedStudent.gender
    } : null,
    duplicate_count: duplicateCount > 0 ? duplicateCount : undefined,
    duplicate_records: duplicateCount > 0 ? duplicatesList.map(d => ({
      record_id: d.record_id,
      student_name: d.student_name,
      institution_name: d.institution_name,
      aicte_institution_code: d.aicte_institution_code,
      department: d.department
    })) : undefined,
    latency_ms: latencyMs,
    timestamp: historyItem.timestamp,
    notice: 'DEMO ENVIRONMENT – This application uses synthetic data and does not perform official APAAR/ABC verification.'
  });
});

// 4. GET /api/demo/records (Retrieve all student records with search/filter)
app.get('/api/demo/records', (req: Request, res: Response) => {
  const db = readDatabase();
  let list = [...db.students];

  const search = String(req.query.search || '').trim().toLowerCase();
  const institution = String(req.query.institution || '').trim();
  const department = String(req.query.department || '').trim();
  const status = String(req.query.status || '').trim();

  if (search) {
    const cleanSearch = search.replace(/[\s-]/g, '');
    list = list.filter(s =>
      s.student_name.toLowerCase().includes(search) ||
      cleanApaarId(s.apaar_id).includes(cleanSearch) ||
      s.record_id.toLowerCase().includes(search)
    );
  }

  if (institution && institution !== 'all') {
    list = list.filter(s => s.institution_name.toLowerCase() === institution.toLowerCase());
  }

  if (department && department !== 'all') {
    list = list.filter(s => s.department.toLowerCase() === department.toLowerCase());
  }

  if (status && status !== 'all') {
    list = list.filter(s => s.admission_status.toLowerCase() === status.toLowerCase());
  }

  res.json({
    mode: 'DEMO',
    total: list.length,
    records: list
  });
});

// 5. POST /api/demo/records (Create new synthetic student record)
app.post('/api/demo/records', (req: Request, res: Response) => {
  const db = readDatabase();
  const body = req.body || {};

  const cleanId = cleanApaarId(body.apaar_id || body.apaarId);
  const name = String(body.student_name || body.name || '').trim();
  const institutionName = String(body.institution_name || body.institutionName || '').trim();
  const aicteCode = String(body.aicte_institution_code || body.aicteCode || '1-1049281').trim();
  const department = String(body.department || 'Computer Science & Engineering').trim();
  const academicYear = String(body.academic_year || body.academicYear || '2025-26').trim();
  const admissionStatus = body.admission_status || body.admissionStatus || 'Active';
  const gender = body.gender || 'Male';
  const dob = body.dob || '2004-01-01';

  if (!cleanId || cleanId.length !== 12 || !/^\d{12}$/.test(cleanId)) {
    return res.status(400).json({
      success: false,
      error: 'APAAR ID must be exactly 12 numeric digits.'
    });
  }

  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'Student Name is required.'
    });
  }

  if (!institutionName) {
    return res.status(400).json({
      success: false,
      error: 'Institution Name is required.'
    });
  }

  // Generate unique Record ID
  const newRecordId = `REC-2026-${String(db.students.length + 1).padStart(3, '0')}`;

  const newRecord: SyntheticStudent = {
    record_id: body.record_id || newRecordId,
    apaar_id: cleanId,
    student_name: name,
    institution_name: institutionName,
    aicte_institution_code: aicteCode,
    department,
    academic_year: academicYear,
    admission_status: admissionStatus,
    gender,
    dob,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.students.unshift(newRecord);
  writeDatabase(db);

  return res.status(201).json({
    success: true,
    mode: 'DEMO',
    message: 'Synthetic student record created successfully.',
    record: newRecord
  });
});

// 6. PUT /api/demo/records/:id (Update existing record)
app.put('/api/demo/records/:id', (req: Request, res: Response) => {
  const db = readDatabase();
  const recordId = req.params.id;
  const body = req.body || {};

  const idx = db.students.findIndex(s => s.record_id === recordId || s.apaar_id === recordId);
  if (idx === -1) {
    return res.status(404).json({
      success: false,
      error: `Record with ID '${recordId}' not found.`
    });
  }

  const existing = db.students[idx];
  const updatedApaarId = body.apaar_id ? cleanApaarId(body.apaar_id) : existing.apaar_id;

  if (updatedApaarId && (updatedApaarId.length !== 12 || !/^\d{12}$/.test(updatedApaarId))) {
    return res.status(400).json({
      success: false,
      error: 'APAAR ID must be exactly 12 numeric digits.'
    });
  }

  const updated: SyntheticStudent = {
    ...existing,
    apaar_id: updatedApaarId,
    student_name: body.student_name !== undefined ? String(body.student_name).trim() : existing.student_name,
    institution_name: body.institution_name !== undefined ? String(body.institution_name).trim() : existing.institution_name,
    aicte_institution_code: body.aicte_institution_code !== undefined ? String(body.aicte_institution_code).trim() : existing.aicte_institution_code,
    department: body.department !== undefined ? String(body.department).trim() : existing.department,
    academic_year: body.academic_year !== undefined ? String(body.academic_year).trim() : existing.academic_year,
    admission_status: body.admission_status || existing.admission_status,
    gender: body.gender || existing.gender,
    dob: body.dob || existing.dob,
    updated_at: new Date().toISOString()
  };

  db.students[idx] = updated;
  writeDatabase(db);

  return res.json({
    success: true,
    mode: 'DEMO',
    message: 'Synthetic student record updated successfully.',
    record: updated
  });
});

// 7. DELETE /api/demo/records/:id (Delete record)
app.delete('/api/demo/records/:id', (req: Request, res: Response) => {
  const db = readDatabase();
  const recordId = req.params.id;

  const idx = db.students.findIndex(s => s.record_id === recordId || s.apaar_id === recordId);
  if (idx === -1) {
    return res.status(404).json({
      success: false,
      error: `Record with ID '${recordId}' not found.`
    });
  }

  const deleted = db.students.splice(idx, 1)[0];
  writeDatabase(db);

  return res.json({
    success: true,
    mode: 'DEMO',
    message: `Record '${deleted.record_id}' (${deleted.student_name}) deleted successfully.`,
    deleted_record_id: deleted.record_id
  });
});

// 8. GET /api/demo/history (Verification history log)
app.get('/api/demo/history', (_req: Request, res: Response) => {
  const db = readDatabase();
  res.json({
    mode: 'DEMO',
    total: db.verification_history.length,
    history: db.verification_history.map(item => ({
      ...item,
      masked_apaar_id: maskApaarId(item.apaar_id)
    }))
  });
});

// 9. POST /api/demo/history/clear (Clear verification history)
app.post('/api/demo/history/clear', (_req: Request, res: Response) => {
  const db = readDatabase();
  db.verification_history = [];
  writeDatabase(db);
  res.json({
    success: true,
    message: 'Verification history log cleared successfully.'
  });
});

// 10. POST /api/demo/reset (Reset database to baseline)
app.post('/api/demo/reset', (_req: Request, res: Response) => {
  const fresh = JSON.parse(JSON.stringify(INITIAL_BASELINE));
  fresh.students.forEach((s: any) => {
    s.created_at = new Date().toISOString();
    s.updated_at = new Date().toISOString();
  });
  writeDatabase(fresh);
  res.json({
    success: true,
    mode: 'DEMO',
    message: 'Database reset to initial synthetic dataset.',
    total_records: fresh.students.length
  });
});

// ==========================================
// VITE DEV SERVER OR STATIC ASSETS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`APAAR Demo Verification Registry Server running on http://0.0.0.0:${PORT}`);
    console.log(`REST Endpoints active: POST /api/demo/verify, GET /api/demo/health, GET /api/demo/records`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
