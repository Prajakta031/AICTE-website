import React from 'react';
import {
  LayoutDashboard,
  Users,
  UploadCloud,
  FileCheck2,
  Bell,
  Settings,
  Building,
  AlertTriangle,
  ClipboardCheck,
  FileBarChart,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    alerts,
    corrections,
    students,
    currentInstitution
  } = useApp();

  const isAicte = currentUser.role === 'aicte_admin';

  // Alerts badge counts
  const collegeUnresolvedAlerts = alerts.filter(
    a => !a.isResolved && a.institutionId === currentUser.institutionId
  ).length;

  const aicteUnresolvedAlerts = alerts.filter(a => !a.isResolved).length;

  const pendingCorrectionsCount = corrections.filter(c => c.status === 'pending').length;

  // Flagged records count for current college
  const flaggedStudentsCount = students.filter(
    s => s.institutionId === currentUser.institutionId && (s.validationStatus === 'error' || s.validationStatus === 'review')
  ).length;

  const collegeNavItems = [
    { id: 'dashboard', label: 'College Dashboard', icon: LayoutDashboard },
    {
      id: 'students',
      label: 'Student Records',
      icon: Users,
      badge: flaggedStudentsCount > 0 ? `${flaggedStudentsCount} flagged` : undefined,
      badgeType: 'warning'
    },
    { id: 'upload', label: 'Upload Data (CSV/Excel)', icon: UploadCloud },
    { id: 'validation', label: 'Validation Reports', icon: FileCheck2 },
    {
      id: 'notifications',
      label: 'Alerts & Notifications',
      icon: Bell,
      badge: collegeUnresolvedAlerts > 0 ? String(collegeUnresolvedAlerts) : undefined,
      badgeType: 'danger'
    },
    { id: 'settings', label: 'Institution Profile', icon: Settings }
  ];

  const aicteNavItems = [
    { id: 'dashboard', label: 'National Dashboard', icon: LayoutDashboard },
    { id: 'institutions', label: 'Institution Directory', icon: Building },
    { id: 'students', label: 'Master Student Registry', icon: Users },
    {
      id: 'duplicates',
      label: 'Cross-College Duplicates',
      icon: AlertTriangle,
      badge: 'Active Audit',
      badgeType: 'warning'
    },
    {
      id: 'corrections',
      label: 'Correction Requests',
      icon: ClipboardCheck,
      badge: pendingCorrectionsCount > 0 ? String(pendingCorrectionsCount) : undefined,
      badgeType: 'danger'
    },
    { id: 'reports', label: 'Consolidated Reports', icon: FileBarChart },
    {
      id: 'notifications',
      label: 'National Compliance Alerts',
      icon: Bell,
      badge: aicteUnresolvedAlerts > 0 ? String(aicteUnresolvedAlerts) : undefined,
      badgeType: 'danger'
    }
  ];

  const currentNavItems = isAicte ? aicteNavItems : collegeNavItems;

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 shrink-0 flex flex-col justify-between border-r border-slate-800 select-none">
      <div className="p-4 space-y-6">
        {/* User Role Card */}
        <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs ${
              isAicte ? 'bg-blue-600 text-white' : 'bg-teal-600 text-white'
            }`}>
              {isAicte ? 'AICTE' : 'COL'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {isAicte ? 'National Directorate' : currentInstitution.name}
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
            <span>Role:</span>
            <span className={`font-medium ${isAicte ? 'text-blue-400' : 'text-teal-400'}`}>
              {isAicte ? 'AICTE Administrator' : 'College Administrator'}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
            {isAicte ? 'AICTE Oversight Modules' : 'Institutional Workflows'}
          </div>

          <nav className="space-y-1 mt-2">
            {currentNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 font-semibold border-l-2 border-teal-400 rounded-l-none'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        item.badgeType === 'danger'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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

        {/* NEP 2020 & APAAR Policy Callout */}
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/40 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>NEP 2020 Mandate</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Automated Permanent Academic Account Registry (One Nation, One Student ID) validation and intake ceiling monitoring.
          </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-500 flex flex-col gap-1">
        <div className="flex items-center justify-between text-slate-400 font-medium">
          <span>Smart India Hackathon</span>
          <span className="font-mono text-teal-400">SIH26263</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span>Team Infinity</span>
          <span className="text-slate-500">v2.6 Stable</span>
        </div>
      </div>
    </aside>
  );
};
