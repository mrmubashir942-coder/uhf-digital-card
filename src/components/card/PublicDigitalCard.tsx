import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api.ts';
import { PublicCardData } from '../../types/index.ts';
import { downloadVCard, shareCard } from '../../lib/vcard.ts';
import { QRCodeModal } from './QRCodeModal.tsx';
import { ShareModal } from './ShareModal.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import {
  Phone,
  MessageSquare,
  Mail,
  Linkedin,
  Globe,
  MapPin,
  QrCode,
  Share2,
  UserCheck,
  Building2,
  ShieldCheck,
  AlertOctagon,
  ArrowLeft,
  Download,
  Building,
} from 'lucide-react';
import { Button } from '../common/Button.tsx';

interface PublicDigitalCardProps {
  employeeId: string;
  onBackToApp?: () => void;
}

export const PublicDigitalCard: React.FC<PublicDigitalCardProps> = ({
  employeeId,
  onBackToApp,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState<PublicCardData | null>(null);
  const [errorStatus, setErrorStatus] = useState<'NOT_FOUND' | 'INACTIVE' | 'ERROR' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorStatus(null);

    api.public
      .getCard(employeeId)
      .then((data) => {
        if (isMounted) {
          setCardData(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error fetching digital card:', err);
          if (err.status === 403 || err.code === 'INACTIVE') {
            setErrorStatus('INACTIVE');
            setErrorMessage(err.message || 'This digital business card has been deactivated.');
          } else if (err.status === 404 || err.code === 'NOT_FOUND') {
            setErrorStatus('NOT_FOUND');
            setErrorMessage(`No digital card found for employee ID "${employeeId}".`);
          } else {
            setErrorStatus('ERROR');
            setErrorMessage('Unable to load employee digital card. Please try again.');
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [employeeId]);

  const handleSaveContact = () => {
    if (!cardData) return;
    setIsSavingContact(true);
    try {
      downloadVCard(cardData);
      showToast('Contact (.vcf) downloaded! Open the file to add to your phone contacts.', 'success');
    } catch (err) {
      console.error('Failed to download VCF:', err);
      showToast('Failed to download contact file. Please try again.', 'error');
    } finally {
      setTimeout(() => setIsSavingContact(false), 1200);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = () => {
    if (!cardData) return;
    shareCard(cardData, currentUrl, () => setIsShareOpen(true));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-sm border border-[#E5E7EB] text-center animate-pulse">
          <div className="w-24 h-24 rounded-full bg-slate-100 mx-auto mb-4" />
          <div className="h-6 bg-slate-100 rounded-lg w-3/4 mx-auto mb-2" />
          <div className="h-4 bg-slate-100 rounded-lg w-1/2 mx-auto mb-6" />
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
          </div>
          <div className="h-12 bg-slate-100 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  // Deactivated state
  if (errorStatus === 'INACTIVE') {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-[#E5E7EB] p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-[#D97706] flex items-center justify-center mx-auto mb-4">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[#64748B] text-xs font-mono mb-3 border border-[#E5E7EB]">
            <span>{employeeId}</span>
          </div>
          <h2 className="text-xl font-bold text-[#111827] mb-2">
            Card Temporarily Unavailable
          </h2>
          <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
            This digital business card has been deactivated or is currently undergoing administrative review by UHF Solutions.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 border border-[#E5E7EB] text-left text-xs space-y-1.5 text-[#64748B] mb-6">
            <p className="font-semibold text-[#111827]">Need to get in touch?</p>
            <p>Please contact UHF Solutions corporate desk at <a href="mailto:contact@uhfsolutions.com" className="text-[#2563EB] underline">contact@uhfsolutions.com</a></p>
          </div>

          {onBackToApp && (
            <Button variant="outline" onClick={onBackToApp} className="w-full">
              Back to Home
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Not found or network error
  if (errorStatus || !cardData) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-[#E5E7EB] p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-[#DC2626] flex items-center justify-center mx-auto mb-4">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#111827] mb-2">
            Employee Card Not Found
          </h2>
          <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
            {errorMessage || 'The requested employee ID does not exist in our corporate directory.'}
          </p>

          {onBackToApp && (
            <Button variant="outline" onClick={onBackToApp} className="w-full">
              Back to Directory
            </Button>
          )}
        </div>
      </div>
    );
  }

  const {
    fullName,
    designation,
    department,
    phone,
    whatsapp,
    officePhone,
    email,
    companyEmail,
    linkedin,
    website,
    officeAddress,
    bio,
    profilePhoto,
    company,
  } = cardData;

  const contactEmail = companyEmail || email;
  const whatsappNumber = whatsapp ? whatsapp.replace(/[^0-9]/g, '') : '';

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8 px-4 sm:px-6 flex flex-col items-center justify-center">
      {/* Top corporate navigation */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-2">
        {onBackToApp ? (
          <button
            onClick={onBackToApp}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#111827] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Company Portal</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
            <span>Verified Official Card</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveContact}
            disabled={isSavingContact}
            className="p-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors shadow-xs disabled:opacity-70 cursor-pointer"
            title="Save Contact (.vcf)"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsQrOpen(true)}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-[#111827] border border-[#E5E7EB] transition-colors shadow-xs cursor-pointer"
            title="View QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-[#111827] border border-[#E5E7EB] transition-colors shadow-xs cursor-pointer"
            title="Share Card"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Digital Business Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-[#E5E7EB] overflow-hidden relative">
        {/* Header Cover Banner */}
        <div className="h-32 bg-gradient-to-r from-[#2563EB] via-blue-600 to-indigo-600 relative flex items-start justify-between p-4">
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Company Brand Badge */}
          <div className="relative z-10 flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-full border border-white/20 text-[#111827] shadow-xs">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.companyName}
                className="w-5 h-5 rounded-full object-contain bg-white p-0.5"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#2563EB] flex items-center justify-center font-bold text-[10px] text-white">
                U
              </div>
            )}
            <span className="text-xs font-bold tracking-tight text-[#111827]">{company.companyName || 'UHF Solutions'}</span>
          </div>

          {/* ID Pill */}
          <div className="relative z-10 font-mono text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-[#2563EB] shadow-xs">
            {employeeId}
          </div>
        </div>

        {/* Profile Avatar & Identity */}
        <div className="px-6 pt-0 pb-6 text-center relative">
          {/* Avatar (positioned over banner) */}
          <div className="-mt-16 mb-4 inline-block relative">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-slate-100 shadow-md overflow-hidden mx-auto flex items-center justify-center">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-full h-full bg-slate-200 text-[#111827] font-black text-3xl flex items-center justify-center">${fullName.charAt(0).toUpperCase()}</div>`;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-slate-200 text-[#111827] font-black text-3xl flex items-center justify-center">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Official Verification Badge */}
            <div
              className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-[#2563EB] border-2 border-white text-white flex items-center justify-center shadow-xs"
              title="Verified UHF Solutions Employee"
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Name & Title */}
          <h1 className="text-2xl font-black text-[#111827] tracking-tight leading-tight">
            {fullName}
          </h1>

          <div className="mt-1 flex flex-col items-center gap-0.5">
            <span className="text-sm font-semibold text-[#2563EB]">
              {designation}
            </span>
            <span className="text-xs text-[#64748B] font-medium">
              {department} • {company.companyName || 'UHF Solutions'}
            </span>
          </div>

          {/* Bio text if provided */}
          {bio && (
            <p className="mt-4 text-xs text-[#64748B] leading-relaxed max-w-xs mx-auto text-center px-1">
              "{bio}"
            </p>
          )}

          {/* QUICK DIRECT ACTION BUTTONS (CALL, WHATSAPP, EMAIL, LINKEDIN) */}
          <div className="mt-6 grid grid-cols-4 gap-2.5">
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F8FAFC] hover:bg-blue-50 border border-[#E5E7EB] hover:border-blue-200 transition-all group"
                title="Call"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-[#111827]">Call</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-[#E5E7EB] opacity-40 cursor-not-allowed">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#64748B] flex items-center justify-center mb-1.5">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-[#64748B]">Call</span>
              </div>
            )}

            {whatsappNumber ? (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F8FAFC] hover:bg-emerald-50 border border-[#E5E7EB] hover:border-emerald-200 transition-all group"
                title="WhatsApp"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-[#111827]">WhatsApp</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-[#E5E7EB] opacity-40 cursor-not-allowed">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#64748B] flex items-center justify-center mb-1.5">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-[#64748B]">WhatsApp</span>
              </div>
            )}

            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}`}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F8FAFC] hover:bg-indigo-50 border border-[#E5E7EB] hover:border-indigo-200 transition-all group"
                title="Email"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-[#111827]">Email</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-[#E5E7EB] opacity-40 cursor-not-allowed">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#64748B] flex items-center justify-center mb-1.5">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-[#64748B]">Email</span>
              </div>
            )}

            {linkedin ? (
              <a
                href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F8FAFC] hover:bg-sky-50 border border-[#E5E7EB] hover:border-sky-200 transition-all group"
                title="LinkedIn"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Linkedin className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-[#111827]">LinkedIn</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-[#E5E7EB] opacity-40 cursor-not-allowed">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#64748B] flex items-center justify-center mb-1.5">
                  <Linkedin className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-[#64748B]">LinkedIn</span>
              </div>
            )}
          </div>

          {/* HIGHLY VISIBLE "SAVE TO CONTACTS" PRIMARY BUTTON */}
          <div className="mt-5">
            <button
              onClick={handleSaveContact}
              disabled={isSavingContact}
              className="w-full py-4 px-6 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-base shadow-xs shadow-blue-500/20 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all disabled:opacity-80 cursor-pointer"
            >
              {isSavingContact ? (
                <>
                  <Download className="w-5 h-5 animate-bounce" />
                  <span>Preparing Contact Card...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-5 h-5" />
                  <span>Save to Contacts (.vcf)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-[#64748B] mt-2 font-medium">
              Downloads verified .vcf contact directly to iPhone & Android address book
            </p>
          </div>

          {/* Detailed Contact Information Section */}
          <div className="mt-6 pt-6 border-t border-[#E5E7EB] space-y-3.5 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] px-1">
              Contact & Location
            </h3>

            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#64748B] flex items-center justify-center group-hover:text-[#2563EB] group-hover:bg-blue-50">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[#64748B] font-medium">Mobile Phone</p>
                  <p className="text-sm font-semibold text-[#111827] truncate">
                    {phone}
                  </p>
                </div>
              </a>
            )}

            {officePhone && (
              <a
                href={`tel:${officePhone}`}
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#64748B] flex items-center justify-center group-hover:text-[#2563EB] group-hover:bg-blue-50">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[#64748B] font-medium">Office Direct</p>
                  <p className="text-sm font-semibold text-[#111827] truncate">
                    {officePhone}
                  </p>
                </div>
              </a>
            )}

            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#64748B] flex items-center justify-center group-hover:text-[#2563EB] group-hover:bg-blue-50">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[#64748B] font-medium">Email Address</p>
                  <p className="text-sm font-semibold text-[#111827] truncate">
                    {contactEmail}
                  </p>
                </div>
              </a>
            )}

            {(website || company.website) && (
              <a
                href={website || company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#64748B] flex items-center justify-center group-hover:text-[#2563EB] group-hover:bg-blue-50">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[#64748B] font-medium">Website</p>
                  <p className="text-sm font-semibold text-[#111827] truncate">
                    {website || company.website}
                  </p>
                </div>
              </a>
            )}

            {(officeAddress || company.officeAddress) && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  officeAddress || company.officeAddress
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#64748B] flex items-center justify-center group-hover:text-[#2563EB] group-hover:bg-blue-50">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[#64748B] font-medium">Headquarters</p>
                  <p className="text-sm font-semibold text-[#111827] leading-snug">
                    {officeAddress || company.officeAddress}
                  </p>
                </div>
              </a>
            )}
          </div>

          {/* Card Footer Actions (QR, Save .VCF, Share) */}
          <div className="mt-6 pt-5 border-t border-[#E5E7EB] grid grid-cols-3 gap-2">
            <button
              onClick={() => setIsQrOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] font-semibold text-xs hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#2563EB]" />
              <span>QR Code</span>
            </button>

            <button
              onClick={handleSaveContact}
              disabled={isSavingContact}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-blue-200 bg-blue-50 text-[#2563EB] font-semibold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#2563EB]" />
              <span>Save .VCF</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] font-semibold text-xs hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#2563EB]" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Corporate Trust Footer */}
        <div className="bg-slate-50 p-3.5 text-center border-t border-[#E5E7EB]">
          <p className="text-[11px] font-medium text-[#64748B]">
            Powered by{' '}
            <span className="font-bold text-[#111827]">
              {company.companyName || 'UHF Solutions'}
            </span>{' '}
            Digital Card System
          </p>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        employeeId={cardData.employeeId}
        fullName={cardData.fullName}
        designation={cardData.designation}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={currentUrl}
        fullName={cardData.fullName}
        designation={cardData.designation}
        companyName={cardData.company.companyName}
      />
    </div>
  );
};
