import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';
import { Input } from '../../components/common/Input.tsx';
import { Button } from '../../components/common/Button.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { Lock, Shield, CheckCircle, ArrowLeft, SmartphoneNfc, ChevronRight } from 'lucide-react';

interface EmployeeSettingsProps {
  onNavigate: (path: string) => void;
}

export const EmployeeSettingsPage: React.FC<EmployeeSettingsProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword) {
      setError('Please provide your current password and a new password.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.employee.changePassword(currentPassword, newPassword);
      showToast(res.message || 'Password successfully updated!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password change error:', err);
      setError(err.message || 'Failed to update password.');
      showToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => onNavigate('/employee/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#111827] transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <h1 className="text-2xl font-black text-[#111827] tracking-tight">
          Account Security & Password
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          Manage your login credentials and security settings for employee ID {user?.employeeId}.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#E5E7EB]">
          <Shield className="w-5 h-5 text-[#2563EB]" />
          <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
            Change Account Password
          </h2>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-[#DC2626] text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password"
            id="current-password"
            type="password"
            placeholder="••••••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            label="New Password"
            id="new-password"
            type="password"
            placeholder="Minimum 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            helperText="Include letters, numbers, and special symbols for stronger security."
            required
          />

          <Input
            label="Confirm New Password"
            id="confirm-password"
            type="password"
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="pt-4 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate('/employee/dashboard')}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<CheckCircle className="w-4 h-4" />}
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* NFC Tap Sharing Quick Navigation */}
      <div className="mt-6 bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100">
            <SmartphoneNfc className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#111827]">
              NFC 'Tap' Sharing & Card Programming
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Configure contactless sharing, toggle NFC availability, and view step-by-step programming manuals.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/employee/nfc')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-[#111827] hover:text-[#2563EB] border border-[#E5E7EB] hover:border-blue-200 text-xs font-bold transition-colors shrink-0 cursor-pointer"
        >
          <span>Open NFC Guide</span>
          <ChevronRight className="w-4 h-4 text-[#2563EB]" />
        </button>
      </div>
    </div>
  );
};
