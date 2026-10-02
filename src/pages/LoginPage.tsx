import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Input } from '../components/common/Input.tsx';
import { Button } from '../components/common/Button.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { Lock, User, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (role: 'ADMIN' | 'EMPLOYEE') => void;
  onViewSampleCard?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onViewSampleCard,
}) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your Employee ID or Email.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(identifier.trim(), password);
      showToast('Login successful! Welcome back.', 'success');

      // The AuthContext user will be set, but let's check role or let parent handle
      const user = JSON.parse(localStorage.getItem('uhf_auth_user') || '{}');
      onLoginSuccess(user.role || 'EMPLOYEE');
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.message || 'Invalid credentials or inactive account.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* UHF Solutions Logo */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2563EB] via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-sm shadow-blue-500/20 mb-4">
          U
        </div>

        <h2 className="text-2xl font-black text-[#111827] tracking-tight">
          UHF Solutions Digital Card
        </h2>
        <p className="mt-1.5 text-xs text-[#64748B]">
          Sign in to manage your digital business card, QR code & profile
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm rounded-3xl border border-[#E5E7EB]">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-[#DC2626] text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Employee ID or Email"
              id="login-identifier"
              type="text"
              placeholder="e.g. UHF-001 or admin@uhfsolutions.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              id="login-password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Portal
              </Button>
            </div>
          </form>

          {/* Quick Demo Logins for Testing */}
          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Demo Accounts (Click to Fill)</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN-001', 'AdminPassword123!')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] hover:bg-blue-50/60 hover:border-blue-300 text-left transition-colors group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Administrator (Full Access)</span>
                  </div>
                  <div className="text-[11px] text-[#64748B] font-mono">ADMIN-001 / AdminPassword123!</div>
                </div>
                <span className="text-[10px] font-semibold text-[#2563EB] group-hover:underline">
                  Fill
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('UHF-001', 'Password123!')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] hover:bg-blue-50/60 hover:border-blue-300 text-left transition-colors group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-[#111827]">
                    Muhammad Ahmed (Developer)
                  </div>
                  <div className="text-[11px] text-[#64748B] font-mono">UHF-001 / Password123!</div>
                </div>
                <span className="text-[10px] font-semibold text-[#2563EB] group-hover:underline">
                  Fill
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('UHF-002', 'Password123!')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] hover:bg-blue-50/60 hover:border-blue-300 text-left transition-colors group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-[#111827]">
                    Ali Khan (UI/UX Designer)
                  </div>
                  <div className="text-[11px] text-[#64748B] font-mono">UHF-002 / Password123!</div>
                </div>
                <span className="text-[10px] font-semibold text-[#2563EB] group-hover:underline">
                  Fill
                </span>
              </button>
            </div>

            {onViewSampleCard && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={onViewSampleCard}
                  className="text-xs text-[#64748B] hover:text-[#2563EB] underline font-medium cursor-pointer"
                >
                  View Sample Public Employee Card (UHF-001) →
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[#64748B] mt-6">
          © {new Date().getFullYear()} UHF Solutions. All rights reserved.
        </p>
      </div>
    </div>
  );
};
