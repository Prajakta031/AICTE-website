import React from 'react';
import {
  LayoutDashboard,
  Users,
  UploadCloud,
  FileCheck2,
  Copy,
  Layers,
  FileBarChart,
  Bell,
  Building,
  ShieldCheck,
  Building2,
  HelpCircle,
  Sparkles,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    alerts,
    students,
    currentInstitution,
    theme
  } = useApp();

  const isAicte = currentUser.role === 'aicte_admin';

  // Alerts badge counts
  const collegeUnresolvedAlerts = alerts.filter(
    a => !a.isResolved && a.institutionId === currentUser.institutionId
  ).length;

  const aicteUnresolvedAlerts = alerts.filter(a => !a.isResolved).length;

  // Flagged records count
  const flaggedCount = students.filter(
    s => (isAicte || s.institutionId === currentUser.institutionId) &&
         (s.validationStatus === 'error' || s.validationStatus === 'review')
  ).length;

  // Duplicate count
  const duplicateCount = students.filter(
    s => (isAicte || s.institutionId === currentUser.institutionId) &&
         s.validationChecks?.some(c => (c.ruleId === 'RULE_LOCAL_DUPLICATE' || c.ruleId === 'RULE_CROSS_INSTITUTION_DUPLICATE') && !c.passed)
  ).length;

  // Theme-specific styles
  const getThemeClasses = () => {
    switch (theme) {
      case 'bharat-royal':
        return {
          activeBtn: 'bg-orange-50/90 text-orange-950 font-bold border border-orange-200/90 shadow-2xs',
          activeIcon: 'text-orange-600',
          avatarBg: isAicte ? 'bg-slate-900 text-amber-300' : 'bg-orange-600 text-white',
          bottomTag: 'text-orange-600'
        };
      case 'digital-indigo':
        return {
          activeBtn: 'bg-indigo-50 text-indigo-950 font-bold border border-indigo-200 shadow-2xs',
          activeIcon: 'text-indigo-600',
          avatarBg: isAicte ? 'bg-slate-900 text-sky-300' : 'bg-indigo-700 text-white',
          bottomTag: 'text-indigo-600'
        };
      case 'academic-emerald':
        return {
          activeBtn: 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200 shadow-2xs',
          activeIcon: 'text-emerald-700',
          avatarBg: isAicte ? 'bg-emerald-950 text-amber-300' : 'bg-emerald-700 text-white',
          bottomTag: 'text-emerald-700'
        };
      case 'minimal-slate':
        return {
          activeBtn: 'bg-slate-100 text-slate-950 font-bold border border-slate-300 shadow-2xs',
          activeIcon: 'text-blue-600',
          avatarBg: isAicte ? 'bg-slate-900 text-slate-100' : 'bg-slate-700 text-white',
          bottomTag: 'text-blue-600'
        };
      case 'executive-dark':
        return {
          activeBtn: 'bg-slate-800 text-amber-300 font-bold border border-amber-500/40 shadow-2xs',
          activeIcon: 'text-amber-400',
          avatarBg: isAicte ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400 border border-slate-700',
          bottomTag: 'text-amber-400'
        };
      default:
        return {
          activeBtn: 'bg-orange-50 text-orange-950 font-bold border border-orange-200 shadow-2xs',
          activeIcon: 'text-orange-600',
          avatarBg: isAicte ? 'bg-slate-900 text-amber-300' : 'bg-orange-600 text-white',
          bottomTag: 'text-orange-600'
        };
    }
  };

  const themeClasses = getThemeClasses();


  // 8 Clear, Simple Sections for Non-Technical Users
  const collegeNavItems = [
    {
      id: 'overview',
      label: 'Overview',
      sub: 'Summary & quick numbers',
      icon: LayoutDashboard
    },
    {
      id: 'students',
      label: 'Student Records',
      sub: 'Search & view students',
      icon: Users
    },
    {
      id: 'upload',
      label: 'Upload Student Data',
      sub: 'Upload Excel or CSV file',
      icon: UploadCloud
    },
    {
      id: 'validation',
      label: 'Data Verification',
      sub: 'Check for errors & issues',
      icon: FileCheck2,
      badge: flaggedCount > 0 ? `${flaggedCount} issues` : undefined,
      badgeType: 'warning'
    },
    {
      id: 'api-verifier',
      label: 'API Demo Verifier',
      sub: 'POST /api/demo/verify',
      icon: Zap,
      badge: 'LIVE API',
      badgeType: 'api'
    },
    {
      id: 'duplicates',
      label: 'Duplicate Detection',
      sub: 'Find duplicate student IDs',
      icon: Copy,
      badge: duplicateCount > 0 ? `${duplicateCount}` : undefined,
      badgeType: 'danger'
    },
    {
      id: 'intake',
      label: 'Intake Monitoring',
      sub: 'Compare seats vs admissions',
      icon: Layers
    },
    {
      id: 'reports',
      label: 'Reports',
      sub: 'Download Excel or PDF',
      icon: FileBarChart
    },
    {
      id: 'notifications',
      label: 'Notifications',
      sub: 'Alerts & updates',
      icon: Bell,
      badge: collegeUnresolvedAlerts > 0 ? `${collegeUnresolvedAlerts}` : undefined,
      badgeType: 'danger'
    }
  ];

  const aicteNavItems = [
    {
      id: 'overview',
      label: 'National Overview',
      sub: 'All-India census & summary',
      icon: LayoutDashboard
    },
    {
      id: 'institutions',
      label: 'Colleges Directory',
      sub: 'Approved campuses & quotas',
      icon: Building
    },
    {
      id: 'students',
      label: 'Master Student List',
      sub: 'National student registry',
      icon: Users
    },
    {
      id: 'validation',
      label: 'Data Verification',
      sub: 'Check national compliance',
      icon: FileCheck2,
      badge: flaggedCount > 0 ? `${flaggedCount}` : undefined,
      badgeType: 'warning'
    },
    {
      id: 'api-verifier',
      label: 'API Demo Verifier',
      sub: 'POST /api/demo/verify',
      icon: Zap,
      badge: 'LIVE API',
      badgeType: 'api'
    },
    {
      id: 'duplicates',
      label: 'Duplicate Detection',
      sub: 'Dual college admissions',
      icon: Copy,
      badge: duplicateCount > 0 ? `${duplicateCount}` : undefined,
      badgeType: 'danger'
    },
    {
      id: 'intake',
      label: 'Intake Monitoring',
      sub: 'Colleges exceeding seats',
      icon: Layers
    },
    {
      id: 'reports',
      label: 'National Reports',
      sub: 'All-India audit dossiers',
      icon: FileBarChart
    },
    {
      id: 'notifications',
      label: 'Alerts & Appeals',
      sub: 'Review pending requests',
      icon: Bell,
      badge: aicteUnresolvedAlerts > 0 ? `${aicteUnresolvedAlerts}` : undefined,
      badgeType: 'danger'
    }
  ];

  const currentNavItems = isAicte ? aicteNavItems : collegeNavItems;

  return (
    <aside className="w-64 bg-white text-slate-800 shrink-0 flex flex-col justify-between border-r border-slate-200 select-none">
      <div className="p-3.5 space-y-4">
        {/* Simple User Identity Header */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs ${themeClasses.avatarBg}`}>
              {isAicte ? 'AICTE' : 'DTU'}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-slate-900 block truncate">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-slate-500 block truncate">
                {isAicte ? 'AICTE Director' : currentInstitution.name}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold tracking-wider uppercase text-slate-400">
            Navigation Menu
          </div>

          <nav className="space-y-1 pt-1">
            {currentNavItems.map(item => {
              const Icon = item.icon;
              const isTabActive = activeTab === item.id || (item.id === 'overview' && activeTab === 'dashboard');

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                    isTabActive
                      ? themeClasses.activeBtn
                      : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isTabActive ? themeClasses.activeIcon : 'text-slate-500'}`} />
                    <div>
                      <span className="text-xs font-semibold block leading-tight">{item.label}</span>
                      <span className="text-[10px] text-slate-500 block leading-tight font-normal">{item.sub}</span>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        item.badgeType === 'api'
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          : item.badgeType === 'danger'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Helpful Non-Tech Info at bottom */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50/60 text-xs text-slate-600 space-y-1">
        <div className="flex items-center justify-between font-semibold text-slate-800">
          <span>Smart India Hackathon</span>
          <span className={`font-mono font-bold ${themeClasses.bottomTag}`}>SIH 2026</span>
        </div>
        <div className="text-[11px] text-slate-500">
          Team Infinity · Problem SIH26263
        </div>
      </div>
    </aside>
  );
};
