import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { PublicDigitalCard } from './components/card/PublicDigitalCard.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { AdminEmployeesPage } from './pages/admin/AdminEmployees.tsx';
import { AdminAddEmployeePage } from './pages/admin/AdminAddEmployee.tsx';
import { AdminEditEmployeePage } from './pages/admin/AdminEditEmployee.tsx';
import { AdminCompanySettingsPage } from './pages/admin/AdminCompanySettings.tsx';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard.tsx';
import { EmployeeProfilePage } from './pages/employee/EmployeeProfile.tsx';
import { EmployeeQRCodePage } from './pages/employee/EmployeeQRCode.tsx';
import { EmployeeNFCPage } from './pages/employee/EmployeeNFC.tsx';
import { EmployeeSettingsPage } from './pages/employee/EmployeeSettings.tsx';
import { tokenStorage } from './lib/api.ts';

function AppContent() {
  const { user, isLoading, isAdmin, isEmployee } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Handle browser popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // If loading session token, show clean spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center text-[#111827]">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-2xl text-white mb-4 shadow-md shadow-blue-500/20 animate-bounce">
          U
        </div>
        <p className="text-sm font-semibold tracking-wide text-[#64748B]">
          UHF Solutions Digital Card...
        </p>
      </div>
    );
  }

  // 1. PUBLIC CARD ROUTE: /card/:employeeId
  if (currentPath.startsWith('/card/')) {
    const employeeId = currentPath.replace('/card/', '').split('/')[0] || 'UHF-001';
    return (
      <PublicDigitalCard
        employeeId={employeeId}
        onBackToApp={() => {
          if (user) {
            navigate(isAdmin ? '/admin/dashboard' : '/employee/dashboard');
          } else {
            navigate('/login');
          }
        }}
      />
    );
  }

  // 2. UNATHENTICATED / LOGIN
  if (!user) {
    return (
      <LoginPage
        onLoginSuccess={(role) => {
          navigate(role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard');
        }}
        onViewSampleCard={() => navigate('/card/UHF-001')}
      />
    );
  }

  // 3. AUTHENTICATED PAGES WITH NAVBAR
  const renderAuthenticatedPage = () => {
    // ADMIN ROUTES
    if (isAdmin) {
      if (currentPath === '/admin/dashboard' || currentPath === '/' || currentPath === '/login') {
        return <AdminDashboard onNavigate={navigate} />;
      }
      if (currentPath === '/admin/employees') {
        return <AdminEmployeesPage onNavigate={navigate} />;
      }
      if (currentPath === '/admin/employees/new') {
        return <AdminAddEmployeePage onNavigate={navigate} />;
      }
      if (currentPath.startsWith('/admin/employees/') && currentPath.endsWith('/edit')) {
        const id = currentPath.replace('/admin/employees/', '').replace('/edit', '');
        return <AdminEditEmployeePage employeeIdOrDbId={id} onNavigate={navigate} />;
      }
      if (currentPath === '/admin/company-settings') {
        return <AdminCompanySettingsPage onNavigate={navigate} />;
      }
      // If admin navigates to employee route, show dashboard
      return <AdminDashboard onNavigate={navigate} />;
    }

    // EMPLOYEE ROUTES
    if (isEmployee) {
      if (currentPath === '/employee/dashboard' || currentPath === '/' || currentPath === '/login') {
        return <EmployeeDashboard onNavigate={navigate} />;
      }
      if (currentPath === '/employee/profile') {
        return <EmployeeProfilePage onNavigate={navigate} />;
      }
      if (currentPath === '/employee/card') {
        return (
          <div className="py-6">
            <PublicDigitalCard
              employeeId={user.employeeId}
              onBackToApp={() => navigate('/employee/dashboard')}
            />
          </div>
        );
      }
      if (currentPath === '/employee/qr') {
        return <EmployeeQRCodePage onNavigate={navigate} />;
      }
      if (currentPath === '/employee/nfc') {
        return <EmployeeNFCPage onNavigate={navigate} />;
      }
      if (currentPath === '/employee/settings') {
        return <EmployeeSettingsPage onNavigate={navigate} />;
      }
      // Default to employee dashboard
      return <EmployeeDashboard onNavigate={navigate} />;
    }

    return <LoginPage onLoginSuccess={() => navigate('/')} />;
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#111827] flex flex-col font-sans">
      <Navbar currentPath={currentPath} onNavigate={navigate} />
      <main className="flex-1">{renderAuthenticatedPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
