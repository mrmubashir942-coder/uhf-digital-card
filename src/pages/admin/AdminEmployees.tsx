import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../lib/api.ts';
import { FullEmployee, AccountStatus } from '../../types/index.ts';
import { Button } from '../../components/common/Button.tsx';
import { Input } from '../../components/common/Input.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';
import { QRCodeModal } from '../../components/card/QRCodeModal.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import {
  Users,
  Search,
  PlusCircle,
  ExternalLink,
  QrCode,
  Edit,
  Trash2,
  KeyRound,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  RefreshCw,
  Building,
} from 'lucide-react';

interface AdminEmployeesProps {
  onNavigate: (path: string) => void;
}

export const AdminEmployeesPage: React.FC<AdminEmployeesProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<FullEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Modals
  const [qrEmployee, setQrEmployee] = useState<{ id: string; name: string; designation: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FullEmployee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetTarget, setResetTarget] = useState<FullEmployee | null>(null);
  const [newTempPassword, setNewTempPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getEmployees({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
      });
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      showToast('Failed to load employees list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [statusFilter, departmentFilter]);

  // Extract unique departments for dropdown
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.profile?.department) set.add(e.profile.department);
    });
    return Array.from(set).sort();
  }, [employees]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleToggleStatus = async (employee: FullEmployee) => {
    const targetStatus: AccountStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.admin.toggleStatus(employee.id, targetStatus);
      showToast(`Employee ${employee.employeeId} status set to ${targetStatus}`, 'success');
      setEmployees((prev) =>
        prev.map((e) => (e.id === employee.id ? { ...e, status: targetStatus } : e))
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle status', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.admin.deleteEmployee(deleteTarget.id);
      showToast(`Employee ${deleteTarget.employeeId} has been deleted.`, 'success');
      setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete employee.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget || !newTempPassword) return;

    if (newTempPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setIsResetting(true);
    try {
      await api.admin.resetPassword(resetTarget.id, newTempPassword);
      showToast(`Password for ${resetTarget.employeeId} has been reset.`, 'success');
      setResetTarget(null);
      setNewTempPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Employee Directory & Digital Cards
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage company personnel, issue digital business cards, configure permissions, and export QR codes.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => onNavigate('/admin/employees/new')}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Add New Employee
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID (UHF-001), email, or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 py-2 px-3 outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          {/* Department filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 py-2 px-3 outline-none focus:ring-2 focus:ring-blue-600 max-w-[160px]"
          >
            <option value="ALL">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <button
            onClick={fetchEmployees}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <span>Loading employee directory...</span>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">No employees found</p>
            <p className="text-xs text-slate-400 mt-1">Try changing your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">Employee ID</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Email & Phone</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Employee Name & Photo */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                          {emp.profile.profilePhoto ? (
                            <img
                              src={emp.profile.profilePhoto}
                              alt={emp.profile.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-xs text-slate-600 dark:text-slate-300">
                              {emp.profile.fullName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">
                            {emp.profile.fullName}
                          </p>
                          <p className="text-xs text-slate-500">{emp.profile.designation}</p>
                        </div>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="py-4 px-6 font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                      {emp.employeeId}
                    </td>

                    {/* Department */}
                    <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-300">
                      {emp.profile.department}
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-6 text-xs">
                      <p className="text-slate-900 dark:text-white font-medium">{emp.email}</p>
                      <p className="text-slate-400">{emp.profile.phone || 'No phone'}</p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 cursor-pointer ${
                          emp.status === 'ACTIVE'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                        title="Click to toggle Active/Inactive"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            emp.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <span>{emp.status}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View Digital Card */}
                        <button
                          onClick={() => onNavigate(`/card/${emp.employeeId}`)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Digital Business Card"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        {/* View QR Code */}
                        <button
                          onClick={() =>
                            setQrEmployee({
                              id: emp.employeeId,
                              name: emp.profile.fullName,
                              designation: emp.profile.designation,
                            })
                          }
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* Edit Employee */}
                        <button
                          onClick={() => onNavigate(`/admin/employees/${emp.id}/edit`)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Employee Information"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Reset Password */}
                        <button
                          onClick={() => {
                            setResetTarget(emp);
                            setNewTempPassword('Password123!');
                          }}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Delete Employee */}
                        <button
                          onClick={() => setDeleteTarget(emp)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {qrEmployee && (
        <QRCodeModal
          isOpen={!!qrEmployee}
          onClose={() => setQrEmployee(null)}
          employeeId={qrEmployee.id}
          fullName={qrEmployee.name}
          designation={qrEmployee.designation}
        />
      )}

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resetTarget}
        onClose={() => setResetTarget(null)}
        title={`Reset Password: ${resetTarget?.profile.fullName}`}
        maxWidth="sm"
      >
        <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
          <p className="text-xs text-slate-500">
            Set a new temporary password for <span className="font-bold text-slate-800 dark:text-slate-200">{resetTarget?.employeeId}</span>. The employee will use this password on next login.
          </p>

          <Input
            label="Temporary New Password"
            id="reset-temp-password"
            type="text"
            value={newTempPassword}
            onChange={(e) => setNewTempPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResetTarget(null)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isResetting}
            >
              Save Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Employee Record?"
        message={`Are you sure you want to permanently delete ${deleteTarget?.profile.fullName} (${deleteTarget?.employeeId})? This action removes their account, digital card, and QR code access.`}
        confirmText="Delete Employee"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
