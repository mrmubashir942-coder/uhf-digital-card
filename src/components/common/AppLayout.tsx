import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UHFLogo } from './UHFLogo.tsx';
import { FloatingQuickActions } from './FloatingQuickActions.tsx';
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  Building,
  CreditCard,
  QrCode,
  SmartphoneNfc,
  ExternalLink,
  LogOut,
  ChevronDown,
  Menu,
  X,
  User,
  Shield,
  FileDown,
  CheckCircle2,
} from 'lucide-react';

interface AppLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPath,
  onNavigate,
  children,
}) => {
  const { user, profile, isAdmin, isEmployee, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleNav = (path: string) => {
    onNavigate(path);
    setSidebarOpen(false);
    setProfileDropdownOpen(false);
  };

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    onNavigate('/login');
  };

  const isNavActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return currentPath === '/admin/dashboard' || currentPath === '/';
    }
    if (path === '/admin/employees') {
      return currentPath.startsWith('/admin/employees') && currentPath !== '/admin/employees/new';
    }
    if (path === '/employee/dashboard') {
      return currentPath === '/employee/dashboard' || currentPath === '/';
    }
    return currentPath === path;
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#0F172A] flex flex-col font-sans antialiased">
      {/* 1. TOP HEADER (White, Clean, Professional) */}
      <header className="sticky top-0 z-30 w-full bg-white border-b border-[#E5E7EB] shadow-xs print:hidden">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Header Left: Mobile Toggle & Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => handleNav(isAdmin ? '/admin/dashboard' : '/employee/dashboard')}
              className="cursor-pointer select-none"
            >
              <UHFLogo size="sm" showBadge={true} />
            </div>

            {/* Top Navigation Tabs for Quick Switch (as seen in Reference Screenshot) */}
            <nav className="hidden xl:flex items-center gap-1.5 ml-6 pl-6 border-l border-[#E5E7EB]">
              {isAdmin ? (
                <>
                  <button
                    onClick={() => handleNav('/admin/dashboard')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isNavActive('/admin/dashboard')
                        ? 'bg-blue-50 text-[#2563EB] border border-blue-200/80'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => handleNav('/admin/employees')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isNavActive('/admin/employees')
                        ? 'bg-blue-50 text-[#2563EB] border border-blue-200/80'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Employees</span>
                  </button>

                  <button
                    onClick={() => handleNav('/admin/employees/new')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isNavActive('/admin/employees/new')
                        ? 'bg-blue-50 text-[#2563EB] border border-blue-200/80'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Add Employee</span>
                  </button>

                  <button
                    onClick={() => handleNav('/admin/company-settings')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isNavActive('/admin/company-settings')
                        ? 'bg-blue-50 text-[#2563EB] border border-blue-200/80'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Company Settings</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleNav('/employee/dashboard')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isNavActive('/employee/dashboard')
                        ? 'bg-blue-50 text-[#2563EB] border border-blue-200/80'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => handleNav('/employee/profile')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isNavActive('/employee/profile')
                        ? 'bg-blue-50 text-[#2563EB] border border-blue-200/80'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => handleNav('/employee/qr')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isNavActive('/employee/qr')
                        ? 'bg-blue-50 text-[#2563EB] border border-blue-200/80'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR Badge</span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Header Right: Public Card button & User Profile */}
          <div className="flex items-center gap-3">
            {/* Public Card shortcut button */}
            <button
              onClick={() => handleNav(user?.employeeId ? `/card/${user.employeeId}` : '/card/UHF-001')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-blue-50/60 hover:border-blue-300 text-xs font-semibold text-[#0F172A] shadow-2xs transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="hidden sm:inline">Public Card</span>
            </button>

            {/* User Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer select-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1D4ED8] to-[#2563EB] text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden border border-white">
                  {profile?.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt={user?.fullName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{(user?.fullName || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className="hidden md:flex flex-col text-left leading-tight">
                  <span className="font-bold text-xs text-[#0F172A]">
                    {user?.fullName || 'Usman Farooqui'}
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    {user?.employeeId || 'ADMIN-001'} •{' '}
                    <span className="text-[#2563EB] font-bold">{user?.role || 'ADMIN'}</span>
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-[#64748B] hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#E5E7EB] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  <div className="px-4 py-2 border-b border-[#E5E7EB] mb-1">
                    <p className="font-bold text-[#0F172A]">{user?.fullName}</p>
                    <p className="text-[11px] text-[#64748B] font-mono">{user?.email}</p>
                  </div>

                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => handleNav('/admin/company-settings')}
                        className="w-full flex items-center gap-2 px-4 py-2 text-[#334155] hover:bg-blue-50 hover:text-[#2563EB] transition-colors"
                      >
                        <Building className="w-4 h-4" />
                        <span>Company Settings</span>
                      </button>
                      <button
                        onClick={() => handleNav('/admin/employees')}
                        className="w-full flex items-center gap-2 px-4 py-2 text-[#334155] hover:bg-blue-50 hover:text-[#2563EB] transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        <span>Employees Directory</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleNav('/employee/profile')}
                        className="w-full flex items-center gap-2 px-4 py-2 text-[#334155] hover:bg-blue-50 hover:text-[#2563EB] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                      <button
                        onClick={() => handleNav('/employee/card')}
                        className="w-full flex items-center gap-2 px-4 py-2 text-[#334155] hover:bg-blue-50 hover:text-[#2563EB] transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>View Digital Card</span>
                      </button>
                    </>
                  )}

                  <div className="border-t border-[#E5E7EB] my-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: Left Sidebar + Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR BACKDROP (Mobile) */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden animate-in fade-in"
          />
        )}

        {/* LEFT SIDEBAR (Dark Navy Corporate Theme as in Reference Screenshot) */}
        <aside
          className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-gradient-to-b from-[#0F172A] via-[#0B132B] to-[#0A0F1D] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-slate-800 print:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Top Brand (Mobile Close Button) */}
          <div>
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
              <UHFLogo size="sm" variant="dark" showBadge={false} />
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Menu */}
            <div className="p-4 space-y-1">
              {isAdmin ? (
                <>
                  {/* Dashboard Link */}
                  <button
                    onClick={() => handleNav('/admin/dashboard')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isNavActive('/admin/dashboard')
                        ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>

                  {/* Employees Link */}
                  <button
                    onClick={() => handleNav('/admin/employees')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isNavActive('/admin/employees')
                        ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Employees</span>
                  </button>

                  {/* Add Employee Link */}
                  <button
                    onClick={() => handleNav('/admin/employees/new')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isNavActive('/admin/employees/new')
                        ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Employee</span>
                  </button>

                  {/* Company Settings Link */}
                  <button
                    onClick={() => handleNav('/admin/company-settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isNavActive('/admin/company-settings')
                        ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>Company Settings</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Employee Links */}
                  <button
                    onClick={() => handleNav('/employee/dashboard')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isNavActive('/employee/dashboard')
                        ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => handleNav('/employee/profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isNavActive('/employee/profile')
                        ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => handleNav('/employee/card')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isNavActive('/employee/card')
                        ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Digital Card</span>
                  </button>

                  <button
                    onClick={() => handleNav('/employee/qr')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isNavActive('/employee/qr')
                        ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR Codes</span>
                  </button>

                  <button
                    onClick={() => handleNav('/employee/nfc')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isNavActive('/employee/nfc')
                        ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <SmartphoneNfc className="w-4 h-4" />
                    <span>NFC Tap Sharing</span>
                  </button>
                </>
              )}

              {/* QUICK ACCESS SECTION */}
              <div className="pt-6 pb-2 px-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Quick Access
                </span>
              </div>

              <button
                onClick={() => handleNav(user?.employeeId ? `/card/${user.employeeId}` : '/card/UHF-001')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-[#38BDF8]" />
                <span>Public Card</span>
              </button>

              <button
                onClick={() => handleNav(isAdmin ? '/admin/dashboard' : '/employee/qr')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[#38BDF8]" />
                <span>QR Codes</span>
              </button>

              <button
                onClick={() => handleNav(user?.employeeId ? `/card/${user.employeeId}` : '/card/UHF-001')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-[#38BDF8]" />
                <span>vCard Generator</span>
              </button>
            </div>
          </div>

          {/* Sidebar Bottom: Logo + Slogan + Version */}
          <div className="p-4 m-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm">
                U
              </div>
              <div>
                <p className="font-bold text-xs text-white leading-tight">UHF Solutions</p>
                <p className="text-[10px] text-slate-400">Connecting People Digitally</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
              <span>Digital Card System</span>
              <span className="font-mono">v1.0.0</span>
            </div>
          </div>
        </aside>

        {/* MAIN PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto">
          {children}

          {/* Bottom Footer bar as in Reference Screenshot */}
          <footer className="mt-12 py-4 px-6 border-t border-[#E5E7EB] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] print:hidden">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 font-medium text-[#334155]">
                <span>© 2026 UHF Solutions Digital Card System</span>
                <span className="text-[#94A3B8]">•</span>
                <span className="font-mono text-[#64748B] text-[11px]">v1.0.0</span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Developed by <span className="font-medium text-[#2563EB]">Muhammad Mubashir</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-emerald-600 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>System Online</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Floating Action Menu (Right edge) */}
      <FloatingQuickActions onNavigate={handleNav} isAdmin={isAdmin} />
    </div>
  );
};
