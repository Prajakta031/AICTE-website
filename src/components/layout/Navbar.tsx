import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  UserCheck,
  RotateCcw,
  Plus,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  onOpenRegisterInst: () => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRegisterInst, onOpenLoginModal }) => {
  const {
    currentUser,
    institutions,
    currentInstitution,
    switchRole,
    switchInstitution,
    resetAllData,
    activeTab,
    setActiveTab
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top National Announcement Bar */}
      <div className="bg-slate-900 text-slate-300 px-4 sm:px-6 py-1.5 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-400">SIH 2026</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">Problem Statement: SIH26263 (AICTE APAAR Platform)</span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline">Team Infinity</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="hidden sm:inline">Academic Year: 2025-26</span>
          <button
            onClick={resetAllData}
            title="Reset data to default mock records"
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Main Nav Bar following Top Bar Contract: Zone 1 (Brand), Zone 2 (Context/Nav), Zone 3 (Action/User) */}
      <div className="flex items-center justify-between gap-4 md:gap-8 px-4 sm:px-6 py-3">
        {/* Zone 1: Single text element wordmark with emblem */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/src/assets/images/aicte_emblem_insignia_1793373599365.jpg"
            alt="AICTE Seal"
            referrerPolicy="no-referrer"
            className="w-10 h-10 object-contain rounded-full border border-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                APAAR
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                AICTE Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-none mt-0.5 truncate max-w-[220px] sm:max-w-none">
              Student Data Management & Verification Portal
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation context / Institution Indicator */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-600 truncate">
          {currentUser.role === 'college_admin' ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md">
              <Building2 className="w-3.5 h-3.5 text-teal-700" />
              <span className="font-semibold text-slate-900 truncate max-w-[260px]">
                {currentInstitution.name}
              </span>
              <span className="text-slate-400">·</span>
              <span className="font-mono text-slate-500 text-[11px]">{currentInstitution.code}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-md text-blue-900">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span className="font-semibold">AICTE Central Bureau</span>
              <span className="text-blue-400">·</span>
              <span className="text-[11px] text-blue-700">All India Institutional Oversight</span>
            </div>
          )}
        </div>

        {/* Zone 3: User Role Switcher & Primary Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-slate-900 text-xs">
                  {currentUser.role === 'aicte_admin' ? 'AICTE Admin' : 'College Admin'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 text-xs"
                onMouseLeave={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  Switch Active Role
                </div>

                {/* Switch to AICTE Admin */}
                <button
                  onClick={() => {
                    switchRole('aicte_admin');
                    setRoleDropdownOpen(false);
                    setActiveTab('dashboard');
                  }}
                  className={`w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                    currentUser.role === 'aicte_admin' ? 'bg-blue-50/70 text-blue-900 font-medium' : 'text-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">AICTE National Admin</div>
                    <div className="text-[11px] text-slate-500">Centralized All-India Oversight & Audits</div>
                  </div>
                </button>

                <div className="px-3 py-1.5 border-t border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider mt-1">
                  Switch College Institution
                </div>

                {/* College switchers */}
                {institutions.map(inst => (
                  <button
                    key={inst.id}
                    onClick={() => {
                      switchRole('college_admin', inst.id);
                      setRoleDropdownOpen(false);
                      setActiveTab('dashboard');
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-start gap-2 hover:bg-slate-50 transition-colors ${
                      currentUser.role === 'college_admin' && currentUser.institutionId === inst.id
                        ? 'bg-teal-50/70 text-teal-900 font-medium'
                        : 'text-slate-700'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                    <div className="truncate">
                      <div className="truncate font-medium">{inst.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{inst.city}, {inst.state}</div>
                    </div>
                  </button>
                ))}

                <div className="pt-2 mt-1 border-t border-slate-100 px-2 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      onOpenRegisterInst();
                    }}
                    className="w-full text-left px-2 py-1.5 rounded text-teal-700 hover:bg-teal-50 flex items-center gap-1.5 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Register New Institution
                  </button>
                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      onOpenLoginModal();
                    }}
                    className="w-full text-left px-2 py-1.5 rounded text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Role Sign-in Modal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
