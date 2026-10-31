import React, { useState, useEffect } from 'react';
import {
  Send,
  Code2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Zap,
  Globe,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileJson,
  UserPlus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  verifyStudentViaApi,
  DEMO_VERIFY_SCENARIOS,
  VerifyApiResponse
} from '../../services/api';
import { formatApaarId, normalizeApaarId } from '../../utils/validationEngine';

export const ApiDemoVerifier: React.FC = () => {
  const { currentInstitution, students, institutions, addStudent, setActiveTab } = useApp();

  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [formData, setFormData] = useState<any>(DEMO_VERIFY_SCENARIOS[0].data);
  const [customInstitutionId, setCustomInstitutionId] = useState<string>(currentInstitution.id);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<VerifyApiResponse | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'visual' | 'json' | 'request'>('visual');
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [addedStudentSuccess, setAddedStudentSuccess] = useState<boolean>(false);

  // Sync when selecting preset scenario
  const handleSelectScenario = (idx: number) => {
    setSelectedScenarioIndex(idx);
    setFormData(DEMO_VERIFY_SCENARIOS[idx].data);
    setApiResponse(null);
    setAddedStudentSuccess(false);
  };

  const handleInputChange = (field: string, val: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: val
    }));
  };

  const handleExecuteVerify = async () => {
    setLoading(true);
    setAddedStudentSuccess(false);
    try {
      const resp = await verifyStudentViaApi({
        student: {
          ...formData,
          institutionId: customInstitutionId,
          institutionName: institutions.find(i => i.id === customInstitutionId)?.name || currentInstitution.name
        },
        currentInstitutionId: customInstitutionId,
        existingStudents: students,
        institutions: institutions
      });
      setApiResponse(resp);
    } catch (err: any) {
      console.error('Failed to verify via API:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount for quick first glance
  useEffect(() => {
    handleExecuteVerify();
  }, []);

  const requestPayloadString = JSON.stringify(
    {
      student: {
        ...formData,
        institutionId: customInstitutionId
      },
      institutionId: customInstitutionId
    },
    null,
    2
  );

  const responsePayloadString = apiResponse
    ? JSON.stringify(apiResponse, null, 2)
    : '// Run verification to view live HTTP 200 response';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleAddVerifiedStudent = () => {
    if (!formData.name || !formData.apaarId) return;
    addStudent({
      ...formData,
      institutionId: customInstitutionId,
      institutionName: institutions.find(i => i.id === customInstitutionId)?.name || currentInstitution.name
    });
    setAddedStudentSuccess(true);
  };

  const singleResult = apiResponse?.results?.[0] || apiResponse?.result;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Code2 className="w-56 h-56 text-indigo-400" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30 mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>AICTE Real-Time Verification API</span>
            <span className="text-slate-400">|</span>
            <span className="font-mono text-emerald-400">HTTP 200 Active</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <span>POST /api/demo/verify</span>
          </h2>

          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Live programmatic endpoint validating student records against AICTE institutional databases,
            detecting duplicate APAAR IDs across colleges, checksum failures, and intake limits in real-time.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 font-mono">
              <span className="text-emerald-400 font-bold">METHOD:</span>
              <span className="text-white">POST</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 font-mono">
              <span className="text-amber-400 font-bold">ROUTE:</span>
              <span className="text-white">/api/demo/verify</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 font-mono">
              <span className="text-sky-400 font-bold">CONTENT:</span>
              <span className="text-white">application/json</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Scenario Selector */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Interactive Test Scenarios
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Click any scenario to prefill payload & test response
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {DEMO_VERIFY_SCENARIOS.map((sc, idx) => {
            const isSelected = selectedScenarioIndex === idx;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(idx)}
                className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 leading-tight">
                  {sc.name}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {sc.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Interactive Workspace: Request vs Response */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Request Parameters / Editor (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                HTTP Request Payload
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              POST /api/demo/verify
            </span>
          </div>

          <div className="p-5 space-y-4 text-xs">
            {/* Institution Context */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Target Institution:
              </label>
              <select
                value={customInstitutionId}
                onChange={e => setCustomInstitutionId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Student Name */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Student Full Name: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="e.g. Aditya Vardhan"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
              />
            </div>

            {/* APAAR ID */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-semibold">
                  APAAR ID (12 Digits): <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  {normalizeApaarId(formData.apaarId).length}/12 Digits
                </span>
              </div>
              <input
                type="text"
                value={formData.apaarId || ''}
                onChange={e => handleInputChange('apaarId', e.target.value)}
                placeholder="e.g. 9182 4819 2018"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none tracking-wider"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Department / Program: <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.department || ''}
                onChange={e => handleInputChange('department', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="AI & Data Science">AI & Data Science</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
              </select>
            </div>

            {/* Academic Year & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Academic Year:
                </label>
                <input
                  type="text"
                  value={formData.academicYear || '2025-26'}
                  onChange={e => handleInputChange('academicYear', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Category:
                </label>
                <select
                  value={formData.admissionCategory || 'General'}
                  onChange={e => handleInputChange('admissionCategory', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                  <option value="Management Quota">Management Quota</option>
                </select>
              </div>
            </div>

            {/* Student Email */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Student Email (Optional):
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder="student@institution.edu.in"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExecuteVerify}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Executing POST /api/demo/verify...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send POST /api/demo/verify Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Response Inspector & Rules Breakdown (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {/* Header with View Tabs & Latency Badge */}
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setActiveViewTab('visual')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeViewTab === 'visual'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  6-Rule Analysis
                </button>
                <button
                  onClick={() => setActiveViewTab('json')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeViewTab === 'json'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>JSON Response</span>
                </button>
                <button
                  onClick={() => setActiveViewTab('request')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeViewTab === 'request'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Request Body
                </button>
              </div>
            </div>

            {/* Status & Latency Badge */}
            {apiResponse && (
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  HTTP 200 OK
                </span>
                {apiResponse.latencyMs !== undefined && (
                  <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{apiResponse.latencyMs} ms</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="p-5 flex-1 min-h-[440px]">
            {activeViewTab === 'visual' && singleResult && (
              <div className="space-y-4">
                {/* Result Summary Bar */}
                <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  singleResult.validationStatus === 'valid'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : singleResult.validationStatus === 'review'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}>
                  <div className="flex items-center gap-3">
                    {singleResult.validationStatus === 'valid' ? (
                      <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                    ) : singleResult.validationStatus === 'review' ? (
                      <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" />
                    ) : (
                      <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black uppercase tracking-wide">
                          {singleResult.validationStatus === 'valid'
                            ? 'Record Verified Clean'
                            : singleResult.validationStatus === 'review'
                            ? 'Flagged for Review (Dual Enrolment)'
                            : 'Validation Failed (Rejected)'}
                        </span>
                        <span className="text-[11px] font-mono opacity-70">
                          {singleResult.apaarId}
                        </span>
                      </div>
                      <p className="text-xs opacity-85 mt-0.5">
                        {singleResult.flagNotes}
                      </p>
                    </div>
                  </div>

                  {singleResult.validationStatus === 'valid' && (
                    <button
                      onClick={handleAddVerifiedStudent}
                      disabled={addedStudentSuccess}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        addedStudentSuccess
                          ? 'bg-emerald-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {addedStudentSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Enrolled!</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Enroll to College</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Cross Conflict Banner if present */}
                {singleResult.crossInstitutionConflict && (
                  <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Dual-Enrolment Conflict Detected Across Institutions</span>
                    </div>
                    <p className="text-amber-800 text-[11px]">
                      This student APAAR ID is simultaneously claimed by{' '}
                      <span className="font-semibold underline">
                        {singleResult.crossInstitutionConflict.otherInstitutionName}
                      </span>{' '}
                      under name &ldquo;{singleResult.crossInstitutionConflict.otherStudentName}&rdquo; ({singleResult.crossInstitutionConflict.otherDepartment}, {singleResult.crossInstitutionConflict.otherYear}).
                    </p>
                  </div>
                )}

                {/* 6 AICTE Rules Evaluation Grid */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    AICTE Automated 6-Rule Evaluation:
                  </h4>

                  <div className="space-y-2">
                    {singleResult.validationChecks.map((chk, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                          chk.passed
                            ? 'bg-emerald-50/40 border-emerald-200/80'
                            : chk.severity === 'error'
                            ? 'bg-rose-50/60 border-rose-200'
                            : 'bg-amber-50/60 border-amber-200'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {chk.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          ) : chk.severity === 'error' ? (
                            <XCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                          )}
                          <div>
                            <span className="font-bold text-slate-800">
                              {chk.name}
                            </span>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              {chk.message}
                            </p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                          chk.passed
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : chk.severity === 'error'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {chk.passed ? 'PASSED' : chk.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeViewTab === 'json' && (
              <div className="relative">
                <button
                  onClick={() => handleCopy(responsePayloadString)}
                  className="absolute top-2 right-2 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
                >
                  {copiedJson ? (
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
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[460px] leading-relaxed">
                  {responsePayloadString}
                </pre>
              </div>
            )}

            {activeViewTab === 'request' && (
              <div className="relative">
                <button
                  onClick={() => handleCopy(requestPayloadString)}
                  className="absolute top-2 right-2 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Body</span>
                </button>
                <div className="mb-2 text-xs font-mono text-slate-500">
                  POST /api/demo/verify (application/json)
                </div>
                <pre className="bg-slate-950 text-indigo-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[460px] leading-relaxed">
                  {requestPayloadString}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
