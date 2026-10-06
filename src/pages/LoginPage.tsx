import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Input } from '../components/common/Input.tsx';
import { Button } from '../components/common/Button.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { UHFLogo } from '../components/common/UHFLogo.tsx';
import { Lock, User, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, ExternalLink } from 'lucide-react';

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
    <div className="relative min-h-screen bg-[#F0F4F8] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      {/* Subtle modern corporate ambient blue glow shapes (No yellow effects) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-400/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header with Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="flex justify-center mb-4">
          <UHFLogo size="lg" showBadge={true} />
        </div>
        <p className="text-xs text-[#64748B] font-medium max-w-xs mx-auto">
          Sign in to access your digital business card, dynamic QR code & employee management
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 sm:px-9 shadow-sm rounded-3xl border border-[#E5E7EB]">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-[#DC2626] text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Employee ID or Email"
              id="login-identifier"
              type="text"
              placeholder="e.g. ADMIN-001 or UHF-001"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-[#2563EB]" />}
              required
            />

            <Input
              label="Password"
              id="login-password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-[#2563EB]" />}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 text-sm font-bold shadow-md shadow-blue-500/20"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Portal
              </Button>
            </div>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Demo Accounts (Instant Fill)</span>
            </div>

            <div className="space-y-2">
              {/* Administrator */}
              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN-001', 'AdminPassword123!')}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] hover:bg-blue-50/70 hover:border-blue-300 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F172A] leading-tight">
                      Administrator (Usman Farooqui)
                    </div>
                    <div className="text-[11px] text-[#64748B] font-mono mt-0.5">
                      ADMIN-001 • Full Access
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#2563EB] group-hover:underline">
                  Use
                </span>
              </button>

              {/* Employee: Muhammad Ahmed */}
              <button
                type="button"
                onClick={() => handleQuickFill('UHF-001', 'Password123!')}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] hover:bg-blue-50/70 hover:border-blue-300 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F172A] leading-tight">
                      Muhammad Ahmed (Senior Developer)
                    </div>
                    <div className="text-[11px] text-[#64748B] font-mono mt-0.5">
                      UHF-001 • Employee
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#2563EB] group-hover:underline">
                  Use
                </span>
              </button>

              {/* Employee: Ali Khan */}
              <button
                type="button"
                onClick={() => handleQuickFill('UHF-002', 'Password123!')}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] hover:bg-blue-50/70 hover:border-blue-300 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F172A] leading-tight">
                      Ali Khan (UI/UX Designer)
                    </div>
                    <div className="text-[11px] text-[#64748B] font-mono mt-0.5">
                      UHF-002 • Employee
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#2563EB] group-hover:underline">
                  Use
                </span>
              </button>
            </div>

            {onViewSampleCard && (
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={onViewSampleCard}
                  className="inline-flex items-center gap-1.5 text-xs text-[#2563EB] hover:text-[#1D4ED8] font-bold transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Sample Public Employee Card (UHF-001)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-[#64748B] flex flex-col items-center justify-center gap-1">
          <div className="flex flex-wrap items-center justify-center gap-2 font-medium text-[#334155]">
            <span>© 2026 UHF Solutions Digital Card System</span>
            <span className="text-[#94A3B8]">•</span>
            <span className="font-mono text-[#64748B] text-[11px]">v1.0.0</span>
            <span className="text-[#94A3B8]">•</span>
            <span className="text-emerald-600 font-medium">System Online</span>
          </div>
          <p className="text-[11px] text-[#64748B]">
            Developed by <span className="font-medium text-[#2563EB]">Muhammad Mubashir</span>
          </p>
        </div>
      </div>
    </div>
  );
};
