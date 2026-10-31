/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { CollegeDashboard } from './components/dashboard/CollegeDashboard';
import { AicteDashboard } from './components/dashboard/AicteDashboard';
import { StudentManagement } from './components/students/StudentManagement';
import { DataUploadView } from './components/upload/DataUploadView';
import { ValidationReportsView } from './components/validation/ValidationReportsView';
import { DuplicateDetectionView } from './components/duplicates/DuplicateDetectionView';
import { IntakeMonitoringView } from './components/intake/IntakeMonitoringView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { ReportsView } from './components/reports/ReportsView';
import { InstitutionDirectoryView } from './components/institutions/InstitutionDirectoryView';
import { InstitutionSettingsView } from './components/settings/InstitutionSettingsView';
import { InstitutionRegistrationModal } from './components/institutions/InstitutionRegistrationModal';
import { LoginView } from './components/auth/LoginView';
import { ApiDemoVerifier } from './components/validation/ApiDemoVerifier';
import { ApaarRegistryPortal } from './components/apaar/ApaarRegistryPortal';
import { ApaarNoticeBanner } from './components/apaar/ApaarNoticeBanner';

interface MainLayoutProps {
  onSwitchToApaarRegistry: () => void;
}

function MainLayout({ onSwitchToApaarRegistry }: MainLayoutProps) {
  const { activeTab, currentUser, theme } = useApp();
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const isAicte = currentUser.role === 'aicte_admin';

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
      case 'dashboard':
        return isAicte ? <AicteDashboard /> : <CollegeDashboard />;
      case 'students':
        return <StudentManagement />;
      case 'upload':
        return <DataUploadView />;
      case 'validation':
        return <ValidationReportsView />;
      case 'api-verifier':
        return <ApiDemoVerifier />;
      case 'duplicates':
        return <DuplicateDetectionView />;
      case 'intake':
        return <IntakeMonitoringView />;
      case 'reports':
        return <ReportsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'institutions':
        return <InstitutionDirectoryView onOpenRegister={() => setRegisterModalOpen(true)} />;
      case 'settings':
        return <InstitutionSettingsView />;
      default:
        return isAicte ? <AicteDashboard /> : <CollegeDashboard />;
    }
  };

  return (
    <div
      data-theme={theme}
      className={`min-h-screen flex flex-col transition-colors duration-150 ${
        theme === 'executive-dark' ? 'bg-[#090d16] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Persistent Demo Notice Banner */}
      <ApaarNoticeBanner />

      <Navbar
        onOpenRegisterInst={() => setRegisterModalOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onSwitchToApaarRegistry={onSwitchToApaarRegistry}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Clean 8-Section Sidebar */}
        <Sidebar />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      {registerModalOpen && (
        <InstitutionRegistrationModal onClose={() => setRegisterModalOpen(false)} />
      )}

      {loginModalOpen && (
        <LoginView
          onClose={() => setLoginModalOpen(false)}
          onOpenRegister={() => {
            setLoginModalOpen(false);
            setRegisterModalOpen(true);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  const [portalMode, setPortalMode] = useState<'apaar_registry' | 'aicte_portal'>('apaar_registry');

  return (
    <AppProvider>
      {portalMode === 'apaar_registry' ? (
        <ApaarRegistryPortal onSwitchToAictePortal={() => setPortalMode('aicte_portal')} />
      ) : (
        <MainLayout onSwitchToApaarRegistry={() => setPortalMode('apaar_registry')} />
      )}
    </AppProvider>
  );
}
