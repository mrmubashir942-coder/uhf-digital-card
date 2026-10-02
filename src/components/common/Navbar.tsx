import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  CreditCard,
  QrCode,
  Users,
  Building,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  ExternalLink,
  PlusCircle,
  LayoutDashboard,
  SmartphoneNfc,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { user, profile, isAdmin, isEmployee, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5E7EB] bg-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => handleNav(isAdmin ? '/admin/dashboard' : isEmployee ? '/employee/dashboard' : '/login')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2563EB] via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <span>U</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#111827]">
                UHF Solutions
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-100">
                Digital Card
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] font-medium">Enterprise Contact Identity</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {isAdmin && (
            <>
              <button
                onClick={() => handleNav('/admin/dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentPath === '/admin/dashboard'
                    ? 'bg-blue-50 text-[#2563EB] font-semibold'
                    : 'text-[#64748B] hover:text-[#111827] hover:bg-slate-50 font-medium'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleNav('/admin/employees')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentPath.startsWith('/admin/employees') && currentPath !== '/admin/employees/new'
                    ? 'bg-blue-50 text-[#2563EB] font-semibold'
                    : 'text-[#64748B] hover:text-[#111827] hover:bg-slate-50 font-medium'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Employees</span>
              </button>

              <button
                onClick={() => handleNav('/admin/employees/new')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentPath === '/admin/employees/new'
                    ? 'bg-blue-50 text-[#2563EB] font-semibold'
                    : 'text-[#64748B] hover:text-[#111827] hover:bg-slate-50 font-medium'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-[#2563EB]" />
                <span>Add Employee</span>
              </button>

              <button
                onClick={() => handleNav('/admin/company-settings')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentPath === '/admin/company-settings'
                    ? 'bg-blue-50 text-[#2563EB] font-semibold'
                    : 'text-[#64748B] hover:text-[#111827] hover:bg-slate-50 font-medium'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Company Settings</span>
              </button>
            </>
          )}

          {isEmployee && (
            <>
              <button
                onClick={() => handleNav('/employee/dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentPath === '/employee/dashboard'
                    ? 'bg-blue-50 text-[#2563EB] font-semibold'
                    : 'text-[#64748B] hover:text-[#111827] hover:bg-slate-50 font-medium'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleNav('/employee/profile')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentPath === '/employee/profile'
                    ? 'bg-blue-50 text-[#2563EB] font-semibold'
                    : 'text-[#64748B] hover:text-[#111827] hover:bg-slate-50 font-medium'
                }`}
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => handleNav('/employee/card')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentPath === '/employee/card'
                    ? 'bg-blue-50 text-[#2563EB] font-semibold'
                    : 'text-[#64748B] hover:text-[#111827] hover:bg-slate-50 font-medium'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Digital Card</span>
              </button>

              <button
                onClick={() => handleNav('/employee/qr')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentPath === '/employee/qr'
                    ? 'bg-blue-50 text-[#2563EB] font-semibold'
                    : 'text-[#64748B] hover:text-[#111827] hover:bg-slate-50 font-medium'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>My QR Code</span>
              </button>

              <button
                onClick={() => handleNav('/employee/nfc')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentPath === '/employee/nfc'
                    ? 'bg-blue-50 text-[#2563EB] font-semibold'
                    : 'text-[#64748B] hover:text-[#111827] hover:bg-slate-50 font-medium'
                }`}
              >
                <SmartphoneNfc className="w-4 h-4 text-[#2563EB]" />
                <span>NFC Sharing</span>
              </button>
            </>
          )}
        </nav>

        {/* User Badge / Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Quick public card link */}
              {user.employeeId && (
                <button
                  onClick={() => handleNav(`/card/${user.employeeId}`)}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-[#111827] hover:bg-slate-50 transition-colors"
                  title="Preview Public VCard"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Public Card</span>
                </button>
              )}

              {/* User badge */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E5E7EB]">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-[#E5E7EB] flex items-center justify-center text-xs font-bold text-[#111827] overflow-hidden">
                  {profile?.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt={user.fullName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    user.fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-[#111827] leading-tight">
                    {user.fullName}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-[#64748B] font-mono">
                    <span>{user.employeeId}</span>
                    <span>•</span>
                    <span className="font-semibold text-[#2563EB]">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-[#64748B] hover:text-[#DC2626] rounded-lg hover:bg-red-50 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNav('/card/UHF-001')}
                className="hidden sm:inline-flex text-xs font-medium text-[#64748B] hover:text-[#2563EB] px-3 py-1.5"
              >
                Sample Card
              </button>
              <button
                onClick={() => handleNav('/login')}
                className="bg-[#2563EB] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#1D4ED8] transition-all shadow-xs"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#64748B] hover:text-[#111827] rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-3 space-y-1 shadow-md">
          {isAdmin && (
            <>
              <button
                onClick={() => handleNav('/admin/dashboard')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#111827] hover:bg-slate-50"
              >
                <LayoutDashboard className="w-4 h-4 text-[#2563EB]" />
                <span>Admin Dashboard</span>
              </button>
              <button
                onClick={() => handleNav('/admin/employees')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#111827] hover:bg-slate-50"
              >
                <Users className="w-4 h-4 text-[#2563EB]" />
                <span>Employee Directory</span>
              </button>
              <button
                onClick={() => handleNav('/admin/employees/new')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#111827] hover:bg-slate-50"
              >
                <PlusCircle className="w-4 h-4 text-[#2563EB]" />
                <span>Add Employee</span>
              </button>
              <button
                onClick={() => handleNav('/admin/company-settings')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#111827] hover:bg-slate-50"
              >
                <Building className="w-4 h-4 text-[#2563EB]" />
                <span>Company Settings</span>
              </button>
            </>
          )}

          {isEmployee && (
            <>
              <button
                onClick={() => handleNav('/employee/dashboard')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#111827] hover:bg-slate-50"
              >
                <LayoutDashboard className="w-4 h-4 text-[#2563EB]" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => handleNav('/employee/profile')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#111827] hover:bg-slate-50"
              >
                <User className="w-4 h-4 text-[#2563EB]" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => handleNav('/employee/card')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#111827] hover:bg-slate-50"
              >
                <CreditCard className="w-4 h-4 text-[#2563EB]" />
                <span>Digital Card</span>
              </button>
              <button
                onClick={() => handleNav('/employee/qr')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#111827] hover:bg-slate-50"
              >
                <QrCode className="w-4 h-4 text-[#2563EB]" />
                <span>My QR Code</span>
              </button>
              <button
                onClick={() => handleNav('/employee/nfc')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#111827] hover:bg-slate-50"
              >
                <SmartphoneNfc className="w-4 h-4 text-[#2563EB]" />
                <span>NFC Tap Sharing</span>
              </button>
            </>
          )}

          {user && (
            <div className="pt-2 border-t border-[#E5E7EB]">
              <div className="px-3 py-2 text-xs text-[#64748B] font-mono">
                Signed in as: <span className="font-bold text-[#111827]">{user.email}</span> ({user.employeeId})
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#DC2626] hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
