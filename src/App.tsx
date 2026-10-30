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
import { NotificationsView } from './components/notifications/NotificationsView';
import { ReportsView } from './components/reports/ReportsView';
import { CrossInstitutionDuplicatesView } from './components/duplicates/CrossInstitutionDuplicatesView';
import { InstitutionDirectoryView } from './components/institutions/InstitutionDirectoryView';
import { InstitutionSettingsView } from './components/settings/InstitutionSettingsView';
import { InstitutionRegistrationModal } from './components/institutions/InstitutionRegistrationModal';
import { LoginView } from './components/auth/LoginView';

function MainLayout() {
  const { activeTab, currentUser } = useApp();
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const isAicte = currentUser.role === 'aicte_admin';

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return isAicte ? <AicteDashboard /> : <CollegeDashboard />;
      case 'students':
        return <StudentManagement />;
      case 'upload':
        return <DataUploadView />;
      case 'validation':
        return <ValidationReportsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'reports':
        return <ReportsView />;
      case 'duplicates':
        return <CrossInstitutionDuplicatesView />;
      case 'institutions':
        return <InstitutionDirectoryView onOpenRegister={() => setRegisterModalOpen(true)} />;
      case 'corrections':
        return <AicteDashboard />;
      case 'settings':
        return <InstitutionSettingsView />;
      default:
        return isAicte ? <AicteDashboard /> : <CollegeDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar
        onOpenRegisterInst={() => setRegisterModalOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
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
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
