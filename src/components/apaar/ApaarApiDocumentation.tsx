import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Zap,
  Send,
  Layers,
  Sparkles,
  Key
} from 'lucide-react';

export const ApaarApiDocumentation: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'js' | 'python'>('curl');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [testEndpoint, setTestEndpoint] = useState<'verify' | 'health' | 'records'>('verify');
  const [testApaarId, setTestApaarId] = useState('900000000001');
  const [testStudentName, setTestStudentName] = useState('Rahul Sharma');
  const [liveResponse, setLiveResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRunPlayground = async () => {
    setLoading(true);
    setLiveResponse(null);
    try {
      if (testEndpoint === 'verify') {
        const res = await fetch('/api/demo/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'apaar_demo_secret_key_sih2026'
          },
          body: JSON.stringify({
            apaar_id: testApaarId,
            student_name: testStudentName
          })
        });
        const data = await res.json();
        setLiveResponse(data);
      } else if (testEndpoint === 'health') {
        const res = await fetch('/api/demo/health');
        const data = await res.json();
        setLiveResponse(data);
      } else if (testEndpoint === 'records') {
        const res = await fetch('/api/demo/records?limit=3');
        const data = await res.json();
        setLiveResponse(data);
      }
    } catch (err: any) {
      setLiveResponse({ error: err?.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const curlExample = `curl -X POST https://ais-dev-agxnbljb6izh45oq4p5qjd-923674531545.asia-southeast1.run.app/api/demo/verify \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: apaar_demo_secret_key_sih2026" \\
  -d '{
    "apaar_id": "900000000001",
    "student_name": "Rahul Sharma"
  }'`;

  const jsExample = `// ES6 JavaScript / Node.js
async function verifyApaarStudent(apaarId, studentName) {
  const response = await fetch('/api/demo/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'apaar_demo_secret_key_sih2026'
    },
    body: JSON.stringify({
      apaar_id: apaarId,
      student_name: studentName
    })
  });

  const data = await response.json();
  console.log('Verification Status:', data.status); // DEMO_MATCH, DEMO_MISMATCH, etc.
  return data;
}

// Example call:
verifyApaarStudent("900000000001", "Rahul Sharma");`;

  const pythonExample = `import requests

url = "https://ais-dev-agxnbljb6izh45oq4p5qjd-923674531545.asia-southeast1.run.app/api/demo/verify"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "apaar_demo_secret_key_sih2026"
}
payload = {
    "apaar_id": "900000000001",
    "student_name": "Rahul Sharma"
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

print(f"Status: {data['status']}")
if data['id_found']:
    print(f"Student: {data['student']['student_name']} at {data['student']['institution_name']}")`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30 mb-2">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>External Integration Guide</span>
              <span>·</span>
              <span className="font-mono text-emerald-400">REST API v2.0</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              API Documentation & Integration Guide
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Connect external AICTE client portals, institutional admission management systems, and audit tools to this simulated APAAR verification registry.
            </p>
          </div>
        </div>
      </div>

      {/* Security & Authentication Notice */}
      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sm text-indigo-900">API Authentication & Headers</span>
          <p className="text-indigo-800 text-[11px] mt-1 leading-relaxed">
            All requests to protected endpoints require standard HTTP JSON headers. When making requests from external servers or apps, provide the simulated demo key in the header:
          </p>
          <div className="mt-2 font-mono bg-white p-2 rounded-lg border border-indigo-200 text-[11px] text-indigo-900">
            X-API-Key: apaar_demo_secret_key_sih2026
          </div>
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Available REST Endpoints
          </h3>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {/* POST /api/demo/verify */}
          <div className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 text-[11px]">
                  POST
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  /api/demo/verify
                </span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">
                  Core Verification
                </span>
              </div>
              <p className="text-slate-600 text-xs">
                Verifies submitted APAAR ID and student name against synthetic registry. Returns matching details, mismatch notice, or duplicate warnings.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 shrink-0">
              Payload: &#123; apaar_id, student_name? &#125;
            </div>
          </div>

          {/* GET /api/demo/health */}
          <div className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 text-[11px]">
                  GET
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  /api/demo/health
                </span>
              </div>
              <p className="text-slate-600 text-xs">
                Health check endpoint reporting registry uptime, total synthetic records, and simulated demo mode confirmation.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 shrink-0">
              Response: &#123; status: "healthy", mode: "DEMO" &#125;
            </div>
          </div>

          {/* GET /api/demo/records */}
          <div className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 text-[11px]">
                  GET
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  /api/demo/records
                </span>
              </div>
              <p className="text-slate-600 text-xs">
                Retrieves synthetic student records list with query parameters for filtering by institution, department, and search term.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 shrink-0">
              Query: ?search=&institution=&department=
            </div>
          </div>

          {/* POST /api/demo/records */}
          <div className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 text-[11px]">
                  POST
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  /api/demo/records
                </span>
              </div>
              <p className="text-slate-600 text-xs">
                Adds a new synthetic student record to the simulated central database.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 shrink-0">
              Payload: &#123; apaar_id, student_name, institution_name, ... &#125;
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippets Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Integration Code Snippets
            </h3>
          </div>

          <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setSelectedLanguage('curl')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                selectedLanguage === 'curl' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              cURL
            </button>
            <button
              onClick={() => setSelectedLanguage('js')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                selectedLanguage === 'js' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              JavaScript / Fetch
            </button>
            <button
              onClick={() => setSelectedLanguage('python')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                selectedLanguage === 'python' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Python
            </button>
          </div>
        </div>

        <div className="p-5 bg-slate-950 relative">
          <button
            onClick={() => {
              const code = selectedLanguage === 'curl' ? curlExample : selectedLanguage === 'js' ? jsExample : pythonExample;
              handleCopy('snippet', code);
            }}
            className="absolute top-4 right-4 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
          >
            {copiedCode === 'snippet' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <pre className="text-indigo-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-[350px]">
            {selectedLanguage === 'curl' && curlExample}
            {selectedLanguage === 'js' && jsExample}
            {selectedLanguage === 'python' && pythonExample}
          </pre>
        </div>
      </div>

      {/* Interactive API Playground directly in Docs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Live API Documentation Playground
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Execute real HTTP requests to verify endpoint responses
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTestEndpoint('verify')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                testEndpoint === 'verify' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              POST /api/demo/verify
            </button>
            <button
              onClick={() => setTestEndpoint('health')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                testEndpoint === 'health' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              GET /api/demo/health
            </button>
            <button
              onClick={() => setTestEndpoint('records')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                testEndpoint === 'records' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              GET /api/demo/records
            </button>
          </div>

          {testEndpoint === 'verify' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Synthetic APAAR ID:
                </label>
                <input
                  type="text"
                  value={testApaarId}
                  onChange={e => setTestApaarId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Student Name:
                </label>
                <input
                  type="text"
                  value={testStudentName}
                  onChange={e => setTestStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleRunPlayground}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? 'Sending Request...' : 'Send Live Request'}</span>
          </button>

          {liveResponse && (
            <div className="mt-3">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Live Server Response:
              </span>
              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[300px]">
                {JSON.stringify(liveResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
