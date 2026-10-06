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
  Printer,
  Linkedin,
  Twitter,
  Github,
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
      twitter: profile.twitter,
      github: profile.github,
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
      <div className="bg-white rounded-3xl p-6 sm:p-8 text-[#111827] border border-[#E5E7EB] shadow-xs mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border-2 border-[#E5E7EB] p-1 shadow-xs overflow-hidden shrink-0 flex items-center justify-center">
              {profile?.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={fullName}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-[#2563EB] rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                  {fullName.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-100">
                  {employeeId}
                </span>
                <span className="flex items-center gap-1 text-xs text-[#059669] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active Member</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
                Welcome, {fullName}
              </h1>

              <p className="text-sm text-[#64748B] mt-0.5">
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
              onClick={() => {
                onNavigate(`/card/${employeeId}`);
                // Open browser print dialog after navigation
                setTimeout(() => {
                  window.print();
                }, 350);
              }}
              leftIcon={<Printer className="w-4 h-4 text-[#2563EB]" />}
            >
              Print Card
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsQrOpen(true)}
              leftIcon={<QrCode className="w-4 h-4 text-[#2563EB]" />}
            >
              Show QR Code
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <h2 className="text-base font-bold text-[#111827] mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#2563EB]" />
        <span>Quick Management</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Card 1: My Digital Card */}
        <div
          onClick={() => onNavigate(`/card/${employeeId}`)}
          className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-[#2563EB] cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#111827] mb-1">
            Digital Business Card
          </h3>
          <p className="text-xs text-[#64748B] mb-3">
            Your live mobile-ready digital card with verified contact details.
          </p>
          <span className="text-xs font-semibold text-[#2563EB] flex items-center gap-1">
            View Live Card →
          </span>
        </div>

        {/* Card 2: My QR Code */}
        <div
          onClick={() => setIsQrOpen(true)}
          className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-[#2563EB] cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#111827] mb-1">
            Scan & Print QR Code
          </h3>
          <p className="text-xs text-[#64748B] mb-3">
            Download vector SVG or PNG QR code to print on your badge.
          </p>
          <span className="text-xs font-semibold text-[#2563EB] flex items-center gap-1">
            Open QR Code →
          </span>
        </div>

        {/* Card 3: NFC Tap Sharing */}
        <div
          onClick={() => onNavigate('/employee/nfc')}
          className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-[#2563EB] cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <SmartphoneNfc className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#111827] mb-1">
            NFC 'Tap' Sharing
          </h3>
          <p className="text-xs text-[#64748B] mb-3">
            Program physical NFC cards and smart badges with your URL.
          </p>
          <span className="text-xs font-semibold text-[#2563EB] flex items-center gap-1">
            NFC Setup & Guide →
          </span>
        </div>

        {/* Card 4: Edit Profile */}
        <div
          onClick={() => onNavigate('/employee/profile')}
          className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-[#2563EB] cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Edit className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#111827] mb-1">
            Edit Contact Profile
          </h3>
          <p className="text-xs text-[#64748B] mb-3">
            Update your phone, photo, WhatsApp, bio, and social links.
          </p>
          <span className="text-xs font-semibold text-[#059669] flex items-center gap-1">
            Edit Details →
          </span>
        </div>

        {/* Card 5: Share & Download VCF */}
        <div
          onClick={handleDownloadVCard}
          className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-[#2563EB] cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Download className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#111827] mb-1">
            Download .VCF Card
          </h3>
          <p className="text-xs text-[#64748B] mb-3">
            Download standard VCard file to import directly into Apple or Android.
          </p>
          <span className="text-xs font-semibold text-[#2563EB] flex items-center gap-1">
            Download File →
          </span>
        </div>
      </div>

      {/* Account Details & Status Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Summary */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#111827] text-base">
              Employee Profile Overview
            </h3>
            <button
              onClick={() => onNavigate('/employee/profile')}
              className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
            >
              Edit Info
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <span className="text-[#64748B] font-medium block mb-1">Full Legal Name</span>
              <span className="font-bold text-[#111827] text-sm">
                {fullName}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <span className="text-[#64748B] font-medium block mb-1">Employee ID</span>
              <span className="font-mono font-bold text-[#2563EB] text-sm">
                {employeeId}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <span className="text-[#64748B] font-medium block mb-1">Designation</span>
              <span className="font-semibold text-[#111827]">
                {designation}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <span className="text-[#64748B] font-medium block mb-1">Department</span>
              <span className="font-semibold text-[#111827]">
                {department}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <span className="text-[#64748B] font-medium block mb-1">Work Email</span>
              <span className="font-semibold text-[#111827]">
                {profile?.companyEmail || user?.email}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <span className="text-[#64748B] font-medium block mb-1">Mobile Phone</span>
              <span className="font-semibold text-[#111827]">
                {profile?.phone || 'Not configured'}
              </span>
            </div>
          </div>

          {profile?.bio && (
            <div className="mt-4 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-xs">
              <span className="text-[#64748B] font-medium block mb-1">Public Bio</span>
              <p className="text-[#111827] leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Social Media Profiles */}
          {(profile?.linkedin || profile?.twitter || profile?.github) && (
            <div className="mt-4 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-xs">
              <span className="text-[#64748B] font-medium block mb-2">Connected Social & Professional Channels</span>
              <div className="flex flex-wrap gap-2">
                {profile.linkedin && (
                  <a
                    href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-[#0077B5] hover:bg-sky-50 font-medium transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3 text-[#94A3B8]" />
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={profile.twitter.startsWith('http') ? profile.twitter : `https://twitter.com/${profile.twitter.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-[#1DA1F2] hover:bg-sky-50 font-medium transition-colors"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    <span>Twitter / X</span>
                    <ExternalLink className="w-3 h-3 text-[#94A3B8]" />
                  </a>
                )}
                {profile.github && (
                  <a
                    href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-100 font-medium transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3 text-[#94A3B8]" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Company & Card Sharing */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-[#2563EB]" />
              <h3 className="font-bold text-[#111827] text-base">
                Organization Details
              </h3>
            </div>

            <div className="space-y-3 text-xs text-[#64748B] mb-6">
              <div>
                <span className="font-semibold text-[#111827] block">
                  {company?.companyName || 'UHF Solutions'}
                </span>
                <span>{company?.officeAddress}</span>
              </div>

              <div>
                <span className="font-medium text-[#64748B] block">Corporate Inquiries</span>
                <span>{company?.email}</span>
              </div>

              <div>
                <span className="font-medium text-[#64748B] block">Switchboard</span>
                <span>{company?.phone}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-[#E5E7EB]">
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
