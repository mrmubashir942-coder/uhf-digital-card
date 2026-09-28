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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* UHF Solutions Logo */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/25 mb-4">
          U
        </div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          UHF Solutions Digital Card
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Sign in to manage your digital business card, QR code & profile
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200 dark:border-slate-800">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium leading-relaxed">
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
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Demo Accounts (Click to Fill)</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN-001', 'AdminPassword123!')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Administrator (Full Access)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">ADMIN-001 / AdminPassword123!</div>
                </div>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                  Fill
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('UHF-001', 'Password123!')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Muhammad Ahmed (Developer)
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">UHF-001 / Password123!</div>
                </div>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                  Fill
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('UHF-002', 'Password123!')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Ali Khan (UI/UX Designer)
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">UHF-002 / Password123!</div>
                </div>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                  Fill
                </span>
              </button>
            </div>

            {onViewSampleCard && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={onViewSampleCard}
                  className="text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 underline font-medium"
                >
                  View Sample Public Employee Card (UHF-001) →
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} UHF Solutions. All rights reserved.
        </p>
      </div>
    </div>
  );
};
