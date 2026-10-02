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
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-xl border border-slate-200 dark:border-slate-800 text-center animate-pulse">
          <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 mx-auto mb-4" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4 mx-auto mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2 mx-auto mb-6" />
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  // Deactivated state
  if (errorStatus === 'INACTIVE') {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono mb-3">
            <span>{employeeId}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Card Temporarily Unavailable
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            This digital business card has been deactivated or is currently undergoing administrative review by UHF Solutions.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5 text-slate-500 mb-6">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Need to get in touch?</p>
            <p>Please contact UHF Solutions corporate desk at <a href="mailto:contact@uhfsolutions.com" className="text-blue-600 underline">contact@uhfsolutions.com</a></p>
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
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Employee Card Not Found
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-6 px-4 sm:px-6 flex flex-col items-center justify-center">
      {/* Top corporate navigation */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-2">
        {onBackToApp ? (
          <button
            onClick={onBackToApp}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Company Portal</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Verified Official Card</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveContact}
            disabled={isSavingContact}
            className="p-2 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white border border-blue-500/50 transition-colors shadow-sm disabled:opacity-70"
            title="Save Contact (.vcf)"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsQrOpen(true)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shadow-sm"
            title="View QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shadow-sm"
            title="Share Card"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Digital Business Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        {/* Header Cover Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 relative flex items-start justify-between p-4">
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Company Brand Badge */}
          <div className="relative z-10 flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white shadow-sm">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.companyName}
                className="w-5 h-5 rounded-full object-contain bg-white p-0.5"
                onError={(e) => {
                  // Fallback to initial if logo fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center font-bold text-[10px]">
                U
              </div>
            )}
            <span className="text-xs font-bold tracking-tight">{company.companyName || 'UHF Solutions'}</span>
          </div>

          {/* ID Pill */}
          <div className="relative z-10 font-mono text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/20">
            {employeeId}
          </div>
        </div>

        {/* Profile Avatar & Identity */}
        <div className="px-6 pt-0 pb-6 text-center relative">
          {/* Avatar (positioned over banner) */}
          <div className="-mt-16 mb-4 inline-block relative">
            <div className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-xl overflow-hidden mx-auto flex items-center justify-center">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initial if photo URL fails
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 text-white font-black text-3xl flex items-center justify-center">${fullName.charAt(0).toUpperCase()}</div>`;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 text-white font-black text-3xl flex items-center justify-center">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Official Verification Badge */}
            <div
              className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 text-white flex items-center justify-center shadow-md"
              title="Verified UHF Solutions Employee"
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Name & Title */}
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {fullName}
          </h1>

          <div className="mt-1 flex flex-col items-center gap-0.5">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {designation}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {department} • {company.companyName || 'UHF Solutions'}
            </span>
          </div>

          {/* Bio text if provided */}
          {bio && (
            <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto text-center px-1">
              "{bio}"
            </p>
          )}

          {/* QUICK DIRECT ACTION BUTTONS (CALL, WHATSAPP, EMAIL, LINKEDIN) */}
          <div className="mt-6 grid grid-cols-4 gap-2.5">
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700/60 hover:border-blue-300 transition-all group"
                title="Call"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Call</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 opacity-40 cursor-not-allowed">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-1.5">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-400">Call</span>
              </div>
            )}

            {whatsappNumber ? (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-300 transition-all group"
                title="WhatsApp"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">WhatsApp</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 opacity-40 cursor-not-allowed">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-1.5">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-400">WhatsApp</span>
              </div>
            )}

            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}`}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-300 transition-all group"
                title="Email"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Email</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 opacity-40 cursor-not-allowed">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-1.5">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-400">Email</span>
              </div>
            )}

            {linkedin ? (
              <a
                href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-slate-200 dark:border-slate-700/60 hover:border-sky-300 transition-all group"
                title="LinkedIn"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Linkedin className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">LinkedIn</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 opacity-40 cursor-not-allowed">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-1.5">
                  <Linkedin className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-400">LinkedIn</span>
              </div>
            )}
          </div>

          {/* HIGHLY VISIBLE "SAVE TO CONTACTS" PRIMARY BUTTON */}
          <div className="mt-5">
            <button
              onClick={handleSaveContact}
              disabled={isSavingContact}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all disabled:opacity-80 cursor-pointer"
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
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Downloads verified .vcf contact directly to iPhone & Android address book
            </p>
          </div>

          {/* Detailed Contact Information Section */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3.5 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Contact & Location
            </h3>

            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:text-blue-600">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400 font-medium">Mobile Phone</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {phone}
                  </p>
                </div>
              </a>
            )}

            {officePhone && (
              <a
                href={`tel:${officePhone}`}
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:text-blue-600">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400 font-medium">Office Direct</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {officePhone}
                  </p>
                </div>
              </a>
            )}

            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:text-blue-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400 font-medium">Email Address</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
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
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:text-blue-600">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400 font-medium">Website</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
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
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:text-blue-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400 font-medium">Headquarters</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                    {officeAddress || company.officeAddress}
                  </p>
                </div>
              </a>
            )}
          </div>

          {/* Card Footer Actions (QR, Save .VCF, Share) */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2">
            <button
              onClick={() => setIsQrOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>QR Code</span>
            </button>

            <button
              onClick={handleSaveContact}
              disabled={isSavingContact}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/40 text-blue-750 dark:text-blue-300 font-semibold text-xs hover:bg-blue-100/60 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Save .VCF</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            >
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Corporate Trust Footer */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 text-center border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-[11px] font-medium text-slate-400">
            Powered by{' '}
            <span className="font-bold text-slate-600 dark:text-slate-300">
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
