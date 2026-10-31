import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Sparkles,
  Clock,
  Code2,
  Copy,
  Check,
  Building,
  GraduationCap,
  Calendar,
  User,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { verifyApaarApi, VerificationResult, formatApaarId } from '../../services/apaarApi';

export const ApaarVerificationEngine: React.FC = () => {
  const [apaarId, setApaarId] = useState<string>('900000000001');
  const [studentName, setStudentName] = useState<string>('Rahul Sharma');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'card' | 'json'>('card');

  // Pre-configured test scenarios mapping exactly to Section 3 & 9
  const testScenarios = [
    {
      label: 'DEMO_MATCH',
      title: 'Valid ID + Matching Name',
      sub: 'Rahul Sharma (900000000001)',
      badge: 'MATCH',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      id: '900000000001',
      name: 'Rahul Sharma'
    },
    {
      label: 'DEMO_MISMATCH',
      title: 'Valid ID + Incorrect Name',
      sub: 'Rahul Verma (Expected: Sharma)',
      badge: 'MISMATCH',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      id: '900000000001',
      name: 'Rahul Verma'
    },
    {
      label: 'DEMO_ID_NOT_FOUND',
      title: 'Unregistered ID (Not in DB)',
      sub: '900000000777 (Missing)',
      badge: 'NOT FOUND',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      id: '900000000777',
      name: 'Mohit Bansal'
    },
    {
      label: 'INVALID_FORMAT',
      title: 'Malformed APAAR (< 12 Digits)',
      sub: '900000 (Only 6 Digits)',
      badge: 'FORMAT ERROR',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      id: '900000',
      name: 'Pooja Iyer'
    },
    {
      label: 'DEMO_DUPLICATE',
      title: 'Duplicate ID in Database',
      sub: '900000000099 (Multiple colleges)',
      badge: 'DUPLICATE',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      id: '900000000099',
      name: 'Rohan Deshmukh'
    }
  ];

  const handleApplyScenario = (sc: typeof testScenarios[0]) => {
    setApaarId(sc.id);
    setStudentName(sc.name);
    setResult(null);
  };

  const handleExecuteVerification = async () => {
    setLoading(true);
    try {
      const data = await verifyApaarApi(apaarId, studentName, 'Registry Internal Test Bench');
      setResult(data);
    } catch (err: any) {
      console.error('Verification engine error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulated Verification Protocol</span>
              <span>·</span>
              <span className="font-mono text-emerald-400">POST /api/demo/verify</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              APAAR Synthetic Verification Engine
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Performs 12-digit format validation, database ID search, student name comparison, and duplicate record detection.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-slate-300">
            <span className="text-emerald-400 font-bold">API STATUS:</span>
            <span>ONLINE (HTTP 200)</span>
          </div>
        </div>
      </div>

      {/* Quick Test Scenarios Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>One-Click Test Scenarios (Section 3 & 9 Requirements)</span>
          </span>
          <span className="text-[11px] text-slate-500">
            Click to auto-populate request inputs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {testScenarios.map(sc => (
            <button
              key={sc.label}
              onClick={() => handleApplyScenario(sc)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                apaarId === sc.id && studentName === sc.name
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${sc.badgeColor}`}>
                  {sc.badge}
                </span>
              </div>
              <div className="font-bold text-xs text-slate-900 leading-tight">
                {sc.title}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                {sc.sub}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Request Inputs vs Live Response Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Parameters (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Verification Request Input
            </span>
            <span className="font-mono text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              POST /api/demo/verify
            </span>
          </div>

          <div className="p-5 space-y-4 text-xs">
            {/* APAAR ID */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  APAAR ID to Verify (12 Digits) <span className="text-rose-500">*</span>
                </label>
                <span className="font-mono text-[11px] text-slate-500">
                  {apaarId.replace(/[\s-]/g, '').length}/12 Digits
                </span>
              </div>
              <input
                type="text"
                value={apaarId}
                onChange={e => setApaarId(e.target.value)}
                placeholder="e.g. 900000000001"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono text-sm tracking-wider text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Step A: Validates exact 12-digit numeric constraint.
              </p>
            </div>

            {/* Student Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Submitted Student Name (for matching check)
              </label>
              <input
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Step C: Compares submitted name with synthetic registry database record.
              </p>
            </div>

            {/* Trigger Button */}
            <div className="pt-2">
              <button
                onClick={handleExecuteVerification}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Executing Verification Engine...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Run Verification (POST /api/demo/verify)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Response & Student Details Card (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between flex-wrap gap-2">
            <div className="flex bg-slate-200/70 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab('card')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === 'card'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Verification Result Card
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'json'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>JSON API Response</span>
              </button>
            </div>

            {result && (
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  HTTP 200 OK
                </span>
                <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{result.latency_ms} ms</span>
                </span>
              </div>
            )}
          </div>

          <div className="p-5 flex-1 min-h-[380px]">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                <Zap className="w-10 h-10 text-indigo-200" />
                <span className="font-bold text-sm text-slate-700">Ready to Verify</span>
                <p className="text-xs max-w-sm">
                  Click &ldquo;Run Verification&rdquo; or pick one of the quick test scenarios above to inspect the verification engine response.
                </p>
              </div>
            ) : activeTab === 'card' ? (
              <div className="space-y-4">
                {/* Result Status Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                    result.status === 'DEMO_MATCH'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : result.status === 'DEMO_MISMATCH'
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : result.status === 'DEMO_DUPLICATE'
                      ? 'bg-purple-50 border-purple-300 text-purple-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.status === 'DEMO_MATCH' ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                    ) : result.status === 'DEMO_MISMATCH' ? (
                      <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
                    ) : result.status === 'DEMO_DUPLICATE' ? (
                      <AlertTriangle className="w-8 h-8 text-purple-600 shrink-0" />
                    ) : (
                      <XCircle className="w-8 h-8 text-rose-600 shrink-0" />
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base">
                          {result.status}
                        </span>
                        <span className="text-xs opacity-75 font-mono">
                          (Mode: {result.mode})
                        </span>
                      </div>
                      <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
                        {result.message}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4 Logic Check Gates */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-[10px] text-slate-500 font-semibold block">12-Digit Format</span>
                    <span className={`font-bold block mt-0.5 ${result.status !== 'INVALID_FORMAT' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {result.status !== 'INVALID_FORMAT' ? 'Valid (12 Digits)' : 'Invalid Format'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-[10px] text-slate-500 font-semibold block">ID Found in DB</span>
                    <span className={`font-bold block mt-0.5 ${result.id_found ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {result.id_found ? 'Found' : 'Not Found'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-[10px] text-slate-500 font-semibold block">Name Comparison</span>
                    <span className={`font-bold block mt-0.5 ${result.name_matched ? 'text-emerald-700' : result.status === 'DEMO_MISMATCH' ? 'text-amber-700' : 'text-slate-500'}`}>
                      {result.name_matched ? 'Matched' : result.status === 'DEMO_MISMATCH' ? 'Mismatch' : 'N/A'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-[10px] text-slate-500 font-semibold block">Multi-Record Conflict</span>
                    <span className={`font-bold block mt-0.5 ${result.status === 'DEMO_DUPLICATE' ? 'text-purple-700' : 'text-emerald-700'}`}>
                      {result.status === 'DEMO_DUPLICATE' ? 'Conflict (Duplicate)' : 'Single Record'}
                    </span>
                  </div>
                </div>

                {/* Returned Student Details Card (Section 4 & User Request) */}
                {result.student && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-900">
                          Matched Registry Student Record
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {result.student.record_id}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Student Full Name:</span>
                        <span className="font-bold text-slate-900 block text-sm">
                          {result.student.student_name}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block">Synthetic APAAR ID:</span>
                        <span className="font-mono font-bold text-indigo-700 block text-sm">
                          {formatApaarId(result.student.apaar_id)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block">Enrolled Institution:</span>
                        <span className="font-semibold text-slate-800 block">
                          {result.student.institution_name}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block">AICTE Institution Code:</span>
                        <span className="font-mono text-slate-700 block">
                          {result.student.aicte_institution_code}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block">Department / Branch:</span>
                        <span className="text-slate-800 block">
                          {result.student.department}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block">Academic Year & Status:</span>
                        <span className="text-slate-800 block">
                          {result.student.academic_year} · <span className="font-semibold text-emerald-700">{result.student.admission_status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Duplicate Instances Table if Duplicate found */}
                {result.duplicate_records && (
                  <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-200 space-y-2">
                    <span className="text-xs font-bold text-purple-900 block">
                      Conflict Breakdown: {result.duplicate_count} Conflicting Registrations in Mock Database
                    </span>
                    <div className="space-y-1.5">
                      {result.duplicate_records.map((dup, i) => (
                        <div key={i} className="p-2 rounded bg-white border border-purple-200 text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-900">{dup.student_name}</span>
                            <span className="text-slate-500"> ({dup.department})</span>
                          </div>
                          <span className="font-semibold text-purple-800">{dup.institution_name} ({dup.aicte_institution_code})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={handleCopyJson}
                  className="absolute top-2 right-2 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
                <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[440px] leading-relaxed">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
