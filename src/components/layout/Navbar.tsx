import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  UserCheck,
  RotateCcw,
  Plus,
  ChevronDown,
  Palette,
  Check,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  onOpenRegisterInst: () => void;
  onOpenLoginModal: () => void;
  onSwitchToApaarRegistry?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRegisterInst,
  onOpenLoginModal,
  onSwitchToApaarRegistry
}) => {
  const {
    currentUser,
    institutions,
    currentInstitution,
    switchRole,
    switchInstitution,
    resetAllData,
    activeTab,
    setActiveTab,
    theme,
    setTheme,
    availableThemes
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const isAicte = currentUser.role === 'aicte_admin';

  const activeThemeObj = availableThemes.find(t => t.id === theme) || availableThemes[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80">
      {/* Top Visual Theme Accent Stripe */}
      {theme === 'bharat-royal' && (
        <div className="h-0.5 bg-gradient-to-r from-orange-500 via-amber-300 to-emerald-600" />
      )}
      {theme === 'digital-indigo' && (
        <div className="h-0.5 bg-gradient-to-r from-indigo-600 via-sky-400 to-teal-500" />
      )}
      {theme === 'academic-emerald' && (
        <div className="h-0.5 bg-gradient-to-r from-emerald-700 via-emerald-400 to-amber-500" />
      )}
      {theme === 'minimal-slate' && (
        <div className="h-0.5 bg-gradient-to-r from-slate-700 via-blue-500 to-slate-400" />
      )}
      {theme === 'executive-dark' && (
        <div className="h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" />
      )}

      {/* Main Clean Header */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/src/assets/images/aicte_emblem_insignia_1793373599365.jpg"
            alt="AICTE Insignia"
            referrerPolicy="no-referrer"
            className="w-9 h-9 object-contain rounded-md border border-slate-200/80 shadow-2xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                APAAR
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-medium text-slate-500">
                Student Verification Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              AICTE Approved Institutions · SIH 2026
            </p>
          </div>
        </div>

        {/* Center: Precision Role Switcher Segmented Control */}
        <div className="hidden md:flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/70">
          <button
            onClick={() => {
              if (isAicte) {
                switchRole('college_admin', institutions[0]?.id);
                setActiveTab('overview');
              }
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              !isAicte
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 ${!isAicte ? 'text-slate-900' : 'text-slate-400'}`} />
            <span>College Portal</span>
          </button>

          <button
            onClick={() => {
              if (!isAicte) {
                switchRole('aicte_admin');
                setActiveTab('overview');
              }
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              isAicte
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isAicte ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>AICTE Central Office</span>
          </button>
        </div>

        {/* Right Action: Reset + Theme + College / Role Actions */}
        <div className="flex items-center gap-2">
          {onSwitchToApaarRegistry && (
            <button
              onClick={onSwitchToApaarRegistry}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>APAAR Registry Portal</span>
            </button>
          )}

          {/* Quick Reset Demo button */}
          <button
            onClick={resetAllData}
            title="Reset demo data back to default state"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden xl:inline text-[11px]">Reset Demo</span>
          </button>

          {/* Theme Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setThemeDropdownOpen(!themeDropdownOpen);
                setRoleDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Change visual theme"
            >
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              <span className="flex items-center gap-1 text-slate-800">
                <span>{activeThemeObj.flagEmoji}</span>
                <span className="hidden lg:inline">{activeThemeObj.name}</span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {themeDropdownOpen && (
              <div
                className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
                onMouseLeave={() => setThemeDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <span>Visual Theme</span>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </div>

                <div className="p-1 space-y-0.5">
                  {availableThemes.map(t => {
                    const isSelected = t.id === theme;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 text-slate-950 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-base leading-none">{t.flagEmoji}</span>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{t.name}</span>
                              {t.id === 'bharat-royal' && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold uppercase">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                              {t.tagline}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 pl-2">
                          <div className="flex -space-x-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white shadow-2xs"
                              style={{ backgroundColor: t.previewColors.primary }}
                            />
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white shadow-2xs"
                              style={{ backgroundColor: t.previewColors.accent }}
                            />
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 ml-1" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* College Selector or AICTE Badge */}
          {!isAicte ? (
            <div className="relative">
              <button
                onClick={() => {
                  setRoleDropdownOpen(!roleDropdownOpen);
                  setThemeDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <div className="text-left max-w-[140px] sm:max-w-[180px] truncate">
                  <span className="truncate block font-semibold text-slate-900 text-xs leading-tight">
                    {currentInstitution.name}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono leading-tight">
                    Code: {currentInstitution.code}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    Switch College Campus
                  </div>

                  {institutions.map(inst => (
                    <button
                      key={inst.id}
                      onClick={() => {
                        switchInstitution(inst.id);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                        currentInstitution.id === inst.id ? 'bg-slate-100 text-slate-950 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-900">{inst.name}</div>
                        <div className="text-[11px] text-slate-400">{inst.city}, {inst.state} · Code: {inst.code}</div>
                      </div>
                    </button>
                  ))}

                  <div className="pt-2 mt-1 border-t border-slate-100 px-2 space-y-1">
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onOpenRegisterInst();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-slate-800 hover:bg-slate-100 flex items-center gap-1.5 font-semibold text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register a New College</span>
                    </button>
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onOpenLoginModal();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 text-xs cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Open Login Screen</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <span>AICTE Central Directorate</span>
              </span>
              <button
                onClick={onOpenLoginModal}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Switch Role
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
