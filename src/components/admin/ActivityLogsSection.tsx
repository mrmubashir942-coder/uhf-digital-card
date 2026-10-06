import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../lib/api.ts';
import { ActivityLog, ActivityCategory, ActivityActionType, FullEmployee } from '../../types/index.ts';
import { Button } from '../common/Button.tsx';
import {
  Activity,
  Search,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  FileDown,
  QrCode,
  UserCheck,
  UserPlus,
  Edit3,
  Sliders,
  Building2,
  Image,
  LogIn,
  LogOut,
  Key,
  Clock,
  Shield,
  Layers,
  Calendar,
  User,
  Filter,
  X,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

interface ActivityLogsSectionProps {
  onNavigate?: (path: string) => void;
}

const ACTION_OPTIONS: { value: ActivityActionType | 'ALL'; label: string; category?: ActivityCategory }[] = [
  { value: 'ALL', label: 'All Activity Types' },
  { value: 'LOGIN', label: 'User Login (AUTH)', category: 'AUTH' },
  { value: 'LOGOUT', label: 'User Logout (AUTH)', category: 'AUTH' },
  { value: 'CARD_VIEW', label: 'Digital Card Viewed (INTERACTION)', category: 'INTERACTION' },
  { value: 'VCARD_DOWNLOAD', label: 'vCard (.vcf) Downloaded (INTERACTION)', category: 'INTERACTION' },
  { value: 'QR_CODE_DOWNLOAD', label: 'QR Code Scanned/Saved (INTERACTION)', category: 'INTERACTION' },
  { value: 'PROFILE_UPDATE', label: 'Profile Information Updated (PROFILE)', category: 'PROFILE' },
  { value: 'PHOTO_UPLOAD', label: 'Photo/Avatar Uploaded (PROFILE)', category: 'PROFILE' },
  { value: 'EMPLOYEE_CREATE', label: 'Employee Account Created (ADMIN)', category: 'ADMIN' },
  { value: 'EMPLOYEE_UPDATE', label: 'Employee Record Updated (ADMIN)', category: 'ADMIN' },
  { value: 'EMPLOYEE_STATUS_CHANGE', label: 'Account Status Toggled (ADMIN)', category: 'ADMIN' },
  { value: 'COMPANY_SETTINGS_UPDATE', label: 'Company Settings Updated (ADMIN)', category: 'ADMIN' },
  { value: 'COMPANY_LOGO_UPLOAD', label: 'Company Logo Uploaded (ADMIN)', category: 'ADMIN' },
  { value: 'PASSWORD_CHANGE', label: 'Password Changed / Reset (AUTH/PROFILE)', category: 'PROFILE' },
];

export const ActivityLogsSection: React.FC<ActivityLogsSectionProps> = ({ onNavigate }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'ALL'>('ALL');
  const [selectedAction, setSelectedAction] = useState<ActivityActionType | 'ALL'>('ALL');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(25);
  
  // UI states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [employeeDirectory, setEmployeeDirectory] = useState<FullEmployee[]>([]);

  // Fetch employees list for quick user ID selection
  useEffect(() => {
    api.admin
      .getEmployees()
      .then((emps) => {
        if (Array.isArray(emps)) {
          setEmployeeDirectory(emps);
        }
      })
      .catch(() => {});
  }, []);

  const fetchLogs = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await api.admin.getLogs({
          limit: 200,
          category: selectedCategory === 'ALL' ? undefined : selectedCategory,
          action: selectedAction === 'ALL' ? undefined : selectedAction,
          userId: selectedUserId.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          search: searchQuery.trim() || undefined,
        });
        setLogs(data.logs || []);
        setTotalCount(data.total || 0);
      } catch (err) {
        console.error('Failed to load activity logs:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCategory, selectedAction, selectedUserId, startDate, endDate, searchQuery]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Quick Date Presets
  const applyDatePreset = (preset: 'today' | '7days' | '30days' | 'all') => {
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }

    const today = new Date();
    const formatYMD = (d: Date) => d.toISOString().split('T')[0];
    setEndDate(formatYMD(today));

    if (preset === 'today') {
      setStartDate(formatYMD(today));
    } else if (preset === '7days') {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setStartDate(formatYMD(past));
    } else if (preset === '30days') {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      setStartDate(formatYMD(past));
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedAction('ALL');
    setSelectedUserId('');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setDisplayLimit(25);
  };

  const hasActiveFilters = Boolean(
    selectedCategory !== 'ALL' ||
    selectedAction !== 'ALL' ||
    selectedUserId.trim() !== '' ||
    startDate !== '' ||
    endDate !== '' ||
    searchQuery.trim() !== ''
  );

  const activeFiltersCount = [
    selectedCategory !== 'ALL',
    selectedAction !== 'ALL',
    Boolean(selectedUserId.trim()),
    Boolean(startDate || endDate),
    Boolean(searchQuery.trim()),
  ].filter(Boolean).length;

  const handleClearLogs = async () => {
    setIsClearing(true);
    try {
      await api.admin.clearLogs();
      await fetchLogs();
      setShowClearConfirm(false);
    } catch (err) {
      console.error('Failed to clear logs:', err);
    } finally {
      setIsClearing(false);
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;

    const headers = ['Timestamp', 'Actor Name', 'Actor Role', 'Category', 'Action', 'Target', 'Details'];
    const rows = logs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.actorName.replace(/"/g, '""')}"`,
      `"${l.actorRole}"`,
      `"${l.category}"`,
      `"${l.action}"`,
      `"${(l.targetName || '').replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UHF_Activity_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = useMemo(() => {
    return logs.slice(0, displayLimit);
  }, [logs, displayLimit]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts = {
      ALL: totalCount,
      INTERACTION: 0,
      PROFILE: 0,
      ADMIN: 0,
      AUTH: 0,
    };
    logs.forEach((l) => {
      if (counts[l.category] !== undefined) {
        counts[l.category]++;
      }
    });
    return counts;
  }, [logs, totalCount]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return {
          icon: <LogIn className="w-3.5 h-3.5 text-emerald-600" />,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'User Login',
        };
      case 'LOGOUT':
        return {
          icon: <LogOut className="w-3.5 h-3.5 text-slate-500" />,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          label: 'Logout',
        };
      case 'CARD_VIEW':
        return {
          icon: <Eye className="w-3.5 h-3.5 text-purple-600" />,
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          label: 'Card Viewed',
        };
      case 'VCARD_DOWNLOAD':
        return {
          icon: <FileDown className="w-3.5 h-3.5 text-blue-600" />,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'vCard Download',
        };
      case 'QR_CODE_DOWNLOAD':
        return {
          icon: <QrCode className="w-3.5 h-3.5 text-cyan-600" />,
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          label: 'QR Scanned',
        };
      case 'PROFILE_UPDATE':
        return {
          icon: <Edit3 className="w-3.5 h-3.5 text-indigo-600" />,
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          label: 'Profile Edit',
        };
      case 'PHOTO_UPLOAD':
        return {
          icon: <Image className="w-3.5 h-3.5 text-teal-600" />,
          bg: 'bg-teal-50 text-teal-700 border-teal-200',
          label: 'Photo Upload',
        };
      case 'EMPLOYEE_CREATE':
        return {
          icon: <UserPlus className="w-3.5 h-3.5 text-emerald-600" />,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Employee Created',
        };
      case 'EMPLOYEE_UPDATE':
        return {
          icon: <UserCheck className="w-3.5 h-3.5 text-sky-600" />,
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          label: 'Employee Updated',
        };
      case 'EMPLOYEE_STATUS_CHANGE':
        return {
          icon: <Sliders className="w-3.5 h-3.5 text-sky-600" />,
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          label: 'Status Change',
        };
      case 'COMPANY_SETTINGS_UPDATE':
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-orange-600" />,
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          label: 'Company Settings',
        };
      case 'COMPANY_LOGO_UPLOAD':
        return {
          icon: <Image className="w-3.5 h-3.5 text-rose-600" />,
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'Logo Upload',
        };
      case 'PASSWORD_CHANGE':
        return {
          icon: <Key className="w-3.5 h-3.5 text-violet-600" />,
          bg: 'bg-violet-50 text-violet-700 border-violet-200',
          label: 'Password Change',
        };
      default:
        return {
          icon: <Activity className="w-3.5 h-3.5 text-slate-500" />,
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          label: action,
        };
    }
  };

  const getActorRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'EMPLOYEE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PUBLIC':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const now = Date.now();
      const past = new Date(isoString).getTime();
      const diffSeconds = Math.floor((now - past) / 1000);

      if (diffSeconds < 60) return 'Just now';
      const diffMinutes = Math.floor(diffSeconds / 60);
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(isoString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden mt-8">
      {/* Top Header */}
      <div className="p-6 border-b border-[#E5E7EB] bg-gradient-to-r from-white via-slate-50/50 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-blue-100/60 text-[#2563EB]">
                <Activity className="w-4 h-4" />
              </span>
              <span className="text-xs uppercase font-bold tracking-wider text-[#2563EB]">
                Accountability & Compliance Audit
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#111827] tracking-tight">
              Enterprise Activity Logs & Filters
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Filter audit history by date range, user ID, activity type, and keywords with real-time audit verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              leftIcon={<Filter className="w-3.5 h-3.5 text-[#2563EB]" />}
              className={showAdvancedFilters ? 'bg-blue-50 border-blue-200 text-[#2563EB]' : ''}
            >
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#2563EB] text-white">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs(true)}
              disabled={refreshing}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={logs.length === 0}
              leftIcon={<Download className="w-3.5 h-3.5 text-[#64748B]" />}
            >
              Export CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearConfirm(true)}
              disabled={logs.length === 0}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
              className="text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              Clear Log
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-[#E5E7EB]">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#111827] text-white shadow-xs'
                : 'bg-slate-100 text-[#64748B] hover:text-[#111827] hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Categories</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/50">
              {categoryCounts.ALL}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('INTERACTION')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'INTERACTION'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Interactions</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-200/60">
              {categoryCounts.INTERACTION}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('PROFILE')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'PROFILE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Profile Updates</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-200/60">
              {categoryCounts.PROFILE}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('ADMIN')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'ADMIN'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Changes</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-200/60">
              {categoryCounts.ADMIN}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('AUTH')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'AUTH'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Auth & Sessions</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200/60">
              {categoryCounts.AUTH}
            </span>
          </button>
        </div>

        {/* Dedicated Filters Section: Date Range, User ID, and Activity Type */}
        {showAdvancedFilters && (
          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-[#E5E7EB] space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Date Range: Start Date */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#2563EB]" />
                  <span>Start Date</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              {/* 2. Date Range: End Date */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#2563EB]" />
                  <span>End Date</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              {/* 3. User ID Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1">
                  <User className="w-3 h-3 text-[#2563EB]" />
                  <span>User / Employee ID</span>
                </label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="e.g. UHF-001 or admin"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    list="employee-suggestions"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                  <datalist id="employee-suggestions">
                    <option value="ADMIN-001">ADMIN-001 (Administrator)</option>
                    {employeeDirectory.map((emp) => (
                      <option key={emp.id} value={emp.employeeId}>
                        {emp.employeeId} ({emp.profile.fullName})
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              {/* 4. Activity Type Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[#2563EB]" />
                  <span>Activity Type</span>
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#111827] font-medium focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  {ACTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Date Presets & Filter Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-[#64748B] font-semibold mr-1">Date presets:</span>
                <button
                  type="button"
                  onClick={() => applyDatePreset('today')}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-[#E5E7EB] text-[11px] font-medium text-[#111827] transition-colors cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset('7days')}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-[#E5E7EB] text-[11px] font-medium text-[#111827] transition-colors cursor-pointer"
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset('30days')}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-[#E5E7EB] text-[11px] font-medium text-[#111827] transition-colors cursor-pointer"
                >
                  Last 30 Days
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset('all')}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-[#E5E7EB] text-[11px] font-medium text-[#64748B] transition-colors cursor-pointer"
                >
                  All Dates
                </button>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search bar & display limit */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search details, actor, target record..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-[#64748B]">
            <span>Records per view:</span>
            <select
              value={displayLimit}
              onChange={(e) => setDisplayLimit(Number(e.target.value))}
              className="px-2 py-1 bg-white border border-[#E5E7EB] rounded-md text-xs font-semibold text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-[11px] text-[#64748B] font-semibold">Active filters:</span>

            {startDate && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                From: {startDate}
                <button onClick={() => setStartDate('')} className="hover:text-blue-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {endDate && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                To: {endDate}
                <button onClick={() => setEndDate('')} className="hover:text-blue-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedUserId && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                User: {selectedUserId}
                <button onClick={() => setSelectedUserId('')} className="hover:text-purple-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedAction !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                Type: {selectedAction}
                <button onClick={() => setSelectedAction('ALL')} className="hover:text-indigo-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCategory !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-300">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('ALL')} className="hover:text-slate-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-[#2563EB] border border-blue-200">
                Keyword: &ldquo;{searchQuery}&rdquo;
                <button onClick={() => setSearchQuery('')} className="hover:text-blue-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-[11px] text-rose-600 hover:underline font-semibold ml-1 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Clearing Logs */}
      {showClearConfirm && (
        <div className="p-4 bg-rose-50 border-b border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs text-rose-900">
            <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">
              Are you sure you want to clear the entire audit trail? This action cannot be undone.
            </span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearConfirm(false)}
              className="text-xs py-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleClearLogs}
              disabled={isClearing}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs py-1 border-none"
            >
              {isClearing ? 'Clearing...' : 'Confirm Clear'}
            </Button>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-[#64748B] text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#2563EB]" />
            <span>Loading enterprise audit logs...</span>
          </div>
        ) : filteredLogs.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-[#64748B] border-b border-[#E5E7EB]">
              <tr>
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">Action & Activity Type</th>
                <th className="py-3 px-6">User / Actor</th>
                <th className="py-3 px-6">Target Record</th>
                <th className="py-3 px-6">Details & Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredLogs.map((log) => {
                const badge = getActionBadge(log.action);
                const roleBadge = getActorRoleBadge(log.actorRole);

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[#111827] font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>{formatRelativeTime(log.timestamp)}</span>
                      </div>
                      <span className="text-[10px] text-[#64748B] block mt-0.5">
                        {new Date(log.timestamp).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        •{' '}
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    {/* Action & Badge */}
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${badge.bg}`}
                      >
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    {/* Actor / User ID */}
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-[#111827] leading-tight">
                            {log.actorName}
                          </p>
                          {log.actorId && (
                            <button
                              onClick={() => setSelectedUserId(log.actorId || '')}
                              title="Filter logs by this User ID"
                              className="text-[10px] text-[#2563EB] hover:underline font-mono"
                            >
                              ({log.actorId})
                            </button>
                          )}
                        </div>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border mt-0.5 ${roleBadge}`}
                        >
                          {log.actorRole}
                        </span>
                      </div>
                    </td>

                    {/* Target Record */}
                    <td className="py-3.5 px-6">
                      {log.targetName ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#111827]">
                            {log.targetName}
                          </span>
                          {onNavigate && log.targetName.includes('UHF-') && (
                            <button
                              onClick={() => {
                                const match = log.targetName?.match(/UHF-\d+/);
                                if (match) onNavigate(`/card/${match[0]}`);
                              }}
                              className="text-[#2563EB] hover:underline cursor-pointer"
                              title="Inspect Digital Card"
                            >
                              <ExternalLink className="w-3 h-3 inline" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#94A3B8] italic text-[11px]">System / Corporate</span>
                      )}
                    </td>

                    {/* Details */}
                    <td className="py-3.5 px-6 text-[#475569]">
                      <p className="line-clamp-2 max-w-md">{log.details}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-[#64748B] text-xs">
            <Activity className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
            <p className="font-semibold text-[#111827]">No activity logs match the selected filters</p>
            <p className="text-slate-400 mt-1 max-w-sm mx-auto">
              No audit records were found matching your date range, user ID, or activity type criteria.
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mt-3 text-xs"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="p-4 bg-[#F8FAFC] border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#64748B]">
        <span>
          Showing {filteredLogs.length} of {totalCount} filtered actions
          {hasActiveFilters && ` (filtered from ${categoryCounts.ALL} total entries)`}
        </span>
        <span className="text-[11px] text-[#94A3B8]">
          UHF Enterprise Compliance Engine • Real-Time Audit Log
        </span>
      </div>
    </div>
  );
};
