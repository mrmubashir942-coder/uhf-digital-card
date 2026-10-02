import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';
import { EmployeeProfile, CompanySettings } from '../../types/index.ts';
import { downloadVCard, shareCard } from '../../lib/vcard.ts';
import { QRCodeModal } from '../../components/card/QRCodeModal.tsx';
import { ShareModal } from '../../components/card/ShareModal.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import {
  CreditCard,
  QrCode,
  Share2,
  Download,
  Edit,
  ExternalLink,
  ShieldCheck,
  User,
  Building,
  Phone,
  Mail,
  CheckCircle2,
  Sparkles,
  SmartphoneNfc,
} from 'lucide-react';
import { Button } from '../../components/common/Button.tsx';

interface EmployeeDashboardProps {
  onNavigate: (path: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onNavigate }) => {
  const { user, profile, setProfile } = useAuth();
  const { showToast } = useToast();

  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.employee
      .getProfile()
      .then((res) => {
        if (isMounted) {
          setProfile(res.profile);
          setCompany(res.company);
        }
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [setProfile]);

  const employeeId = user?.employeeId || 'UHF-001';
  const fullName = profile?.fullName || user?.fullName || 'Employee';
  const designation = profile?.designation || 'Staff Member';
  const department = profile?.department || 'Operations';

  const cardUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/card/${employeeId}`
    : `/card/${employeeId}`;

  const handleDownloadVCard = () => {
    if (!profile || !company) return;
    downloadVCard({
      employeeId,
      fullName: profile.fullName,
      designation: profile.designation,
      department: profile.department,
      phone: profile.phone,
      whatsapp: profile.whatsapp,
      officePhone: profile.officePhone,
      email: user?.email,
      companyEmail: profile.companyEmail,
      linkedin: profile.linkedin,
      website: profile.website,
      officeAddress: profile.officeAddress,
      bio: profile.bio,
      profilePhoto: profile.profilePhoto,
      status: 'ACTIVE',
      company: {
        companyName: company.companyName,
        logoUrl: company.logoUrl,
        website: company.website,
        email: company.email,
        phone: company.phone,
        officeAddress: company.officeAddress,
        linkedin: company.linkedin,
      },
    });
    showToast('VCard (.vcf) downloaded to your device!', 'success');
  };

  const handleShare = () => {
    if (!profile || !company) return;
    shareCard(
      {
        employeeId,
        fullName: profile.fullName,
        designation: profile.designation,
        department: profile.department,
        company: {
          companyName: company.companyName,
          website: company.website,
          email: company.email,
          phone: company.phone,
          officeAddress: company.officeAddress,
        },
        status: 'ACTIVE',
      },
      cardUrl,
      () => setIsShareOpen(true)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border-2 border-blue-500/40 p-1 shadow-lg overflow-hidden shrink-0 flex items-center justify-center">
              {profile?.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={fullName}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                  {fullName.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {employeeId}
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active Member</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome, {fullName}
              </h1>

              <p className="text-sm text-slate-300 mt-0.5">
                {designation} • {department}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Button
              variant="primary"
              onClick={() => onNavigate(`/card/${employeeId}`)}
              leftIcon={<ExternalLink className="w-4 h-4" />}
            >
              View Public Card
            </Button>

            <Button
              variant="outline"
              className="text-white border-slate-700 bg-slate-800/80 hover:bg-slate-700"
              onClick={() => setIsQrOpen(true)}
              leftIcon={<QrCode className="w-4 h-4 text-blue-400" />}
            >
              Show QR Code
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <span>Quick Management</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Card 1: My Digital Card */}
        <div
          onClick={() => onNavigate(`/card/${employeeId}`)}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
            Digital Business Card
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Your live mobile-ready digital card with verified contact details.
          </p>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
            View Live Card →
          </span>
        </div>

        {/* Card 2: My QR Code */}
        <div
          onClick={() => setIsQrOpen(true)}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
            Scan & Print QR Code
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Download vector SVG or PNG QR code to print on your badge.
          </p>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            Open QR Code →
          </span>
        </div>

        {/* Card 3: NFC Tap Sharing */}
        <div
          onClick={() => onNavigate('/employee/nfc')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <SmartphoneNfc className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
            NFC 'Tap' Sharing
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Program physical NFC cards and smart badges with your URL.
          </p>
          <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
            NFC Setup & Guide →
          </span>
        </div>

        {/* Card 4: Edit Profile */}
        <div
          onClick={() => onNavigate('/employee/profile')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Edit className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
            Edit Contact Profile
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Update your phone, photo, WhatsApp, bio, and social links.
          </p>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            Edit Details →
          </span>
        </div>

        {/* Card 4: Share & Download VCF */}
        <div
          onClick={handleDownloadVCard}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Download className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
            Download .VCF Card
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Download standard VCard file to import directly into Apple or Android.
          </p>
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
            Download File →
          </span>
        </div>
      </div>

      {/* Account Details & Status Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Summary */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Employee Profile Overview
            </h3>
            <button
              onClick={() => onNavigate('/employee/profile')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Edit Info
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium block mb-1">Full Legal Name</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {fullName}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium block mb-1">Employee ID</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                {employeeId}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium block mb-1">Designation</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {designation}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium block mb-1">Department</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {department}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium block mb-1">Work Email</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {profile?.companyEmail || user?.email}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium block mb-1">Mobile Phone</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {profile?.phone || 'Not configured'}
              </span>
            </div>
          </div>

          {profile?.bio && (
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 font-medium block mb-1">Public Bio</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>

        {/* Right Column: Company & Card Sharing */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Organization Details
              </h3>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 mb-6">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  {company?.companyName || 'UHF Solutions'}
                </span>
                <span>{company?.officeAddress}</span>
              </div>

              <div>
                <span className="font-medium text-slate-400 block">Corporate Inquiries</span>
                <span>{company?.email}</span>
              </div>

              <div>
                <span className="font-medium text-slate-400 block">Switchboard</span>
                <span>{company?.phone}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="primary"
              className="w-full"
              onClick={handleShare}
              leftIcon={<Share2 className="w-4 h-4" />}
            >
              Share Digital Card
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => onNavigate('/employee/settings')}
            >
              Security & Password
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <QRCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        employeeId={employeeId}
        fullName={fullName}
        designation={designation}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={cardUrl}
        fullName={fullName}
        designation={designation}
        companyName={company?.companyName || 'UHF Solutions'}
      />
    </div>
  );
};
