import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.ts';
import { DashboardStats, FullEmployee } from '../../types/index.ts';
import { Button } from '../../components/common/Button.tsx';
import { QRCodeModal } from '../../components/card/QRCodeModal.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import {
  Users,
  UserCheck,
  UserX,
  Layers,
  PlusCircle,
  ExternalLink,
  QrCode,
  Edit,
  ArrowRight,
  Building,
  ShieldAlert,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQrEmployee, setSelectedQrEmployee] = useState<{
    id: string;
    name: string;
    designation: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    api.admin
      .getStats()
      .then((data) => {
        if (isMounted) setStats(data);
      })
      .catch((err) => {
        console.error('Failed to load admin stats:', err);
        showToast('Failed to load dashboard metrics', 'error');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-100">
              Admin Portal
            </span>
            <span className="text-xs text-[#64748B] font-mono">UHF Solutions Enterprise</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Manage company employee digital business cards, unique dynamic QR codes, and corporate profiles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/admin/company-settings')}
            leftIcon={<Building className="w-4 h-4 text-[#64748B]" />}
          >
            Company Info
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('/admin/employees/new')}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Add New Employee
          </Button>
        </div>
      </div>

      {/* Security notice for default credentials */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold text-amber-900">
            Pre-Production Security Advisory
          </p>
          <p className="text-amber-800 mt-0.5 leading-relaxed">
            Ensure you change the initial default administrator password and replace sample employees with real UHF Solutions employee credentials prior to distributing dynamic QR codes to clients.
          </p>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Employees */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Total Employees
            </p>
            <h3 className="text-3xl font-black text-[#111827]">
              {loading ? '-' : stats?.totalEmployees || 0}
            </h3>
            <span className="text-[11px] text-[#64748B] font-medium">Registered Accounts</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Employees */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Active Cards
            </p>
            <h3 className="text-3xl font-black text-[#059669]">
              {loading ? '-' : stats?.activeCount || 0}
            </h3>
            <span className="text-[11px] text-[#059669] font-medium">Cards live & scannable</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Inactive Employees */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Deactivated
            </p>
            <h3 className="text-3xl font-black text-[#64748B]">
              {loading ? '-' : stats?.inactiveCount || 0}
            </h3>
            <span className="text-[11px] text-[#64748B] font-medium">Disabled / Suspended</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#64748B] flex items-center justify-center">
            <UserX className="w-6 h-6" />
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Departments
            </p>
            <h3 className="text-3xl font-black text-[#2563EB]">
              {loading ? '-' : stats?.departmentsCount || 0}
            </h3>
            <span className="text-[11px] text-[#64748B] font-medium">Active corporate units</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Employees Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden mb-8">
        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#111827]">
              Recent Employees Directory
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Latest employee accounts created in UHF Solutions
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/admin/employees')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View All Employees
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#64748B] text-sm">Loading employees...</div>
        ) : stats?.recentEmployees && stats.recentEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-[#64748B] border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">ID & Role</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {stats.recentEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-[#E5E7EB] overflow-hidden flex items-center justify-center shrink-0">
                          {emp.profile.profilePhoto ? (
                            <img
                              src={emp.profile.profilePhoto}
                              alt={emp.profile.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-xs text-[#111827]">
                              {emp.profile.fullName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#111827] leading-tight">
                            {emp.profile.fullName}
                          </p>
                          <p className="text-xs text-[#64748B]">{emp.profile.designation}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-[#2563EB] block">
                        {emp.employeeId}
                      </span>
                      <span className="text-[11px] text-[#64748B]">{emp.role}</span>
                    </td>

                    <td className="py-4 px-6 text-xs text-[#111827]">
                      {emp.profile.department}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
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

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate(`/card/${emp.employeeId}`)}
                          className="p-1.5 text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="View Digital Card"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            setSelectedQrEmployee({
                              id: emp.employeeId,
                              name: emp.profile.fullName,
                              designation: emp.profile.designation,
                            })
                          }
                          className="p-1.5 text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Show QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onNavigate(`/admin/employees/${emp.id}/edit`)}
                          className="p-1.5 text-[#64748B] hover:text-[#111827] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Employee"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-[#64748B] text-sm">No employees found.</div>
        )}
      </div>

      {/* QR Code Modal for clicked employee */}
      {selectedQrEmployee && (
        <QRCodeModal
          isOpen={!!selectedQrEmployee}
          onClose={() => setSelectedQrEmployee(null)}
          employeeId={selectedQrEmployee.id}
          fullName={selectedQrEmployee.name}
          designation={selectedQrEmployee.designation}
        />
      )}
    </div>
  );
};
