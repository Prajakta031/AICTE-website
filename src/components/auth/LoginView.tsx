import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Sparkles,
  Info,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEMO_USERS } from '../../data/mockData';

interface LoginViewProps {
  onClose?: () => void;
  onOpenRegister?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onClose, onOpenRegister }) => {
  const { switchRole, institutions, currentUser, setActiveTab } = useApp();

  const [selectedRole, setSelectedRole] = useState<'college_admin' | 'aicte_admin'>('college_admin');
  const [selectedInstId, setSelectedInstId] = useState<string>(institutions[0]?.id || 'inst-dtu');
  const [email, setEmail] = useState('dean.academics@dtu.ac.in');
  const [password, setPassword] = useState('••••••••••••');

  const handleRoleSelect = (role: 'college_admin' | 'aicte_admin') => {
    setSelectedRole(role);
    if (role === 'aicte_admin') {
      setEmail('admin.approval@aicte-india.org');
    } else {
      const inst = institutions.find(i => i.id === selectedInstId) || institutions[0];
      setEmail(inst.contactEmail);
    }
  };

  const handleInstitutionSelect = (instId: string) => {
    setSelectedInstId(instId);
    const inst = institutions.find(i => i.id === instId);
    if (inst) {
      setEmail(inst.contactEmail);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'aicte_admin') {
      switchRole('aicte_admin');
    } else {
      switchRole('college_admin', selectedInstId);
    }
    setActiveTab('dashboard');
    if (onClose) onClose();
  };

  // Quick 1-click Demo shortcuts
  const loginQuickAicte = () => {
    switchRole('aicte_admin');
    setActiveTab('dashboard');
    if (onClose) onClose();
  };

  const loginQuickCollege = (instId: string) => {
    switchRole('college_admin', instId);
    setActiveTab('dashboard');
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-6">
        {/* Top Government Portal Branding */}
        <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/src/assets/images/aicte_emblem_insignia_1793373599365.jpg"
                alt="AICTE"
                referrerPolicy="no-referrer"
                className="w-12 h-12 object-contain rounded-full border border-slate-700 bg-white p-0.5"
              />
              <div>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-amber-400 block">
                  Ministry of Education · AICTE
                </span>
                <h2 className="text-lg font-bold tracking-tight">
                  APAAR Portal Authentication
                </h2>
                <p className="text-xs text-slate-400">
                  Automated Permanent Academic Account Registry & Intake Gateway
                </p>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Authorized Administrative Portal
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('college_admin')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'college_admin'
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs ring-1 ring-teal-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className={`w-4 h-4 ${selectedRole === 'college_admin' ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs text-slate-900">College Administrator</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Upload student records, view validation audits & manage department quotas.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('aicte_admin')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'aicte_admin'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className={`w-4 h-4 ${selectedRole === 'aicte_admin' ? 'text-blue-700' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs text-slate-900">AICTE Administrator</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  All-India registry, cross-college duplicate alerts, and intake ceiling audits.
                </p>
              </button>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {/* Institution Selector for College Admin */}
            {selectedRole === 'college_admin' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Registered AICTE Institution
                </label>
                <select
                  value={selectedInstId}
                  onChange={e => handleInstitutionSelect(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                >
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.city}, {inst.state}) - Code: {inst.code}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Institutional Email / Nodal Officer ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Portal Security PIN / Passphrase
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-lg text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                selectedRole === 'aicte_admin'
                  ? 'bg-blue-800 hover:bg-blue-900'
                  : 'bg-teal-700 hover:bg-teal-800'
              }`}
            >
              <span>Authenticate and Launch Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Hackathon Demo Evaluator Section */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Evaluation Presets:
              </span>
              {onOpenRegister && (
                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose();
                    onOpenRegister();
                  }}
                  className="text-teal-700 hover:text-teal-900 font-semibold"
                >
                  Register New Institution →
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={loginQuickAicte}
                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-left cursor-pointer transition-colors"
              >
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  AICTE National Admin
                </div>
                <div className="text-[10px] text-blue-700/80">Dr. Vinod Sharma (Director)</div>
              </button>

              <button
                type="button"
                onClick={() => loginQuickCollege('inst-dtu')}
                className="p-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-left cursor-pointer transition-colors"
              >
                <div className="font-bold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-700" />
                  College Admin (DTU)
                </div>
                <div className="text-[10px] text-teal-700/80">Dr. Rameshwar (Dean)</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
