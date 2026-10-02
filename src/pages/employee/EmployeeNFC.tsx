import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';
import { Button } from '../../components/common/Button.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import {
  Nfc,
  SmartphoneNfc,
  Radio,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Layers,
  Zap,
  Info,
  Apple,
} from 'lucide-react';

interface EmployeeNFCProps {
  onNavigate: (path: string) => void;
}

export const EmployeeNFCPage: React.FC<EmployeeNFCProps> = ({ onNavigate }) => {
  const { user, profile, setProfile } = useAuth();
  const { showToast } = useToast();

  const [nfcEnabled, setNfcEnabled] = useState<boolean>(() => {
    if (profile?.nfcEnabled !== undefined) return profile.nfcEnabled;
    const local = localStorage.getItem(`uhf_nfc_${user?.employeeId}`);
    return local !== 'false';
  });
  const [isToggling, setIsToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'iphone' | 'android' | 'hardware' | 'faq'>('iphone');

  // Web NFC State
  const [hasWebNfc, setHasWebNfc] = useState(false);
  const [isWritingNfc, setIsWritingNfc] = useState(false);
  const [nfcWriteStatus, setNfcWriteStatus] = useState<string | null>(null);

  // Simulation state
  const [simulateTap, setSimulateTap] = useState(false);

  const employeeId = user?.employeeId || 'UHF-001';
  const fullName = profile?.fullName || user?.fullName || 'Employee';
  const designation = profile?.designation || 'Corporate Member';

  const cardUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/card/${employeeId}`
      : `https://uhfsolutions.com/card/${employeeId}`;

  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setHasWebNfc(true);
    }
  }, []);

  const handleToggleNfc = async () => {
    const nextVal = !nfcEnabled;
    setNfcEnabled(nextVal);
    localStorage.setItem(`uhf_nfc_${employeeId}`, String(nextVal));

    setIsToggling(true);
    try {
      const res = await api.employee.updateProfile({ nfcEnabled: nextVal });
      setProfile(res.profile);
      showToast(
        nextVal
          ? 'NFC Tap Sharing activated for your profile.'
          : 'NFC Tap Sharing paused.',
        'info'
      );
    } catch (err) {
      console.warn('Could not sync NFC status to server, kept locally:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    showToast('Digital Card URL copied! Ready to paste into NFC Tools.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  // Web NFC Direct Write for supported devices (Android Chrome)
  const handleWriteWebNfc = async () => {
    if (!('NDEFReader' in window)) {
      showToast('Web NFC is not supported in this browser. Please follow the NFC Tools guide below.', 'error');
      return;
    }

    try {
      setIsWritingNfc(true);
      setNfcWriteStatus('Ready to program: Hold your NFC card or tag against the back of your phone...');
      const NDEFReaderClass = (window as any).NDEFReader;
      const ndef = new NDEFReaderClass();

      // Write URL record with NDEF standard
      await ndef.write({
        records: [
          {
            recordType: 'url',
            data: cardUrl,
          },
        ],
      });

      setNfcWriteStatus('Success! NFC Card programmed.');
      showToast('NFC card successfully written! Tap any phone to test your card.', 'success');
    } catch (err: any) {
      console.error('NFC Write Error:', err);
      if (err.name === 'NotAllowedError') {
        showToast('NFC permission was denied.', 'error');
      } else if (err.name === 'NotSupportedError') {
        showToast('NFC hardware is unavailable or disabled on this device.', 'error');
      } else {
        showToast(err.message || 'Failed to write to NFC tag. Ensure the tag is rewritable and unlocked.', 'error');
      }
      setNfcWriteStatus(null);
    } finally {
      setIsWritingNfc(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => onNavigate('/employee/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#111827] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/employee/qr')}
            leftIcon={<Radio className="w-3.5 h-3.5 text-[#2563EB]" />}
          >
            View QR Code
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate(`/card/${employeeId}`)}
            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Live Digital Card
          </Button>
        </div>
      </div>

      {/* Hero Banner with Toggle */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 text-[#111827] border border-[#E5E7EB] shadow-xs mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-[#2563EB]">
              <SmartphoneNfc className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-100">
                  NFC Contactless
                </span>
                <span className={`flex items-center gap-1 text-xs font-semibold ${nfcEnabled ? 'text-[#059669]' : 'text-[#64748B]'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{nfcEnabled ? 'Tap Sharing Enabled' : 'Tap Sharing Paused'}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
                NFC 'Tap' Sharing & Cards
              </h1>

              <p className="text-sm text-[#64748B] mt-1 max-w-xl">
                Program any physical NFC card, smart badge, or sticker to instantly launch your verified UHF Solutions business card on iPhones and Androids with a single tap.
              </p>
            </div>
          </div>

          {/* Master NFC Toggle Switch */}
          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E5E7EB] flex items-center gap-4 shrink-0">
            <div>
              <p className="text-xs font-bold text-[#111827]">NFC Sharing Status</p>
              <p className="text-[11px] text-[#64748B]">
                {nfcEnabled ? 'Active & Ready' : 'Turned Off'}
              </p>
            </div>

            <button
              onClick={handleToggleNfc}
              disabled={isToggling}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${
                nfcEnabled ? 'bg-[#059669]' : 'bg-slate-300'
              }`}
              title="Toggle NFC Sharing"
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                  nfcEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Target NFC URL Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Target URL For Your NFC Chip
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-[#059669] font-bold border border-emerald-100">
                Dynamic & Permanent
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              When someone taps your physical NFC card, their phone opens this exact web address:
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant={copied ? 'success' : 'primary'}
              onClick={handleCopyUrl}
              leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy URL'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(cardUrl, '_blank')}
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Test Link
            </Button>
          </div>
        </div>

        <div className="mt-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] font-mono text-xs text-[#2563EB] break-all select-all flex items-center justify-between gap-2">
          <span>{cardUrl}</span>
          <span className="text-[10px] text-[#64748B] uppercase font-sans font-semibold shrink-0">
            Standard URI
          </span>
        </div>
      </div>

      {/* Web NFC 1-Click Programmer Banner (Direct in-browser writing for Android) */}
      <div className="bg-white text-[#111827] rounded-3xl p-6 border border-[#E5E7EB] shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>1-Click Browser NFC Writer</span>
                {hasWebNfc ? (
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-[#059669] rounded-full border border-emerald-200 font-semibold">
                    Supported on this Device
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-[#64748B] rounded-full font-semibold border border-[#E5E7EB]">
                    Available on Android Chrome
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                {hasWebNfc
                  ? 'Tap below and hold any blank NTAG213/215/216 card to the back of your phone to write immediately.'
                  : 'Web NFC write is supported natively on Android Chrome. For iPhones or other browsers, use the 30-second mobile app guide below.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            {hasWebNfc ? (
              <Button
                variant="primary"
                onClick={handleWriteWebNfc}
                isLoading={isWritingNfc}
                leftIcon={<Nfc className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                {isWritingNfc ? 'Hold Card Near Phone...' : 'Write to NFC Card Now'}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setActiveTab('iphone')}
                className="w-full sm:w-auto"
              >
                View App Guide
              </Button>
            )}
          </div>
        </div>

        {nfcWriteStatus && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-[#2563EB] flex items-center gap-2">
            <Radio className="w-4 h-4 animate-spin text-[#2563EB] shrink-0" />
            <span>{nfcWriteStatus}</span>
          </div>
        )}
      </div>

      {/* Tab Navigation for Step-by-Step Manual */}
      <div className="flex border-b border-[#E5E7EB] mb-6 gap-2 sm:gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('iphone')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'iphone'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#111827]'
          }`}
        >
          <Apple className="w-4 h-4" />
          <span>iPhone (iOS) Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('android')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'android'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#111827]'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Android Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('hardware')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'hardware'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#111827]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Cards & Hardware</span>
        </button>

        <button
          onClick={() => setActiveTab('faq')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'faq'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#111827]'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>FAQ & Best Practices</span>
        </button>
      </div>

      {/* TAB CONTENT 1: IPHONE (IOS) PROGRAMMING MANUAL */}
      {activeTab === 'iphone' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2">
              <Apple className="w-5 h-5 text-[#111827]" />
              <span>How to Program NFC Cards on iPhone (iOS)</span>
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              Takes less than 30 seconds using the free, industry-standard <strong>NFC Tools</strong> app from the App Store.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2563EB] font-black text-sm flex items-center justify-center mb-3 border border-blue-100">
                  1
                </div>
                <h4 className="font-bold text-sm text-[#111827] mb-1">
                  Get "NFC Tools" App
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                  Download the free <strong>NFC Tools</strong> app by <em>wakdev</em> from the iOS App Store.
                </p>
              </div>
              <a
                href="https://apps.apple.com/app/nfc-tools/id1252962749"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#2563EB] flex items-center gap-1 hover:underline"
              >
                App Store Link <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2563EB] font-black text-sm flex items-center justify-center mb-3 border border-blue-100">
                  2
                </div>
                <h4 className="font-bold text-sm text-[#111827] mb-1">
                  Add URL Record
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Open NFC Tools, tap <strong>Write</strong>, tap <strong>Add a record</strong>, then select <strong>Custom URL / URI</strong>.
                </p>
              </div>
              <span className="text-[11px] text-[#64748B] font-medium mt-3">
                Standard NDEF format
              </span>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2563EB] font-black text-sm flex items-center justify-center mb-3 border border-blue-100">
                  3
                </div>
                <h4 className="font-bold text-sm text-[#111827] mb-1">
                  Paste Your Card URL
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                  Paste your permanent digital card URL and tap <strong>OK</strong> in the app.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleCopyUrl} className="w-full text-xs">
                {copied ? 'URL Copied!' : 'Copy Card URL'}
              </Button>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#059669] font-black text-sm flex items-center justify-center mb-3 border border-emerald-100">
                  4
                </div>
                <h4 className="font-bold text-sm text-[#111827] mb-1">
                  Tap "Write" & Tap Card
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Tap <strong>Write / (Bytes)</strong>. Hold the very top edge of your iPhone against your NFC card until the green checkmark appears.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#059669] flex items-center gap-1 mt-3">
                <CheckCircle2 className="w-3.5 h-3.5" /> All Done!
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-[#111827] space-y-2">
            <p className="font-bold text-[#111827] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#2563EB]" />
              <span>iPhone Tapping Pro Tip:</span>
            </p>
            <p className="text-[#64748B]">
              On iPhones (iPhone XS through iPhone 16+), the NFC reader is located at the <strong>very top front and back edge</strong> (near the ear speaker and camera lens). When people tap your card, ask them to tap the top edge of their iPhone to your card.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: ANDROID PROGRAMMING MANUAL */}
      {activeTab === 'android' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#059669]" />
              <span>How to Program NFC Cards on Android</span>
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              Choose between instant 1-click in-browser writing or the free NFC Tools app from Google Play.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Method A: In-browser */}
            <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#2563EB]">
                Method 1: Fastest (No App Needed)
              </span>
              <h4 className="font-bold text-base text-[#111827] mt-2 mb-1">
                Direct Web NFC Writing
              </h4>
              <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
                If you are browsing this portal on Chrome for Android, tap the <strong>"Write to NFC Card Now"</strong> button in the banner above. Hold your NFC card against the back of your phone and it programs immediately!
              </p>
              <Button
                size="sm"
                variant="primary"
                onClick={handleWriteWebNfc}
                leftIcon={<Zap className="w-3.5 h-3.5" />}
              >
                Start Direct Write
              </Button>
            </div>

            {/* Method B: NFC Tools app */}
            <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC]">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-[#64748B] border border-[#E5E7EB]">
                Method 2: Google Play App
              </span>
              <h4 className="font-bold text-base text-[#111827] mt-2 mb-1">
                NFC Tools for Android
              </h4>
              <ol className="text-xs text-[#64748B] space-y-1.5 list-decimal pl-4 mb-4">
                <li>Install <strong>NFC Tools</strong> from Google Play.</li>
                <li>Tap <strong>Write</strong> &gt; <strong>Add a record</strong> &gt; <strong>URL / URI</strong>.</li>
                <li>Paste your card link: <code className="text-[#2563EB]">{cardUrl.substring(0, 30)}...</code></li>
                <li>Tap <strong>Write</strong> and hold card to the back center of phone.</li>
              </ol>
              <a
                href="https://play.google.com/store/apps/details?id=com.wakdev.wdnfc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#2563EB] inline-flex items-center gap-1 hover:underline"
              >
                Google Play Store Link <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: HARDWARE & CARD BUYING GUIDE */}
      {activeTab === 'hardware' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#2563EB]" />
              <span>Recommended NFC Card Types & Chips</span>
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              Understand which chips and materials work best for long-lasting UHF Solutions digital business cards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <span className="text-xs font-bold text-[#059669] uppercase">
                #1 Recommended Chip
              </span>
              <h4 className="font-bold text-base text-[#111827] mt-1 mb-1">
                NTAG213 / NTAG215
              </h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                NXP NTAG chips have 100% universal compatibility across all modern iPhones and Android phones with zero app requirements.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <span className="text-xs font-bold text-[#2563EB] uppercase">
                High Capacity
              </span>
              <h4 className="font-bold text-base text-[#111827] mt-1 mb-1">
                NTAG216 (888 Bytes)
              </h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Provides extra memory space if you ever want to store offline vCard contact data in addition to your digital card URL.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <span className="text-xs font-bold text-indigo-600 uppercase">
                Materials & Formats
              </span>
              <h4 className="font-bold text-base text-[#111827] mt-1 mb-1">
                Cards, Wood & Stickers
              </h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Works on PVC smart cards, Bamboo/Wood cards, epoxy phone tags, keyfobs, and anti-metal phone stickers.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-[#D97706]">
              <AlertCircle className="w-4 h-4 text-[#D97706]" />
              <span>Metal Business Card Warning:</span>
            </p>
            <p>
              If purchasing custom metal business cards, ensure the manufacturer includes an <strong>anti-metal ferrite blocking layer</strong> behind the NFC chip. Metal blocks electromagnetic NFC signals unless insulated with this protective barrier.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: FAQ & BEST PRACTICES */}
      {activeTab === 'faq' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-5">
          <div>
            <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#2563EB]" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              Everything you need to know about sharing via NFC tap.
            </p>
          </div>

          <div className="space-y-3.5 text-xs text-[#64748B]">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <h4 className="font-bold text-[#111827] text-sm mb-1">
                Does the receiver need an app to open my NFC card?
              </h4>
              <p className="leading-relaxed text-[#64748B]">
                <strong>No!</strong> Both iPhones (iOS 13+ on iPhone XR/XS or later) and all modern Android devices have background NFC tag reading enabled automatically. They simply tap your card, and a native notification banner slides in asking them to open your card in Safari or Chrome.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <h4 className="font-bold text-[#111827] text-sm mb-1">
                What if I change my phone number or title later?
              </h4>
              <p className="leading-relaxed text-[#64748B]">
                <strong>You never need to reprogram your card!</strong> Because the NFC card points to your dynamic UHF Solutions URL (<code>/card/{employeeId}</code>), whenever you update your phone, photo, or title in this portal, anyone who taps your physical card immediately sees your latest live details.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <h4 className="font-bold text-[#111827] text-sm mb-1">
                Should I password lock my NFC card?
              </h4>
              <p className="leading-relaxed text-[#64748B]">
                In the NFC Tools app, you have the option to "Lock Tag" (make read-only). Only do this if you are sure you will never want to rewrite the card for a different employee. Because the URL is dynamic, locking it as read-only is great for preventing tampering!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive NFC Tap Simulator */}
      <div className="mt-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs text-center">
        <h3 className="font-bold text-base text-[#111827] mb-1">
          📱 Try the Interactive NFC Tap Simulator
        </h3>
        <p className="text-xs text-[#64748B] mb-6">
          See what clients experience on their smartphones when they tap your physical NFC card.
        </p>

        <div className="flex flex-col items-center justify-center">
          <Button
            variant="secondary"
            onClick={() => setSimulateTap(true)}
            leftIcon={<SmartphoneNfc className="w-4 h-4 text-[#2563EB]" />}
          >
            Simulate NFC Tap Now
          </Button>

          {simulateTap && (
            <div className="mt-6 w-full max-w-sm p-4 bg-white text-[#111827] rounded-3xl shadow-xl border-2 border-[#2563EB]/40 animate-bounce duration-1000">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
                  <Nfc className="w-6 h-6 animate-pulse" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#2563EB] tracking-wider">
                      NFC Tag Detected
                    </span>
                    <span className="text-[10px] text-[#64748B]">now</span>
                  </div>
                  <p className="text-xs font-bold text-[#111827] truncate">
                    {fullName}
                  </p>
                  <p className="text-[11px] text-[#64748B] truncate">
                    {designation} • UHF Solutions
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
                <button
                  onClick={() => setSimulateTap(false)}
                  className="text-[11px] text-[#64748B] hover:text-[#111827] px-2 py-1 cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => onNavigate(`/card/${employeeId}`)}
                  className="text-xs font-bold text-white px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Open Card →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
