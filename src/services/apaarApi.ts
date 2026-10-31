export interface OfficialVerificationResult {
  status: any;
  verificationSource: string;
  verifiedAt: string;
  message: string;
  gatewayResponseCode?: string;
  isSimulated: boolean;
  studentDetails?: any;
}

export const OFFICIAL_API_CONFIG = {
  endpoint: '/api/demo/verify',
  statusLabel: 'APAAR Demo Verification Registry Active',
  mode: 'DEMO'
};

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
  masked_apaar_id?: string;
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

export interface VerificationResult {
  mode: 'DEMO';
  status: 'DEMO_MATCH' | 'DEMO_MISMATCH' | 'DEMO_ID_NOT_FOUND' | 'INVALID_FORMAT' | 'DEMO_DUPLICATE';
  id_found: boolean;
  name_matched: boolean;
  message: string;
  student?: Partial<SyntheticStudent> | null;
  duplicate_count?: number;
  duplicate_records?: Array<{
    record_id: string;
    student_name: string;
    institution_name: string;
    aicte_institution_code: string;
    department: string;
  }>;
  latency_ms: number;
  timestamp: string;
  notice: string;
}

export interface RegistryStats {
  mode: 'DEMO';
  total_records: number;
  records_matched: number;
  records_mismatched: number;
  ids_not_found: number;
  invalid_format: number;
  duplicate_records_found: number;
  total_verification_requests: number;
  recent_activity: VerificationHistoryItem[];
}

export function maskApaarId(id: string | undefined | null): string {
  if (!id) return '';
  const clean = String(id).replace(/[\s-]/g, '').trim();
  if (clean.length !== 12) return clean;
  return `${clean.slice(0, 4)} **** **${clean.slice(10, 12)}`;
}

export function formatApaarId(id: string | undefined | null): string {
  if (!id) return '';
  const clean = String(id).replace(/[\s-]/g, '').trim();
  if (clean.length !== 12) return clean;
  return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)}`;
}

// 1. Verify APAAR ID against Mock Registry REST API
export async function verifyApaarApi(
  apaar_id: string,
  student_name?: string,
  client_origin: string = 'AICTE Student Portal'
): Promise<VerificationResult> {
  const startTime = performance.now();
  const response = await fetch('/api/demo/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Origin': client_origin
    },
    body: JSON.stringify({
      apaar_id,
      student_name
    })
  });

  if (!response.ok) {
    const elapsed = Math.round(performance.now() - startTime);
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Verification failed with HTTP ${response.status}`);
  }

  return await response.json();
}

// 2. Fetch live Registry Stats
export async function fetchRegistryStats(): Promise<RegistryStats> {
  const res = await fetch('/api/demo/stats');
  if (!res.ok) throw new Error('Failed to fetch registry stats');
  return await res.json();
}

// 3. Fetch all Synthetic Student Records
export async function fetchSyntheticRecords(params?: {
  search?: string;
  institution?: string;
  department?: string;
  status?: string;
}): Promise<{ total: number; records: SyntheticStudent[] }> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.institution) searchParams.set('institution', params.institution);
  if (params?.department) searchParams.set('department', params.department);
  if (params?.status) searchParams.set('status', params.status);

  const res = await fetch(`/api/demo/records?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch student records');
  return await res.json();
}

// 4. Create a new synthetic record
export async function createSyntheticRecord(
  record: Omit<SyntheticStudent, 'record_id' | 'created_at' | 'updated_at'> & { record_id?: string }
): Promise<SyntheticStudent> {
  const res = await fetch('/api/demo/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create record');
  return data.record;
}

// 5. Update an existing synthetic record
export async function updateSyntheticRecord(
  id: string,
  record: Partial<SyntheticStudent>
): Promise<SyntheticStudent> {
  const res = await fetch(`/api/demo/records/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update record');
  return data.record;
}

// 6. Delete a record
export async function deleteSyntheticRecord(id: string): Promise<string> {
  const res = await fetch(`/api/demo/records/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete record');
  return data.deleted_record_id;
}

// 7. Fetch Verification History
export async function fetchVerificationHistory(): Promise<VerificationHistoryItem[]> {
  const res = await fetch('/api/demo/history');
  if (!res.ok) throw new Error('Failed to fetch verification history');
  const data = await res.json();
  return data.history || [];
}

// 8. Clear Verification History
export async function clearVerificationHistory(): Promise<void> {
  const res = await fetch('/api/demo/history/clear', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to clear history');
}

// 9. Reset Demo Database
export async function resetDemoDatabase(): Promise<number> {
  const res = await fetch('/api/demo/reset', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset database');
  return data.total_records;
}

// 10. Gateway & Simulation Adapters for Student Detail Modal & AppContext
export async function verifyViaOfficialGateway(student: any): Promise<OfficialVerificationResult> {
  try {
    const rawId = student.apaarId || student.apaar_id || '';
    const rawName = student.name || student.student_name || '';
    const result = await verifyApaarApi(rawId, rawName, 'AICTE Gateway Adapter');

    return {
      status: result.status === 'DEMO_MATCH' ? 'verified' : result.status === 'DEMO_MISMATCH' ? 'mismatch' : 'unverified',
      verificationSource: 'APAAR Demo Verification Registry (Simulated)',
      verifiedAt: new Date().toISOString(),
      message: result.message,
      gatewayResponseCode: result.status,
      isSimulated: true,
      studentDetails: result.student
    };
  } catch (err: any) {
    return {
      status: 'unverified',
      verificationSource: 'APAAR Demo Registry (Simulated)',
      verifiedAt: new Date().toISOString(),
      message: err?.message || 'Verification attempt failed',
      gatewayResponseCode: 'OFFLINE_FALLBACK',
      isSimulated: true
    };
  }
}

export async function runDemoSimulation(student: any): Promise<OfficialVerificationResult> {
  return verifyViaOfficialGateway(student);
}
