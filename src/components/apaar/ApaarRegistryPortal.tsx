import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Zap,
  Clock,
  FileCode2,
  Settings,
  ShieldCheck,
  Building2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Plus
} from 'lucide-react';
import { ApaarNoticeBanner } from './ApaarNoticeBanner';
import { ApaarAdminDashboard } from './ApaarAdminDashboard';
import { ApaarStudentDatabase } from './ApaarStudentDatabase';
import { ApaarVerificationEngine } from './ApaarVerificationEngine';
import { ApaarVerificationHistory } from './ApaarVerificationHistory';
import { ApaarApiDocumentation } from './ApaarApiDocumentation';
import { ApaarSettings } from './ApaarSettings';
import { ApaarStudentModal } from './ApaarStudentModal';
import { createSyntheticRecord } from '../../services/apaarApi';

interface ApaarRegistryPortalProps {
  onSwitchToAictePortal?: () => void;
}

export const ApaarRegistryPortal: React.FC<ApaarRegistryPortalProps> = ({
  onSwitchToAictePortal
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Admin Dashboard',
      sub: 'Summary & verification metrics',
      icon: LayoutDashboard
    },
    {
      id: 'database',
      label: 'Student Database',
      sub: 'Search & manage synthetic records',
      icon: Users
    },
    {
      id: 'engine',
      label: 'Verification Engine',
      sub: 'Live 5-result verification bench',
      icon: Zap
    },
    {
      id: 'history',
      label: 'Verification History',
      sub: 'Masked audit logs & activity',
      icon: Clock
    },
    {
      id: 'docs',
      label: 'API Documentation',
      sub: 'REST endpoints & code snippets',
      icon: FileCode2
    },
    {
      id: 'settings',
      label: 'Settings',
      sub: 'API keys & database reset',
      icon: Settings
    }
  ];

  const handleSaveStudent = async (data: any) => {
    await createSyntheticRecord(data);
    setAddModalOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ApaarAdminDashboard
            onNavigate={tab => setActiveTab(tab)}
            onOpenAddModal={() => setAddModalOpen(true)}
          />
        );
      case 'database':
        return <ApaarStudentDatabase />;
      case 'engine':
        return <ApaarVerificationEngine />;
      case 'history':
        return <ApaarVerificationHistory />;
      case 'docs':
        return <ApaarApiDocumentation />;
      case 'settings':
        return <ApaarSettings />;
      default:
        return (
          <ApaarAdminDashboard
            onNavigate={tab => setActiveTab(tab)}
            onOpenAddModal={() => setAddModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* Persistent Notice Banner */}
      <ApaarNoticeBanner />

      {/* Government-Style Administrative Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 border border-indigo-400/40 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white leading-tight">
                  APAAR Demo Verification Registry
                </span>
                <span className="text-[10px] font-mono font-bold uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                  SIH 2026 DEMO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5">
                Simulated National Student ID Verification Authority · Team Infinity
              </p>
            </div>
          </div>

          {/* Right Controls: Portal Switcher to AICTE */}
          <div className="flex items-center gap-3">
            {onSwitchToAictePortal && (
              <button
                onClick={onSwitchToAictePortal}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm border border-indigo-400/30"
              >
                <span>Switch to AICTE Client Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Area: Sidebar + Content Viewport */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full overflow-hidden">
        {/* Government Style Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 shrink-0 p-4 space-y-4 select-none flex flex-col justify-between">
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-2">
              Registry Admin Menu
            </div>

            <nav className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-950 font-bold border border-indigo-200 shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <div className="truncate">
                      <span className="text-xs font-semibold block leading-tight">{item.label}</span>
                      <span className="text-[10px] text-slate-500 block leading-tight font-normal">{item.sub}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer Info */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-900 text-[11px]">
              <span>REST Service</span>
              <span className="text-emerald-600 font-mono">ONLINE</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Accepting verification queries on <span className="font-mono text-indigo-700">POST /api/demo/verify</span>
            </p>
          </div>
        </aside>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>

      {/* Add Modal */}
      {addModalOpen && (
        <ApaarStudentModal
          onSave={handleSaveStudent}
          onClose={() => setAddModalOpen(false)}
        />
      )}
    </div>
  );
};
