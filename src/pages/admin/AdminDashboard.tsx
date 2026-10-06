import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../lib/api.ts';
import { DashboardStats, FullEmployee } from '../../types/index.ts';
import { Button } from '../../components/common/Button.tsx';
import { QRCodeModal } from '../../components/card/QRCodeModal.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';
import { ActivityLogsSection } from '../../components/admin/ActivityLogsSection.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import {
  Users,
  CreditCard,
  UserX,
  Layers,
  Search,
  ArrowRight,
  Eye,
  QrCode,
  Edit,
  Trash2,
  Calendar,
  CheckCircle2,
  Code2,
  Shield,
  Megaphone,
  Palette,
  Building,
  UserCheck,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Actions
  const [selectedQrEmployee, setSelectedQrEmployee] = useState<{
    id: string;
    name: string;
    designation: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FullEmployee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dynamic Live Time
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentDateString = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  const fetchStats = () => {
    setLoading(true);
    api.admin
      .getStats()
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error('Failed to load admin stats:', err);
        showToast('Failed to load dashboard metrics', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDeleteEmployee = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.admin.deleteEmployee(deleteTarget.id);
      showToast(`Employee ${deleteTarget.profile.fullName} successfully removed.`, 'success');
      setDeleteTarget(null);
      fetchStats();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete employee.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const getDepartmentIcon = (dept: string) => {
    const lower = dept.toLowerCase();
    if (lower.includes('tech') || lower.includes('it') || lower.includes('dev') || lower.includes('engineer')) {
      return <Code2 className="w-3.5 h-3.5 text-[#2563EB]" />;
    }
    if (lower.includes('admin') || lower.includes('security') || lower.includes('exec')) {
      return <Shield className="w-3.5 h-3.5 text-blue-600" />;
    }
    if (lower.includes('market') || lower.includes('sales') || lower.includes('growth')) {
      return <Megaphone className="w-3.5 h-3.5 text-cyan-600" />;
    }
    if (lower.includes('design') || lower.includes('ui') || lower.includes('creative')) {
      return <Palette className="w-3.5 h-3.5 text-purple-600" />;
    }
    return <Users className="w-3.5 h-3.5 text-indigo-600" />;
  };

  const getAvatarBg = (name: string) => {
    const first = (name || 'U').charAt(0).toUpperCase();
    if (first >= 'A' && first <= 'D') return 'bg-[#2563EB] text-white';
    if (first >= 'E' && first <= 'H') return 'bg-indigo-600 text-white';
    if (first >= 'I' && first <= 'N') return 'bg-blue-600 text-white';
    if (first >= 'O' && first <= 'S') return 'bg-teal-600 text-white';
    return 'bg-amber-600 text-white';
  };

  const filteredEmployees = useMemo(() => {
    if (!stats?.recentEmployees) return [];
    if (!searchQuery.trim()) return stats.recentEmployees;
    const q = searchQuery.toLowerCase().trim();
    return stats.recentEmployees.filter(
      (emp) =>
        emp.profile.fullName.toLowerCase().includes(q) ||
        emp.employeeId.toLowerCase().includes(q) ||
        emp.profile.department.toLowerCase().includes(q) ||
        emp.profile.designation.toLowerCase().includes(q)
    );
  }, [stats?.recentEmployees, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. DASHBOARD HERO SECTION (Matching Reference Screenshot) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Welcome Back & Title */}
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#2563EB] block mb-1">
            WELCOME BACK,
          </span>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight">
              {user?.fullName || 'Usman Farooqui'}
            </h1>
            <CheckCircle2 className="w-6 h-6 text-[#2563EB] fill-[#2563EB]/15 shrink-0" />
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 font-medium">
            Manage your team and digital business cards from your dashboard.
          </p>
        </div>

        {/* Hero Right: Live Date/Time Widget & UHF Company Banner */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Live Date/Time Box */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0F172A] leading-tight">{currentDateString}</p>
              <p className="text-[11px] font-mono font-medium text-[#64748B] mt-0.5">{currentTime}</p>
            </div>
          </div>

          {/* UHF Solutions Company Banner Card (as seen in Reference Screenshot) */}
          <div className="relative overflow-hidden flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/60 border border-blue-200/80 shadow-2xs">
            {/* Subtle architectural glass glow overlay */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />

            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1D4ED8] to-[#2563EB] text-white flex items-center justify-center font-black text-xl shadow-sm shadow-blue-500/25 shrink-0">
              <span>U</span>
            </div>
            <div>
              <span className="text-xs font-black tracking-wide text-[#0F172A] uppercase block">
                UHF SOLUTIONS
              </span>
              <span className="text-[11px] text-[#2563EB] font-medium block">
                Smart Identity. Stronger Connections.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FOUR STATISTICS CARDS (Matching Reference Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: TOTAL EMPLOYEES (Blue) */}
        <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs flex items-center justify-between group hover:border-blue-300 transition-all">
          {/* Subtle curved bottom-left wave accent */}
          <div className="absolute -left-6 -bottom-6 w-20 h-20 rounded-full bg-blue-500/5 pointer-events-none" />

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
              TOTAL EMPLOYEES
            </span>
            <h3 className="text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight">
              {loading ? '-' : stats?.totalEmployees ?? 5}
            </h3>
            <span className="text-xs text-[#64748B] font-medium block">Registered Accounts</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shadow-2xs">
              <Users className="w-6 h-6" />
            </div>
            <button
              onClick={() => onNavigate('/admin/employees')}
              className="w-8 h-8 rounded-full bg-blue-50 text-[#2563EB] hover:bg-[#2563EB] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="View all employees"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 2: ACTIVE CARDS (Emerald Green) */}
        <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs flex items-center justify-between group hover:border-emerald-300 transition-all">
          <div className="absolute -left-6 -bottom-6 w-20 h-20 rounded-full bg-emerald-500/5 pointer-events-none" />

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
              ACTIVE CARDS
            </span>
            <h3 className="text-3xl lg:text-4xl font-black text-[#059669] tracking-tight">
              {loading ? '-' : stats?.activeCount ?? 5}
            </h3>
            <span className="text-xs text-[#059669] font-medium block">Cards live & scannable</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center shadow-2xs">
              <CreditCard className="w-6 h-6" />
            </div>
            <button
              onClick={() => onNavigate('/admin/employees')}
              className="w-8 h-8 rounded-full bg-emerald-50 text-[#059669] hover:bg-[#059669] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="View active cards"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 3: DEACTIVATED (Slate/Gray) */}
        <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs flex items-center justify-between group hover:border-slate-300 transition-all">
          <div className="absolute -left-6 -bottom-6 w-20 h-20 rounded-full bg-slate-500/5 pointer-events-none" />

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
              DEACTIVATED
            </span>
            <h3 className="text-3xl lg:text-4xl font-black text-[#64748B] tracking-tight">
              {loading ? '-' : stats?.inactiveCount ?? 0}
            </h3>
            <span className="text-xs text-[#64748B] font-medium block">Disabled / Suspended</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#64748B] flex items-center justify-center shadow-2xs">
              <UserX className="w-6 h-6" />
            </div>
            <button
              onClick={() => onNavigate('/admin/employees')}
              className="w-8 h-8 rounded-full bg-slate-100 text-[#64748B] hover:bg-[#0F172A] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="View deactivated accounts"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 4: DEPARTMENTS (Indigo/Purple) */}
        <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs flex items-center justify-between group hover:border-indigo-300 transition-all">
          <div className="absolute -left-6 -bottom-6 w-20 h-20 rounded-full bg-indigo-500/5 pointer-events-none" />

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
              DEPARTMENTS
            </span>
            <h3 className="text-3xl lg:text-4xl font-black text-[#4F46E5] tracking-tight">
              {loading ? '-' : stats?.departmentsCount ?? 4}
            </h3>
            <span className="text-xs text-[#64748B] font-medium block">Active corporate units</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center shadow-2xs">
              <Layers className="w-6 h-6" />
            </div>
            <button
              onClick={() => onNavigate('/admin/employees')}
              className="w-8 h-8 rounded-full bg-indigo-50 text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="View departments"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. RECENT EMPLOYEES DIRECTORY (Matching Reference Screenshot) */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        {/* Directory Card Header */}
        <div className="p-6 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shadow-2xs shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0F172A] tracking-tight">
                Recent Employees Directory
              </h2>
              <p className="text-xs text-[#64748B] font-medium">
                Latest employee accounts created in UHF Solutions
              </p>
            </div>
          </div>

          {/* Search bar & View All Button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-[#E5E7EB] rounded-xl text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/admin/employees')}
              rightIcon={<ArrowRight className="w-4 h-4 text-[#2563EB]" />}
              className="text-[#2563EB] border-blue-200 hover:bg-blue-50"
            >
              View All Employees
            </Button>
          </div>
        </div>

        {/* Directory Table */}
        {loading ? (
          <div className="p-12 text-center text-[#64748B] text-xs">Loading directory...</div>
        ) : filteredEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-[#64748B] border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-4 px-6">EMPLOYEE</th>
                  <th className="py-4 px-6">ID & ROLE</th>
                  <th className="py-4 px-6">DEPARTMENT</th>
                  <th className="py-4 px-6">STATUS</th>
                  <th className="py-4 px-6 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredEmployees.map((emp) => {
                  const avatarColor = getAvatarBg(emp.profile.fullName);
                  const deptIcon = getDepartmentIcon(emp.profile.department);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Employee avatar & name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden shrink-0 ${avatarColor}`}
                          >
                            {emp.profile.profilePhoto ? (
                              <img
                                src={emp.profile.profilePhoto}
                                alt={emp.profile.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{emp.profile.fullName.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#0F172A] leading-tight">
                              {emp.profile.fullName}
                            </p>
                            <p className="text-xs text-[#64748B] mt-0.5">{emp.profile.designation}</p>
                          </div>
                        </div>
                      </td>

                      {/* ID & Role */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-[#2563EB] block">
                          {emp.employeeId}
                        </span>
                        <span className="text-[11px] uppercase font-semibold text-[#64748B]">
                          {emp.role}
                        </span>
                      </td>

                      {/* Department with Icon */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            {deptIcon}
                          </div>
                          <span className="text-xs font-medium text-[#334155]">
                            {emp.profile.department}
                          </span>
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                            emp.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-[#059669] border border-emerald-200'
                              : 'bg-slate-100 text-[#64748B] border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              emp.status === 'ACTIVE' ? 'bg-[#059669]' : 'bg-slate-400'
                            }`}
                          />
                          <span>{emp.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onNavigate(`/card/${emp.employeeId}`)}
                            className="p-2 text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                            title="View Digital Business Card"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              setSelectedQrEmployee({
                                id: emp.employeeId,
                                name: emp.profile.fullName,
                                designation: emp.profile.designation,
                              })
                            }
                            className="p-2 text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                            title="Show Dynamic QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onNavigate(`/admin/employees/${emp.id}/edit`)}
                            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            title="Edit Employee Profile"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {emp.role !== 'ADMIN' && (
                            <button
                              onClick={() => setDeleteTarget(emp)}
                              className="p-2 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="Delete Employee"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-[#64748B] text-xs">
            <Users className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
            <p className="font-semibold text-[#0F172A]">No employees found</p>
            <p className="text-slate-400 mt-1">
              Try adjusting your search criteria or add a new employee account.
            </p>
          </div>
        )}
      </div>

      {/* 4. ACTIVITY AUDIT TRAIL LOGGING */}
      <ActivityLogsSection onNavigate={onNavigate} />

      {/* QR Code Modal */}
      {selectedQrEmployee && (
        <QRCodeModal
          isOpen={!!selectedQrEmployee}
          onClose={() => setSelectedQrEmployee(null)}
          employeeId={selectedQrEmployee.id}
          fullName={selectedQrEmployee.name}
          designation={selectedQrEmployee.designation}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteEmployee}
          title="Delete Employee Record"
          message={`Are you sure you want to permanently delete the profile for ${deleteTarget.profile.fullName} (${deleteTarget.employeeId})? This action cannot be undone.`}
          confirmText="Delete Record"
          isLoading={isDeleting}
          isDestructive={true}
        />
      )}
    </div>
  );
};
